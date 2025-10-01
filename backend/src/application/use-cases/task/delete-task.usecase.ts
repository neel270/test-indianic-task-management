import { ITaskRepository } from '../../../domain/repositories/task.repository';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { TaskRepositoryImpl } from '../../../infrastructure/repositories/task.repository.impl';
import { UserRepositoryImpl } from '../../../infrastructure/repositories/user.repository.impl';
import { TaskService } from '../../services/task.service';

export class DeleteTaskUseCase {
  private taskService: TaskService;

  constructor(taskRepository?: ITaskRepository, userRepository?: IUserRepository) {
    const taskRepo = taskRepository ?? new TaskRepositoryImpl();
    const userRepo = userRepository ?? new UserRepositoryImpl();
    this.taskService = new TaskService(taskRepo, userRepo);
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
