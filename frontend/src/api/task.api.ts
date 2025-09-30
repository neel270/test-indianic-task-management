import {
  CreateTaskRequest,
  Task,
  TaskFilters,
  TaskListResponse,
  UpdateTaskRequest,
} from '../types/task';
import axiosInstance from './axiosInstance';

export const taskApi = {
  // Get all tasks with optional filters
  getTasks: async (
    page: number = 1,
    limit: number = 10,
    filters?: TaskFilters
  ): Promise<TaskListResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach((item) => params.append(key, item));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await axiosInstance.get<TaskListResponse>(`/tasks?${params}`);
    return response.data;
  },

  // Get single task by ID
  getTask: async (id: string): Promise<Task> => {
    const response = await axiosInstance.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  // Create new task
  createTask: async (data: CreateTaskRequest): Promise<Task> => {
    const response = await axiosInstance.post<Task>('/tasks', data);
    return response.data;
  },

  // Update existing task
  updateTask: async (id: string, data: UpdateTaskRequest): Promise<Task> => {
    const response = await axiosInstance.put<Task>(`/tasks/${id}`, data);
    return response.data;
  },

  // Delete task
  deleteTask: async (id: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete<{ message: string }>(`/tasks/${id}`);
    return response.data;
  },

  // Assign task to user
  assignTask: async (id: string, userId: string): Promise<Task> => {
    const response = await axiosInstance.patch<Task>(`/tasks/${id}/assign`, {
      userId,
    });
    return response.data;
  },

  // Update task status
  updateTaskStatus: async (id: string, status: string): Promise<Task> => {
    const response = await axiosInstance.patch<Task>(`/tasks/${id}/status`, {
      status,
    });
    return response.data;
  },

  // Add attachment to task
  addAttachment: async (id: string, file: File): Promise<Task> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post<Task>(`/tasks/${id}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Remove attachment from task
  removeAttachment: async (id: string, attachmentId: string): Promise<Task> => {
    const response = await axiosInstance.delete<Task>(`/tasks/${id}/attachments/${attachmentId}`);
    return response.data;
  },

  // Get task statistics
  getTaskStats: async (): Promise<{
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
    overdue: number;
  }> => {
    const response = await axiosInstance.get(`/tasks/stats`);
    return response.data;
  },
};
