'use client';

import { useState } from 'react';
import { ForecastResult, toDollars } from '@/lib/types/api';

interface ExportStepProps {
  workspaceId: string;
  forecastData: ForecastResult | undefined;
  scenarioData: any;
  selectedScenarioId: string | null;
  onPrev: () => void;
}

export function ExportStep({
  workspaceId,
  forecastData,
  scenarioData,
  selectedScenarioId,
  onPrev,
}: ExportStepProps) {
  const [exporting, setExporting] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

  const handleExportCSV = async () => {
    if (!selectedScenarioId) return;
    
    setExporting('csv');
    try {
      const response = await fetch(
        `${API_BASE}/forecast/export?scenario_id=${selectedScenarioId}&format=csv`,
        { credentials: 'include' }
      );
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `forecast-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setExportSuccess('csv');
      setTimeout(() => setExportSuccess(null), 3000);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(null);
    }
  };

  const handleExportScenarioCSV = () => {
    if (!scenarioData) return;

    setExporting('scenarios');
    
    // Generate CSV content from scenario data
    const lines = ['Period,Base Revenue,Base Expense,Base Net,Upside Revenue,Upside Expense,Upside Net,Downside Revenue,Downside Expense,Downside Net'];
    
    const baseData = scenarioData.Base?.data || [];
    const upsideData = scenarioData.Upside?.data || [];
    const downsideData = scenarioData.Downside?.data || [];

    for (let i = 0; i < baseData.length; i++) {
      lines.push([
        baseData[i]?.period || '',
        baseData[i]?.revenue || 0,
        baseData[i]?.expense || 0,
        baseData[i]?.netIncome || 0,
        upsideData[i]?.revenue || 0,
        upsideData[i]?.expense || 0,
        upsideData[i]?.netIncome || 0,
        downsideData[i]?.revenue || 0,
        downsideData[i]?.expense || 0,
        downsideData[i]?.netIncome || 0,
      ].join(','));
    }

    // Add summary
    lines.push('');
    lines.push('Summary');
    lines.push(`Total,${scenarioData.Base?.totalRevenue || 0},${scenarioData.Base?.totalExpense || 0},${scenarioData.Base?.totalNetIncome || 0},${scenarioData.Upside?.totalRevenue || 0},${scenarioData.Upside?.totalExpense || 0},${scenarioData.Upside?.totalNetIncome || 0},${scenarioData.Downside?.totalRevenue || 0},${scenarioData.Downside?.totalExpense || 0},${scenarioData.Downside?.totalNetIncome || 0}`);

    const csv = lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scenario-analysis-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    setExporting(null);
    setExportSuccess('scenarios');
    setTimeout(() => setExportSuccess(null), 3000);
  };

  const handleExportJSON = () => {
    const exportData = {
      generatedAt: new Date().toISOString(),
      forecast: forecastData,
      scenarios: scenarioData,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fyicast-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    setExportSuccess('json');
    setTimeout(() => setExportSuccess(null), 3000);
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
          <span className="text-2xl">💾</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Export Your Results</h2>
          <p className="text-sm text-slate-400">
            Download your forecast data in various formats
          </p>
        </div>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Forecast CSV */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 transition-all hover:bg-white/10 group">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-2xl">
              📊
            </div>
            <div>
              <h3 className="font-bold text-white">Forecast CSV</h3>
              <p className="text-xs text-slate-400">Monthly forecast data</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            Export your base forecast as a CSV file with revenue, expenses, and net income projections.
          </p>
          <button
            onClick={handleExportCSV}
            disabled={!selectedScenarioId || exporting === 'csv'}
            className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting === 'csv' ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                Exporting...
              </span>
            ) : exportSuccess === 'csv' ? (
              '✓ Downloaded!'
            ) : (
              'Download CSV'
            )}
          </button>
        </div>

        {/* Scenario Analysis CSV */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 transition-all hover:bg-white/10 group">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center text-2xl">
              🎯
            </div>
            <div>
              <h3 className="font-bold text-white">Scenario Analysis</h3>
              <p className="text-xs text-slate-400">All 3 scenarios</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            Export Base, Upside, and Downside scenarios together for comprehensive analysis.
          </p>
          <button
            onClick={handleExportScenarioCSV}
            disabled={!scenarioData || exporting === 'scenarios'}
            className="w-full rounded-lg bg-violet-500 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-violet-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting === 'scenarios' ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                Exporting...
              </span>
            ) : exportSuccess === 'scenarios' ? (
              '✓ Downloaded!'
            ) : (
              'Download Scenarios'
            )}
          </button>
        </div>

        {/* Full JSON Export */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 transition-all hover:bg-white/10 group">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-2xl">
              📁
            </div>
            <div>
              <h3 className="font-bold text-white">Full JSON Export</h3>
              <p className="text-xs text-slate-400">Complete data package</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            Export all forecast and scenario data in JSON format for integration with other tools.
          </p>
          <button
            onClick={handleExportJSON}
            disabled={!forecastData && !scenarioData}
            className="w-full rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportSuccess === 'json' ? '✓ Downloaded!' : 'Download JSON'}
          </button>
        </div>
      </div>

      {/* Summary Preview */}
      {scenarioData && (
        <div className="rounded-xl border border-white/10 bg-black/20 p-6 mb-8">
          <h3 className="text-lg font-bold text-white mb-4">Export Summary</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">Base Case Net Income</p>
              <p className="text-2xl font-bold text-cyan-400">
                ${scenarioData.Base?.totalNetIncome?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">Best Case Net Income</p>
              <p className="text-2xl font-bold text-emerald-400">
                ${scenarioData.Upside?.totalNetIncome?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">Worst Case Net Income</p>
              <p className="text-2xl font-bold text-red-400">
                ${scenarioData.Downside?.totalNetIncome?.toLocaleString() || '0'}
              </p>
            </div>
          </div>

          {/* Range visualization */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Income Range</span>
              <span className="text-sm text-slate-400">
                ${scenarioData.Downside?.totalNetIncome?.toLocaleString()} — ${scenarioData.Upside?.totalNetIncome?.toLocaleString()}
              </span>
            </div>
            <div className="relative h-4 bg-white/10 rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-gradient-to-r from-red-500 via-cyan-500 to-emerald-500 opacity-60"
                style={{ left: '0%', right: '0%' }}
              />
              {/* Base case marker */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white"
                style={{
                  left: `${
                    scenarioData.Upside?.totalNetIncome && scenarioData.Downside?.totalNetIncome
                      ? ((scenarioData.Base?.totalNetIncome - scenarioData.Downside?.totalNetIncome) /
                          (scenarioData.Upside?.totalNetIncome - scenarioData.Downside?.totalNetIncome)) *
                        100
                      : 50
                  }%`,
                }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              White marker indicates Base Case position
            </p>
          </div>
        </div>
      )}

      {/* Completion Banner */}
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🎉</span>
        </div>
        <h3 className="text-xl font-bold text-emerald-400 mb-2">Forecast Complete!</h3>
        <p className="text-slate-300 max-w-lg mx-auto">
          You've successfully generated your financial forecast and analyzed multiple scenarios.
          Download your results above or return to the dashboard to track actual performance against projections.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <a
            href="/app/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-emerald-400 hover:scale-105"
          >
            Go to Dashboard
          </a>
          <button
            onClick={onPrev}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
          >
            ← Review Scenarios
          </button>
        </div>
      </div>
    </div>
  );
}

