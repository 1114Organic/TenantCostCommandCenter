# Tenant Cost Command Center

Self-service FinOps portal for multi-tenant Amazon EKS cost allocation, showback, budget visibility, anomalies, optimization recommendations, and tagging governance.

## What Is Included

- `backend/`: FastAPI API with mock repositories, service-layer allocation logic, RBAC placeholders, CSV exports, and tests.
- `frontend/`: React TypeScript dashboard application with tenant, product-line, platform, executive, anomaly, recommendation, budget, tagging, and admin views.
- `sample-data/`: Mock tenant registry, daily cost summaries, budgets, anomalies, recommendations, allocation rules, tagging findings, and refresh status.
- `docs/`: Architecture, data model, API notes, and PRD.
- `sql/`: Athena and migration starter SQL.
- `infrastructure/`: CDK and Terraform starter scaffolds.

## Quick Start

Backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn src.app:app --reload --port 8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

The frontend defaults to `http://localhost:8000` for API calls. If the backend is not running, it falls back to bundled mock data.

## MVP Capabilities

- Tenant, product-line, platform, and executive dashboards.
- EKS pod cost, direct AWS service cost, allocated shared cost, unallocated cost, and total cost views.
- Budget burn, forecast risk, anomaly status workflow, recommendation status workflow, tagging compliance, allocation rules, refresh status, and CSV exports.
- Mock authorization via `X-User-Role`, `X-Tenant-Ids`, and `X-Product-Lines` headers for integration testing.

## Next Build Steps

1. Replace mock repositories with DynamoDB/Aurora-backed repositories.
2. Connect Athena CUR extraction jobs using split cost allocation data.
3. Add enterprise SSO and enforce production RBAC claims.
4. Wire notifications through SNS, Slack/Teams, and future Jira workflows.
