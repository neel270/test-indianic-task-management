import { TaskService } from '../../../application/services/task.service';

export interface GetTaskByIdUseCaseInput {
  id: string;
  userId: string;
}

export class GetTaskByIdUseCase {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  async execute(input: GetTaskByIdUseCaseInput) {
    const { id, userId } = input;

    if (!id) {
      throw new Error('Task ID is required');
    }

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Use TaskService to get task by ID with user permission check
    const task = await this.taskService.getTaskById(id, userId);

    return task;
  }
}
