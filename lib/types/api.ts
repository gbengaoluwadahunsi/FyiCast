// lib/types/api.ts

// ==================== User & Auth ====================

export interface User {
  id: string;
  email: string;
  full_name: string;
  email_verified: boolean;
  email_verified_at?: string;
  created_at: string;
}

// Note: Tokens are now stored in HTTP-only cookies, not returned in response body
export interface AuthResponse {
  user: User;
  workspace_id: string;
  message?: string;
}

// ==================== Workspace ====================

export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER';

export interface Workspace {
  id: string;
  name: string;
  currency: string;
  fiscal_year_start: number;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  email: string;
  full_name: string;
  role: WorkspaceRole;
  created_at: string;
}

export interface WorkspaceWithRole extends Workspace {
  role: WorkspaceRole;
}

// ==================== Financial Data ====================

export type AccountCategory = 'REVENUE' | 'COGS' | 'OPEX' | 'PERSONNEL';

export interface Account {
  id: string;
  workspace_id: string;
  name: string;
  category: AccountCategory;
  code?: string;
  created_at: string;
  updated_at: string;
}

export interface HistoricalDataPoint {
  period: string; // YYYY-MM-DD
  revenue: number; // in cents
  cogs: number;
  opex: number;
  personnel: number;
  total_expenses: number;
  net_income: number;
}

export interface PLSummary {
  workspace_id: string;
  summary: HistoricalDataPoint[];
  count: number;
}

// ==================== Forecasting ====================

export type DriverType = 'GROWTH_RATE' | 'FIXED_AMOUNT' | 'PERCENT_OF_REVENUE';

export interface Driver {
  id: string;
  scenario_id: string;
  target_category: AccountCategory;
  type: DriverType;
  value: DriverValue;
  created_at: string;
  updated_at: string;
}

export interface DriverValue {
  start_month?: string;
  rate?: number;
  amount?: number;
  percent?: number;
}

export interface Scenario {
  id: string;
  workspace_id: string;
  name: string;
  description?: string;
  is_base_case: boolean;
  parent_scenario_id?: string;
  created_at: string;
  updated_at: string;
  driver_count?: number;
}

export interface ForecastDataPoint {
  period: string; // YYYY-MM-DD
  revenue: number; // in cents
  cogs: number;
  opex: number;
  personnel: number;
  total_expenses: number;
  net_income: number;
  gross_margin: number; // percentage
}

export interface ForecastResult {
  scenario: {
    id: string;
    name: string;
  };
  historical: HistoricalDataPoint[];
  forecast: ForecastDataPoint[];
  runway: number | null; // months
  metadata: {
    months_projected: number;
    drivers_applied: number;
    generated_at: string;
  };
}

// ==================== API Responses ====================

export interface ApiError {
  error: string;
  details?: any[];
}

export interface SuccessResponse {
  message: string;
}

// ==================== Utility Functions ====================

export const formatCurrency = (cents: number, currency: string = 'USD'): string => {
  const amount = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const toCents = (dollars: number): number => {
  return Math.round(dollars * 100);
};

export const toDollars = (cents: number): number => {
  return cents / 100;
};

export const formatPercent = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

// ==================== Advanced Forecasting ====================

export interface ModelForecast {
  name: string;
  forecast: number[];
  dates: string[];
}

export interface AdvancedForecastResult {
  workspace_id: string;
  forecast_type: string;
  horizon: number;
  models_used: string[];
  revenue_forecast: Record<string, ModelForecast>;
  expense_forecast: Record<string, ModelForecast> | null;
  validation: ValidationMetric[];
  best_model: string;
  scenarios: ScenarioData;
  historical: {
    revenue: { date: string; value: number }[];
    expense: { date: string; value: number }[];
  };
  metadata: {
    generated_at: string;
    months_projected: number;
  };
}

export interface ValidationMetric {
  model: string;
  mae: number;
  mape: number;
  rmse: number;
}

export interface ValidationResult {
  workspace_id: string;
  test_size: number;
  validation: ValidationMetric[];
  best_model: string;
  recommendation: string;
}

export interface SeasonalityData {
  month: string;
  monthIndex: number;
  avgRevenue: number;
  avgExpense: number;
  seasonalIndex: number;
}

export interface AnomalyData {
  period: string;
  category: string;
  value: number;
  z_score: number;
  type: 'High' | 'Low';
  severity: 'Critical' | 'Warning';
}

export interface StatsSummary {
  mean: number;
  median: number;
  std: number;
  min: number;
  max: number;
  total: number;
  count: number;
  growth_rate: number;
}

export interface Insight {
  type: 'positive' | 'negative' | 'warning' | 'info';
  category: string;
  message: string;
}

export interface EDAResult {
  workspace_id: string;
  period_count: number;
  date_range: { start: string; end: string };
  trends: { period: string; revenue: number; expense: number; net_income: number }[];
  seasonality: SeasonalityData[];
  growth: { period: string; revenue: number; growth_rate: number }[];
  anomalies: AnomalyData[];
  stats: Record<string, StatsSummary>;
  insights: Insight[];
}

export interface ScenarioItem {
  name: string;
  revenue: number[];
  expense: number[];
  net_income: number[];
  dates: string[];
  total_revenue: number;
  total_expense: number;
  total_net_income: number;
  description: string;
}

export interface ScenarioData {
  Base: ScenarioItem;
  Upside: ScenarioItem;
  Downside: ScenarioItem;
}

export interface ScenarioAnalysisResult {
  forecast_id?: string;
  scenarios: ScenarioData;
  comparison: { period: string; base_net: number; upside_net: number; downside_net: number }[];
  summary: {
    base_total: number;
    upside_total: number;
    downside_total: number;
    upside_delta: number;
    downside_delta: number;
  };
}

// ==================== Month 3: Integrations ====================

export type IntegrationProvider = 'xero' | 'quickbooks';

export interface IntegrationProviderInfo {
  id: string;
  name: string;
  scopes: string[];
}

export interface IntegrationStatus {
  provider: IntegrationProvider;
  connected: boolean;
  token_expires?: string;
  connected_at?: string;
}

export interface SyncResult {
  status: 'success' | 'failed' | 'partial';
  records_processed: number;
  duration_ms: number;
  error?: string;
  synced_at: string;
}

// ==================== Month 4: Formulas & Comments ====================

export interface FormulaValidation {
  valid: boolean;
  variables?: string[];
  error?: string;
}

export interface FormulaEvaluation {
  success: boolean;
  result?: number;
  error?: string;
}

export interface ExampleFormula {
  name: string;
  formula: string;
  description: string;
  variables: Record<string, {
    type: string;
    description: string;
    default: number;
  }>;
}

export interface CustomDriver {
  id: string;
  workspace_id: string;
  name: string;
  formula: string;
  variables: Record<string, any>;
  description?: string;
  created_by: string;
  created_at: string;
}

export interface Comment {
  id: string;
  workspace_id: string;
  user_id: string;
  entity_type: string;
  entity_id?: string;
  period?: string;
  text: string;
  resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  author_name?: string;
  author_email?: string;
}

export interface Invitation {
  id: string;
  workspace_id: string;
  email: string;
  role: WorkspaceRole;
  token: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  expires_at: string;
  created_at: string;
}

// ==================== Month 5: AI & Variance ====================

export interface AIInsights {
  insights: string;
  model: string;
  tokens_used: number;
  error?: string;
}

export interface AIAnswer {
  answer: string;
  model: string;
  tokens_used: number;
}

export interface VarianceData {
  actual: number;
  forecast: number;
  variance: number;
  variance_percent: number;
  favorable: boolean;
}

export interface ExpenseVariance extends VarianceData {
  category: string;
  controllability: string;
  explanation: string;
}

export interface PriceVolumeDecomposition {
  total_variance: number;
  price_effect: {
    value: number;
    percent: number;
    actual_price: number;
    forecast_price: number;
    price_change: number;
    price_change_percent: number;
  };
  volume_effect: {
    value: number;
    percent: number;
    actual_volume: number;
    forecast_volume: number;
    volume_change: number;
    volume_change_percent: number;
  };
  mix_effect: {
    value: number;
    percent: number;
  };
}

export interface VarianceWaterfallItem {
  name: string;
  value: number;
  type: 'base' | 'positive' | 'negative' | 'total';
  start?: number;
  end?: number;
}

export interface VarianceReport {
  period?: string;
  revenue: VarianceData;
  cogs: ExpenseVariance;
  opex: ExpenseVariance;
  personnel: ExpenseVariance;
  net_income: VarianceData;
  waterfall: VarianceWaterfallItem[];
  insights: { type: string; message: string }[];
  generated_at: string;
}

// ==================== Month 6: Enterprise ====================

export interface Group {
  id: string;
  name: string;
  owner_id: string;
  currency: string;
  created_at: string;
  workspace_count?: number;
}

export interface GroupWorkspace {
  id: string;
  name: string;
  currency: string;
  added_at: string;
}

export interface ConsolidatedPL {
  group: Group;
  consolidated: {
    revenue: number;
    cogs: number;
    opex: number;
    personnel: number;
    total_expenses: number;
    net_income: number;
    gross_margin: number;
  };
  by_entity: {
    workspace_id: string;
    workspace_name: string;
    original_currency: string;
    revenue: number;
    cogs: number;
    opex: number;
    personnel: number;
    total_expenses: number;
    net_income: number;
  }[];
  currency: string;
  period?: { start?: string; end?: string };
  generated_at: string;
}

export interface AuditLog {
  id: string;
  workspace_id?: string;
  actor_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  old_value?: any;
  new_value?: any;
  metadata?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  actor_email?: string;
  actor_name?: string;
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface ActivitySummary {
  [date: string]: {
    total: number;
    actions: Record<string, number>;
  };
}

export interface ApiKey {
  id: string;
  workspace_id: string;
  name: string;
  key_prefix: string;
  permissions: string[];
  last_used_at?: string;
  expires_at?: string;
  created_at: string;
  revoked_at?: string;
  isExpired?: boolean;
  key?: string; // Only on creation
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  hitRate: string;
  memorySize: number;
  redisAvailable: boolean;
}

// ==================== Dashboard KPIs ====================

export interface DashboardKPIs {
  workspace_id: string;
  kpis: {
    total_revenue: number;
    revenue_growth: number;
    net_burn: number;
    burn_growth: number;
    cash_on_hand: number;
    runway: number | null;
  };
  current_period: string | null;
  data_points: number;
}

export interface HistoricalRow {
  period: string;
  revenue: number;
  cogs: number;
  operating: number;
}

// ==================== ML Forecasting (Prophet) ====================

export interface MLServiceHealth {
  status: string;
  version: string;
  models_available: string[];
  available: boolean;
  error?: string;
}

export interface MLForecastPoint {
  date: string;
  forecast: number;
  lower_bound: number;
  upper_bound: number;
}

export interface MLModelMetrics {
  mae: number;
  mape: number;
  rmse: number;
  coverage: number;
}

export interface MLForecastComponents {
  trend: number[];
  yearly: number[] | null;
}

export interface MLForecastResult {
  workspace_id: string;
  forecast_type: string;
  model: string;
  forecast: MLForecastPoint[];
  metrics: MLModelMetrics | null;
  components: MLForecastComponents | null;
  historical: { date: string; value: number }[];
  metadata: {
    generated_at: string;
    periods_projected: number;
    data_points: number;
  };
}

export interface MLModelComparisonResult {
  workspace_id: string;
  forecast_type: string;
  historical: { date: string; value: number }[];
  models: {
    prophet?: MLForecastResult;
    prophet_tuned?: MLForecastResult;
    sarimax?: MLForecastResult;
    lightgbm?: MLForecastResult;
  };
  best_model: string | null;
  recommendation: string;
  metadata: {
    generated_at: string;
    periods_projected: number;
    data_points: number;
  };
}


