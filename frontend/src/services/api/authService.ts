import {
  ApiResponse,
  ChangePasswordRequest,
  CreateUserRequest,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  RegisterResponse,
  SetNewPasswordRequest,
  SetNewPasswordResponse,
  VerifyOtpRequest,
  VerifyOtpResponse
} from '@/types/api';
import { apiClient } from './apiClient';

/**
 * Authentication Service
 * Handles all authentication related API calls including login, registration,
 * password management, and token handling.
 *
 * This service provides a centralized way to manage user authentication state
 * and communicate with the backend authentication endpoints. It automatically
 * handles token storage in localStorage and API client configuration.
 *
 * @example
 * ```typescript
 * // Login user
 * try {
 *   const response = await AuthService.login({
 *     email: 'user@example.com',
 *     password: 'password123'
 *   });
 *   logger.info('User logged in successfully', response.user);
 * } catch (error) {
 *   console.error('Login failed:', error.message);
 * }
 *
 * // Check authentication status
 * if (AuthService.isAuthenticated()) {
 *   const token = AuthService.getToken();
 *   logger.info('User authentication status checked', { isAuthenticated: true, hasToken: !!token });
 * }
 * ```
 */
export class AuthService {
  /**
   * Login user with email and password
   *
   * Authenticates a user against the backend API and stores the returned
   * JWT token in localStorage for subsequent API calls.
   *
   * @param credentials - User login credentials containing email and password
   * @returns Promise resolving to login response with user data and token
   * @throws Error if login fails or API returns an error
   *
   * @example
   * ```typescript
   * const response = await AuthService.login({
   *   email: 'john.doe@example.com',
   *   password: 'securePassword123'
   * });
   * logger.info('User registered successfully', { userName: response.user.name });
   * ```
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    if (response.success && response.data) {
      // Store token in localStorage
      localStorage.setItem('authToken', response.data.token);
      apiClient.setToken(response.data.token);
      return response.data;
    }
    throw new Error(response.message || 'Login failed');
  }

  /**
   * Register new user
   */
  static async register(userData: CreateUserRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>('/auth/register', userData);
    if (response.success && response.data) {
      // Store token in localStorage
      localStorage.setItem('authToken', response.data.token);
      apiClient.setToken(response.data.token);
      return response.data;
    }
    throw new Error(response.message || 'Registration failed');
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    localStorage.removeItem('authToken');
    apiClient.setToken(null);
  }

  /**
   * Get current user profile
   */
  static async getProfile(): Promise<ApiResponse> {
    return apiClient.get('/auth/profile');
  }

  /**
   * Change user password
   */
  static async changePassword(passwordData: ChangePasswordRequest): Promise<ApiResponse> {
    return apiClient.put('/auth/change-password', passwordData);
  }

  /**
   * Initialize auth state from stored token
   *
   * Should be called on application startup to restore authentication
   * state from a previously stored token in localStorage.
   *
   * @example
   * ```typescript
   * // In main.tsx or App.tsx
   * AuthService.initializeAuth();
   * ```
   */
  static initializeAuth(): void {
    const token = localStorage.getItem('authToken');
    if (token) {
      apiClient.setToken(token);
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  /**
   * Get stored auth token
   */
  static getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  /**
   * Forgot password - send OTP to email
   */
  static async forgotPassword(emailData: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    const response = await apiClient.post<ForgotPasswordResponse>('/auth/forgot-password', emailData);
    if (response.success) {
      return response.data!;
    }
    throw new Error(response.message || 'Failed to send OTP');
  }

  /**
   * Verify OTP for password reset
   */
  static async verifyOtp(otpData: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    const response = await apiClient.post<VerifyOtpResponse>('/auth/verify-otp', otpData);
    if (response.success) {
      return response.data!;
    }
    throw new Error(response.message || 'Failed to verify OTP');
  }

  /**
   * Set new password using reset token
   */
  static async setNewPassword(passwordData: SetNewPasswordRequest): Promise<SetNewPasswordResponse> {
    const response = await apiClient.post<SetNewPasswordResponse>('/auth/set-password', passwordData);
    if (response.success) {
      return response.data!;
    }
    throw new Error(response.message || 'Failed to set new password');
  }
}
