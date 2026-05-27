from collections import defaultdict
from datetime import date
from math import ceil

from fastapi import HTTPException

from src.models.domain import Budget, BudgetStatus, DailyTenantCost, DashboardSummary, Tenant
from src.repositories.mock_repository import MockRepository


def _in_range(row: DailyTenantCost, start_date: str | None, end_date: str | None) -> bool:
    if start_date and row.date < start_date:
        return False
    if end_date and row.date > end_date:
        return False
    return True


def _round(value: float) -> float:
    return round(value, 2)


class CostService:
    def __init__(self, repository: MockRepository) -> None:
        self.repository = repository

    def list_tenants(self) -> list[Tenant]:
        return self.repository.tenants()

    def get_tenant(self, tenant_id: str) -> Tenant:
        for tenant in self.repository.tenants():
            if tenant.tenant_id == tenant_id:
                return tenant
        raise HTTPException(status_code=404, detail="Tenant not found")

    def tenant_costs(
        self,
        tenant_id: str,
        start_date: str | None = None,
        end_date: str | None = None,
    ) -> list[DailyTenantCost]:
        return [
            row
            for row in self.repository.costs()
            if row.tenant_id == tenant_id and _in_range(row, start_date, end_date)
        ]

    def product_line_costs(
        self,
        product_line: str,
        start_date: str | None = None,
        end_date: str | None = None,
    ) -> list[DailyTenantCost]:
        return [
            row
            for row in self.repository.costs()
            if row.product_line == product_line and _in_range(row, start_date, end_date)
        ]

    def platform_costs(self, start_date: str | None = None, end_date: str | None = None) -> list[DailyTenantCost]:
        return [row for row in self.repository.costs() if _in_range(row, start_date, end_date)]

    def summarize(self, scope: str, rows: list[DailyTenantCost], budget: Budget | None = None) -> DashboardSummary:
        eks = sum(row.eks_pod_cost for row in rows)
        direct = sum(row.direct_service_cost for row in rows)
        shared = sum(row.allocated_shared_cost for row in rows)
        unallocated = sum(row.unallocated_cost for row in rows)
        total = sum(row.total_cost for row in rows)
        allocated = total - unallocated
        coverage = 0 if total == 0 else allocated / total * 100

        daily = defaultdict(float)
        by_service = defaultdict(float)
        by_account = defaultdict(float)
        by_environment = defaultdict(float)
        by_cluster = defaultdict(float)
        by_namespace = defaultdict(float)
        by_tenant = defaultdict(float)
        for row in rows:
            daily[row.date] += row.total_cost
            by_service[row.service] += row.total_cost
            by_account[row.aws_account_id] += row.total_cost
            by_environment[row.environment] += row.total_cost
            if row.eks_cluster:
                by_cluster[row.eks_cluster] += row.total_cost
            if row.namespace:
                by_namespace[row.namespace] += row.total_cost
            by_tenant[row.tenant_name] += row.total_cost

        forecast = self.forecast_month_end(rows)
        budget_remaining = None if budget is None else budget.amount - total
        return DashboardSummary(
            scope=scope,
            month_to_date_spend=_round(total),
            forecast_month_end=_round(forecast),
            budget_amount=None if budget is None else budget.amount,
            budget_remaining=None if budget_remaining is None else _round(budget_remaining),
            allocated_cost=_round(allocated),
            eks_pod_cost=_round(eks),
            direct_service_cost=_round(direct),
            allocated_shared_cost=_round(shared),
            unallocated_cost=_round(unallocated),
            allocation_coverage_percent=_round(coverage),
            daily_trend=self._series(daily, "date"),
            breakdowns={
                "service": self._series(by_service, "service"),
                "account": self._series(by_account, "account"),
                "environment": self._series(by_environment, "environment"),
                "cluster": self._series(by_cluster, "cluster"),
                "namespace": self._series(by_namespace, "namespace"),
                "tenant": self._series(by_tenant, "tenant"),
            },
        )

    def forecast_month_end(self, rows: list[DailyTenantCost], days_in_month: int = 31) -> float:
        if not rows:
            return 0
        active_days = {row.date for row in rows}
        elapsed = max(len(active_days), 1)
        total = sum(row.total_cost for row in rows)
        return total / elapsed * days_in_month

    def budget_statuses(self, product_line: str | None = None) -> list[BudgetStatus]:
        statuses = []
        for budget in self.repository.budgets():
            if product_line and budget.product_line != product_line:
                continue
            rows = self.tenant_costs(budget.tenant_id)
            spend = sum(row.total_cost for row in rows)
            forecast = self.forecast_month_end(rows)
            percent = 0 if budget.amount == 0 else spend / budget.amount * 100
            risk = "ok"
            if forecast > budget.amount:
                risk = "over_budget"
            elif forecast > budget.amount * 0.8:
                risk = "watch"
            statuses.append(
                BudgetStatus(
                    tenant_id=budget.tenant_id,
                    product_line=budget.product_line,
                    budget_amount=budget.amount,
                    month_to_date_spend=_round(spend),
                    percent_consumed=_round(percent),
                    forecast_month_end=_round(forecast),
                    variance_forecast=_round(budget.amount - forecast),
                    risk=risk,
                )
            )
        return statuses

    def get_budget(self, tenant_id: str) -> Budget:
        for budget in self.repository.budgets():
            if budget.tenant_id == tenant_id:
                return budget
        raise HTTPException(status_code=404, detail="Budget not found")

    def executive_summary(self, month: str | None = None) -> DashboardSummary:
        rows = self.platform_costs()
        if month:
            rows = [row for row in rows if row.date.startswith(month)]
        return self.summarize("executive", rows)

    def allocate_shared_cost_by_tenant_count(self, shared_cost: float, tenant_ids: list[str]) -> dict[str, float]:
        if not tenant_ids:
            return {}
        share = shared_cost / len(tenant_ids)
        return {tenant_id: _round(share) for tenant_id in tenant_ids}

    def allocate_shared_cost_proportionally(self, shared_cost: float, tenant_costs: dict[str, float]) -> dict[str, float]:
        total = sum(tenant_costs.values())
        if total <= 0:
            return self.allocate_shared_cost_by_tenant_count(shared_cost, list(tenant_costs.keys()))
        return {tenant_id: _round(shared_cost * (cost / total)) for tenant_id, cost in tenant_costs.items()}

    def _series(self, values: dict[str, float], label: str) -> list[dict]:
        return [{label: key, "cost": _round(value)} for key, value in sorted(values.items())]
