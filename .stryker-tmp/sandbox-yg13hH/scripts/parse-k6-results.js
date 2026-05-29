#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const summaryFile = process.argv[2];

if (!summaryFile || !fs.existsSync(summaryFile)) {
  console.error('Usage: parse-k6-results.js <summary.json>');
  process.exit(1);
}

const summary = JSON.parse(fs.readFileSync(summaryFile, 'utf8'));

const parsed = {
  timestamp: new Date().toISOString(),
  metrics: {
    'p95_response_time': summary.metrics?.['http_req_duration']?.values?.['p(95)'] || 0,
    'p99_response_time': summary.metrics?.['http_req_duration']?.values?.['p(99)'] || 0,
    'avg_response_time': summary.metrics?.['http_req_duration']?.values?.['avg'] || 0,
    'error_rate': (summary.metrics?.['http_req_failed']?.values?.['rate'] || 0) * 100,
    'throughput': summary.metrics?.['http_reqs']?.values?.['rate'] || 0,
    'total_requests': summary.metrics?.['http_reqs']?.values?.['count'] || 0,
    'total_errors': summary.metrics?.['http_req_failed']?.values?.['count'] || 0,
  },
};

console.log(JSON.stringify(parsed, null, 2));
