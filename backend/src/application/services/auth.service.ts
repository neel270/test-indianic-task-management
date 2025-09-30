import { UserEntity } from '@/domain/entities/user.entity';
import { ITaskRepository } from '@/domain/repositories/task.repository';
import { IUserRepository } from '@/domain/repositories/user.repository';
import { Email } from '@/domain/value-objects/email.vo';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface OTPData {
  otp: string;
  expiresAt: Date;
}

export class AuthService {
  private readonly jwtSecret: jwt.Secret;
  private readonly jwtRefreshSecret: jwt.Secret;
  private readonly jwtExpiresIn: string;
  private readonly jwtRefreshExpiresIn: string;
  private readonly otpExpiresIn: number = 10 * 60 * 1000; // 10 minutes

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly taskRepository: ITaskRepository
  ) {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '15m';
    this.jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  }

  async registerUser(email: string, password: string, name: string, role: 'admin' | 'user' = 'user'): Promise<UserEntity> {
    const emailVo = Email.create(email);

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(emailVo);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user entity
    const user = UserEntity.create({
      name,
      email: emailVo.getValue(),
      password: hashedPassword,
      role,
      isActive: true
    });

    // Save user
    return await this.userRepository.save(user);
  }

  async loginUser(email: string, password: string): Promise<{ user: UserEntity; tokens: AuthTokens }> {
    const emailVo = Email.create(email);

    // Find user by email
    const user = await this.userRepository.findByEmail(emailVo);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return { user, tokens };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      // Verify refresh token
      const payload = jwt.verify(refreshToken, this.jwtRefreshSecret) as any;

      // Find user
      const user = await this.userRepository.findById(payload.userId);
      if (!user || !user.isActive) {
        throw new Error('Invalid refresh token');
      }

      // Generate new access token
      // @ts-ignore - JWT library has complex type definitions
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        this.jwtSecret,
        { expiresIn: this.jwtExpiresIn }
      );

      return { accessToken };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async generatePasswordResetOTP(email: string): Promise<OTPData> {
    const emailVo = Email.create(email);

    // Check if user exists
    const user = await this.userRepository.findByEmail(emailVo);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + this.otpExpiresIn);

    // In a real application, you would store this OTP in Redis or database
    // For now, we'll return it (in production, send via email)
    return { otp, expiresAt };
  }

  async verifyOTP(email: string, otp: string): Promise<{ resetToken: string }> {
    const emailVo = Email.create(email);

    // Find user
    const user = await this.userRepository.findByEmail(emailVo);
    if (!user) {
      throw new Error('User not found');
    }

    // In a real application, you would verify the OTP from Redis/database
    // For now, we'll simulate OTP verification
    const storedOTP = process.env.DEMO_OTP; // In production, get from Redis
    if (otp !== storedOTP) {
      throw new Error('Invalid or expired OTP');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // In production, store hashedToken in database with expiration
    return { resetToken };
  }

  async resetPassword(resetToken: string, newPassword: string): Promise<UserEntity> {
    // In production, verify the reset token from database
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Find user by reset token (in production, query database)
    // For demo purposes, we'll assume the token is valid
    const user = await this.userRepository.findById('demo-user-id');
    if (!user) {
      throw new Error('Invalid reset token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    return await this.userRepository.update(user.id, {
      ...user,
      password: hashedPassword
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    return await this.userRepository.update(user.id, {
      ...user,
      password: hashedNewPassword
    });
  }

  async generateTokens(user: UserEntity): Promise<AuthTokens> {
    // @ts-ignore - JWT library has complex type definitions
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn }
    );

    // @ts-ignore - JWT library has complex type definitions
    const refreshToken = jwt.sign(
      { userId: user.id },
      this.jwtRefreshSecret,
      { expiresIn: this.jwtRefreshExpiresIn }
    );

    return { accessToken, refreshToken };
  }

  async verifyAccessToken(token: string): Promise<{ userId: string; email: string; role: string }> {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as any;
      return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role
      };
    } catch (error) {
      throw new Error('Invalid access token');
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
      throw new Error('User not found');
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
        overdueTasks
      }
    };
  }
}
