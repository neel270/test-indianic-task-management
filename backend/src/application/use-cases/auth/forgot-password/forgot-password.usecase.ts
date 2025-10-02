import { ForgotPasswordDto } from '../../../dtos/user.dto';
import { AuthService } from '../../../services/auth.service';

export class ForgotPasswordUseCase {
  private authService: AuthService;
  constructor() {
    this.authService = new AuthService();
  }

  async execute(
    forgotPasswordData: ForgotPasswordDto
  ): Promise<{ message: string; otpExpiresAt: Date }> {
    try {
      const otpData = await this.authService.generatePasswordResetOTP(forgotPasswordData.email);

      // In a real application, you would send the OTP via email here
      // For demo purposes, we'll just return the OTP data

      return {
        message: 'OTP sent to your email address',
        otpExpiresAt: otpData.expiresAt,
      };
    } catch (error) {
      throw new Error(
        `Forgot password failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
