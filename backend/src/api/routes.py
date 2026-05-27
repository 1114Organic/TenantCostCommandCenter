from fastapi import APIRouter, Depends, HTTPException, Response

from src.auth.rbac import Principal, get_principal
from src.models.domain import AllocationRule, StatusUpdate
from src.repositories.mock_repository import repository
from src.services.compliance_service import ComplianceService
from src.services.cost_service import CostService
from src.services.workflow_service import WorkflowService

router = APIRouter(prefix="/api")
cost_service = CostService(repository)
workflow_service = WorkflowService(repository)
compliance_service = ComplianceService(repository)


@router.get("/health")
def health() -> dict:
    return {"status": "ok"}


@router.get("/tenants")
def tenants(principal: Principal = Depends(get_principal)):
    return [
        tenant
        for tenant in cost_service.list_tenants()
        if principal.can_view_tenant(tenant.tenant_id, tenant.product_line)
    ]


@router.get("/tenants/{tenant_id}")
def tenant(tenant_id: str, principal: Principal = Depends(get_principal)):
    tenant_record = cost_service.get_tenant(tenant_id)
    if not principal.can_view_tenant(tenant_id, tenant_record.product_line):
        raise HTTPException(status_code=403, detail="Not authorized for tenant")
    return tenant_record


@router.get("/tenants/{tenant_id}/costs")
def tenant_costs(
    tenant_id: str,
    startDate: str | None = None,
    endDate: str | None = None,
    groupBy: str | None = None,
    principal: Principal = Depends(get_principal),
):
    tenant_record = cost_service.get_tenant(tenant_id)
    if not principal.can_view_tenant(tenant_id, tenant_record.product_line):
        raise HTTPException(status_code=403, detail="Not authorized for tenant")
    rows = cost_service.tenant_costs(tenant_id, startDate, endDate)
    budget = cost_service.get_budget(tenant_id)
    summary = cost_service.summarize(tenant_id, rows, budget)
    return {"summary": summary, "rows": rows, "groupBy": groupBy}


@router.get("/product-lines/{product_line}/costs")
def product_line_costs(
    product_line: str,
    startDate: str | None = None,
    endDate: str | None = None,
    principal: Principal = Depends(get_principal),
):
    if principal.role not in {"finops_admin", "executive_viewer"} and product_line not in principal.product_lines:
        raise HTTPException(status_code=403, detail="Not authorized for product line")
    rows = cost_service.product_line_costs(product_line, startDate, endDate)
    return {"summary": cost_service.summarize(product_line, rows), "rows": rows}


@router.get("/platform/costs")
def platform_costs(
    startDate: str | None = None,
    endDate: str | None = None,
    principal: Principal = Depends(get_principal),
):
    if principal.role not in {"finops_admin", "executive_viewer"}:
        raise HTTPException(status_code=403, detail="Not authorized for platform costs")
    rows = cost_service.platform_costs(startDate, endDate)
    return {"summary": cost_service.summarize("platform", rows), "rows": rows}


@router.get("/executive/summary")
def executive_summary(month: str | None = None, principal: Principal = Depends(get_principal)):
    if principal.role not in {"finops_admin", "executive_viewer"}:
        raise HTTPException(status_code=403, detail="Not authorized for executive summary")
    return cost_service.executive_summary(month)


@router.get("/tenants/{tenant_id}/budget")
def tenant_budget(tenant_id: str, principal: Principal = Depends(get_principal)):
    tenant_record = cost_service.get_tenant(tenant_id)
    if not principal.can_view_tenant(tenant_id, tenant_record.product_line):
        raise HTTPException(status_code=403, detail="Not authorized for tenant")
    return cost_service.get_budget(tenant_id)


@router.get("/budgets/status")
def budget_status(productLine: str | None = None, principal: Principal = Depends(get_principal)):
    if productLine and principal.role not in {"finops_admin", "executive_viewer"} and productLine not in principal.product_lines:
        raise HTTPException(status_code=403, detail="Not authorized for product line")
    return cost_service.budget_statuses(productLine)


@router.get("/anomalies")
def anomalies(
    tenantId: str | None = None,
    productLine: str | None = None,
    status: str | None = None,
    principal: Principal = Depends(get_principal),
):
    rows = workflow_service.anomalies(tenantId, productLine, status)
    return [row for row in rows if principal.can_view_tenant(row.tenant_id, row.product_line)]


@router.put("/anomalies/{anomaly_id}/status")
def update_anomaly(anomaly_id: str, update: StatusUpdate, principal: Principal = Depends(get_principal)):
    if principal.role not in {"tenant_owner", "finops_admin"}:
        raise HTTPException(status_code=403, detail="Not authorized to update anomalies")
    return workflow_service.update_anomaly_status(anomaly_id, update.status)


@router.get("/recommendations")
def recommendations(
    tenantId: str | None = None,
    productLine: str | None = None,
    service: str | None = None,
    status: str | None = None,
    principal: Principal = Depends(get_principal),
):
    rows = workflow_service.recommendations(tenantId, productLine, service, status)
    return [row for row in rows if principal.can_view_tenant(row.tenant_id, row.product_line)]


@router.put("/recommendations/{recommendation_id}/status")
def update_recommendation(
    recommendation_id: str,
    update: StatusUpdate,
    principal: Principal = Depends(get_principal),
):
    if principal.role not in {"tenant_owner", "finops_admin"}:
        raise HTTPException(status_code=403, detail="Not authorized to update recommendations")
    return workflow_service.update_recommendation_status(recommendation_id, update.status)


@router.get("/admin/allocation-rules")
def allocation_rules(principal: Principal = Depends(get_principal)):
    principal.require_admin()
    return workflow_service.allocation_rules()


@router.post("/admin/allocation-rules")
def create_allocation_rule(rule: AllocationRule, principal: Principal = Depends(get_principal)):
    principal.require_admin()
    return workflow_service.create_allocation_rule(rule)


@router.put("/admin/allocation-rules/{rule_id}")
def update_allocation_rule(rule_id: str, rule: AllocationRule, principal: Principal = Depends(get_principal)):
    principal.require_admin()
    return workflow_service.update_allocation_rule(rule_id, rule)


@router.get("/admin/tagging-compliance")
def tagging_compliance(principal: Principal = Depends(get_principal)):
    principal.require_admin()
    return compliance_service.tagging_compliance()


@router.get("/admin/data-refresh/status")
def data_refresh_status(principal: Principal = Depends(get_principal)):
    principal.require_admin()
    return repository.refresh_status()


@router.post("/admin/data-refresh/run")
def data_refresh_run(principal: Principal = Depends(get_principal)):
    principal.require_admin()
    return workflow_service.run_refresh()


@router.get("/exports/tenant/{tenant_id}.csv")
def tenant_export(tenant_id: str, principal: Principal = Depends(get_principal)):
    tenant_record = cost_service.get_tenant(tenant_id)
    if not principal.can_view_tenant(tenant_id, tenant_record.product_line):
        raise HTTPException(status_code=403, detail="Not authorized for tenant")
    rows = cost_service.tenant_costs(tenant_id)
    header = "date,tenant_id,service,total_cost,currency\n"
    body = "".join(f"{row.date},{row.tenant_id},{row.service},{row.total_cost},{row.currency}\n" for row in rows)
    return Response(content=header + body, media_type="text/csv")
