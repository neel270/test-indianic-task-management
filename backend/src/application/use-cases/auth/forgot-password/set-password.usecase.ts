import { ITaskRepository } from '../../../../domain/repositories/task.repository';
import { IUserRepository } from '../../../../domain/repositories/user.repository';
import { TaskRepositoryImpl } from '../../../../infrastructure/repositories/task.repository.impl';
import { UserRepositoryImpl } from '../../../../infrastructure/repositories/user.repository.impl';
import { SetNewPasswordDto, ResetPasswordWithEmailDto } from '../../../dtos/user.dto';
import { AuthService } from '../../../services/auth.service';
import { RedisService } from '../../../../infrastructure/services/redis.service';

export class SetPasswordUseCase {
  private authService: AuthService;

  constructor(
    userRepository?: IUserRepository,
    taskRepository?: ITaskRepository,
    redisService?: RedisService
  ) {
    const userRepo = userRepository || new UserRepositoryImpl();
    const taskRepo = taskRepository || new TaskRepositoryImpl();
    this.authService = new AuthService(userRepo, taskRepo, redisService);
  }

  async execute(setPasswordData: SetNewPasswordDto | ResetPasswordWithEmailDto): Promise<{ message: string }> {
    try {
      // Check if it's the new format with email or old format
      if ('email' in setPasswordData) {
        // New format with email
        await this.authService.resetPasswordWithEmail(
          setPasswordData.email,
          setPasswordData.resetToken,
          setPasswordData.newPassword
        );
      } else {
        // Old format - for backward compatibility
        await this.authService.resetPassword(setPasswordData.resetToken, setPasswordData.newPassword);
      }

      return {
        message: 'Password reset successfully. You can now login with your new password.'
      };
    } catch (error) {
      throw new Error(`Password reset failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
