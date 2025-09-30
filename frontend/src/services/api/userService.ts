import { apiClient } from './apiClient';
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  PaginationParams,
  PaginatedResponse,
  UserFilters,
  ApiResponse
} from '@/types/api';

/**
 * User Service
 * Handles all user management related API calls
 */
export class UserService {
  /**
   * Get all users with pagination and filters
   */
  static async getUsers(
    params?: PaginationParams & UserFilters
  ): Promise<PaginatedResponse<User>> {
    const queryParams: Record<string, string> = {};

    if (params?.page) queryParams.page = params.page.toString();
    if (params?.limit) queryParams.limit = params.limit.toString();
    if (params?.role) queryParams.role = params.role;
    if (params?.isActive !== undefined) queryParams.isActive = params.isActive.toString();
    if (params?.search) queryParams.search = params.search;

    const response = await apiClient.get<PaginatedResponse<User>>('/auth/users', queryParams);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch users');
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string): Promise<User> {
    const response = await apiClient.get<User>(`/auth/users/${id}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch user');
  }

  /**
   * Create new user
   */
  static async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await apiClient.post<User>('/auth/users', userData);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to create user');
  }

  /**
   * Update user
   */
  static async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    const response = await apiClient.put<User>(`/auth/users/${id}`, userData);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to update user');
  }

  /**
   * Delete user
   */
  static async deleteUser(id: string): Promise<ApiResponse> {
    return apiClient.delete(`/auth/users/${id}`);
  }

  /**
   * Toggle user active status
   */
  static async toggleUserStatus(id: string): Promise<User> {
    const response = await apiClient.put<User>(`/auth/users/${id}/status`, {});
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to toggle user status');
  }

  /**
   * Get users by role
   */
  static async getUsersByRole(role: 'admin' | 'user'): Promise<User[]> {
    const response = await apiClient.get<User[]>(`/auth/users/role/${role}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch users by role');
  }

  /**
   * Get user statistics
   */
  static async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    admins: number;
    users: number;
  }> {
    const [allUsers, activeUsers, adminUsers] = await Promise.all([
      this.getUsers({ limit: 1000 }),
      this.getUsers({ limit: 1000, isActive: true }),
      this.getUsersByRole('admin')
    ]);

    return {
      total: allUsers.pagination.total,
      active: activeUsers.pagination.total,
      inactive: allUsers.pagination.total - activeUsers.pagination.total,
      admins: adminUsers.length,
      users: allUsers.pagination.total - adminUsers.length
    };
  }
}