'use client';

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "../../../components/Logo";
import { useGetCurrentUserQuery, useLogoutMutation, useGetWorkspaceQuery, useGetDashboardKPIsQuery } from "@/lib/store/api";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials, clearCredentials } from "@/lib/store/slices/authSlice";
import type { RootState } from "@/lib/store";

const navigation = [
  { label: "Dashboard", href: "/app/dashboard", icon: "Home" },
  { label: "Forecast Wizard", href: "/app/forecast", icon: "TrendingUp", highlight: true },
  { label: "Assumptions", href: "/app/assumptions", icon: "Sliders" },
  { label: "Scenarios", href: "/app/scenarios", icon: "GitBranch" },
  { label: "Reports & exports", href: "/app/reports", icon: "FileText" },
  { label: "Integrations", href: "/app/integrations", icon: "Link" },
  { label: "Workspace settings", href: "/app/settings", icon: "Settings" },
];

export default function PlatformLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user, workspaceId } = useSelector((state: RootState) => state.auth);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [logoutMutation] = useLogoutMutation();

  // Try to restore session from cookies
  const { data: userData, isLoading, isError, error } = useGetCurrentUserQuery(undefined, {
    skip: isAuthenticated, // Skip if already authenticated in Redux state
  });

  // Fetch workspace details
  const { data: workspaceData } = useGetWorkspaceQuery(workspaceId!, {
    skip: !workspaceId,
  });

  // Fetch dashboard KPIs for runway display
  const { data: kpisData } = useGetDashboardKPIsQuery(workspaceId!, {
    skip: !workspaceId,
  });

  // Get workspace name and plan from data
  const workspaceName = workspaceData?.workspace?.name || 'My Workspace';
  const runwayMonths = kpisData?.kpis?.runway || 0;
  const runwayProgress = Math.min(100, (runwayMonths / 24) * 100); // 24 months = 100%

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (error) {
      console.error('Logout error:', error);
    }
    dispatch(clearCredentials());
    router.replace('/auth/login');
  };

  useEffect(() => {
    if (isAuthenticated) {
      // Already authenticated via Redux state - check if email is verified
      if (user && !user.email_verified) {
        router.replace(`/auth/verify-email?email=${encodeURIComponent(user.email)}`);
        return;
      }
      setIsCheckingAuth(false);
      return;
    }

    if (isLoading) {
      // Still checking auth
      return;
    }

    if (userData?.user) {
      // Check if email is verified before granting access
      if (!userData.user.email_verified) {
        router.replace(`/auth/verify-email?email=${encodeURIComponent(userData.user.email)}`);
        return;
      }
      
      // Successfully restored session from cookies
      dispatch(
        setCredentials({
          user: userData.user,
          workspaceId: userData.workspaces?.[0]?.id || null,
        })
      );
      setIsCheckingAuth(false);
    } else if (isError || !userData) {
      // Not authenticated - redirect to login
      dispatch(clearCredentials());
      router.replace('/auth/login');
    }
  }, [isAuthenticated, isLoading, userData, isError, dispatch, router, user]);

  // Show loading spinner while checking authentication
  if (isCheckingAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-cyan-500 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated && !userData?.user) {
    return null;
  }
  return (
    <div className="min-h-screen text-slate-100 selection:bg-cyan-500/30 font-sans">
      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-6 px-4 pb-12 pt-4 sm:px-6 lg:px-8">
        
        {/* Floating Glass Header */}
        <header className="sticky top-4 z-40 flex flex-col gap-6 rounded-3xl border border-white/10 bg-black/40 px-6 py-4 shadow-2xl backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between transition-all duration-300 hover:bg-black/50">
          <div className="flex items-center gap-4">
            <Link href="/app/dashboard" className="transition-transform hover:scale-105 hover:rotate-3">
              <Logo size="lg" />
            </Link>
            <div>
              <p className="text-lg font-bold tracking-tight text-white">{workspaceName}</p>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
                {workspaceData?.workspace?.currency || 'USD'} 
                <span className="inline-block w-1 h-1 rounded-full bg-slate-500"></span>
                Workspace
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
            {/* Live Indicator */}
            <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-300 font-bold text-xs tracking-wide">LIVE SYNC</span>
            </div>
            
            <div className="hidden h-5 w-px bg-white/10 md:block"></div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
                <button className="h-9 w-9 flex items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 transition-colors hover:text-white hover:bg-white/10">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
                <button className="h-9 w-9 flex items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 transition-colors hover:text-white hover:bg-white/10">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                </button>
            </div>
            
            <div className="hidden h-5 w-px bg-white/10 md:block"></div>

            {/* User Profile */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 pl-2 pr-4 py-1.5">
                 <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-inner flex items-center justify-center text-white text-xs font-bold">
                   {user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                 </div>
                 <span className="font-semibold text-white text-sm">{user?.full_name || 'User'}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="h-9 w-9 flex items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 transition-colors hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20"
                title="Logout"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar Navigation - Glass & Floating */}
          <aside className="lg:w-64 lg:shrink-0">
            <nav className="sticky top-28 flex flex-col gap-2">
              <div className="rounded-3xl border border-white/5 bg-black/20 p-2 backdrop-blur-md">
                  {navigation.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group relative flex items-center justify-between overflow-hidden rounded-2xl border px-4 py-3 text-sm font-medium transition-all duration-300 hover:bg-white/5 hover:text-white hover:shadow-lg hover:shadow-cyan-900/10 active:scale-95 ${
                        'highlight' in item && item.highlight
                          ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
                          : 'border-transparent text-slate-400'
                      }`}
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        <span className={`h-2 w-2 rounded-full transition-all duration-300 ${
                          item.label === 'Dashboard' 
                            ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' 
                            : 'highlight' in item && item.highlight
                              ? 'bg-cyan-400'
                              : 'bg-slate-700 group-hover:bg-slate-500'
                        }`}></span>
                        {item.label}
                        {'highlight' in item && item.highlight && (
                          <span className="text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded">NEW</span>
                        )}
                      </span>
                    </Link>
                  ))}
              </div>
              
              {/* Mini Widget - Runway from API */}
              <div className="mt-4 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-indigo-900/40 to-black/40 backdrop-blur-sm p-5 relative group">
                  <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></div>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 mb-2">Runway Forecast</p>
                  <p className="text-3xl font-bold text-white mb-1">
                    {runwayMonths > 0 ? `${runwayMonths.toFixed(1)}m` : 'N/A'}
                  </p>
                  <p className="text-xs text-slate-400 mb-4">
                    {runwayMonths > 0 ? 'Based on current burn rate' : 'Add data to calculate'}
                  </p>
                  
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${runwayProgress}%` }}
                      ></div>
                  </div>
              </div>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="min-w-0 flex-1 animate-fade-in">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
