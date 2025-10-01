import { useFormik } from 'formik';
import { Eye, EyeOff, Lock, Loader2, Save } from 'lucide-react';
import React, { useState } from 'react';
import * as Yup from 'yup';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
} from '@/components/ui';

import { useToast } from '../../hooks/use-toast';
import { useChangePassword } from '../../hooks/useAuthApi';
import { logger } from '../../lib/logger';

const ChangePassword: React.FC = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const changePasswordMutation = useChangePassword();

  const formik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required('Current password is required'),
      newPassword: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        )
        .required('New password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword')], 'Passwords must match')
        .required('Please confirm your new password'),
    }),
    onSubmit: async values => {
      try {
        await changePasswordMutation.mutateAsync({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });

        // Clear form after successful password change
        formik.resetForm();

        logger.info('Password change completed successfully');
      } catch (error) {
        // Error handling is done in the mutation
        logger.error('Password change failed', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
  });

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center'>
            <Lock className='w-6 h-6 text-blue-600' />
          </div>
          <CardTitle className='text-2xl font-bold'>Change Password</CardTitle>
          <CardDescription>
            Enter your current password and choose a new secure password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit} className='space-y-4'>
            {/* Current Password */}
            <div className='space-y-2'>
              <Label htmlFor='currentPassword'>Current Password</Label>
              <div className='relative'>
                <Input
                  id='currentPassword'
                  name='currentPassword'
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={formik.values.currentPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={
                    formik.touched.currentPassword && formik.errors.currentPassword
                      ? 'border-red-500 pr-10'
                      : 'pr-10'
                  }
                  placeholder='Enter your current password'
                />
                <button
                  type='button'
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'
                >
                  {showCurrentPassword ? (
                    <EyeOff className='w-4 h-4' />
                  ) : (
                    <Eye className='w-4 h-4' />
                  )}
                </button>
              </div>
              {formik.touched.currentPassword && formik.errors.currentPassword && (
                <p className='text-sm text-red-500'>{formik.errors.currentPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div className='space-y-2'>
              <Label htmlFor='newPassword'>New Password</Label>
              <div className='relative'>
                <Input
                  id='newPassword'
                  name='newPassword'
                  type={showNewPassword ? 'text' : 'password'}
                  value={formik.values.newPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={
                    formik.touched.newPassword && formik.errors.newPassword
                      ? 'border-red-500 pr-10'
                      : 'pr-10'
                  }
                  placeholder='Enter your new password'
                />
                <button
                  type='button'
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'
                >
                  {showNewPassword ? (
                    <EyeOff className='w-4 h-4' />
                  ) : (
                    <Eye className='w-4 h-4' />
                  )}
                </button>
              </div>
              {formik.touched.newPassword && formik.errors.newPassword && (
                <p className='text-sm text-red-500'>{formik.errors.newPassword}</p>
              )}
            </div>

            {/* Confirm New Password */}
            <div className='space-y-2'>
              <Label htmlFor='confirmPassword'>Confirm New Password</Label>
              <div className='relative'>
                <Input
                  id='confirmPassword'
                  name='confirmPassword'
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={
                    formik.touched.confirmPassword && formik.errors.confirmPassword
                      ? 'border-red-500 pr-10'
                      : 'pr-10'
                  }
                  placeholder='Confirm your new password'
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'
                >
                  {showConfirmPassword ? (
                    <EyeOff className='w-4 h-4' />
                  ) : (
                    <Eye className='w-4 h-4' />
                  )}
                </button>
              </div>
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className='text-sm text-red-500'>{formik.errors.confirmPassword}</p>
              )}
            </div>

            {/* Password Requirements */}
            <div className='text-sm text-gray-600 bg-gray-50 p-3 rounded-md'>
              <p className='font-medium mb-2'>Password requirements:</p>
              <ul className='space-y-1 text-xs'>
                <li>• At least 8 characters long</li>
                <li>• At least one uppercase letter</li>
                <li>• At least one lowercase letter</li>
                <li>• At least one number</li>
              </ul>
            </div>

            {/* Submit Button */}
            <Button
              type='submit'
              className='w-full'
              disabled={formik.isSubmitting || changePasswordMutation.isPending}
            >
              {formik.isSubmitting || changePasswordMutation.isPending ? (
                <>
                  <Loader2 className='w-4 h-4 animate-spin mr-2' />
                  Changing Password...
                </>
              ) : (
                <>
                  <Save className='w-4 h-4 mr-2' />
                  Change Password
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChangePassword;