import { BarList, formatMoney } from "../components/BarList";
import { DashboardHeader } from "../components/DashboardHeader";
import { MetricCard } from "../components/MetricCard";
import { TrendChart } from "../components/TrendChart";
import { api } from "../services/api";
import { useAsync } from "../hooks/useAsync";

export function ExecutiveDashboard() {
  const summary = useAsync(() => api.executiveSummary(), []);
  const recommendations = useAsync(() => api.recommendations(), []);
  if (!summary.data || !recommendations.data) return <main className="content">Loading executive dashboard...</main>;
  const savings = recommendations.data.reduce((total, item) => total + item.estimated_monthly_savings, 0);

  return (
    <main className="content">
      <DashboardHeader title="Cloud Spend Executive View" subtitle="Spend trend, forecast, allocation coverage, and savings opportunity" />
      <section className="metric-grid">
        <MetricCard label="Monthly Spend" value={formatMoney(summary.data.month_to_date_spend)} />
        <MetricCard label="Forecast" value={formatMoney(summary.data.forecast_month_end)} />
        <MetricCard label="Savings Opportunity" value={formatMoney(savings)} tone="good" />
        <MetricCard label="Allocation Coverage" value={`${summary.data.allocation_coverage_percent}%`} />
      </section>
      <section className="dashboard-grid">
        <TrendChart points={summary.data.daily_trend} />
        <BarList title="Spend by Tenant" items={summary.data.breakdowns.tenant} labelKey="tenant" />
        <BarList title="Spend by Service" items={summary.data.breakdowns.service} labelKey="service" />
      </section>
    </main>
  );
}
