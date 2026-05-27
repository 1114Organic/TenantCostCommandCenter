import { BarList, formatMoney } from "../components/BarList";
import { DashboardHeader } from "../components/DashboardHeader";
import { DataTable } from "../components/DataTable";
import { MetricCard } from "../components/MetricCard";
import { TrendChart } from "../components/TrendChart";
import { api } from "../services/api";
import type { CostRow, Tenant } from "../services/types";
import { useAsync } from "../hooks/useAsync";

export function TenantDashboard({ tenant }: { tenant: Tenant }) {
  const { data } = useAsync(() => api.tenantCosts(tenant.tenant_id), [tenant.tenant_id]);
  if (!data) return <main className="content">Loading tenant dashboard...</main>;
  const summary = data.summary;

  return (
    <main className="content">
      <DashboardHeader title={tenant.tenant_name} subtitle={`${tenant.product_line} / ${tenant.application}`} onExport={() => window.open(`/api/exports/tenant/${tenant.tenant_id}.csv`)} />
      <section className="metric-grid">
        <MetricCard label="Month-to-date" value={formatMoney(summary.month_to_date_spend)} detail="All allocated components" />
        <MetricCard label="Forecast" value={formatMoney(summary.forecast_month_end)} detail="Projected month end" tone={summary.budget_remaining && summary.budget_remaining < 0 ? "danger" : "neutral"} />
        <MetricCard label="Budget Remaining" value={formatMoney(summary.budget_remaining ?? 0)} detail={`${summary.allocation_coverage_percent}% allocated`} tone={(summary.budget_remaining ?? 0) < 0 ? "danger" : "good"} />
        <MetricCard label="Shared Platform" value={formatMoney(summary.allocated_shared_cost)} detail="Allocated shared costs" />
      </section>
      <section className="dashboard-grid">
        <TrendChart points={summary.daily_trend} />
        <BarList title="Spend by AWS Service" items={summary.breakdowns.service} labelKey="service" />
        <BarList title="EKS Namespaces" items={summary.breakdowns.namespace} labelKey="namespace" />
        <BarList title="AWS Accounts" items={summary.breakdowns.account} labelKey="account" />
      </section>
      <DataTable<CostRow>
        title="Cost Ledger"
        rows={data.rows}
        columns={[
          { key: "date", label: "Date" },
          { key: "service", label: "Service" },
          { key: "namespace", label: "Namespace" },
          { key: "eks_pod_cost", label: "EKS", money: true },
          { key: "direct_service_cost", label: "Direct", money: true },
          { key: "allocated_shared_cost", label: "Shared", money: true },
          { key: "total_cost", label: "Total", money: true },
        ]}
      />
    </main>
  );
}
