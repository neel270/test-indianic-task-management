import { CreateTaskUseCase } from '../../../application/use-cases/task/create-task.usecase';
import { DeleteTaskUseCase } from '../../../application/use-cases/task/delete-task.usecase';
import { GetTaskByIdUseCase } from '../../../application/use-cases/task/get-task-by-id.usecase';
import { GetTaskStatsUseCase } from '../../../application/use-cases/task/get-task-stats.usecase';
import { ListTasksUseCase } from '../../../application/use-cases/task/list-tasks.usecase';
import { UpdateTaskUseCase } from '../../../application/use-cases/task/update-task.usecase';
import { Request, Response } from 'express';
import { errorMiddleware } from '../../middlewares/error.middleware';
import * as fs from 'fs';
import { CSVUtil } from '../../../infrastructure/utils/csv.util';
import { EmailService } from '../../services/email.service';
import { TaskSocket } from '../../sockets/task.socket';
import { UserRepositoryImpl } from '../../repositories/user.repository.impl';
import { ImageService } from '../../services/image.service';

export class TaskController {
  private createTaskUseCase: CreateTaskUseCase;
  private updateTaskUseCase: UpdateTaskUseCase;
  private deleteTaskUseCase: DeleteTaskUseCase;
  private listTasksUseCase: ListTasksUseCase;
  private getTaskByIdUseCase: GetTaskByIdUseCase;
  private getTaskStatsUseCase: GetTaskStatsUseCase;
  private emailService: EmailService;
  private imageService: ImageService;
  private taskSocket: TaskSocket;
  private userRepository: any;

  constructor(taskSocket?: TaskSocket) {
    this.createTaskUseCase = new CreateTaskUseCase();
    this.updateTaskUseCase = new UpdateTaskUseCase();
    this.deleteTaskUseCase = new DeleteTaskUseCase();
    this.listTasksUseCase = new ListTasksUseCase();
    this.getTaskByIdUseCase = new GetTaskByIdUseCase();
    this.getTaskStatsUseCase = new GetTaskStatsUseCase();
    this.emailService = new EmailService();
    this.imageService = new ImageService();
    this.userRepository = new UserRepositoryImpl();
    this.taskSocket = taskSocket || new TaskSocket({} as any);
  }

  createTask = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { title, description, dueDate, status, priority, tags,assignedTo } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
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
      userId
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
      console.warn('WebSocket notification failed (SocketIO may not be available):', error instanceof Error ? error.message : error);
      // Don't fail the request if WebSocket fails - this is expected when SocketIO is not configured
    }

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: result,
    });
  });

  getTasks = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const userRole = req.user?.role || 'user';
    const { page, limit, status, startDate, endDate, sortBy, sortOrder } = req.query;

    if (!userId) {
      res.status(401).json({
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

    res.status(200).json({
      success: true,
      message: 'Tasks retrieved successfully',
      data: result,
    });
  });

  getTaskById = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const result = await this.getTaskByIdUseCase.execute({
      id,
      userId,
    });

    res.status(200).json({
      success: true,
      message: 'Task retrieved successfully',
      data: result,
    });
  });

  updateTask = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { title, description, status, dueDate, priority, tags } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Task ID is required',
      });
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
      },
      userId
    );

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: result,
    });
  });

  deleteTask = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Task ID is required',
      });
      return;
    }

    const result = await this.deleteTaskUseCase.execute(id, userId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  });

  markTaskComplete = errorMiddleware.catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Task ID is required',
        });
        return;
      }

      const result = await this.updateTaskUseCase.execute(
        id,
        {
          status: 'Completed',
        },
        userId
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
        console.warn('WebSocket notification failed (SocketIO may not be available):', error instanceof Error ? error.message : error);
        // Don't fail the request if WebSocket fails - this is expected when SocketIO is not configured
      }

      res.status(200).json({
        success: true,
        message: 'Task marked as completed',
        data: result,
      });
    }
  );

  markTaskPending = errorMiddleware.catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Task ID is required',
        });
        return;
      }

      const result = await this.updateTaskUseCase.execute(
        id,
        {
          status: 'Pending',
        },
        userId
      );

      res.status(200).json({
        success: true,
        message: 'Task marked as pending',
        data: result,
      });
    }
  );

  getTaskStats = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const userRole = req.user?.role || 'user';

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const result = await this.getTaskStatsUseCase.execute({
      userId,
      userRole,
    });

    res.status(200).json({
      success: true,
      message: 'Task statistics retrieved successfully',
      data: result,
    });
  });

  uploadTaskFile = errorMiddleware.catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const userId = req.user?.id;
      const file = req.file;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Task ID is required',
        });
        return;
      }

      if (!file) {
        res.status(400).json({
          success: false,
          message: 'No file provided',
        });
        return;
      }

      try {
        // Process image files if needed (resize large images)
        let finalFilePath = file.path;
        if (file.mimetype.startsWith('image/')) {
          finalFilePath = await this.imageService.resizeTaskImage(file.path);
        }

        // Generate file URL for serving
        const fileUrl = `/uploads/tasks/${userId}/${id}/${file.filename}`;

        // Here you would typically save file info to database
        // For now, return success with file info
        const fileData = {
          fileId: Date.now().toString(),
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          path: finalFilePath,
          url: fileUrl,
          taskId: id,
          uploadedBy: userId,
          uploadedAt: new Date(),
        };

        res.status(201).json({
          success: true,
          message: 'File uploaded successfully',
          data: fileData,
        });
      } catch (error) {
        console.error('Error processing uploaded file:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to process uploaded file',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  getTaskFiles = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Task ID is required',
      });
      return;
    }

    // Here you would typically fetch files from database
    // For now, return empty array
    res.status(200).json({
      success: true,
      message: 'Task files retrieved successfully',
      data: [],
    });
  });

  deleteTaskFile = errorMiddleware.catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const { id, fileId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      if (!id || !fileId) {
        res.status(400).json({
          success: false,
          message: 'Task ID and File ID are required',
        });
        return;
      }

      // Here you would typically delete file from database and disk
      // For now, return success
      res.status(200).json({
        success: true,
        message: 'File deleted successfully',
      });
    }
  );

  exportTasksToCSV = errorMiddleware.catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.id;
      const userRole = req.user?.role || 'user';
      const { status, startDate, endDate } = req.query;

      if (!userId) {
        res.status(401).json({
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
          limit: 10000, // Large limit to get all tasks for export
        };

        const result = await this.listTasksUseCase.execute(userId, userRole, filters);

        if (!result.tasks || result.tasks.length === 0) {
          res.status(404).json({
            success: false,
            message: 'No tasks found to export',
          });
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
              dueDate: task.dueDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
              createdAt: task.createdAt.toISOString(),
              completedAt: task.completedAt ? task.completedAt.toISOString() : '',
              userName: userName,
              userEmail: userEmail,
              tags: task.tags || [],
              attachments: task.attachments || [],
            };
          })
        );

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `tasks_export_${timestamp}.csv`;

        // Export to CSV using CSVUtil
        const filePath = await CSVUtil.exportTasksToCSV(csvData, `/tmp/${filename}`);

        // Read the generated CSV file
        const csvContent = fs.readFileSync(filePath, 'utf8');

        // Set proper headers for CSV download
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        // Send CSV content
        res.status(200).send(csvContent);

        // Clean up temporary file
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error('CSV export error:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to export tasks to CSV',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );
}
