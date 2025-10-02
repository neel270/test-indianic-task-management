import {
  Calendar,
  CheckCircle2,
  CircleDot,
  Clock,
  Edit,
  Eye,
  FileText,
  MoreHorizontal,
  Trash2,
} from 'lucide-react';
import React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../../components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../components/ui/table';
import { UserAvatar } from '../../../../components/ui/user-avatar';
import { Task } from '../../../../types/task';
import { useUsers } from '../../../../hooks/useUserApi';

interface TaskTableViewProps {
  tasks: Task[];
  onView?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onStatusToggle: (task: Task) => void;
  onDelete: (taskId: string, taskTitle: string) => void;
}

export const TaskTableView: React.FC<TaskTableViewProps> = ({
  tasks,
  onView,
  onEdit,
  onStatusToggle,
  onDelete,
}) => {
  const { data: usersResponse } = useUsers({limit: 100});
  const users = usersResponse?.data || [];
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Assigned To</TableHead>
          <TableHead className='w-[100px]'>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map(task => (
          <TableRow key={task.id}>
            <TableCell className='font-medium'>
              <div>
                <div className='font-semibold'>{task.title}</div>
                {task.description && (
                  <div className='text-sm text-gray-500 line-clamp-1'>{task.description}</div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={getStatusBadgeVariant(task.status)}>
                {getStatusIcon(task.status)}
                {task.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </TableCell>
            <TableCell>
              {task.dueDate ? (
                <div className='flex items-center'>
                  <Calendar className='h-4 w-4 mr-1' />
                  <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                  {isOverdue(task.dueDate) && task.status !== 'Completed' && task.status !== 'Cancelled' && (
                    <Badge variant='destructive' className='ml-2 text-xs'>
                      Overdue
                    </Badge>
                  )}
                </div>
              ) : (
                <span className='text-gray-400'>No due date</span>
              )}
            </TableCell>
            <TableCell>
              <div className='flex items-center text-sm text-gray-600'>
                <Clock className='h-3 w-3 mr-1' />
                {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
              </div>
            </TableCell>
            <TableCell>
              {task.assignedTo ? (
                (() => {
                  const assignedUser = users.find(user => user.id.toString() === task.assignedTo);
                  return assignedUser ? (
                    <UserAvatar user={assignedUser} size='sm' showName />
                  ) : (
                    <span className='text-sm text-gray-400'>Unknown User</span>
                  );
                })()
              ) : (
                <span className='text-sm text-gray-400 italic'>Unassigned</span>
              )}
            </TableCell>
            <TableCell>
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
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
