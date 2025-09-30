import {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyOTPRequest,
} from '../types/user';
import axiosInstance from './axiosInstance';

export const authApi = {
  // User registration
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  // User login
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const response = await axiosInstance.post<{ accessToken: string }>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout');
  },

  // Forgot password
  forgotPassword: async (data: ForgotPasswordRequest): Promise<{ message: string }> => {
    const response = await axiosInstance.post<{ message: string }>('/auth/forgot-password', data);
    return response.data;
  },

  // Reset password
  resetPassword: async (data: ResetPasswordRequest): Promise<{ message: string }> => {
    const response = await axiosInstance.post<{ message: string }>('/auth/reset-password', data);
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (data: VerifyOTPRequest): Promise<{ message: string }> => {
    const response = await axiosInstance.post<{ message: string }>('/auth/verify-otp', data);
    return response.data;
  },

  // Get current user profile
  getProfile: async (): Promise<any> => {
    const response = await axiosInstance.get('/auth/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: any): Promise<any> => {
    const response = await axiosInstance.put('/auth/profile', data);
    return response.data;
  },

  // Change password
  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> => {
    const response = await axiosInstance.post<{ message: string }>('/auth/change-password', data);
    return response.data;
  },
};
