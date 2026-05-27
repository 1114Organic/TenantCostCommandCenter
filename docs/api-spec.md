# API Specification

## Dashboard APIs

- `GET /api/tenants`
- `GET /api/tenants/{tenant_id}`
- `GET /api/tenants/{tenant_id}/costs?startDate=&endDate=&groupBy=`
- `GET /api/product-lines/{product_line}/costs?startDate=&endDate=`
- `GET /api/platform/costs?startDate=&endDate=`
- `GET /api/executive/summary?month=`

## Budget APIs

- `GET /api/tenants/{tenant_id}/budget`
- `POST /api/tenants/{tenant_id}/budget`
- `PUT /api/budgets/{budget_id}`
- `GET /api/budgets/status?productLine=`

## Workflow APIs

- `GET /api/anomalies?tenantId=&productLine=&status=`
- `PUT /api/anomalies/{anomaly_id}/status`
- `GET /api/recommendations?tenantId=&productLine=&service=&status=`
- `PUT /api/recommendations/{recommendation_id}/status`

## Admin APIs

- `GET /api/admin/allocation-rules`
- `POST /api/admin/allocation-rules`
- `PUT /api/admin/allocation-rules/{rule_id}`
- `GET /api/admin/tagging-compliance`
- `GET /api/admin/data-refresh/status`
- `POST /api/admin/data-refresh/run`
