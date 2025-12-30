'use client';

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { 
  useGetDashboardKPIsQuery, 
  useGetScenariosQuery,
  useGetPLSummaryQuery,
  useCreateScenarioMutation,
  useAddDriverMutation
} from "@/lib/store/api";
import type { Driver } from "@/lib/types/api";

type AssumptionKey =
  | "revenueGrowth"
  | "seasonalityAmplitude"
  | "cogsPercent"
  | "opexGrowth"
  | "hiringPlan"
  | "cashConversionDays";

// Initial values - will be replaced with calculated values from data
const emptyAssumptions: Record<AssumptionKey, number> = {
  revenueGrowth: 0,
  seasonalityAmplitude: 0,
  cogsPercent: 0,
  opexGrowth: 0,
  hiringPlan: 0,
  cashConversionDays: 30,
};

const driverGroups: {
  title: string;
  description: string;
  items: { key: AssumptionKey; label: string; min: number; max: number; step: number; suffix?: string }[];
}[] = [
  {
    title: "Revenue drivers",
    description:
      "Control topline growth, seasonal uplift, and sales headcount to produce the base forecast.",
    items: [
      {
        key: "revenueGrowth",
        label: "Monthly revenue growth",
        min: -0.1,
        max: 0.2,
        step: 0.001,
        suffix: "%",
      },
      {
        key: "seasonalityAmplitude",
        label: "Seasonality amplitude",
        min: 0,
        max: 0.5,
        step: 0.01,
        suffix: "%",
      },
      {
        key: "hiringPlan",
        label: "Sales hires per quarter",
        min: 0,
        max: 20,
        step: 1,
      },
    ],
  },
  {
    title: "Cost structure",
    description:
      "Fine-tune cost of goods sold and operating expense velocity to reflect current initiatives.",
    items: [
      {
        key: "cogsPercent",
        label: "COGS as % of revenue",
        min: 0,
        max: 1,
        step: 0.01,
        suffix: "%",
      },
      {
        key: "opexGrowth",
        label: "Operating cost growth (MoM)",
        min: -0.1,
        max: 0.2,
        step: 0.001,
        suffix: "%",
      },
    ],
  },
  {
    title: "Cash levers",
    description:
      "Model working capital assumptions to anticipate runway and liquidity constraints.",
    items: [
      {
        key: "cashConversionDays",
        label: "Cash conversion cycle (days)",
        min: 0,
        max: 120,
        step: 1,
      },
    ],
  },
];

export default function AssumptionsPage() {
  const { workspaceId } = useAuth();
  
  // Fetch actual data from backend
  const { data: kpisData, isLoading: loadingKPIs } = useGetDashboardKPIsQuery(
    workspaceId!,
    { skip: !workspaceId }
  );
  const { data: scenariosData, isLoading: loadingScenarios } = useGetScenariosQuery(
    workspaceId!,
    { skip: !workspaceId }
  );
  const { data: plData, isLoading: loadingPL } = useGetPLSummaryQuery(
    { workspace_id: workspaceId! },
    { skip: !workspaceId }
  );

  const [createScenario, { isLoading: creatingScenario }] = useCreateScenarioMutation();
  const [addDriver] = useAddDriverMutation();

  const [assumptions, setAssumptions] = useState(emptyAssumptions);
  const [notes, setNotes] = useState("");
  const [hasCalculatedDefaults, setHasCalculatedDefaults] = useState(false);

  // Calculate assumptions from actual historical data
  useEffect(() => {
    if (plData?.summary && plData.summary.length > 1 && !hasCalculatedDefaults) {
      const summary = plData.summary;
      
      // Calculate actual revenue growth from historical data
      let totalGrowth = 0;
      let growthCount = 0;
      for (let i = 1; i < summary.length; i++) {
        if (summary[i - 1].revenue > 0) {
          const growth = (summary[i].revenue - summary[i - 1].revenue) / summary[i - 1].revenue;
          totalGrowth += growth;
          growthCount++;
        }
      }
      const avgRevenueGrowth = growthCount > 0 ? totalGrowth / growthCount : 0;

      // Calculate COGS as % of revenue
      const totalRevenue = summary.reduce((sum, m) => sum + m.revenue, 0);
      const totalCOGS = summary.reduce((sum, m) => sum + m.cogs, 0);
      const cogsPercent = totalRevenue > 0 ? totalCOGS / totalRevenue : 0;

      // Calculate OpEx growth
      let totalOpexGrowth = 0;
      let opexGrowthCount = 0;
      for (let i = 1; i < summary.length; i++) {
        const prevOpex = summary[i - 1].opex || 0;
        const currOpex = summary[i].opex || 0;
        if (prevOpex > 0) {
          const growth = (currOpex - prevOpex) / prevOpex;
          totalOpexGrowth += growth;
          opexGrowthCount++;
        }
      }
      const avgOpexGrowth = opexGrowthCount > 0 ? totalOpexGrowth / opexGrowthCount : 0;

      // Calculate seasonality (variance in revenue)
      const avgRevenue = totalRevenue / summary.length;
      const revenueVariance = summary.reduce((sum, m) => {
        return sum + Math.pow(m.revenue - avgRevenue, 2);
      }, 0) / summary.length;
      const seasonalityAmplitude = avgRevenue > 0 ? Math.sqrt(revenueVariance) / avgRevenue : 0;

      setAssumptions({
        revenueGrowth: Math.max(-0.1, Math.min(0.2, avgRevenueGrowth)),
        seasonalityAmplitude: Math.max(0, Math.min(0.5, seasonalityAmplitude)),
        cogsPercent: Math.max(0, Math.min(1, cogsPercent)),
        opexGrowth: Math.max(-0.1, Math.min(0.2, avgOpexGrowth)),
        hiringPlan: 0, // No historical data for this
        cashConversionDays: 30, // Default - would need AR/AP data
      });
      setHasCalculatedDefaults(true);
    }
  }, [plData, hasCalculatedDefaults]);

  // Check if we have any data
  const hasData = plData?.summary && plData.summary.length > 0;
  const isLoading = loadingKPIs || loadingPL;

  // Dynamic preview metrics based on backend data
  const previewMetrics = useMemo(() => {
    const kpis = kpisData?.kpis;
    
    if (isLoading) {
      return [
        { label: "Projected FY revenue", value: "Loading...", delta: "" },
        { label: "Projected EBITDA", value: "Loading...", delta: "" },
        { label: "Cash runway", value: "Loading...", delta: "" },
      ];
    }

    if (!kpis || !hasData) {
      return [
        { label: "Projected FY revenue", value: "$0", delta: "No data - import historical data first" },
        { label: "Projected EBITDA", value: "$0", delta: "No data available" },
        { label: "Cash runway", value: "N/A", delta: "Add data to calculate" },
      ];
    }

    const projectedRevenue = kpis.total_revenue * 12 * (1 + assumptions.revenueGrowth);
    const projectedCOGS = projectedRevenue * assumptions.cogsPercent;
    const projectedOpex = (kpis.total_revenue - kpis.net_burn) * 12 * (1 + assumptions.opexGrowth);
    const projectedEBITDA = projectedRevenue - projectedCOGS - projectedOpex;

    return [
      {
        label: "Projected FY revenue",
        value: projectedRevenue > 0 ? `$${(projectedRevenue / 1000).toFixed(0)}K` : "$0",
        delta: kpis.revenue_growth !== undefined 
          ? `${kpis.revenue_growth >= 0 ? '+' : ''}${kpis.revenue_growth.toFixed(1)}% current growth` 
          : "No growth data",
      },
      {
        label: "Projected EBITDA",
        value: `$${(projectedEBITDA / 1000).toFixed(0)}K`,
        delta: projectedRevenue > 0 
          ? `${((projectedEBITDA / projectedRevenue) * 100).toFixed(0)}% margin`
          : "N/A",
      },
      {
        label: "Cash runway",
        value: kpis.runway ? `${kpis.runway.toFixed(1)} months` : "N/A",
        delta: kpisData?.data_points && kpisData.data_points > 0 ? `Based on ${kpisData.data_points} periods` : "No data",
      },
    ];
  }, [kpisData, assumptions, isLoading, hasData]);

  const scenarios = scenariosData?.scenarios || [];

  const resetToCalculated = () => {
    setHasCalculatedDefaults(false);
  };

  const handleSaveAsScenario = async () => {
    if (!workspaceId) return;
    
    try {
      const scenario = await createScenario({
        workspace_id: workspaceId,
        name: `Scenario ${new Date().toLocaleDateString()}`,
        description: notes || 'Created from Assumptions page',
        is_base_case: false,
      }).unwrap();

      // Add drivers based on current assumptions
      if (scenario.scenario?.id) {
        const drivers: Partial<Driver>[] = [
          { type: 'GROWTH_RATE', value: { rate: assumptions.revenueGrowth }, target_category: 'REVENUE' },
          { type: 'PERCENT_OF_REVENUE', value: { rate: assumptions.cogsPercent }, target_category: 'COGS' },
          { type: 'GROWTH_RATE', value: { rate: assumptions.opexGrowth }, target_category: 'OPEX' },
        ];

        for (const driver of drivers) {
          await addDriver({
            scenario_id: scenario.scenario.id,
            driver,
          });
        }
      }

      alert('Scenario saved successfully!');
    } catch (error) {
      console.error('Failed to save scenario:', error);
      alert('Failed to save scenario');
    }
  };

  if (!workspaceId) {
    return (
      <div className="flex h-64 items-center justify-center rounded-3xl border border-white/5 bg-black/20">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-400">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 pb-10">
      {/* No Data Warning */}
      {!isLoading && !hasData && (
        <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-300">No Historical Data</h3>
              <p className="text-sm text-amber-200/70">
                Import historical financial data in the <a href="/app/forecast" className="underline hover:text-white">Forecast Wizard</a> to calculate accurate assumptions.
              </p>
            </div>
          </div>
        </div>
      )}

      <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900/80 to-slate-900/40 p-8 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Assumption Control Center
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {hasData 
                ? "Adjust key drivers calculated from your historical data to regenerate the forecast."
                : "Import data first to see calculated assumptions based on your financials."
              }
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <button
              type="button"
              className="group inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 font-semibold text-white transition hover:bg-white/20 hover:text-white disabled:opacity-50"
              onClick={resetToCalculated}
              disabled={!hasData}
            >
              Reset to baseline
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg transition hover:bg-slate-200 hover:scale-105 disabled:opacity-50"
              onClick={handleSaveAsScenario}
              disabled={creatingScenario}
            >
              {creatingScenario ? 'Saving...' : 'Save as new scenario'}
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="grid gap-6">
          {driverGroups.map((group) => (
            <div
              key={group.title}
              className="rounded-3xl border border-white/10 bg-slate-900/40 p-8 backdrop-blur-sm"
            >
              <div className="flex flex-col gap-2 mb-6">
                <h3 className="text-lg font-bold text-white">
                  {group.title}
                </h3>
                <p className="text-sm text-slate-400">{group.description}</p>
              </div>
              <div className="grid gap-8">
                {group.items.map((item) => {
                  const value = assumptions[item.key];
                  const formatted =
                    item.suffix === "%"
                      ? `${(value * 100).toFixed(1)}%`
                      : item.key === "hiringPlan"
                        ? `${value} hires`
                        : `${value} days`;
                  
                  // Calculate slider position (handle negative values)
                  const range = item.max - item.min;
                  const sliderPercent = range > 0 ? ((value - item.min) / range) * 100 : 0;
                  
                  return (
                    <div key={item.key} className="grid gap-3">
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                        <span>{item.label}</span>
                        <span className={`text-sm ${
                          !hasData ? 'text-slate-500' : 
                          value >= 0 ? 'text-cyan-400' : 'text-red-400'
                        }`}>
                          {!hasData ? 'No data' : formatted}
                        </span>
                      </div>
                      <div className="relative h-2 w-full rounded-full bg-slate-800">
                         <div 
                            className={`absolute h-full rounded-full ${
                              value >= 0 
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-500' 
                                : 'bg-gradient-to-r from-red-500 to-orange-500'
                            }`}
                            style={{ width: `${Math.max(0, Math.min(100, sliderPercent))}%` }}
                         ></div>
                        <input
                            type="range"
                            min={item.min}
                            max={item.max}
                            step={item.step}
                            value={value}
                            onChange={(event) =>
                            setAssumptions((prev) => ({
                                ...prev,
                                [item.key]: Number(event.target.value),
                            }))
                            }
                            className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                            disabled={!hasData}
                        />
                      </div>
                      {!hasData && (
                        <p className="text-xs text-slate-600">Import data to enable this control</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        <div className="grid gap-6 content-start">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-slate-800/50 to-slate-900/50 p-6 backdrop-blur-md">
            <p className="text-sm font-bold text-white mb-1">Forecast Preview</p>
            <p className="text-xs text-slate-400 mb-6">
              {hasData ? "Impact vs Baseline" : "No data available"}
            </p>
            <div className="grid gap-4">
              {previewMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-white/5 bg-black/20 p-5 transition hover:border-white/10"
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {metric.label}
                  </p>
                  <div className="mt-2">
                    <p className="text-2xl font-bold text-white tracking-tight">{metric.value}</p>
                    <p className={`text-xs font-medium mt-1 flex items-center gap-1 ${
                      hasData ? 'text-emerald-400' : 'text-slate-500'
                    }`}>
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                          hasData ? 'bg-emerald-400' : 'bg-slate-500'
                        }`}></span>
                        {metric.delta}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-sm">
            <p className="text-sm font-bold text-white mb-1">Narrative Notes</p>
            <p className="text-xs text-slate-400 mb-4">
              Capture rationale for stakeholders.
            </p>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Add notes about your assumptions..."
              className="w-full h-40 rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-500/50 focus:bg-black/30 focus:ring-1 focus:ring-cyan-500/20 resize-none"
            />
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>{notes.length} characters</span>
              <button
                type="button"
                className="text-sm font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Share note →
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-slate-900/40 p-8 backdrop-blur-sm">
        <div className="flex flex-col gap-2 mb-6">
          <h3 className="text-lg font-bold text-white">Saved Scenarios</h3>
          <p className="text-sm text-slate-400">
            {loadingScenarios ? 'Loading scenarios...' : `${scenarios.length} scenarios available`}
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/5">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/5 text-left text-sm">
                <thead className="bg-black/20 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                    <th className="px-6 py-4">Scenario</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Drivers</th>
                    <th className="px-6 py-4">Created</th>
                    <th className="px-6 py-4">Status</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                {loadingScenarios ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                        Loading scenarios...
                      </td>
                    </tr>
                ) : scenarios.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                        No scenarios created yet. Save your assumptions as a scenario.
                      </td>
                    </tr>
                ) : (
                  scenarios.map((scenario) => (
                    <tr key={scenario.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-bold text-white">
                        {scenario.name}
                      </td>
                      <td className="px-6 py-4 text-slate-400 max-w-[200px] truncate">
                        {scenario.description || '-'}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">{scenario.driver_count || 0}</td>
                      <td className="px-6 py-4 text-xs">
                        {new Date(scenario.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                          scenario.is_base_case 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-700/30 text-slate-400 border-slate-600/30'
                        }`}>
                          {scenario.is_base_case ? 'Active' : 'Variant'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
                </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
