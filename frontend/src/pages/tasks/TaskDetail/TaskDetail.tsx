import { format, formatDistanceToNow } from 'date-fns';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CircleDot,
  Edit,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import React from 'react';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { useToast } from '../../../hooks/use-toast';
import { useTask, useDeleteTask, useUpdateTaskStatus } from '../../../hooks/useTaskApi';
import { Task } from '../../../types/task';
import { useParams } from 'react-router-dom';

interface TaskDetailProps {
  onEdit?: (task: Task) => void;
  onBack?: () => void;
}

const TaskDetail: React.FC<TaskDetailProps> = ({ onEdit, onBack }) => {
  const { toast } = useToast();
  const { id: taskId } = useParams();
  // API hooks
  const { data: task, isLoading } = useTask(taskId || '');
  const deleteTaskMutation = useDeleteTask();
  const updateStatusMutation = useUpdateTaskStatus();

  const handleDelete = () => {
    if (task && window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      deleteTaskMutation.mutate(task.id);
    }
  };

  const handleStatusToggle = () => {
    if (task) {
      const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
      updateStatusMutation.mutate(
        { id: task.id, status: newStatus.toLowerCase() },
        {
          onSuccess: () => {
            toast({
              title: 'Status updated',
              description: `Task marked as ${newStatus}.`,
            });
          },
        }
      );
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 className='h-4 w-4' />;
      case 'Pending':
        return <CircleDot className='h-4 w-4' />;
      default:
        return <CircleDot className='h-4 w-4' />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'default';
      case 'Pending':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate || !task) {
      return false;
    }
    return new Date(dueDate) < new Date() && task.status !== 'Completed';
  };

  if (isLoading) {
    return (
      <div className='max-w-4xl mx-auto'>
        <div className='animate-pulse space-y-6'>
          <div className='h-8 bg-gray-200 rounded w-1/3'></div>
          <div className='space-y-4'>
            <div className='h-4 bg-gray-200 rounded w-3/4'></div>
            <div className='h-4 bg-gray-200 rounded w-1/2'></div>
          </div>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            <div className='lg:col-span-2 space-y-6'>
              <div className='h-32 bg-gray-200 rounded'></div>
              <div className='h-48 bg-gray-200 rounded'></div>
            </div>
            <div className='space-y-6'>
              <div className='h-24 bg-gray-200 rounded'></div>
              <div className='h-24 bg-gray-200 rounded'></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className='max-w-4xl mx-auto'>
        <div className='text-center py-12'>
          <AlertCircle className='h-12 w-12 mx-auto mb-4 text-gray-400' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>Task not found</h3>
          <p className='text-gray-500'>
            The task you're looking for doesn't exist or has been deleted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          {onBack && (
            <Button variant='outline' size='sm' onClick={onBack}>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back
            </Button>
          )}
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>{task.title}</h1>
            <p className='text-gray-600'>
              Created {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        <div className='flex items-center space-x-2'>
          <Button
            variant={task.status === 'Completed' ? 'outline' : 'default'}
            onClick={handleStatusToggle}
          >
            {task.status === 'Completed' ? 'Mark Pending' : 'Mark Complete'}
          </Button>
          {onEdit && (
            <Button variant='outline' onClick={() => onEdit(task)}>
              <Edit className='h-4 w-4 mr-2' />
              Edit
            </Button>
          )}
          <Button variant='destructive' onClick={handleDelete}>
            <Trash2 className='h-4 w-4 mr-2' />
            Delete
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Main Content */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Description */}
          {task.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-gray-700 whitespace-pre-wrap'>{task.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Attachments not available in current API */}

          {/* Activity not available in current API */}
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          {/* Status & Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Status</span>
                <Badge variant={getStatusBadgeVariant(task.status)}>
                  {getStatusIcon(task.status)}
                  {task.status}
                </Badge>
              </div>

              {task.dueDate && (
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>Due Date</span>
                  <div className='text-right'>
                    <p
                      className={`text-sm ${isOverdue(task.dueDate) ? 'text-red-600 font-medium' : 'text-gray-700'}`}
                    >
                      {format(new Date(task.dueDate), 'MMM d, yyyy')}
                    </p>
                    {isOverdue(task.dueDate) && <p className='text-xs text-red-500'>Overdue</p>}
                  </div>
                </div>
              )}

              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Created</span>
                <span className='text-sm text-gray-700'>
                  {format(new Date(task.createdAt), 'MMM d, yyyy')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              {onEdit && (
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  onClick={() => onEdit(task)}
                >
                  <Edit className='h-4 w-4 mr-2' />
                  Edit Task
                </Button>
              )}

              <Button variant='outline' className='w-full justify-start'>
                <ExternalLink className='h-4 w-4 mr-2' />
                Share Task
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
