import { ITaskRepository } from '../../../domain/repositories/task.repository';
import { TaskRepositoryImpl } from '../../../infrastructure/repositories/task.repository.impl';

export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
}

export interface GetTaskStatsUseCaseInput {
  userId: string;
  userRole: string;
}

export class GetTaskStatsUseCase {
  private taskRepository: ITaskRepository;

  constructor() {
    this.taskRepository = new TaskRepositoryImpl();
  }

  async execute(input: GetTaskStatsUseCaseInput): Promise<TaskStats> {
    const { userId } = input;

    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      // Get all tasks for the user
      const result = await this.taskRepository.findByUserId(userId, 1, 10000); // Get all tasks
      const tasks = result.tasks;

      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(task => task.status === 'Completed').length;
      const pendingTasks = tasks.filter(task => task.status === 'Pending').length;

      // Calculate overdue tasks
      const now = new Date();
      const overdueTasks = tasks.filter(task =>
        task.dueDate &&
        new Date(task.dueDate) < now &&
        task.status !== 'Completed'
      ).length;

      // Calculate completion rate
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      return {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        completionRate: Math.round(completionRate * 100) / 100, // Round to 2 decimal places
      };
    } catch (error) {
      throw new Error(`Failed to get task statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}