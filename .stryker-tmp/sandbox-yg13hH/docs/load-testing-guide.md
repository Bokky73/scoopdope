# Load Testing Guide

This guide covers load testing for scoopdope using k6, including realistic user journey scenarios and performance analysis.

## Prerequisites

### Installation

```bash
# macOS
brew install k6

# Linux
sudo apt-get install k6

# Windows
choco install k6

# Or download from: https://k6.io/docs/getting-started/installation/
```

### Verify Installation

```bash
k6 version
```

## Running Load Tests

### Quick Start

```bash
# Run all load tests
./scripts/load-tests/run-all-tests.sh

# Run specific test
k6 run scripts/load-tests/user-journey.js

# Run with custom API URL
API_URL=https://api.example.com k6 run scripts/load-tests/user-journey.js
```

### Test Scenarios

#### 1. Auth Load Test
**File**: `scripts/load-tests/auth-login.js`

Tests login endpoint under sustained load.

**Load Profile**: 100 VUs for 30s

**Thresholds**:
- p95 < 500ms, p99 < 1000ms, error rate < 1%

**Baseline (p95)**: ~180ms

#### 2. Course Browsing Test
**File**: `scripts/load-tests/courses.js`

Tests course listing endpoint under high concurrency.

**Load Profile**: Ramp to 500 VUs over 10s, sustain 20s

**Thresholds**:
- p95 < 500ms, p99 < 1000ms, error rate < 1%

**Baseline (p95)**: ~120ms

#### 3. Enrollment Test
**File**: `scripts/load-tests/enrollment.js`

Tests the full enrollment flow: register → browse → enroll.

**Load Profile**: Ramp to 50 VUs over 30s, sustain 2m

**Thresholds**:
- p95 < 600ms, p99 < 1200ms
- Enroll endpoint p95 < 800ms, error rate < 5%

**Baseline (p95)**: ~350ms (enroll), ~120ms (browse)

#### 4. Video Streaming Test
**File**: `scripts/load-tests/video-streaming.js`

Tests video lesson access and progress tracking.

**Load Profile**: Ramp to 30 VUs over 30s, sustain 2m

**Thresholds**:
- p95 < 800ms, p99 < 1500ms
- Video endpoint p95 < 1000ms, progress endpoint p95 < 500ms

**Baseline (p95)**: ~420ms (lesson fetch), ~200ms (progress update)

#### 5. User Journey Test
**File**: `scripts/load-tests/user-journey.js`

Simulates complete user flow: register → login → browse → enroll → view lesson.

**Load Profile**:
- Ramp-up: 100 users over 2 minutes
- Sustained: 100 users for 5 minutes
- Spike: 500 users for 3 minutes
- Ramp-down: 0 users over 2 minutes

**Thresholds**:
- p95 < 500ms, p99 < 1000ms, error rate < 5%

**Baseline (p95)**: ~450ms

#### 6. High Concurrency Test
**File**: `scripts/load-tests/high-concurrency.js`

Tests system with high concurrent users (read-heavy).

**Thresholds**:
- p95 < 1000ms, p99 < 2000ms, error rate < 10%

#### 7. Stress Test
**File**: `scripts/load-tests/stress-test.js`

Gradually increases load to find breaking points (100 → 5000 users).

**Thresholds**:
- p95 < 2000ms, p99 < 5000ms, error rate < 20%

---

## Performance Baselines

Baselines measured against a local environment (PostgreSQL + Redis, no CDN):

| Endpoint | p50 | p95 | p99 | Error Rate |
|---|---|---|---|---|
| `POST /v1/auth/login` | 80ms | 180ms | 350ms | <0.5% |
| `POST /v1/auth/register` | 120ms | 280ms | 500ms | <0.5% |
| `GET /v1/courses` | 50ms | 120ms | 250ms | <0.1% |
| `GET /v1/courses/:id` | 40ms | 100ms | 200ms | <0.1% |
| `POST /v1/enrollments` | 150ms | 350ms | 700ms | <1% |
| `GET /v1/lessons/:id` | 180ms | 420ms | 800ms | <1% |
| `POST /v1/progress` | 80ms | 200ms | 400ms | <0.5% |

> Re-run baselines after infrastructure changes: `./scripts/load-tests/run-all-tests.sh`

## Performance Metrics

### Key Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| `http_req_duration` | Request duration | p95 < 500ms |
| `http_req_failed` | Failed requests | < 5% |
| `http_reqs` | Total requests | - |
| `http_req_blocked` | Time blocked | < 100ms |
| `http_req_connecting` | Connection time | < 100ms |
| `http_req_tls_handshaking` | TLS handshake | < 100ms |
| `http_req_sending` | Request sending | < 100ms |
| `http_req_waiting` | Server processing | < 300ms |
| `http_req_receiving` | Response receiving | < 100ms |
| `vus` | Virtual users | - |
| `vus_max` | Max virtual users | - |

### Interpreting Results

```
✓ http_req_duration: [p(95)=450ms p(99)=850ms]
  - 95% of requests completed in 450ms
  - 99% of requests completed in 850ms

✓ http_req_failed: rate=0.02
  - 2% of requests failed (acceptable)

✓ vus: 100
  - 100 concurrent virtual users
```

## Analysis & Bottleneck Identification

### Common Bottlenecks

1. **Database Queries**
   - Check slow query logs
   - Add indexes to frequently queried columns
   - Implement query caching

2. **API Response Time**
   - Profile endpoints
   - Optimize business logic
   - Add response caching

3. **Memory Usage**
   - Monitor memory consumption
   - Implement connection pooling
   - Optimize data structures

4. **Network Latency**
   - Check network conditions
   - Implement CDN
   - Optimize payload size

### Debugging Performance Issues

```bash
# Run with verbose logging
k6 run --verbose scripts/load-tests/user-journey.js

# Run with debug output
k6 run --debug scripts/load-tests/user-journey.js

# Run with specific VU count
k6 run -u 50 -d 30s scripts/load-tests/user-journey.js
```

## Generating Reports

### JSON Output

```bash
k6 run --out json=results.json scripts/load-tests/user-journey.js
```

### HTML Report (with extension)

```bash
# Install xk6-html extension
go install github.com/grafana/xk6-html@latest

# Run with HTML output
xk6 run --out html=report.html scripts/load-tests/user-journey.js
```

### Grafana Cloud Integration

```bash
# Set up Grafana Cloud
export K6_CLOUD_TOKEN=your_token

# Run test and send to Grafana Cloud
k6 run --cloud scripts/load-tests/user-journey.js
```

## Performance Optimization Tips

### 1. Database Optimization
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);

-- Use EXPLAIN to analyze queries
EXPLAIN ANALYZE SELECT * FROM courses WHERE status = 'published';
```

### 2. Caching Strategy
```typescript
// Implement Redis caching
const cachedCourses = await redis.get('courses:list');
if (!cachedCourses) {
  const courses = await db.courses.find();
  await redis.set('courses:list', JSON.stringify(courses), 'EX', 3600);
}
```

### 3. Connection Pooling
```typescript
// Configure connection pool
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 4. Response Compression
```typescript
// Enable gzip compression
app.use(compression());
```

## Continuous Load Testing

### CI/CD Integration

Add to `.github/workflows/ci.yml`:

```yaml
load-tests:
  name: Load Tests
  runs-on: ubuntu-latest
  if: github.ref == 'refs/heads/main'
  
  steps:
    - uses: actions/checkout@v4
    - uses: grafana/setup-k6-action@v1
    - run: ./scripts/load-tests/run-all-tests.sh
      env:
        API_URL: http://localhost:3000
```

### Scheduled Testing

```bash
# Run load tests daily at 2 AM
0 2 * * * cd /path/to/scoopdope && ./scripts/load-tests/run-all-tests.sh
```

## Troubleshooting

### High Error Rate

1. Check backend logs
2. Verify database connectivity
3. Check rate limiting configuration
4. Increase timeout values

### Memory Issues

1. Reduce VU count
2. Implement connection pooling
3. Monitor memory usage
4. Check for memory leaks

### Timeout Errors

1. Increase timeout threshold
2. Check network latency
3. Optimize slow endpoints
4. Scale infrastructure

## Best Practices

1. **Test Regularly**: Run load tests before releases
2. **Baseline Metrics**: Establish performance baselines
3. **Progressive Load**: Gradually increase load
4. **Monitor Infrastructure**: Track CPU, memory, disk
5. **Document Results**: Keep historical data
6. **Optimize Iteratively**: Fix bottlenecks incrementally
7. **Test Realistically**: Simulate actual user behavior
8. **Automate Testing**: Integrate into CI/CD pipeline

## Resources

- [k6 Documentation](https://k6.io/docs/)
- [k6 Best Practices](https://k6.io/docs/testing-guides/load-testing/)
- [Performance Testing Guide](https://k6.io/docs/testing-guides/)
- [Grafana Cloud k6](https://grafana.com/products/cloud/k6/)

## Support

For issues or questions:
1. Check k6 documentation
2. Review load test results
3. Check backend logs
4. Create GitHub issue with details
