from datetime import datetime

from fastapi import HTTPException

from src.models.domain import AllocationRule, Anomaly, OptimizationRecommendation
from src.repositories.mock_repository import MockRepository


class WorkflowService:
    def __init__(self, repository: MockRepository) -> None:
        self.repository = repository

    def anomalies(
        self,
        tenant_id: str | None = None,
        product_line: str | None = None,
        status: str | None = None,
    ) -> list[Anomaly]:
        rows = self.repository.anomalies()
        if tenant_id:
            rows = [row for row in rows if row.tenant_id == tenant_id]
        if product_line:
            rows = [row for row in rows if row.product_line == product_line]
        if status:
            rows = [row for row in rows if row.status == status]
        return rows

    def update_anomaly_status(self, anomaly_id: str, status: str) -> Anomaly:
        for anomaly in self.repository.anomalies():
            if anomaly.anomaly_id == anomaly_id:
                anomaly.status = status
                return anomaly
        raise HTTPException(status_code=404, detail="Anomaly not found")

    def recommendations(
        self,
        tenant_id: str | None = None,
        product_line: str | None = None,
        service: str | None = None,
        status: str | None = None,
    ) -> list[OptimizationRecommendation]:
        rows = self.repository.recommendations()
        if tenant_id:
            rows = [row for row in rows if row.tenant_id == tenant_id]
        if product_line:
            rows = [row for row in rows if row.product_line == product_line]
        if service:
            rows = [row for row in rows if row.service == service]
        if status:
            rows = [row for row in rows if row.status == status]
        return rows

    def update_recommendation_status(self, recommendation_id: str, status: str) -> OptimizationRecommendation:
        for recommendation in self.repository.recommendations():
            if recommendation.recommendation_id == recommendation_id:
                recommendation.status = status
                return recommendation
        raise HTTPException(status_code=404, detail="Recommendation not found")

    def allocation_rules(self) -> list[AllocationRule]:
        return self.repository.allocation_rules()

    def create_allocation_rule(self, rule: AllocationRule) -> AllocationRule:
        self.repository.allocation_rules().append(rule)
        return rule

    def update_allocation_rule(self, rule_id: str, rule: AllocationRule) -> AllocationRule:
        rules = self.repository.allocation_rules()
        for index, existing in enumerate(rules):
            if existing.rule_id == rule_id:
                rules[index] = rule
                return rule
        raise HTTPException(status_code=404, detail="Allocation rule not found")

    def run_refresh(self) -> dict:
        return {
            "last_attempted_refresh_at": datetime.utcnow().isoformat() + "Z",
            "status": "queued",
            "message": "Mock refresh accepted. Production implementation starts Step Functions.",
        }
