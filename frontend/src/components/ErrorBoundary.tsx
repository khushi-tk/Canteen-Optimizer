/**
 * components/ErrorBoundary.tsx
 *
 * Class-based error boundary (the only class component in the app).
 * Catches render errors, logs them, and shows a friendly fallback UI
 * with retry and refresh options.  In dev mode a collapsible stack
 * trace is shown.
 *
 * Props:
 *   title?       — customizable error title
 *   description? — customizable description
 *   children     — wrapped component tree
 */

import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  title?: string;
  description?: string;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
  errorStack: string;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '', errorStack: '' };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      errorMessage: error.message,
      errorStack: error.stack ?? '',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Production: swap for Sentry.captureException(error, { extra: info })
    console.error('[ErrorBoundary]', error, info);
  }

  private handleReset = () => {
    this.setState({ hasError: false, errorMessage: '', errorStack: '' });
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const title = this.props.title ?? 'Something went wrong';
    const description =
      this.props.description ??
      'An unexpected error occurred. Please try again or refresh the page.';
    const stackLines = this.state.errorStack.split('\n').slice(0, 6).join('\n');

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <span className="text-6xl mb-4">💥</span>
        <h1 className="text-xl font-black text-slate-800">{title}</h1>
        <p className="mt-2 text-sm text-slate-500 max-w-sm">{description}</p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={this.handleReset}
            className="rounded-2xl bg-brand-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(249,115,22,0.35)] transition-all duration-150 hover:bg-brand-600 active:scale-95"
          >
            Try Again
          </button>
          <button
            onClick={this.handleRefresh}
            className="rounded-2xl bg-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 transition-all duration-150 hover:bg-slate-300 active:scale-95"
          >
            Refresh Page
          </button>
        </div>

        {/* Dev-only stack trace */}
        {import.meta.env.DEV && this.state.errorMessage && (
          <details className="mt-6 w-full max-w-sm text-left">
            <summary className="cursor-pointer text-xs font-semibold text-slate-400 hover:text-slate-600">
              Error details (dev only)
            </summary>
            <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-800 p-3 text-[10px] text-emerald-300 leading-relaxed">
              {this.state.errorMessage}
              {'\n\n'}
              {stackLines}
            </pre>
          </details>
        )}
      </div>
    );
  }
}
