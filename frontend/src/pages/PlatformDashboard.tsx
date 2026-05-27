import { BarList, formatMoney } from "../components/BarList";
import { DashboardHeader } from "../components/DashboardHeader";
import { DataTable } from "../components/DataTable";
import { MetricCard } from "../components/MetricCard";
import { api } from "../services/api";
import type { CostRow } from "../services/types";
import { useAsync } from "../hooks/useAsync";

export function PlatformDashboard() {
  const costs = useAsync(() => api.platformCosts(), []);
  const compliance = useAsync(() => api.taggingCompliance(), []);
  if (!costs.data || !compliance.data) return <main className="content">Loading platform dashboard...</main>;
  const summary = costs.data.summary;

  return (
    <main className="content">
      <DashboardHeader title="Platform Cost Control" subtitle="Allocated, shared, unallocated, and governance posture" />
      <section className="metric-grid">
        <MetricCard label="Total Platform Spend" value={formatMoney(summary.month_to_date_spend)} />
        <MetricCard label="Allocated Cost" value={formatMoney(summary.allocated_cost)} tone="good" />
        <MetricCard label="Unallocated Cost" value={formatMoney(summary.unallocated_cost)} tone={summary.unallocated_cost > 0 ? "warn" : "good"} />
        <MetricCard label="Tagging Score" value={`${compliance.data.score}%`} tone={compliance.data.score < 90 ? "warn" : "good"} />
      </section>
      <section className="dashboard-grid">
        <BarList title="Spend by EKS Cluster" items={summary.breakdowns.cluster} labelKey="cluster" />
        <BarList title="Spend by Product Tenant" items={summary.breakdowns.tenant} labelKey="tenant" />
        <BarList title="Spend by Account" items={summary.breakdowns.account} labelKey="account" />
      </section>
      <DataTable<CostRow>
        title="Unallocated Cost"
        rows={costs.data.rows.filter((row) => row.unallocated_cost > 0)}
        columns={[
          { key: "date", label: "Date" },
          { key: "aws_account_id", label: "Account" },
          { key: "service", label: "Service" },
          { key: "unallocated_cost", label: "Unallocated", money: true },
        ]}
      />
    </main>
  );
}
