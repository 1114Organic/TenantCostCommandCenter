output "curated_cost_data_bucket" {
  value = aws_s3_bucket.curated_cost_data.bucket
}

output "tenant_registry_table" {
  value = aws_dynamodb_table.tenant_registry.name
}

output "daily_cost_summary_table" {
  value = aws_dynamodb_table.daily_cost_summary.name
}
