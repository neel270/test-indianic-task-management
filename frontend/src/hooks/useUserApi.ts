import apiClient from '@/lib/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toastError, toastSuccess } from './use-toast';
import { User } from '@/types/api';

// Re-export User type from api types
export type { User } from '@/types/api';

interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
}

interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: 'admin' | 'user';
  isActive?: boolean;
}

interface UserFilters {
  role?: string;
  isActive?: boolean;
  search?: string;
}

interface PaginationParams {
  page?: number;
  limit?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

// User API hooks
export const useUsers = (params?: PaginationParams & UserFilters) => {
  return useQuery({
    queryKey: ['users', 'list', params],
    queryFn: async (): Promise<PaginatedResponse<User>> => {
      const queryParams: Record<string, string> = {};

      if (params?.page) {
        queryParams.page = params.page.toString();
      }
      if (params?.limit) {
        queryParams.limit = params.limit.toString();
      }
      if (params?.role) {
        queryParams.role = params.role;
      }
      if (params?.isActive !== undefined) {
        queryParams.isActive = params.isActive.toString();
      }
      if (params?.search) {
        queryParams.search = params.search;
      }

      const response = await apiClient.get<PaginatedResponse<User>>('/auth/users', queryParams);
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['users', 'detail', id],
    queryFn: async (): Promise<User> => {
      const response = await apiClient.get<User>(`/auth/users/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: CreateUserRequest): Promise<User> => {
      const response = await apiClient.post<User>('/auth/users', userData);
      return response.data;
    },
    onSuccess: data => {
      // Invalidate and refetch users list
      void queryClient.invalidateQueries({ queryKey: ['users', 'list'] });

      // Add the new user to the cache
      queryClient.setQueryData(['users', 'detail', data.id], data);

      toastSuccess('User created successfully!');
    },
    onError: (error: Error) => {
      toastError(error.message || 'Failed to create user');
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      userData,
    }: {
      id: string;
      userData: UpdateUserRequest;
    }): Promise<User> => {
      const response = await apiClient.put<User>(`/auth/users/${id}`, userData);
      return response.data;
    },
    onSuccess: data => {
      // Update the user in cache
      queryClient.setQueryData(['users', 'detail', data.id], data);

      // Invalidate users list to refetch with updated data
      void queryClient.invalidateQueries({ queryKey: ['users', 'list'] });

      toastSuccess('User updated successfully!');
    },
    onError: (error: Error) => {
      toastError(error.message || 'Failed to update user');
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<{ message: string }> => {
      const response = await apiClient.delete<{ message: string }>(`/auth/users/${id}`);
      return response.data;
    },
    onSuccess: (data, userId) => {
      // Remove the user from cache
      queryClient.removeQueries({ queryKey: ['users', 'detail', userId] });

      // Invalidate users list to refetch without the deleted user
      void queryClient.invalidateQueries({ queryKey: ['users', 'list'] });

      toastSuccess(data.message || 'User deleted successfully!');
    },
    onError: (error: Error) => {
      toastError(error.message || 'Failed to delete user');
    },
  });
};

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<User> => {
      const response = await apiClient.put<User>(`/auth/users/${id}/status`, {});
      return response.data;
    },
    onSuccess: data => {
      // Update the user in cache
      queryClient.setQueryData(['users', 'detail', data.id], data);

      // Invalidate users list to refetch with updated data
      void queryClient.invalidateQueries({ queryKey: ['users', 'list'] });

      toastSuccess('User status updated successfully!');
    },
    onError: (error: Error) => {
      toastError(error.message || 'Failed to update user status');
    },
  });
};

export const useUsersByRole = (role: 'admin' | 'user') => {
  return useQuery({
    queryKey: ['users', 'role', role],
    queryFn: async (): Promise<User[]> => {
      const response = await apiClient.get<User[]>(`/auth/users/role/${role}`);
      return response.data;
    },
    enabled: !!role,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUserStats = () => {
  return useQuery({
    queryKey: ['users', 'stats'],
    queryFn: async () => {
      const response = await apiClient.get('/auth/users/stats');
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
