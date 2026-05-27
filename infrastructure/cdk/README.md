# CDK Infrastructure Starter

This folder is reserved for the AWS CDK implementation. The intended stacks are:

- Cost lake: S3 buckets, Glue database, Athena workgroup.
- Processing: Lambda jobs, Step Functions state machine, EventBridge schedule.
- API: API Gateway, Lambda integrations, Cognito or enterprise SSO placeholder.
- App hosting: S3 static hosting and CloudFront.
- Data store: DynamoDB tables or Aurora PostgreSQL.

Use least-privilege IAM policies for CUR read access, Athena query execution, summary writes, and API reads.
