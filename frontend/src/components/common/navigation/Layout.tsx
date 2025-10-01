import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/slices/authSlice';
import AuthLayout from './AuthLayout';
import ProtectedLayout from './ProtectedLayout';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (isAuthenticated) {
    return <ProtectedLayout>{children}</ProtectedLayout>;
  }

  return <AuthLayout>{children}</AuthLayout>;
};

export default Layout;
