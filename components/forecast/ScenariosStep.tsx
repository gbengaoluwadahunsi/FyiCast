'use client';

import { useState, useMemo } from 'react';
import { ForecastResult, toDollars } from '@/lib/types/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface ScenariosStepProps {
  workspaceId: string;
  forecastData: ForecastResult | undefined;
  onScenariosGenerated: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

type ScenarioType = 'Base' | 'Upside' | 'Downside';

export function ScenariosStep({
  workspaceId,
  forecastData,
  onScenariosGenerated,
  onNext,
  onPrev,
}: ScenariosStepProps) {
  const [activeScenario, setActiveScenario] = useState<ScenarioType>('Base');

  // Generate scenarios from base forecast
  const scenarios = useMemo(() => {
    if (!forecastData?.forecast) return null;

    const base = forecastData.forecast.map(f => ({
      period: f.period.substring(0, 7),
      revenue: toDollars(f.revenue),
      expense: toDollars(f.total_expenses),
      netIncome: toDollars(f.net_income),
    }));

    const upside = base.map(b => ({
      ...b,
      revenue: b.revenue * 1.10,
      expense: b.expense * 0.95,
      netIncome: (b.revenue * 1.10) - (b.expense * 0.95),
    }));

    const downside = base.map(b => ({
      ...b,
      revenue: b.revenue * 0.90,
      expense: b.expense * 1.05,
      netIncome: (b.revenue * 0.90) - (b.expense * 1.05),
    }));

    return {
      Base: {
        data: base,
        totalRevenue: base.reduce((sum, b) => sum + b.revenue, 0),
        totalExpense: base.reduce((sum, b) => sum + b.expense, 0),
        totalNetIncome: base.reduce((sum, b) => sum + b.netIncome, 0),
        description: 'Expected performance based on current trends',
        color: '#22d3ee',
      },
      Upside: {
        data: upside,
        totalRevenue: upside.reduce((sum, u) => sum + u.revenue, 0),
        totalExpense: upside.reduce((sum, u) => sum + u.expense, 0),
        totalNetIncome: upside.reduce((sum, u) => sum + u.netIncome, 0),
        description: '+10% revenue growth, 5% cost reduction',
        color: '#34d399',
      },
      Downside: {
        data: downside,
        totalRevenue: downside.reduce((sum, d) => sum + d.revenue, 0),
        totalExpense: downside.reduce((sum, d) => sum + d.expense, 0),
        totalNetIncome: downside.reduce((sum, d) => sum + d.netIncome, 0),
        description: '-10% revenue decline, 5% cost increase',
        color: '#f472b6',
      },
    };
  }, [forecastData]);

  // Comparison chart data
  const comparisonData = useMemo(() => {
    if (!scenarios) return [];

    return scenarios.Base.data.map((base, index) => ({
      period: base.period,
      base: base.netIncome,
      upside: scenarios.Upside.data[index]?.netIncome || 0,
      downside: scenarios.Downside.data[index]?.netIncome || 0,
    }));
  }, [scenarios]);

  // Summary comparison
  const summaryComparison = useMemo(() => {
    if (!scenarios) return [];

    return [
      {
        metric: 'Total Revenue',
        base: scenarios.Base.totalRevenue,
        upside: scenarios.Upside.totalRevenue,
        downside: scenarios.Downside.totalRevenue,
      },
      {
        metric: 'Total Expenses',
        base: scenarios.Base.totalExpense,
        upside: scenarios.Upside.totalExpense,
        downside: scenarios.Downside.totalExpense,
      },
      {
        metric: 'Net Income',
        base: scenarios.Base.totalNetIncome,
        upside: scenarios.Upside.totalNetIncome,
        downside: scenarios.Downside.totalNetIncome,
      },
    ];
  }, [scenarios]);

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  if (!scenarios) {
    return (
      <div className="p-8 flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-lg text-slate-400">No forecast data available</p>
          <p className="text-sm text-slate-500 mt-2">Please run a forecast first</p>
        </div>
      </div>
    );
  }

  const activeData = scenarios[activeScenario];

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-fuchsia-500/20 flex items-center justify-center">
          <span className="text-2xl">🎯</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Scenario Analysis</h2>
          <p className="text-sm text-slate-400">
            Compare Base, Upside, and Downside scenarios
          </p>
        </div>
      </div>

      {/* Scenario Tabs */}
      <div className="flex gap-3 mb-8">
        {(['Base', 'Upside', 'Downside'] as ScenarioType[]).map(scenario => (
          <button
            key={scenario}
            onClick={() => setActiveScenario(scenario)}
            className={`flex-1 rounded-xl p-4 transition-all ${
              activeScenario === scenario
                ? 'bg-white/10 border-2'
                : 'bg-white/5 border border-white/10 hover:bg-white/10'
            }`}
            style={{
              borderColor: activeScenario === scenario ? scenarios[scenario].color : undefined,
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: scenarios[scenario].color }}
              />
              <span className="font-bold text-white">
                {scenario === 'Base' ? 'Base Case' : scenario === 'Upside' ? 'Best Case' : 'Worst Case'}
              </span>
            </div>
            <p className="text-xs text-slate-400">{scenarios[scenario].description}</p>
            <p className="text-lg font-bold mt-2" style={{ color: scenarios[scenario].color }}>
              ${scenarios[scenario].totalNetIncome.toLocaleString()}
            </p>
          </button>
        ))}
      </div>

      {/* Active Scenario Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Data Chart */}
        <div className="rounded-xl border border-white/10 bg-black/20 p-6">
          <h3 className="text-sm font-bold text-white mb-4">
            {activeScenario === 'Base' ? 'Base Case' : activeScenario === 'Upside' ? 'Best Case' : 'Worst Case'} Monthly Forecast
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activeData.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="period" stroke="#64748b" tick={{ fill: '#94a3b8' }} fontSize={10} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8' }} fontSize={10} tickFormatter={formatYAxis} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#f8fafc' }}
                formatter={(value) => [`$${(value ?? 0).toLocaleString()}`, '']}
              />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#22d3ee" strokeWidth={2} name="Revenue" dot={false} />
              <Line type="monotone" dataKey="expense" stroke="#f472b6" strokeWidth={2} name="Expense" dot={false} />
              <Line type="monotone" dataKey="netIncome" stroke="#34d399" strokeWidth={2} name="Net Income" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Cards */}
        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Total Revenue</span>
              <span className="text-lg font-bold text-emerald-400">
                ${activeData.totalRevenue.toLocaleString()}
              </span>
            </div>
            <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{
                  width: `${(activeData.totalRevenue / scenarios.Upside.totalRevenue) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Total Expenses</span>
              <span className="text-lg font-bold text-red-400">
                ${activeData.totalExpense.toLocaleString()}
              </span>
            </div>
            <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full"
                style={{
                  width: `${(activeData.totalExpense / scenarios.Downside.totalExpense) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Net Income</span>
              <span
                className="text-lg font-bold"
                style={{ color: activeData.color }}
              >
                ${activeData.totalNetIncome.toLocaleString()}
              </span>
            </div>
            <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  backgroundColor: activeData.color,
                  width: `${Math.max(10, (activeData.totalNetIncome / scenarios.Upside.totalNetIncome) * 100)}%`,
                }}
              />
            </div>
          </div>

          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4">
            <p className="text-xs font-bold text-cyan-400 mb-1">Scenario Insight</p>
            <p className="text-sm text-slate-300">
              {activeScenario === 'Base' && 'This projection is based on your current growth trajectory.'}
              {activeScenario === 'Upside' && 'With optimistic assumptions, net income improves significantly.'}
              {activeScenario === 'Downside' && 'Plan for contingencies if market conditions deteriorate.'}
            </p>
          </div>
        </div>
      </div>

      {/* Scenario Comparison */}
      <div className="rounded-xl border border-white/10 bg-black/20 p-6 mb-8">
        <h3 className="text-sm font-bold text-white mb-4">All Scenarios Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={summaryComparison} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis type="number" stroke="#64748b" tick={{ fill: '#94a3b8' }} fontSize={10} tickFormatter={formatYAxis} />
            <YAxis type="category" dataKey="metric" stroke="#64748b" tick={{ fill: '#94a3b8' }} fontSize={12} width={100} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              labelStyle={{ color: '#f8fafc' }}
              formatter={(value) => [`$${(value ?? 0).toLocaleString()}`, '']}
            />
            <Legend />
            <Bar dataKey="base" fill="#22d3ee" name="Base Case" radius={[0, 4, 4, 0]} />
            <Bar dataKey="upside" fill="#34d399" name="Best Case" radius={[0, 4, 4, 0]} />
            <Bar dataKey="downside" fill="#f472b6" name="Worst Case" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Table */}
      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10">
          <h3 className="text-sm font-bold text-white">Monthly Forecast Table - {activeScenario} Case</h3>
        </div>
        <div className="overflow-x-auto max-h-64">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wide text-slate-400 sticky top-0">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 font-bold">Period</th>
                <th className="whitespace-nowrap px-4 py-3 font-bold text-right">Revenue</th>
                <th className="whitespace-nowrap px-4 py-3 font-bold text-right">Expenses</th>
                <th className="whitespace-nowrap px-4 py-3 font-bold text-right">Net Income</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {activeData.data.map((row, index) => (
                <tr key={index} className="transition-colors hover:bg-white/5">
                  <td className="px-4 py-2 font-medium text-white">{row.period}</td>
                  <td className="px-4 py-2 text-right text-emerald-400">${row.revenue.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right text-red-400">${row.expense.toLocaleString()}</td>
                  <td className={`px-4 py-2 text-right font-medium ${
                    row.netIncome >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    ${row.netIncome.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
          onClick={() => {
            onScenariosGenerated(scenarios);
            onNext();
          }}
          className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-cyan-400 hover:scale-105"
        >
          Export Results →
        </button>
      </div>
    </div>
  );
}

