import { ITaskRepository } from '../../../../domain/repositories/task.repository';
import { IUserRepository } from '../../../../domain/repositories/user.repository';
import { TaskRepositoryImpl } from '../../../../infrastructure/repositories/task.repository.impl';
import { UserRepositoryImpl } from '../../../../infrastructure/repositories/user.repository.impl';
import { SetNewPasswordDto } from '../../../dtos/user.dto';
import { AuthService } from '../../../services/auth.service';

export class SetPasswordUseCase {
  private authService: AuthService;

  constructor(
    userRepository?: IUserRepository,
    taskRepository?: ITaskRepository
  ) {
    const userRepo = userRepository || new UserRepositoryImpl();
    const taskRepo = taskRepository || new TaskRepositoryImpl();
    this.authService = new AuthService(userRepo, taskRepo);
  }

  async execute(setPasswordData: SetNewPasswordDto): Promise<{ message: string }> {
    try {
      await this.authService.resetPassword(setPasswordData.resetToken, setPasswordData.newPassword);

      return {
        message: 'Password reset successfully. You can now login with your new password.'
      };
    } catch (error) {
      throw new Error(`Password reset failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
