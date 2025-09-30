import { ITaskRepository } from '../../../domain/repositories/task.repository';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { TaskRepositoryImpl } from '../../../infrastructure/repositories/task.repository.impl';
import { UserRepositoryImpl } from '../../../infrastructure/repositories/user.repository.impl';
import { LoginUserDto } from '../../dtos/user.dto';
import { AuthService } from '../../services/auth.service';

export class LoginUseCase {
  private authService: AuthService;

  constructor(
    userRepository?: IUserRepository,
    taskRepository?: ITaskRepository
  ) {
    const userRepo = userRepository || new UserRepositoryImpl();
    const taskRepo = taskRepository || new TaskRepositoryImpl();
    this.authService = new AuthService(userRepo, taskRepo);
  }

  async execute(loginData: LoginUserDto): Promise<{
    user: { id: string; email: string; name: string; role: string };
    tokens: { accessToken: string; refreshToken: string };
  }> {
    try {
      const result = await this.authService.loginUser(loginData.email, loginData.password);

      return {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role
        },
        tokens: result.tokens
      };
    } catch (error) {
      throw new Error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
