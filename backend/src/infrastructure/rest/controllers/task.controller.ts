import { CreateTaskUseCase } from '../../../application/use-cases/task/create-task.usecase';
import { DeleteTaskUseCase } from '../../../application/use-cases/task/delete-task.usecase';
import { GetTaskByIdUseCase } from '../../../application/use-cases/task/get-task-by-id.usecase';
import { GetTaskStatsUseCase } from '../../../application/use-cases/task/get-task-stats.usecase';
import { ListTasksUseCase } from '../../../application/use-cases/task/list-tasks.usecase';
import { UpdateTaskUseCase } from '../../../application/use-cases/task/update-task.usecase';
import { Request, Response } from 'express';
import { errorMiddleware } from '../../middlewares/error.middleware';
import * as fs from 'fs';
import * as path from 'path';
import { CSVUtil } from '../../../infrastructure/utils/csv.util';
import { EmailService } from '../../services/email.service';
import { TaskSocket } from '../../sockets/task.socket';
import { UserRepositoryImpl } from '../../repositories/user.repository.impl';
import { APP_CONSTANTS } from '../../../shared/constants/app.constants';
import { env } from '../../config';
import { ResponseUtil } from '../../utils/response.util';
export class TaskController {
  private createTaskUseCase: CreateTaskUseCase;
  private updateTaskUseCase: UpdateTaskUseCase;
  private deleteTaskUseCase: DeleteTaskUseCase;
  private listTasksUseCase: ListTasksUseCase;
  private getTaskByIdUseCase: GetTaskByIdUseCase;
  private getTaskStatsUseCase: GetTaskStatsUseCase;
  private emailService: EmailService;
  private taskSocket: TaskSocket;
  private userRepository: UserRepositoryImpl;
  constructor() {
    this.createTaskUseCase = new CreateTaskUseCase();
    this.updateTaskUseCase = new UpdateTaskUseCase();
    this.deleteTaskUseCase = new DeleteTaskUseCase();
    this.listTasksUseCase = new ListTasksUseCase();
    this.getTaskByIdUseCase = new GetTaskByIdUseCase();
    this.getTaskStatsUseCase = new GetTaskStatsUseCase();
    this.emailService = new EmailService();
    this.userRepository = new UserRepositoryImpl();
    this.taskSocket = new TaskSocket();
  }

  /**
   * @swagger
   * /api/v1/tasks:
   *   post:
   *     tags:
   *       - Tasks
   *     summary: Create a new task
   *     description: Create a new task with optional file attachments
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *                 example: "Complete project documentation"
   *               description:
   *                 type: string
   *                 example: "Write comprehensive documentation for the new API endpoints"
   *               dueDate:
   *                 type: string
   *                 format: date
   *                 example: "2023-12-31"
   *               assignedTo:
   *                 type: string
   *                 example: "507f1f77bcf86cd799439011"
   *               status:
   *                 type: string
   *                 enum: [Pending, "In Progress", Completed, Cancelled]
   *                 example: "Pending"
   *               priority:
   *                 type: string
   *                 enum: [Low, Medium, High]
   *                 example: "Medium"
   *               tags:
   *                 type: string
   *                 example: "documentation,urgent"
   *               attachments:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: binary
   *                 description: Files to attach to the task (up to 10 files)
   *     responses:
   *       201:
   *         $ref: '#/components/responses/CreatedResponse'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedResponse'
   *       400:
   *         $ref: '#/components/responses/BadRequestResponse'
   */
  createTask = errorMiddleware.catchAsync(async (req: Request, res: Response) => {
    const { title, description, dueDate, status, priority, tags, assignedTo } = req.body;
    const userId = req.user?.id;
    const files = req.files as Express.Multer.File[];

    if (!userId) {
      res.status(APP_CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const result = await this.createTaskUseCase.execute(
      {
        title,
        description,
        dueDate,
        assignedTo,
        status,
        priority,
        tags,
      },
      userId,
      files
    );

    // Send email notification for task creation
    try {
      await this.emailService.sendTaskCreatedEmail({
        ...result,
        userEmail: req.user?.email, // Assuming user email is available in req.user
      });
    } catch (error) {
      console.error('Failed to send task creation email:', error);
      // Don't fail the request if email fails
    }

    // Emit WebSocket notification for task creation
    try {
      this.taskSocket.emitTaskUpdateToAll('task_created', {
        task: result,
        createdBy: userId,
        timestamp: new Date(),
      });
    } catch (error) {
      console.warn(
        'WebSocket notification failed (SocketIO may not be available):',
        error instanceof Error ? error.message : error
      );
      // Don't fail the request if WebSocket fails - this is expected when SocketIO is not configured
    }

    ResponseUtil.created(res, result, 'Task created successfully');
  });

  /**
   * @swagger
   * /api/v1/tasks:
   *   get:
   *     tags:
   *       - Tasks
   *     summary: Get tasks list
   *     description: Retrieve a paginated list of tasks with optional filtering
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - $ref: '#/components/parameters/PageParameter'
   *       - $ref: '#/components/parameters/LimitParameter'
   *       - $ref: '#/components/parameters/StatusFilterParameter'
   *       - $ref: '#/components/parameters/StartDateFilterParameter'
   *       - $ref: '#/components/parameters/EndDateFilterParameter'
   *       - $ref: '#/components/parameters/SortByParameter'
   *       - $ref: '#/components/parameters/SortOrderParameter'
   *     responses:
   *       200:
   *         $ref: '#/components/responses/TaskListResponse'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedResponse'
   */
  getTasks = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const userRole = req.user?.role ?? 'user';
    const { page, limit, status, startDate, endDate, sortBy, sortOrder } = req.query;

    if (!userId) {
      res.status(APP_CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const filters = {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      status: status as 'Pending' | 'In Progress' | 'Completed' | 'Cancelled' | undefined,
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
      sortBy: sortBy as string | undefined,
      sortOrder: sortOrder as 'asc' | 'desc' | undefined,
    };

    const result = await this.listTasksUseCase.execute(userId, userRole, filters);

    ResponseUtil.success(res, result, 'Tasks retrieved successfully');
  });

  /**
   * @swagger
   * /api/v1/tasks/{id}:
   *   get:
   *     tags:
   *       - Tasks
   *     summary: Get task by ID
   *     description: Retrieve a specific task by its ID
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - $ref: '#/components/parameters/TaskIdParameter'
   *     responses:
   *       200:
   *         $ref: '#/components/responses/TaskResponse'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedResponse'
   *       404:
   *         $ref: '#/components/responses/NotFoundResponse'
   */
  getTaskById = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      ResponseUtil.unauthorized(res, 'User not authenticated');
      return;
    }

    const result = await this.getTaskByIdUseCase.execute({
      id,
      userId,
    });

    ResponseUtil.success(res, result, 'Task retrieved successfully');
  });

  /**
   * @swagger
   * /api/v1/tasks/{id}:
   *   post:
   *     tags:
   *       - Tasks
   *     summary: Update task
   *     description: Update an existing task with optional file attachments
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - $ref: '#/components/parameters/TaskIdParameter'
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *                 example: "Complete project documentation"
   *               description:
   *                 type: string
   *                 example: "Write comprehensive documentation for the new API endpoints"
   *               status:
   *                 type: string
   *                 enum: [Pending, "In Progress", Completed, Cancelled]
   *                 example: "In Progress"
   *               dueDate:
   *                 type: string
   *                 format: date
   *                 example: "2023-12-31"
   *               priority:
   *                 type: string
   *                 enum: [Low, Medium, High]
   *                 example: "High"
   *               tags:
   *                 type: string
   *                 example: "documentation,urgent"
   *               attachments:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: binary
   *                 description: Files to attach to the task (up to 10 files)
   *     responses:
   *       200:
   *         $ref: '#/components/responses/TaskResponse'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedResponse'
   *       400:
   *         $ref: '#/components/responses/BadRequestResponse'
   *       404:
   *         $ref: '#/components/responses/NotFoundResponse'
   */
  updateTask = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { title, description, status, dueDate, priority, tags, attachments } = req.body;
    const userId = req.user?.id;
    const files = req.files as Express.Multer.File[];

    if (!userId) {
      ResponseUtil.unauthorized(res, 'User not authenticated');
      return;
    }

    if (!id) {
      ResponseUtil.badRequest(res, 'Task ID is required');
      return;
    }

    const result = await this.updateTaskUseCase.execute(
      id,
      {
        title,
        description,
        status,
        dueDate,
        priority,
        tags,
        attachments,
      },
      userId,
      files
    );

    ResponseUtil.success(res, result, 'Task updated successfully');
  });

  /**
   * @swagger
   * /api/v1/tasks/{id}:
   *   delete:
   *     tags:
   *       - Tasks
   *     summary: Delete task
   *     description: Delete a specific task by its ID
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - $ref: '#/components/parameters/TaskIdParameter'
   *     responses:
   *       200:
   *         $ref: '#/components/responses/SuccessResponse'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedResponse'
   *       404:
   *         $ref: '#/components/responses/NotFoundResponse'
   */
  deleteTask = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      ResponseUtil.unauthorized(res, 'User not authenticated');
      return;
    }

    if (!id) {
      ResponseUtil.badRequest(res, 'Task ID is required');
      return;
    }

    const result = await this.deleteTaskUseCase.execute(id, userId);

    ResponseUtil.success(res, undefined, result.message);
  });

  /**
   * @swagger
   * /api/v1/tasks/{id}/completed:
   *   patch:
   *     tags:
   *       - Tasks
   *     summary: Mark task as completed
   *     description: Mark a specific task as completed
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - $ref: '#/components/parameters/TaskIdParameter'
   *     responses:
   *       200:
   *         $ref: '#/components/responses/TaskResponse'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedResponse'
   *       404:
   *         $ref: '#/components/responses/NotFoundResponse'
   */
  markTaskComplete = errorMiddleware.catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        ResponseUtil.unauthorized(res, 'User not authenticated');
        return;
      }

      if (!id) {
        ResponseUtil.badRequest(res, 'Task ID is required');
        return;
      }

      const result = await this.updateTaskUseCase.execute(
        id,
        {
          status: 'Completed',
        },
        userId,
        []
      );

      // Send email notification for task completion
      try {
        await this.emailService.sendTaskCompletedEmail({
          ...result,
          userEmail: req.user?.email, // Assuming user email is available in req.user
        });
      } catch (error) {
        console.error('Failed to send task completion email:', error);
        // Don't fail the request if email fails
      }

      // Emit WebSocket notification for task status change
      try {
        this.taskSocket.emitTaskUpdateToAll('task_status_changed', {
          task: result,
          oldStatus: 'Pending',
          newStatus: 'Completed',
          changedBy: userId,
          timestamp: new Date(),
        });
      } catch (error) {
        console.warn(
          'WebSocket notification failed (SocketIO may not be available):',
          error instanceof Error ? error.message : error
        );
        // Don't fail the request if WebSocket fails - this is expected when SocketIO is not configured
      }

      ResponseUtil.success(res, result, 'Task marked as completed');
    }
  );

  /**
   * @swagger
   * /api/v1/tasks/{id}/pending:
   *   patch:
   *     tags:
   *       - Tasks
   *     summary: Mark task as pending
   *     description: Mark a specific task as pending
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - $ref: '#/components/parameters/TaskIdParameter'
   *     responses:
   *       200:
   *         $ref: '#/components/responses/TaskResponse'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedResponse'
   *       404:
   *         $ref: '#/components/responses/NotFoundResponse'
   */
  markTaskPending = errorMiddleware.catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        ResponseUtil.unauthorized(res, 'User not authenticated');
        return;
      }

      if (!id) {
        ResponseUtil.badRequest(res, 'Task ID is required');
        return;
      }

      const result = await this.updateTaskUseCase.execute(
        id,
        {
          status: 'Pending',
        },
        userId,
        []
      );

      ResponseUtil.success(res, result, 'Task marked as pending');
    }
  );

  /**
   * @swagger
   * /api/v1/tasks/stats:
   *   get:
   *     tags:
   *       - Tasks
   *     summary: Get task statistics
   *     description: Retrieve task statistics for the authenticated user
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         $ref: '#/components/responses/TaskStatsResponse'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedResponse'
   */
  getTaskStats = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const userRole = req.user?.role ?? 'user';
    console.log('Getting stats for user:', userId, 'with role:', userRole);
    if (!userId) {
      ResponseUtil.unauthorized(res, 'User not authenticated');
      return;
    }

    const result = await this.getTaskStatsUseCase.execute({
      userId,
      userRole,
    });

    ResponseUtil.success(res, result, 'Task statistics retrieved successfully');
  });

  /**
   * @swagger
   * /api/v1/tasks/attachments/{userId}/{taskId}/{filename}:
   *   get:
   *     tags:
   *       - Tasks
   *     summary: Serve task attachment
   *     description: Serve a file attachment for a specific task (users can only access their own files)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - $ref: '#/components/parameters/UserIdParameter'
   *       - $ref: '#/components/parameters/TaskIdParameter'
   *       - $ref: '#/components/parameters/FilenameParameter'
   *     responses:
   *       200:
   *         $ref: '#/components/responses/FileResponse'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedResponse'
   *       403:
   *         $ref: '#/components/responses/ForbiddenResponse'
   *       404:
   *         $ref: '#/components/responses/NotFoundResponse'
   */
  serveAttachment = errorMiddleware.catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const { userId, taskId, filename } = req.params;
      const requestingUserId = req.user?.id;

      if (!requestingUserId) {
        ResponseUtil.unauthorized(res, 'User not authenticated');
        return;
      }

      // Basic security check - ensure user can only access their own files
      if (requestingUserId !== userId) {
        ResponseUtil.forbidden(res, 'Access denied');
        return;
      }

      const uploadDir = env.uploadDir;
      const filePath = path.join(uploadDir, userId, 'tasks', taskId, filename);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        ResponseUtil.notFound(res, 'File not found');
        return;
      }

      // Set appropriate headers based on file extension
      const ext = path.extname(filename).toLowerCase();
      const mimeTypes: { [key: string]: string } = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.txt': 'text/plain',
        '.rtf': 'application/rtf',
      };

      const contentType = mimeTypes[ext] || 'application/octet-stream';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

      // Send file
      res.sendFile(filePath, err => {
        if (err) {
          console.error('Error serving file:', err);
          ResponseUtil.error(res, 'Error serving file');
        }
      });
    }
  );

  /**
   * @swagger
   * /api/v1/tasks/export/csv:
   *   get:
   *     tags:
   *       - Tasks
   *     summary: Export tasks to CSV
   *     description: Export tasks to CSV format with optional filtering
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - $ref: '#/components/parameters/StatusFilterParameter'
   *       - $ref: '#/components/parameters/StartDateFilterParameter'
   *       - $ref: '#/components/parameters/EndDateFilterParameter'
   *     responses:
   *       200:
   *         $ref: '#/components/responses/CSVResponse'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedResponse'
   *       404:
   *         $ref: '#/components/responses/NotFoundResponse'
   *       500:
   *         description: Internal server error - failed to export CSV
   */
  exportTasksToCSV = errorMiddleware.catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.id;
      const userRole = req.user?.role ?? 'user';
      const { status, startDate, endDate } = req.query;

      if (!userId) {
        res.status(APP_CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      try {
        // Fetch tasks based on user role and filters
        const filters = {
          status: status as 'Pending' | 'In Progress' | 'Completed' | 'Cancelled' | undefined,
          startDate: startDate as string | undefined,
          endDate: endDate as string | undefined,
          page: 1,
          limit: APP_CONSTANTS.CSV_EXPORT.MAX_LIMIT, // Large limit to get all tasks for export
        };

        const result = await this.listTasksUseCase.execute(userId, userRole, filters);

        if (!result.tasks || result.tasks.length === 0) {
          ResponseUtil.notFound(res, 'No tasks found to export');
          return;
        }

        // Transform tasks data for CSV export
        const csvData = await Promise.all(
          result.tasks.map(async task => {
            let userName = '';
            let userEmail = '';

            try {
              // Fetch user information for each task
              const user = await this.userRepository.findById(task.userId);
              if (user) {
                userName = `${user.firstName} ${user.lastName}`.trim();
                userEmail = user.email;
              }
            } catch (error) {
              console.error(`Failed to fetch user data for task ${task.id}:`, error);
              // Continue with empty user data if fetch fails
            }

            return {
              id: task.id,
              title: task.title,
              description: task.description,
              status: task.status,
              priority: task.priority || 'Medium',
              dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : '', // Format as YYYY-MM-DD
              createdAt: task.createdAt ? task.createdAt.toISOString() : '',
              completedAt: task.completedAt ? task.completedAt.toISOString() : '',
              userName,
              userEmail,
              tags: task.tags || [],
              attachments: task.attachments || [],
            };
          })
        );

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${APP_CONSTANTS.CSV_EXPORT.DEFAULT_FILENAME_PREFIX}_${timestamp}.csv`;

        // Export to CSV using CSVUtil
        const filePath = await CSVUtil.exportTasksToCSV(
          csvData,
          `${APP_CONSTANTS.CSV_EXPORT.TEMP_DIR}/${filename}`
        );

        // Read the generated CSV file
        const csvContent = fs.readFileSync(filePath, 'utf8');

        // Set proper headers for CSV download
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        // Send CSV content
        res.status(APP_CONSTANTS.HTTP_STATUS.OK).send(csvContent);

        // Clean up temporary file
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error('CSV export error:', error);
        ResponseUtil.error(
          res,
          'Failed to export tasks to CSV',
          APP_CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR,
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }
  );
}
