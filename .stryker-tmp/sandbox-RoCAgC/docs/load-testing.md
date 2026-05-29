# Load Testing Guide

This document describes how to run load tests for the scoopdope API using k6.

## Prerequisites

- k6 installed: https://k6.io/docs/getting-started/installation/
- scoopdope backend running on `http://localhost:3000` (or set `API_URL` environment variable)

## Installation

### macOS (Homebrew)
```bash
brew install k6
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6-stable.list
sudo apt-get update
sudo apt-get install k6
```

### Windows
```bash
choco install k6
```

## Running Load Tests

### Quick Start
Run all load tests with default settings:
```bash
./scripts/load-test.sh
```

### Individual Tests

#### Test 1: GET /courses (500 VUs)
```bash
k6 run --vus 500 --duration 30s scripts/load-tests/courses.js
```

#### Test 2: POST /auth/login (100 VUs)
```bash
k6 run --vus 100 --duration 30s scripts/load-tests/auth-login.js
```

#### Test 3: GET /stellar/balance/:key (50 VUs)
```bash
k6 run --vus 50 --duration 30s scripts/load-tests/stellar-balance.js
```

### Custom API URL
```bash
API_URL=https://api.example.com ./scripts/load-test.sh
```

## SLOs (Service Level Objectives)

The load tests enforce the following SLOs:

| Metric | Target |
|--------|--------|
| p95 Latency | < 500ms |
| p99 Latency | < 1000ms |
| Error Rate | < 1% |

If any threshold is exceeded, k6 will report a failure.

## Understanding Results

### Key Metrics

- **http_req_duration**: Response time for each request
- **http_req_failed**: Percentage of failed requests
- **http_reqs**: Total number of requests
- **vus**: Virtual users (concurrent connections)

### Example Output
```
     checks.........................: 99.5% ✓ 1990 ✗ 10
     data_received..................: 1.2 MB 40 kB/s
     data_sent.......................: 450 kB 15 kB/s
     http_req_blocked...............: avg=1.2ms   min=0s     med=0s     max=50ms   p(90)=2ms    p(95)=5ms
     http_req_connecting............: avg=0.5ms   min=0s     med=0s     max=30ms   p(90)=1ms    p(95)=2ms
     http_req_duration..............: avg=120ms   min=10ms   med=100ms  max=500ms  p(90)=250ms  p(95)=350ms
     http_req_failed................: 0.5%   ✓ 1990 ✗ 10
     http_req_receiving.............: avg=5ms    min=1ms    med=4ms    max=50ms   p(90)=10ms   p(95)=15ms
     http_req_sending...............: avg=2ms    min=0s     med=1ms    max=20ms   p(90)=3ms    p(95)=5ms
     http_req_tls_handshaking.......: avg=0s     min=0s     med=0s     max=0s     p(90)=0s     p(95)=0s
     http_req_waiting...............: avg=113ms  min=8ms    med=95ms   max=480ms  p(90)=240ms  p(95)=340ms
     http_reqs......................: 2000   66.67/s
     iteration_duration.............: avg=1.12s  min=1.01s  med=1.1s   max=1.5s   p(90)=1.25s  p(95)=1.35s
     iterations.....................: 2000   66.67/s
     vus............................: 500    min=500  max=500
     vus_max........................: 500    min=500  max=500
```

## Continuous Integration

Load tests can be integrated into CI/CD pipelines. Add to your workflow:

```yaml
- name: Run load tests
  run: |
    ./scripts/load-test.sh
  env:
    API_URL: ${{ secrets.STAGING_API_URL }}
```

## Troubleshooting

### Connection Refused
Ensure the backend is running:
```bash
npm run dev:backend
```

### High Error Rate
- Check backend logs for errors
- Verify database connectivity
- Check for rate limiting

### Timeout Issues
- Increase `--duration` parameter
- Reduce `--vus` (virtual users)
- Check network latency

## References

- [k6 Documentation](https://k6.io/docs/)
- [k6 HTTP API](https://k6.io/docs/javascript-api/k6-http/)
- [k6 Thresholds](https://k6.io/docs/using-k6/thresholds/)
