import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSetNewPassword } from '@/hooks/useAuthApi';
import { setPasswordValidationSchema } from '@/utils/validationSchemas';
import { Field, Form, Formik, FormikProps } from 'formik';
import { CheckCircle2, Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toastError } from '@/hooks/use-toast';

interface SetPasswordFormValues {
  newPassword: string;
  confirmPassword: string;
}

const SetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';

  const setPasswordMutation = useSetNewPassword();

  useEffect(() => {
    if (!resetToken || !email) {
      toastError('Invalid reset link');
      navigate('/forgot-password');
    }
  }, [resetToken, email, navigate]);

  const handleSetPasswordSubmit = async (values: SetPasswordFormValues) => {
    try {
      await setPasswordMutation.mutateAsync({
        resetToken,
        newPassword: values.newPassword,
      });
      navigate('/login');
    } catch (error: unknown) {
      console.error('Set password error:', error);
    }
  };

  const setPasswordInitialValues: SetPasswordFormValues = {
    newPassword: '',
    confirmPassword: '',
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-100 p-4'>
      <Card className='w-full max-w-md shadow-elevated'>
        <CardHeader className='space-y-1 text-center'>
          <div className='mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4'>
            <Lock className='w-8 h-8 text-green-600' />
          </div>
          <CardTitle className='text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent'>
            Set New Password
          </CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={setPasswordInitialValues}
            validationSchema={setPasswordValidationSchema}
            onSubmit={handleSetPasswordSubmit}
          >
            {(formik: FormikProps<SetPasswordFormValues>) => (
              <Form className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='newPassword'>New Password</Label>
                  <div className='relative'>
                    <Field
                      as={Input}
                      id='newPassword'
                      name='newPassword'
                      type={showPassword ? 'text' : 'password'}
                      placeholder='••••••••'
                      disabled={setPasswordMutation.isPending}
                      className='w-full pr-10'
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'
                      disabled={setPasswordMutation.isPending}
                    >
                      {showPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                    </button>
                  </div>
                  {formik.touched.newPassword && formik.errors.newPassword && (
                    <p className='text-sm text-red-500'>{formik.errors.newPassword}</p>
                  )}
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='confirmPassword'>Confirm New Password</Label>
                  <div className='relative'>
                    <Field
                      as={Input}
                      id='confirmPassword'
                      name='confirmPassword'
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder='••••••••'
                      disabled={setPasswordMutation.isPending}
                      className='w-full pr-10'
                    />
                    <button
                      type='button'
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'
                      disabled={setPasswordMutation.isPending}
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
                <Button
                  type='submit'
                  className='w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:opacity-90 transition-opacity'
                  disabled={setPasswordMutation.isPending || formik.isSubmitting}
                >
                  {setPasswordMutation.isPending || formik.isSubmitting ? (
                    <Loader2 className='w-4 h-4 animate-spin mr-2' />
                  ) : (
                    <CheckCircle2 className='w-4 h-4 mr-2' />
                  )}
                  Update Password
                </Button>
              </Form>
            )}
          </Formik>
          <div className='mt-6 text-center'>
            <button
              onClick={() => navigate('/login')}
              className='text-sm text-muted-foreground hover:text-primary transition-colors'
            >
              Back to Login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SetPassword;
