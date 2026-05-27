import { BarList, formatMoney } from "../components/BarList";
import { DashboardHeader } from "../components/DashboardHeader";
import { DataTable } from "../components/DataTable";
import { MetricCard } from "../components/MetricCard";
import { api } from "../services/api";
import type { BudgetStatus, CostRow } from "../services/types";
import { useAsync } from "../hooks/useAsync";

export function ProductLineDashboard({ productLine }: { productLine: string }) {
  const costs = useAsync(() => api.productLineCosts(productLine), [productLine]);
  const budgets = useAsync(() => api.budgetStatuses(), []);
  if (!costs.data || !budgets.data) return <main className="content">Loading product-line dashboard...</main>;
  const summary = costs.data.summary;
  const productBudgets = budgets.data.filter((item) => item.product_line === productLine);

  return (
    <main className="content">
      <DashboardHeader title={`${productLine} Rollup`} subtitle="Tenant spend, budget risk, anomalies, and service drivers" />
      <section className="metric-grid">
        <MetricCard label="Product-line Spend" value={formatMoney(summary.month_to_date_spend)} />
        <MetricCard label="Forecast" value={formatMoney(summary.forecast_month_end)} />
        <MetricCard label="Tenant Count" value={String(new Set(costs.data.rows.map((row) => row.tenant_id)).size)} />
        <MetricCard label="Allocation Coverage" value={`${summary.allocation_coverage_percent}%`} tone="good" />
      </section>
      <section className="dashboard-grid">
        <BarList title="Spend by Tenant" items={summary.breakdowns.tenant} labelKey="tenant" />
        <BarList title="Top Services" items={summary.breakdowns.service} labelKey="service" />
      </section>
      <DataTable<BudgetStatus>
        title="Budget Status by Tenant"
        rows={productBudgets}
        columns={[
          { key: "tenant_id", label: "Tenant" },
          { key: "budget_amount", label: "Budget", money: true },
          { key: "month_to_date_spend", label: "MTD", money: true },
          { key: "forecast_month_end", label: "Forecast", money: true },
          { key: "risk", label: "Risk" },
        ]}
      />
      <DataTable<CostRow>
        title="Product-Line Cost Drivers"
        rows={costs.data.rows}
        columns={[
          { key: "tenant_name", label: "Tenant" },
          { key: "service", label: "Service" },
          { key: "environment", label: "Environment" },
          { key: "total_cost", label: "Total", money: true },
        ]}
      />
    </main>
  );
}
