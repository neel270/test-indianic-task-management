import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
} from '../store/slices/authSlice';
import apiClient, { setAuthToken } from '@/lib/axios';
import { toastError, toastSuccess } from './use-toast';
import { logger } from '@/lib/logger';

// Types
interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface AuthResponse {
  data: {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
  success: boolean;
  message?: string;
}

interface ForgotPasswordRequest {
  email: string;
}

interface VerifyOTPRequest {
  email: string;
  otp: string;
}

interface SetNewPasswordRequest {
  email?: string;
  otp?: string;
  newPassword: string;
  resetToken: string;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Auth API hooks
export const useLogin = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async (credentials: LoginRequest): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    },
    onMutate: () => {
      dispatch(loginStart());
    },
    onSuccess: data => {
      setAuthToken(data.data.tokens.accessToken);

      // Update Redux state
      dispatch(loginSuccess({ user: data.data.user, token: data.data.tokens.accessToken }));

      // Update auth state in React Query cache
      queryClient.setQueryData(['auth', 'user'], data.data.user);
      queryClient.setQueryData(['auth', 'isAuthenticated'], true);

      toastSuccess('Logged in successfully!');
    },
    onError: (error: Error) => {
      dispatch(loginFailure(error.message || 'Login failed'));
      toastError(error.message || 'Login failed');
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: RegisterRequest): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>('/auth/register', userData);
      return response.data;
    },
    onSuccess: data => {
      // Update auth state in React Query cache
      queryClient.setQueryData(['auth', 'user'], data.data.user);
      queryClient.setQueryData(['auth', 'isAuthenticated'], true);

      toastSuccess('Account created successfully!');
    },
    onError: (error: Error) => {
      toastError(error.message || 'Registration failed');
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      try {
        await apiClient.post('/auth/logout');
      } catch (error) {
        // Continue with logout even if API call fails
        logger.warn('Logout API call failed, but continuing with local logout');
      }
    },
    onSettled: () => {
      // Clear all persisted Redux data (redux-persist)
      setAuthToken('');

      // Update Redux state
      dispatch(logout());

      // Clear all React Query cache to ensure clean state
      queryClient.clear();

      // Show success message
      toastSuccess('Logged out successfully');

      // Navigate to login screen
      navigate('/login', { replace: true });
    },
  });
};

export const useGetProfile = () => {
  return useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: async () => {
      const response = await apiClient.get('/auth/profile');
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (passwordData: ChangePasswordRequest): Promise<{ message: string }> => {
      const response = await apiClient.put<{ message: string }>(
        '/auth/change-password',
        passwordData
      );
      return response.data;
    },
    onSuccess: data => {
      toastSuccess(data.message || 'Password changed successfully');
    },
    onError: (error: Error) => {
      toastError(error.message || 'Failed to change password');
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (emailData: ForgotPasswordRequest): Promise<{ message: string }> => {
      const response = await apiClient.post<{ message: string }>(
        '/auth/forgot-password',
        emailData
      );
      return response.data;
    },
    onSuccess: data => {
      toastSuccess(data.message || 'OTP sent to your email');
    },
    onError: (error: Error) => {
      toastError(error.message || 'Failed to send OTP');
    },
  });
};

export const useVerifyOTP = () => {
  return useMutation({
    mutationFn: async (otpData: VerifyOTPRequest): Promise<{ message: string }> => {
      const response = await apiClient.post<{ message: string }>('/auth/verify-otp', otpData);
      return response.data;
    },
    onSuccess: data => {
      toastSuccess(data.message || 'OTP verified successfully');
    },
    onError: (error: Error) => {
      toastError(error.message || 'Failed to verify OTP');
    },
  });
};

export const useSetNewPassword = () => {
  return useMutation({
    mutationFn: async (passwordData: SetNewPasswordRequest): Promise<{ message: string }> => {
      const response = await apiClient.post<{ message: string }>(
        '/auth/set-password',
        passwordData
      );
      return response.data;
    },
    onSuccess: data => {
      toastSuccess(data.message || 'Password reset successfully');
    },
    onError: (error: Error) => {
      toastError(error.message || 'Failed to reset password');
    },
  });
};

// Profile update hook
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async (profileData: { firstName: string; lastName: string; email: string }) => {
      const response = await apiClient.put('/auth/profile', profileData);
      return response.data;
    },
    onMutate: () => {
      dispatch(updateProfileStart());
    },
    onSuccess: data => {
      // Update Redux state
      dispatch(updateProfileSuccess(data.data));

      // Update React Query cache
      queryClient.setQueryData(['auth', 'profile'], data.data);
      queryClient.setQueryData(['auth', 'user'], data.data);

      toastSuccess('Profile updated successfully!');
    },
    onError: (error: Error) => {
      dispatch(updateProfileFailure(error.message || 'Failed to update profile'));
      toastError(error.message || 'Failed to update profile');
    },
  });
};

// Profile image upload hook
export const useUploadProfileImage = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async (file: File): Promise<{ success: boolean; data?: { imageUrl: string }; message?: string }> => {
      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await apiClient.post<{ success: boolean; data?: { imageUrl: string }; message?: string }>(
        '/auth/upload-profile-image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    },
    onSuccess: (data, file) => {
      if (data.success && data.data?.imageUrl) {
        toastSuccess('Profile image updated successfully!');

        // Update React Query cache
        queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] });
        queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });

        logger.info('Profile image upload completed', {
          fileName: file.name,
          fileSize: file.size,
          imageUrl: data.data.imageUrl
        });
      }
    },
    onError: (error: Error, file) => {
      toastError(error.message || 'Failed to upload image');
      logger.error('Profile image upload failed', {
        error: error.message,
        fileName: file.name,
        fileSize: file.size
      });
    },
  });
};

// Helper hook to check authentication status
export const useAuth = () => {
  const { data: user, isLoading, error } = useGetProfile();

  return {
    user,
    isLoading,
    error,
  };
};
