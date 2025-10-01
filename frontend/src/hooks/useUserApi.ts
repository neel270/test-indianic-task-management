import apiClient from '@/lib/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toastError, toastSuccess } from './use-toast';
import { User } from '@/types/api';

// Re-export User type from api types
export type { User } from '@/types/api';


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

      const response = await apiClient.get<PaginatedResponse<User>>('/users', queryParams);
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};



export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<User> => {
      const response = await apiClient.put<User>(`/users/${id}/status`, {});
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

