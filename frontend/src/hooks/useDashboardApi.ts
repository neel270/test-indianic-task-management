import apiClient from '@/lib/axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DashboardStats, Task } from '../types/task';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/slices/authSlice';
import { useSocketContext } from '../contexts/SocketContext';
import { useEffect } from 'react';

// Dashboard API hooks
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async (): Promise<DashboardStats> => {
      try {
        console.log('Fetching dashboard stats...');
        const response = await apiClient.get<{ success: boolean; message: string; data: DashboardStats }>(
          '/tasks/stats'
        );
        console.log('Dashboard stats response:', response);

        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to fetch dashboard stats');
        }
        return response.data.data;
      } catch (error: any) {
        console.error('Dashboard stats error:', error);
        if (error.response?.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: (failureCount, error: any) => {
      if (error.response?.status === 401 || error.response?.status === 403) {
        return false; // Don't retry auth errors
      }
      return failureCount < 2;
    },
  });
};

export const useRecentTasks = (limit: number = 5) => {
  return useQuery({
    queryKey: ['dashboard', 'recent-tasks', limit],
    queryFn: async (): Promise<Task[]> => {
      try {
        const response = await apiClient.get<{ success: boolean; message: string; data: any }>(
          '/tasks',
          {
            params: {
              limit,
              sortBy: 'createdAt',
              sortOrder: 'desc'
            }
          }
        );
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to fetch recent tasks');
        }

        // Extract tasks from the paginated response
        const backendResponse = response.data.data;
        return backendResponse.tasks || [];
      } catch (error: any) {
        console.error('Recent tasks error:', error);
        if (error.response?.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: (failureCount, error: any) => {
      if (error.response?.status === 401 || error.response?.status === 403) {
        return false; // Don't retry auth errors
      }
      return failureCount < 2;
    },
  });
};

export const useOverdueTasks = (limit: number = 5) => {
  return useQuery({
    queryKey: ['dashboard', 'overdue-tasks', limit],
    queryFn: async (): Promise<Task[]> => {
      try {
        // Get all tasks first, then filter for overdue ones
        const response = await apiClient.get<{ success: boolean; message: string; data: any }>(
          '/tasks',
          {
            params: {
              limit: 200, // Get more tasks to find overdue ones
              sortBy: 'dueDate',
              sortOrder: 'asc'
            }
          }
        );
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to fetch tasks for overdue filter');
        }

        // Extract tasks from the paginated response
        const backendResponse = response.data.data;
        const allTasks = backendResponse.tasks || [];

        // Filter for overdue tasks (status is not completed and due date is past)
        const overdueTasks = allTasks.filter((task: Task) => {
          return task.status !== 'Completed' &&
                 task.dueDate &&
                 new Date(task.dueDate) < new Date();
        });

        return overdueTasks.slice(0, limit);
      } catch (error: any) {
        console.error('Overdue tasks error:', error);
        if (error.response?.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: (failureCount, error: any) => {
      if (error.response?.status === 401 || error.response?.status === 403) {
        return false; // Don't retry auth errors
      }
      return failureCount < 2;
    },
  });
};

export const useDashboardData = () => {
  const statsQuery = useDashboardStats();
  const recentTasksQuery = useRecentTasks(5);
  const overdueTasksQuery = useOverdueTasks(5);
  const queryClient = useQueryClient();

  // Check if user is authenticated by looking for token
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Socket integration for real-time updates
  const { onTaskCreated, onTaskUpdated, isConnected } = useSocketContext();

  useEffect(() => {
    if (!isAuthenticated || !isConnected) return;

    // Handle real-time task creation
    const handleTaskCreated = (taskData: any) => {
      console.log('Real-time task created:', taskData);

      // Invalidate and refetch dashboard data
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      // Also invalidate task list queries to keep them in sync
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    };

    // Handle real-time task updates
    const handleTaskUpdated = (taskData: any) => {
      console.log('Real-time task updated:', taskData);

      // Invalidate and refetch dashboard data
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      // Also invalidate task list queries to keep them in sync
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    };

    // Set up socket event listeners
    onTaskCreated(handleTaskCreated);
    onTaskUpdated(handleTaskUpdated);

    // Cleanup function
    return () => {
      // Note: The socket context handles cleanup of event listeners
    };
  }, [isAuthenticated, isConnected, onTaskCreated, onTaskUpdated, queryClient]);

  return {
    stats: statsQuery.data,
    recentTasks: recentTasksQuery.data || [],
    overdueTasks: overdueTasksQuery.data || [],
    isLoading: statsQuery.isLoading || recentTasksQuery.isLoading || overdueTasksQuery.isLoading,
    isError: statsQuery.isError || recentTasksQuery.isError || overdueTasksQuery.isError,
    error: statsQuery.error || recentTasksQuery.error || overdueTasksQuery.error,
    isAuthenticated,
    isSocketConnected: isConnected,
    refetch: () => {
      if (isAuthenticated) {
        statsQuery.refetch();
        recentTasksQuery.refetch();
        overdueTasksQuery.refetch();
      }
    }
  };
};
