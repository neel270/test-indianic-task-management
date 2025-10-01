import { ForgotPasswordUseCase } from '../../../application/use-cases/auth/forgot-password/forgot-password.usecase';
import { SetPasswordUseCase } from '../../../application/use-cases/auth/forgot-password/set-password.usecase';
import { VerifyOTPUseCase } from '../../../application/use-cases/auth/forgot-password/verify-otp.usecase';
import { LoginUseCase } from '../../../application/use-cases/auth/login.usecase';
import { RegisterUseCase } from '../../../application/use-cases/auth/register.usecase';
import { UpdateProfileUseCase } from '../../../application/use-cases/user/update-profile.usecase';
import { ChangePasswordUseCase } from '../../../application/use-cases/user/change-password.usecase';
import { AuthService } from '../../../application/services/auth.service';
import { Request, Response } from 'express';
import { errorMiddleware } from '../../middlewares/error.middleware';
import { RedisService } from '../../services/redis.service';
import { EmailService } from '../../services/email.service';
import sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';

export class AuthController {
  private registerUseCase: RegisterUseCase;
  private loginUseCase: LoginUseCase;
  private forgotPasswordUseCase: ForgotPasswordUseCase;
  private verifyOTPUseCase: VerifyOTPUseCase;
  private setPasswordUseCase: SetPasswordUseCase;
  private updateProfileUseCase: UpdateProfileUseCase;
  private changePasswordUseCase: ChangePasswordUseCase;
  private authService: AuthService;
  private redisService: RedisService;
  private emailService: EmailService;

  constructor() {
    this.redisService = new RedisService();
    this.emailService = new EmailService();
    // Note: AuthService requires proper repository instances in a real implementation
    // For now, we'll create a basic instance for refresh token functionality
    this.authService = new AuthService(
      null as any,
      null as any,
      this.redisService,
      this.emailService
    );
    this.registerUseCase = new RegisterUseCase();
    this.loginUseCase = new LoginUseCase();
    this.forgotPasswordUseCase = new ForgotPasswordUseCase(
      undefined,
      undefined,
      this.redisService,
      this.emailService
    );
    this.verifyOTPUseCase = new VerifyOTPUseCase(undefined, undefined, this.redisService);
    this.setPasswordUseCase = new SetPasswordUseCase(undefined, undefined, this.redisService);
    this.updateProfileUseCase = new UpdateProfileUseCase();
    this.changePasswordUseCase = new ChangePasswordUseCase();
  }

  register = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { firstName, lastName, email, password, role } = req.body;

    const result = await this.registerUseCase.execute({
      firstName,
      lastName,
      email,
      password,
      role,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  });

  login = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    const result = await this.loginUseCase.execute({
      email,
      password,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  });

  refreshToken = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
      return;
    }

    try {
      // Use AuthService to refresh the access token
      const result = await this.authService.refreshAccessToken(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: result,
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }
  });

  forgotPassword = errorMiddleware.catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const { email } = req.body;

      const result = await this.forgotPasswordUseCase.execute({
        email,
      });

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          otpExpiresAt: result.otpExpiresAt,
        },
      });
    }
  );

  verifyOTP = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { email, otp } = req.body;

    const result = await this.verifyOTPUseCase.execute({
      email,
      otp,
    });

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        resetToken: result.resetToken,
      },
    });
  });

  resetPassword = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { resetToken, newPassword, email } = req.body;

    const result = await this.setPasswordUseCase.execute({
      email,
      resetToken,
      newPassword,
    });

    res.status(200).json({
      success: true,
      message: result.message,
    });
  });

  me = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    // This would typically get user info from the authenticated user
    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: req.user,
    });
  });

  uploadProfileImage = errorMiddleware.catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.id;
      const file = req.file;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      if (!file) {
        res.status(400).json({
          success: false,
          message: 'No image file provided',
        });
        return;
      }

      try {
        // Process image with Sharp to resize to 200x200
        const processedImageBuffer = await sharp(file.path)
          .resize(200, 200, {
            fit: 'cover',
            position: 'center',
          })
          .jpeg({ quality: 80 })
          .toBuffer();

        // Generate new filename for processed image
        const processedFileName = `processed-${Date.now()}.jpg`;
        const processedFilePath = path.join(path.dirname(file.path), processedFileName);

        // Write processed image
        fs.writeFileSync(processedFilePath, processedImageBuffer);

        // Delete original uploaded file
        fs.unlinkSync(file.path);

        // Here you would typically save the processed image path to database
        // For now, return success with file info
        res.status(200).json({
          success: true,
          message: 'Profile image uploaded and processed successfully',
          data: {
            imageUrl: `/uploads/profiles/${userId}/${processedFileName}`,
            filename: processedFileName,
            originalName: file.originalname,
            size: processedImageBuffer.length,
            processed: true,
          },
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Failed to process image',
        });
      }
    }
  );

  updateProfile = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { firstName, lastName, email } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const result = await this.updateProfileUseCase.execute(userId, {
      firstName,
      lastName,
      email,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: result,
    });
  });

  changePassword = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const result = await this.changePasswordUseCase.execute(userId, {
      currentPassword,
      newPassword,
    });

    res.status(200).json({
      success: true,
      message: result.message,
    });
  });
}
