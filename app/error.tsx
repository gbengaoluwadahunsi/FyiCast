'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Animated Background Effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>

          {/* Error Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center">
            <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">
            Something Went Wrong
          </h1>
          
          <p className="text-slate-400 mb-2 leading-relaxed">
            We encountered an unexpected error. Our team has been notified.
          </p>

          {error.digest && (
            <p className="text-xs text-slate-500 mb-6 font-mono">
              Error ID: {error.digest}
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => reset()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold text-sm hover:opacity-90 transition-all hover:shadow-lg hover:shadow-cyan-500/25"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-white font-semibold text-sm hover:bg-white/10 transition-all"
            >
              Go to Homepage
            </Link>
          </div>

          {/* Help Links */}
          <div className="mt-8 pt-8 border-t border-white/5">
            <p className="text-slate-500 text-sm mb-4">Need help?</p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <a href="mailto:support@fyicast.com" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                Contact Support
              </a>
              <a href="/docs" className="text-slate-400 hover:text-white transition-colors">
                Documentation
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

