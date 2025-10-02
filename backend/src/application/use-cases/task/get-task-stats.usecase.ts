import { TaskService } from '../../../application/services/task.service';

export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
}

export interface GetTaskStatsUseCaseInput {
  userId?: string;
  userRole?: string;
}

export class GetTaskStatsUseCase {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  async execute(input: GetTaskStatsUseCaseInput): Promise<TaskStats> {
    const { userId } = input;

    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      // Use TaskService to get task statistics
      const stats = await this.taskService.getTaskStats(userId);

      return {
        totalTasks: stats.totalTasks,
        completedTasks: stats.completedTasks,
        pendingTasks: stats.pendingTasks,
        overdueTasks: stats.overdueTasks,
        completionRate: stats.completionRate,
      };
    } catch (error) {
      throw new Error(
        `Failed to get task statistics: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
