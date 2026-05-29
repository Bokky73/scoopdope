resource "aws_elasticache_subnet_group" "main" {
  name       = "${var.environment}-scoopdope-redis-subnet"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name        = "${var.environment}-scoopdope-redis-subnet"
    Environment = var.environment
  }
}

resource "aws_security_group" "redis" {
  name        = "${var.environment}-scoopdope-redis-sg"
  description = "Security group for ElastiCache Redis"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.environment}-scoopdope-redis-sg"
    Environment = var.environment
  }
}

resource "aws_elasticache_replication_group" "main" {
  replication_group_id       = "${var.environment}-scoopdope-redis"
  replication_group_description = "Redis cluster for Scoopdope ${var.environment}"
  
  engine               = "redis"
  engine_version       = "7.0"
  node_type            = var.node_type
  num_cache_clusters   = 2
  parameter_group_name = "default.redis7"
  port                 = 6379

  subnet_group_name  = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]

  automatic_failover_enabled = true
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true

  snapshot_retention_limit = 5
  snapshot_window          = "03:00-05:00"

  tags = {
    Name        = "${var.environment}-scoopdope-redis"
    Environment = var.environment
  }
}
