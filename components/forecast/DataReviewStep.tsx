'use client';

import { PLSummary, formatCurrency } from '@/lib/types/api';

interface DataReviewStepProps {
  workspaceId: string;
  plData: PLSummary | undefined;
  loadingPL: boolean;
  onNext: () => void;
  onPrev: () => void;
}

export function DataReviewStep({
  workspaceId,
  plData,
  loadingPL,
  onNext,
  onPrev,
}: DataReviewStepProps) {
  const summary = plData?.summary || [];
  
  // Calculate statistics
  const totalRevenue = summary.reduce((sum, m) => sum + m.revenue, 0);
  const totalExpenses = summary.reduce((sum, m) => sum + m.total_expenses, 0);
  const totalNetIncome = summary.reduce((sum, m) => sum + m.net_income, 0);
  const avgRevenue = summary.length > 0 ? totalRevenue / summary.length : 0;
  const avgExpenses = summary.length > 0 ? totalExpenses / summary.length : 0;

  // Data quality checks
  const monthsCount = summary.length;
  const hasMinimumData = monthsCount >= 12;
  const hasRevenue = totalRevenue > 0;
  const hasExpenses = totalExpenses > 0;

  if (loadingPL) {
    return (
      <div className="p-8 flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-400">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
          <span className="text-2xl">📊</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Review Your Data</h2>
          <p className="text-sm text-slate-400">
            Verify your imported data before proceeding to analysis
          </p>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-white/5 bg-black/20 p-4">
          <p className="text-xs font-bold uppercase text-slate-500 mb-1">Periods Loaded</p>
          <p className="text-2xl font-bold text-white">{monthsCount}</p>
          <p className="text-xs text-slate-400 mt-1">months of data</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-black/20 p-4">
          <p className="text-xs font-bold uppercase text-slate-500 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-slate-400 mt-1">across all periods</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-black/20 p-4">
          <p className="text-xs font-bold uppercase text-slate-500 mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-red-400">{formatCurrency(totalExpenses)}</p>
          <p className="text-xs text-slate-400 mt-1">across all periods</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-black/20 p-4">
          <p className="text-xs font-bold uppercase text-slate-500 mb-1">Net Income</p>
          <p className={`text-2xl font-bold ${totalNetIncome >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatCurrency(totalNetIncome)}
          </p>
          <p className="text-xs text-slate-400 mt-1">total profit/loss</p>
        </div>
      </div>

      {/* Data Quality Checks */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 mb-8">
        <h3 className="text-sm font-bold text-white mb-4">Data Quality Checks</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`flex items-center gap-3 rounded-lg p-3 ${
            hasMinimumData ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-yellow-500/10 border border-yellow-500/20'
          }`}>
            <span className="text-lg">{hasMinimumData ? '✅' : '⚠️'}</span>
            <div>
              <p className={`text-sm font-medium ${hasMinimumData ? 'text-emerald-400' : 'text-yellow-400'}`}>
                {hasMinimumData ? 'Sufficient Data' : 'Limited Data'}
              </p>
              <p className="text-xs text-slate-400">
                {hasMinimumData
                  ? '12+ months available for forecasting'
                  : `Only ${monthsCount} months (12+ recommended)`}
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-3 rounded-lg p-3 ${
            hasRevenue ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'
          }`}>
            <span className="text-lg">{hasRevenue ? '✅' : '❌'}</span>
            <div>
              <p className={`text-sm font-medium ${hasRevenue ? 'text-emerald-400' : 'text-red-400'}`}>
                {hasRevenue ? 'Revenue Data Found' : 'No Revenue Data'}
              </p>
              <p className="text-xs text-slate-400">
                {hasRevenue ? 'Revenue records detected' : 'Please add revenue data'}
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-3 rounded-lg p-3 ${
            hasExpenses ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-yellow-500/10 border border-yellow-500/20'
          }`}>
            <span className="text-lg">{hasExpenses ? '✅' : '⚠️'}</span>
            <div>
              <p className={`text-sm font-medium ${hasExpenses ? 'text-emerald-400' : 'text-yellow-400'}`}>
                {hasExpenses ? 'Expense Data Found' : 'No Expense Data'}
              </p>
              <p className="text-xs text-slate-400">
                {hasExpenses ? 'Expense records detected' : 'Consider adding expense data'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table Preview */}
      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Data Preview</h3>
          <span className="text-xs text-slate-400">Showing first 10 periods</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 font-bold">Period</th>
                <th className="whitespace-nowrap px-4 py-3 font-bold text-right">Revenue</th>
                <th className="whitespace-nowrap px-4 py-3 font-bold text-right">COGS</th>
                <th className="whitespace-nowrap px-4 py-3 font-bold text-right">OpEx</th>
                <th className="whitespace-nowrap px-4 py-3 font-bold text-right">Personnel</th>
                <th className="whitespace-nowrap px-4 py-3 font-bold text-right">Net Income</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {summary.slice(0, 10).map((row, index) => (
                <tr key={index} className="transition-colors hover:bg-white/5">
                  <td className="px-4 py-3 font-medium text-white">{row.period}</td>
                  <td className="px-4 py-3 text-right text-emerald-400">{formatCurrency(row.revenue)}</td>
                  <td className="px-4 py-3 text-right text-slate-300">{formatCurrency(row.cogs)}</td>
                  <td className="px-4 py-3 text-right text-slate-300">{formatCurrency(row.opex)}</td>
                  <td className="px-4 py-3 text-right text-slate-300">{formatCurrency(row.personnel)}</td>
                  <td className={`px-4 py-3 text-right font-medium ${
                    row.net_income >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {formatCurrency(row.net_income)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {summary.length > 10 && (
          <div className="px-4 py-2 border-t border-white/10 text-center">
            <span className="text-xs text-slate-400">
              ... and {summary.length - 10} more periods
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={onPrev}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={monthsCount === 0}
          className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-cyan-400 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Proceed to Analysis →
        </button>
      </div>
    </div>
  );
}

