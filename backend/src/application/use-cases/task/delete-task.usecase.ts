import { TaskService } from '../../services/task.service';

export class DeleteTaskUseCase {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  async execute(taskId: string, userId: string): Promise<{ message: string }> {
    try {
      const deleted = await this.taskService.deleteTask(taskId, userId);

      if (!deleted) {
        throw new Error('Task not found or could not be deleted');
      }

      return {
        message: 'Task deleted successfully',
      };
    } catch (error) {
      throw new Error(
        `Task deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
