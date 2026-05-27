from src.repositories.mock_repository import MockRepository


class ComplianceService:
    def __init__(self, repository: MockRepository) -> None:
        self.repository = repository

    def tagging_compliance(self) -> dict:
        findings = self.repository.tagging_findings()
        total_unallocated = sum(item.estimated_daily_cost for item in findings)
        open_findings = [item for item in findings if item.status == "open"]
        score = max(0, 100 - len(open_findings) * 5)
        return {
            "score": score,
            "open_findings": len(open_findings),
            "estimated_daily_unallocated_cost": round(total_unallocated, 2),
            "findings": findings,
        }
