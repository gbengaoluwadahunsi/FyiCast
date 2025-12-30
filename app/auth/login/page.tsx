// app/auth/login/page.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  const { login, isLoggingIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <motion.div 
      className="grid gap-8 w-full max-w-sm mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="space-y-2 text-center lg:text-left" variants={itemVariants}>
        <motion.h2 
          className="text-3xl font-bold tracking-tight text-white"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          Welcome back
        </motion.h2>
        <motion.p 
          className="text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Don't have an account?{" "}
          <Link href="/auth/register" className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors underline decoration-cyan-500/30 underline-offset-4 hover:decoration-cyan-400">
            Sign up for free
          </Link>
        </motion.p>
      </motion.div>
      
      <AnimatePresence mode="wait">
        {error && (
          <motion.div 
            className="bg-red-500/10 border border-red-500/20 text-red-200 p-3 rounded-xl text-sm"
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {error}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form onSubmit={handleSubmit} className="grid gap-5" variants={itemVariants}>
        <motion.div 
          className="space-y-2 group"
          variants={itemVariants}
        >
          <motion.label 
            className={`text-xs font-bold uppercase tracking-wide transition-colors duration-300 ${
              focusedField === 'email' ? 'text-cyan-400' : 'text-slate-500'
            }`}
            htmlFor="email"
            animate={{ 
              x: focusedField === 'email' ? 4 : 0,
              color: focusedField === 'email' ? '#22d3ee' : '#64748b'
            }}
          >
            Email
          </motion.label>
          <motion.div
            animate={{
              boxShadow: focusedField === 'email' 
                ? '0 0 20px rgba(6, 182, 212, 0.15)' 
                : '0 0 0px rgba(6, 182, 212, 0)'
            }}
            className="rounded-xl"
          >
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all duration-300 focus:border-cyan-500/50 focus:bg-white/10 focus:ring-1 focus:ring-cyan-500/50"
              placeholder="name@company.com"
              required
            />
          </motion.div>
        </motion.div>
        
        <motion.div className="space-y-2 group" variants={itemVariants}>
          <div className="flex items-center justify-between">
            <motion.label 
              className={`text-xs font-bold uppercase tracking-wide transition-colors duration-300 ${
                focusedField === 'password' ? 'text-cyan-400' : 'text-slate-500'
              }`}
              htmlFor="password"
              animate={{ 
                x: focusedField === 'password' ? 4 : 0,
                color: focusedField === 'password' ? '#22d3ee' : '#64748b'
              }}
            >
              Password
            </motion.label>
            <motion.div whileHover={{ x: 2 }}>
              <Link href="/auth/forgot-password" className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                Forgot password?
              </Link>
            </motion.div>
          </div>
          <motion.div
            animate={{
              boxShadow: focusedField === 'password' 
                ? '0 0 20px rgba(6, 182, 212, 0.15)' 
                : '0 0 0px rgba(6, 182, 212, 0)'
            }}
            className="rounded-xl"
          >
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all duration-300 focus:border-cyan-500/50 focus:bg-white/10 focus:ring-1 focus:ring-cyan-500/50"
              placeholder="••••••••"
              required
            />
          </motion.div>
        </motion.div>

        <motion.button
          type="submit"
          disabled={isLoggingIn}
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          variants={itemVariants}
          whileHover={{ scale: 1.02, boxShadow: "0 10px 40px -10px rgba(6, 182, 212, 0.5)" }}
          whileTap={{ scale: 0.98 }}
        >
          <AnimatePresence mode="wait">
            {isLoggingIn ? (
              <motion.span
                key="loading"
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.span 
                  className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Signing in...
              </motion.span>
            ) : (
              <motion.span
                key="default"
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Sign In
                <motion.span 
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </motion.span>
            )}
          </AnimatePresence>
          <motion.div 
            className="absolute inset-0 -z-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0"
            whileHover={{ opacity: 1, y: 0 }}
            initial={{ y: "100%" }}
            transition={{ duration: 0.3 }}
          />
        </motion.button>
      </motion.form>

      <motion.div className="relative" variants={itemVariants}>
        <div className="absolute inset-0 flex items-center">
          <motion.div 
            className="w-full border-t border-white/10"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <motion.span 
            className="bg-[#030712] px-2 text-slate-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Secured by FyiCast
          </motion.span>
        </div>
      </motion.div>
    </motion.div>
  );
}
