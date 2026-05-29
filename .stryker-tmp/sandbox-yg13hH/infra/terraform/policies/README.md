# Terraform IaC Testing Configuration

This directory contains OPA (Open Policy Agent) policies for validating Terraform configurations.

## Policies

### security.rego
Security-focused policies that enforce:
- No unrestricted security group access (0.0.0.0/0)
- RDS encryption requirements
- S3 encryption and public access blocking
- Backup retention policies

### compliance.rego
Compliance policies that enforce:
- Resource tagging standards
- Environment tag requirements
- Cost center tracking

## Running Policies Locally

```bash
# Install OPA
curl -L -o opa https://openpolicyagent.org/downloads/latest/opa_linux_amd64
chmod +x opa

# Generate Terraform plan as JSON
terraform plan -out=tfplan
terraform show -json tfplan > tfplan.json

# Evaluate policies
./opa eval -d policies/ -i tfplan.json "data.terraform.security.deny"
./opa eval -d policies/ -i tfplan.json "data.terraform.compliance.deny"
```

## CI/CD Integration

Policies are automatically evaluated in the GitHub Actions workflow on:
- Pull requests to `infra/terraform/**`
- Pushes to main branch affecting `infra/terraform/**`

Violations are reported and can block deployment based on severity.
