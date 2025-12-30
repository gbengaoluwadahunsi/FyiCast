import React from 'react';

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function Logo({ className = "", size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6 rounded-lg",
    md: "h-8 w-8 rounded-lg",
    lg: "h-10 w-10 rounded-xl",
    xl: "h-12 w-12 rounded-2xl",
  };

  return (
    <div className={`relative flex items-center justify-center bg-gradient-to-tr from-cyan-500 via-blue-500 to-violet-600 shadow-lg shadow-cyan-500/20 ${sizeClasses[size]} ${className}`}>
      {/* Bespoke "F" + Chart Icon */}
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-[60%] w-[60%] text-white"
      >
        {/* Vertical stem (F) */}
        <path d="M6 4C6 2.89543 6.89543 2 8 2H10C10.5523 2 11 2.44772 11 3V21C11 21.5523 10.5523 22 10 22H8C6.89543 22 6 21.1046 6 20V4Z" fill="currentColor"/>
        {/* Top bar / Rising chart */}
        <path d="M11 6H18C19.1046 6 20 6.89543 20 8V10C20 10.5523 19.5523 11 19 11H11V6Z" fill="currentColor"/>
        {/* Middle bar / Secondary metric */}
        <path d="M11 14H15C16.1046 14 17 14.8954 17 16V17C17 17.5523 16.5523 18 16 18H11V14Z" fill="currentColor"/>
        {/* Ascent dot */}
        <circle cx="19" cy="5" r="2" className="text-cyan-200" fill="currentColor"/>
      </svg>
    </div>
  );
}



