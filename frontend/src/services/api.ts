import { mock, summarize } from "./mockData";
import type { AllocationRule, Anomaly, BudgetStatus, CostResponse, CostRow, DashboardSummary, Recommendation, Tenant } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

async function getJson<T>(path: string, fallback: () => T): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${path}`, { headers: { "X-User-Role": "finops_admin" } });
    if (!response.ok) throw new Error(response.statusText);
    return (await response.json()) as T;
  } catch {
    return fallback();
  }
}

export const api = {
  tenants: () => getJson<Tenant[]>("/api/tenants", () => mock.tenants as Tenant[]),
  tenantCosts: (tenantId: string) =>
    getJson<CostResponse>(`/api/tenants/${tenantId}/costs`, () => {
      const rows = (mock.costs as CostRow[]).filter((row) => row.tenant_id === tenantId);
      const budget = (mock.budgets as Array<{ tenant_id: string; amount: number }>).find((item) => item.tenant_id === tenantId);
      return { summary: summarize(tenantId, rows, budget?.amount), rows };
    }),
  productLineCosts: (productLine: string) =>
    getJson<CostResponse>(`/api/product-lines/${productLine}/costs`, () => {
      const rows = (mock.costs as CostRow[]).filter((row) => row.product_line === productLine);
      return { summary: summarize(productLine, rows), rows };
    }),
  platformCosts: () =>
    getJson<CostResponse>("/api/platform/costs", () => ({ summary: summarize("platform", mock.costs as CostRow[]), rows: mock.costs as CostRow[] })),
  budgetStatuses: () =>
    getJson<BudgetStatus[]>("/api/budgets/status", () =>
      (mock.budgets as Array<{ tenant_id: string; product_line: string; amount: number }>).map((budget) => {
        const rows = (mock.costs as CostRow[]).filter((row) => row.tenant_id === budget.tenant_id);
        const total = rows.reduce((sum, row) => sum + row.total_cost, 0);
        const forecast = (total / (new Set(rows.map((row) => row.date)).size || 1)) * 31;
        return {
          tenant_id: budget.tenant_id,
          product_line: budget.product_line,
          budget_amount: budget.amount,
          month_to_date_spend: total,
          percent_consumed: (total / budget.amount) * 100,
          forecast_month_end: forecast,
          variance_forecast: budget.amount - forecast,
          risk: (forecast > budget.amount ? "over_budget" : forecast > budget.amount * 0.8 ? "watch" : "ok") as BudgetStatus["risk"],
        };
      }),
    ),
  anomalies: () => getJson<Anomaly[]>("/api/anomalies", () => mock.anomalies as Anomaly[]),
  recommendations: () => getJson<Recommendation[]>("/api/recommendations", () => mock.recommendations as Recommendation[]),
  allocationRules: () => getJson<AllocationRule[]>("/api/admin/allocation-rules", () => mock.allocationRules as AllocationRule[]),
  taggingCompliance: () =>
    getJson<{ score: number; open_findings: number; findings: Array<Record<string, unknown>> }>("/api/admin/tagging-compliance", () => ({
      score: 90,
      open_findings: 2,
      findings: mock.tagging as Array<Record<string, unknown>>,
    })),
  refreshStatus: () =>
    getJson<{ status: string; last_successful_refresh_at: string; message: string }>("/api/admin/data-refresh/status", () => mock.refresh),
  executiveSummary: () => getJson<DashboardSummary>("/api/executive/summary?month=2026-05", () => summarize("executive", mock.costs as CostRow[])),
};
