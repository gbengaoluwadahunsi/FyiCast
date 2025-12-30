'use client';

import Link from "next/link";
import Logo from "../components/Logo";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0 },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Animated Section Component
function AnimatedSection({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainer}
      transition={{ duration: 0.6 }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// Animated Card Component
function AnimatedCard({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ delay, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Glowing text component
function GlowingText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.span
      className={className}
      animate={{
        textShadow: [
          "0 0 20px rgba(6, 182, 212, 0)",
          "0 0 30px rgba(6, 182, 212, 0.3)",
          "0 0 20px rgba(6, 182, 212, 0)",
        ],
      }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.span>
  );
}

// Animated counter for stats
function AnimatedCounter({ value, suffix = '', prefix = '' }: { value: number; suffix?: string; prefix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
    >
      {prefix}
      <motion.span
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {value.toLocaleString()}
      </motion.span>
      {suffix}
    </motion.span>
  );
}

// Magnetic button component
function MagneticButton({ children, href, className = '' }: { children: React.ReactNode; href: string; className?: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Link href={href} className={className}>
        {children}
      </Link>
    </motion.div>
  );
}

export default function Home() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <div ref={containerRef} className="min-h-screen text-slate-100 selection:bg-indigo-500/30 overflow-x-hidden flex flex-col bg-[#030712]">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 -z-20">
        <motion.div 
          className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[150px]"
          animate={{ 
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px]"
          animate={{ 
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Navbar - Floating Pill */}
      <motion.div 
        className="fixed top-6 inset-x-0 z-50 flex justify-center px-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <header className="flex items-center justify-between gap-4 rounded-full border border-white/10 bg-black/50 px-5 py-2.5 shadow-xl shadow-black/20 backdrop-blur-md transition-all hover:bg-black/60 hover:border-white/15 w-full max-w-4xl">
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              <Logo size="sm" className="shadow-cyan-500/20" />
            </motion.div>
            <span className="text-sm font-bold tracking-tight text-white group-hover:text-cyan-100 transition-colors">
              FyiCast
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            {['Features', 'Workflow', 'Pricing'].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <Link 
                  href={item === 'Pricing' ? '/pricing' : `#${item.toLowerCase()}`} 
                  className="hover:text-white transition-colors relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300" />
                </Link>
              </motion.div>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Link
                href="/auth/login"
                className="hidden text-sm font-medium text-slate-300 hover:text-white transition-colors sm:inline-block"
              >
                Sign in
              </Link>
            </motion.div>
            <MagneticButton
              href="/auth/register"
              className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-black transition-colors hover:bg-slate-100"
            >
              Get Started
            </MagneticButton>
          </div>
        </header>
      </motion.div>

      <main className="grow">
        {/* Hero Section */}
        <motion.section 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative pt-40 pb-20 px-6 lg:px-8 flex flex-col items-center text-center overflow-visible"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            {/* Animated gradient orbs */}
            <motion.div 
              className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px]"
              animate={{ 
                x: [0, 50, 0],
                y: [0, -30, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute top-1/3 right-1/4 w-80 h-80 bg-violet-500/20 rounded-full blur-[100px]"
              animate={{ 
                x: [0, -40, 0],
                y: [0, 40, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-blue-500/20 rounded-full blur-[100px]"
              animate={{ 
                x: [0, 30, 0],
                y: [0, -50, 0],
                scale: [1.1, 1, 1.1],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Floating particles effect with CSS */}
            <div className="absolute inset-0">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-cyan-400/40 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -100, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 4,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Background decorative glows */}
          <motion.div 
            className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full -z-10 pointer-events-none"
            animate={{ opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-cyan-300 backdrop-blur-md mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            v2.0 is now live
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-4xl text-5xl font-extrabold tracking-tight text-white sm:text-7xl mb-8"
          >
            Forecast with{" "}
            <GlowingText className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 via-indigo-400 to-fuchsia-400">
              clarity
            </GlowingText>
            , <br className="hidden sm:block" /> not complexity.
          </motion.h1>
           
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="max-w-2xl text-lg text-slate-400 mb-10 leading-relaxed"
          >
            Replace fragile spreadsheets with a dynamic financial engine. 
            Model scenarios, track runway, and report to stakeholders in seconds.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <motion.div
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px -5px rgba(6,182,212,0.6)" }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link
                href="/auth/register"
                className="inline-flex h-12 items-center justify-center rounded-full bg-cyan-500 px-8 text-base font-bold text-white shadow-[0_0_20px_-5px_rgba(6,182,212,0.5)] transition-all hover:bg-cyan-400"
              >
                Start Free Trial
              </Link>
            </motion.div>
            <motion.button 
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 text-base font-semibold text-white backdrop-blur-sm transition-all"
            >
              <motion.svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-5 h-5 text-slate-400"
                whileHover={{ scale: 1.2 }}
              >
                <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
              </motion.svg>
              View Demo
            </motion.button>
          </motion.div>

          {/* Hero Dashboard Visual */}
          <motion.div 
            initial={{ opacity: 0, y: 60, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const }}
            className="mt-20 relative w-full max-w-6xl perspective-[2000px] group"
          >
            <motion.div 
              className="relative rounded-2xl border border-white/10 bg-slate-900/50 p-2 shadow-2xl backdrop-blur-xl"
              whileHover={{ rotateX: 2, rotateY: -2 }}
              transition={{ duration: 0.5 }}
            >
              <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent rounded-2xl pointer-events-none"></div>
              
              {/* Animated glow border */}
              <motion.div 
                className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-cyan-500/50 via-violet-500/50 to-cyan-500/50 -z-10 blur-sm"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                style={{ backgroundSize: '200% 200%' }}
              />
              
              {/* Window Header */}
              <div className="h-10 border-b border-white/5 flex items-center px-4 gap-2 bg-white/5 rounded-t-xl">
                <motion.div 
                  className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"
                  whileHover={{ scale: 1.2, backgroundColor: "rgba(239, 68, 68, 0.5)" }}
                />
                <motion.div 
                  className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"
                  whileHover={{ scale: 1.2, backgroundColor: "rgba(234, 179, 8, 0.5)" }}
                />
                <motion.div 
                  className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50"
                  whileHover={{ scale: 1.2, backgroundColor: "rgba(16, 185, 129, 0.5)" }}
                />
              </div>
               
              {/* Dashboard Content */}
              <div className="p-6 grid gap-6 md:grid-cols-3">
                {/* Left Col */}
                <div className="md:col-span-2 space-y-6">
                  {/* Main Chart Card */}
                  <motion.div 
                    className="rounded-xl border border-white/5 bg-black/20 p-6 h-64 relative overflow-hidden flex flex-col justify-end"
                    whileHover={{ borderColor: "rgba(255,255,255,0.1)" }}
                  >
                    <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase">Annual Recurring Revenue</p>
                        <h3 className="text-2xl font-bold text-white mt-1">
                          $2.4M{" "}
                          <motion.span 
                            className="text-emerald-400 text-sm"
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            +18%
                          </motion.span>
                        </h3>
                      </div>
                    </div>
                    {/* Animated Chart Line */}
                    <svg className="w-full h-32 overflow-visible" preserveAspectRatio="none">
                      <motion.path 
                        d="M0 100 Q 50 100 100 80 T 200 60 T 300 90 T 400 40 T 500 50 T 600 20 L 600 130 L 0 130 Z" 
                        fill="url(#gradient)" 
                        opacity="0.2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.2 }}
                        transition={{ duration: 1 }}
                      />
                      <motion.path 
                        d="M0 100 Q 50 100 100 80 T 200 60 T 300 90 T 400 40 T 500 50 T 600 20" 
                        fill="none" 
                        stroke="url(#lineGradient)" 
                        strokeWidth="3" 
                        strokeLinecap="round" 
                        className="drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22d3ee" />
                          <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#22d3ee" />
                          <stop offset="100%" stopColor="#818cf8" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </motion.div>
                    
                  <div className="grid grid-cols-2 gap-4">
                    <motion.div 
                      className="rounded-xl border border-white/5 bg-black/20 p-4"
                      whileHover={{ scale: 1.02, borderColor: "rgba(16, 185, 129, 0.3)" }}
                    >
                      <p className="text-xs text-slate-500 mb-1">Cash Runway</p>
                      <p className="text-xl font-bold text-white">14 Months</p>
                      <div className="w-full bg-white/10 h-1 mt-2 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-emerald-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: "75%" }}
                          transition={{ duration: 1.5, delay: 1 }}
                        />
                      </div>
                    </motion.div>
                    <motion.div 
                      className="rounded-xl border border-white/5 bg-black/20 p-4"
                      whileHover={{ scale: 1.02, borderColor: "rgba(248, 113, 113, 0.3)" }}
                    >
                      <p className="text-xs text-slate-500 mb-1">Burn Rate</p>
                      <p className="text-xl font-bold text-white">$42k <span className="text-sm font-normal text-slate-400">/mo</span></p>
                      <div className="w-full bg-white/10 h-1 mt-2 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-red-400 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: "30%" }}
                          transition={{ duration: 1.5, delay: 1.2 }}
                        />
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Right Col */}
                <div className="space-y-4">
                  <motion.div 
                    className="p-4 rounded-xl border border-white/5 bg-white/5"
                    whileHover={{ borderColor: "rgba(255,255,255,0.15)" }}
                  >
                    <p className="text-xs font-bold text-slate-400 mb-3 uppercase">Recent Scenarios</p>
                    <div className="space-y-2">
                      {[
                        { name: "Hiring Plan Q3", color: "bg-blue-400" },
                        { name: "Market Downside", color: "bg-red-400" },
                        { name: "Pricing Update", color: "bg-emerald-400" }
                      ].map((s, i) => (
                        <motion.div 
                          key={s.name} 
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.5 + i * 0.1 }}
                          whileHover={{ x: 5 }}
                        >
                          <motion.div 
                            className={`w-2 h-2 rounded-full ${s.color}`}
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                          />
                          <span className="text-sm text-slate-300">{s.name}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                  <motion.div 
                    className="p-4 rounded-xl border border-white/5 bg-linear-to-b from-indigo-500/10 to-transparent"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.8 }}
                  >
                    <p className="text-xs font-bold text-indigo-300 mb-2">Insight</p>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Revenue is tracking <strong>12% above</strong> base case due to higher enterprise adoption.
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Bento Grid Features */}
        <AnimatedSection id="features" className="py-24 px-6 lg:px-8 max-w-7xl mx-auto">
          <motion.div variants={staggerItem} className="mb-16 md:text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-6">Designed for the modern CFO</h2>
            <p className="text-slate-400 text-lg">Powerful features wrapped in an interface that feels like magic, not work.</p>
          </motion.div>

          <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            {/* Feature 1: Large Span */}
            <AnimatedCard className="md:col-span-2 rounded-3xl border border-white/10 bg-white/2 p-8 relative overflow-hidden group hover:border-white/20 transition-colors" delay={0}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] -z-10 group-hover:bg-cyan-500/20 transition-colors"></div>
              <div className="h-full flex flex-col justify-between relative z-10">
                <div>
                  <motion.div 
                    className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4"
                    whileHover={{ rotate: 10, scale: 1.1 }}
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-2">Driver-Based Models</h3>
                  <p className="text-slate-400 max-w-md">Connect revenue to headcount, marketing spend to leads. Build models that react dynamically to business changes.</p>
                </div>
                {/* Mock UI Element */}
                <motion.div 
                  className="mt-8 rounded-tl-xl border-t border-l border-white/10 bg-black/40 p-4 translate-x-4 translate-y-4 shadow-xl"
                  whileHover={{ x: 0, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="flex gap-4 text-xs font-mono text-slate-400">
                    <span>Input: leads_per_month</span>
                    <motion.span 
                      className="text-cyan-400"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      = 450
                    </motion.span>
                  </div>
                  <div className="flex gap-4 text-xs font-mono text-slate-400 mt-2">
                    <span>Output: arr_growth</span>
                    <motion.span 
                      className="text-emerald-400"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    >
                      + $125k
                    </motion.span>
                  </div>
                </motion.div>
              </div>
            </AnimatedCard>

            {/* Feature 2: Vertical */}
            <AnimatedCard className="rounded-3xl border border-white/10 bg-white/2 p-8 relative overflow-hidden group hover:border-white/20 transition-colors md:row-span-2" delay={0.1}>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-linear-to-t from-violet-500/10 to-transparent"></div>
              <div className="h-full flex flex-col">
                <motion.div 
                  className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400 mb-4"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">Scenario Playbooks</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">Compare Best, Base, and Worst case scenarios side-by-side. Stress test your cash flow.</p>
                
                <div className="mt-auto space-y-3">
                  {["Base Plan", "Recession", "Hypergrowth"].map((plan, i) => (
                    <motion.div 
                      key={plan} 
                      className={`p-3 rounded-lg border ${i===1 ? 'border-violet-500/50 bg-violet-500/10' : 'border-white/5 bg-white/5'} flex justify-between items-center`}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ x: 5 }}
                      viewport={{ once: true }}
                    >
                      <span className="text-sm text-slate-200">{plan}</span>
                      <span className={`text-xs font-bold ${i===1 ? 'text-violet-300' : 'text-slate-500'}`}>
                        {i === 2 ? '+42%' : i === 1 ? '-15%' : '+12%'}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </AnimatedCard>

            {/* Feature 3: Standard */}
            <AnimatedCard className="rounded-3xl border border-white/10 bg-white/2 p-8 relative overflow-hidden group hover:border-white/20 transition-colors" delay={0.2}>
              <div className="h-full flex flex-col justify-between">
                <div>
                  <motion.div 
                    className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4"
                    whileHover={{ rotate: 10, scale: 1.1 }}
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-2">One-Click Reports</h3>
                  <p className="text-slate-400 text-sm">Export boardroom-ready decks automatically.</p>
                </div>
              </div>
            </AnimatedCard>

            {/* Feature 4: Standard */}
            <AnimatedCard className="rounded-3xl border border-white/10 bg-white/2 p-8 relative overflow-hidden group hover:border-white/20 transition-colors" delay={0.3}>
              <div className="h-full flex flex-col justify-between">
                <div>
                  <motion.div 
                    className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 mb-4"
                    whileHover={{ rotate: 10, scale: 1.1 }}
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-2">Real-time Sync</h3>
                  <p className="text-slate-400 text-sm">Live connections to Xero, QuickBooks, and Stripe.</p>
                </div>
              </div>
            </AnimatedCard>
          </motion.div>
        </AnimatedSection>

        {/* Workflow Section */}
        <AnimatedSection id="workflow" className="py-24 px-6 lg:px-8 max-w-7xl mx-auto">
          <motion.div variants={staggerItem} className="mb-16 md:text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-violet-300 backdrop-blur-md mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
              Simple 4-Step Process
            </div>
            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-6">How FyiCast Works</h2>
            <p className="text-slate-400 text-lg">From raw data to boardroom-ready forecasts in minutes, not days.</p>
          </motion.div>

          <div className="relative">
            {/* Connection Line */}
            <motion.div 
              className="absolute top-24 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-white/10 to-transparent hidden lg:block"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5 }}
            />
            
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {/* Steps */}
              {[
                { num: "01", title: "Connect Your Data", desc: "Import from Excel, CSV, or sync directly with Xero & QuickBooks. Your historical data is ready in seconds.", color: "cyan", icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" },
                { num: "02", title: "Set Your Drivers", desc: "Define growth assumptions, seasonality patterns, and key business drivers that power your forecasts.", color: "violet", icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" },
                { num: "03", title: "Model Scenarios", desc: "Create Base, Upside, and Downside scenarios. Stress-test your assumptions against real market conditions.", color: "fuchsia", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
                { num: "04", title: "Share & Export", desc: "Generate polished reports, export to Excel/PDF, or share live dashboards with your stakeholders.", color: "emerald", icon: "M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" }
              ].map((step, i) => (
                <motion.div 
                  key={step.num}
                  variants={staggerItem}
                  className="relative group"
                >
                  <motion.div 
                    className={`absolute -top-3 left-6 z-10 w-10 h-10 rounded-full bg-${step.color}-500/20 border-2 border-${step.color}-500/50 flex items-center justify-center text-${step.color}-400 text-sm font-bold shadow-lg shadow-${step.color}-500/20`}
                    whileHover={{ scale: 1.2, rotate: 10 }}
                  >
                    {step.num}
                  </motion.div>
                  <motion.div 
                    className="pt-8 h-full rounded-3xl border border-white/10 bg-white/2 p-6 transition-all duration-300 hover:border-white/20 hover:bg-white/4"
                    whileHover={{ y: -8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <motion.div 
                      className={`w-12 h-12 rounded-xl bg-${step.color}-500/20 flex items-center justify-center text-${step.color}-400 mb-4`}
                      whileHover={{ rotate: 10, scale: 1.1 }}
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.icon} />
                      </svg>
                    </motion.div>
                    <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* CTA after workflow */}
          <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <MagneticButton
              href="/auth/register"
              className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:border-white/20"
            >
              Start Your Free Trial
              <motion.svg 
                className="w-4 h-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </motion.svg>
            </MagneticButton>
          </motion.div>
        </AnimatedSection>

        {/* Social Proof */}
        <AnimatedSection className="py-20 border-y border-white/5 bg-white/2">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <motion.p 
              variants={staggerItem}
              className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-10"
            >
              Trusted by finance teams at
            </motion.p>
            <motion.div 
              variants={staggerContainer}
              className="flex flex-wrap justify-center gap-12"
            >
              {['FyiCast', 'FyiCast', 'FyiCast', 'FyiCast', 'FyiCast'].map((name, i) => (
                <motion.span 
                  key={i} 
                  variants={staggerItem}
                  className="text-xl font-bold text-white font-serif opacity-50 hover:opacity-100 transition-opacity cursor-default"
                  whileHover={{ scale: 1.1 }}
                >
                  {name}
                </motion.span>
              ))}
            </motion.div>
          </div>
        </AnimatedSection>

        {/* CTA */}
        <AnimatedSection className="py-32 relative overflow-hidden">
          <motion.div 
            className="absolute inset-0 bg-linear-to-t from-cyan-900/20 to-transparent -z-10"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.h2 
              variants={staggerItem}
              className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight"
            >
              Stop guessing. Start guiding.
            </motion.h2>
            <motion.p 
              variants={staggerItem}
              className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto"
            >
              Join hundreds of founders and finance leaders who use FyiCast to navigate their future.
            </motion.p>
            <motion.div
              variants={staggerItem}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/auth/register"
                className="inline-flex h-14 items-center justify-center rounded-full bg-white px-10 text-lg font-bold text-black shadow-2xl transition-transform"
              >
                Get Started for Free
              </Link>
            </motion.div>
          </div>
        </AnimatedSection>
      </main>

      <motion.footer 
        className="border-t border-white/10 bg-black/40 py-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <Logo size="sm" className="shadow-none" />
            <span className="font-bold text-white">FyiCast</span>
          </motion.div>
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} FyiCast Inc. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-slate-400">
            {['Privacy', 'Terms', 'Twitter'].map((item) => (
              <motion.div key={item} whileHover={{ y: -2 }}>
                <Link 
                  href={item === 'Twitter' ? 'https://twitter.com/fyicast' : `/legal/${item.toLowerCase()}`} 
                  target={item === 'Twitter' ? '_blank' : undefined}
                  rel={item === 'Twitter' ? 'noopener noreferrer' : undefined}
                  className="hover:text-white transition-colors"
                >
                  {item}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
