import { UserService } from '../../../application/services/user.service';

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export class ChangePasswordUseCase {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
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

      // Use UserService to change password
      await this.userService.changePassword(
        userId,
        passwordData.currentPassword,
        passwordData.newPassword
      );

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
