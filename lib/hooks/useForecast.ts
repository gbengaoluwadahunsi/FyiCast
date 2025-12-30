// lib/hooks/useForecast.ts

import { useState, useCallback } from 'react';
import { 
  useGetScenariosQuery, 
  useRunForecastMutation,
  useGetForecastResultsQuery 
} from '../store/api';
import type { ForecastResult } from '../types/api';

export const useForecast = (workspaceId: string) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  
  const { data: scenariosData, isLoading: loadingScenarios } = 
    useGetScenariosQuery(workspaceId);
  
  const [runForecast, { isLoading: runningForecast }] = 
    useRunForecastMutation();
  
  const { data: forecastResults, isLoading: loadingResults } = 
    useGetForecastResultsQuery(selectedScenarioId!, {
      skip: !selectedScenarioId,
    });

  const runScenarioForecast = useCallback(
    async (
      scenarioId: string,
      months: number = 12,
      currentCash?: number
    ): Promise<ForecastResult> => {
      try {
        const result = await runForecast({
          scenario_id: scenarioId,
          months,
          current_cash: currentCash,
        }).unwrap();
        setSelectedScenarioId(scenarioId);
        return result;
      } catch (error: any) {
        throw new Error(error.data?.error || 'Forecast failed');
      }
    },
    [runForecast]
  );

  return {
    scenarios: scenariosData?.scenarios || [],
    selectedScenarioId,
    setSelectedScenarioId,
    forecastResults,
    loadingScenarios,
    runningForecast,
    loadingResults,
    runScenarioForecast,
  };
};



