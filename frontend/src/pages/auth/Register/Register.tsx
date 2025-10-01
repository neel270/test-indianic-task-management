import { useFormik } from 'formik';
import { CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { useToast } from '../../../hooks/use-toast';
import { useRegister } from '../../../hooks/useAuth';

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const { toast } = useToast();

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      firstName: Yup.string()
        .min(2, 'First name must be at least 2 characters')
        .required('First name is required'),
      lastName: Yup.string()
        .min(2, 'Last name must be at least 2 characters')
        .required('Last name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        )
        .required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Please confirm your password'),
    }),
    onSubmit: async values => {
      try {
        await registerMutation.mutateAsync({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
        });
        toast({
          title: 'Registration successful!',
          description: 'Your account has been created. Welcome to Task Manager!',
        });
        navigate('/dashboard');
      } catch (error: Error | unknown) {
        toast({
          title: 'Registration failed',
          description:
            (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            'Please try again.',
          variant: 'destructive',
        });
      }
    },
  });

  return (
    <div className='space-y-6'>
      <div className='text-center'>
        <h2 className='text-2xl font-bold text-gray-900'>Create Account</h2>
        <p className='text-sm text-gray-600 mt-1'>Enter your information to create your account</p>
      </div>

      <form onSubmit={formik.handleSubmit} className='space-y-4'>
        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='firstName'>First Name</Label>
            <Input
              id='firstName'
              name='firstName'
              type='text'
              placeholder='John'
              value={formik.values.firstName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={
                formik.touched.firstName && formik.errors.firstName ? 'border-red-500' : ''
              }
              disabled={registerMutation.isPending}
            />
            {formik.touched.firstName && formik.errors.firstName && (
              <p className='text-sm text-red-500'>{formik.errors.firstName}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='lastName'>Last Name</Label>
            <Input
              id='lastName'
              name='lastName'
              type='text'
              placeholder='Doe'
              value={formik.values.lastName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.touched.lastName && formik.errors.lastName ? 'border-red-500' : ''}
              disabled={registerMutation.isPending}
            />
            {formik.touched.lastName && formik.errors.lastName && (
              <p className='text-sm text-red-500'>{formik.errors.lastName}</p>
            )}
          </div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='email'>Email Address</Label>
          <Input
            id='email'
            name='email'
            type='email'
            placeholder='john.doe@example.com'
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={formik.touched.email && formik.errors.email ? 'border-red-500' : ''}
            disabled={registerMutation.isPending}
          />
          {formik.touched.email && formik.errors.email && (
            <p className='text-sm text-red-500'>{formik.errors.email}</p>
          )}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='password'>Password</Label>
          <div className='relative'>
            <Input
              id='password'
              name='password'
              type={showPassword ? 'text' : 'password'}
              placeholder='••••••••'
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={
                formik.touched.password && formik.errors.password ? 'border-red-500 pr-10' : 'pr-10'
              }
              disabled={registerMutation.isPending}
            />
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'
              disabled={registerMutation.isPending}
            >
              {showPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
            </button>
          </div>
          {formik.touched.password && formik.errors.password && (
            <p className='text-sm text-red-500'>{formik.errors.password}</p>
          )}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='confirmPassword'>Confirm Password</Label>
          <div className='relative'>
            <Input
              id='confirmPassword'
              name='confirmPassword'
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder='••••••••'
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={
                formik.touched.confirmPassword && formik.errors.confirmPassword
                  ? 'border-red-500 pr-10'
                  : 'pr-10'
              }
              disabled={registerMutation.isPending}
            />
            <button
              type='button'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'
              disabled={registerMutation.isPending}
            >
              {showConfirmPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
            </button>
          </div>
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <p className='text-sm text-red-500'>{formik.errors.confirmPassword}</p>
          )}
        </div>

        <Button
          type='submit'
          className='w-full'
          disabled={registerMutation.isPending || formik.isSubmitting}
        >
          {registerMutation.isPending || formik.isSubmitting ? (
            <>
              <Loader2 className='w-4 h-4 animate-spin mr-2' />
              Creating account...
            </>
          ) : (
            <>
              <CheckCircle2 className='w-4 h-4 mr-2' />
              Create Account
            </>
          )}
        </Button>
      </form>

      <div className='text-center'>
        <p className='text-sm text-gray-600'>
          Already have an account?{' '}
          <Link
            to='/login'
            className='text-blue-600 hover:text-blue-500 hover:underline font-medium'
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
