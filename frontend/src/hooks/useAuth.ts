import { apiClient } from '@/lib/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { User } from '../types/user';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface VerifyOTPData {
  email: string;
  otp: string;
}

export interface SetPasswordData {
  resetToken: string;
  newPassword: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Auth API functions
const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', {
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
    });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  uploadProfileImage: async (formData: FormData): Promise<User> => {
    const response = await apiClient.post('/auth/upload-profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordData): Promise<{ message: string; otpExpiresAt: string }> => {
    const response = await apiClient.post('/auth/forgot-password', data);
    return response.data;
  },

  verifyOTP: async (data: VerifyOTPData): Promise<{ resetToken: string }> => {
    const response = await apiClient.post('/auth/verify-otp', data);
    return response.data;
  },

  setPassword: async (data: SetPasswordData): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data;
  },
};

// Custom hooks
export const useCurrentUser = () => {
  const token = localStorage.getItem('token');

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: authApi.getCurrentUser,
    enabled: !!token,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      queryClient.setQueryData(['currentUser'], data.user);
      toast.success('Login successful!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Login failed');
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      queryClient.setQueryData(['currentUser'], data.user);
      toast.success('Registration successful!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Registration failed');
    },
  });
};

export const useUploadProfileImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.uploadProfileImage,
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], data);
      localStorage.setItem('user', JSON.stringify(data));
      toast.success('Profile image updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to upload image');
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: () => {
      toast.success('OTP sent to your email successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to send OTP');
    },
  });
};

export const useVerifyOTP = () => {
  return useMutation({
    mutationFn: authApi.verifyOTP,
    onSuccess: () => {
      toast.success('OTP verified successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Invalid OTP');
    },
  });
};

export const useSetPassword = () => {
  return useMutation({
    mutationFn: authApi.setPassword,
    onSuccess: () => {
      toast.success('Password updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update password');
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    queryClient.clear();
    window.location.href = '/auth';
  };
};

// Helper function to get stored user
export const getStoredUser = (): User | null => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

// Helper function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};
