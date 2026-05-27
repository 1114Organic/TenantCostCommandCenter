from pathlib import Path

from src.repositories.mock_repository import MockRepository
from src.services.cost_service import CostService


DATA_DIR = Path(__file__).resolve().parents[2] / "sample-data"


def service() -> CostService:
    return CostService(MockRepository(DATA_DIR))


def test_tenant_summary_preserves_cost_components():
    cost_service = service()
    rows = cost_service.tenant_costs("tn-claims")
    summary = cost_service.summarize("tn-claims", rows, cost_service.get_budget("tn-claims"))

    assert summary.eks_pod_cost == 420.35
    assert summary.direct_service_cost == 405.54
    assert summary.allocated_shared_cost == 94.6
    assert summary.month_to_date_spend == 920.49
    assert summary.budget_remaining == 15079.51


def test_budget_status_flags_forecast_risk():
    statuses = service().budget_statuses()
    analytics = next(item for item in statuses if item.tenant_id == "tn-analytics")

    assert analytics.forecast_month_end > 0
    assert analytics.risk in {"ok", "watch", "over_budget"}


def test_shared_cost_allocation_by_tenant_count():
    allocated = service().allocate_shared_cost_by_tenant_count(100, ["a", "b", "c", "d"])

    assert allocated == {"a": 25, "b": 25, "c": 25, "d": 25}


def test_shared_cost_allocation_proportional():
    allocated = service().allocate_shared_cost_proportionally(100, {"a": 75, "b": 25})

    assert allocated == {"a": 75, "b": 25}
