import apiClient from '@/lib/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toastError, toastSuccess } from './use-toast';
import { User } from '@/types/api';

// Re-export User type from api types
export type { User } from '@/types/api';


interface UserFilters {
  role?: string;
  isActive?: boolean | null;
  search?: string;
}

interface PaginationParams {
  page?: number;
  limit?: number;
}

interface PaginatedResponse {
  data: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    totalItems: number;
  };
}

// User API hooks
export const useUsers = (params?: PaginationParams & UserFilters) => {
  return useQuery({
    queryKey: ['users', 'list', params],
    queryFn: async (): Promise<PaginatedResponse> => {
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
        queryParams.isActive = params.isActive ? 'true' : 'false';
      }
      if (params?.search) {
        queryParams.search = params.search;
      }

      const response = await apiClient.get<PaginatedResponse>('/users', { params: queryParams });
      // The backend returns { data: PaginatedTasksResult }, but we need to extract it
      const backendResponse = response.data as any;
      return {
        data: backendResponse.data.data || [],
        pagination: backendResponse.data.pagination || {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
          totalItems: 0,
        },
      };
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

