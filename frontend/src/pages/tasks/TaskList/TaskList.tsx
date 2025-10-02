import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { useToast } from '../../../hooks/use-toast';
import {
  useTasks,
  useDeleteTask,
  useUpdateTaskStatus,
  useExportTasksToCSV,
} from '../../../hooks/useTaskApi';
import { Task, TaskStatus } from '../../../types/task';
import { ShimmerCard } from '../../../components/ui/shimmer.tsx';
import { TaskFilters, TaskGridView, TaskTableView, EmptyState, TaskPagination } from './components';
import { useNavigate } from 'react-router-dom';
import { useSocketContext } from '../../../contexts/SocketContext';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/slices/authSlice';

const TaskList: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9); // for grid view

  // Socket integration for real-time notifications
  const {
    onTaskCreated,
    onTaskUpdated,
    onTaskDeleted,
    onTaskStatusChanged,
    onNotification,
    isConnected,
  } = useSocketContext();
  const onCreateTask = () => {
    navigate('/tasks/new');
  };
  const onEditTask = (_: Task) => {
    navigate('/tasks/' + _.id + '/edit/');
  };
  const onViewTask = (_: Task) => {
    navigate('/tasks/' + _.id);
  };
  // API integration
  const {
    data: tasksResponse,
    isLoading,
    refetch,
  } = useTasks(currentPage, itemsPerPage, {
    ...(statusFilter !== 'all' && { status: statusFilter }),
  });

  const deleteTaskMutation = useDeleteTask();
  const updateStatusMutation = useUpdateTaskStatus();
  const exportTasksMutation = useExportTasksToCSV();
  const tasks = tasksResponse?.data || [];
  const totalPages = tasksResponse?.pagination?.totalPages || 0;

  // Filter tasks based on search term (client-side filtering for search)
  const filteredTasks = tasks.filter(task => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeleteTask = async (taskId: string, taskTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${taskTitle}"?`)) {
      try {
        await deleteTaskMutation.mutateAsync(taskId);
      } catch (error) {
        // Error handling is done in the mutation
      }
    }
  };

  const handleStatusToggle = (task: Task) => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    updateStatusMutation.mutate(
      { id: task.id, status: newStatus },
      {
        onSuccess: () => {
          toast({
            title: 'Status updated',
            description: `Task marked as ${newStatus}.`,
          });
        },
      }
    );
  };

  // Set up real-time notifications for task updates
  useEffect(() => {
    if (!user || !isConnected) return;

    // Handle real-time task creation notifications
    const handleTaskCreated = (taskData: any) => {
      toast({
        title: 'New Task Created',
        description: `"${taskData.title}" has been created.`,
        variant: 'info',
      });
      refetch();
    };

    // Handle real-time task update notifications
    const handleTaskUpdated = (taskData: any) => {
      if (taskData.status === 'Completed') {
        toast({
          title: 'Task Completed',
          description: `"${taskData.title}" has been marked as completed.`,
          variant: 'success',
        });
        refetch();
      }
    };

    // Handle real-time task deletion notifications
    const handleTaskDeleted = (taskData: any) => {
      toast({
        title: 'Task Deleted',
        description: `"${taskData.title}" has been deleted.`,
        variant: 'info',
      });
      refetch();
    };

    // Handle real-time task status change notifications
    const handleTaskStatusChanged = (taskData: { id: string; status: string; title?: string }) => {
      const taskTitle = taskData.title || `Task ${taskData.id}`;

      switch (taskData.status) {
        case 'Completed':
          toast({
            title: 'Task Completed',
            description: `"${taskTitle}" has been marked as completed.`,
            variant: 'success',
          });
          refetch();
          break;
        case 'In Progress':
          toast({
            title: 'Task In Progress',
            description: `"${taskTitle}" is now in progress.`,
            variant: 'info',
          });
          refetch();
          break;
        case 'Cancelled':
          toast({
            title: 'Task Cancelled',
            description: `"${taskTitle}" has been cancelled.`,
            variant: 'warning',
          });
          refetch();
          break;
        case 'Pending':
          toast({
            title: 'Task Reset',
            description: `"${taskTitle}" has been reset to pending.`,
            variant: 'info',
          });
          refetch();
          break;
        default:
          toast({
            title: 'Task Status Updated',
            description: `"${taskTitle}" status changed to ${taskData.status}.`,
            variant: 'info',
          });
      }
    };

    // Handle general notifications from server
    const handleNotification = (notification: any) => {
      switch (notification.type) {
        case 'task_reminder':
          toast({
            title: notification.title,
            description: notification.message,
            variant: 'warning',
          });
          refetch();
          break;
        case 'task_urgent_reminder':
          toast({
            title: notification.title,
            description: notification.message,
            variant: 'error',
          });
          refetch();
          break;
        case 'task_overdue':
          toast({
            title: notification.title,
            description: notification.message,
            variant: 'error',
          });
          refetch();
          break;
        default:
          toast({
            title: 'Notification',
            description: notification.message || 'You have a new notification.',
            variant: 'info',
          });
      }
    };

    // Set up socket event listeners
    onTaskCreated(handleTaskCreated);
    onTaskUpdated(handleTaskUpdated);
    onTaskDeleted(handleTaskDeleted);
    onTaskStatusChanged(handleTaskStatusChanged);
    onNotification(handleNotification);

    // Cleanup function
    return () => {
      // Note: The socket context handles cleanup of event listeners
    };
  }, [
    user,
    isConnected,
    onTaskCreated,
    onTaskUpdated,
    onTaskDeleted,
    onTaskStatusChanged,
    onNotification,
    toast,
  ]);

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {[...Array(6)].map((_, i) => (
          <ShimmerCard key={i} />
        ))}
      </div>
    );
  }

  if ((!filteredTasks || filteredTasks.length === 0) && statusFilter === 'all') {
    return (
      <EmptyState
        hasFilters={!!(searchTerm || statusFilter !== 'all')}
        onCreateTask={onCreateTask}
      />
    );
  }

  return (
    <div className='space-y-6'>
      {/* Filters */}
      <Card>
        <CardContent className='p-4'>
          <TaskFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onExport={() =>
              exportTasksMutation.mutate({
                ...(statusFilter !== 'all' && { status: statusFilter }),
              })
            }
            isExporting={exportTasksMutation.isPending}
            onCreateTask={onCreateTask}
          />
        </CardContent>
      </Card>

      {/* Tasks View */}
      {viewMode === 'grid' ? (
        <TaskGridView
          tasks={filteredTasks}
          onView={onViewTask}
          onEdit={onEditTask}
          onStatusToggle={handleStatusToggle}
          onDelete={handleDeleteTask}
        />
      ) : (
        <TaskTableView
          tasks={filteredTasks}
          onView={onViewTask}
          onEdit={onEditTask}
          onStatusToggle={handleStatusToggle}
          onDelete={handleDeleteTask}
        />
      )}

      {/* Pagination */}
      <TaskPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
      {!filteredTasks ||
        (filteredTasks.length === 0 && (
          <EmptyState
            hasFilters={!!(searchTerm || statusFilter !== 'all')}
            onCreateTask={onCreateTask}
          />
        ))}
    </div>
  );
};

export default TaskList;
