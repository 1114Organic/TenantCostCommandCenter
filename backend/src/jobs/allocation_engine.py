from collections import defaultdict


REQUIRED_EKS_LABELS = [
    "finops.tenant",
    "finops.tenant_id",
    "finops.product_line",
    "finops.application",
    "finops.environment",
    "finops.owner",
    "finops.cost_center",
]

REQUIRED_AWS_TAGS = [
    "tenant",
    "tenant_id",
    "product_line",
    "application",
    "environment",
    "owner",
    "cost_center",
]


def normalize_tenant_key(labels_or_tags: dict, id_key: str = "tenant_id") -> str:
    return labels_or_tags.get(id_key) or labels_or_tags.get("finops.tenant_id") or "unallocated"


def missing_required_keys(labels_or_tags: dict, required_keys: list[str]) -> list[str]:
    return [key for key in required_keys if not labels_or_tags.get(key)]


def rollup_costs(rows: list[dict], tenant_key: str = "tenant_id", cost_key: str = "cost") -> dict[str, float]:
    totals = defaultdict(float)
    for row in rows:
        totals[row.get(tenant_key, "unallocated")] += float(row.get(cost_key, 0))
    return {key: round(value, 2) for key, value in totals.items()}
