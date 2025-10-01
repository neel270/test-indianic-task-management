import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/slices/authSlice';

const AuthLayout: React.FC = () => {
  const isLoggedIn = useAppSelector(selectIsAuthenticated);
  return !isLoggedIn ? (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        {/* Header */}
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-900'>Task Manager</h1>
          <p className='mt-2 text-sm text-gray-600'>
            Manage your tasks efficiently and stay organized
          </p>
        </div>

        {/* Auth Form Container */}
        <Card className='shadow-lg'>
          <CardContent className='p-8'>
            <Outlet />
          </CardContent>
        </Card>

        {/* Footer */}
        <div className='text-center'>
          <p className='text-sm text-gray-500'>© 2024 Task Manager. All rights reserved.</p>
        </div>
      </div>
    </div>
  ) : (
    <Navigate
      to={{
        pathname: '/dashboard',
      }}
      replace
    />
  );
};

export default AuthLayout;
