'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForgotPasswordMutation } from '@/lib/store/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await forgotPassword({ email }).unwrap();
      setSubmitted(true);
    } catch (err: any) {
      setError(err.data?.error || 'Something went wrong. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div className="grid gap-8 w-full max-w-sm mx-auto text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Check your email</h2>
          <p className="text-slate-400">
            If an account exists for <span className="text-white font-medium">{email}</span>, 
            we've sent a password reset link.
          </p>
          <p className="text-sm text-slate-500">
            The link will expire in 1 hour.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => {
              setSubmitted(false);
              setEmail('');
            }}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            Try a different email
          </button>
          <Link
            href="/auth/login"
            className="group flex items-center justify-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-white"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span> Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 w-full max-w-sm mx-auto">
      <div className="space-y-2 text-center lg:text-left">
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Forgot password?
        </h2>
        <p className="text-slate-400">
          No worries, we'll send you reset instructions.
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
            htmlFor="email"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all duration-300 focus:border-cyan-500/50 focus:bg-white/10 focus:shadow-[0_0_15px_rgba(6,182,212,0.1)] focus:ring-1 focus:ring-cyan-500/50"
            placeholder="jane@acme.com"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-cyan-500/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <span className="relative z-10">{isLoading ? 'Sending...' : 'Send reset link'}</span>
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
