import { Button, Input, Label } from '@/components/ui';
import { useForgotPassword } from '@/hooks/useAuth';
import { forgotPasswordValidationSchema } from '@/utils/validationSchemas';
import { Field, Form, Formik, FormikProps } from 'formik';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
interface ForgotPasswordFormValues {
  email: string;
}

const ForgotPassword = () => {
  const [emailSent, setEmailSent] = useState(false);
  const forgotPasswordMutation = useForgotPassword();

  const handleForgotPasswordSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      await forgotPasswordMutation.mutateAsync({ email: values.email });
      setEmailSent(true);
    } catch (error: unknown) {
      console.error('Forgot password error:', error);
    }
  };

  const forgotPasswordInitialValues: ForgotPasswordFormValues = {
    email: '',
  };

  if (emailSent) {
    return (
      <div className='space-y-6'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-gray-900'>Check Your Email</h2>
          <p className='text-sm text-gray-600 mt-1'>
            We've sent a 6-digit OTP to your email address. Please check your inbox and enter the
            code on the next page.
          </p>
        </div>

        <div className='space-y-4'>
          <div className='text-center'>
            <p className='text-sm text-muted-foreground mb-4'>
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <Button variant='outline' onClick={() => setEmailSent(false)} className='w-full'>
              Send Another OTP
            </Button>
          </div>
          <div className='text-center'>
            <Link
              to='/login'
              className='inline-flex items-center text-sm text-primary hover:underline'
            >
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='text-center'>
        <h2 className='text-2xl font-bold text-gray-900'>Forgot Password</h2>
        <p className='text-sm text-gray-600 mt-1'>
          Enter your email address and we'll send you an OTP to reset your password
        </p>
      </div>

      <div className='space-y-4'>
        <Formik
          initialValues={forgotPasswordInitialValues}
          validationSchema={forgotPasswordValidationSchema}
          onSubmit={handleForgotPasswordSubmit}
        >
          {(formik: FormikProps<ForgotPasswordFormValues>) => (
            <Form className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email Address</Label>
                <Field
                  as={Input}
                  id='email'
                  name='email'
                  type='email'
                  placeholder='you@example.com'
                  disabled={forgotPasswordMutation.isPending}
                  className='w-full'
                />
                {formik.touched.email && formik.errors.email && (
                  <p className='text-sm text-red-500'>{formik.errors.email}</p>
                )}
              </div>
              <Button
                type='submit'
                className='w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 transition-opacity'
                disabled={forgotPasswordMutation.isPending || formik.isSubmitting}
              >
                {forgotPasswordMutation.isPending || formik.isSubmitting ? (
                  <Loader2 className='w-4 h-4 animate-spin mr-2' />
                ) : (
                  <Mail className='w-4 h-4 mr-2' />
                )}
                Send OTP
              </Button>
            </Form>
          )}
        </Formik>
        <div className='mt-6 text-center'>
          <Link
            to='/login'
            className='inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors'
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
