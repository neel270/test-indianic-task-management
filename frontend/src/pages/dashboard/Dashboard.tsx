import { endOfWeek, format, isPast, isToday, startOfWeek } from 'date-fns';
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
  Users
} from 'lucide-react';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { useToast } from '../../hooks/use-toast';
import { useAppSelector } from '../../store/hooks';
import { selectIsAuthenticated, selectUser } from '../../store/slices/authSlice';
import { Task } from '../../types/task';

interface DashboardStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  dueToday: number;
  dueThisWeek: number;
  completionRate: number;
}

interface DashboardProps {
  tasks?: Task[];
  loading?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ tasks = [], loading = false }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !user) {
    return null;
  }

  // Calculate statistics
  const stats: DashboardStats = React.useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'completed').length;
    const pending = tasks.filter(task => task.status === 'pending').length;
    const overdue = tasks.filter(task =>
      task.status !== 'completed' &&
      task.dueDate &&
      isPast(new Date(task.dueDate))
    ).length;
    const dueToday = tasks.filter(task =>
      task.dueDate &&
      isToday(new Date(task.dueDate))
    ).length;
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const dueThisWeek = tasks.filter(task =>
      task.dueDate &&
      new Date(task.dueDate) >= weekStart &&
      new Date(task.dueDate) <= weekEnd
    ).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      pending,
      overdue,
      dueToday,
      dueThisWeek,
      completionRate,
    };
  }, [tasks]);

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.total,
      description: 'All your tasks',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: null,
    },
    {
      title: 'Completed',
      value: stats.completed,
      description: `${stats.completionRate}% completion rate`,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: stats.completionRate > 70 ? 'up' : stats.completionRate > 40 ? 'neutral' : 'down',
    },
    {
      title: 'Pending',
      value: stats.pending,
      description: 'Tasks to complete',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      trend: null,
    },
    {
      title: 'Due Today',
      value: stats.dueToday,
      description: 'Urgent tasks',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      trend: stats.dueToday > 0 ? 'warning' : 'good',
    },
  ];

  const recentTasks = tasks
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const overdueTasks = tasks
    .filter(task => task.status !== 'completed' && task.dueDate && isPast(new Date(task.dueDate)))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's your task overview and progress for today.
          </p>
        </div>
        <div className="flex gap-3">
          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
            {user.role}
          </Badge>
          <Button onClick={() => navigate('/tasks')}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-8 w-8 bg-gray-200 rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {stat.value.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {stat.description}
                  </p>
                  {stat.trend && (
                    <div className="flex items-center mt-2">
                      {stat.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500 mr-1" />}
                      {stat.trend === 'down' && <TrendingUp className="h-3 w-3 text-red-500 mr-1 rotate-180" />}
                      {stat.trend === 'warning' && <AlertCircle className="h-3 w-3 text-yellow-500 mr-1" />}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Progress Overview
            </CardTitle>
            <CardDescription>
              Your task completion progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{stats.completionRate}%</span>
              </div>
              <Progress value={stats.completionRate} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              <Button
                variant="outline"
                className="justify-start h-auto p-4"
                onClick={() => navigate('/tasks')}
              >
                <FileText className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">View All Tasks</div>
                  <div className="text-sm text-gray-600">Manage and organize your tasks</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto p-4"
                onClick={() => navigate('/tasks?priority=high')}
              >
                <AlertCircle className="h-5 w-5 mr-3 text-red-500" />
                <div className="text-left">
                  <div className="font-medium">High Priority Tasks</div>
                  <div className="text-sm text-gray-600">Focus on urgent tasks</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto p-4"
                onClick={() => navigate('/profile')}
              >
                <Users className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Update Profile</div>
                  <div className="text-sm text-gray-600">Manage your account settings</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
            <CardDescription>
              Your latest created tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No tasks yet</p>
                <p className="text-sm">Create your first task to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <p className="text-xs text-gray-600">
                        {task.dueDate && `Due: ${format(new Date(task.dueDate), 'MMM d, yyyy')}`}
                      </p>
                    </div>
                    <Badge variant={task.status === 'completed' ? 'default' : 'outline'}>
                      {task.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overdue Tasks Alert */}
        {stats.overdue > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center text-red-800">
                <AlertCircle className="h-5 w-5 mr-2" />
                Overdue Tasks ({stats.overdue})
              </CardTitle>
              <CardDescription className="text-red-700">
                Tasks that need immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {overdueTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-2 bg-white rounded border border-red-200">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-red-900">{task.title}</h4>
                      <p className="text-xs text-red-700">
                        Due: {format(new Date(task.dueDate!), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
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
