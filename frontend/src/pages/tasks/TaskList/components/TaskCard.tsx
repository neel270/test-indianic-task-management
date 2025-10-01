import {
  Calendar,
  CheckCircle2,
  CircleDot,
  Clock,
  Edit,
  Eye,
  MoreHorizontal,
  Trash2,
  Paperclip,
} from 'lucide-react';
import React, { useState } from 'react';
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
import { getFileTypeInfo } from '@/lib/fileUtils';
import { AttachmentPreviewModal } from '@/components/ui';

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
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const getStatusBadgeVariant = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 className='h-3 w-3 mr-1' />;
      case 'Pending':
        return <CircleDot className='h-3 w-3 mr-1' />;
      case 'In Progress':
        return <Clock className='h-3 w-3 mr-1' />;
      case 'Cancelled':
        return React.createElement(getFileTypeInfo('document').icon, { className: 'h-3 w-3 mr-1' });
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
        task.status === 'Completed'
          ? 'bg-green-50 border-green-200'
          : task.status === 'Cancelled'
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
                className={task.status === 'Completed' ? 'text-orange-600' : 'text-green-600'}
              >
                Mark as {task.status === 'Completed' ? 'Pending' : 'Completed'}
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
          {task.attachments && task.attachments.length > 0 && (
            <div className='flex items-center space-x-2'>
              <div className='flex items-center space-x-1'>
                {task.attachments.slice(0, 3).map((attachment, index) => {
                  const fileInfo = getFileTypeInfo(attachment);
                  const IconComponent = fileInfo.icon;
                  return (
                    <div
                      key={index}
                      className={`p-1 rounded ${fileInfo.color.replace('text-', 'bg-').replace('-500', '-100')} border ${fileInfo.color.replace('text-', 'border-').replace('-500', '-200')}`}
                      title={attachment}
                    >
                      <IconComponent className='h-3 w-3' />
                    </div>
                  );
                })}
                {task.attachments.length > 3 && (
                  <Badge variant='outline' className='text-xs'>
                    +{task.attachments.length - 3}
                  </Badge>
                )}
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setIsAttachmentModalOpen(true)}
                className='text-xs'
              >
                <Paperclip className='h-3 w-3 mr-1' />
                View All
              </Button>
            </div>
          )}
        </div>

        {task.dueDate && (
          <div className='flex items-center text-sm text-gray-600'>
            <Calendar className='h-4 w-4 mr-2' />
            <span>Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
            {isOverdue(task.dueDate) &&
              task.status !== 'Completed' &&
              task.status !== 'Cancelled' && (
                <Badge variant='destructive' className='ml-2 text-xs'>
                  Overdue
                </Badge>
              )}
          </div>
        )}

        <div className='flex items-center text-xs text-gray-500'>
          <Clock className='h-3 w-3 mr-1' />
          <span>Created {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</span>
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className='flex flex-wrap gap-1 mt-2'>
            {task.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant='outline' className='text-xs px-2 py-0'>
                {tag}
              </Badge>
            ))}
            {task.tags.length > 3 && (
              <Badge variant='outline' className='text-xs px-2 py-0'>
                +{task.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      {/* Attachment Preview Modal */}
      <AttachmentPreviewModal
        isOpen={isAttachmentModalOpen}
        onClose={() => setIsAttachmentModalOpen(false)}
        attachments={task.attachments}
        taskTitle={task.title}
        userId={task.createdBy}
        taskId={task.id}
      />
    </Card>
  );
};
