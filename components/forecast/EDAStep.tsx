'use client';

import { useState, useMemo } from 'react';
import { PLSummary, formatCurrency, toDollars } from '@/lib/types/api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface EDAStepProps {
  workspaceId: string;
  plData: PLSummary | undefined;
  onNext: () => void;
  onPrev: () => void;
}

type TabType = 'overview' | 'seasonality' | 'growth' | 'composition';

const COLORS = ['#22d3ee', '#818cf8', '#f472b6', '#34d399', '#fbbf24', '#fb7185'];

export function EDAStep({
  workspaceId,
  plData,
  onNext,
  onPrev,
}: EDAStepProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const summary = plData?.summary || [];

  // Transform data for charts
  const chartData = useMemo(() => {
    return summary.map(row => ({
      period: row.period.substring(0, 7), // YYYY-MM format
      revenue: toDollars(row.revenue),
      expenses: toDollars(row.total_expenses),
      netIncome: toDollars(row.net_income),
      cogs: toDollars(row.cogs),
      opex: toDollars(row.opex),
      personnel: toDollars(row.personnel),
    }));
  }, [summary]);

  // Calculate seasonality data (average by month)
  const seasonalityData = useMemo(() => {
    const monthlyAvg: Record<string, { count: number; revenue: number; expense: number }> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    summary.forEach(row => {
      const monthNum = parseInt(row.period.substring(5, 7)) - 1;
      const monthName = months[monthNum];
      
      if (!monthlyAvg[monthName]) {
        monthlyAvg[monthName] = { count: 0, revenue: 0, expense: 0 };
      }
      monthlyAvg[monthName].count++;
      monthlyAvg[monthName].revenue += toDollars(row.revenue);
      monthlyAvg[monthName].expense += toDollars(row.total_expenses);
    });

    return months.map(month => ({
      month,
      avgRevenue: monthlyAvg[month] ? monthlyAvg[month].revenue / monthlyAvg[month].count : 0,
      avgExpense: monthlyAvg[month] ? monthlyAvg[month].expense / monthlyAvg[month].count : 0,
    })).filter(d => d.avgRevenue > 0);
  }, [summary]);

  // Calculate growth rates
  const growthData = useMemo(() => {
    if (chartData.length < 2) return [];
    
    return chartData.slice(1).map((row, index) => {
      const prevRevenue = chartData[index].revenue;
      const growthRate = prevRevenue > 0 ? ((row.revenue - prevRevenue) / prevRevenue) * 100 : 0;
      
      return {
        period: row.period,
        growthRate: Math.round(growthRate * 10) / 10,
        revenue: row.revenue,
      };
    });
  }, [chartData]);

  // Calculate expense composition
  const compositionData = useMemo(() => {
    const totals = summary.reduce((acc, row) => {
      acc.cogs += toDollars(row.cogs);
      acc.opex += toDollars(row.opex);
      acc.personnel += toDollars(row.personnel);
      return acc;
    }, { cogs: 0, opex: 0, personnel: 0 });

    return [
      { name: 'COGS', value: totals.cogs },
      { name: 'Operating Expenses', value: totals.opex },
      { name: 'Personnel', value: totals.personnel },
    ].filter(d => d.value > 0);
  }, [summary]);

  // Calculate key insights
  const insights = useMemo(() => {
    if (summary.length === 0) return null;

    const revenues = summary.map(r => toDollars(r.revenue));
    const maxRevenue = Math.max(...revenues);
    const minRevenue = Math.min(...revenues);
    const maxMonth = summary[revenues.indexOf(maxRevenue)]?.period;
    const minMonth = summary[revenues.indexOf(minRevenue)]?.period;

    // Calculate growth
    const firstHalf = revenues.slice(0, Math.ceil(revenues.length / 2));
    const secondHalf = revenues.slice(Math.ceil(revenues.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const overallGrowth = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

    // Calculate expense ratio
    const totalRevenue = revenues.reduce((a, b) => a + b, 0);
    const totalExpenses = summary.reduce((a, r) => a + toDollars(r.total_expenses), 0);
    const expenseRatio = totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0;

    return {
      maxRevenue,
      minRevenue,
      maxMonth,
      minMonth,
      overallGrowth,
      expenseRatio,
    };
  }, [summary]);

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📈' },
    { id: 'seasonality', label: 'Seasonality', icon: '📅' },
    { id: 'growth', label: 'Growth', icon: '📊' },
    { id: 'composition', label: 'Composition', icon: '🥧' },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
          <span className="text-2xl">🔍</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Exploratory Data Analysis</h2>
          <p className="text-sm text-slate-400">
            Visualize trends, seasonality, and patterns in your financial data
          </p>
        </div>
      </div>

      {/* Key Insights Cards */}
      {insights && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl border border-white/5 bg-black/20 p-4">
            <p className="text-xs font-bold uppercase text-slate-500">Peak Revenue</p>
            <p className="text-xl font-bold text-emerald-400">${insights.maxRevenue.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">{insights.maxMonth?.substring(0, 7)}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/20 p-4">
            <p className="text-xs font-bold uppercase text-slate-500">Trough Revenue</p>
            <p className="text-xl font-bold text-red-400">${insights.minRevenue.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">{insights.minMonth?.substring(0, 7)}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/20 p-4">
            <p className="text-xs font-bold uppercase text-slate-500">Overall Growth</p>
            <p className={`text-xl font-bold ${insights.overallGrowth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {insights.overallGrowth >= 0 ? '+' : ''}{insights.overallGrowth.toFixed(1)}%
            </p>
            <p className="text-xs text-slate-400 mt-1">first half vs second half</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/20 p-4">
            <p className="text-xs font-bold uppercase text-slate-500">Expense Ratio</p>
            <p className="text-xl font-bold text-yellow-400">{insights.expenseRatio.toFixed(1)}%</p>
            <p className="text-xs text-slate-400 mt-1">of revenue</p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400'
                : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chart Container */}
      <div className="rounded-xl border border-white/10 bg-black/20 p-6 min-h-[400px]">
        {activeTab === 'overview' && (
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Revenue vs Expenses Over Time</h3>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f472b6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f472b6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="period" stroke="#64748b" tick={{ fill: '#94a3b8' }} fontSize={12} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8' }} fontSize={12} tickFormatter={formatYAxis} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f8fafc' }}
                  formatter={(value) => [`$${(value ?? 0).toLocaleString()}`, '']}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#22d3ee"
                  fill="url(#colorRevenue)"
                  strokeWidth={2}
                  name="Revenue"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#f472b6"
                  fill="url(#colorExpenses)"
                  strokeWidth={2}
                  name="Expenses"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'seasonality' && (
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Average Revenue by Month (Seasonality)</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={seasonalityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8' }} fontSize={12} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8' }} fontSize={12} tickFormatter={formatYAxis} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f8fafc' }}
                  formatter={(value) => [`$${(value ?? 0).toLocaleString()}`, '']}
                />
                <Legend />
                <Bar dataKey="avgRevenue" fill="#22d3ee" name="Avg Revenue" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avgExpense" fill="#f472b6" name="Avg Expense" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'growth' && (
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Month-over-Month Growth Rate</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="period" stroke="#64748b" tick={{ fill: '#94a3b8' }} fontSize={12} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8' }} fontSize={12} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f8fafc' }}
                  formatter={(value) => [`${((value as number) ?? 0).toFixed(1)}%`, 'Growth Rate']}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="growthRate"
                  stroke="#34d399"
                  strokeWidth={2}
                  dot={{ fill: '#34d399', strokeWidth: 2 }}
                  name="Growth Rate %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'composition' && (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-4">Expense Composition</h3>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={compositionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {compositionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    formatter={(value) => [`$${(value ?? 0).toLocaleString()}`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <h4 className="text-sm font-bold text-slate-400 mb-4">BREAKDOWN</h4>
              {compositionData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-3 mb-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div className="flex-1">
                    <p className="text-sm text-white">{item.name}</p>
                  </div>
                  <p className="text-sm font-bold text-white">${item.value.toLocaleString()}</p>
                </div>
              ))}
            </div>
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
          className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-cyan-400 hover:scale-105"
        >
          Proceed to Forecasting →
        </button>
      </div>
    </div>
  );
}

