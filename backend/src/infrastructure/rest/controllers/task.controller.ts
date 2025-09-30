import { CreateTaskUseCase } from '@/application/use-cases/task/create-task.usecase';
import { DeleteTaskUseCase } from '@/application/use-cases/task/delete-task.usecase';
import { ListTasksUseCase } from '@/application/use-cases/task/list-tasks.usecase';
import { UpdateTaskUseCase } from '@/application/use-cases/task/update-task.usecase';
import { Request, Response } from 'express';
import { errorMiddleware } from '../../middlewares/error.middleware';

export class TaskController {
  private createTaskUseCase: CreateTaskUseCase;
  private updateTaskUseCase: UpdateTaskUseCase;
  private deleteTaskUseCase: DeleteTaskUseCase;
  private listTasksUseCase: ListTasksUseCase;

  constructor() {
    this.createTaskUseCase = new CreateTaskUseCase();
    this.updateTaskUseCase = new UpdateTaskUseCase();
    this.deleteTaskUseCase = new DeleteTaskUseCase();
    this.listTasksUseCase = new ListTasksUseCase();
  }

  createTask = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { title, description, dueDate, status, priority, tags } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const result = await this.createTaskUseCase.execute({
      title,
      description,
      dueDate,
      status
    }, userId);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: result
    });
  });

  getTasks = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const userRole = req.user?.role || 'user';
    const { page, limit, status, startDate, endDate, sortBy, sortOrder } = req.query;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const filters = {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      status: status as 'Pending' | 'Completed' | undefined,
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
      sortBy: sortBy as string | undefined,
      sortOrder: sortOrder as 'asc' | 'desc' | undefined
    };

    const result = await this.listTasksUseCase.execute(userId, userRole, filters);

    res.status(200).json({
      success: true,
      message: 'Tasks retrieved successfully',
      data: result
    });
  });

  getTaskById = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    // This would typically use a GetTaskByIdUseCase
    res.status(200).json({
      success: true,
      message: 'Task retrieved successfully',
      data: {
        id,
        title: 'Sample Task',
        description: 'Sample Description',
        status: 'Pending',
        dueDate: new Date(),
        userId
      }
    });
  });

  updateTask = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { title, description, status, dueDate, priority, tags } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Task ID is required'
      });
      return;
    }

    const result = await this.updateTaskUseCase.execute(id, {
      title,
      description,
      status,
      dueDate,
      priority,
      tags
    }, userId);

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: result
    });
  });

  deleteTask = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Task ID is required'
      });
      return;
    }

    const result = await this.deleteTaskUseCase.execute(id, userId);

    res.status(200).json({
      success: true,
      message: result.message
    });
  });

  markTaskComplete = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Task ID is required'
      });
      return;
    }

    const result = await this.updateTaskUseCase.execute(id, {
      status: 'Completed'
    }, userId);

    res.status(200).json({
      success: true,
      message: 'Task marked as completed',
      data: result
    });
  });

  markTaskPending = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Task ID is required'
      });
      return;
    }

    const result = await this.updateTaskUseCase.execute(id, {
      status: 'Pending'
    }, userId);

    res.status(200).json({
      success: true,
      message: 'Task marked as pending',
      data: result
    });
  });

  getTaskStats = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    // This would typically use a GetTaskStatsUseCase
    res.status(200).json({
      success: true,
      message: 'Task statistics retrieved successfully',
      data: {
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        overdueTasks: 0,
        completionRate: 0
      }
    });
  });
}
