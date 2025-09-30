import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getStoredUser, isAuthenticated } from '../hooks/useAuth';
import { User } from '../types/user';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user' | 'manager';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole
}) => {
  const location = useLocation();
  const authenticated = isAuthenticated();
  const user: User | null = getStoredUser();

  // Check if user is authenticated
  if (!authenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to unauthorized page or dashboard based on user role
    if (user?.role === 'admin') {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/tasks" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
