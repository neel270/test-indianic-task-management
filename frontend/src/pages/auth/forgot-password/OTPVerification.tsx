import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@/components/ui';
import { useForgotPassword, useVerifyOTP } from '@/hooks/useAuth';
import { otpValidationSchema } from '@/utils/validationSchemas';
import { Form, Formik, FormikProps } from 'formik';
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toastError } from '@/hooks/use-toast';

interface OTPFormValues {
  otp: string;
}

const OTPVerification = () => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const verifyOTPMutation = useVerifyOTP();
  const resendOTPMutation = useForgotPassword();

  useEffect(() => {
    if (!email) {
      toastError('Email not provided');
      navigate('/forgot-password');
      return;
    }

    // Start countdown timer
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [email, navigate]);

  const handleOtpSubmit = async (values: OTPFormValues) => {
    try {
      const response = await verifyOTPMutation.mutateAsync({ email, otp: values.otp });
      navigate(`/set-password?token=${response.data.resetToken}&email=${email}`);
    } catch {
      // Error is handled by the mutation's onError callback
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendOTPMutation.mutateAsync({ email });
      setTimeLeft(30);
      setCanResend(false);
    } catch (error: unknown) {
      console.error('Resend OTP error:', error);
    }
  };

  const otpInitialValues: OTPFormValues = {
    otp: '',
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-100 p-4'>
      <Card className='w-full max-w-md shadow-elevated'>
        <CardHeader className='space-y-1 text-center'>
          <CardTitle className='text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent'>
            Verify OTP
          </CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to
            <br />
            <span className='font-medium text-foreground'>{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={otpInitialValues}
            validationSchema={otpValidationSchema}
            onSubmit={handleOtpSubmit}
          >
            {(formik: FormikProps<OTPFormValues>) => (
              <Form className='space-y-6'>
                <div className='space-y-2'>
                  <div className='flex justify-center'>
                    <div className='grid grid-cols-6 gap-2 max-w-xs'>
                      {Array.from({ length: 6 }, (_, index) => (
                        <input
                          key={index}
                          type='text'
                          maxLength={1}
                          className='w-12 h-12 text-center text-lg font-semibold border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none'
                          onChange={e => {
                            const value = e.target.value;
                            if (value && index < 5) {
                              const nextInput = e.target.nextElementSibling as HTMLInputElement;
                              if (nextInput) {
                                nextInput.focus();
                              }
                            }

                            // Update formik value
                            const currentOtp = formik.values.otp;
                            const newOtp = currentOtp.padEnd(6, ' ').split('');
                            newOtp[index] = value;
                            void formik.setFieldValue('otp', newOtp.join('').trim());
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Backspace' && !e.currentTarget.value && index > 0) {
                              const prevInput = e.currentTarget
                                .previousElementSibling as HTMLInputElement;
                              if (prevInput) {
                                prevInput.focus();
                              }
                            }
                          }}
                          disabled={verifyOTPMutation.isPending}
                        />
                      ))}
                    </div>
                  </div>
                  {formik.touched.otp && formik.errors.otp && (
                    <p className='text-sm text-red-500 text-center'>{formik.errors.otp}</p>
                  )}
                </div>

                <Button
                  type='submit'
                  className='w-full bg-gradient-to-r from-orange-600 to-red-600 hover:opacity-90 transition-opacity'
                  disabled={verifyOTPMutation.isPending || formik.values.otp.length !== 6}
                >
                  {verifyOTPMutation.isPending ? (
                    <Loader2 className='w-4 h-4 animate-spin mr-2' />
                  ) : null}
                  Verify OTP
                </Button>
              </Form>
            )}
          </Formik>

          <div className='mt-6 space-y-4'>
            <div className='text-center'>
              {canResend ? (
                <Button
                  variant='outline'
                  onClick={() => void handleResendOtp()}
                  disabled={resendOTPMutation.isPending}
                  className='w-full'
                >
                  {resendOTPMutation.isPending ? (
                    <Loader2 className='w-4 h-4 animate-spin mr-2' />
                  ) : (
                    <RefreshCw className='w-4 h-4 mr-2' />
                  )}
                  Resend OTP
                </Button>
              ) : (
                <p className='text-sm text-muted-foreground'>Resend OTP in {timeLeft} seconds</p>
              )}
            </div>

            <div className='text-center'>
              <button
                onClick={() => navigate('/forgot-password')}
                className='inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors'
              >
                <ArrowLeft className='w-4 h-4 mr-2' />
                Back to Forgot Password
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OTPVerification;
