import { ITaskRepository } from '../../../domain/repositories/task.repository';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { TaskRepositoryImpl } from '../../../infrastructure/repositories/task.repository.impl';
import { UserRepositoryImpl } from '../../../infrastructure/repositories/user.repository.impl';
import { UpdateTaskDto } from '../../dtos/task.dto';
import { TaskService } from '../../services/task.service';

export class UpdateTaskUseCase {
  private taskService: TaskService;

  constructor(
    taskRepository?: ITaskRepository,
    userRepository?: IUserRepository
  ) {
    const taskRepo = taskRepository || new TaskRepositoryImpl();
    const userRepo = userRepository || new UserRepositoryImpl();
    this.taskService = new TaskService(taskRepo, userRepo);
  }

  async execute(
    taskId: string,
    taskData: UpdateTaskDto,
    userId: string
  ): Promise<{
    id: string;
    title: string;
    description: string;
    status: string;
    dueDate: Date;
    priority: string;
    tags: string[];
  }> {
    try {
      const updatePayload: any = {};

      if (taskData.title !== undefined) updatePayload.title = taskData.title;
      if (taskData.description !== undefined) updatePayload.description = taskData.description;
      if (taskData.status !== undefined) updatePayload.status = taskData.status;
      if (taskData.dueDate !== undefined) updatePayload.dueDate = new Date(taskData.dueDate);
      if (taskData.priority !== undefined) updatePayload.priority = taskData.priority;
      if (taskData.tags !== undefined) updatePayload.tags = taskData.tags;

      const task = await this.taskService.updateTask(taskId, updatePayload, userId);

      return {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        dueDate: task.dueDate,
        priority: task.priority,
        tags: task.tags
      };
    } catch (error) {
      throw new Error(`Task update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
