// User DTOs for validation schemas
export interface CreateUserDto {
  name: string;
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
  name?: string;
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

export interface UploadProfileImageDto {
  profileImage: string; // This will be handled by multer
}
