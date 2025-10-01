import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateUser, useUpdateUser } from '@/hooks/useUserApi';
import { CreateUserRequest, UpdateUserRequest, User } from '@/types/api';
import { Form, Formik, FormikHelpers } from 'formik';
import { Loader2 } from 'lucide-react';
import { toastError } from '@/hooks/use-toast';
import * as Yup from 'yup';

const userSchema = Yup.object({
  name: Yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters'),
  role: Yup.string().oneOf(['admin', 'user'], 'Invalid role').required('Role is required'),
  isActive: Yup.boolean(),
});

type UserFormData = {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'user';
  isActive?: boolean;
};

interface UserFormProps {
  user?: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserForm = ({ user, open, onOpenChange }: UserFormProps) => {
  const isEditing = !!user;
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  const initialValues: UserFormData = {
    name: user?.name ?? '',
    email: user?.email ?? '',
    password: '',
    role: user?.role ?? 'user',
    isActive: user?.isActive ?? true,
  };

  const handleSubmit = async (
    values: UserFormData,
    { setSubmitting, resetForm }: FormikHelpers<UserFormData>
  ) => {
    try {
      if (isEditing && user) {
        const updateData: UpdateUserRequest = {
          name: values.name,
          email: values.email,
          role: values.role,
          isActive: values.isActive ?? true,
        };
        await updateUserMutation.mutateAsync({ id: user.id.toString(), userData: updateData });
      } else {
        const createData: CreateUserRequest = {
          name: values.name,
          email: values.email,
          password: values.password!,
          role: values.role,
        };
        await createUserMutation.mutateAsync(createData);
      }
      onOpenChange(false);
      resetForm();
    } catch {
      toastError(isEditing ? 'Failed to update user.' : 'Failed to create user.');
      // Error is handled by the mutation
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = (resetForm: () => void) => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit User' : 'Create New User'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the user information below.'
              : 'Fill in the information to create a new user.'}
          </DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={initialValues}
          validationSchema={userSchema}
          onSubmit={handleSubmit}
          enableReinitialize={true}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            isSubmitting,
            resetForm,
            setFieldValue,
          }) => (
            <Form>
              <form className='space-y-4'>
                <div>
                  <label htmlFor='name' className='text-sm font-medium'>
                    Name
                  </label>
                  <Input
                    id='name'
                    name='name'
                    placeholder='Enter full name'
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.name && touched.name ? 'border-red-500' : ''}
                  />
                  {errors.name && touched.name && (
                    <div className='text-sm text-red-500 mt-1'>{errors.name}</div>
                  )}
                </div>

                <div>
                  <label htmlFor='email' className='text-sm font-medium'>
                    Email
                  </label>
                  <Input
                    id='email'
                    name='email'
                    placeholder='Enter email address'
                    type='email'
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.email && touched.email ? 'border-red-500' : ''}
                  />
                  {errors.email && touched.email && (
                    <div className='text-sm text-red-500 mt-1'>{errors.email}</div>
                  )}
                </div>

                {!isEditing && (
                  <div>
                    <label htmlFor='password' className='text-sm font-medium'>
                      Password
                    </label>
                    <Input
                      id='password'
                      name='password'
                      placeholder='Enter password'
                      type='password'
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={errors.password && touched.password ? 'border-red-500' : ''}
                    />
                    {errors.password && touched.password && (
                      <div className='text-sm text-red-500 mt-1'>{errors.password}</div>
                    )}
                  </div>
                )}

                <div>
                  <label htmlFor='role' className='text-sm font-medium'>
                    Role
                  </label>
                  <Select
                    value={values.role}
                    onValueChange={(value: string) => void setFieldValue('role', value)}
                  >
                    <SelectTrigger className={errors.role && touched.role ? 'border-red-500' : ''}>
                      <SelectValue placeholder='Select a role' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='user'>User</SelectItem>
                      <SelectItem value='admin'>Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && touched.role && (
                    <div className='text-sm text-red-500 mt-1'>{errors.role}</div>
                  )}
                </div>

                {isEditing && (
                  <div>
                    <label htmlFor='isActive' className='text-sm font-medium'>
                      Status
                    </label>
                    <Select
                      value={String(values.isActive?.toString())}
                      onValueChange={(value: string) =>
                        void setFieldValue('isActive', value === 'true')
                      }
                    >
                      <SelectTrigger
                        className={errors.isActive && touched.isActive ? 'border-red-500' : ''}
                      >
                        <SelectValue placeholder='Select status' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='true'>Active</SelectItem>
                        <SelectItem value='false'>Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.isActive && touched.isActive && (
                      <div className='text-sm text-red-500 mt-1'>{errors.isActive}</div>
                    )}
                  </div>
                )}

                <DialogFooter>
                  <Button type='button' variant='outline' onClick={() => handleCancel(resetForm)}>
                    Cancel
                  </Button>
                  <Button type='submit' disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                    {isEditing ? 'Update User' : 'Create User'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};
