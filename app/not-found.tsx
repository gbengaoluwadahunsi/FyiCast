'use client';

import Link from 'next/link';
import Logo from '@/components/Logo';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Animated Background Effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>
          
          <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 mb-4">
            404
          </h1>
          
          <h2 className="text-2xl font-bold text-white mb-4">
            Page Not Found
          </h2>
          
          <p className="text-slate-400 mb-8 leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
            Let's get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold text-sm hover:opacity-90 transition-all hover:shadow-lg hover:shadow-cyan-500/25"
            >
              Go to Homepage
            </Link>
            <Link
              href="/app/dashboard"
              className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-white font-semibold text-sm hover:bg-white/10 transition-all"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

