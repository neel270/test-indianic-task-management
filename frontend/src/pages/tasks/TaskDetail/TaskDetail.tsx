import { format, formatDistanceToNow } from 'date-fns';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CircleDot,
  Download,
  Edit,
  ExternalLink,
  Trash2,
  Clock,
  X,
} from 'lucide-react';
import React, { useMemo, useEffect, useState } from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '../../../components/ui';
import { UserAvatar } from '../../../components/ui/user-avatar';
import { useTask, useDeleteTask, useUpdateTaskStatus } from '../../../hooks/useTaskApi';
import { useUsers } from '../../../hooks/useUserApi';
import { Task, TaskStatus } from '../../../types/task';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { getFileTypeInfo } from '@/lib/fileUtils';
import { useSocketContext } from '../../../contexts/SocketContext';

const TaskDetail: React.FC = () => {
  const { id: taskId } = useParams();
  const navigate = useNavigate();
  const [localTask, setLocalTask] = useState<Task | null>(null);
  const { joinTaskRoom, leaveTaskRoom, onTaskUpdated, onTaskStatusChanged } = useSocketContext();

  const onBack = () => {
    navigate(-1);
  };
  const onEdit = (task: Task) => {
    navigate(`/tasks/${task.id}/edit/`);
  };

  // API hooks
  const { data, isLoading } = useTask(taskId || '');
  const { data: usersResponse } = useUsers({ limit: 100 });
  const task = useMemo(() => localTask || data, [localTask, data]);
  const users = usersResponse?.data || [];
  const deleteTaskMutation = useDeleteTask();
  const updateStatusMutation = useUpdateTaskStatus();

  // Join task room and listen for real-time updates
  useEffect(() => {
    if (taskId) {
      joinTaskRoom(taskId);

      // Listen for task updates
      const handleTaskUpdated = (updatedTask: any) => {
        if (updatedTask.id === taskId) {
          setLocalTask(updatedTask);
        }
      };

      // Listen for task status changes
      const handleTaskStatusChanged = (statusData: {
        id: string;
        status: TaskStatus;
        title?: string;
      }) => {
        if (statusData.id === taskId) {
          setLocalTask(prev => (prev ? { ...prev, status: statusData.status } : null));
          toast({
            title: 'Task status updated',
            description: `"${statusData.title || 'Task'}" status changed to ${statusData.status}`,
          });
        }
      };

      onTaskUpdated(handleTaskUpdated);
      onTaskStatusChanged(handleTaskStatusChanged);

      return () => {
        leaveTaskRoom(taskId);
      };
    }
  }, [taskId, joinTaskRoom, leaveTaskRoom, onTaskUpdated, onTaskStatusChanged]);

  // Find the assigned user
  const assignedUser: (typeof users)[0] | null = task?.assignedTo
    ? users.find(user => user.id.toString() === task.assignedTo) || null
    : null;

  const handleDelete = () => {
    if (task && window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      deleteTaskMutation.mutate(task.id);
    }
  };

  const handleStatusToggle = () => {
    if (task) {
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
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 className='h-3 w-3 mr-1' />;
      case 'Pending':
        return <CircleDot className='h-3 w-3 mr-1' />;
      case 'In Progress':
        return <Clock className='h-3 w-3 mr-1' />;
      case 'Cancelled':
        return <X className='h-3 w-3 mr-1' />;
      default:
        return <CircleDot className='h-3 w-3 mr-1' />;
    }
  };

  const getStatusBadgeVariant = (status: TaskStatus) => {
    switch (status) {
      case 'Completed':
        return 'default';
      case 'Pending':
        return 'outline';
      case 'In Progress':
        return 'secondary';
      case 'Cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  const isOverdue = (dueDate?: string) => {
    if (!dueDate || !task) {
      return false;
    }
    return new Date(dueDate) < new Date() && task.status !== 'Completed' as TaskStatus;
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
              Created{' '}
              {task?.createdAt
                ? formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })
                : 'Unknown'}
            </p>
          </div>
        </div>

        <div className='flex items-center space-x-2'>
          <Button
            variant={task.status === 'Completed' as TaskStatus ? 'outline' : 'default'}
            onClick={handleStatusToggle}
          >
            {task.status === 'Completed' as TaskStatus ? 'Mark Pending' : 'Mark Complete'}
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

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex flex-wrap gap-2'>
                  {task.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant='secondary'>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Attachments */}
          {task.attachments && task.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Attachments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {task.attachments.map((attachment: string, index: number) => {
                    const attachmentUrl =
                      typeof attachment === 'string' ? attachment : attachment || '#';
                    const fileName = attachmentUrl.split('/').pop() || 'Unknown file';
                    const fileTypeInfo = getFileTypeInfo(fileName);

                    return (
                      <div
                        key={index}
                        className='flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors'
                      >
                        <div className='flex items-center space-x-3'>
                          {fileTypeInfo.type === 'image' ? (
                            <div className='relative w-10 h-10 rounded border bg-gray-100 flex items-center justify-center overflow-hidden'>
                              <img
                                src={attachmentUrl}
                                alt={fileName}
                                className='w-full h-full object-cover'
                                onError={e => {
                                  // Fallback to icon if image fails to load
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent && !parent.querySelector('.fallback-icon')) {
                                    const icon = document.createElement('div');
                                    icon.className = 'fallback-icon';
                                    icon.innerHTML =
                                      '<svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
                                    parent.appendChild(icon);
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <div
                              className={`flex items-center justify-center w-10 h-10 rounded border bg-gray-100`}
                            >
                              {fileTypeInfo.icon && (
                                <fileTypeInfo.icon className={`h-5 w-5 ${fileTypeInfo.color}`} />
                              )}
                            </div>
                          )}
                          <div className='flex-1 min-w-0'>
                            <p className='text-sm font-medium text-gray-900 truncate'>{fileName}</p>
                            <p className='text-xs text-gray-500 capitalize'>
                              {fileTypeInfo.type === 'image'
                                ? 'Image preview'
                                : `${fileTypeInfo.type} file`}
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center space-x-2'>
                          {fileTypeInfo.type === 'image' && (
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => window.open(attachmentUrl, '_blank')}
                            >
                              <ExternalLink className='h-4 w-4 mr-2' />
                              View
                            </Button>
                          )}
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => window.open(attachmentUrl, '_blank')}
                          >
                            <Download className='h-4 w-4 mr-2' />
                            Download
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

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
                      {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No due date'}
                    </p>
                    {isOverdue(task.dueDate) && <p className='text-xs text-red-500'>Overdue</p>}
                  </div>
                </div>
              )}

              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Created</span>
                <span className='text-sm text-gray-700'>
                  {task.createdAt ? format(new Date(task.createdAt), 'MMM d, yyyy') : 'Unknown'}
                </span>
              </div>

              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Assigned To</span>
                <UserAvatar user={assignedUser} size='sm' showName />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
