'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useResetPasswordMutation } from '@/lib/store/api';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  useEffect(() => {
    if (!token) {
      setError('Invalid password reset link. Please request a new one.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    try {
      await resetPassword({ token, password }).unwrap();
      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => router.push('/auth/login'), 3000);
    } catch (err: any) {
      setError(err.data?.error || 'Failed to reset password. Please try again.');
    }
  };

  if (success) {
    return (
      <div className="grid gap-8 w-full max-w-sm mx-auto text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Password Reset! 🎉</h2>
          <p className="text-slate-400">
            Your password has been successfully reset. You can now log in with your new password.
          </p>
          <p className="text-sm text-slate-500">Redirecting to login...</p>
        </div>
        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] hover:shadow-cyan-500/40"
        >
          Go to Login →
        </Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="grid gap-8 w-full max-w-sm mx-auto text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-red-500/20 to-rose-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Invalid Link</h2>
          <p className="text-slate-400">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
        </div>
        <Link
          href="/auth/forgot-password"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] hover:shadow-cyan-500/40"
        >
          Request New Link →
        </Link>
        <Link
          href="/auth/login"
          className="group flex items-center justify-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-white"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span> Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 w-full max-w-sm mx-auto">
      <div className="space-y-2 text-center lg:text-left">
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Set new password
        </h2>
        <p className="text-slate-400">
          Your new password must be at least 6 characters.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-5">
        <div className="space-y-2 group">
          <label 
            className="text-xs font-bold uppercase tracking-wide text-slate-500 transition-colors group-focus-within:text-cyan-400" 
            htmlFor="password"
          >
            New password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all duration-300 focus:border-cyan-500/50 focus:bg-white/10 focus:shadow-[0_0_15px_rgba(6,182,212,0.1)] focus:ring-1 focus:ring-cyan-500/50"
            placeholder="Enter new password"
            minLength={6}
          />
        </div>

        <div className="space-y-2 group">
          <label 
            className="text-xs font-bold uppercase tracking-wide text-slate-500 transition-colors group-focus-within:text-cyan-400" 
            htmlFor="confirmPassword"
          >
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all duration-300 focus:border-cyan-500/50 focus:bg-white/10 focus:shadow-[0_0_15px_rgba(6,182,212,0.1)] focus:ring-1 focus:ring-cyan-500/50"
            placeholder="Confirm new password"
            minLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-cyan-500/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <span className="relative z-10">{isLoading ? 'Resetting...' : 'Reset password'}</span>
          {!isLoading && <span className="relative z-10 transition-transform group-hover:translate-x-1">→</span>}
          <div className="absolute inset-0 -z-0 translate-y-full bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"></div>
        </button>
      </form>

      <Link
        href="/auth/login"
        className="group flex items-center justify-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-white"
      >
        <span className="transition-transform group-hover:-translate-x-1">←</span> Back to login
      </Link>
    </div>
  );
}
