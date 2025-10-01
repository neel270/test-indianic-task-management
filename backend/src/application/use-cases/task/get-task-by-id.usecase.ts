import { ITaskRepository } from '../../../domain/repositories/task.repository';
import { TaskRepositoryImpl } from '../../../infrastructure/repositories/task.repository.impl';

export interface GetTaskByIdUseCaseInput {
  id: string;
  userId: string;
}

export class GetTaskByIdUseCase {
  private taskRepository: ITaskRepository;

  constructor() {
    this.taskRepository = new TaskRepositoryImpl();
  }

  async execute(input: GetTaskByIdUseCaseInput) {
    const { id, userId } = input;

    if (!id) {
      throw new Error('Task ID is required');
    }

    if (!userId) {
      throw new Error('User ID is required');
    }

    const task = await this.taskRepository.findById(id);
    console.log('Fetched task:', task?.userId.toString(), 'for userId:', userId);
    if (!task) {
      throw new Error('Task not found');
    }

    // Check if user has permission to view this task
    if (task.userId.toString() !== userId) {
      throw new Error('Access denied: You do not have permission to view this task');
    }

    return task;
  }
}
