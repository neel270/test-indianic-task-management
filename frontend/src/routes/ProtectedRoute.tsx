import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { selectIsAuthenticated, selectUser } from '@/store/slices/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user' | 'manager';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const location = useLocation();

  // Get authentication state from Redux
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  // Check if user is authenticated
  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to unauthorized page or dashboard based on user role
    if (user?.role === 'admin') {
      return <Navigate to='/dashboard' replace />;
    } else {
      return <Navigate to='/tasks' replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
