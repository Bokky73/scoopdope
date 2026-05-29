package terraform.security

# Deny unrestricted security group ingress
deny[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_security_group"
    rule := resource.change.after.ingress[_]
    rule.from_port == 0
    rule.to_port == 65535
    rule.cidr_blocks[_] == "0.0.0.0/0"
    msg := sprintf("CRITICAL: Security group %s allows unrestricted access (0.0.0.0/0)", [resource.address])
}

# Deny unencrypted RDS clusters
deny[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_rds_cluster"
    resource.change.after.storage_encrypted == false
    msg := sprintf("CRITICAL: RDS cluster %s must have encryption enabled", [resource.address])
}

# Deny unencrypted S3 buckets
deny[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_s3_bucket"
    not resource.change.after.server_side_encryption_configuration
    msg := sprintf("HIGH: S3 bucket %s should have server-side encryption configured", [resource.address])
}

# Deny public S3 buckets
deny[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_s3_bucket_public_access_block"
    resource.change.after.block_public_acls == false
    msg := sprintf("CRITICAL: S3 bucket %s allows public access", [resource.address])
}

# Warn about missing backup retention
warn[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_rds_cluster"
    resource.change.after.backup_retention_period < 7
    msg := sprintf("WARNING: RDS cluster %s has backup retention < 7 days", [resource.address])
}
