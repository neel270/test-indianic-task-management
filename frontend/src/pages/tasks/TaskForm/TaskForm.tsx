import { useFormik } from 'formik';
import { Loader2, Save } from 'lucide-react';
import React from 'react';
import * as Yup from 'yup';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { useCreateTask, useUpdateTask, useTask } from '../../../hooks/useTaskApi';
import { toast } from '@/hooks/use-toast';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/slices/authSlice';
import { useNavigate, useParams } from 'react-router-dom';
import { Task } from '@/types/task';

interface TaskFormProps {}

const TaskForm: React.FC<TaskFormProps> = () => {
  const { id: taskId } = useParams();
  const { data, isLoading: isTaskLoading } = useTask(taskId || '');
  const task: Task = data?.data;
  console.log('TaskForm - fetched task:', task);
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const navigate = useNavigate();
  const isEditMode = !!taskId;
  const isLoading = isTaskLoading || createTaskMutation.isPending || updateTaskMutation.isPending;
  const user = useAppSelector(selectUser);
  const formik = useFormik({
    initialValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      status: (task?.status === 'Completed' ? 'Completed' : 'Pending') as 'Pending' | 'Completed',
      priority: 'Medium' as 'Low' | 'Medium' | 'High',
      assignedTo: user?.id || '',
      dueDate: task?.dueDate
        ? new Date(task.dueDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
    },
    validationSchema: Yup.object({
      title: Yup.string()
        .min(3, 'Title must be at least 3 characters')
        .max(100, 'Title must be less than 100 characters')
        .required('Title is required'),
      description: Yup.string().max(1000, 'Description must be less than 1000 characters'),
      status: Yup.string().oneOf(['Pending', 'Completed']).required('Status is required'),
      priority: Yup.string().oneOf(['Low', 'Medium', 'High']).required('Priority is required'),
      assignedTo: Yup.string(),
      dueDate: Yup.date().required('Due date is required'),
    }),
    onSubmit: async values => {
      try {
        if (isEditMode && taskId) {
          // For updates, transform to match API expectations
          const updateData = {
            ...(values.title && { title: values.title }),
            ...(values.description && { description: values.description }),
            ...(values.status && { status: values.status as 'Pending' | 'Completed' }),
            ...(values.priority && { priority: values.priority as 'Low' | 'Medium' | 'High' }),
            ...(values.assignedTo && { assignedTo: values.assignedTo }),
            ...(values.dueDate && { dueDate: values.dueDate }),
          };

          await updateTaskMutation.mutateAsync({
            id: taskId,
            updates: updateData,
          });
        } else {
          // For creation, transform to CreateTaskRequest format
          const createData = {
            title: values.title,
            description: values.description,
            status: values.status as 'Pending' | 'Completed',
            priority: values.priority as 'Low' | 'Medium' | 'High',
            assignedTo: values.assignedTo,
            dueDate: values.dueDate
              ? new Date(values.dueDate).toISOString()
              : new Date().toISOString(),
          };

          await createTaskMutation.mutateAsync(createData);
        }
        navigate('/tasks');
      } catch (error) {
        toast({
          title: 'Error',
          description: 'An error occurred while saving the task. Please try again.',
          variant: 'destructive',
        });
        // Error handling is done in the mutations
      }
    },
  });
  const handleCancel = () => {
    formik.resetForm();
    navigate('/tasks');
  };

  return (
    <Card className='w-full mx-auto'>
      <CardHeader>
        <CardTitle>{isEditMode ? 'Edit Task' : 'Create New Task'}</CardTitle>
        <CardDescription>
          {isEditMode
            ? 'Update the task details below'
            : 'Fill in the details to create a new task'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={formik.handleSubmit} className='space-y-6'>
          {/* Title */}
          <div className='space-y-2'>
            <Label htmlFor='title'>Title *</Label>
            <Input
              id='title'
              name='title'
              placeholder='Enter task title'
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.touched.title && formik.errors.title ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {formik.touched.title && formik.errors.title && (
              <p className='text-sm text-red-500'>{formik.errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className='space-y-2'>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              name='description'
              placeholder='Enter task description (optional)'
              rows={4}
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={
                formik.touched.description && formik.errors.description ? 'border-red-500' : ''
              }
              disabled={isLoading}
            />
            {formik.touched.description && formik.errors.description && (
              <p className='text-sm text-red-500'>{formik.errors.description}</p>
            )}
          </div>

          {/* Status and Priority */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='status'>Status</Label>
              <Select
                value={formik.values.status}
                onValueChange={value => void formik.setFieldValue('status', value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Pending'>Pending</SelectItem>
                  <SelectItem value='Completed'>Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='priority'>Priority</Label>
              <Select
                value={formik.values.priority}
                onValueChange={value => void formik.setFieldValue('priority', value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select priority' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Low'>Low</SelectItem>
                  <SelectItem value='Medium'>Medium</SelectItem>
                  <SelectItem value='High'>High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date */}
          <div className='space-y-2'>
            <Label htmlFor='dueDate'>Due Date *</Label>
            <Input
              id='dueDate'
              name='dueDate'
              type='date'
              value={formik.values.dueDate}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isLoading}
            />
          </div>

          {/* Form Actions */}
          <div className='flex justify-end space-x-4 pt-4'>
            <Button type='button' variant='outline' onClick={handleCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading || formik.isSubmitting}>
              {isLoading || formik.isSubmitting ? (
                <>
                  <Loader2 className='w-4 h-4 animate-spin mr-2' />
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className='w-4 h-4 mr-2' />
                  {isEditMode ? 'Update Task' : 'Create Task'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TaskForm;
