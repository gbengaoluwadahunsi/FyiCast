'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useForecast } from '@/lib/hooks/useForecast';
import { useGetPLSummaryQuery, useImportCSVMutation, useCreateScenarioMutation, useAddDriverMutation } from '@/lib/store/api';

// Wizard Steps
import { UploadStep } from '@/components/forecast/UploadStep';
import { DataReviewStep } from '@/components/forecast/DataReviewStep';
import { EDAStep } from '@/components/forecast/EDAStep';
import { ForecastStep } from '@/components/forecast/ForecastStep';
import { ScenariosStep } from '@/components/forecast/ScenariosStep';
import { ExportStep } from '@/components/forecast/ExportStep';

type WizardStep = 'upload' | 'review' | 'eda' | 'forecast' | 'scenarios' | 'export';

const STEPS: { id: WizardStep; label: string; icon: string }[] = [
  { id: 'upload', label: 'Upload Data', icon: '📤' },
  { id: 'review', label: 'Review Data', icon: '📊' },
  { id: 'eda', label: 'Analysis', icon: '🔍' },
  { id: 'forecast', label: 'Forecast', icon: '📈' },
  { id: 'scenarios', label: 'Scenarios', icon: '🎯' },
  { id: 'export', label: 'Export', icon: '💾' },
];

export default function ForecastWizardPage() {
  const { workspaceId } = useAuth();
  const [currentStep, setCurrentStep] = useState<WizardStep>('upload');
  const [uploadedData, setUploadedData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any>(null);
  const [scenarioData, setScenarioData] = useState<any>(null);

  const { data: plData, isLoading: loadingPL, refetch: refetchPL } = useGetPLSummaryQuery(
    { workspace_id: workspaceId! },
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

  const [importCSV, { isLoading: importing }] = useImportCSVMutation();
  const [createScenario] = useCreateScenarioMutation();
  const [addDriver] = useAddDriverMutation();

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

  const goToStep = (step: WizardStep) => {
    setCurrentStep(step);
  };

  const goNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].id);
    }
  };

  const goPrev = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].id);
    }
  };

  const handleDataUploaded = useCallback((data: any) => {
    setUploadedData(data);
    refetchPL();
  }, [refetchPL]);

  const handleForecastComplete = useCallback((data: any) => {
    setForecastData(data);
  }, []);

  const handleScenariosGenerated = useCallback((data: any) => {
    setScenarioData(data);
  }, []);

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
    <div className="flex flex-col gap-6 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Financial Forecast Wizard</h1>
          <p className="text-slate-400 mt-1">Step-by-step financial forecasting and scenario analysis</p>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <button
                onClick={() => goToStep(step.id)}
                className={`flex flex-col items-center gap-2 group transition-all ${
                  index <= currentStepIndex
                    ? 'cursor-pointer'
                    : 'cursor-not-allowed opacity-50'
                }`}
                disabled={index > currentStepIndex}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
                    index < currentStepIndex
                      ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400'
                      : index === currentStepIndex
                      ? 'bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                      : 'bg-white/5 border-2 border-white/10 text-slate-500'
                  }`}
                >
                  {index < currentStepIndex ? '✓' : step.icon}
                </div>
                <span
                  className={`text-xs font-medium transition-colors ${
                    index <= currentStepIndex ? 'text-white' : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </span>
              </button>
              
              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 transition-colors ${
                    index < currentStepIndex ? 'bg-emerald-500' : 'bg-white/10'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-900/40 backdrop-blur-xl overflow-hidden">
        {currentStep === 'upload' && (
          <UploadStep
            workspaceId={workspaceId}
            onDataUploaded={handleDataUploaded}
            onNext={goNext}
            importing={importing}
            importCSV={importCSV}
          />
        )}

        {currentStep === 'review' && (
          <DataReviewStep
            workspaceId={workspaceId}
            plData={plData}
            loadingPL={loadingPL}
            onNext={goNext}
            onPrev={goPrev}
          />
        )}

        {currentStep === 'eda' && (
          <EDAStep
            workspaceId={workspaceId}
            plData={plData}
            onNext={goNext}
            onPrev={goPrev}
          />
        )}

        {currentStep === 'forecast' && (
          <ForecastStep
            workspaceId={workspaceId}
            scenarios={scenarios}
            selectedScenarioId={selectedScenarioId}
            setSelectedScenarioId={setSelectedScenarioId}
            runScenarioForecast={runScenarioForecast}
            runningForecast={runningForecast}
            forecastResults={forecastResults}
            createScenario={createScenario}
            addDriver={addDriver}
            onForecastComplete={handleForecastComplete}
            onNext={goNext}
            onPrev={goPrev}
          />
        )}

        {currentStep === 'scenarios' && (
          <ScenariosStep
            workspaceId={workspaceId}
            forecastData={forecastData || forecastResults}
            onScenariosGenerated={handleScenariosGenerated}
            onNext={goNext}
            onPrev={goPrev}
          />
        )}

        {currentStep === 'export' && (
          <ExportStep
            workspaceId={workspaceId}
            forecastData={forecastData || forecastResults}
            scenarioData={scenarioData}
            selectedScenarioId={selectedScenarioId}
            onPrev={goPrev}
          />
        )}
      </div>
    </div>
  );
}

