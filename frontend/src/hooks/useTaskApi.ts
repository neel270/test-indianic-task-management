import apiClient from '@/lib/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toastError, toastSuccess } from './use-toast';

// Types
export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  dueDate: string;
  userId: string;
  assignedTo: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  attachments?: string[];
  priority: 'Low' | 'Medium' | 'High';
  tags?: string[];
  file?: {
    filename: string;
    originalName: string;
    path: string;
    size: number;
    mimetype: string;
  };
}

interface CreateTaskRequest {
  title: string;
  description: string;
  dueDate: string; // ISO date string
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  priority?: 'Low' | 'Medium' | 'High';
  tags?: string[];
  assignedTo?: string;
  userId?: string;
}

interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  dueDate?: string;
}

interface TaskFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
}

interface TaskListResponse {
  data: Task[];
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

// Task API hooks
export const useTasks = (page: number = 1, limit: number = 10, filters?: TaskFilters) => {
  return useQuery({
    queryKey: ['tasks', 'list', page, limit, filters],
    queryFn: async (): Promise<TaskListResponse> => {
      const params: Record<string, string> = {
        page: page.toString(),
        limit: limit.toString(),
      };

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params[key] = value.toString();
          }
        });
      }

      const response = await apiClient.get<TaskListResponse>('/tasks', { params });
      console.log('useTasks - fetched data:', response.data);

      // The backend returns { data: PaginatedTasksResult }, but we need to extract it
      const backendResponse = response.data as any;
      return {
        data: backendResponse.data.tasks || [],
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

export const useTask = (id: string) => {
  return useQuery({
    queryKey: ['tasks', 'detail', id],
    queryFn: async (): Promise<Task> => {
      const response = await apiClient.get<Task>(`/tasks/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskData: CreateTaskRequest): Promise<Task> => {
      const response = await apiClient.post<Task>('/tasks', taskData);
      return response.data;
    },
    onSuccess: data => {
      // Invalidate and refetch tasks list
      void queryClient.invalidateQueries({ queryKey: ['tasks', 'list'] });

      // Add the new task to the cache
      queryClient.setQueryData(['tasks', 'detail', data.id], data);

      toastSuccess('Task created successfully!');
    },
    onError: (error: Error & { error: string }) => {
      toastError(error.message || error.error || 'Failed to create task');
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: UpdateTaskRequest;
    }): Promise<Task> => {
      const response = await apiClient.put<Task>(`/tasks/${id}`, updates);
      return response.data;
    },
    onSuccess: data => {
      // Update the task in cache
      queryClient.setQueryData(['tasks', 'detail', data.id], data);

      // Invalidate tasks list to refetch with updated data
      void queryClient.invalidateQueries({ queryKey: ['tasks', 'list'] });

      toastSuccess('Task updated successfully!');
    },
    onError: (error: Error) => {
      toastError(error.message || 'Failed to update task');
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<{ message: string }> => {
      const response = await apiClient.delete<{ message: string }>(`/tasks/${id}`);
      return response.data;
    },
    onSuccess: (data, taskId) => {
      // Remove the task from cache
      queryClient.removeQueries({ queryKey: ['tasks', 'detail', taskId] });

      // Invalidate tasks list to refetch without the deleted task
      void queryClient.invalidateQueries({ queryKey: ['tasks', 'list'] });

      toastSuccess(data.message || 'Task deleted successfully!');
    },
    onError: (error: Error) => {
      toastError(error.message || 'Failed to delete task');
    },
  });
};

export const useAssignTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }): Promise<Task> => {
      const response = await apiClient.patch<Task>(`/tasks/${id}/assign`, { userId });
      return response.data;
    },
    onSuccess: data => {
      // Update the task in cache
      queryClient.setQueryData(['tasks', 'detail', data.id], data);

      // Invalidate tasks list to refetch with updated data
      void queryClient.invalidateQueries({ queryKey: ['tasks', 'list'] });

      toastSuccess('Task assigned successfully!');
    },
    onError: (error: Error) => {
      toastError(error.message || 'Failed to assign task');
    },
  });
};

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }): Promise<Task> => {
      const response = await apiClient.patch<Task>(`/tasks/${id}/status`, { status });
      return response.data;
    },
    onSuccess: data => {
      // Update the task in cache
      queryClient.setQueryData(['tasks', 'detail', data.id], data);

      // Invalidate tasks list to refetch with updated data
      void queryClient.invalidateQueries({ queryKey: ['tasks', 'list'] });

      toastSuccess('Task status updated successfully!');
    },
    onError: (error: Error) => {
      toastError(error.message || 'Failed to update task status');
    },
  });
};

export const useAddTaskAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }): Promise<Task> => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post<Task>(`/tasks/${id}/attachments`, formData);
      return response.data;
    },
    onSuccess: data => {
      // Update the task in cache
      queryClient.setQueryData(['tasks', 'detail', data.id], data);

      // Invalidate tasks list to refetch with updated data
      void queryClient.invalidateQueries({ queryKey: ['tasks', 'list'] });

      toastSuccess('Attachment added successfully!');
    },
    onError: (error: Error) => {
      toastError(error.message || 'Failed to add attachment');
    },
  });
};

export const useRemoveTaskAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      attachmentId,
    }: {
      id: string;
      attachmentId: string;
    }): Promise<Task> => {
      const response = await apiClient.delete<Task>(`/tasks/${id}/attachments/${attachmentId}`);
      return response.data;
    },
    onSuccess: data => {
      // Update the task in cache
      queryClient.setQueryData(['tasks', 'detail', data.id], data);

      // Invalidate tasks list to refetch with updated data
      void queryClient.invalidateQueries({ queryKey: ['tasks', 'list'] });

      toastSuccess('Attachment removed successfully!');
    },
    onError: (error: Error) => {
      toastError(error.message || 'Failed to remove attachment');
    },
  });
};

export const useTaskStats = () => {
  return useQuery({
    queryKey: ['tasks', 'stats'],
    queryFn: async () => {
      const response = await apiClient.get('/tasks/stats');
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useExportTasksToCSV = () => {
  return useMutation({
    mutationFn: async (filters?: { status?: string; startDate?: string; endDate?: string }) => {
      // Validate filters before sending to API

      const params: Record<string, string> = {};

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params[key] = value.toString();
          }
        });
      }

      const response = await apiClient.get('/tasks/export/csv', {
        params,
        responseType: 'blob', // Important for file download
      });
      return response;
    },
    onSuccess: response => {
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      // Get filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'tasks_export.csv';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toastSuccess('Tasks exported successfully!');
    },
    onError: (error: Error) => {
      toastError(error.message || 'Failed to export tasks');
    },
  });
};
