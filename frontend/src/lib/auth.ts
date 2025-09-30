import { AuthService } from '@/services/api';

// Initialize auth on module load
AuthService.initializeAuth();

export const signUp = async (email: string, password: string, fullName: string) => {
  try {
    const response = await AuthService.register({
      name: fullName,
      email,
      password,
      role: 'user'
    });

    return {
      data: {
        user: response.user,
        session: { access_token: response.token }
      },
      error: null
    };
  } catch (error: unknown) {
    return {
      data: null,
      error: {
        message: (error as Error).message
      }
    };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const response = await AuthService.login({
      email,
      password
    });

    return {
      data: {
        user: response.user,
        session: { access_token: response.token }
      },
      error: null
    };
  } catch (error: unknown) {
    return {
      data: null,
      error: {
        message: (error as Error).message
      }
    };
  }
};

export const signOut = async () => {
  try {
    await AuthService.logout();
    return { error: null };
  } catch (error: unknown) {
    return {
      error: {
        message: (error as Error).message
      }
    };
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await AuthService.getProfile();
    if (response.success && response.data) {
      return {
        data: {
          user: response.data
        },
        error: null
      };
    }
    throw new Error('Failed to get current user');
  } catch (error: unknown) {
    return {
      data: null,
      error: {
        message: (error as Error).message
      }
    };
  }
};
