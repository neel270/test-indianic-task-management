import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Formik, Form, Field, FormikProps } from 'formik';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { signIn, signUp } from '@/lib/auth';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { loginUser, registerUser, selectAuthLoading, selectIsAuthenticated, selectUser } from '@/store/slices/authSlice';
import { loginValidationSchema, registerValidationSchema, getFieldError, isFieldInvalid } from '@/utils/validationSchemas';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface LoginFormValues {
  email: string;
  password: string;
}

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const loading = useAppSelector(selectAuthLoading);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  const handleLoginSubmit = async (values: LoginFormValues) => {
    try {
      await dispatch(loginUser({ email: values.email, password: values.password })).unwrap();
      toast.success('Login successful!');
      navigate('/');
    } catch (error: unknown) {
      console.error('Login error:', error);
      toast.error((error as Error).message || 'Login failed');
    }
  };

  const handleRegisterSubmit = async (values: RegisterFormValues) => {
    try {
      await dispatch(registerUser({ 
        name: values.name, 
        email: values.email, 
        password: values.password, 
        role: 'user' 
      })).unwrap();
      toast.success('Account created successfully! You can now log in.');
      setIsLogin(true);
    } catch (error: unknown) {
      console.error('Registration error:', error);
      toast.error((error as Error).message || 'Registration failed');
    }
  };

  const loginInitialValues: LoginFormValues = {
    email: '',
    password: '',
  };

  const registerInitialValues: RegisterFormValues = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  return (
    <Card className="w-full max-w-md shadow-elevated">
      <CardHeader className="space-y-1">
        <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </CardTitle>
        <CardDescription>
          {isLogin ? 'Enter your credentials to continue' : 'Fill in your details to get started'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLogin ? (
          <Formik
            initialValues={loginInitialValues}
            validationSchema={loginValidationSchema}
            onSubmit={handleLoginSubmit}
          >
            {(formik: FormikProps<LoginFormValues>) => (
              <Form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Field
                    as={Input}
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    disabled={loading}
                    className={isFieldInvalid(formik, 'email') ? 'border-red-500' : ''}
                  />
                  {getFieldError(formik, 'email') && (
                    <p className="text-sm text-red-500">{getFieldError(formik, 'email')}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Field
                    as={Input}
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    disabled={loading}
                    className={isFieldInvalid(formik, 'password') ? 'border-red-500' : ''}
                  />
                  {getFieldError(formik, 'password') && (
                    <p className="text-sm text-red-500">{getFieldError(formik, 'password')}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                  disabled={loading || formik.isSubmitting}
                >
                  {loading || formik.isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Sign In
                      <CheckCircle2 className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </Form>
            )}
          </Formik>
        ) : (
          <Formik
            initialValues={registerInitialValues}
            validationSchema={registerValidationSchema}
            onSubmit={handleRegisterSubmit}
          >
            {(formik: FormikProps<RegisterFormValues>) => (
              <Form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Field
                    as={Input}
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    disabled={loading}
                    className={isFieldInvalid(formik, 'name') ? 'border-red-500' : ''}
                  />
                  {getFieldError(formik, 'name') && (
                    <p className="text-sm text-red-500">{getFieldError(formik, 'name')}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Field
                    as={Input}
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    disabled={loading}
                    className={isFieldInvalid(formik, 'email') ? 'border-red-500' : ''}
                  />
                  {getFieldError(formik, 'email') && (
                    <p className="text-sm text-red-500">{getFieldError(formik, 'email')}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Field
                    as={Input}
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    disabled={loading}
                    className={isFieldInvalid(formik, 'password') ? 'border-red-500' : ''}
                  />
                  {getFieldError(formik, 'password') && (
                    <p className="text-sm text-red-500">{getFieldError(formik, 'password')}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Field
                    as={Input}
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    disabled={loading}
                    className={isFieldInvalid(formik, 'confirmPassword') ? 'border-red-500' : ''}
                  />
                  {getFieldError(formik, 'confirmPassword') && (
                    <p className="text-sm text-red-500">{getFieldError(formik, 'confirmPassword')}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                  disabled={loading || formik.isSubmitting}
                >
                  {loading || formik.isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Create Account
                      <CheckCircle2 className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </Form>
            )}
          </Formik>
        )}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
            disabled={loading}
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Auth;
