import { useAuth as useAuthQuery, useGetProfile } from './useAuthApi';

// Re-export the React Query auth hook as useAuth for backward compatibility
export const useAuth = useAuthQuery;

// Re-export other auth hooks for convenience
export {
  useLogin,
  useRegister,
  useLogout,
  useGetProfile,
  useChangePassword,
  useForgotPassword,
  useVerifyOTP,
  useSetNewPassword,
} from './useAuthApi';

// Legacy support - keeping these for backward compatibility
export const useCurrentUser = useGetProfile;
