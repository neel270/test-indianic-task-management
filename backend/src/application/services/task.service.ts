import { UserRepositoryImpl } from './../../infrastructure/repositories/user.repository.impl';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { ITaskRepository, TaskFilters } from '../../domain/repositories/task.repository';
import { TaskEntity } from '../../domain/entities';
import { TaskRepositoryImpl } from '../../infrastructure/repositories/task.repository.impl';

export interface PaginatedTasksResult {
  tasks: TaskEntity[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    totalItems: number;
  };
}

export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
}

export class TaskService {
  private readonly taskRepository: ITaskRepository;
  private readonly userRepository: IUserRepository;

  constructor() {
    this.taskRepository = new TaskRepositoryImpl();
    this.userRepository = new UserRepositoryImpl();
  }
  async createTask(
    title: string,
    description: string,
    dueDate: Date,
    userId: string,
    assignedTo: string,
    priority: 'Low' | 'Medium' | 'High' = 'Medium',
    tags: string[] = []
  ): Promise<TaskEntity> {
    // Verify user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.isActive) {
      throw new Error('User account is deactivated');
    }
    // Create task entity
    const task = TaskEntity.create({
      title,
      description,
      status: 'Pending',
      dueDate,
      userId,
      assignedTo,
      priority,
      tags,
    });

    // Save task
    return await this.taskRepository.save(task);
  }

  async createTaskWithAttachments(
    title: string,
    description: string,
    dueDate: Date,
    userId: string,
    assignedTo: string,
    priority: 'Low' | 'Medium' | 'High' = 'Medium',
    tags: string[] = [],
    attachments: string[] = []
  ): Promise<TaskEntity> {
    // Verify user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.isActive) {
      throw new Error('User account is deactivated');
    }

    // Create task entity with attachments
    const task = TaskEntity.create({
      title,
      description,
      status: 'Pending',
      dueDate,
      userId,
      assignedTo,
      priority,
      tags,
      attachments,
    });

    // Save task
    return await this.taskRepository.save(task);
  }

  async getTaskById(taskId: string): Promise<TaskEntity> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }
    return task;
  }

  async getUserTasks(
    userId: string,
    page: number = 1,
    limit: number = 10,
    status?: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled'
  ): Promise<PaginatedTasksResult> {
    // Verify user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    let result: { tasks: TaskEntity[]; total: number };

    if (status) {
      // Get tasks by status and filter by user
      const allTasks = await this.taskRepository.findByStatus(status);
      const userTasks = allTasks.filter(task => task.userId === userId);
      result = {
        tasks: userTasks.slice((page - 1) * limit, page * limit),
        total: userTasks.length,
      };
    } else {
      result = await this.taskRepository.findByUserId(userId, page, limit);
    }

    const totalPages = Math.ceil(result.total / limit);

    return {
      ...result,
      pagination: {
        total: result.total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        totalItems: result.total,
      },
    };
  }

  async getAllTasks(
    page: number = 1,
    limit: number = 10,
    filters?: TaskFilters
  ): Promise<PaginatedTasksResult> {
    const result = await this.taskRepository.findAll(page, limit, filters);
    const totalPages = Math.ceil(result.total / limit);

    return {
      ...result,
      pagination: {
        totalItems: result.total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        total: result.total,
      },
    };
  }

  async updateTask(
    taskId: string,
    updates: {
      title?: string;
      description?: string;
      status?: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
      dueDate?: Date;
      priority?: 'Low' | 'Medium' | 'High';
      tags?: string[];
      attachments?: string[];
    }
  ): Promise<TaskEntity> {
    const existingTask = await this.taskRepository.findById(taskId);
    if (!existingTask) {
      throw new Error('Task not found');
    }

    // Handle status change to completed
    if (updates.status === 'Completed' && existingTask.status !== 'Completed') {
      const updatedTask = existingTask.markAsCompleted();
      return await this.taskRepository.update(taskId, updatedTask);
    }

    // Handle status change to pending
    if (updates.status === 'Pending' && existingTask.status !== 'Pending') {
      const updatedTask = existingTask.markAsPending();
      return await this.taskRepository.update(taskId, updatedTask);
    }

    // Handle other updates
    const updatedTask = existingTask.updateDetails({
      title: updates.title,
      description: updates.description,
      dueDate: updates.dueDate,
      priority: updates.priority,
      tags: updates.tags,
      attachments: updates.attachments,
    });

    return await this.taskRepository.update(taskId, updatedTask);
  }

  async deleteTask(taskId: string): Promise<boolean> {
    const existingTask = await this.taskRepository.findById(taskId);
    if (!existingTask) {
      throw new Error('Task not found');
    }

    return await this.taskRepository.delete(taskId);
  }

  async addTaskAttachment(taskId: string, attachmentUrl: string): Promise<TaskEntity> {
    const existingTask = await this.taskRepository.findById(taskId);
    if (!existingTask) {
      throw new Error('Task not found');
    }

    const updatedTask = existingTask.addAttachment(attachmentUrl);
    return await this.taskRepository.update(taskId, updatedTask);
  }

  async removeTaskAttachment(taskId: string, attachmentUrl: string): Promise<TaskEntity> {
    const existingTask = await this.taskRepository.findById(taskId);
    if (!existingTask) {
      throw new Error('Task not found');
    }

    const updatedTask = existingTask.removeAttachment(attachmentUrl);
    return await this.taskRepository.update(taskId, updatedTask);
  }

  async getTaskStats(userId?: string): Promise<TaskStats> {
    let tasks: TaskEntity[];

    if (userId) {
      // Get user's tasks
      const result = await this.taskRepository.findByUserId(userId, 1, 1000);
      tasks = result.tasks;
    } else {
      // Get all tasks (admin only)
      const result = await this.taskRepository.findAll(1, 1000);
      tasks = result.tasks;
    }

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'Completed').length;
    const pendingTasks = tasks.filter(task => task.status === 'Pending').length;
    const overdueTasks = tasks.filter(task => task.isOverdue()).length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      completionRate: Math.round(completionRate * 100) / 100,
    };
  }

  async getOverdueTasks(): Promise<TaskEntity[]> {
    return await this.taskRepository.findOverdueTasks();
  }

  async getTasksDueSoon(hoursThreshold: number = 24): Promise<TaskEntity[]> {
    return await this.taskRepository.findTasksDueSoon(hoursThreshold);
  }

  // Transform attachment paths to URLs for API responses
  transformAttachmentsForResponse(attachments: string[], userId: string, taskId: string): string[] {
    if (!attachments || attachments.length === 0) {
      return [];
    }

    const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';
    const apiPrefix = process.env.API_PREFIX ?? '/api';

    return attachments.map(attachment => {
      // If it's already a full URL, return as is
      if (attachment.startsWith('http://') || attachment.startsWith('https://')) {
        return attachment;
      }

      // Otherwise, construct the URL for serving the file
      return `${baseUrl}${apiPrefix}/tasks/attachments/${userId}/${taskId}/${attachment}`;
    });
  }

  // Transform task entity for API response with proper attachment URLs
  transformTaskForResponse(task: TaskEntity, _requestingUserId?: string): any {
    const taskObj = {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status.toLowerCase(),
      priority: task.priority.toLowerCase(),
      assignedTo: task.assignedTo,
      createdBy: task.userId,
      dueDate: task.dueDate.toISOString(),
      completedAt: task.completedAt?.toISOString(),
      tags: task.tags,
      attachments: this.transformAttachmentsForResponse(task.attachments, task.userId, task.id),
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };

    return taskObj;
  }
}
