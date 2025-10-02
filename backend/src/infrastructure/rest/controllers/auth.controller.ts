import { ForgotPasswordUseCase } from '../../../application/use-cases/auth/forgot-password/forgot-password.usecase';
import { SetPasswordUseCase } from '../../../application/use-cases/auth/forgot-password/set-password.usecase';
import { VerifyOTPUseCase } from '../../../application/use-cases/auth/forgot-password/verify-otp.usecase';
import { LoginUseCase } from '../../../application/use-cases/auth/login.usecase';
import { RegisterUseCase } from '../../../application/use-cases/auth/register.usecase';
import { UpdateProfileUseCase } from '../../../application/use-cases/user/update-profile.usecase';
import { ChangePasswordUseCase } from '../../../application/use-cases/user/change-password.usecase';
import { UploadProfileImageUseCase } from '../../../application/use-cases/user/upload-profile-image.usecase';
import { AuthService } from '../../../application/services/auth.service';
import { Request, Response } from 'express';
import { errorMiddleware } from '../../middlewares/error.middleware';
import { ResponseUtil } from '../../utils/response.util';

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *       properties:
 *         firstName:
 *           type: string
 *           example: "John"
 *         lastName:
 *           type: string
 *           example: "Doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "john.doe@example.com"
 *         password:
 *           type: string
 *           format: password
 *           example: "password123"
 *         role:
 *           type: string
 *           enum: [admin, user]
 *           example: "user"
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "john.doe@example.com"
 *         password:
 *           type: string
 *           format: password
 *           example: "password123"
 *     RefreshTokenRequest:
 *       type: object
 *       required:
 *         - refreshToken
 *       properties:
 *         refreshToken:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     ForgotPasswordRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "john.doe@example.com"
 *     VerifyOTPRequest:
 *       type: object
 *       required:
 *         - email
 *         - otp
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "john.doe@example.com"
 *         otp:
 *           type: string
 *           example: "123456"
 *     ResetPasswordRequest:
 *       type: object
 *       required:
 *         - resetToken
 *         - newPassword
 *         - email
 *       properties:
 *         resetToken:
 *           type: string
 *           example: "reset-token-here"
 *         newPassword:
 *           type: string
 *           format: password
 *           example: "newpassword123"
 *         email:
 *           type: string
 *           format: email
 *           example: "john.doe@example.com"
 *     UpdateProfileRequest:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *       properties:
 *         firstName:
 *           type: string
 *           example: "John"
 *         lastName:
 *           type: string
 *           example: "Doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "john.doe@example.com"
 *     ChangePasswordRequest:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           format: password
 *           example: "oldpassword123"
 *         newPassword:
 *           type: string
 *           format: password
 *           example: "newpassword123"
 *     AuthResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         refreshToken:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               example: "507f1f77bcf86cd799439011"
 *             firstName:
 *               type: string
 *               example: "John"
 *             lastName:
 *               type: string
 *               example: "Doe"
 *             email:
 *               type: string
 *               example: "john.doe@example.com"
 *             role:
 *               type: string
 *               enum: [admin, user]
 *               example: "user"
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         firstName:
 *           type: string
 *           example: "John"
 *         lastName:
 *           type: string
 *           example: "Doe"
 *         email:
 *           type: string
 *           example: "john.doe@example.com"
 *         role:
 *           type: string
 *           enum: [admin, user]
 *           example: "user"
 *         profileImage:
 *           type: string
 *           example: "https://example.com/uploads/profile.jpg"
 *         isActive:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-01-01T00:00:00.000Z"
 *     MessageResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Operation completed successfully"
 *         data:
 *           type: object
 *           nullable: true
 */

export class AuthController {
  private registerUseCase: RegisterUseCase;
  private loginUseCase: LoginUseCase;
  private forgotPasswordUseCase: ForgotPasswordUseCase;
  private verifyOTPUseCase: VerifyOTPUseCase;
  private setPasswordUseCase: SetPasswordUseCase;
  private updateProfileUseCase: UpdateProfileUseCase;
  private changePasswordUseCase: ChangePasswordUseCase;
  private uploadProfileImageUseCase: UploadProfileImageUseCase;
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
    this.registerUseCase = new RegisterUseCase();
    this.loginUseCase = new LoginUseCase();
    this.forgotPasswordUseCase = new ForgotPasswordUseCase();
    this.verifyOTPUseCase = new VerifyOTPUseCase();
    this.setPasswordUseCase = new SetPasswordUseCase();
    this.updateProfileUseCase = new UpdateProfileUseCase();
    this.changePasswordUseCase = new ChangePasswordUseCase();
    this.uploadProfileImageUseCase = new UploadProfileImageUseCase();
  }

  /**
   * @swagger
   * /api/v1/auth/register:
   *   post:
   *     tags:
   *       - Authentication
   *     summary: Register a new user
   *     description: Create a new user account with the provided information
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RegisterRequest'
   *     responses:
   *       201:
   *         description: User registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "User registered successfully"
   *                 data:
   *                   $ref: '#/components/schemas/AuthResponse'
   *       400:
   *         description: Bad request - validation error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: "Validation failed"
   *                 data:
   *                   type: object
   *                   nullable: true
   */
  register = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { firstName, lastName, email, password, role } = req.body;

    const result = await this.registerUseCase.execute({
      firstName,
      lastName,
      email,
      password,
      role,
    });

    ResponseUtil.created(res, result, 'User registered successfully');
  });

  /**
   * @swagger
   * /api/v1/auth/login:
   *   post:
   *     tags:
   *       - Authentication
   *     summary: Login user
   *     description: Authenticate user with email and password
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginRequest'
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Login successful"
   *                 data:
   *                   $ref: '#/components/schemas/AuthResponse'
   *       401:
   *         description: Unauthorized - invalid credentials
   */
  login = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    const result = await this.loginUseCase.execute({
      email,
      password,
    });

    ResponseUtil.success(res, result, 'Login successful');
  });

  /**
   * @swagger
   * /api/v1/auth/refresh:
   *   post:
   *     tags:
   *       - Authentication
   *     summary: Refresh access token
   *     description: Get a new access token using refresh token
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RefreshTokenRequest'
   *     responses:
   *       200:
   *         description: Token refreshed successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Token refreshed successfully"
   *                 data:
   *                   $ref: '#/components/schemas/AuthResponse'
   *       401:
   *         description: Unauthorized - invalid refresh token
   */
  refreshToken = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      ResponseUtil.badRequest(res, 'Refresh token is required');
      return;
    }

    try {
      // Use AuthService to refresh the access token
      const result = await this.authService.refreshAccessToken(refreshToken);

      ResponseUtil.success(res, result, 'Token refreshed successfully');
    } catch {
      ResponseUtil.error(res, 'Invalid refresh token', 401);
    }
  });

  /**
   * @swagger
   * /api/v1/auth/forgot-password:
   *   post:
   *     tags:
   *       - Authentication
   *     summary: Request password reset
   *     description: Send OTP to email for password reset
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ForgotPasswordRequest'
   *     responses:
   *       200:
   *         description: OTP sent successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "OTP sent to your email"
   *                 data:
   *                   type: object
   *                   properties:
   *                     otpExpiresAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2023-01-01T00:30:00.000Z"
   */
  forgotPassword = errorMiddleware.catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const { email } = req.body;

      const result = await this.forgotPasswordUseCase.execute({
        email,
      });

      ResponseUtil.success(res, { otpExpiresAt: result.otpExpiresAt }, result.message);
    }
  );

  /**
   * @swagger
   * /api/v1/auth/verify-otp:
   *   post:
   *     tags:
   *       - Authentication
   *     summary: Verify OTP
   *     description: Verify the OTP sent to email for password reset
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/VerifyOTPRequest'
   *     responses:
   *       200:
   *         description: OTP verified successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "OTP verified successfully"
   *                 data:
   *                   type: object
   *                   properties:
   *                     resetToken:
   *                       type: string
   *                       example: "reset-token-here"
   */
  verifyOTP = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { email, otp } = req.body;

    const result = await this.verifyOTPUseCase.execute({
      email,
      otp,
    });

    ResponseUtil.success(res, { resetToken: result.resetToken }, result.message);
  });

  /**
   * @swagger
   * /api/v1/auth/reset-password:
   *   post:
   *     tags:
   *       - Authentication
   *     summary: Reset password
   *     description: Reset password using reset token and OTP verification
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ResetPasswordRequest'
   *     responses:
   *       200:
   *         description: Password reset successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Password reset successfully"
   *                 data:
   *                   type: object
   *                   nullable: true
   */
  resetPassword = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { resetToken, newPassword, email } = req.body;

    const result = await this.setPasswordUseCase.execute({
      email,
      resetToken,
      newPassword,
    });

    ResponseUtil.success(res, undefined, result.message);
  });

  /**
   * @swagger
   * /api/v1/auth/me:
   *   get:
   *     tags:
   *       - Authentication
   *     summary: Get current user profile
   *     description: Get the profile information of the currently authenticated user
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User profile retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "User profile retrieved successfully"
   *                 data:
   *                   $ref: '#/components/schemas/UserProfile'
   *       401:
   *         description: Unauthorized - user not authenticated
   */
  me = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    // This would typically get user info from the authenticated user
    ResponseUtil.success(res, req.user, 'User profile retrieved successfully');
  });

  /**
   * @swagger
   * /api/v1/auth/upload-profile-image:
   *   post:
   *     tags:
   *       - Authentication
   *     summary: Upload profile image
   *     description: Upload and process a new profile image for the authenticated user
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               profileImage:
   *                 type: string
   *                 format: binary
   *                 description: Image file to upload
   *     responses:
   *       200:
   *         description: Profile image uploaded successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Profile image uploaded and processed successfully"
   *                 data:
   *                   $ref: '#/components/schemas/UserProfile'
   *       401:
   *         description: Unauthorized - user not authenticated
   *       400:
   *         description: Bad request - no image file provided
   */
  uploadProfileImage = errorMiddleware.catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.id;
      const file = req.file;

      if (!userId) {
        ResponseUtil.unauthorized(res, 'User not authenticated');
        return;
      }

      if (!file) {
        ResponseUtil.badRequest(res, 'No image file provided');
        return;
      }

      try {
        const result = await this.uploadProfileImageUseCase.execute({
          userId,
          file,
        });

        ResponseUtil.success(res, result, 'Profile image uploaded and processed successfully');
      } catch (error) {
        ResponseUtil.error(
          res,
          error instanceof Error ? error.message : 'Failed to upload profile image'
        );
      }
    }
  );

  /**
   * @swagger
   * /api/v1/auth/profile:
   *   put:
   *     tags:
   *       - Authentication
   *     summary: Update user profile
   *     description: Update the profile information of the authenticated user
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateProfileRequest'
   *     responses:
   *       200:
   *         description: Profile updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Profile updated successfully"
   *                 data:
   *                   $ref: '#/components/schemas/UserProfile'
   *       401:
   *         description: Unauthorized - user not authenticated
   */
  updateProfile = errorMiddleware.catchAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { firstName, lastName, email } = req.body;

    if (!userId) {
      ResponseUtil.unauthorized(res, 'User not authenticated');
      return;
    }

    const result = await this.updateProfileUseCase.execute(userId, {
      firstName,
      lastName,
      email,
    });

    ResponseUtil.success(res, result, 'Profile updated successfully');
  });

  /**
   * @swagger
   * /api/v1/auth/change-password:
   *   put:
   *     tags:
   *       - Authentication
   *     summary: Change password
   *     description: Change the password for the authenticated user
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ChangePasswordRequest'
   *     responses:
   *       200:
   *         description: Password changed successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Password changed successfully"
   *                 data:
   *                   type: object
   *                   nullable: true
   *       401:
   *         description: Unauthorized - user not authenticated
   */
  changePassword = errorMiddleware.catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.id;
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
        ResponseUtil.unauthorized(res, 'User not authenticated');
        return;
      }

      const result = await this.changePasswordUseCase.execute(userId, {
        currentPassword,
        newPassword,
      });

      ResponseUtil.success(res, undefined, result.message);
    }
  );
}
