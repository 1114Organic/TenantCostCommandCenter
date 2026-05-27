SELECT
  line_item_usage_start_date AS date,
  line_item_usage_account_id AS aws_account_id,
  product_product_name AS service,
  line_item_resource_id AS resource_id,
  SUM(line_item_unblended_cost) AS unallocated_cost
FROM finops_raw.cur
WHERE resource_tags_user_tenant_id IS NULL
  AND split_line_item_split_usage_resource_tags['finops.tenant_id'] IS NULL
GROUP BY 1,2,3,4
ORDER BY unallocated_cost DESC;
