'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect to Forecast Wizard - data management is now part of the wizard
export default function HistoricalDataPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/app/forecast');
  }, [router]);

  return (
    <div className="flex h-64 items-center justify-center rounded-3xl border border-white/5 bg-black/20">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent"></div>
        <p className="text-sm font-medium text-slate-400">Redirecting to Forecast Wizard...</p>
      </div>
    </div>
  );
}
