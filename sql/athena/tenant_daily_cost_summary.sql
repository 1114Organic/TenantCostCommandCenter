-- Curated daily tenant cost summary from AWS CUR with EKS split cost allocation.
-- Replace database, table, and tag column names to match the payer account CUR schema.

CREATE TABLE IF NOT EXISTS finops_curated.daily_tenant_cost_summary
WITH (
  format = 'PARQUET',
  external_location = 's3://REPLACE_WITH_CURATED_BUCKET/daily-tenant-cost-summary/'
) AS
SELECT
  line_item_usage_start_date AS date,
  COALESCE(resource_tags_user_tenant_id, split_line_item_split_usage_resource_tags['finops.tenant_id'], 'unallocated') AS tenant_id,
  COALESCE(resource_tags_user_tenant, split_line_item_split_usage_resource_tags['finops.tenant'], 'Unallocated') AS tenant_name,
  COALESCE(resource_tags_user_product_line, split_line_item_split_usage_resource_tags['finops.product_line'], 'Unallocated') AS product_line,
  COALESCE(resource_tags_user_environment, split_line_item_split_usage_resource_tags['finops.environment'], 'unknown') AS environment,
  line_item_usage_account_id AS aws_account_id,
  split_line_item_parent_resource_id AS eks_cluster,
  split_line_item_split_usage_resource_tags['kubernetes.namespace'] AS namespace,
  product_product_name AS service,
  split_line_item_split_usage_resource_tags['kubernetes.workload'] AS workload,
  split_line_item_split_usage_resource_id AS pod,
  SUM(CASE WHEN product_product_name = 'Amazon Elastic Kubernetes Service' THEN line_item_unblended_cost ELSE 0 END) AS eks_pod_cost,
  SUM(CASE WHEN product_product_name <> 'Amazon Elastic Kubernetes Service' THEN line_item_unblended_cost ELSE 0 END) AS direct_service_cost,
  0.0 AS allocated_shared_cost,
  SUM(CASE WHEN resource_tags_user_tenant_id IS NULL AND split_line_item_split_usage_resource_tags['finops.tenant_id'] IS NULL THEN line_item_unblended_cost ELSE 0 END) AS unallocated_cost,
  SUM(line_item_unblended_cost) AS total_cost,
  pricing_currency AS currency
FROM finops_raw.cur
WHERE line_item_usage_start_date >= DATE '2026-01-01'
GROUP BY 1,2,3,4,5,6,7,8,9,10,11,17;
