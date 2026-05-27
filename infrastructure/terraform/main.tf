terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

resource "aws_s3_bucket" "curated_cost_data" {
  bucket = "${var.name_prefix}-curated-cost-data-${var.environment}"
}

resource "aws_dynamodb_table" "tenant_registry" {
  name         = "${var.name_prefix}-tenant-registry-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "tenant_id"

  attribute {
    name = "tenant_id"
    type = "S"
  }
}

resource "aws_dynamodb_table" "daily_cost_summary" {
  name         = "${var.name_prefix}-daily-cost-summary-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "tenant_id"
  range_key    = "date"

  attribute {
    name = "tenant_id"
    type = "S"
  }

  attribute {
    name = "date"
    type = "S"
  }
}
