/**
 * context/AuthContext.tsx
 *
 * Provides real Supabase authentication (email / password).
 * Stores name & role in Supabase user_metadata so the rest
 * of the app can use the same User type it always has.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import type { ReactNode } from 'react';
import type { User, LoginCredentials, SignupCredentials, AuthState, UserRole } from '../types';
import { supabase } from '../services/supabaseClient';

import type { Session } from '@supabase/supabase-js';

/* ── Helpers ─────────────────────────────────────────────── */

/** Map a Supabase session to our app User. */
function sessionToUser(session: Session | null): User | null {
  if (!session?.user) return null;

  const u = session.user;
  const meta = u.user_metadata ?? {};

  return {
    id: u.id,
    email: u.email ?? '',
    name: (meta.name as string) ?? u.email ?? '',
    role: ((meta.role as string) ?? 'student') as UserRole,
    avatar: (meta.avatar_url as string) ?? undefined,
  };
}

/* ── Context value shape ─────────────────────────────────── */

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  isStudent: boolean;
  isAdmin: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  signup: (credentials: SignupCredentials) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/* ── Provider ────────────────────────────────────────────── */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  /* Hydrate session on mount + listen for auth changes */
  useEffect(() => {
    // 1. Read the current session from local storage / cookie
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        user: sessionToUser(session),
        isLoading: false,
        error: null,
      });
    });

    // 2. Subscribe to auth state changes (login, logout, token refresh, tab sync)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState((prev) => ({
        ...prev,
        user: sessionToUser(session),
        isLoading: false,
      }));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /* ── Login ──────────────────────────────────────────────── */
  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setState((s) => ({ ...s, isLoading: true, error: null }));

    const { error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      setState({ user: null, isLoading: false, error: error.message });
      return false;
    }

    // onAuthStateChange will update the user
    return true;
  }, []);

  /* ── Sign Up ────────────────────────────────────────────── */
  const signup = useCallback(async (credentials: SignupCredentials): Promise<boolean> => {
    setState((s) => ({ ...s, isLoading: true, error: null }));

    const { error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          name: credentials.name,
          role: credentials.role,
        },
      },
    });

    if (error) {
      setState({ user: null, isLoading: false, error: error.message });
      return false;
    }

    // If email confirmation is OFF the session fires immediately via onAuthStateChange.
    // If it's ON the user will see a "check your inbox" message in the UI.
    setState((s) => ({ ...s, isLoading: false }));
    return true;
  }, []);

  /* ── Logout ─────────────────────────────────────────────── */
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setState({ user: null, isLoading: false, error: null });
  }, []);

  /* ── Clear Error ────────────────────────────────────────── */
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
      signup,
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