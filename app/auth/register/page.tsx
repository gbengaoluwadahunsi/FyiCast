'use client';

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const }
  }
};

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    password: "",
    currency: "USD",
    accept: true,
  });
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { register, isRegistering } = useAuth();

  function handleChange<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    
    if (!form.accept) {
      setError("Please accept the Terms and Privacy Policy");
      return;
    }

    try {
      await register(form.email, form.password, form.name);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    }
  }

  const inputFields = [
    { id: 'name', label: 'Full Name', placeholder: 'Jane Doe', type: 'text', key: 'name' as const },
    { id: 'company', label: 'Company', placeholder: 'FyiCast Inc.', type: 'text', key: 'company' as const },
    { id: 'email', label: 'Work Email', placeholder: 'jane@acme.com', type: 'email', key: 'email' as const, full: true },
    { id: 'password', label: 'Password', placeholder: 'Create a strong password', type: 'password', key: 'password' as const, full: true },
  ];

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
          Create account
        </motion.h2>
        <motion.p 
          className="text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors underline decoration-cyan-500/30 underline-offset-4 hover:decoration-cyan-400">
            Sign in
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
        <div className="grid gap-5 sm:grid-cols-2">
          {inputFields.slice(0, 2).map((field, index) => (
            <motion.div 
              key={field.id}
              className="space-y-2 group"
              variants={itemVariants}
              custom={index}
            >
              <motion.label 
                className={`text-xs font-bold uppercase tracking-wide transition-colors duration-300 ${
                  focusedField === field.id ? 'text-cyan-400' : 'text-slate-500'
                }`}
                htmlFor={field.id}
                animate={{ 
                  x: focusedField === field.id ? 4 : 0,
                  color: focusedField === field.id ? '#22d3ee' : '#64748b'
                }}
              >
                {field.label}
              </motion.label>
              <motion.div
                animate={{
                  boxShadow: focusedField === field.id 
                    ? '0 0 20px rgba(6, 182, 212, 0.15)' 
                    : '0 0 0px rgba(6, 182, 212, 0)'
                }}
                className="rounded-xl"
              >
                <input
                  id={field.id}
                  required
                  type={field.type}
                  value={form[field.key] as string}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  onFocus={() => setFocusedField(field.id)}
                  onBlur={() => setFocusedField(null)}
                  className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all duration-300 focus:border-cyan-500/50 focus:bg-white/10 focus:ring-1 focus:ring-cyan-500/50"
                  placeholder={field.placeholder}
                />
              </motion.div>
            </motion.div>
          ))}
        </div>
        
        <motion.div className="space-y-2 group" variants={itemVariants}>
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
            Work Email
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
              required
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all duration-300 focus:border-cyan-500/50 focus:bg-white/10 focus:ring-1 focus:ring-cyan-500/50"
              placeholder="jane@acme.com"
            />
          </motion.div>
        </motion.div>
        
        <motion.div className="space-y-2 group" variants={itemVariants}>
          <motion.label 
            className={`text-xs font-bold uppercase tracking-wide transition-colors duration-300 ${
              focusedField === 'currency' ? 'text-cyan-400' : 'text-slate-500'
            }`}
            htmlFor="currency"
            animate={{ 
              x: focusedField === 'currency' ? 4 : 0,
              color: focusedField === 'currency' ? '#22d3ee' : '#64748b'
            }}
          >
            Reporting Currency
          </motion.label>
          <motion.div 
            className="relative"
            animate={{
              boxShadow: focusedField === 'currency' 
                ? '0 0 20px rgba(6, 182, 212, 0.15)' 
                : '0 0 0px rgba(6, 182, 212, 0)'
            }}
          >
            <select
              id="currency"
              value={form.currency}
              onChange={(e) => handleChange("currency", e.target.value as typeof form.currency)}
              onFocus={() => setFocusedField('currency')}
              onBlur={() => setFocusedField(null)}
              className="block w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all duration-300 focus:border-cyan-500/50 focus:bg-white/10 focus:ring-1 focus:ring-cyan-500/50"
            >
              <option value="USD">USD · US Dollar</option>
              <option value="EUR">EUR · Euro</option>
              <option value="GBP">GBP · Pound sterling</option>
              <option value="MYR">MYR · Malaysian ringgit</option>
              <option value="SGD">SGD · Singapore dollar</option>
            </select>
            <motion.div 
              className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400"
              animate={{ 
                rotate: focusedField === 'currency' ? 180 : 0,
                color: focusedField === 'currency' ? '#22d3ee' : '#94a3b8'
              }}
              transition={{ duration: 0.2 }}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div className="space-y-2 group" variants={itemVariants}>
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
              required
              type="password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all duration-300 focus:border-cyan-500/50 focus:bg-white/10 focus:ring-1 focus:ring-cyan-500/50"
              placeholder="Create a strong password"
            />
          </motion.div>
        </motion.div>

        <motion.label 
          className="flex items-start gap-3 text-sm text-slate-400 cursor-pointer group"
          variants={itemVariants}
          whileHover={{ x: 2 }}
        >
          <motion.input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-white/10 bg-white/5 text-cyan-500 focus:ring-cyan-500/20 focus:ring-offset-0 transition-colors cursor-pointer"
            checked={form.accept}
            onChange={() => handleChange("accept", !form.accept)}
            whileTap={{ scale: 0.9 }}
          />
          <span className="group-hover:text-slate-300 transition-colors">
            I agree to the{" "}
            <Link href="/legal/terms" className="font-medium text-white hover:underline hover:text-cyan-400 transition-colors">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/legal/privacy" className="font-medium text-white hover:underline hover:text-cyan-400 transition-colors">
              Privacy Policy
            </Link>
            .
          </span>
        </motion.label>

        <motion.button
          type="submit"
          disabled={isRegistering}
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          variants={itemVariants}
          whileHover={{ scale: 1.02, boxShadow: "0 10px 40px -10px rgba(6, 182, 212, 0.5)" }}
          whileTap={{ scale: 0.98 }}
        >
          <AnimatePresence mode="wait">
            {isRegistering ? (
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
                Creating workspace...
              </motion.span>
            ) : (
              <motion.span
                key="default"
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Create Workspace
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
            transition={{ delay: 0.6, duration: 0.8 }}
          />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <motion.span 
            className="bg-[#030712] px-2 text-slate-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            No credit card required
          </motion.span>
        </div>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <Link
          href="/"
          className="group flex items-center justify-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-white"
        >
          <motion.span 
            className="transition-transform"
            animate={{ x: 0 }}
            whileHover={{ x: -4 }}
          >
            ←
          </motion.span>{" "}
          Back to homepage
        </Link>
      </motion.div>
    </motion.div>
  );
}
