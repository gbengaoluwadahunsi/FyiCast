'use client';

import { useMemo, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useGetScenariosQuery, useCreateScenarioMutation, useRunForecastMutation, useGetDashboardKPIsQuery, useGetWorkspaceQuery } from "@/lib/store/api";
import { Scenario } from "@/lib/types/api";

export default function ScenariosPage() {
  const { workspaceId } = useAuth();
  const { data: scenariosData, isLoading } = useGetScenariosQuery(
    workspaceId!,
    { skip: !workspaceId }
  );
  const { data: kpisData } = useGetDashboardKPIsQuery(
    workspaceId!,
    { skip: !workspaceId }
  );
  const { data: workspaceData } = useGetWorkspaceQuery(
    workspaceId!,
    { skip: !workspaceId }
  );
  const [createScenario] = useCreateScenarioMutation();
  const [runForecast, { isLoading: runningForecast }] = useRunForecastMutation();
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showForecastModal, setShowForecastModal] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState("");
  const [newScenarioDescription, setNewScenarioDescription] = useState("");
  const [forecastMonths, setForecastMonths] = useState(12);
  const [forecastCash, setForecastCash] = useState<number | null>(null);

  const scenarios = scenariosData?.scenarios || [];
  const selectedScenario = useMemo(() => 
    scenarios.find(s => s.id === selectedId) || scenarios[0],
    [scenarios, selectedId]
  );

  // Get current cash from KPIs data or use 0 as fallback
  const currentCash = kpisData?.kpis?.cash_on_hand || 0;

  // Set default selection when scenarios load
  useMemo(() => {
    if (scenarios.length > 0 && !selectedId) {
      setSelectedId(scenarios[0].id);
    }
  }, [scenarios, selectedId]);

  const handleCreateScenario = async () => {
    if (!workspaceId || !newScenarioName.trim()) return;
    
    try {
      await createScenario({
        workspace_id: workspaceId,
        name: newScenarioName.trim(),
        description: newScenarioDescription.trim() || undefined,
        is_base_case: scenarios.length === 0,
      }).unwrap();
      setShowCreateModal(false);
      setNewScenarioName("");
      setNewScenarioDescription("");
    } catch (err) {
      console.error("Failed to create scenario:", err);
    }
  };

  const handleRunForecast = async (scenarioId: string) => {
    // Use configured values or defaults from backend data
    const cashValue = forecastCash !== null ? forecastCash : currentCash;
    
    try {
      await runForecast({
        scenario_id: scenarioId,
        months: forecastMonths,
        current_cash: cashValue,
      }).unwrap();
      setShowForecastModal(false);
    } catch (err) {
      console.error("Failed to run forecast:", err);
    }
  };

  const openForecastModal = (scenarioId: string) => {
    setSelectedId(scenarioId);
    setForecastCash(currentCash);
    setShowForecastModal(true);
  };

  const getScenarioColor = (index: number) => {
    const colors = ['blue', 'emerald', 'rose', 'amber', 'purple', 'cyan'];
    return colors[index % colors.length];
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
      <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900/80 to-slate-900/40 p-8 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Scenario Workspace</h1>
            <p className="text-sm text-slate-400 mt-1">
              Compare strategic paths and understand impact on growth, cash, and hiring.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-bold text-slate-950 transition-all hover:bg-cyan-50 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            >
              <span className="text-lg leading-none">+</span>
              Create Scenario
            </button>
          </div>
        </div>
      </section>

      {/* Create Scenario Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-8">
            <h2 className="text-xl font-bold text-white mb-6">Create New Scenario</h2>
            <div className="grid gap-4">
              <label className="grid gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Name</span>
                <input
                  value={newScenarioName}
                  onChange={(e) => setNewScenarioName(e.target.value)}
                  placeholder="e.g., Base Case, Upside, Downside"
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-500/50"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Description</span>
                <textarea
                  value={newScenarioDescription}
                  onChange={(e) => setNewScenarioDescription(e.target.value)}
                  placeholder="Describe the assumptions and drivers for this scenario..."
                  rows={3}
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-500/50 resize-none"
                />
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateScenario}
                disabled={!newScenarioName.trim()}
                className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-950 hover:bg-slate-200 disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Run Forecast Modal */}
      {showForecastModal && selectedScenario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-8">
            <h2 className="text-xl font-bold text-white mb-2">Run Forecast</h2>
            <p className="text-sm text-slate-400 mb-6">Configure forecast parameters for "{selectedScenario.name}"</p>
            <div className="grid gap-4">
              <label className="grid gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Forecast Period (Months)</span>
                <input
                  type="number"
                  value={forecastMonths}
                  onChange={(e) => setForecastMonths(Number(e.target.value))}
                  min={1}
                  max={60}
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-500/50"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Current Cash on Hand ({workspaceData?.workspace?.currency || 'USD'})
                </span>
                <input
                  type="number"
                  value={forecastCash ?? currentCash}
                  onChange={(e) => setForecastCash(Number(e.target.value))}
                  min={0}
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-500/50"
                />
                <p className="text-xs text-slate-500">
                  {currentCash > 0 
                    ? `From your latest data: $${currentCash.toLocaleString()}`
                    : 'No cash data found - import historical data first'}
                </p>
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowForecastModal(false)}
                className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRunForecast(selectedScenario.id)}
                disabled={runningForecast}
                className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
              >
                {runningForecast ? 'Running...' : 'Run Forecast'}
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-sm">
          <p className="text-sm font-bold text-white mb-1">Scenario List</p>
          <p className="text-xs text-slate-400 mb-6">
            {isLoading ? 'Loading scenarios...' : `${scenarios.length} scenarios`}
          </p>
          <div className="grid gap-3">
            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent"></div>
              </div>
            ) : scenarios.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center">
                <p className="text-sm text-slate-400">No scenarios yet. Create your first scenario to get started.</p>
              </div>
            ) : (
              scenarios.map((scenario, index) => {
                const color = getScenarioColor(index);
                const active = scenario.id === selectedScenario?.id;
                return (
                  <button
                    key={scenario.id}
                    onClick={() => setSelectedId(scenario.id)}
                    className={`relative flex w-full flex-col gap-3 rounded-2xl border px-5 py-4 text-left transition-all duration-300 ${
                      active
                        ? "border-cyan-500/50 bg-gradient-to-br from-cyan-500/20 to-transparent shadow-lg"
                        : "border-white/5 bg-white/5 text-slate-400 hover:border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {active && <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-cyan-500"></div>}
                    
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span className={active ? "text-white" : "text-slate-300"}>{scenario.name}</span>
                      {scenario.is_base_case && (
                        <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                          Base
                        </span>
                      )}
                    </div>
                    <p className={`text-xs leading-relaxed ${active ? "text-slate-300" : "text-slate-500"}`}>
                      {scenario.description || "No description provided"}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span>{scenario.driver_count || 0} drivers</span>
                      <span>•</span>
                      <span>Created {new Date(scenario.created_at).toLocaleDateString()}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
        
        <div className="grid gap-6 content-start">
          {selectedScenario ? (
            <>
              <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-8 backdrop-blur-md">
                <div className="flex flex-col gap-2 mb-8">
                  <h2 className="text-xl font-bold text-white">
                    {selectedScenario.name} <span className="text-slate-500 font-medium">Overview</span>
                  </h2>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {selectedScenario.description || "No description provided for this scenario."}
                  </p>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-3 mb-8">
                  <div className="group rounded-2xl border border-white/10 bg-white/5 p-5 hover:border-white/20 transition-colors">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                      Drivers
                    </p>
                    <p className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {selectedScenario.driver_count || 0}
                    </p>
                  </div>
                  <div className="group rounded-2xl border border-white/10 bg-white/5 p-5 hover:border-white/20 transition-colors">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                      Type
                    </p>
                    <p className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {selectedScenario.is_base_case ? "Base Case" : "Variant"}
                    </p>
                  </div>
                  <div className="group rounded-2xl border border-white/10 bg-white/5 p-5 hover:border-white/20 transition-colors">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                      Created
                    </p>
                    <p className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                      {new Date(selectedScenario.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => openForecastModal(selectedScenario.id)}
                  disabled={runningForecast}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] disabled:opacity-50"
                >
                  {runningForecast ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                      Running Forecast...
                    </>
                  ) : (
                    'Run Forecast'
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/20 p-12 text-center">
              <p className="text-slate-400">Select a scenario to view details</p>
            </div>
          )}
        </div>
      </section>

      {/* Scenarios Comparison Section */}
      {scenarios.length >= 2 && (
        <section className="rounded-3xl border border-white/10 bg-slate-900/40 p-8 backdrop-blur-sm">
          <div className="flex flex-col gap-2 mb-6">
            <h3 className="text-lg font-bold text-white">
              Scenario Overview
            </h3>
            <p className="text-sm text-slate-400">
              Compare scenarios and their configurations.
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/5">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                <thead className="bg-black/20 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Scenario</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Drivers</th>
                    <th className="px-6 py-4">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {scenarios.map((scenario) => (
                    <tr key={scenario.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-bold text-white">
                        {scenario.name}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          scenario.is_base_case 
                            ? 'bg-emerald-500/20 text-emerald-300' 
                            : 'bg-slate-500/20 text-slate-400'
                        }`}>
                          {scenario.is_base_case ? 'Base' : 'Variant'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">{scenario.driver_count || 0}</td>
                      <td className="px-6 py-4 font-medium">{new Date(scenario.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
