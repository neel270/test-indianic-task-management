import { SetNewPasswordDto, ResetPasswordWithEmailDto } from '../../../dtos/user.dto';
import { AuthService } from '../../../services/auth.service';

export class SetPasswordUseCase {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async execute(
    setPasswordData: SetNewPasswordDto | ResetPasswordWithEmailDto
  ): Promise<{ message: string }> {
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
        await this.authService.resetPassword(
          setPasswordData.resetToken,
          setPasswordData.newPassword
        );
      }

      return {
        message: 'Password reset successfully. You can now login with your new password.',
      };
    } catch (error) {
      throw new Error(
        `Password reset failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
