import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ShimmerCard } from '@/components/ui/shimmer';
import { Textarea } from '@/components/ui/textarea';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated, selectUser } from '@/store/slices/authSlice';
import { useSocketContext } from '@/contexts/SocketContext';
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useUpdateTaskStatus,
  useAddTaskAttachment,
  Task,
} from '@/hooks/useTaskApi';

import {
  getFieldError,
  isFieldInvalid,
  taskUpdateValidationSchema,
  taskValidationSchema,
} from '@/utils/validationSchemas';
import { format, formatDistanceToNow } from 'date-fns';
import { Field, Form, Formik, FormikProps } from 'formik';
import {
  Calendar,
  CheckCircle2,
  CircleDot,
  Clock,
  Download,
  FileText,
  MoreHorizontal,
  Plus,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toastSuccess, toastError, toastInfo } from '@/hooks/use-toast';

interface TaskFormData {
  title: string;
  description: string;
  dueDate: string;
  file?: File;
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
  const { onTaskCreated, onTaskUpdated, onTaskDeleted } = useSocketContext();

  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // API hooks
  const {
    data: tasksData,
    isLoading: loading,
    refetch,
  } = useTasks(1, 50, {
    ...(statusFilter !== 'all' && { status: statusFilter }),
  });
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const updateTaskStatusMutation = useUpdateTaskStatus();
  const addTaskAttachmentMutation = useAddTaskAttachment();

  const tasks = tasksData?.data || [];

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
    // Set up WebSocket event listeners for real-time updates
    const handleTaskCreated = (task: unknown) => {
      const taskData = task as Task;
      toastSuccess(`New task created: ${taskData.title}`);
      refetch(); // Refresh the tasks list
    };

    const handleTaskUpdated = (task: unknown) => {
      const taskData = task as Task;
      toastInfo(`Task updated: ${taskData.title}`);
      refetch(); // Refresh the tasks list
    };

    const handleTaskDeleted = (task: unknown) => {
      const taskData = task as Task;
      toastSuccess(`Task deleted: ${taskData.title}`);
      refetch(); // Refresh the tasks list
    };

    // Subscribe to WebSocket events
    onTaskCreated(handleTaskCreated);
    onTaskUpdated(handleTaskUpdated);
    onTaskDeleted(handleTaskDeleted);

    // Cleanup function
    return () => {
      // WebSocket cleanup is handled by SocketContext
    };
  }, [isAuthenticated, navigate, dispatch, onTaskCreated, onTaskUpdated, onTaskDeleted, refetch]);

  const filteredTasks = tasks?.filter((task: Task) => {
    const matchesStatus = statusFilter === 'all' || task.status.toLowerCase() === statusFilter;
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ??
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreateTask = async (values: TaskFormData) => {
    try {
      // First create the task
      const createdTask = await createTaskMutation.mutateAsync({
        title: values.title,
        description: values.description,
        dueDate: values.dueDate,
      });

      // If there's a file, upload it to the created task
      if (selectedFile && createdTask.id) {
        await addTaskAttachmentMutation.mutateAsync({
          id: createdTask.id,
          file: selectedFile,
        });
      }

      setIsCreateDialogOpen(false);
      setSelectedFile(null);
    } catch (error: unknown) {
      toastError((error as Error).message || 'Failed to create task');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toastError('File size must be less than 10MB');
        return;
      }

      // Validate file type
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ];

      if (!allowedTypes.includes(file.type)) {
        toastError(
          'File type not allowed. Please upload images, PDF, Word documents, or text files.'
        );
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleEditTask = async (values: TaskUpdateFormData) => {
    if (!editingTask) {
      toastError('No task selected for editing');
      return;
    }

    try {
      await updateTaskMutation.mutateAsync({
        id: editingTask.id,
        updates: {
          title: values.title,
          description: values.description,
          status: values.status,
          dueDate: values.dueDate,
        },
      });
      setIsEditDialogOpen(false);
      setEditingTask(null);
    } catch (error: unknown) {
      toastError((error as Error).message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTaskMutation.mutateAsync(taskId);
      } catch (error: unknown) {
        toastError((error as Error).message || 'Failed to delete task');
      }
    }
  };

  const handleStatusToggle = async (task: Task) => {
    const newStatus = task.status === 'Pending' ? 'Completed' : 'Pending';
    try {
      await updateTaskStatusMutation.mutateAsync({
        id: task.id,
        status: newStatus,
      });
    } catch (error: unknown) {
      toastError((error as Error).message || 'Failed to update task status');
    }
  };

  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  const handleExportTasks = () => {
    // This would trigger CSV export from the API
    const params = new URLSearchParams();
    if (statusFilter !== 'all') {
      params.append('status', statusFilter);
    }
    if (searchTerm) {
      params.append('search', searchTerm);
    }

    const exportUrl = `/api/v1/tasks/export/csv?${params.toString()}`;
    window.open(exportUrl, '_blank');
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>Tasks</h1>
            <p className='text-gray-600 mt-1'>Manage your tasks and track progress</p>
          </div>
          <div className='flex gap-3'>
            <Button onClick={handleExportTasks} variant='outline'>
              <Download className='h-4 w-4 mr-2' />
              Export CSV
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className='bg-primary hover:bg-primary/90'>
                  <Plus className='h-4 w-4 mr-2' />
                  Create Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <DialogDescription>Fill in the details to create a new task</DialogDescription>
                </DialogHeader>
                <Formik
                  initialValues={taskInitialValues}
                  validationSchema={taskValidationSchema}
                  onSubmit={handleCreateTask}
                >
                  {(formik: FormikProps<TaskFormData>) => (
                    <Form className='space-y-4'>
                      <div>
                        <Label htmlFor='title'>Title</Label>
                        <Field
                          as={Input}
                          id='title'
                          name='title'
                          placeholder='Task title'
                          className={isFieldInvalid(formik, 'title') ? 'border-red-500' : ''}
                        />
                        {getFieldError(formik, 'title') && (
                          <p className='text-sm text-red-500 mt-1'>
                            {getFieldError(formik, 'title')}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor='description'>Description</Label>
                        <Field
                          as={Textarea}
                          id='description'
                          name='description'
                          placeholder='Task description'
                          rows={3}
                          className={isFieldInvalid(formik, 'description') ? 'border-red-500' : ''}
                        />
                        {getFieldError(formik, 'description') && (
                          <p className='text-sm text-red-500 mt-1'>
                            {getFieldError(formik, 'description')}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor='dueDate'>Due Date</Label>
                        <Field
                          as={Input}
                          id='dueDate'
                          name='dueDate'
                          type='date'
                          className={isFieldInvalid(formik, 'dueDate') ? 'border-red-500' : ''}
                        />
                        {getFieldError(formik, 'dueDate') && (
                          <p className='text-sm text-red-500 mt-1'>
                            {getFieldError(formik, 'dueDate')}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor='file'>Attachment (Optional)</Label>
                        <Input
                          id='file'
                          name='file'
                          type='file'
                          accept='image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain'
                          onChange={handleFileChange}
                        />
                        {selectedFile && (
                          <p className='text-sm text-gray-600 mt-1'>
                            Selected: {selectedFile.name} (
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                        )}
                        <p className='text-xs text-gray-500 mt-1'>
                          Supported formats: Images (JPG, PNG, WebP), PDF, Word documents, Text
                          files (max 10MB)
                        </p>
                      </div>
                      <div className='flex justify-end space-x-2'>
                        <Button
                          type='button'
                          variant='outline'
                          onClick={() => setIsCreateDialogOpen(false)}
                          disabled={formik.isSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button type='submit' disabled={formik.isSubmitting}>
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
          <CardContent className='p-4'>
            <div className='flex flex-col sm:flex-row gap-4'>
              <div className='flex-1'>
                <Input
                  placeholder='Search tasks...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='Filter by status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Tasks</SelectItem>
                  <SelectItem value='pending'>Pending</SelectItem>
                  <SelectItem value='completed'>Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tasks List */}
        {loading ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {[...Array(6)].map((_, i) => (
              <ShimmerCard key={i} />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <Card>
            <CardContent className='text-center py-12'>
              <FileText className='h-12 w-12 mx-auto mb-4 text-gray-400' />
              <h3 className='text-lg font-medium text-gray-900 mb-2'>No tasks found</h3>
              <p className='text-gray-500 mb-4'>
                {searchTerm || statusFilter !== 'all'
                  ? 'No tasks match your current filters'
                  : 'Get started by creating your first task sdf'}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className='h-4 w-4 mr-2' />
                Create Your First Task
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredTasks.map((task: Task) => (
              <Card
                key={task.id}
                className={`hover:shadow-md transition-shadow ${
                  task.status === 'Completed'
                    ? 'bg-green-50 border-green-200'
                    : new Date(task.dueDate) < new Date()
                      ? 'bg-red-50 border-red-200'
                      : ''
                }`}
              >
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between'>
                    <CardTitle className='text-lg font-semibold line-clamp-2'>
                      {task.title}
                    </CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='sm'>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem onClick={() => openEditDialog(task)}>
                          Edit Task
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => void handleStatusToggle(task)}
                          className={
                            task.status === 'Completed' ? 'text-orange-600' : 'text-green-600'
                          }
                        >
                          Mark as {task.status === 'Completed' ? 'Pending' : 'Completed'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => void handleDeleteTask(task.id)}
                          className='text-red-600'
                        >
                          Delete Task
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription className='line-clamp-3'>{task.description}</CardDescription>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <Badge variant={task.status === 'Completed' ? 'default' : 'secondary'}>
                      {task.status === 'Completed' ? (
                        <CheckCircle2 className='h-3 w-3 mr-1' />
                      ) : (
                        <CircleDot className='h-3 w-3 mr-1' />
                      )}
                      {task.status}
                    </Badge>
                    {task.file && (
                      <Badge variant='outline' className='text-xs'>
                        <FileText className='h-3 w-3 mr-1' />
                        File attached
                      </Badge>
                    )}
                  </div>

                  <div className='flex items-center text-sm text-gray-600'>
                    <Calendar className='h-4 w-4 mr-2' />
                    <span>Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                  </div>

                  <div className='flex items-center text-xs text-gray-500'>
                    <Clock className='h-3 w-3 mr-1' />
                    <span>
                      Created {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                    </span>
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
              <DialogDescription>Update the task details</DialogDescription>
            </DialogHeader>
            {editingTask && (
              <Formik
                initialValues={getTaskUpdateInitialValues(editingTask)}
                validationSchema={taskUpdateValidationSchema}
                onSubmit={handleEditTask}
                enableReinitialize
              >
                {(formik: FormikProps<TaskUpdateFormData>) => (
                  <Form className='space-y-4'>
                    <div>
                      <Label htmlFor='edit-title'>Title</Label>
                      <Field
                        as={Input}
                        id='edit-title'
                        name='title'
                        placeholder='Task title'
                        className={isFieldInvalid(formik, 'title') ? 'border-red-500' : ''}
                      />
                      {getFieldError(formik, 'title') && (
                        <p className='text-sm text-red-500 mt-1'>
                          {getFieldError(formik, 'title')}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor='edit-description'>Description</Label>
                      <Field
                        as={Textarea}
                        id='edit-description'
                        name='description'
                        placeholder='Task description'
                        rows={3}
                        className={isFieldInvalid(formik, 'description') ? 'border-red-500' : ''}
                      />
                      {getFieldError(formik, 'description') && (
                        <p className='text-sm text-red-500 mt-1'>
                          {getFieldError(formik, 'description')}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor='edit-dueDate'>Due Date</Label>
                      <Field
                        as={Input}
                        id='edit-dueDate'
                        name='dueDate'
                        type='date'
                        className={isFieldInvalid(formik, 'dueDate') ? 'border-red-500' : ''}
                      />
                      {getFieldError(formik, 'dueDate') && (
                        <p className='text-sm text-red-500 mt-1'>
                          {getFieldError(formik, 'dueDate')}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor='edit-status'>Status</Label>
                      <Field name='status'>
                        {({
                          field,
                          form,
                        }: {
                          field: { value: string };
                          form: FormikProps<TaskUpdateFormData>;
                        }) => (
                          <Select
                            value={field.value}
                            onValueChange={value => void form.setFieldValue('status', value)}
                          >
                            <SelectTrigger
                              className={isFieldInvalid(formik, 'status') ? 'border-red-500' : ''}
                            >
                              <SelectValue placeholder='Select status' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='Pending'>Pending</SelectItem>
                              <SelectItem value='Completed'>Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </Field>
                      {getFieldError(formik, 'status') && (
                        <p className='text-sm text-red-500 mt-1'>
                          {getFieldError(formik, 'status')}
                        </p>
                      )}
                    </div>
                    <div className='flex justify-end space-x-2'>
                      <Button
                        type='button'
                        variant='outline'
                        onClick={() => setIsEditDialogOpen(false)}
                        disabled={formik.isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button type='submit' disabled={formik.isSubmitting}>
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
