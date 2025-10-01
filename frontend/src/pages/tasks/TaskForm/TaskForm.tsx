import { useFormik } from 'formik';
import React, { useMemo } from 'react';
import * as Yup from 'yup';
import { Card, CardContent } from '../../../components/ui/card';
import { useCreateTask, useUpdateTask, useTask } from '../../../hooks/useTaskApi';
import { toast } from '@/hooks/use-toast';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/slices/authSlice';
import { useNavigate, useParams } from 'react-router-dom';
import { Task } from '@/types/task';
import { TaskFormFields, TaskFormActions, TaskFormHeader } from './components';

interface TaskFormProps {}

const TaskForm: React.FC<TaskFormProps> = () => {
  const { id: taskId } = useParams();
  const { data, isLoading: isTaskLoading } = useTask(taskId || '');
  const task: Task | undefined = useMemo(() => data, [data]);
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
      status: task?.status ?? "Pending",
      priority: task?.priority ?? "Medium",
      assignedTo: user?.id || '',
      dueDate: task?.dueDate
        ? new Date(task.dueDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      tags: task?.tags ?? [],
      attachments: task?.attachments ?? [],
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      title: Yup.string()
        .min(3, 'Title must be at least 3 characters')
        .max(100, 'Title must be less than 100 characters')
        .required('Title is required'),
      description: Yup.string().required('Description is required').max(1000, 'Description must be less than 1000 characters'),
      status: Yup.string().oneOf(['Pending', 'In Progress', 'Completed', 'Cancelled']).required('Status is required'),
      priority: Yup.string().oneOf(['Low', 'Medium', 'High']).required('Priority is required'),
      assignedTo: Yup.string(),
      dueDate: Yup.date().required('Due date is required'),
      tags: Yup.array().of(Yup.string()).max(10, 'Maximum 10 tags allowed'),
      attachments: Yup.array().max(5, 'Maximum 5 files allowed'),
    }),
    onSubmit: async values => {
      try {
        if (isEditMode && taskId) {
          // For updates, transform to match API expectations
          const updateData = {
            ...(values.title && { title: values.title }),
            ...(values.description && { description: values.description }),
            ...(values.status && { status: values.status.replace('_', ' ') as 'Pending' | 'In Progress' | 'Completed' | 'Cancelled' }),
            ...(values.priority && { priority: values.priority as 'Low' | 'Medium' | 'High' | 'Urgent' }),
            ...(values.assignedTo && { assignedTo: values.assignedTo }),
            ...(values.dueDate && { dueDate: values.dueDate }),
            ...(values.tags && { tags: values.tags }),
            ...(values.attachments && { attachments: values.attachments }),
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
            status: values.status.replace('_', ' ') as 'Pending' | 'In Progress' | 'Completed' | 'Cancelled',
            priority: values.priority as 'Low' | 'Medium' | 'High' | 'Urgent',
            assignedTo: values.assignedTo,
            dueDate: values.dueDate
              ? new Date(values.dueDate).toISOString()
              : new Date().toISOString(),
            ...(values.tags && { tags: values.tags }),
            ...(values.attachments && { attachments: values.attachments }),
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
      <TaskFormHeader isEditMode={isEditMode} />
      <CardContent>
        <form onSubmit={formik.handleSubmit} className='space-y-6'>
          <TaskFormFields formik={formik} isLoading={isLoading} />
          <TaskFormActions
            isEditMode={isEditMode}
            isLoading={isLoading}
            isSubmitting={formik.isSubmitting}
            onCancel={handleCancel}
          />
        </form>
      </CardContent>
    </Card>
  );
};

export default TaskForm;
