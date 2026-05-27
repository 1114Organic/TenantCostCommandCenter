import allocationRules from "../../../sample-data/allocation-rules.json";
import anomalies from "../../../sample-data/anomalies.json";
import budgets from "../../../sample-data/budgets.json";
import costs from "../../../sample-data/daily-costs.json";
import recommendations from "../../../sample-data/recommendations.json";
import tagging from "../../../sample-data/tagging-compliance.json";
import tenants from "../../../sample-data/tenants.json";
import refresh from "../../../sample-data/data-refresh-status.json";

import type { CostRow, DashboardSummary } from "./types";

const money = (value: number) => Math.round(value * 100) / 100;

export function summarize(scope: string, rows: CostRow[], budgetAmount?: number): DashboardSummary {
  const sum = (key: keyof CostRow) => money(rows.reduce((total, row) => total + Number(row[key] || 0), 0));
  const total = sum("total_cost");
  const unallocated = sum("unallocated_cost");
  const activeDays = new Set(rows.map((row) => row.date)).size || 1;
  const group = (key: keyof CostRow, label: string) => {
    const values = new Map<string, number>();
    rows.forEach((row) => {
      const name = String(row[key] || "");
      if (!name) return;
      values.set(name, (values.get(name) ?? 0) + row.total_cost);
    });
    return Array.from(values.entries()).map(([name, cost]) => ({ [label]: name, cost: money(cost) }));
  };

  return {
    scope,
    month_to_date_spend: total,
    forecast_month_end: money((total / activeDays) * 31),
    budget_amount: budgetAmount,
    budget_remaining: budgetAmount === undefined ? undefined : money(budgetAmount - total),
    allocated_cost: money(total - unallocated),
    eks_pod_cost: sum("eks_pod_cost"),
    direct_service_cost: sum("direct_service_cost"),
    allocated_shared_cost: sum("allocated_shared_cost"),
    unallocated_cost: unallocated,
    allocation_coverage_percent: total === 0 ? 0 : money(((total - unallocated) / total) * 100),
    daily_trend: group("date", "date") as Array<{ date: string; cost: number }>,
    breakdowns: {
      service: group("service", "service"),
      tenant: group("tenant_name", "tenant"),
      account: group("aws_account_id", "account"),
      environment: group("environment", "environment"),
      cluster: group("eks_cluster", "cluster"),
      namespace: group("namespace", "namespace"),
    },
  };
}

export const mock = {
  tenants,
  costs,
  budgets,
  anomalies,
  recommendations,
  allocationRules,
  tagging,
  refresh,
};
