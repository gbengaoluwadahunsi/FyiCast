'use client';

import { motion, HTMLMotionProps, Variants } from 'framer-motion';
import { ReactNode } from 'react';

// Fade in from bottom
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }
  },
};

// Fade in from left
export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }
  },
};

// Fade in from right
export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }
  },
};

// Scale fade
export const scaleFade: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const }
  },
};

// Stagger container
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Stagger item
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

// Pulse animation
export const pulse: Variants = {
  hidden: { scale: 1 },
  visible: {
    scale: [1, 1.02, 1],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
};

// Glow effect
export const glow: Variants = {
  hidden: { opacity: 0.5 },
  visible: {
    opacity: [0.5, 1, 0.5],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
};

interface MotionDivProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  variant?: 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'scaleFade' | 'stagger' | 'staggerItem';
  delay?: number;
}

const variantMap = {
  fadeInUp,
  fadeInLeft,
  fadeInRight,
  scaleFade,
  stagger: staggerContainer,
  staggerItem,
};

export function MotionDiv({ 
  children, 
  variant = 'fadeInUp', 
  delay = 0,
  ...props 
}: MotionDivProps) {
  const selectedVariant = variantMap[variant];
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={selectedVariant}
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Page transition wrapper
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const }}
    >
      {children}
    </motion.div>
  );
}

// Animated card with hover effects
interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hoverScale?: number;
  hoverGlow?: boolean;
}

export function AnimatedCard({ 
  children, 
  className = '', 
  delay = 0,
  hoverScale = 1.02,
  hoverGlow = true,
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const }}
      whileHover={{ 
        scale: hoverScale,
        boxShadow: hoverGlow ? '0 20px 40px -10px rgba(6, 182, 212, 0.15)' : undefined,
      }}
      whileTap={{ scale: 0.98 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Animated button
interface AnimatedButtonProps extends HTMLMotionProps<'button'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function AnimatedButton({ 
  children, 
  variant = 'primary',
  className = '',
  ...props 
}: AnimatedButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
}

// Animated list
export function AnimatedList({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {children}
    </motion.div>
  );
}

// Animated list item
export function AnimatedListItem({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
}

// Number counter animation
interface AnimatedCounterProps {
  from?: number;
  to: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function AnimatedCounter({
  from = 0,
  to,
  duration = 1.5,
  className = '',
  prefix = '',
  suffix = '',
}: AnimatedCounterProps) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {prefix}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {to.toLocaleString()}
        </motion.span>
        {suffix}
      </motion.span>
    </motion.span>
  );
}

// Magnetic effect wrapper
export function MagneticWrapper({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
    >
      {children}
    </motion.div>
  );
}

