// lib/store/api.ts

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { 
  AuthResponse, 
  User, 
  Workspace,
  PLSummary,
  Account,
  Scenario,
  Driver,
  ForecastResult,
  AdvancedForecastResult,
  EDAResult,
  ValidationResult,
  ScenarioAnalysisResult,
  // Month 3
  IntegrationProviderInfo,
  IntegrationStatus,
  SyncResult,
  // Month 4
  FormulaValidation,
  FormulaEvaluation,
  ExampleFormula,
  CustomDriver,
  Comment,
  // Month 5
  AIInsights,
  AIAnswer,
  VarianceReport,
  PriceVolumeDecomposition,
  // Month 6
  Group,
  ConsolidatedPL,
  AuditLogsResponse,
  ActivitySummary,
  ApiKey,
  CacheStats,
  DashboardKPIs,
  HistoricalRow,
  // ML Service
  MLServiceHealth,
  MLForecastResult,
  MLModelComparisonResult,
} from '../types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: 'include', // Include cookies in requests for HTTP-only auth
});

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['User', 'Workspace', 'Data', 'Scenario', 'Forecast', 'Integration', 'Comment', 'Group', 'Audit', 'ApiKey'],
  endpoints: (builder) => ({
    // ==================== Auth ====================
    register: builder.mutation<AuthResponse, { email: string; password: string; full_name: string }>({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    login: builder.mutation<AuthResponse, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User', 'Workspace', 'Data', 'Scenario', 'Forecast'],
    }),
    refreshToken: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
      }),
    }),
    getCurrentUser: builder.query<{ user: User; workspaces: Workspace[] }, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    verifyEmail: builder.mutation<{ message: string }, { token: string }>({
      query: (data) => ({
        url: '/auth/verify-email',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    resendVerification: builder.mutation<{ message: string }, { email: string }>({
      query: (data) => ({
        url: '/auth/resend-verification',
        method: 'POST',
        body: data,
      }),
    }),
    forgotPassword: builder.mutation<{ message: string }, { email: string }>({
      query: (data) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),
    resetPassword: builder.mutation<{ message: string }, { token: string; password: string }>({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),

    // ==================== Workspaces ====================
    getWorkspaces: builder.query<{ workspaces: Workspace[] }, void>({
      query: () => '/workspaces',
      providesTags: ['Workspace'],
    }),
    getWorkspace: builder.query<{ workspace: Workspace }, string>({
      query: (id) => `/workspaces/${id}`,
      providesTags: ['Workspace'],
    }),

    // ==================== Data ====================
    importCSV: builder.mutation<{ imported: number; total: number }, { workspace_id: string; csv_data: string }>({
      query: (data) => ({
        url: '/data/import/csv',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Data'],
    }),
    getPLSummary: builder.query<PLSummary, { workspace_id: string; start_date?: string; end_date?: string }>({
      query: ({ workspace_id, start_date, end_date }) => {
        const params = new URLSearchParams({ workspace_id });
        if (start_date) params.append('start_date', start_date);
        if (end_date) params.append('end_date', end_date);
        return `/data/summary?${params.toString()}`;
      },
      providesTags: ['Data'],
    }),
    getAccounts: builder.query<{ accounts: Account[] }, string>({
      query: (workspace_id) => `/data/accounts?workspace_id=${workspace_id}`,
      providesTags: ['Data'],
    }),
    getDashboardKPIs: builder.query<DashboardKPIs, string>({
      query: (workspace_id) => `/data/kpis?workspace_id=${workspace_id}`,
      providesTags: ['Data'],
    }),
    getHistoricalRows: builder.query<{ rows: HistoricalRow[]; count: number }, string>({
      query: (workspace_id) => `/data/historical?workspace_id=${workspace_id}`,
      providesTags: ['Data'],
    }),

    // ==================== Forecasting ====================
    getScenarios: builder.query<{ scenarios: Scenario[] }, string>({
      query: (workspace_id) => `/forecast/scenarios?workspace_id=${workspace_id}`,
      providesTags: ['Scenario'],
    }),
    createScenario: builder.mutation<{ scenario: Scenario }, Partial<Scenario>>({
      query: (data) => ({
        url: '/forecast/scenarios',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Scenario'],
    }),
    addDriver: builder.mutation<{ driver: Driver }, { scenario_id: string; driver: Partial<Driver> }>({
      query: ({ scenario_id, driver }) => ({
        url: `/forecast/scenarios/${scenario_id}/drivers`,
        method: 'POST',
        body: driver,
      }),
      invalidatesTags: ['Scenario'],
    }),
    runForecast: builder.mutation<ForecastResult, { scenario_id: string; months?: number; current_cash?: number }>({
      query: (data) => ({
        url: '/forecast/run',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Forecast'],
    }),
    getForecastResults: builder.query<ForecastResult, string>({
      query: (scenario_id) => `/forecast/results/${scenario_id}`,
      providesTags: ['Forecast'],
    }),

    // ==================== Advanced Forecasting ====================
    runAdvancedForecast: builder.mutation<AdvancedForecastResult, { 
      workspace_id: string; 
      months?: number; 
      models?: string[] 
    }>({
      query: (data) => ({
        url: '/forecast/run-advanced',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Forecast'],
    }),
    getEDA: builder.query<EDAResult, string>({
      query: (workspace_id) => `/forecast/eda?workspace_id=${workspace_id}`,
      providesTags: ['Data'],
    }),
    validateModels: builder.mutation<ValidationResult, { workspace_id: string; test_size?: number }>({
      query: (data) => ({
        url: '/forecast/validate',
        method: 'POST',
        body: data,
      }),
    }),
    analyzeScenarios: builder.mutation<ScenarioAnalysisResult, {
      forecast_id?: string;
      base_revenue: number[];
      base_expense: number[];
      dates: string[];
    }>({
      query: (data) => ({
        url: '/forecast/scenarios/analyze',
        method: 'POST',
        body: data,
      }),
    }),

    // ==================== Month 3: Reports ====================
    generatePDFReport: builder.query<Blob, { workspace_id: string; scenario_id?: string }>({
      query: ({ workspace_id, scenario_id }) => {
        const params = new URLSearchParams({ workspace_id });
        if (scenario_id) params.append('scenario_id', scenario_id);
        return {
          url: `/advanced/reports/pdf?${params.toString()}`,
          responseHandler: (response) => response.blob(),
        };
      },
    }),

    // ==================== Month 3: Integrations ====================
    getIntegrationProviders: builder.query<{ providers: IntegrationProviderInfo[] }, void>({
      query: () => '/advanced/integrations/providers',
    }),
    getIntegrationStatus: builder.query<{ integrations: IntegrationStatus[] }, string>({
      query: (workspace_id) => `/advanced/integrations/status?workspace_id=${workspace_id}`,
      providesTags: ['Integration'],
    }),
    startOAuthFlow: builder.query<{ authorization_url: string; state: string }, { provider: string; workspace_id: string }>({
      query: ({ provider, workspace_id }) => 
        `/advanced/integrations/${provider}/auth?workspace_id=${workspace_id}`,
    }),
    syncIntegration: builder.mutation<SyncResult, { provider: string; workspace_id: string; start_date?: string; end_date?: string }>({
      query: ({ provider, ...data }) => ({
        url: `/advanced/integrations/${provider}/sync`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Integration', 'Data'],
    }),

    // ==================== Month 4: Formulas ====================
    validateFormula: builder.mutation<FormulaValidation, { formula: string }>({
      query: (data) => ({
        url: '/advanced/formulas/validate',
        method: 'POST',
        body: data,
      }),
    }),
    evaluateFormula: builder.mutation<FormulaEvaluation, { formula: string; variables: Record<string, number> }>({
      query: (data) => ({
        url: '/advanced/formulas/evaluate',
        method: 'POST',
        body: data,
      }),
    }),
    getExampleFormulas: builder.query<{ examples: ExampleFormula[] }, void>({
      query: () => '/advanced/formulas/examples',
    }),
    createCustomDriver: builder.mutation<{ driver: CustomDriver }, {
      workspace_id: string;
      name: string;
      formula: string;
      variables?: Record<string, any>;
      description?: string;
    }>({
      query: (data) => ({
        url: '/advanced/formulas/drivers',
        method: 'POST',
        body: data,
      }),
    }),

    // ==================== Month 4: Comments ====================
    getComments: builder.query<{ comments: Comment[] }, { workspace_id: string; entity_type?: string; entity_id?: string }>({
      query: ({ workspace_id, entity_type, entity_id }) => {
        const params = new URLSearchParams({ workspace_id });
        if (entity_type) params.append('entity_type', entity_type);
        if (entity_id) params.append('entity_id', entity_id);
        return `/advanced/comments?${params.toString()}`;
      },
      providesTags: ['Comment'],
    }),
    createComment: builder.mutation<{ comment: Comment }, {
      workspace_id: string;
      entity_type: string;
      entity_id?: string;
      period?: string;
      text: string;
    }>({
      query: (data) => ({
        url: '/advanced/comments',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Comment'],
    }),

    // ==================== Month 5: AI ====================
    getAIInsights: builder.query<AIInsights, string>({
      query: (workspace_id) => `/advanced/ai/insights?workspace_id=${workspace_id}`,
    }),
    askAI: builder.mutation<AIAnswer, { question: string; workspace_id?: string; context?: any; save_to_chat?: boolean }>({
      query: (data) => ({
        url: '/advanced/ai/ask',
        method: 'POST',
        body: data,
      }),
    }),

    // ==================== Month 5: Variance Analysis ====================
    getVarianceAnalysis: builder.mutation<VarianceReport, {
      actual: { revenue: number; cogs: number; opex: number; personnel: number };
      forecast: { revenue: number; cogs: number; opex: number; personnel: number };
      period?: string;
    }>({
      query: (data) => ({
        url: '/advanced/analysis/variance',
        method: 'POST',
        body: data,
      }),
    }),
    getPriceVolumeDecomposition: builder.mutation<PriceVolumeDecomposition, {
      actualRevenue: number;
      forecastRevenue: number;
      actualUnits: number;
      forecastUnits: number;
    }>({
      query: (data) => ({
        url: '/advanced/analysis/price-volume',
        method: 'POST',
        body: data,
      }),
    }),

    // ==================== Month 6: Groups ====================
    getGroups: builder.query<{ groups: Group[] }, void>({
      query: () => '/advanced/groups',
      providesTags: ['Group'],
    }),
    createGroup: builder.mutation<{ group: Group }, { name: string; currency?: string }>({
      query: (data) => ({
        url: '/advanced/groups',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Group'],
    }),
    getConsolidatedPL: builder.query<ConsolidatedPL, { group_id: string; start_date?: string; end_date?: string }>({
      query: ({ group_id, start_date, end_date }) => {
        const params = new URLSearchParams();
        if (start_date) params.append('start_date', start_date);
        if (end_date) params.append('end_date', end_date);
        return `/advanced/groups/${group_id}/consolidated?${params.toString()}`;
      },
      providesTags: ['Group'],
    }),
    addWorkspaceToGroup: builder.mutation<{ message: string }, { group_id: string; workspace_id: string }>({
      query: ({ group_id, workspace_id }) => ({
        url: `/advanced/groups/${group_id}/workspaces`,
        method: 'POST',
        body: { workspace_id },
      }),
      invalidatesTags: ['Group'],
    }),

    // ==================== Month 6: Audit ====================
    getAuditLogs: builder.query<AuditLogsResponse, {
      workspace_id: string;
      resource_type?: string;
      action?: string;
      start_date?: string;
      end_date?: string;
      limit?: number;
      offset?: number;
    }>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) searchParams.append(key, String(value));
        });
        return `/advanced/audit?${searchParams.toString()}`;
      },
      providesTags: ['Audit'],
    }),
    getActivitySummary: builder.query<{ summary: ActivitySummary }, { workspace_id: string; days?: number }>({
      query: ({ workspace_id, days }) => {
        const params = new URLSearchParams({ workspace_id });
        if (days) params.append('days', String(days));
        return `/advanced/audit/summary?${params.toString()}`;
      },
      providesTags: ['Audit'],
    }),

    // ==================== Month 6: API Keys ====================
    getApiKeys: builder.query<{ api_keys: ApiKey[] }, string>({
      query: (workspace_id) => `/advanced/api-keys?workspace_id=${workspace_id}`,
      providesTags: ['ApiKey'],
    }),
    createApiKey: builder.mutation<{ message: string; api_key: ApiKey }, {
      workspace_id: string;
      name: string;
      permissions?: string[];
      expires_in?: number;
    }>({
      query: (data) => ({
        url: '/advanced/api-keys',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ApiKey'],
    }),
    revokeApiKey: builder.mutation<{ message: string }, { id: string; workspace_id: string }>({
      query: ({ id, workspace_id }) => ({
        url: `/advanced/api-keys/${id}?workspace_id=${workspace_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ApiKey'],
    }),

    // ==================== Month 6: Cache ====================
    getCacheStats: builder.query<{ stats: CacheStats }, void>({
      query: () => '/advanced/cache/stats',
    }),
    clearCache: builder.mutation<{ message: string }, { workspace_id?: string }>({
      query: (data) => ({
        url: '/advanced/cache/clear',
        method: 'POST',
        body: data,
      }),
    }),

    // ==================== ML Service ====================
    getMLServiceStatus: builder.query<MLServiceHealth, void>({
      query: () => '/forecast/ml/status',
    }),
    runProphetForecast: builder.mutation<MLForecastResult, {
      workspace_id: string;
      periods?: number;
      options?: {
        includeHolidays?: boolean;
        seasonalityMode?: 'additive' | 'multiplicative';
        confidenceInterval?: number;
      };
    }>({
      query: (data) => ({
        url: '/forecast/ml/prophet',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Forecast'],
    }),
    runProphetTunedForecast: builder.mutation<MLForecastResult, {
      workspace_id: string;
      periods?: number;
      confidence_interval?: number;
    }>({
      query: (data) => ({
        url: '/forecast/ml/prophet-tuned',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Forecast'],
    }),
    runSarimaxForecast: builder.mutation<MLForecastResult, {
      workspace_id: string;
      periods?: number;
      confidence_interval?: number;
    }>({
      query: (data) => ({
        url: '/forecast/ml/sarimax',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Forecast'],
    }),
    runLightGBMForecast: builder.mutation<MLForecastResult, {
      workspace_id: string;
      periods?: number;
      confidence_interval?: number;
    }>({
      query: (data) => ({
        url: '/forecast/ml/lightgbm',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Forecast'],
    }),
    runMLEnsembleForecast: builder.mutation<MLForecastResult, {
      workspace_id: string;
      periods?: number;
      options?: {
        includeHolidays?: boolean;
        seasonalityMode?: 'additive' | 'multiplicative';
        confidenceInterval?: number;
      };
    }>({
      query: (data) => ({
        url: '/forecast/ml/ensemble',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Forecast'],
    }),
    compareMLModels: builder.mutation<MLModelComparisonResult, {
      workspace_id: string;
      periods?: number;
    }>({
      query: (data) => ({
        url: '/forecast/ml/compare',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  // Auth
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetCurrentUserQuery,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  // Workspaces
  useGetWorkspacesQuery,
  useGetWorkspaceQuery,
  // Data
  useImportCSVMutation,
  useGetPLSummaryQuery,
  useGetAccountsQuery,
  useGetDashboardKPIsQuery,
  useGetHistoricalRowsQuery,
  // Forecasting
  useGetScenariosQuery,
  useCreateScenarioMutation,
  useAddDriverMutation,
  useRunForecastMutation,
  useGetForecastResultsQuery,
  // Advanced Forecasting (Month 2)
  useRunAdvancedForecastMutation,
  useGetEDAQuery,
  useValidateModelsMutation,
  useAnalyzeScenariosMutation,
  // Reports (Month 3)
  useGeneratePDFReportQuery,
  useLazyGeneratePDFReportQuery,
  // Integrations (Month 3)
  useGetIntegrationProvidersQuery,
  useGetIntegrationStatusQuery,
  useStartOAuthFlowQuery,
  useLazyStartOAuthFlowQuery,
  useSyncIntegrationMutation,
  // Formulas (Month 4)
  useValidateFormulaMutation,
  useEvaluateFormulaMutation,
  useGetExampleFormulasQuery,
  useCreateCustomDriverMutation,
  // Comments (Month 4)
  useGetCommentsQuery,
  useCreateCommentMutation,
  // AI (Month 5)
  useGetAIInsightsQuery,
  useLazyGetAIInsightsQuery,
  useAskAIMutation,
  // Variance Analysis (Month 5)
  useGetVarianceAnalysisMutation,
  useGetPriceVolumeDecompositionMutation,
  // Groups (Month 6)
  useGetGroupsQuery,
  useCreateGroupMutation,
  useGetConsolidatedPLQuery,
  useLazyGetConsolidatedPLQuery,
  useAddWorkspaceToGroupMutation,
  // Audit (Month 6)
  useGetAuditLogsQuery,
  useGetActivitySummaryQuery,
  // API Keys (Month 6)
  useGetApiKeysQuery,
  useCreateApiKeyMutation,
  useRevokeApiKeyMutation,
  // Cache (Month 6)
  useGetCacheStatsQuery,
  useClearCacheMutation,
  // ML Service
  useGetMLServiceStatusQuery,
  useRunProphetForecastMutation,
  useRunProphetTunedForecastMutation,
  useRunSarimaxForecastMutation,
  useRunLightGBMForecastMutation,
  useRunMLEnsembleForecastMutation,
  useCompareMLModelsMutation,
} = api;
