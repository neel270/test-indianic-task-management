// User DTOs for validation schemas
export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
  profileImage?: string;
}

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface UpdateUserDto {
  firstName: string;
  lastName: string;
  email?: string;
  role?: 'admin' | 'user';
  isActive?: boolean;
  profileImage?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface VerifyOtpDto {
  email: string;
  otp: string;
}

export interface SetNewPasswordDto {
  resetToken: string;
  newPassword: string;
}

export interface ResetPasswordWithEmailDto {
  email: string;
  resetToken: string;
  newPassword: string;
}

export interface UploadProfileImageDto {
  profileImage: string; // This will be handled by multer
}

export interface UserFiltersDto {
  role?: 'admin' | 'user';
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}
