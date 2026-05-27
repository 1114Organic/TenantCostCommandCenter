CREATE TABLE tenants (
  tenant_id VARCHAR(128) PRIMARY KEY,
  tenant_name VARCHAR(255) NOT NULL,
  product_line VARCHAR(128) NOT NULL,
  application VARCHAR(255) NOT NULL,
  owner_name VARCHAR(255) NOT NULL,
  owner_email VARCHAR(255) NOT NULL,
  notification_channel VARCHAR(255),
  cost_center VARCHAR(128),
  status VARCHAR(32) NOT NULL
);

CREATE TABLE daily_tenant_cost_summary (
  date DATE NOT NULL,
  tenant_id VARCHAR(128) NOT NULL,
  tenant_name VARCHAR(255) NOT NULL,
  product_line VARCHAR(128) NOT NULL,
  environment VARCHAR(64),
  aws_account_id VARCHAR(32),
  eks_cluster VARCHAR(255),
  namespace VARCHAR(255),
  service VARCHAR(255),
  workload VARCHAR(255),
  pod VARCHAR(255),
  eks_pod_cost DECIMAL(18, 6) DEFAULT 0,
  direct_service_cost DECIMAL(18, 6) DEFAULT 0,
  allocated_shared_cost DECIMAL(18, 6) DEFAULT 0,
  unallocated_cost DECIMAL(18, 6) DEFAULT 0,
  total_cost DECIMAL(18, 6) NOT NULL,
  currency VARCHAR(8) DEFAULT 'USD',
  PRIMARY KEY (date, tenant_id, aws_account_id, service, namespace, workload, pod)
);

CREATE INDEX idx_daily_tenant_product_line ON daily_tenant_cost_summary(product_line, date);
CREATE INDEX idx_daily_tenant_service ON daily_tenant_cost_summary(service, date);
