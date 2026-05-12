/**
 * hooks/useAuth.ts
 */

/*import { useState, useCallback, useEffect } from 'react';
import type { User, LoginCredentials, AuthState } from '../types';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
const STORAGE_KEY = 'canteen_auth';

const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'student@college.edu': {
    password: 'student123',
    user: { id: 'stu_1', email: 'student@college.edu', name: 'Alex Johnson', role: 'student' },
  },
  'admin@canteen.edu': {
    password: 'admin123',
    user: { id: 'adm_1', email: 'admin@canteen.edu', name: 'Manager Sarah', role: 'admin' },
  },
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return context;
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const user = JSON.parse(stored) as User;
        setState({ user, isLoading: false, error: null });
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        setState((s: AuthState) => ({ ...s, isLoading: false }));
      }
    } else {
      setState((s: AuthState) => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setState((s: AuthState) => ({ ...s, isLoading: true, error: null }));
    await new Promise((r: (value: unknown) => void) => setTimeout(r, 800));

    const mock = MOCK_USERS[credentials.email.toLowerCase()];
    if (!mock || mock.password !== credentials.password) {
      setState({ user: null, isLoading: false, error: 'Invalid email or password' });
      return false;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(mock.user));
    setState({ user: mock.user, isLoading: false, error: null });
    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({ user: null, isLoading: false, error: null });
  }, []);

  const clearError = useCallback(() => {
    setState((s: AuthState) => ({ ...s, error: null }));
  }, []);

  return {
    ...state,
    isAuthenticated: !!state.user,
    isStudent: state.user?.role === 'student',
    isAdmin: state.user?.role === 'admin',
    login,
    logout,
    clearError,
  };
}*/
// hooks/useAuth.ts
//export { useAuth } from '../context/AuthContext';
import { useAuth as useAuthContext } from '../context/AuthContext';

export function useAuth() {
  return useAuthContext();
}