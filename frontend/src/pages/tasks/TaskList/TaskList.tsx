import { format, formatDistanceToNow } from 'date-fns';
import {
  Calendar,
  CheckCircle2,
  CircleDot,
  Clock,
  Edit,
  Eye,
  FileText,
  MoreHorizontal,
  Plus,
  Trash2
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../components/ui/dropdown-menu';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { useToast } from '../../../hooks/use-toast';
import { Task, TaskStatus } from '../../../types/task';

interface TaskListProps {
  tasks?: Task[];
  loading?: boolean;
  onCreateTask?: () => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onViewTask?: (task: Task) => void;
  onStatusToggle?: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  loading = false,
  onCreateTask,
  onEditTask,
  onDeleteTask,
  onViewTask,
  onStatusToggle,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTasks = tasks?.filter(task => {
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handleDeleteTask = async (taskId: string, taskTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${taskTitle}"?`)) {
      try {
        onDeleteTask?.(taskId);
        toast({
          title: 'Task deleted',
          description: `Task "${taskTitle}" has been deleted successfully.`,
        });
      } catch (error: any) {
        toast({
          title: 'Delete failed',
          description: error?.message || 'Failed to delete task.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleStatusToggle = (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    onStatusToggle?.(task);
    toast({
      title: 'Status updated',
      description: `Task marked as ${newStatus}.`,
    });
  };

  const getStatusBadgeVariant = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-3 w-3 mr-1" />;
      case 'in_progress':
        return <CircleDot className="h-3 w-3 mr-1" />;
      default:
        return <CircleDot className="h-3 w-3 mr-1" />;
    }
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <ShimmerCard key={i} />
        ))}
      </div>
    );
  }

  if (filteredTasks.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || statusFilter !== 'all'
              ? 'No tasks match your current filters'
              : 'Get started by creating your first task'}
          </p>
          {onCreateTask && (
            <Button onClick={onCreateTask}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Task
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks?.map((task) => (
          <Card
            key={task.id}
            className={`hover:shadow-md transition-shadow ${
              task.status === 'completed' ? 'bg-green-50 border-green-200' :
              isOverdue(task.dueDate) ? 'bg-red-50 border-red-200' : ''
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg font-semibold line-clamp-2">
                  {task.title}
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onViewTask && (
                      <DropdownMenuItem onClick={() => onViewTask(task)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                    )}
                    {onEditTask && (
                      <DropdownMenuItem onClick={() => onEditTask(task)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Task
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleStatusToggle(task)}
                      className={task.status === 'completed' ? 'text-orange-600' : 'text-green-600'}
                    >
                      Mark as {task.status === 'completed' ? 'Pending' : 'Completed'}
                    </DropdownMenuItem>
                    {onDeleteTask && (
                      <DropdownMenuItem
                        onClick={() => handleDeleteTask(task.id, task.title)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Task
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {task.description && (
                <CardDescription className="line-clamp-3">
                  {task.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant={getStatusBadgeVariant(task.status)}>
                  {getStatusIcon(task.status)}
                  {task.status.replace('_', ' ').toUpperCase()}
                </Badge>
                {task.attachments && task.attachments.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    <FileText className="h-3 w-3 mr-1" />
                    {task.attachments.length} file{task.attachments.length > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>

              {task.dueDate && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                  {isOverdue(task.dueDate) && task.status !== 'completed' && (
                    <Badge variant="destructive" className="ml-2 text-xs">
                      Overdue
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                <span>Created {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</span>
              </div>

              {task.assignedTo && (
                <div className="text-xs text-gray-500">
                  Assigned to: {task.assignedTo}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TaskList;
