import { ForgotPasswordUseCase } from '@/application/use-cases/auth/forgot-password/forgot-password.usecase';
import { SetPasswordUseCase } from '@/application/use-cases/auth/forgot-password/set-password.usecase';
import { VerifyOTPUseCase } from '@/application/use-cases/auth/forgot-password/verify-otp.usecase';
import { LoginUseCase } from '@/application/use-cases/auth/login.usecase';
import { RegisterUseCase } from '@/application/use-cases/auth/register.usecase';
import { Request, Response } from 'express';
import { errorMiddleware } from '../../middlewares/error.middleware';

export class AuthController {
  private registerUseCase: RegisterUseCase;
  private loginUseCase: LoginUseCase;
  private forgotPasswordUseCase: ForgotPasswordUseCase;
  private verifyOTPUseCase: VerifyOTPUseCase;
  private setPasswordUseCase: SetPasswordUseCase;

  constructor() {
    this.registerUseCase = new RegisterUseCase();
    this.loginUseCase = new LoginUseCase();
    this.forgotPasswordUseCase = new ForgotPasswordUseCase();
    this.verifyOTPUseCase = new VerifyOTPUseCase();
    this.setPasswordUseCase = new SetPasswordUseCase();
  }

  register = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, role } = req.body;

    const result = await this.registerUseCase.execute({
      name,
      email,
      password,
      role
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result
    });
  });

  login = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    const result = await this.loginUseCase.execute({
      email,
      password
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result
    });
  });

  refreshToken = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    // This would typically use the AuthService directly
    // For now, we'll return a placeholder response
    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: 'new-access-token-placeholder'
      }
    });
  });

  forgotPassword = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    const result = await this.forgotPasswordUseCase.execute({
      email
    });

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        otpExpiresAt: result.otpExpiresAt
      }
    });
  });

  verifyOTP = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { email, otp } = req.body;

    const result = await this.verifyOTPUseCase.execute({
      email,
      otp
    });

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        resetToken: result.resetToken
      }
    });
  });

  resetPassword = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { resetToken, newPassword } = req.body;

    const result = await this.setPasswordUseCase.execute({
      resetToken,
      newPassword
    });

    res.status(200).json({
      success: true,
      message: result.message
    });
  });

  me = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    // This would typically get user info from the authenticated user
    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: req.user
    });
  });
}
