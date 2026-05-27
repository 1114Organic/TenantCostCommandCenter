from fastapi.testclient import TestClient

from src.app import app


client = TestClient(app)


def test_health():
    assert client.get("/api/health").json() == {"status": "ok"}


def test_tenant_cost_endpoint():
    response = client.get("/api/tenants/tn-claims/costs")

    assert response.status_code == 200
    assert response.json()["summary"]["scope"] == "tn-claims"


def test_rbac_blocks_unassigned_tenant():
    response = client.get(
        "/api/tenants/tn-payments/costs",
        headers={"X-User-Role": "tenant_viewer", "X-Tenant-Ids": "tn-claims"},
    )

    assert response.status_code == 403
