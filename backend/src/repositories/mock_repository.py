import json
from pathlib import Path
from typing import TypeVar

from pydantic import BaseModel

from src.models.domain import (
    AllocationRule,
    Anomaly,
    Budget,
    DailyTenantCost,
    OptimizationRecommendation,
    RefreshStatus,
    TaggingComplianceFinding,
    Tenant,
)

T = TypeVar("T", bound=BaseModel)


class MockRepository:
    def __init__(self, data_dir: Path | None = None) -> None:
        self.data_dir = data_dir or Path(__file__).resolve().parents[3] / "sample-data"
        self._anomalies: list[Anomaly] | None = None
        self._recommendations: list[OptimizationRecommendation] | None = None
        self._allocation_rules: list[AllocationRule] | None = None

    def _load(self, filename: str, model: type[T]) -> list[T]:
        with (self.data_dir / filename).open() as handle:
            return [model.model_validate(item) for item in json.load(handle)]

    def tenants(self) -> list[Tenant]:
        return self._load("tenants.json", Tenant)

    def costs(self) -> list[DailyTenantCost]:
        return self._load("daily-costs.json", DailyTenantCost)

    def budgets(self) -> list[Budget]:
        return self._load("budgets.json", Budget)

    def anomalies(self) -> list[Anomaly]:
        if self._anomalies is None:
            self._anomalies = self._load("anomalies.json", Anomaly)
        return self._anomalies

    def recommendations(self) -> list[OptimizationRecommendation]:
        if self._recommendations is None:
            self._recommendations = self._load("recommendations.json", OptimizationRecommendation)
        return self._recommendations

    def allocation_rules(self) -> list[AllocationRule]:
        if self._allocation_rules is None:
            self._allocation_rules = self._load("allocation-rules.json", AllocationRule)
        return self._allocation_rules

    def tagging_findings(self) -> list[TaggingComplianceFinding]:
        return self._load("tagging-compliance.json", TaggingComplianceFinding)

    def refresh_status(self) -> RefreshStatus:
        with (self.data_dir / "data-refresh-status.json").open() as handle:
            return RefreshStatus.model_validate(json.load(handle))


repository = MockRepository()
