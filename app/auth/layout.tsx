'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Logo from "../../components/Logo";
import { useGetCurrentUserQuery } from "@/lib/store/api";
import type { RootState } from "@/lib/store";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // Check if user is already authenticated
  const { data: userData, isLoading } = useGetCurrentUserQuery(undefined, {
    skip: isAuthenticated, // Skip if already know they're authenticated
  });
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated || userData?.user) {
      router.replace('/app/dashboard');
    }
  }, [isAuthenticated, userData, router]);
  
  // Use a stable default during SSR, then switch to actual value after mount
  const isRegister = mounted ? pathname === "/auth/register" : false;
  const backgroundImage = isRegister ? "/register.jpg" : "/login.jpg";

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030712]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-cyan-500 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render auth pages if user is authenticated
  if (isAuthenticated || userData?.user) {
    return null;
  }

  return (
    <div className="flex min-h-screen font-sans selection:bg-cyan-500/30 overflow-hidden">
      {/* Left Split - Visual */}
      <div className="relative hidden w-1/2 flex-col justify-between p-12 lg:flex">
        {/* Dynamic Background with Overlay */}
        <div className="absolute inset-0 z-0 bg-slate-950">
             <div 
                className="absolute inset-0 opacity-40 mix-blend-overlay transition-all duration-1000 transform scale-105 hover:scale-100"
                style={{
                    backgroundImage: `url('${backgroundImage}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
             />
             <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-900/40"></div>
             
             {/* Animated Blobs */}
             <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                 <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
                 <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '2s'}}></div>
             </div>
        </div>

        {/* Content Layer */}
        <div className="relative z-10 flex flex-col h-full justify-between">
            <Link href="/" className="inline-flex items-center gap-3 w-fit group">
                <Logo size="lg" className="shadow-cyan-500/20 transition-transform group-hover:rotate-3 group-hover:scale-105" />
                <span className="font-bold text-white text-xl tracking-tight">FyiCast</span>
            </Link>
            
            <div className="space-y-8 max-w-lg">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-300 backdrop-blur-md shadow-lg">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                    {isRegister ? "Join 2,000+ Finance Leaders" : "Welcome Back"}
                </div>
                
                <h1 className="text-5xl font-bold leading-tight text-white lg:text-6xl tracking-tight">
                    {isRegister
                    ? <span>Turn data into <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">direction.</span></span>
                    : <span>Clarity for the <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">modern CFO.</span></span>}
                </h1>
                
                <p className="text-lg text-slate-300 leading-relaxed font-light">
                    {isRegister
                    ? "Stop wrestling with fragile spreadsheets. Build driver-based forecasts, run scenarios, and report with confidence in minutes."
                    : "Access your real-time dashboard, update assumptions, and share insights with your stakeholders."}
                </p>

                {/* Social Proof Mini-Card */}
                <div className="flex items-center gap-4 pt-4">
                    <div className="flex -space-x-3">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-xs font-medium text-white shadow-lg">
                                {String.fromCharCode(64+i)}
                            </div>
                        ))}
                    </div>
                    <div className="text-sm">
                        <p className="text-white font-bold">Trusted by finance teams</p>
                        <p className="text-slate-400 text-xs">at high-growth startups globally</p>
                    </div>
                </div>
            </div>
            
            <div className="flex justify-between items-end text-xs text-slate-500 font-medium uppercase tracking-wider">
                <p>© FyiCast Inc.</p>
                <div className="flex gap-4">
                    <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                    <Link href="#" className="hover:text-white transition-colors">Terms</Link>
                </div>
            </div>
        </div>
      </div>
      
      {/* Right Split - Form */}
      <main className="flex w-full flex-col justify-center px-6 py-12 sm:px-10 lg:w-1/2 relative bg-[#030712]">
         {/* Mobile Header */}
         <div className="lg:hidden absolute top-6 left-6">
            <Link href="/" className="flex items-center gap-2">
                <Logo size="md" className="shadow-none" />
                <span className="font-bold text-white text-lg">FyiCast</span>
            </Link>
         </div>

         {/* Background decoration for right side */}
         <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-cyan-500/5 blur-[100px] rounded-full"></div>
            <div className="absolute bottom-[-20%] left-[-20%] w-[500px] h-[500px] bg-violet-500/5 blur-[100px] rounded-full"></div>
         </div>
         
        <div className="mx-auto w-full max-w-md relative z-10 animate-slide-up">
            {children}
        </div>
      </main>
    </div>
  );
}
