import { ITaskRepository } from '../../../domain/repositories/task.repository';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { TaskRepositoryImpl } from '../../../infrastructure/repositories/task.repository.impl';
import { UserRepositoryImpl } from '../../../infrastructure/repositories/user.repository.impl';
import { CreateTaskDto } from '../../dtos/task.dto';
import { TaskService } from '../../services/task.service';

export class CreateTaskUseCase {
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
    taskData: CreateTaskDto,
    userId: string
  ): Promise<{
    id: string;
    title: string;
    description: string;
    status: string;
    dueDate: Date;
    assignedTo:string,
    userId: string;
    priority: string;
    tags: string[];
  }> {
    try {
      const task = await this.taskService.createTask(
        taskData.title,
        taskData.description,
        new Date(taskData.dueDate),
        userId,
        taskData.assignedTo,
        taskData.priority || 'Medium',
        taskData.tags || []
      );

      return {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        dueDate: task.dueDate,
        assignedTo: task.assignedTo,
        userId: task.userId,
        priority: task.priority,
        tags: task.tags
      };
    } catch (error) {
      throw new Error(`Task creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
