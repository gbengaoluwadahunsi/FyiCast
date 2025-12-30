// lib/hooks/useAuth.ts

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { 
  useLoginMutation, 
  useRegisterMutation, 
  useLogoutMutation,
  useGetCurrentUserQuery 
} from '../store/api';
import { setCredentials, clearCredentials } from '../store/slices/authSlice';
import type { RootState } from '../store';

export const useAuth = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, workspaceId, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const [loginMutation, { isLoading: isLoggingIn }] = useLoginMutation();
  const [registerMutation, { isLoading: isRegistering }] = useRegisterMutation();
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();

  // Check current user on mount (cookies are sent automatically)
  const { refetch: refetchUser } = useGetCurrentUserQuery(undefined, {
    skip: isAuthenticated, // Skip if already authenticated
  });

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const result = await loginMutation({ email, password }).unwrap();
        
        // Check if email is verified before allowing dashboard access
        if (!result.user.email_verified) {
          router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
          return result;
        }
        
        // No need to store tokens - they're in HTTP-only cookies now
        // Update Redux state with user info
        dispatch(
          setCredentials({
            user: result.user,
            workspaceId: result.workspace_id,
          })
        );
        router.push('/app/dashboard');
        return result;
      } catch (error: any) {
        throw new Error(error.data?.error || 'Login failed');
      }
    },
    [loginMutation, dispatch, router]
  );

  const register = useCallback(
    async (email: string, password: string, fullName: string) => {
      try {
        const result = await registerMutation({
          email,
          password,
          full_name: fullName,
        }).unwrap();
        
        // Don't set credentials yet - user needs to verify email first
        // Redirect to verify email page with email param
        router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
        return result;
      } catch (error: any) {
        throw new Error(error.data?.error || 'Registration failed');
      }
    },
    [registerMutation, router]
  );

  const logout = useCallback(async () => {
    try {
      await logoutMutation().unwrap();
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API error:', error);
    }
    dispatch(clearCredentials());
    router.push('/auth/login');
  }, [logoutMutation, dispatch, router]);

  // Restore session from cookies on page load
  const restoreSession = useCallback(async () => {
    try {
      const result = await refetchUser().unwrap();
      if (result?.user) {
        dispatch(
          setCredentials({
            user: result.user,
            workspaceId: result.workspaces?.[0]?.id || null,
          })
        );
        return true;
      }
    } catch (error) {
      // No valid session
      return false;
    }
    return false;
  }, [refetchUser, dispatch]);

  return {
    user,
    workspaceId,
    isAuthenticated,
    login,
    register,
    logout,
    restoreSession,
    isLoggingIn,
    isRegistering,
    isLoggingOut,
  };
};
