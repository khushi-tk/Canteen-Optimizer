/**
 * pages/LoginPage.tsx
 */

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Spinner, ErrorBanner } from '../components/ui';

export function LoginPage() {
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();
    await login({ email, password });
  };

  const quickFill = (role: 'student' | 'admin') => {
    if (role === 'student') {
      setEmail('student@college.edu');
      setPassword('student123');
    } else {
      setEmail('admin@canteen.edu');
      setPassword('admin123');
    }
  };

  return (
    /* 
      Outer shell: fills the whole screen on any device,
      centers the phone-sized content on desktop 
    */
    <div className="flex min-h-screen items-center justify-center bg-gray-950">

      {/*
        Phone frame: fixed portrait dimensions.
        On a real phone this fills the screen naturally.
        On desktop it shows as a centered phone-sized card.
      */}
      <div
        className="relative w-[390px] h-[844px] max-w-full max-h-[100dvh] overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/login-bg.jpg')" }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/45" />

        {/* Scrollable content */}
        <div className="relative z-10 flex flex-col justify-center h-full px-8 overflow-y-auto">

          {/* Logo + branding */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/80 backdrop-blur-sm text-white shadow-lg">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-lg">CanteenCrowd</h1>
            <p className="mt-1 text-sm text-white/90 font-medium drop-shadow-md">College Dining Management</p>
          </div>

          <h2 className="text-base font-semibold text-white mb-4 drop-shadow-md">Sign In</h2>

          {error && (
            <div className="mb-4">
              <ErrorBanner message={error} onRetry={clearError} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-1 drop-shadow-sm">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="you@college.edu"
                required
                className="w-full rounded-lg border border-white/20 bg-white/10 backdrop-blur-md px-3 py-2 text-sm text-white placeholder:text-white/50 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-1 drop-shadow-sm">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg border border-white/20 bg-white/10 backdrop-blur-md px-3 py-2 pr-10 text-sm text-white placeholder:text-white/50 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600/90 backdrop-blur-sm py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-150 hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1"
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" variant="neutral" />
                  <span>Signing in…</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/20">
            <p className="text-xs font-semibold text-white/70 mb-2 drop-shadow-sm">Demo Accounts</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => quickFill('student')}
                className="flex-1 rounded-md bg-white/10 backdrop-blur-sm px-3 py-1.5 text-xs font-bold text-white border border-white/20 hover:bg-white/20 transition-colors"
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => quickFill('admin')}
                className="flex-1 rounded-md bg-white/10 backdrop-blur-sm px-3 py-1.5 text-xs font-bold text-white border border-white/20 hover:bg-white/20 transition-colors"
              >
                Admin
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-[10px] uppercase tracking-widest font-bold text-white/60 drop-shadow-sm">
            © {new Date().getFullYear()} College Canteen Services
          </p>

        </div>
      </div>
    </div>
  );
}