import { DataTable } from "../components/DataTable";
import { DashboardHeader } from "../components/DashboardHeader";
import { MetricCard } from "../components/MetricCard";
import { formatMoney } from "../components/BarList";
import { api } from "../services/api";
import type { AllocationRule, Anomaly, BudgetStatus, Recommendation } from "../services/types";
import { useAsync } from "../hooks/useAsync";

export function AnomaliesPage() {
  const { data } = useAsync(() => api.anomalies(), []);
  if (!data) return <main className="content">Loading anomalies...</main>;
  const impact = data.reduce((total, item) => total + item.estimated_impact, 0);
  return (
    <main className="content">
      <DashboardHeader title="Anomalies" subtitle="Active and historical cost anomaly workflow" />
      <section className="metric-grid two">
        <MetricCard label="Open Anomalies" value={String(data.filter((item) => item.status !== "resolved").length)} tone="warn" />
        <MetricCard label="Estimated Impact" value={formatMoney(impact)} />
      </section>
      <DataTable<Anomaly>
        title="Anomaly Queue"
        rows={data}
        columns={[
          { key: "anomaly_id", label: "ID" },
          { key: "tenant_id", label: "Tenant" },
          { key: "service", label: "Service" },
          { key: "estimated_impact", label: "Impact", money: true },
          { key: "root_cause", label: "Root Cause" },
          { key: "status", label: "Status" },
        ]}
      />
    </main>
  );
}

export function RecommendationsPage() {
  const { data } = useAsync(() => api.recommendations(), []);
  if (!data) return <main className="content">Loading recommendations...</main>;
  const savings = data.reduce((total, item) => total + item.estimated_monthly_savings, 0);
  return (
    <main className="content">
      <DashboardHeader title="Optimization Recommendations" subtitle="Compute Optimizer and FinOps savings actions" />
      <section className="metric-grid two">
        <MetricCard label="Recommendations" value={String(data.length)} />
        <MetricCard label="Monthly Savings" value={formatMoney(savings)} tone="good" />
      </section>
      <DataTable<Recommendation>
        title="Recommendation Backlog"
        rows={data}
        columns={[
          { key: "tenant_id", label: "Tenant" },
          { key: "service", label: "Service" },
          { key: "resource_id", label: "Resource" },
          { key: "finding", label: "Finding" },
          { key: "estimated_monthly_savings", label: "Savings", money: true },
          { key: "status", label: "Status" },
        ]}
      />
    </main>
  );
}

export function BudgetsPage() {
  const { data } = useAsync(() => api.budgetStatuses(), []);
  if (!data) return <main className="content">Loading budgets...</main>;
  return (
    <main className="content">
      <DashboardHeader title="Budget Monitoring" subtitle="Budget burn, forecast, variance, and risk by tenant" />
      <DataTable<BudgetStatus>
        title="Budget Status"
        rows={data}
        columns={[
          { key: "tenant_id", label: "Tenant" },
          { key: "product_line", label: "Product Line" },
          { key: "budget_amount", label: "Budget", money: true },
          { key: "month_to_date_spend", label: "MTD", money: true },
          { key: "forecast_month_end", label: "Forecast", money: true },
          { key: "variance_forecast", label: "Variance", money: true },
          { key: "risk", label: "Risk" },
        ]}
      />
    </main>
  );
}

export function TaggingCompliancePage() {
  const { data } = useAsync(() => api.taggingCompliance(), []);
  if (!data) return <main className="content">Loading compliance...</main>;
  return (
    <main className="content">
      <DashboardHeader title="Tagging Compliance" subtitle="Missing AWS tags, EKS labels, and remediation guidance" />
      <section className="metric-grid two">
        <MetricCard label="Compliance Score" value={`${data.score}%`} tone={data.score < 90 ? "warn" : "good"} />
        <MetricCard label="Open Findings" value={String(data.open_findings)} tone="warn" />
      </section>
      <DataTable<Record<string, unknown>>
        title="Findings"
        rows={data.findings}
        columns={[
          { key: "resource_id", label: "Resource" },
          { key: "service", label: "Service" },
          { key: "missing_keys", label: "Missing Keys" },
          { key: "estimated_daily_cost", label: "Daily Cost", money: true },
          { key: "remediation", label: "Remediation" },
          { key: "status", label: "Status" },
        ]}
      />
    </main>
  );
}

export function AdminAllocationRulesPage() {
  const rules = useAsync(() => api.allocationRules(), []);
  const refresh = useAsync(() => api.refreshStatus(), []);
  if (!rules.data || !refresh.data) return <main className="content">Loading admin...</main>;
  return (
    <main className="content">
      <DashboardHeader title="Allocation Rules" subtitle="Shared cost pool methods, effective dates, and refresh health" />
      <section className="metric-grid two">
        <MetricCard label="Refresh Status" value={refresh.data.status} detail={refresh.data.last_successful_refresh_at} tone="good" />
        <MetricCard label="Rules" value={String(rules.data.length)} />
      </section>
      <DataTable<AllocationRule>
        title="Shared Cost Allocation Rules"
        rows={rules.data}
        columns={[
          { key: "name", label: "Name" },
          { key: "cost_pool", label: "Pool" },
          { key: "allocation_method", label: "Method" },
          { key: "effective_date", label: "Effective" },
          { key: "created_by", label: "Owner" },
        ]}
      />
    </main>
  );
}
