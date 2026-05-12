import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginCredentials, AuthState } from '../types';

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

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  isStudent: boolean;
  isAdmin: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
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
        setState((s) => ({ ...s, isLoading: false }));
      }
    } else {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    await new Promise((r) => setTimeout(r, 800));

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
    setState((s) => ({ ...s, error: null }));
  }, []);

  return (
    <AuthContext.Provider value={{
      ...state,
      isAuthenticated: !!state.user,
      isStudent: state.user?.role === 'student',
      isAdmin: state.user?.role === 'admin',
      login,
      logout,
      clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}