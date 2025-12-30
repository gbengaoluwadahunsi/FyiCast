// components/ForecastChart.tsx

'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { formatCurrency } from '@/lib/types/api';
import type { ForecastResult } from '@/lib/types/api';

interface ForecastChartProps {
  data: ForecastResult;
  currency?: string;
}

export function ForecastChart({ data, currency = 'USD' }: ForecastChartProps) {
  // Combine historical and forecast data
  const chartData = [
    ...data.historical.map((d) => ({
      period: new Date(d.period).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      revenue: d.revenue / 100,
      expenses: d.total_expenses / 100,
      netIncome: d.net_income / 100,
      type: 'Historical',
    })),
    ...data.forecast.map((d) => ({
      period: new Date(d.period).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      revenue: d.revenue / 100,
      expenses: d.total_expenses / 100,
      netIncome: d.net_income / 100,
      type: 'Forecast',
    })),
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-white/10 bg-black/90 p-3 shadow-2xl backdrop-blur-md">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 w-24">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                <span className="text-slate-300">{entry.name}</span>
              </div>
              <span className="font-mono font-medium text-white">
                {formatCurrency(entry.value * 100, currency)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="period" 
            stroke="#64748b" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            dy={10}
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(value) => `$${value / 1000}k`}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="#10b981" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorRevenue)" 
            name="Revenue"
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          <Area 
            type="monotone" 
            dataKey="expenses" 
            stroke="#ef4444" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorExpenses)" 
            name="Expenses"
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="netIncome"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="transparent"
            strokeDasharray="5 5"
            name="Net Income"
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
