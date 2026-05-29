# AWS OIDC Workflow Changes

## Required Changes to `.github/workflows/deploy-production.yml`

Due to OAuth token scope limitations, these changes must be applied manually via GitHub UI or with a token that has `workflow` scope.

### 1. Add id-token permission to jobs

```yaml
jobs:
  build-and-push:
    name: Build and Push Docker Image
    runs-on: ubuntu-latest

    permissions:
      contents: read
      packages: write
      id-token: write  # ADD THIS LINE
```

```yaml
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [build-and-push, deploy-approval]

    permissions:
      id-token: write  # ADD THIS LINE
      contents: read   # ADD THIS LINE

    environment:
      name: production
      url: https://api.scoopdope.example.com
```

```yaml
  rollback:
    name: Rollback on Failure
    runs-on: ubuntu-latest
    needs: [build-and-push, deploy]
    if: failure()

    permissions:
      id-token: write  # ADD THIS LINE
      contents: read   # ADD THIS LINE

    environment:
      name: production
```

### 2. Update AWS credentials configuration

Replace all instances of:

```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: ${{ secrets.AWS_ROLE_TO_ASSUME }}
    aws-region: ${{ secrets.AWS_REGION }}
```

With:

```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
    role-session-name: GitHubActions-Scoopdope-Production  # or -Rollback for rollback job
    aws-region: ${{ secrets.AWS_REGION }}
```

### 3. Update GitHub Secrets

After applying workflow changes:

1. Add new secrets:
   - `AWS_ROLE_ARN`: IAM role ARN (e.g., `arn:aws:iam::123456789012:role/GitHubActionsDeploymentRole`)
   - `AWS_REGION`: AWS region (e.g., `us-east-1`)

2. Delete old secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_ROLE_TO_ASSUME` (if exists)

## Complete Setup

See [docs/aws-oidc.md](./aws-oidc.md) for full AWS IAM OIDC setup instructions.
