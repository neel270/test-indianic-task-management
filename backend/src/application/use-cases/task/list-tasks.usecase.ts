import { TaskFiltersDto } from '../../dtos/task.dto';
import { PaginatedTasksResult, TaskService } from '../../services/task.service';

export class ListTasksUseCase {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  async execute(filters?: TaskFiltersDto): Promise<PaginatedTasksResult> {
    try {
      const page = filters?.page ?? 1;
      const limit = filters?.limit ?? 10;

      // Admins can see all tasks with filters
      const taskFilters: Record<string, unknown> = {};

      if (filters?.status) {
        taskFilters.status = filters.status;
      }
      if (filters?.startDate) {
        taskFilters.startDate = new Date(filters.startDate);
      }
      if (filters?.endDate) {
        taskFilters.endDate = new Date(filters.endDate);
      }
      if (filters?.search) {
        taskFilters.search = filters.search;
      }
      return await this.taskService.getAllTasks(page, limit, taskFilters);
    } catch (error) {
      throw new Error(
        `Task listing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
