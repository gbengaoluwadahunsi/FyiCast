// app/(platform)/app/dashboard/page.tsx

'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useForecast } from '@/lib/hooks/useForecast';
import { useGetPLSummaryQuery, useGetDashboardKPIsQuery } from '@/lib/store/api';
import { ForecastChart } from '@/components/ForecastChart';
import { formatCurrency } from '@/lib/types/api';
import { motion, AnimatePresence } from 'framer-motion';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const }
  }
};

const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: { 
    scale: 1.02, 
    y: -4,
    transition: { duration: 0.3, ease: "easeOut" as const }
  }
};

// Animated KPI Card Component
function KPICard({ 
  title, 
  value, 
  loading, 
  change, 
  changeLabel,
  changePositiveIsGood = true,
  showProgress = false,
  progressValue = 0,
  delay = 0 
}: { 
  title: string;
  value: string;
  loading: boolean;
  change?: number;
  changeLabel?: string;
  changePositiveIsGood?: boolean;
  showProgress?: boolean;
  progressValue?: number;
  delay?: number;
}) {
  const isPositive = change !== undefined && change >= 0;
  const showGreen = changePositiveIsGood ? isPositive : !isPositive;

  return (
    <motion.div
      variants={itemVariants}
      initial="rest"
      whileHover="hover"
      animate="rest"
      custom={delay}
    >
      <motion.div 
        className="rounded-3xl border border-white/5 bg-black/20 p-5 backdrop-blur-sm transition-all relative overflow-hidden group"
        variants={cardHover}
      >
        {/* Hover glow effect */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        />
        
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 relative z-10">{title}</p>
        <motion.p 
          className="mt-2 text-2xl font-bold text-white relative z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + 0.2 }}
        >
          {loading ? (
            <motion.span
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ...
            </motion.span>
          ) : value}
        </motion.p>
        
        {change !== undefined && (
          <div className="mt-2 flex items-center gap-2 relative z-10">
            <motion.span 
              className={`flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                showGreen ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
              }`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.3 }}
            >
              {isPositive ? '+' : ''}{change.toFixed(1)}%
            </motion.span>
            {changeLabel && <span className="text-xs text-slate-500">{changeLabel}</span>}
          </div>
        )}

        {showProgress && (
          <div className="mt-2 w-full bg-white/5 h-1.5 rounded-full overflow-hidden relative z-10">
            <motion.div 
              className="h-full bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, progressValue)}%` }}
              transition={{ duration: 1, delay: delay + 0.3, ease: "easeOut" }}
            />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// Animated Table Row
function AnimatedTableRow({ 
  period, 
  revenue, 
  netIncome, 
  index 
}: { 
  period: string; 
  revenue: number; 
  netIncome: number;
  index: number;
}) {
  return (
    <motion.tr
      className="group transition-colors hover:bg-white/[0.02]"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ x: 4 }}
    >
      <td className="px-4 py-3 font-medium text-slate-300 group-hover:text-white">
        {period}
      </td>
      <td className="px-4 py-3 text-right font-mono text-slate-400 group-hover:text-emerald-400">
        {formatCurrency(revenue)}
      </td>
      <td className="px-4 py-3 text-right font-mono text-slate-400 group-hover:text-white">
        {formatCurrency(netIncome)}
      </td>
    </motion.tr>
  );
}

export default function DashboardPage() {
  const { workspaceId } = useAuth();
  const { data: plData, isLoading: loadingPL } = useGetPLSummaryQuery(
    { workspace_id: workspaceId! },
    { skip: !workspaceId }
  );
  const { data: kpisData, isLoading: loadingKPIs } = useGetDashboardKPIsQuery(
    workspaceId!,
    { skip: !workspaceId }
  );
  
  const {
    scenarios,
    selectedScenarioId,
    setSelectedScenarioId,
    forecastResults,
    runScenarioForecast,
    runningForecast,
  } = useForecast(workspaceId!);

  const handleRunForecast = async () => {
    if (selectedScenarioId) {
      await runScenarioForecast(selectedScenarioId, 12, 250000);
    }
  };

  if (!workspaceId) {
    return (
      <motion.div 
        className="flex h-64 items-center justify-center rounded-3xl border border-white/5 bg-black/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex flex-col items-center gap-4">
          <motion.div 
            className="h-8 w-8 rounded-full border-2 border-cyan-500 border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-sm font-medium text-slate-400">Loading workspace...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="flex flex-col gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div 
        className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        variants={itemVariants}
      >
        <div>
          <motion.h1 
            className="text-3xl font-bold tracking-tight text-white"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Dashboard
          </motion.h1>
          <motion.p 
            className="text-slate-400 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Real-time financial overview and forecasting.
          </motion.p>
        </div>
        <motion.div 
          className="flex gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button 
            className="inline-flex h-9 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/10 hover:border-white/20"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Download Report
          </motion.button>
        </motion.div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div 
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
      >
        <KPICard
          title="Total Revenue"
          value={kpisData?.kpis.total_revenue ? `$${(kpisData.kpis.total_revenue / 1000).toFixed(1)}K` : '$0'}
          loading={loadingKPIs}
          change={kpisData?.kpis.revenue_growth ?? 0}
          changeLabel="vs last month"
          delay={0}
        />
        <KPICard
          title="Net Burn"
          value={kpisData?.kpis.net_burn ? `$${kpisData.kpis.net_burn.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '$0'}
          loading={loadingKPIs}
          change={kpisData?.kpis.burn_growth ?? 0}
          changeLabel="vs last month"
          changePositiveIsGood={false}
          delay={0.1}
        />
        <KPICard
          title="Cash on Hand"
          value={kpisData?.kpis.cash_on_hand ? `$${kpisData.kpis.cash_on_hand.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '$0'}
          loading={loadingKPIs}
          delay={0.2}
        />
        <KPICard
          title="Runway"
          value={kpisData?.kpis.runway ? `${kpisData.kpis.runway.toFixed(1)} Months` : 'N/A'}
          loading={loadingKPIs}
          showProgress
          progressValue={(kpisData?.kpis.runway ?? 0) / 24 * 100}
          delay={0.3}
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Charts & Scenarios (2/3 width) */}
        <motion.div 
          className="lg:col-span-2 flex flex-col gap-6"
          variants={itemVariants}
        >
          {/* Forecast Control Panel */}
          <motion.div 
            className="rounded-3xl border border-white/10 bg-black/40 p-1 backdrop-blur-xl overflow-hidden"
            whileHover={{ borderColor: "rgba(255,255,255,0.15)" }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <motion.div 
                  className="h-8 w-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </motion.div>
                <h2 className="font-bold text-white">Scenario Forecast</h2>
              </div>
              
              <div className="flex gap-2">
                <motion.select
                  value={selectedScenarioId || ''}
                  onChange={(e) => setSelectedScenarioId(e.target.value)}
                  className="h-9 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition-colors focus:border-violet-500/50 focus:bg-white/10"
                  whileHover={{ borderColor: "rgba(139, 92, 246, 0.3)" }}
                >
                  <option value="" className="bg-black text-slate-400">Select scenario...</option>
                  {scenarios.map((scenario) => (
                    <option key={scenario.id} value={scenario.id} className="bg-black text-white">
                      {scenario.name}
                    </option>
                  ))}
                </motion.select>
                <motion.button
                  onClick={handleRunForecast}
                  disabled={!selectedScenarioId || runningForecast}
                  className="inline-flex h-9 items-center justify-center rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white transition-all hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {runningForecast ? (
                    <span className="flex items-center gap-2">
                      <motion.span 
                        className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Running...
                    </span>
                  ) : 'Run'}
                </motion.button>
              </div>
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                {forecastResults ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <ForecastChart data={forecastResults} />
                    {forecastResults.runway && (
                      <motion.div 
                        className="mt-6 flex items-center gap-3 rounded-xl border border-violet-500/20 bg-violet-500/10 p-4 text-sm text-violet-200"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <span className="font-bold">Projected Runway:</span> {forecastResults.runway.toFixed(1)} months based on this scenario.
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="empty"
                    className="flex h-[300px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.02]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.05, 1],
                        opacity: [0.5, 0.7, 0.5]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <svg className="w-12 h-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </motion.div>
                    <p className="text-slate-500">Select a scenario and run forecast to visualize data</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column: Historical Data (1/3 width) */}
        <motion.div 
          className="flex flex-col gap-6"
          variants={itemVariants}
        >
          <motion.div 
            className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden flex flex-col h-full"
            whileHover={{ borderColor: "rgba(255,255,255,0.15)" }}
          >
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <h2 className="font-bold text-white">Recent Performance</h2>
              <motion.button 
                className="text-xs font-medium text-cyan-400 hover:text-cyan-300"
                whileHover={{ x: 2 }}
              >
                View All
              </motion.button>
            </div>
            
            <div className="p-2 flex-1">
              <AnimatePresence mode="wait">
                {loadingPL ? (
                  <motion.div 
                    key="loading"
                    className="flex h-40 items-center justify-center text-slate-500 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      animate={{ opacity: [0.3, 0.7, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      Loading data...
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.table 
                    key="table"
                    className="w-full text-left text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <thead className="text-xs font-medium uppercase text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">Period</th>
                        <th className="px-4 py-3 font-medium text-right">Revenue</th>
                        <th className="px-4 py-3 font-medium text-right">Net</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {plData?.summary.slice(-6).reverse().map((month, index) => (
                        <AnimatedTableRow
                          key={month.period}
                          period={month.period}
                          revenue={month.revenue}
                          netIncome={month.net_income}
                          index={index}
                        />
                      ))}
                    </tbody>
                  </motion.table>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </motion.div>
  );
}
