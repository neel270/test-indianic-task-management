import { Calendar, CheckCircle2, CircleDot, Clock, Edit, Eye, FileText, MoreHorizontal, Trash2 } from 'lucide-react';
import React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Badge } from '../../../../components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../../components/ui/dropdown-menu';
import { Button } from '../../../../components/ui/button';
import { Task } from '../../../../types/task';

interface TaskCardProps {
  task: Task;
  onView?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onStatusToggle: (task: Task) => void;
  onDelete: (taskId: string, taskTitle: string) => void;
}

export const TaskCardComponent: React.FC<TaskCardProps> = ({
  task,
  onView,
  onEdit,
  onStatusToggle,
  onDelete,
}) => {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'outline';
      case 'in_progress':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className='h-3 w-3 mr-1' />;
      case 'pending':
        return <CircleDot className='h-3 w-3 mr-1' />;
      case 'in_progress':
        return <Clock className='h-3 w-3 mr-1' />;
      case 'cancelled':
        return <FileText className='h-3 w-3 mr-1' />;
      default:
        return <CircleDot className='h-3 w-3 mr-1' />;
    }
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) {
      return false;
    }
    return new Date(dueDate) < new Date();
  };

  return (
    <Card
      className={`hover:shadow-md transition-shadow ${
        task.status === 'completed'
          ? 'bg-green-50 border-green-200'
          : task.status === 'cancelled'
            ? 'bg-gray-50 border-gray-200'
            : isOverdue(task.dueDate)
              ? 'bg-red-50 border-red-200'
              : ''
      }`}
    >
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <CardTitle className='text-lg font-semibold line-clamp-2'>{task.title}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='sm'>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              {onView && (
                <DropdownMenuItem onClick={() => onView?.(task)}>
                  <Eye className='mr-2 h-4 w-4' />
                  View Details
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit?.(task)}>
                  <Edit className='mr-2 h-4 w-4' />
                  Edit Task
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => onStatusToggle(task)}
                className={
                  task.status === 'completed' ? 'text-orange-600' : 'text-green-600'
                }
              >
                Mark as {task.status === 'completed' ? 'Pending' : 'Completed'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(task.id, task.title)}
                className='text-red-600'
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {task.description && (
          <CardDescription className='line-clamp-3'>{task.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='flex items-center justify-between'>
          <Badge variant={getStatusBadgeVariant(task.status)}>
            {getStatusIcon(task.status)}
            {task.status.replace('_', ' ').toUpperCase()}
          </Badge>
          {/* Attachments not available in current API */}
        </div>

        {task.dueDate && (
          <div className='flex items-center text-sm text-gray-600'>
            <Calendar className='h-4 w-4 mr-2' />
            <span>Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
            {isOverdue(task.dueDate) && task.status !== 'completed' && task.status !== 'cancelled' && (
              <Badge variant='destructive' className='ml-2 text-xs'>
                Overdue
              </Badge>
            )}
          </div>
        )}

        <div className='flex items-center text-xs text-gray-500'>
          <Clock className='h-3 w-3 mr-1' />
          <span>
            Created {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
          </span>
        </div>

        {/* Assignment not available in current API */}
      </CardContent>
    </Card>
  );
};
