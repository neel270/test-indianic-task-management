import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShimmerCard } from '@/components/ui/shimmer';
import { Textarea } from '@/components/ui/textarea';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated, selectUser } from '@/store/slices/authSlice';
import { createTask, deleteTask, fetchTasks, selectTasks, selectTasksLoading, updateTask } from '@/store/slices/tasksSlice';
import { getFieldError, isFieldInvalid, taskUpdateValidationSchema, taskValidationSchema } from '@/utils/validationSchemas';
import { format, formatDistanceToNow } from 'date-fns';
import { Field, Form, Formik, FormikProps } from 'formik';
import { Calendar, CheckCircle2, CircleDot, Clock, Download, FileText, MoreHorizontal, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { logger } from '../lib/logger';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'Pending' | 'Completed';
  dueDate: string;
  file?: {
    filename: string;
    originalName: string;
    path: string;
    size: number;
    mimetype: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface TaskFormData {
  title: string;
  description: string;
  dueDate: string;
}

interface TaskUpdateFormData {
  title: string;
  description: string;
  dueDate: string;
  status: 'Pending' | 'Completed';
}

const Tasks = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const tasks = useAppSelector(selectTasks);
  const loading = useAppSelector(selectTasksLoading);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const taskInitialValues: TaskFormData = {
    title: '',
    description: '',
    dueDate: '',
  };

  const getTaskUpdateInitialValues = (task: Task): TaskUpdateFormData => ({
    title: task.title,
    description: task.description,
    dueDate: format(new Date(task.dueDate), 'yyyy-MM-dd'),
    status: task.status,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    // Load tasks
    dispatch(fetchTasks({}));

    // Set up real-time event listeners using SocketContext
    const handleTaskCreated = (task: unknown) => {
      logger.info('Task created via real-time event', task);
      dispatch(fetchTasks({}));
      toast.success('New task created');
    };

    const handleTaskUpdated = (task: unknown) => {
      logger.info('Task updated via real-time event', task);
      dispatch(fetchTasks({}));
      toast.info('Task updated');
    };

    const handleTaskDeleted = (task: unknown) => {
      logger.info('Task deleted via real-time event', task);
      dispatch(fetchTasks({}));
      toast.info('Task deleted');
    };

    // Note: SocketContext integration would be handled by a parent provider
    // For now, we'll use the existing webSocketService pattern but this should
    // be migrated to use the new SocketContext in the future
  }, [isAuthenticated, navigate, dispatch]);

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = statusFilter === 'all' || task.status.toLowerCase() === statusFilter;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreateTask = async (values: TaskFormData) => {
    try {
      await dispatch(createTask({
        title: values.title,
        description: values.description,
        dueDate: values.dueDate
      })).unwrap();

      setIsCreateDialogOpen(false);
      toast.success('Task created successfully!');
    } catch (error: unknown) {
      toast.error((error as Error).message || 'Failed to create task');
    }
  };

  const handleEditTask = async (values: TaskUpdateFormData) => {
    if (!editingTask) {
      toast.error('No task selected for editing');
      return;
    }

    try {
      await dispatch(updateTask({
        id: editingTask.id,
        updates: {
          title: values.title,
          description: values.description,
          dueDate: values.dueDate,
          status: values.status
        }
      })).unwrap();

      setIsEditDialogOpen(false);
      setEditingTask(null);
      toast.success('Task updated successfully!');
    } catch (error: unknown) {
      toast.error((error as Error).message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await dispatch(deleteTask(taskId)).unwrap();
        toast.success('Task deleted successfully!');
      } catch (error: unknown) {
        toast.error((error as Error).message || 'Failed to delete task');
      }
    }
  };

  const handleStatusToggle = async (task: Task) => {
    const newStatus = task.status === 'Pending' ? 'Completed' : 'Pending';
    try {
      await dispatch(updateTask({
        id: task.id,
        updates: { status: newStatus }
      })).unwrap();
      toast.success(`Task marked as ${newStatus.toLowerCase()}!`);
    } catch (error: unknown) {
      toast.error((error as Error).message || 'Failed to update task status');
    }
  };

  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  const handleExportTasks = () => {
    // This would trigger CSV export from the API
    const exportUrl = `/api/tasks/export/csv?status=${statusFilter !== 'all' ? statusFilter : ''}`;
    window.open(exportUrl, '_blank');
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600 mt-1">
              Manage your tasks and track progress
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleExportTasks} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a new task
                  </DialogDescription>
                </DialogHeader>
                <Formik
                  initialValues={taskInitialValues}
                  validationSchema={taskValidationSchema}
                  onSubmit={handleCreateTask}
                >
                  {(formik: FormikProps<TaskFormData>) => (
                    <Form className="space-y-4">
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Field
                          as={Input}
                          id="title"
                          name="title"
                          placeholder="Task title"
                          className={isFieldInvalid(formik, 'title') ? 'border-red-500' : ''}
                        />
                        {getFieldError(formik, 'title') && (
                          <p className="text-sm text-red-500 mt-1">{getFieldError(formik, 'title')}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Field
                          as={Textarea}
                          id="description"
                          name="description"
                          placeholder="Task description"
                          rows={3}
                          className={isFieldInvalid(formik, 'description') ? 'border-red-500' : ''}
                        />
                        {getFieldError(formik, 'description') && (
                          <p className="text-sm text-red-500 mt-1">{getFieldError(formik, 'description')}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Field
                          as={Input}
                          id="dueDate"
                          name="dueDate"
                          type="date"
                          className={isFieldInvalid(formik, 'dueDate') ? 'border-red-500' : ''}
                        />
                        {getFieldError(formik, 'dueDate') && (
                          <p className="text-sm text-red-500 mt-1">{getFieldError(formik, 'dueDate')}</p>
                        )}
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsCreateDialogOpen(false)}
                          disabled={formik.isSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={formik.isSubmitting}>
                          {formik.isSubmitting ? 'Creating...' : 'Create Task'}
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </DialogContent>
            </Dialog>
          </div>
        </div>

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
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tasks List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <ShimmerCard key={i} />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'No tasks match your current filters'
                  : 'Get started by creating your first task'}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Task
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <Card key={task.id} className={`hover:shadow-md transition-shadow ${
                task.status === 'Completed' ? 'bg-green-50 border-green-200' :
                new Date(task.dueDate) < new Date() ? 'bg-red-50 border-red-200' : ''
              }`}>
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
                        <DropdownMenuItem onClick={() => openEditDialog(task)}>
                          Edit Task
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusToggle(task)}
                          className={task.status === 'Completed' ? 'text-orange-600' : 'text-green-600'}
                        >
                          Mark as {task.status === 'Completed' ? 'Pending' : 'Completed'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-600"
                        >
                          Delete Task
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription className="line-clamp-3">
                    {task.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={task.status === 'Completed' ? 'default' : 'secondary'}>
                      {task.status === 'Completed' ? (
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                      ) : (
                        <CircleDot className="h-3 w-3 mr-1" />
                      )}
                      {task.status}
                    </Badge>
                    {task.file && (
                      <Badge variant="outline" className="text-xs">
                        <FileText className="h-3 w-3 mr-1" />
                        File attached
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                  </div>

                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Created {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Task Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
              <DialogDescription>
                Update the task details
              </DialogDescription>
            </DialogHeader>
            {editingTask && (
              <Formik
                initialValues={getTaskUpdateInitialValues(editingTask)}
                validationSchema={taskUpdateValidationSchema}
                onSubmit={handleEditTask}
                enableReinitialize
              >
                {(formik: FormikProps<TaskUpdateFormData>) => (
                  <Form className="space-y-4">
                    <div>
                      <Label htmlFor="edit-title">Title</Label>
                      <Field
                        as={Input}
                        id="edit-title"
                        name="title"
                        placeholder="Task title"
                        className={isFieldInvalid(formik, 'title') ? 'border-red-500' : ''}
                      />
                      {getFieldError(formik, 'title') && (
                        <p className="text-sm text-red-500 mt-1">{getFieldError(formik, 'title')}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="edit-description">Description</Label>
                      <Field
                        as={Textarea}
                        id="edit-description"
                        name="description"
                        placeholder="Task description"
                        rows={3}
                        className={isFieldInvalid(formik, 'description') ? 'border-red-500' : ''}
                      />
                      {getFieldError(formik, 'description') && (
                        <p className="text-sm text-red-500 mt-1">{getFieldError(formik, 'description')}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="edit-dueDate">Due Date</Label>
                      <Field
                        as={Input}
                        id="edit-dueDate"
                        name="dueDate"
                        type="date"
                        className={isFieldInvalid(formik, 'dueDate') ? 'border-red-500' : ''}
                      />
                      {getFieldError(formik, 'dueDate') && (
                        <p className="text-sm text-red-500 mt-1">{getFieldError(formik, 'dueDate')}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="edit-status">Status</Label>
                      <Field name="status">
                        {({ field, form }: any) => (
                          <Select
                            value={field.value}
                            onValueChange={(value) => form.setFieldValue('status', value)}
                          >
                            <SelectTrigger className={isFieldInvalid(formik, 'status') ? 'border-red-500' : ''}>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </Field>
                      {getFieldError(formik, 'status') && (
                        <p className="text-sm text-red-500 mt-1">{getFieldError(formik, 'status')}</p>
                      )}
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditDialogOpen(false)}
                        disabled={formik.isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={formik.isSubmitting}>
                        {formik.isSubmitting ? 'Updating...' : 'Update Task'}
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Tasks;
