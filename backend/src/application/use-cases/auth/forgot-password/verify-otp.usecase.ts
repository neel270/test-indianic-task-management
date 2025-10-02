import { VerifyOtpDto } from '../../../dtos/user.dto';
import { AuthService } from '../../../services/auth.service';

export class VerifyOTPUseCase {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async execute(verifyOtpData: VerifyOtpDto): Promise<{ resetToken: string; message: string }> {
    try {
      const result = await this.authService.verifyOTP(verifyOtpData.email, verifyOtpData.otp);

      return {
        resetToken: result.resetToken,
        message: 'OTP verified successfully. You can now reset your password.',
      };
    } catch (error) {
      throw new Error(
        `OTP verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
