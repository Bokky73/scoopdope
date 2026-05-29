# Scoopdope - Terraform Infrastructure

This directory contains Terraform configurations for deploying Scoopdope to AWS.

## Architecture

- VPC with public and private subnets across 2 availability zones
- RDS PostgreSQL 16 with automated backups
- ElastiCache Redis cluster with automatic failover
- ECS Fargate for container orchestration
- Application Load Balancer for traffic distribution

## Prerequisites

- Terraform >= 1.0
- AWS CLI configured with appropriate credentials
- S3 bucket for remote state: `scoopdope-terraform-state`
- DynamoDB table for state locking: `scoopdope-terraform-locks`

## Setup Remote State

```bash
# Create S3 bucket for state
aws s3api create-bucket \
  --bucket scoopdope-terraform-state \
  --region us-east-1

aws s3api put-bucket-versioning \
  --bucket scoopdope-terraform-state \
  --versioning-configuration Status=Enabled

# Create DynamoDB table for locking
aws dynamodb create-table \
  --table-name scoopdope-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

## Usage

1. Copy the example variables file:
```bash
cp terraform.tfvars.example terraform.tfvars
```

2. Edit `terraform.tfvars` with your values

3. Initialize Terraform:
```bash
terraform init
```

4. Plan the deployment:
```bash
terraform plan
```

5. Apply the configuration:
```bash
terraform apply
```

## Outputs

After successful apply, Terraform will output:
- ALB DNS name for accessing the application
- VPC ID
- Database and Redis endpoints (sensitive)

## Resource Limits

Production configuration uses:
- Backend: 512 CPU, 1024 MB memory (2 tasks)
- Frontend: 256 CPU, 512 MB memory (2 tasks)
- RDS: db.t3.micro with auto-scaling storage
- Redis: cache.t3.micro with 2 nodes

## Cost Optimization

For development/staging environments, adjust in `terraform.tfvars`:
- Use smaller instance classes
- Reduce ECS task counts
- Disable multi-AZ for RDS and Redis

## GitHub Actions OIDC

The `oidc` module provisions:
- An AWS IAM OIDC identity provider for `token.actions.githubusercontent.com`
- A least-privilege `GitHubActionsDeploymentRole` IAM role

After `terraform apply`, copy the `github_actions_role_arn` output and add it as the `AWS_ROLE_ARN` secret in your GitHub repository. Remove any existing `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` secrets.
