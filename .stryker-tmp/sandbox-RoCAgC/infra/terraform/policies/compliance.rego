package terraform.compliance

# Enforce tagging standards
deny[msg] {
    resource := input.resource_changes[_]
    resource.type in ["aws_instance", "aws_rds_cluster", "aws_s3_bucket", "aws_elasticache_cluster"]
    not resource.change.after.tags
    msg := sprintf("MEDIUM: Resource %s must have tags defined", [resource.address])
}

# Enforce environment tag
deny[msg] {
    resource := input.resource_changes[_]
    resource.type in ["aws_instance", "aws_rds_cluster", "aws_s3_bucket"]
    tags := resource.change.after.tags
    not tags.Environment
    msg := sprintf("MEDIUM: Resource %s must have Environment tag", [resource.address])
}

# Enforce cost center tag
deny[msg] {
    resource := input.resource_changes[_]
    resource.type in ["aws_instance", "aws_rds_cluster"]
    tags := resource.change.after.tags
    not tags.CostCenter
    msg := sprintf("LOW: Resource %s should have CostCenter tag", [resource.address])
}
