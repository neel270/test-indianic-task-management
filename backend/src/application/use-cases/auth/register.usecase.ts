import { ITaskRepository } from '../../../domain/repositories/task.repository';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { TaskRepositoryImpl } from '../../../infrastructure/repositories/task.repository.impl';
import { UserRepositoryImpl } from '../../../infrastructure/repositories/user.repository.impl';
import { CreateUserDto } from '../../dtos/user.dto';
import { AuthService } from '../../services/auth.service';

export class RegisterUseCase {
  private authService: AuthService;

  constructor(userRepository?: IUserRepository, taskRepository?: ITaskRepository) {
    const userRepo = userRepository ?? new UserRepositoryImpl();
    const taskRepo = taskRepository ?? new TaskRepositoryImpl();
    this.authService = new AuthService(userRepo, taskRepo);
  }

  async execute(
    userData: CreateUserDto
  ): Promise<{ id: string; email: string; firstName: string; lastName: string }> {
    try {
      const user = await this.authService.registerUser(
        userData.email,
        userData.password,
        userData.firstName,
        userData.lastName,
        userData.role ?? 'user'
      );

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      };
    } catch (error) {
      throw new Error(
        `Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
