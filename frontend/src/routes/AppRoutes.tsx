import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

// Layouts
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';

// Auth Pages
import Login from '../pages/auth/Login/Login';
import Profile from '../pages/auth/Profile/Profile';
import Register from '../pages/auth/Register/Register';
import ForgotPassword from '../pages/auth/forgot-password/ForgotPassword';
import OTPVerification from '../pages/auth/forgot-password/OTPVerification';
import SetPassword from '../pages/auth/forgot-password/SetPassword';

// Main Pages
import Dashboard from '../pages/dashboard/Dashboard';
import Home from '../pages/home/Home';

// Task Pages
import TaskDetail from '../pages/tasks/TaskDetail/TaskDetail';
import TaskForm from '../pages/tasks/TaskForm/TaskForm';
import TaskList from '../pages/tasks/TaskList/TaskList';

// Other Pages (existing)
import NotFound from '../pages/NotFound';

// Protected Route wrapper
import ProtectedRoute from './ProtectedRoute';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Navigate to="/" replace />} />

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/verify-otp" element={<OTPVerification />} />
      </Route>

      {/* Protected Routes */}
      <Route element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Task Management */}
        <Route path="/tasks" element={<TaskList />} />
        <Route path="/tasks/new" element={<TaskForm />} />
        <Route path="/tasks/:id" element={<TaskDetail />} />
        <Route path="/tasks/:id/edit" element={<TaskForm />} />

        {/* User Management */}
        <Route path="/users" element={<div>Users Page</div>} />

        {/* Profile */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<div>Settings Page</div>} />
      </Route>

      {/* 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
