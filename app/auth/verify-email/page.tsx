'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useVerifyEmailMutation, useResendVerificationMutation } from '@/lib/store/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }
  }
};

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [resendVerification, { isLoading: isResending }] = useResendVerificationMutation();
  
  const [status, setStatus] = useState<'pending' | 'verifying' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('');
  const [resendSuccess, setResendSuccess] = useState(false);

  // Auto-verify if token is present in URL
  useEffect(() => {
    if (token) {
      handleVerify();
    }
  }, [token]);

  const handleVerify = async () => {
    if (!token) return;
    
    setStatus('verifying');
    try {
      await verifyEmail({ token }).unwrap();
      setStatus('success');
      setMessage('Your email has been verified! You can now access your dashboard.');
    } catch (error: any) {
      setStatus('error');
      setMessage(error.data?.error || 'Verification failed. The link may have expired.');
    }
  };

  const handleResend = async () => {
    if (!email) return;
    
    try {
      await resendVerification({ email }).unwrap();
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (error: any) {
      setMessage(error.data?.error || 'Failed to resend verification email.');
    }
  };

  // If no token, show "check your email" message
  if (!token) {
    return (
      <motion.div 
        className="grid gap-8 w-full max-w-sm mx-auto text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          {/* Email icon */}
          <motion.div 
            className="mx-auto w-20 h-20 rounded-full bg-cyan-500/20 flex items-center justify-center mb-6"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <svg className="w-10 h-10 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </motion.div>
          
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
            Check your email
          </h2>
          <p className="text-slate-400 mb-6">
            We've sent a verification link to{' '}
            {email ? (
              <span className="text-cyan-400 font-medium">{email}</span>
            ) : (
              'your email address'
            )}
            . Click the link to verify your account.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-400">
              <span className="text-white font-medium">Didn't receive the email?</span>
              <br />
              Check your spam folder, or click below to resend.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {resendSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300"
              >
                ✓ Verification email sent! Check your inbox.
              </motion.div>
            ) : (
              <motion.button
                key="button"
                onClick={handleResend}
                disabled={isResending || !email}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-white/10 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isResending ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span 
                      className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Sending...
                  </span>
                ) : (
                  'Resend verification email'
                )}
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div variants={itemVariants} className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#030712] px-2 text-slate-500">or</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Link
            href="/auth/login"
            className="group flex items-center justify-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
          >
            <motion.span animate={{ x: 0 }} whileHover={{ x: -4 }}>←</motion.span>
            Back to login
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  // Token present - show verification status
  return (
    <motion.div 
      className="grid gap-8 w-full max-w-sm mx-auto text-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <AnimatePresence mode="wait">
          {status === 'verifying' && (
            <motion.div
              key="verifying"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="mx-auto w-20 h-20 rounded-full bg-cyan-500/20 flex items-center justify-center mb-6"
              >
                <motion.div 
                  className="h-10 w-10 rounded-full border-3 border-cyan-500/30 border-t-cyan-500"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">Verifying your email...</h2>
              <p className="text-slate-400">Please wait a moment.</p>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="mx-auto w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <motion.svg 
                  className="w-10 h-10 text-emerald-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </motion.svg>
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">Email verified!</h2>
              <p className="text-slate-400 mb-6">{message}</p>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/app/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40"
                >
                  Go to Dashboard
                  <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
                </Link>
              </motion.div>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="mx-auto w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-6"
              >
                <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">Verification failed</h2>
              <p className="text-slate-400 mb-6">{message}</p>
              
              <div className="space-y-3">
                <motion.button
                  onClick={handleResend}
                  disabled={isResending || !email}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-white/10 disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isResending ? 'Sending...' : 'Request new verification link'}
                </motion.button>
                
                <Link
                  href="/auth/login"
                  className="block text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Back to login
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
