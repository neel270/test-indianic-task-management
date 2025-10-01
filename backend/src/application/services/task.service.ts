import { TaskEntity } from '../../domain/entities';
import { ITaskRepository, TaskFilters } from '../../domain/repositories/task.repository';
import { IUserRepository } from '../../domain/repositories/user.repository';

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
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly userRepository: IUserRepository
  ) {}

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
    console.log(
      'Creating task with data:',
      {
        title,
        description,
        status: 'Pending',
        dueDate,
        userId,
        assignedTo,
        priority,
        tags,
      },
      'for user:',
      userId
    );

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

  async getTaskById(taskId: string, userId?: string): Promise<TaskEntity> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    // If userId is provided, ensure the task belongs to the user (unless user is admin)
    if (userId && task.userId !== userId) {
      const user = await this.userRepository.findById(userId);
      if (user?.role !== 'admin') {
        throw new Error('Access denied');
      }
    }

    return task;
  }

  async getUserTasks(
    userId: string,
    page: number = 1,
    limit: number = 10,
    status?: 'Pending' | 'Completed'
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
    filters?: TaskFilters,
    userRole?: string
  ): Promise<PaginatedTasksResult> {
    // Only admins can view all tasks, regular users can only view their own
    if (userRole !== 'admin') {
      throw new Error('Access denied');
    }

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
      status?: 'Pending' | 'Completed';
      dueDate?: Date;
      priority?: 'Low' | 'Medium' | 'High';
      tags?: string[];
    },
    userId?: string
  ): Promise<TaskEntity> {
    const existingTask = await this.taskRepository.findById(taskId);
    if (!existingTask) {
      throw new Error('Task not found');
    }

    // If userId is provided, ensure the task belongs to the user (unless user is admin)
    if (userId && existingTask.userId !== userId) {
      const user = await this.userRepository.findById(userId);
      if (user?.role !== 'admin') {
        throw new Error('Access denied');
      }
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
    });

    return await this.taskRepository.update(taskId, updatedTask);
  }

  async deleteTask(taskId: string, userId?: string): Promise<boolean> {
    const existingTask = await this.taskRepository.findById(taskId);
    if (!existingTask) {
      throw new Error('Task not found');
    }

    // If userId is provided, ensure the task belongs to the user (unless user is admin)
    if (userId && existingTask.userId !== userId) {
      const user = await this.userRepository.findById(userId);
      if (user?.role !== 'admin') {
        throw new Error('Access denied');
      }
    }

    return await this.taskRepository.delete(taskId);
  }

  async addTaskAttachment(
    taskId: string,
    attachmentUrl: string,
    userId?: string
  ): Promise<TaskEntity> {
    const existingTask = await this.taskRepository.findById(taskId);
    if (!existingTask) {
      throw new Error('Task not found');
    }

    // If userId is provided, ensure the task belongs to the user (unless user is admin)
    if (userId && existingTask.userId !== userId) {
      const user = await this.userRepository.findById(userId);
      if (user?.role !== 'admin') {
        throw new Error('Access denied');
      }
    }

    const updatedTask = existingTask.addAttachment(attachmentUrl);
    return await this.taskRepository.update(taskId, updatedTask);
  }

  async removeTaskAttachment(
    taskId: string,
    attachmentUrl: string,
    userId?: string
  ): Promise<TaskEntity> {
    const existingTask = await this.taskRepository.findById(taskId);
    if (!existingTask) {
      throw new Error('Task not found');
    }

    // If userId is provided, ensure the task belongs to the user (unless user is admin)
    if (userId && existingTask.userId !== userId) {
      const user = await this.userRepository.findById(userId);
      if (user?.role !== 'admin') {
        throw new Error('Access denied');
      }
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
}
