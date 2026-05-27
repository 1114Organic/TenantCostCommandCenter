export type Tenant = {
  tenant_id: string;
  tenant_name: string;
  product_line: string;
  application: string;
  owner_name: string;
  owner_email: string;
  notification_channel: string;
  cost_center: string;
  environments: string[];
  aws_accounts: string[];
  eks_clusters: string[];
  namespaces: string[];
  status: string;
};

export type CostRow = {
  date: string;
  tenant_id: string;
  tenant_name: string;
  product_line: string;
  environment: string;
  aws_account_id: string;
  eks_cluster: string;
  namespace: string;
  service: string;
  workload: string;
  pod: string;
  eks_pod_cost: number;
  direct_service_cost: number;
  allocated_shared_cost: number;
  unallocated_cost: number;
  total_cost: number;
  currency: string;
};

export type DashboardSummary = {
  scope: string;
  month_to_date_spend: number;
  forecast_month_end: number;
  budget_amount?: number;
  budget_remaining?: number;
  allocated_cost: number;
  eks_pod_cost: number;
  direct_service_cost: number;
  allocated_shared_cost: number;
  unallocated_cost: number;
  allocation_coverage_percent: number;
  daily_trend: Array<{ date: string; cost: number }>;
  breakdowns: Record<string, Array<Record<string, string | number>>>;
};

export type CostResponse = {
  summary: DashboardSummary;
  rows: CostRow[];
};

export type BudgetStatus = {
  tenant_id: string;
  product_line: string;
  budget_amount: number;
  month_to_date_spend: number;
  percent_consumed: number;
  forecast_month_end: number;
  variance_forecast: number;
  risk: "ok" | "watch" | "over_budget";
};

export type Anomaly = {
  anomaly_id: string;
  tenant_id: string;
  product_line: string;
  start_date: string;
  end_date: string;
  service: string;
  aws_account_id: string;
  estimated_impact: number;
  root_cause: string;
  status: string;
};

export type Recommendation = {
  recommendation_id: string;
  tenant_id: string;
  product_line: string;
  aws_account_id: string;
  resource_id: string;
  service: string;
  finding: string;
  recommendation: string;
  estimated_monthly_savings: number;
  status: string;
};

export type AllocationRule = {
  rule_id: string;
  name: string;
  description: string;
  cost_pool: string;
  allocation_method: string;
  effective_date: string;
  created_by: string;
  created_at: string;
};
