import { endOfWeek, format, isToday, startOfWeek } from 'date-fns';
import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/slices/authSlice';
import { useDashboardData } from '../../hooks/useDashboardApi';
import { useSocketContext } from '../../contexts/SocketContext';
import { toast } from '../../hooks/use-toast';
import { TaskStatus } from '../../types/task';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const { stats, recentTasks, overdueTasks, isLoading, isAuthenticated, isSocketConnected } =
    useDashboardData();

  // Socket integration for real-time notifications
  const { onTaskCreated, onTaskUpdated, onTaskStatusChanged, onNotification } = useSocketContext();

  // Set up real-time notifications
  useEffect(() => {
    if (!isAuthenticated || !isSocketConnected) return;

    // Handle real-time task creation notifications
    const handleTaskCreated = (taskData: any) => {
      toast({
        title: 'New Task Created',
        description: `"${taskData.title}" has been created.`,
        variant: 'info',
      });
    };

    // Handle real-time task update notifications
    const handleTaskUpdated = (taskData: any) => {
      if (taskData.status === 'Completed') {
        toast({
          title: 'Task Completed',
          description: `"${taskData.title}" has been marked as completed.`,
          variant: 'success',
        });
      }
    };

    // Handle real-time task status change notifications
    const handleTaskStatusChanged = (taskData: { id: string; status: TaskStatus; title?: string }) => {
      const taskTitle = taskData.title || `Task ${taskData.id}`;

      switch (taskData.status) {
        case 'Completed':
          toast({
            title: 'Task Completed',
            description: `"${taskTitle}" has been marked as completed.`,
            variant: 'success',
          });
          break;
        case 'In Progress':
          toast({
            title: 'Task In Progress',
            description: `"${taskTitle}" is now in progress.`,
            variant: 'info',
          });
          break;
        case 'Cancelled':
          toast({
            title: 'Task Cancelled',
            description: `"${taskTitle}" has been cancelled.`,
            variant: 'warning',
          });
          break;
        case 'Pending':
          toast({
            title: 'Task Reset',
            description: `"${taskTitle}" has been reset to pending.`,
            variant: 'info',
          });
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
          break;
        case 'task_urgent_reminder':
          toast({
            title: notification.title,
            description: notification.message,
            variant: 'error',
          });
          break;
        case 'task_overdue':
          toast({
            title: notification.title,
            description: notification.message,
            variant: 'error',
          });
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
    onTaskStatusChanged(handleTaskStatusChanged);
    onNotification(handleNotification);

    // Cleanup function
    return () => {
      // Note: The socket context handles cleanup of event listeners
    };
  }, [
    isAuthenticated,
    isSocketConnected,
    onTaskCreated,
    onTaskUpdated,
    onTaskStatusChanged,
    onNotification,
  ]);

  // Calculate additional derived stats for UI compatibility
  const derivedStats = React.useMemo(() => {
    if (!stats) {
      return {
        total: 0,
        completed: 0,
        pending: 0,
        overdue: 0,
        dueToday: 0,
        dueThisWeek: 0,
        completionRate: 0,
      };
    }

    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);

    // Calculate due today and due this week from overdue tasks
    const dueToday = overdueTasks.filter(
      task => task.dueDate && isToday(new Date(task.dueDate))
    ).length;
    const dueThisWeek = overdueTasks.filter(
      task =>
        task.dueDate && new Date(task.dueDate) >= weekStart && new Date(task.dueDate) <= weekEnd
    ).length;

    return {
      total: stats.totalTasks,
      completed: stats.completedTasks,
      pending: stats.pendingTasks,
      overdue: stats.overdueTasks,
      dueToday,
      dueThisWeek,
      completionRate: Math.round(stats.completionRate),
    };
  }, [stats, recentTasks]);
  const statCards = [
    {
      title: 'Total Tasks',
      value: derivedStats.total,
      description: 'All your tasks',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: null,
    },
    {
      title: 'Completed',
      value: derivedStats.completed,
      description: `${derivedStats.completionRate}% completion rate`,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend:
        derivedStats.completionRate > 70
          ? 'up'
          : derivedStats.completionRate > 40
            ? 'neutral'
            : 'down',
    },
    {
      title: 'Pending',
      value: derivedStats.pending,
      description: 'Tasks to complete',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      trend: null,
    },
    {
      title: 'Due Today',
      value: derivedStats.dueToday,
      description: 'Urgent tasks',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      trend: derivedStats.dueToday > 0 ? 'warning' : 'good',
    },
  ];

  // Check if user is authenticated
  if (!isAuthenticated) {
    return (
      <div className='space-y-6'>
        <div className='text-center py-12'>
          <h1 className='text-3xl font-bold text-gray-900 mb-4'>Authentication Required</h1>
          <p className='text-gray-600 mb-6'>Please log in to view your dashboard.</p>
          <Button onClick={() => navigate('/login')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Welcome Header */}
      <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Welcome back, {user?.firstName}!</h1>
          <p className='text-gray-600 mt-1'>Here's your task overview and progress for today.</p>
        </div>
        <div className='flex gap-3'>
          <Button onClick={() => navigate('/tasks/new')}>
            <Plus className='h-4 w-4 mr-2' />
            New Task
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {[...Array(4)].map((_, i) => (
            <Card key={i} className='animate-pulse'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <div className='h-4 bg-gray-200 rounded w-24' />
                <div className='h-8 w-8 bg-gray-200 rounded' />
              </CardHeader>
              <CardContent>
                <div className='h-8 bg-gray-200 rounded w-16 mb-2' />
                <div className='h-3 bg-gray-200 rounded w-32' />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className='hover:shadow-md transition-shadow'>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium text-gray-600'>{stat.title}</CardTitle>
                  <div className={`p-2 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold text-gray-900'>
                    {stat.value.toLocaleString()}
                  </div>
                  <p className='text-xs text-gray-600 mt-1'>{stat.description}</p>
                  {stat.trend && (
                    <div className='flex items-center mt-2'>
                      {stat.trend === 'up' && (
                        <TrendingUp className='h-3 w-3 text-green-500 mr-1' />
                      )}
                      {stat.trend === 'down' && (
                        <TrendingUp className='h-3 w-3 text-red-500 mr-1 rotate-180' />
                      )}
                      {stat.trend === 'warning' && (
                        <AlertCircle className='h-3 w-3 text-yellow-500 mr-1' />
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <Target className='h-5 w-5 mr-2' />
              Progress Overview
            </CardTitle>
            <CardDescription>Your task completion progress</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span>Overall Progress</span>
                <span>{derivedStats.completionRate}%</span>
              </div>
              <Progress value={derivedStats.completionRate} className='h-2' />
            </div>

            <div className='grid grid-cols-2 gap-4 pt-4'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-green-600'>{derivedStats.completed}</div>
                <div className='text-sm text-gray-600'>Completed</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-yellow-600'>{derivedStats.pending}</div>
                <div className='text-sm text-gray-600'>Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <Activity className='h-5 w-5 mr-2' />
              Quick Actions
            </CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-3'>
              <Button
                variant='outline'
                className='justify-start h-auto p-4'
                onClick={() => navigate('/tasks')}
              >
                <FileText className='h-5 w-5 mr-3' />
                <div className='text-left'>
                  <div className='font-medium'>View All Tasks</div>
                  <div className='text-sm text-gray-600'>Manage and organize your tasks</div>
                </div>
              </Button>

              <Button
                variant='outline'
                className='justify-start h-auto p-4'
                onClick={() => navigate('/tasks?priority=high')}
              >
                <AlertCircle className='h-5 w-5 mr-3 text-red-500' />
                <div className='text-left'>
                  <div className='font-medium'>High Priority Tasks</div>
                  <div className='text-sm text-gray-600'>Focus on urgent tasks</div>
                </div>
              </Button>

              <Button
                variant='outline'
                className='justify-start h-auto p-4'
                onClick={() => navigate('/profile')}
              >
                <Users className='h-5 w-5 mr-3' />
                <div className='text-left'>
                  <div className='font-medium'>Update Profile</div>
                  <div className='text-sm text-gray-600'>Manage your account settings</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
            <CardDescription>Your latest created tasks</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTasks.length === 0 ? (
              <div className='text-center py-8 text-gray-500'>
                <FileText className='h-8 w-8 mx-auto mb-2 opacity-50' />
                <p>No tasks yet</p>
                <p className='text-sm'>Create your first task to get started</p>
              </div>
            ) : (
              <div className='space-y-3'>
                {recentTasks.map(task => (
                  <div
                    key={task.id}
                    className='flex items-center justify-between p-3 border rounded-lg'
                  >
                    <div className='flex-1'>
                      <h4 className='font-medium text-sm'>{task.title}</h4>
                      <p className='text-xs text-gray-600'>
                        {task.dueDate && `Due: ${format(new Date(task.dueDate), 'MMM d, yyyy')}`}
                      </p>
                    </div>
                    <Badge variant={task.status === 'Completed' ? 'default' : 'outline'}>
                      {task.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overdue Tasks Alert */}
        {derivedStats.overdue > 0 && (
          <Card className='border-red-200 bg-red-50'>
            <CardHeader>
              <CardTitle className='flex items-center text-red-800'>
                <AlertCircle className='h-5 w-5 mr-2' />
                Overdue Tasks ({derivedStats.overdue})
              </CardTitle>
              <CardDescription className='text-red-700'>
                Tasks that need immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                {overdueTasks.map(task => (
                  <div
                    key={task.id}
                    className='flex items-center justify-between p-2 bg-white rounded border border-red-200'
                  >
                    <div className='flex-1'>
                      <h4 className='font-medium text-sm text-red-900'>{task.title}</h4>
                      <p className='text-xs text-red-700'>
                        Due:{' '}
                        {task.dueDate
                          ? format(new Date(task.dueDate), 'MMM d, yyyy')
                          : 'No due date'}
                      </p>
                    </div>
                    <Button size='sm' variant='outline'>
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
