'use client';

import { useState, useMemo } from 'react';
import { Scenario, ForecastResult, formatCurrency, toDollars, MLForecastResult, MLModelComparisonResult } from '@/lib/types/api';
import {
  useGetMLServiceStatusQuery,
  useRunProphetForecastMutation,
  useRunProphetTunedForecastMutation,
  useRunSarimaxForecastMutation,
  useRunLightGBMForecastMutation,
  useRunMLEnsembleForecastMutation,
  useCompareMLModelsMutation,
} from '@/lib/store/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts';

type ForecastView = 'standard' | 'ml' | 'combined';
type MLModel = 'prophet' | 'prophet_tuned' | 'sarimax' | 'lightgbm' | 'ensemble' | 'compare';

interface ForecastStepProps {
  workspaceId: string;
  scenarios: Scenario[];
  selectedScenarioId: string | null;
  setSelectedScenarioId: (id: string | null) => void;
  runScenarioForecast: (scenarioId: string, months: number, currentCash?: number) => Promise<ForecastResult>;
  runningForecast: boolean;
  forecastResults: ForecastResult | undefined;
  createScenario: any;
  addDriver: any;
  onForecastComplete: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function ForecastStep({
  workspaceId,
  scenarios,
  selectedScenarioId,
  setSelectedScenarioId,
  runScenarioForecast,
  runningForecast,
  forecastResults,
  createScenario,
  addDriver,
  onForecastComplete,
  onNext,
  onPrev,
}: ForecastStepProps) {
  const [activeView, setActiveView] = useState<ForecastView>('standard');
  const [forecastHorizon, setForecastHorizon] = useState(12);
  const [runBothForecasts, setRunBothForecasts] = useState(false);
  const [currentCash, setCurrentCash] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [localResults, setLocalResults] = useState<ForecastResult | null>(null);
  
  // ML forecasting state
  const [selectedMLModel, setSelectedMLModel] = useState<MLModel>('prophet_tuned');
  const [mlResults, setMLResults] = useState<MLForecastResult | null>(null);
  const [mlCompareResults, setMLCompareResults] = useState<MLModelComparisonResult | null>(null);
  const [confidenceInterval, setConfidenceInterval] = useState(0.95);
  
  // New scenario form
  const [showNewScenario, setShowNewScenario] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState('');
  const [growthRate, setGrowthRate] = useState(5);

  // ML Service hooks
  const { data: mlStatus } = useGetMLServiceStatusQuery();
  const [runProphet, { isLoading: runningProphet }] = useRunProphetForecastMutation();
  const [runProphetTuned, { isLoading: runningProphetTuned }] = useRunProphetTunedForecastMutation();
  const [runSarimax, { isLoading: runningSarimax }] = useRunSarimaxForecastMutation();
  const [runLightGBM, { isLoading: runningLightGBM }] = useRunLightGBMForecastMutation();
  const [runMLEnsemble, { isLoading: runningMLEnsemble }] = useRunMLEnsembleForecastMutation();
  const [compareMLModels, { isLoading: comparingModels }] = useCompareMLModelsMutation();

  const isRunningML = runningProphet || runningProphetTuned || runningSarimax || runningLightGBM || runningMLEnsemble || comparingModels;

  const displayResults = localResults || forecastResults;

  const chartData = useMemo(() => {
    if (!displayResults) return [];

    const historical = displayResults.historical?.map(h => ({
      period: h.period.substring(0, 7),
      historicalRevenue: toDollars(h.revenue),
      historicalExpense: toDollars(h.total_expenses),
      historicalNet: toDollars(h.net_income),
      type: 'historical',
    })) || [];

    const forecast = displayResults.forecast?.map(f => ({
      period: f.period.substring(0, 7),
      forecastRevenue: toDollars(f.revenue),
      forecastExpense: toDollars(f.total_expenses),
      forecastNet: toDollars(f.net_income),
      type: 'forecast',
    })) || [];

    return [...historical, ...forecast];
  }, [displayResults]);

  // ML Chart Data with confidence intervals
  const mlChartData = useMemo(() => {
    if (!mlResults) return [];

    const historical = mlResults.historical?.map(h => ({
      period: h.date.substring(0, 7),
      historical: h.value / 100, // Convert from cents
      type: 'historical',
    })) || [];

    const forecast = mlResults.forecast?.map(f => ({
      period: f.date.substring(0, 7),
      forecast: f.forecast / 100,
      lowerBound: f.lower_bound / 100,
      upperBound: f.upper_bound / 100,
      type: 'forecast',
    })) || [];

    return [...historical, ...forecast];
  }, [mlResults]);

  const handleRunMLForecast = async () => {
    setError(null);
    try {
      let result: MLForecastResult;
      
      if (selectedMLModel === 'compare') {
        const compareResult = await compareMLModels({
          workspace_id: workspaceId,
          periods: forecastHorizon,
        }).unwrap();
        setMLCompareResults(compareResult);
        // Use the best model result based on best_model recommendation
        const bestModelKey = compareResult.best_model?.toLowerCase().replace(/[^a-z]/g, '_');
        const modelMap: Record<string, any> = {
          'prophet': compareResult.models.prophet,
          'prophet_tuned': compareResult.models.prophet_tuned,
          'prophet_financial': compareResult.models.prophet_tuned,
          'sarimax': compareResult.models.sarimax,
          'lightgbm': compareResult.models.lightgbm,
        };
        
        // Try to use the best model, fallback to any available
        const bestResult = modelMap[bestModelKey || ''] 
          || compareResult.models.prophet_tuned 
          || compareResult.models.prophet
          || compareResult.models.sarimax
          || compareResult.models.lightgbm;
        
        if (bestResult) {
          setMLResults(bestResult);
        }
        onForecastComplete({ mlComparison: compareResult });
        return;
      }

      switch (selectedMLModel) {
        case 'prophet':
          result = await runProphet({
            workspace_id: workspaceId,
            periods: forecastHorizon,
            options: { confidenceInterval },
          }).unwrap();
          break;
        case 'prophet_tuned':
          result = await runProphetTuned({
            workspace_id: workspaceId,
            periods: forecastHorizon,
            confidence_interval: confidenceInterval,
          }).unwrap();
          break;
        case 'sarimax':
          result = await runSarimax({
            workspace_id: workspaceId,
            periods: forecastHorizon,
            confidence_interval: confidenceInterval,
          }).unwrap();
          break;
        case 'lightgbm':
          result = await runLightGBM({
            workspace_id: workspaceId,
            periods: forecastHorizon,
            confidence_interval: confidenceInterval,
          }).unwrap();
          break;
        case 'ensemble':
          result = await runMLEnsemble({
            workspace_id: workspaceId,
            periods: forecastHorizon,
            options: { confidenceInterval },
          }).unwrap();
          break;
        default:
          throw new Error('Unknown model');
      }

      setMLResults(result);
      onForecastComplete({ ml: result });
    } catch (err: any) {
      setError(err.data?.error || err.message || 'ML forecast failed');
    }
  };

  const handleRunForecast = async () => {
    if (!selectedScenarioId) {
      setError('Please select a scenario first');
      return;
    }

    setError(null);
    try {
      const result = await runScenarioForecast(
        selectedScenarioId,
        forecastHorizon,
        currentCash ? currentCash * 100 : undefined
      );
      setLocalResults(result);
      onForecastComplete(result);
    } catch (err: any) {
      setError(err.message || 'Forecast failed');
    }
  };

  const handleCreateScenario = async () => {
    if (!newScenarioName.trim()) {
      setError('Please enter a scenario name');
      return;
    }

    try {
      const result = await createScenario({
        workspace_id: workspaceId,
        name: newScenarioName,
        description: `Growth rate: ${growthRate}%`,
        is_base_case: scenarios.length === 0,
      }).unwrap();

      // Add growth driver
      await addDriver({
        scenario_id: result.scenario.id,
        driver: {
          target_category: 'REVENUE',
          type: 'GROWTH_RATE',
          value: { rate: growthRate / 100 },
        },
      }).unwrap();

      setSelectedScenarioId(result.scenario.id);
      setShowNewScenario(false);
      setNewScenarioName('');
    } catch (err: any) {
      setError(err.data?.error || 'Failed to create scenario');
    }
  };

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
          <span className="text-2xl">📈</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Run Financial Forecast</h2>
          <p className="text-sm text-slate-400">
            Choose between driver-based forecasting or advanced ML models
          </p>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveView('standard')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
            activeView === 'standard'
              ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400'
              : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'
          }`}
        >
          <span>📊</span>
          Driver-Based
        </button>
        <button
          onClick={() => setActiveView('ml')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
            activeView === 'ml'
              ? 'bg-purple-500/20 border border-purple-500/50 text-purple-400'
              : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'
          }`}
        >
          <span>🧠</span>
          ML Models
          {mlStatus?.available && (
            <span className="ml-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>
        <button
          onClick={() => setActiveView('combined')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
            activeView === 'combined'
              ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-emerald-500/50 text-emerald-400'
              : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'
          }`}
        >
          <span>⚡</span>
          Combined Analysis
          {displayResults && mlResults && (
            <span className="ml-1 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs">Ready</span>
          )}
        </button>
      </div>

      {/* ML Service Status Banner */}
      {(activeView === 'ml' || activeView === 'combined') && !mlStatus?.available && (
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-400">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>ML Service is not running. Start it with: <code className="bg-black/30 px-2 py-0.5 rounded">docker-compose up ml-service</code></span>
          </div>
        </div>
      )}

      {/* Configuration Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Left Panel: Scenario Selection (Standard/Combined) or Model Selection (ML) */}
        {(activeView === 'standard' || activeView === 'combined') && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-sm font-bold text-white mb-4">Select Scenario</h3>
            
            {scenarios.length > 0 ? (
              <div className="space-y-2">
                {scenarios.map(scenario => (
                  <button
                    key={scenario.id}
                    onClick={() => setSelectedScenarioId(scenario.id)}
                    className={`w-full flex items-center justify-between rounded-lg p-3 transition-all ${
                      selectedScenarioId === scenario.id
                        ? 'bg-cyan-500/20 border border-cyan-500/50'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        selectedScenarioId === scenario.id ? 'bg-cyan-400' : 'bg-slate-500'
                      }`} />
                      <div className="text-left">
                        <p className="text-sm font-medium text-white">{scenario.name}</p>
                        <p className="text-xs text-slate-400">
                          {scenario.driver_count || 0} drivers • {scenario.is_base_case ? 'Base Case' : 'Scenario'}
                        </p>
                      </div>
                    </div>
                    {selectedScenarioId === scenario.id && (
                      <span className="text-cyan-400">✓</span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No scenarios found. Create one below.</p>
            )}

            <button
              onClick={() => setShowNewScenario(true)}
              className="mt-4 w-full rounded-lg border-2 border-dashed border-white/20 p-3 text-sm text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400 transition-all"
            >
              + Create New Scenario
            </button>

            {/* New Scenario Form */}
            {showNewScenario && (
              <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-4">
                <h4 className="text-sm font-bold text-white mb-3">New Scenario</h4>
                <input
                  type="text"
                  value={newScenarioName}
                  onChange={(e) => setNewScenarioName(e.target.value)}
                  placeholder="Scenario name..."
                  className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-cyan-500/50"
                />
                <div className="mt-3">
                  <label className="text-xs text-slate-400">Monthly Growth Rate</label>
                  <div className="flex items-center gap-3 mt-1">
                    <input
                      type="range"
                      min="-20"
                      max="50"
                      value={growthRate}
                      onChange={(e) => setGrowthRate(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm font-bold text-white w-16">{growthRate}%</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={handleCreateScenario}
                    className="flex-1 rounded-lg bg-cyan-500 px-3 py-2 text-sm font-bold text-white hover:bg-cyan-400"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => setShowNewScenario(false)}
                    className="px-3 py-2 text-sm text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {(activeView === 'ml' || activeView === 'combined') && (
          <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-6">
            <h3 className="text-sm font-bold text-white mb-4">Select ML Model</h3>
            
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2">
              {([
                { id: 'prophet_tuned', name: 'Prophet (Financial)', desc: 'Optimized for revenue/expense', icon: '💰', min: 12 },
                { id: 'prophet', name: 'Prophet (Standard)', desc: 'Time series with holidays', icon: '📊', min: 12 },
                { id: 'sarimax', name: 'SARIMAX', desc: 'Seasonal ARIMA model', icon: '📈', min: 24 },
                { id: 'lightgbm', name: 'LightGBM', desc: 'Gradient boosting ML', icon: '⚡', min: 24 },
                { id: 'ensemble', name: 'ML Ensemble', desc: 'Combines all models', icon: '🎯', min: 12 },
                { id: 'compare', name: 'Compare All', desc: 'Run all and pick best', icon: '⚖️', min: 12 },
              ] as { id: MLModel; name: string; desc: string; icon: string; min: number }[]).map(model => (
                <button
                  key={model.id}
                  onClick={() => setSelectedMLModel(model.id)}
                  className={`w-full flex items-center justify-between rounded-lg p-3 transition-all ${
                    selectedMLModel === model.id
                      ? 'bg-purple-500/20 border border-purple-500/50'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{model.icon}</span>
                    <div className="text-left">
                      <p className="text-sm font-medium text-white">{model.name}</p>
                      <p className="text-xs text-slate-400">{model.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">{model.min}+ mo</span>
                    {selectedMLModel === model.id && (
                      <span className="text-purple-400">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <label className="text-xs text-slate-400 mb-2 block">Confidence Interval</label>
              <div className="flex gap-2">
                {[0.90, 0.95, 0.99].map(ci => (
                  <button
                    key={ci}
                    onClick={() => setConfidenceInterval(ci)}
                    className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                      confidenceInterval === ci
                        ? 'bg-purple-500/20 border border-purple-500/50 text-purple-400'
                        : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {(ci * 100).toFixed(0)}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Forecast Parameters - Only show when not in combined view (combined uses full width below) */}
        {activeView !== 'combined' && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-sm font-bold text-white mb-4">Forecast Parameters</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Forecast Horizon</label>
              <div className="flex gap-2">
                {[12, 24, 36].map(months => (
                  <button
                    key={months}
                    onClick={() => setForecastHorizon(months)}
                    className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                      forecastHorizon === months
                        ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400'
                        : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {months} months
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-2 block">
                Current Cash Balance (optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                <input
                  type="number"
                  value={currentCash || ''}
                  onChange={(e) => setCurrentCash(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="For runway calculation"
                  className="w-full rounded-lg border border-white/10 bg-slate-900/60 pl-8 pr-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-cyan-500/50"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Used to calculate your cash runway in months
              </p>
            </div>
          </div>

          {activeView === 'standard' && (
            <button
              onClick={handleRunForecast}
              disabled={!selectedScenarioId || runningForecast}
              className="mt-6 w-full rounded-lg bg-indigo-500 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {runningForecast ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                  Running Forecast...
                </span>
              ) : (
                'Run Driver-Based Forecast'
              )}
            </button>
          )}
          {activeView === 'ml' && (
            <button
              onClick={handleRunMLForecast}
              disabled={!mlStatus?.available || isRunningML}
              className="mt-6 w-full rounded-lg bg-purple-500 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunningML ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                  Running ML Forecast...
                </span>
              ) : (
                <>🧠 Run {selectedMLModel === 'compare' ? 'Model Comparison' : 'ML Forecast'}</>
              )}
            </button>
          )}
        </div>
        )}
      </div>

      {/* Combined Analysis - Run Both Button */}
      {activeView === 'combined' && (
        <div className="mb-8 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                ⚡ Run Combined Analysis
              </h3>
              <p className="text-sm text-slate-400">
                Run both driver-based and ML forecasts to compare and validate results
              </p>
            </div>
            <div className="flex gap-3">
              <div className="text-center">
                <p className="text-xs text-slate-400">Driver-Based</p>
                <p className={`text-sm font-bold ${displayResults ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {displayResults ? '✓ Ready' : 'Not Run'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400">ML Model</p>
                <p className={`text-sm font-bold ${mlResults ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {mlResults ? '✓ Ready' : 'Not Run'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Forecast Horizon</label>
              <div className="flex gap-2">
                {[12, 24, 36].map(months => (
                  <button
                    key={months}
                    onClick={() => setForecastHorizon(months)}
                    className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                      forecastHorizon === months
                        ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
                        : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {months}mo
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Current Cash (optional)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                <input
                  type="number"
                  value={currentCash || ''}
                  onChange={(e) => setCurrentCash(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="For runway"
                  className="w-full rounded-lg border border-white/10 bg-slate-900/60 pl-8 pr-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Confidence Interval</label>
              <div className="flex gap-2">
                {[0.90, 0.95, 0.99].map(ci => (
                  <button
                    key={ci}
                    onClick={() => setConfidenceInterval(ci)}
                    className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                      confidenceInterval === ci
                        ? 'bg-purple-500/20 border border-purple-500/50 text-purple-400'
                        : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {(ci * 100).toFixed(0)}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={async () => {
                setRunBothForecasts(true);
                // Run both forecasts
                if (selectedScenarioId) {
                  try {
                    const result = await runScenarioForecast(
                      selectedScenarioId,
                      forecastHorizon,
                      currentCash ? currentCash * 100 : undefined
                    );
                    setLocalResults(result);
                  } catch (err) {
                    console.error('Driver forecast error:', err);
                  }
                }
                if (mlStatus?.available) {
                  await handleRunMLForecast();
                }
                setRunBothForecasts(false);
              }}
              disabled={!selectedScenarioId || !mlStatus?.available || runningForecast || isRunningML || runBothForecasts}
              className="flex-1 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 px-4 py-3 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {runBothForecasts || runningForecast || isRunningML ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                  Running Both Forecasts...
                </span>
              ) : (
                '⚡ Run Both Forecasts'
              )}
            </button>
            <button
              onClick={handleRunForecast}
              disabled={!selectedScenarioId || runningForecast}
              className="rounded-lg bg-cyan-500/20 border border-cyan-500/50 px-4 py-3 text-sm font-medium text-cyan-400 transition-all hover:bg-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📊 Only Driver
            </button>
            <button
              onClick={handleRunMLForecast}
              disabled={!mlStatus?.available || isRunningML}
              className="rounded-lg bg-purple-500/20 border border-purple-500/50 px-4 py-3 text-sm font-medium text-purple-400 transition-all hover:bg-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🧠 Only ML
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          ⚠️ {error}
        </div>
      )}

      {/* Combined Comparison Results */}
      {activeView === 'combined' && displayResults && mlResults && (
        <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/5 to-transparent p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                🔍 Forecast Comparison Analysis
              </h3>
              <p className="text-sm text-slate-400">
                Comparing driver-based projections with ML predictions
              </p>
            </div>
          </div>

          {/* Combined Overlay Chart */}
          <div className="h-[400px] mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={(() => {
                // Merge both datasets for comparison
                const combined: any[] = [];
                
                // Add historical from standard results
                displayResults.historical?.forEach(h => {
                  combined.push({
                    period: h.period.substring(0, 7),
                    historicalRevenue: toDollars(h.revenue),
                  });
                });
                
                // Add forecasts
                displayResults.forecast?.forEach((f, i) => {
                  const period = f.period.substring(0, 7);
                  const mlPoint = mlResults.forecast?.[i];
                  
                  const existing = combined.find(c => c.period === period);
                  if (existing) {
                    existing.driverForecast = toDollars(f.revenue);
                    if (mlPoint) {
                      existing.mlForecast = mlPoint.forecast / 100;
                      existing.mlLower = mlPoint.lower_bound / 100;
                      existing.mlUpper = mlPoint.upper_bound / 100;
                    }
                  } else {
                    combined.push({
                      period,
                      driverForecast: toDollars(f.revenue),
                      mlForecast: mlPoint ? mlPoint.forecast / 100 : undefined,
                      mlLower: mlPoint ? mlPoint.lower_bound / 100 : undefined,
                      mlUpper: mlPoint ? mlPoint.upper_bound / 100 : undefined,
                    });
                  }
                });
                
                return combined;
              })()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="period" stroke="#64748b" tick={{ fill: '#94a3b8' }} fontSize={12} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8' }} fontSize={12} tickFormatter={formatYAxis} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f8fafc' }}
                  formatter={(value, name) => [`$${(value ?? 0).toLocaleString()}`, name]}
                />
                <Legend />
                
                {/* ML Confidence Band */}
                <Area
                  type="monotone"
                  dataKey="mlUpper"
                  stroke="none"
                  fill="#a855f7"
                  fillOpacity={0.1}
                  name="ML Upper"
                />
                <Area
                  type="monotone"
                  dataKey="mlLower"
                  stroke="none"
                  fill="#a855f7"
                  fillOpacity={0.1}
                  name="ML Lower"
                />
                
                {/* Historical */}
                <Line
                  type="monotone"
                  dataKey="historicalRevenue"
                  stroke="#64748b"
                  strokeWidth={2}
                  dot={false}
                  name="Historical"
                />
                
                {/* Driver-Based Forecast */}
                <Line
                  type="monotone"
                  dataKey="driverForecast"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Driver-Based"
                />
                
                {/* ML Forecast */}
                <Line
                  type="monotone"
                  dataKey="mlForecast"
                  stroke="#a855f7"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="ML Prediction"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Comparison Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {(() => {
              // Calculate comparison metrics
              const driverTotal = displayResults.forecast?.reduce((sum, f) => sum + toDollars(f.revenue), 0) || 0;
              const mlTotal = mlResults.forecast?.reduce((sum, f) => sum + (f.forecast / 100), 0) || 0;
              const difference = driverTotal - mlTotal;
              const percentDiff = mlTotal !== 0 ? ((difference / mlTotal) * 100) : 0;
              
              // Check if ML forecast falls within driver expectations (rough alignment)
              const isAligned = Math.abs(percentDiff) < 15;
              
              return (
                <>
                  <div className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 p-4 text-center">
                    <p className="text-xs text-slate-400">Driver-Based Total</p>
                    <p className="text-xl font-bold text-cyan-400">
                      ${driverTotal.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-4 text-center">
                    <p className="text-xs text-slate-400">ML Prediction Total</p>
                    <p className="text-xl font-bold text-purple-400">
                      ${mlTotal.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white/5 border border-white/10 p-4 text-center">
                    <p className="text-xs text-slate-400">Difference</p>
                    <p className={`text-xl font-bold ${difference >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {difference >= 0 ? '+' : ''}{percentDiff.toFixed(1)}%
                    </p>
                  </div>
                  <div className={`rounded-lg p-4 text-center ${isAligned ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
                    <p className="text-xs text-slate-400">Alignment</p>
                    <p className={`text-xl font-bold ${isAligned ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {isAligned ? '✓ Aligned' : '⚠ Divergent'}
                    </p>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Analysis Insights */}
          <div className="rounded-lg border border-white/10 bg-black/20 p-4">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              💡 Comparison Insights
            </h4>
            <div className="space-y-2 text-sm">
              {(() => {
                const driverTotal = displayResults.forecast?.reduce((sum, f) => sum + toDollars(f.revenue), 0) || 0;
                const mlTotal = mlResults.forecast?.reduce((sum, f) => sum + (f.forecast / 100), 0) || 0;
                const percentDiff = mlTotal !== 0 ? (((driverTotal - mlTotal) / mlTotal) * 100) : 0;
                
                const insights = [];
                
                if (Math.abs(percentDiff) < 5) {
                  insights.push({
                    type: 'success',
                    icon: '✅',
                    text: 'Excellent alignment! Your driver assumptions closely match ML predictions based on historical patterns.'
                  });
                } else if (Math.abs(percentDiff) < 15) {
                  insights.push({
                    type: 'info',
                    icon: '📊',
                    text: 'Good alignment with minor variance. Both models suggest similar growth trajectories.'
                  });
                } else if (percentDiff > 15) {
                  insights.push({
                    type: 'warning',
                    icon: '⚠️',
                    text: 'Driver-based forecast is more optimistic than ML. Consider reviewing growth rate assumptions.'
                  });
                } else {
                  insights.push({
                    type: 'warning',
                    icon: '⚠️',
                    text: 'ML model predicts higher growth than your drivers. You may be underestimating based on historical trends.'
                  });
                }
                
                if (mlResults.metrics?.mape && mlResults.metrics.mape < 10) {
                  insights.push({
                    type: 'info',
                    icon: '🎯',
                    text: `ML model shows strong accuracy (MAPE: ${mlResults.metrics.mape.toFixed(1)}%) on historical validation.`
                  });
                }
                
                insights.push({
                  type: 'tip',
                  icon: '💡',
                  text: 'Use the combined view to validate your assumptions. If forecasts diverge significantly, review your driver logic.'
                });
                
                return insights.map((insight, i) => (
                  <p key={i} className={`flex items-start gap-2 ${
                    insight.type === 'success' ? 'text-emerald-400' :
                    insight.type === 'warning' ? 'text-amber-400' :
                    'text-slate-300'
                  }`}>
                    <span>{insight.icon}</span>
                    <span>{insight.text}</span>
                  </p>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Standard Results */}
      {(activeView === 'standard' || activeView === 'combined') && displayResults && (
        <div className="rounded-xl border border-white/10 bg-black/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Forecast Results</h3>
              <p className="text-sm text-slate-400">
                {displayResults.metadata?.months_projected} months projected • {displayResults.metadata?.drivers_applied} drivers applied
              </p>
            </div>
            {displayResults.runway && (
              <div className="text-right">
                <p className="text-xs text-slate-400">Cash Runway</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {displayResults.runway.toFixed(1)} months
                </p>
              </div>
            )}
          </div>

          {/* Forecast Chart */}
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="period" stroke="#64748b" tick={{ fill: '#94a3b8' }} fontSize={12} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8' }} fontSize={12} tickFormatter={formatYAxis} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f8fafc' }}
                  formatter={(value) => [`$${(value ?? 0).toLocaleString()}`, '']}
                />
                <Legend />
                
                {/* Historical lines */}
                <Line
                  type="monotone"
                  dataKey="historicalRevenue"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  dot={false}
                  name="Historical Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="historicalNet"
                  stroke="#34d399"
                  strokeWidth={2}
                  dot={false}
                  name="Historical Net Income"
                />
                
                {/* Forecast lines (dashed) */}
                <Line
                  type="monotone"
                  dataKey="forecastRevenue"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Forecast Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="forecastNet"
                  stroke="#34d399"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Forecast Net Income"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Table */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-white/5 p-4 text-center">
              <p className="text-xs text-slate-400">Total Forecast Revenue</p>
              <p className="text-xl font-bold text-emerald-400">
                ${(displayResults.forecast?.reduce((sum, f) => sum + toDollars(f.revenue), 0) || 0).toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg bg-white/5 p-4 text-center">
              <p className="text-xs text-slate-400">Total Forecast Expenses</p>
              <p className="text-xl font-bold text-red-400">
                ${(displayResults.forecast?.reduce((sum, f) => sum + toDollars(f.total_expenses), 0) || 0).toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg bg-white/5 p-4 text-center">
              <p className="text-xs text-slate-400">Total Forecast Net Income</p>
              <p className="text-xl font-bold text-cyan-400">
                ${(displayResults.forecast?.reduce((sum, f) => sum + toDollars(f.net_income), 0) || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ML Forecast Results */}
      {(activeView === 'ml' || activeView === 'combined') && mlResults && (
        <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                🧠 {mlResults.model} Forecast
              </h3>
              <p className="text-sm text-slate-400">
                {mlResults.metadata?.periods_projected} months projected • {mlResults.metadata?.data_points} data points analyzed
              </p>
            </div>
            {mlResults.metrics && (
              <div className="flex gap-4">
                <div className="text-right">
                  <p className="text-xs text-slate-400">MAPE</p>
                  <p className={`text-xl font-bold ${mlResults.metrics.mape < 10 ? 'text-emerald-400' : mlResults.metrics.mape < 20 ? 'text-amber-400' : 'text-red-400'}`}>
                    {mlResults.metrics.mape.toFixed(1)}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Coverage</p>
                  <p className="text-xl font-bold text-purple-400">
                    {mlResults.metrics.coverage.toFixed(0)}%
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ML Forecast Chart with Confidence Intervals */}
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={mlChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="period" stroke="#64748b" tick={{ fill: '#94a3b8' }} fontSize={12} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8' }} fontSize={12} tickFormatter={formatYAxis} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f8fafc' }}
                  formatter={(value, name) => {
                    const label = name === 'historical' ? 'Historical' : 
                                  name === 'forecast' ? 'Forecast' :
                                  name === 'upperBound' ? 'Upper Bound' :
                                  name === 'lowerBound' ? 'Lower Bound' : name;
                    return [`$${(value ?? 0).toLocaleString()}`, label];
                  }}
                />
                <Legend />
                
                {/* Confidence Interval Area */}
                <Area
                  type="monotone"
                  dataKey="upperBound"
                  stroke="none"
                  fill="#a855f7"
                  fillOpacity={0.1}
                  name="Upper Bound"
                />
                <Area
                  type="monotone"
                  dataKey="lowerBound"
                  stroke="none"
                  fill="#a855f7"
                  fillOpacity={0.1}
                  name="Lower Bound"
                />
                
                {/* Historical line */}
                <Line
                  type="monotone"
                  dataKey="historical"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  dot={false}
                  name="Historical"
                />
                
                {/* Forecast line */}
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#a855f7"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Forecast"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* ML Model Metrics */}
          {mlResults.metrics && (
            <div className="mt-6 grid grid-cols-4 gap-4">
              <div className="rounded-lg bg-white/5 p-4 text-center">
                <p className="text-xs text-slate-400">MAE</p>
                <p className="text-lg font-bold text-white">
                  ${mlResults.metrics.mae.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-white/5 p-4 text-center">
                <p className="text-xs text-slate-400">MAPE</p>
                <p className={`text-lg font-bold ${mlResults.metrics.mape < 10 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {mlResults.metrics.mape.toFixed(2)}%
                </p>
              </div>
              <div className="rounded-lg bg-white/5 p-4 text-center">
                <p className="text-xs text-slate-400">RMSE</p>
                <p className="text-lg font-bold text-white">
                  ${mlResults.metrics.rmse.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-white/5 p-4 text-center">
                <p className="text-xs text-slate-400">Coverage</p>
                <p className="text-lg font-bold text-purple-400">
                  {mlResults.metrics.coverage.toFixed(1)}%
                </p>
              </div>
            </div>
          )}

          {/* Model Comparison Results */}
          {mlCompareResults && (
            <div className="mt-6 rounded-lg border border-white/10 bg-black/20 p-4">
              <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                ⚖️ Model Comparison Results
              </h4>
              <p className="text-sm text-emerald-400 mb-3">
                Best Model: <span className="font-bold">{mlCompareResults.best_model}</span>
              </p>
              <p className="text-xs text-slate-400">{mlCompareResults.recommendation}</p>
            </div>
          )}
        </div>
      )}

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
          disabled={!displayResults && !mlResults}
          className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-cyan-400 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          View Scenarios →
        </button>
      </div>
    </div>
  );
}

