# Health Check Module

This module provides comprehensive health checking capabilities for the scoopdope backend API, designed for load balancers, container orchestrators, and monitoring systems.

## Features

- ✅ **Database Connectivity**: PostgreSQL connection health
- ✅ **Redis Connectivity**: Cache/session store health  
- ✅ **Memory Usage**: Heap and RSS memory monitoring
- ✅ **Stellar Horizon**: External service connectivity
- ✅ **HTTP Status Codes**: 200 (healthy) / 503 (unhealthy)
- ✅ **Detailed Responses**: JSON with individual check results
- ✅ **CI/CD Integration**: Automated smoke testing

## Endpoint

```
GET /health
```

## Response Format

### Healthy Response (200 OK)
```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "memory_heap": { "status": "up" },
    "memory_rss": { "status": "up" },
    "redis": { "status": "up", "message": "Redis is responsive" },
    "stellar_horizon": { "status": "up" }
  },
  "error": {},
  "details": {
    "database": { "status": "up" },
    "memory_heap": { "status": "up" },
    "memory_rss": { "status": "up" },
    "redis": { "status": "up", "message": "Redis is responsive" },
    "stellar_horizon": { "status": "up" }
  }
}
```

### Unhealthy Response (503 Service Unavailable)
```json
{
  "status": "error",
  "info": {
    "memory_heap": { "status": "up" },
    "memory_rss": { "status": "up" }
  },
  "error": {
    "database": { "status": "down", "message": "Connection timeout" },
    "redis": { "status": "down", "message": "Redis health check failed: Connection refused" }
  },
  "details": {
    "database": { "status": "down", "message": "Connection timeout" },
    "memory_heap": { "status": "up" },
    "memory_rss": { "status": "up" },
    "redis": { "status": "down", "message": "Redis health check failed: Connection refused" },
    "stellar_horizon": { "status": "up" }
  }
}
```

## Health Checks

### 1. Database (PostgreSQL)
- **Check**: Connection ping to PostgreSQL database
- **Failure**: Database unreachable or connection timeout
- **Configuration**: Uses TypeORM connection

### 2. Redis Cache
- **Check**: Set/get test value with 1-second TTL
- **Failure**: Redis unreachable, connection refused, or value mismatch
- **Configuration**: Uses configured cache manager

### 3. Memory Usage
- **Heap Check**: Monitors V8 heap usage (limit: 150MB)
- **RSS Check**: Monitors Resident Set Size (limit: 300MB)
- **Failure**: Memory usage exceeds configured thresholds

### 4. Stellar Horizon
- **Check**: HTTP ping to Stellar Horizon health endpoint
- **Failure**: Horizon unreachable or unhealthy response
- **Configuration**: Uses `STELLAR_HORIZON_URL` environment variable

## Environment Variables

```bash
# Stellar Horizon URL for health checks
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org

# Database configuration (used by TypeORM health check)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=your_user
DATABASE_PASSWORD=your_password
DATABASE_NAME=scoopdope

# Redis configuration (used by cache manager health check)
REDIS_URL=redis://localhost:6379
```

## Load Balancer Configuration

### NGINX
```nginx
upstream brain_storm_backend {
    server backend1:3000;
    server backend2:3000;
}

server {
    location / {
        proxy_pass http://brain_storm_backend;
    }
    
    location /health {
        access_log off;
        proxy_pass http://brain_storm_backend;
        proxy_connect_timeout 1s;
        proxy_read_timeout 1s;
    }
}
```

### HAProxy
```
backend brain_storm_backend
    balance roundrobin
    option httpchk GET /health
    http-check expect status 200
    server backend1 backend1:3000 check
    server backend2 backend2:3000 check
```

## Container Orchestration

### Docker Compose
```yaml
services:
  backend:
    image: scoopdope-backend
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: scoopdope-backend
spec:
  template:
    spec:
      containers:
      - name: backend
        image: scoopdope-backend
        ports:
        - containerPort: 3000
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 2
```

## CI/CD Integration

### Smoke Test Script
Use the provided script for post-deployment verification:

```bash
# Run health check smoke test
./scripts/health-check.sh

# With custom configuration
API_URL=https://api.Scoopdope.app \
MAX_RETRIES=20 \
RETRY_INTERVAL=10 \
./scripts/health-check.sh
```

### GitHub Actions
See `.github/workflows/health-check-example.yml` for complete CI/CD integration example.

## Monitoring Integration

### Prometheus
The health endpoint can be scraped by Prometheus for monitoring:

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'scoopdope-health'
    metrics_path: '/health'
    static_configs:
      - targets: ['backend:3000']
```

### Custom Monitoring
```bash
# Simple monitoring script
#!/bin/bash
while true; do
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo "$(date): Health check OK"
    else
        echo "$(date): Health check FAILED" >&2
        # Send alert notification
    fi
    sleep 60
done
```

## Development

### Testing Health Checks Locally
```bash
# Start the application
npm run start:dev

# Test health endpoint
curl http://localhost:3000/health

# Test with pretty JSON
curl http://localhost:3000/health | jq '.'

# Test failure scenarios (stop Redis/PostgreSQL)
docker-compose stop redis
curl http://localhost:3000/health
```

### Adding Custom Health Checks
```typescript
// In health.controller.ts
private async checkCustomService(): Promise<HealthIndicatorResult> {
  try {
    // Your custom health check logic
    const isHealthy = await this.customService.ping();
    
    if (isHealthy) {
      return {
        custom_service: {
          status: 'up',
          message: 'Custom service is responsive',
        },
      };
    } else {
      throw new Error('Custom service is not responding');
    }
  } catch (error) {
    this.logger.warn('Custom service health check failed', { error: error.message });
    throw new Error(`Custom service health check failed: ${error.message}`);
  }
}

// Add to health check array
const result = await this.health.check([
  // ... existing checks
  () => this.checkCustomService(),
]);
```

## Troubleshooting

### Common Issues

1. **Database Connection Failures**
   - Check DATABASE_* environment variables
   - Verify PostgreSQL is running and accessible
   - Check network connectivity and firewall rules

2. **Redis Connection Failures**
   - Verify REDIS_URL environment variable
   - Check Redis server status
   - Validate Redis authentication if required

3. **Memory Threshold Exceeded**
   - Monitor application memory usage
   - Adjust thresholds in health controller
   - Investigate memory leaks

4. **Stellar Horizon Failures**
   - Check STELLAR_HORIZON_URL configuration
   - Verify external network connectivity
   - Monitor Stellar network status

### Debug Mode
Enable debug logging to troubleshoot health check issues:

```bash
LOG_LEVEL=debug npm run start:dev
```