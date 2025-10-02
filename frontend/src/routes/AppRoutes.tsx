import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

// Loading fallback component
const PageLoader = () => (
  <div className='flex items-center justify-center min-h-screen'>
    <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900'></div>
  </div>
);

// Layouts
const AuthLayout = lazy(() => import('../layouts/AuthLayout'));
const MainLayout = lazy(() => import('../layouts/MainLayout'));

// Auth Pages
const Login = lazy(() => import('../pages/auth/Login/Login'));
const Profile = lazy(() => import('../pages/auth/Profile/Profile'));
const ChangePassword = lazy(() => import('../pages/auth/ChangePassword'));
const Register = lazy(() => import('../pages/auth/Register/Register'));
const ForgotPassword = lazy(() => import('../pages/auth/forgot-password/ForgotPassword'));
const OTPVerification = lazy(() => import('../pages/auth/forgot-password/OTPVerification'));
const SetPassword = lazy(() => import('../pages/auth/forgot-password/SetPassword'));

// Main Pages
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));
const Home = lazy(() => import('../pages/home/Home'));

// Task Pages
const TaskDetail = lazy(() => import('../pages/tasks/TaskDetail/TaskDetail'));
const TaskForm = lazy(() => import('../pages/tasks/TaskForm/TaskForm'));
const TaskList = lazy(() => import('../pages/tasks/TaskList/TaskList'));

// Other Pages (existing)
const NotFound = lazy(() => import('../pages/NotFound'));

// Protected Route wrapper
const ProtectedRoute = lazy(() => import('./ProtectedRoute'));

const UserList = lazy(() => import('../pages/users/UserList'));
const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path='/' element={<Home />} />
        <Route path='/home' element={<Navigate to='/' replace />} />

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/set-password' element={<SetPassword />} />
          <Route path='/verify-otp' element={<OTPVerification />} />
        </Route>

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route path='/dashboard' element={<Dashboard />} />

          {/* Task Management */}
          <Route path='/tasks' element={<TaskList />} />
          <Route path='/tasks/new' element={<TaskForm />} />
          <Route
            path='/tasks/:id'
            element={
              <Suspense fallback={<PageLoader />}>
                <TaskDetail />
              </Suspense>
            }
          />
          <Route path='/tasks/:id/edit' element={<TaskForm />} />

          {/* Profile */}
          <Route path='/profile' element={<Profile />} />
          <Route path='/auth/change-password' element={<ChangePassword />} />
          <Route path='/settings' element={<div>Settings Page</div>} />
          <Route path='/users' element={<UserList />} />
        </Route>

        {/* 404 Not Found */}
        <Route path='*' element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
