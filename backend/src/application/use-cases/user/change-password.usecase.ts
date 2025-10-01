import { IUserRepository } from '../../../domain/repositories/user.repository';
import { UserRepositoryImpl } from '../../../infrastructure/repositories/user.repository.impl';
import { PasswordUtil } from '../../../infrastructure/utils/password.util';

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export class ChangePasswordUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository?: IUserRepository) {
    this.userRepository = userRepository ?? new UserRepositoryImpl();
  }

  async execute(userId: string, passwordData: ChangePasswordDto): Promise<{ message: string }> {
    try {
      // Validate input
      if (!passwordData.currentPassword || !passwordData.newPassword) {
        throw new Error('Current password and new password are required');
      }

      if (passwordData.currentPassword === passwordData.newPassword) {
        throw new Error('New password must be different from current password');
      }

      // Get user from database
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await PasswordUtil.compare(
        passwordData.currentPassword,
        user.password
      );

      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await PasswordUtil.hash(passwordData.newPassword);

      // Update password in database
      await this.userRepository.update(userId, {
        password: hashedNewPassword,
      });

      return {
        message: 'Password changed successfully',
      };
    } catch (error) {
      throw new Error(
        `Password change failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
