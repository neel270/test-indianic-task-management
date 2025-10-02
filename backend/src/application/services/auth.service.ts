import { TaskRepositoryImpl } from './../../infrastructure/repositories/task.repository.impl';
import { UserRepositoryImpl } from './../../infrastructure/repositories/user.repository.impl';
import { EmailService } from './../../infrastructure/services/email.service';
import { RedisService } from './../../infrastructure/services/redis.service';
import { ITaskRepository } from '../../domain/repositories/task.repository';
import { IUserRepository } from '../../domain/repositories/user.repository';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { UserEntity } from '../../domain/entities';
import { Email } from '../../domain/value-objects/email.vo';
import { env } from '../../infrastructure/config';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface OTPData {
  otp: string;
  expiresAt: Date;
}

export class AuthService {
  private readonly otpExpiresIn: number = 10 * 60 * 1000; // 10 minutes
  private readonly otpLength: number = 6;
  private readonly resetTokenLength: number = 32;
  private readonly saltRounds: number = 12;
  private readonly resetTokenExpiresIn: number = 60 * 60; // 1 hour in seconds

  // Error messages
  private readonly ERROR_MESSAGES = {
    USER_NOT_FOUND: 'User not found',
    INVALID_CREDENTIALS: 'Invalid credentials',
    INVALID_REFRESH_TOKEN: 'Invalid refresh token',
    INVALID_RESET_TOKEN: 'Invalid reset token',
    INVALID_ACCESS_TOKEN: 'Invalid access token',
    USER_ALREADY_EXISTS: 'User already exists with this email',
    ACCOUNT_DEACTIVATED: 'Account is deactivated',
    OTP_EXPIRED: 'OTP has expired',
    RESET_TOKEN_EXPIRED: 'Reset token has expired',
    INVALID_OR_EXPIRED_OTP: 'Invalid or expired OTP',
    CURRENT_PASSWORD_INCORRECT: 'Current password is incorrect',
    REDIS_NOT_AVAILABLE: 'Redis service not available',
    DEPRECATED_METHOD: 'This method is deprecated. Please use resetPasswordWithEmail instead.',
  } as const;
  private userRepository: IUserRepository;
  private taskRepository: ITaskRepository;
  private redisService: RedisService;
  private emailService: EmailService;

  constructor() {
    this.userRepository = new UserRepositoryImpl();
    this.taskRepository = new TaskRepositoryImpl();
    this.redisService = new RedisService();
    this.emailService = new EmailService();
  }

  async registerUser(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: 'admin' | 'user' = 'user'
  ): Promise<UserEntity> {
    const emailVo = Email.create(email);

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(emailVo);
    if (existingUser) {
      throw new Error(this.ERROR_MESSAGES.USER_ALREADY_EXISTS);
    }

    // Hash password
    // Create user entity
    const user = UserEntity.create({
      firstName,
      lastName,
      email: emailVo.getValue(),
      password,
      role,
      isActive: true,
    });

    // Save user
    return await this.userRepository.save(user);
  }

  async loginUser(
    email: string,
    password: string
  ): Promise<{ user: UserEntity; tokens: AuthTokens }> {
    const emailVo = Email.create(email);

    // Find user by email
    const user = await this.userRepository.findByEmail(emailVo);
    console.log('Login attempt for email:', email);
    console.log('User found:', user ? user.email : 'No user found');
    console.log('User password hash:', user);
    if (!user) {
      throw new Error(this.ERROR_MESSAGES.INVALID_CREDENTIALS);
    }
    console.log('User is active:', user.isActive);

    // Check if user is active
    if (!user.isActive) {
      throw new Error(this.ERROR_MESSAGES.ACCOUNT_DEACTIVATED);
    }
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid);
    if (!isPasswordValid) {
      throw new Error(this.ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return { user, tokens };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      // Verify refresh token
      const payload = jwt.verify(refreshToken, env.jwtRefreshSecret) as { userId: string };

      // Find user
      const user = await this.userRepository.findById(payload.userId);
      if (!user?.isActive) {
        throw new Error(this.ERROR_MESSAGES.INVALID_REFRESH_TOKEN);
      }

      // Generate new access token
      // @ts-ignore - JWT library has complex type definitions
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        env.jwtSecret,
        { expiresIn: env.jwtExpiresIn }
      );

      return { accessToken };
    } catch {
      throw new Error(this.ERROR_MESSAGES.INVALID_REFRESH_TOKEN);
    }
  }

  async generatePasswordResetOTP(email: string): Promise<OTPData> {
    const emailVo = Email.create(email);

    // Check if user exists
    const user = await this.userRepository.findByEmail(emailVo);
    if (!user) {
      throw new Error(this.ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // Generate OTP
    const otp = crypto.randomInt(10 ** (this.otpLength - 1), 10 ** this.otpLength).toString();
    const expiresAt = new Date(Date.now() + this.otpExpiresIn);

    // Store OTP in Redis with expiration
    if (this.redisService) {
      const otpKey = `password_reset_otp:${email}`;
      await this.redisService.setCache(
        otpKey,
        {
          otp,
          email,
          userId: user.id,
          expiresAt: expiresAt.toISOString(),
        },
        this.otpExpiresIn / 1000
      ); // Convert to seconds for Redis TTL
    }

    // Send OTP via email
    if (this.emailService) {
      try {
        await this.emailService.sendEmail({
          to: email,
          subject: 'Password Reset OTP',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Password Reset Request</h2>
              <p>Hello ${user.firstName},</p>
              <p>You have requested to reset your password. Please use the following OTP to proceed:</p>
              <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
                <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
              </div>
              <p><strong>This OTP will expire in 10 minutes.</strong></p>
              <p>If you didn't request this password reset, please ignore this email.</p>
              <p>Best regards,<br>Task Management System</p>
            </div>
          `,
          text: `Hello ${user.firstName},

You have requested to reset your password. Please use the following OTP to proceed:

OTP: ${otp}

This OTP will expire in 10 minutes.

If you didn't request this password reset, please ignore this email.

Best regards,
Task Management System`,
        });
      } catch (error) {
        console.error('Failed to send OTP email:', error);
        // Don't throw error here, just log it - the OTP is still valid in Redis
      }
    }

    return { otp, expiresAt };
  }

  async verifyOTP(
    email: string,
    otp: string
  ): Promise<{ resetToken: string; hashedToken: string }> {
    const emailVo = Email.create(email);

    // Find user
    const user = await this.userRepository.findByEmail(emailVo);
    if (!user) {
      throw new Error(this.ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // Verify OTP from Redis
    if (!this.redisService) {
      throw new Error(this.ERROR_MESSAGES.REDIS_NOT_AVAILABLE);
    }

    const otpKey = `password_reset_otp:${email}`;
    const storedOTPData = await this.redisService.getCache(otpKey);

    if (!storedOTPData || storedOTPData.otp !== otp) {
      throw new Error(this.ERROR_MESSAGES.INVALID_OR_EXPIRED_OTP);
    }

    // Check if OTP has expired
    const expiresAt = new Date(storedOTPData.expiresAt);
    if (expiresAt < new Date()) {
      // Clean up expired OTP
      await this.redisService.deleteCache(otpKey);
      throw new Error(this.ERROR_MESSAGES.OTP_EXPIRED);
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(this.resetTokenLength).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Store reset token in Redis with expiration (1 hour)
    const resetTokenKey = `password_reset_token:${email}`;
    await this.redisService.setCache(
      resetTokenKey,
      {
        hashedToken,
        userId: user.id,
        email,
        expiresAt: new Date(Date.now() + this.resetTokenExpiresIn * 1000).toISOString(),
      },
      this.resetTokenExpiresIn
    );

    // Clean up used OTP
    await this.redisService.deleteCache(otpKey);

    return { resetToken, hashedToken };
  }

  async resetPassword(_resetToken: string, _newPassword: string): Promise<UserEntity> {
    // This method is deprecated in favor of resetPasswordWithEmail
    throw new Error(this.ERROR_MESSAGES.DEPRECATED_METHOD);
  }

  async resetPasswordWithEmail(
    email: string,
    resetToken: string,
    newPassword: string
  ): Promise<UserEntity> {
    if (!this.redisService) {
      throw new Error(this.ERROR_MESSAGES.REDIS_NOT_AVAILABLE);
    }

    // Hash the provided reset token to match against stored hash
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Get stored reset token data from Redis
    const resetTokenKey = `password_reset_token:${email}`;
    const storedResetTokenData = await this.redisService.getCache(resetTokenKey);

    if (!storedResetTokenData || storedResetTokenData.hashedToken !== hashedToken) {
      throw new Error(this.ERROR_MESSAGES.INVALID_RESET_TOKEN);
    }

    // Check if reset token has expired
    const expiresAt = new Date(storedResetTokenData.expiresAt);
    if (expiresAt < new Date()) {
      // Clean up expired reset token
      await this.redisService.deleteCache(resetTokenKey);
      throw new Error(this.ERROR_MESSAGES.RESET_TOKEN_EXPIRED);
    }

    // Find user
    const emailVo = Email.create(email);
    const user = await this.userRepository.findByEmail(emailVo);
    if (!user) {
      throw new Error(this.ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, this.saltRounds);

    // Update user password
    const updatedUser = await this.userRepository.update(user.id, {
      ...user,
      password: hashedPassword,
    });

    // Clean up used reset token
    await this.redisService.deleteCache(resetTokenKey);

    return updatedUser;
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error(this.ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new Error(this.ERROR_MESSAGES.CURRENT_PASSWORD_INCORRECT);
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, this.saltRounds);

    // Update user password
    return await this.userRepository.update(user.id, {
      ...user,
      password: hashedNewPassword,
    });
  }

  async generateTokens(user: UserEntity): Promise<AuthTokens> {
    // @ts-ignore - JWT library has complex type definitions
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn }
    );

    // @ts-ignore - JWT library has complex type definitions
    const refreshToken = jwt.sign({ userId: user.id }, env.jwtRefreshSecret, {
      expiresIn: env.jwtRefreshExpiresIn,
    });

    return { accessToken, refreshToken };
  }

  async verifyAccessToken(token: string): Promise<{ userId: string; email: string; role: string }> {
    try {
      const payload = jwt.verify(token, env.jwtSecret) as {
        userId: string;
        email: string;
        role: string;
      };
      return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      };
    } catch {
      throw new Error(this.ERROR_MESSAGES.INVALID_ACCESS_TOKEN);
    }
  }

  async getUserWithStats(userId: string): Promise<{
    user: UserEntity;
    stats: {
      totalTasks: number;
      completedTasks: number;
      pendingTasks: number;
      overdueTasks: number;
    };
  }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error(this.ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // Get user tasks with pagination (page 1, limit 1000 for stats)
    const { tasks, total } = await this.taskRepository.findByUserId(userId, 1, 1000);

    const completedTasks = tasks.filter(task => task.status === 'Completed').length;
    const pendingTasks = tasks.filter(task => task.status === 'Pending').length;
    const overdueTasks = tasks.filter(task => task.isOverdue()).length;

    return {
      user,
      stats: {
        totalTasks: total,
        completedTasks,
        pendingTasks,
        overdueTasks,
      },
    };
  }
}
