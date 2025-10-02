import { useFormik } from 'formik';
import React, { useMemo } from 'react';
import * as Yup from 'yup';
import { Card, CardContent } from '../../../components/ui/card';
import { useCreateTask, useUpdateTask, useTask } from '../../../hooks/useTaskApi';
import { toast } from '@/hooks/use-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { Task } from '@/types/task';
import { TaskFormFields, TaskFormActions, TaskFormHeader } from './components';

interface TaskFormProps {}

const TaskForm: React.FC<TaskFormProps> = () => {
  const { id: taskId } = useParams();
  const { data, isLoading: isTaskLoading } = useTask(taskId || '');
  const task: Task | undefined = useMemo(() => data, [data]);
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const navigate = useNavigate();
  const isEditMode = !!taskId;
  const isLoading = isTaskLoading || createTaskMutation.isPending || updateTaskMutation.isPending;
  const formik = useFormik({
    initialValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      status: task?.status ?? 'Pending',
      priority: task?.priority ?? 'Medium',
      assignedTo: task?.assignedTo || '',
      dueDate: task?.dueDate
        ? new Date(task.dueDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      tags: task?.tags ?? [],
      attachments: (task?.attachments ?? []).map((attachment: string) => attachment) as (
        | File
        | string
      )[],
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      title: Yup.string()
        .min(3, 'Title must be at least 3 characters')
        .max(100, 'Title must be less than 100 characters')
        .required('Title is required'),
      description: Yup.string()
        .required('Description is required')
        .max(1000, 'Description must be less than 1000 characters'),
      status: Yup.string()
        .oneOf(['Pending', 'In Progress', 'Completed', 'Cancelled'])
        .required('Status is required'),
      priority: Yup.string()
        .oneOf(['Low', 'Medium', 'High', 'Urgent'])
        .required('Priority is required'),
      assignedTo: Yup.string(),
      dueDate: Yup.date().required('Due date is required'),
      tags: Yup.array().of(Yup.string()).max(10, 'Maximum 10 tags allowed'),
      attachments: Yup.array()
        .max(5, 'Maximum 5 files allowed')
        .of(
          Yup.mixed<File | string>().test('file-or-string', 'Invalid attachment type', value => {
            return typeof value === 'string' || value instanceof File;
          })
        ),
    }),
    onSubmit: async values => {
      try {
        if (isEditMode && taskId) {
          // For updates, transform to match API expectations
          // Only include File objects for new uploads, ignore string URLs (existing files)
          const fileAttachments = values.attachments.filter(
            (attachment): attachment is File => attachment instanceof File
          );

          const updateData = {
            title: values.title,
            description: values.description,
            ...(values.status && {
              status: values.status as 'Pending' | 'In Progress' | 'Completed' | 'Cancelled',
            }),
            ...(values.priority && {
              priority: values.priority as 'Low' | 'Medium' | 'High' | 'Urgent',
            }),
            assignedTo: values.assignedTo || '',
            ...(values.dueDate && { dueDate: values.dueDate }),
            ...(values.tags && { tags: values.tags }),
            ...(fileAttachments.length > 0 && { attachments: fileAttachments }),
          };

          await updateTaskMutation.mutateAsync({
            id: taskId,
            updates: updateData,
          });
        } else {
          // For creation, transform to CreateTaskRequest format
          // Only include File objects for new uploads, ignore string URLs (existing files)
          const fileAttachments = values.attachments.filter(
            (attachment): attachment is File => attachment instanceof File
          );

          const createData: {
            title: string;
            description: string;
            status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
            priority: 'Low' | 'Medium' | 'High' | 'Urgent';
            assignedTo: string;
            dueDate: string;
            tags?: string[];
            attachments: File[];
          } = {
            title: values.title,
            description: values.description,
            status: values.status as 'Pending' | 'In Progress' | 'Completed' | 'Cancelled',
            priority: values.priority as 'Low' | 'Medium' | 'High' | 'Urgent',
            assignedTo: values.assignedTo || '',
            dueDate: values.dueDate
              ? new Date(values.dueDate).toISOString()
              : new Date().toISOString(),
            ...(values.tags && { tags: values.tags }),
            attachments: fileAttachments,
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
