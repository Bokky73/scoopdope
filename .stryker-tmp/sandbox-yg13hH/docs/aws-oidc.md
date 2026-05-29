# AWS OIDC Setup for GitHub Actions

## Overview

This project uses OpenID Connect (OIDC) to authenticate GitHub Actions with AWS, eliminating the need for long-lived AWS access keys stored as GitHub secrets.

## Benefits

- **Enhanced Security**: No static credentials stored in GitHub
- **Least Privilege**: IAM role with minimal required permissions
- **Automatic Rotation**: Temporary credentials expire automatically
- **Audit Trail**: CloudTrail logs show which GitHub workflow assumed the role
- **Reduced Risk**: Compromised GitHub secrets cannot access AWS

## Architecture

```
GitHub Actions Workflow
    ↓ (OIDC Token)
AWS IAM OIDC Identity Provider
    ↓ (Validates)
IAM Role with Trust Policy
    ↓ (Assumes)
Temporary AWS Credentials
    ↓ (Uses)
AWS Services (ECS, ECR, S3, etc.)
```

## Setup Instructions

### 1. Create AWS IAM OIDC Identity Provider

```bash
# Using AWS CLI
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

Or via AWS Console:
1. Go to IAM → Identity providers → Add provider
2. Provider type: OpenID Connect
3. Provider URL: `https://token.actions.githubusercontent.com`
4. Audience: `sts.amazonaws.com`
5. Click "Add provider"

### 2. Create IAM Role with Trust Policy

Create a new IAM role with this trust policy (replace `YOUR_GITHUB_ORG` and `YOUR_REPO`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR_AWS_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR_GITHUB_ORG/YOUR_REPO:*"
        }
      }
    }
  ]
}
```

For production-only deployments, restrict to specific branches:

```json
"token.actions.githubusercontent.com:sub": "repo:YOUR_GITHUB_ORG/YOUR_REPO:ref:refs/heads/main"
```

### 3. Attach Least-Privilege IAM Policy

Attach this policy to the role (adjust based on your deployment needs):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ECRAccess",
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage"
      ],
      "Resource": "*"
    },
    {
      "Sid": "ECSDeployment",
      "Effect": "Allow",
      "Action": [
        "ecs:UpdateService",
        "ecs:DescribeServices",
        "ecs:DescribeTasks",
        "ecs:ListTasks"
      ],
      "Resource": [
        "arn:aws:ecs:*:YOUR_AWS_ACCOUNT_ID:service/production/scoopdope-backend",
        "arn:aws:ecs:*:YOUR_AWS_ACCOUNT_ID:task/production/*"
      ]
    },
    {
      "Sid": "PassRoleToECS",
      "Effect": "Allow",
      "Action": "iam:PassRole",
      "Resource": "arn:aws:iam::YOUR_AWS_ACCOUNT_ID:role/ecsTaskExecutionRole",
      "Condition": {
        "StringEquals": {
          "iam:PassedToService": "ecs-tasks.amazonaws.com"
        }
      }
    },
    {
      "Sid": "CloudWatchLogs",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:YOUR_AWS_ACCOUNT_ID:log-group:/aws/ecs/scoopdope-*"
    }
  ]
}
```

### 4. Update GitHub Secrets

Remove old secrets:
- ~~`AWS_ACCESS_KEY_ID`~~ (delete)
- ~~`AWS_SECRET_ACCESS_KEY`~~ (delete)

Add new secrets (Settings → Secrets and variables → Actions):
- `AWS_ROLE_ARN`: The ARN of the IAM role created in step 2
  - Example: `arn:aws:iam::123456789012:role/GitHubActionsDeploymentRole`
- `AWS_REGION`: Your AWS region (e.g., `us-east-1`)

### 5. Update Workflows

The deployment workflow has been updated to use OIDC. Key changes:

```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
    role-session-name: GitHubActions-Scoopdope-Production
    aws-region: ${{ secrets.AWS_REGION }}
```

### 6. Add Permissions to Workflow

Ensure the workflow has `id-token: write` permission:

```yaml
permissions:
  id-token: write
  contents: read
```

## Verification

Test the OIDC setup:

```bash
# Trigger a workflow manually or push to main
# Check workflow logs for:
# ✅ "Assuming role: arn:aws:iam::..."
# ✅ "Credentials successfully configured"
```

## Troubleshooting

### Error: "Not authorized to perform sts:AssumeRoleWithWebIdentity"

- Verify the trust policy includes your repository
- Check the OIDC provider thumbprint is correct
- Ensure `id-token: write` permission is set in workflow

### Error: "Access Denied" during deployment

- Review IAM policy attached to the role
- Ensure resource ARNs match your AWS account and resources
- Check CloudTrail logs for specific denied actions

### Error: "Invalid identity token"

- Verify the OIDC provider URL is exactly `https://token.actions.githubusercontent.com`
- Check the audience is `sts.amazonaws.com`
- Ensure the workflow is running from the correct repository

## Security Best Practices

1. **Restrict by Branch**: Limit role assumption to `main` branch only
2. **Least Privilege**: Grant only permissions needed for deployment
3. **Resource-Specific**: Use specific ARNs instead of wildcards
4. **Session Duration**: Set maximum session duration to 1 hour
5. **Audit Regularly**: Review CloudTrail logs for unexpected role assumptions
6. **Rotate Regularly**: Update OIDC thumbprint if GitHub rotates certificates

## Migration Checklist

- [ ] Create AWS IAM OIDC identity provider
- [ ] Create IAM role with trust policy
- [ ] Attach least-privilege IAM policy to role
- [ ] Add `AWS_ROLE_ARN` secret to GitHub
- [ ] Add `AWS_REGION` secret to GitHub
- [ ] Update deployment workflows to use OIDC
- [ ] Test deployment workflow
- [ ] Delete old `AWS_ACCESS_KEY_ID` secret
- [ ] Delete old `AWS_SECRET_ACCESS_KEY` secret
- [ ] Document setup in team wiki

## References

- [GitHub OIDC with AWS](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)
- [AWS IAM OIDC Identity Providers](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html)
- [aws-actions/configure-aws-credentials](https://github.com/aws-actions/configure-aws-credentials)
