# Monitoring Setup

Scoopdope uses Prometheus for metrics collection and Grafana for visualization.

## Quick Start

1. Start the monitoring stack:
```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

2. Access the dashboards:
- Grafana: http://localhost:3002 (admin/admin)
- Prometheus: http://localhost:9090

## Available Metrics

### HTTP Metrics
- `http_requests_total` - Total HTTP requests by method, route, and status code

### Business Metrics
- `credential_issued_total` - Credentials issued by type
- `bst_minted_total` - BST tokens minted by user

### Performance Metrics
- `stellar_rpc_latency_seconds` - Stellar RPC call latency histogram

### System Metrics (default)
- `process_cpu_user_seconds_total` - CPU usage
- `process_resident_memory_bytes` - Memory usage
- `nodejs_eventloop_lag_seconds` - Event loop lag
- `nodejs_heap_size_total_bytes` - Heap size

## Grafana Dashboard

A pre-built dashboard is automatically provisioned at startup showing:
- HTTP request rates
- Credential issuance stats
- BST token minting stats
- Stellar RPC latency percentiles
- Node.js memory usage

## Custom Metrics

To add custom metrics, use the `MetricsService`:

```typescript
import { MetricsService } from './metrics/metrics.service';

constructor(private metricsService: MetricsService) {}

// Increment counters
this.metricsService.incrementCredentialIssued('course-completion');
this.metricsService.incrementBstMinted(userId);

// Observe latency
const start = Date.now();
// ... perform operation
const duration = (Date.now() - start) / 1000;
this.metricsService.observeStellarRpcLatency('submitTransaction', 'success', duration);
```

## Production Deployment

In production, configure Prometheus to scrape the `/metrics` endpoint:

```yaml
scrape_configs:
  - job_name: 'scoopdope-backend'
    static_configs:
      - targets: ['backend:3000']
```

## Alerting

Configure Prometheus alerting rules in `infra/monitoring/prometheus.yml` for:
- High error rates (5xx responses)
- Slow Stellar RPC calls (p95 > 2s)
- Memory leaks (continuous memory growth)
