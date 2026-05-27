from datetime import datetime
from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


class Tenant(BaseModel):
    tenant_id: str
    tenant_name: str
    product_line: str
    application: str
    owner_name: str
    owner_email: str
    notification_channel: str
    cost_center: str
    environments: list[str]
    aws_accounts: list[str]
    eks_clusters: list[str]
    namespaces: list[str]
    status: Literal["active", "inactive"]


class DailyTenantCost(BaseModel):
    date: str
    tenant_id: str
    tenant_name: str
    product_line: str
    environment: str
    aws_account_id: str
    eks_cluster: str = ""
    namespace: str = ""
    service: str
    workload: str = ""
    pod: str = ""
    eks_pod_cost: float = 0
    direct_service_cost: float = 0
    allocated_shared_cost: float = 0
    unallocated_cost: float = 0
    total_cost: float = 0
    currency: str = "USD"


class Budget(BaseModel):
    budget_id: str
    tenant_id: str
    product_line: str
    period: Literal["monthly"]
    amount: float
    currency: str
    thresholds: list[int]
    forecast_alert_enabled: bool
    owner_email: str


class WorkflowStatus(str, Enum):
    new = "new"
    acknowledged = "acknowledged"
    investigating = "investigating"
    resolved = "resolved"
    false_positive = "false_positive"


class Anomaly(BaseModel):
    anomaly_id: str
    tenant_id: str
    product_line: str
    start_date: str
    end_date: str
    service: str
    aws_account_id: str
    estimated_impact: float
    root_cause: str
    status: WorkflowStatus


class RecommendationStatus(str, Enum):
    new = "new"
    accepted = "accepted"
    deferred = "deferred"
    implemented = "implemented"
    dismissed = "dismissed"


class OptimizationRecommendation(BaseModel):
    recommendation_id: str
    tenant_id: str
    product_line: str
    aws_account_id: str
    resource_id: str
    service: str
    finding: str
    recommendation: str
    estimated_monthly_savings: float
    status: RecommendationStatus


class AllocationRule(BaseModel):
    rule_id: str
    name: str
    description: str
    cost_pool: str
    allocation_method: Literal[
        "proportional_cost",
        "cpu_request",
        "memory_request",
        "tenant_count",
        "custom_percentage",
    ]
    effective_date: str
    created_by: str
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class TaggingComplianceFinding(BaseModel):
    finding_id: str
    date: str
    resource_id: str
    aws_account_id: str
    service: str
    resource_type: str
    missing_keys: list[str]
    estimated_daily_cost: float
    remediation: str
    status: str


class RefreshStatus(BaseModel):
    last_successful_refresh_at: str | None
    last_attempted_refresh_at: str | None
    status: str
    source: str
    records_processed: int
    message: str


class StatusUpdate(BaseModel):
    status: str


class BudgetStatus(BaseModel):
    tenant_id: str
    product_line: str
    budget_amount: float
    month_to_date_spend: float
    percent_consumed: float
    forecast_month_end: float
    variance_forecast: float
    risk: Literal["ok", "watch", "over_budget"]


class DashboardSummary(BaseModel):
    scope: str
    month_to_date_spend: float
    forecast_month_end: float
    budget_amount: float | None = None
    budget_remaining: float | None = None
    allocated_cost: float
    eks_pod_cost: float
    direct_service_cost: float
    allocated_shared_cost: float
    unallocated_cost: float
    allocation_coverage_percent: float
    daily_trend: list[dict]
    breakdowns: dict[str, list[dict]]
