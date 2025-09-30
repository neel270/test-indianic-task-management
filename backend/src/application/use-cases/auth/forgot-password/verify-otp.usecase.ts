import { ITaskRepository } from '../../../../domain/repositories/task.repository';
import { IUserRepository } from '../../../../domain/repositories/user.repository';
import { TaskRepositoryImpl } from '../../../../infrastructure/repositories/task.repository.impl';
import { UserRepositoryImpl } from '../../../../infrastructure/repositories/user.repository.impl';
import { VerifyOtpDto } from '../../../dtos/user.dto';
import { AuthService } from '../../../services/auth.service';

export class VerifyOTPUseCase {
  private authService: AuthService;

  constructor(
    userRepository?: IUserRepository,
    taskRepository?: ITaskRepository
  ) {
    const userRepo = userRepository || new UserRepositoryImpl();
    const taskRepo = taskRepository || new TaskRepositoryImpl();
    this.authService = new AuthService(userRepo, taskRepo);
  }

  async execute(verifyOtpData: VerifyOtpDto): Promise<{ resetToken: string; message: string }> {
    try {
      const result = await this.authService.verifyOTP(verifyOtpData.email, verifyOtpData.otp);

      return {
        resetToken: result.resetToken,
        message: 'OTP verified successfully. You can now reset your password.'
      };
    } catch (error) {
      throw new Error(`OTP verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
