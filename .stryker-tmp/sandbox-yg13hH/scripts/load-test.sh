#!/bin/bash

# Load testing script for scoopdope API
# Requires k6 to be installed: https://k6.io/docs/getting-started/installation/

set -e

API_URL="${API_URL:-http://localhost:3000}"
RESULTS_DIR="./load-test-results"

mkdir -p "$RESULTS_DIR"

echo "🚀 Starting load tests for scoopdope API"
echo "API URL: $API_URL"
echo ""

# Test 1: GET /courses (500 VUs)
echo "📊 Test 1: GET /courses (500 VUs, 30s duration)"
k6 run \
  --vus 500 \
  --duration 30s \
  --out json="$RESULTS_DIR/courses-load-test.json" \
  scripts/load-tests/courses.js

# Test 2: POST /auth/login (100 VUs)
echo ""
echo "📊 Test 2: POST /auth/login (100 VUs, 30s duration)"
k6 run \
  --vus 100 \
  --duration 30s \
  --out json="$RESULTS_DIR/login-load-test.json" \
  scripts/load-tests/auth-login.js

# Test 3: GET /stellar/balance/:key (50 VUs)
echo ""
echo "📊 Test 3: GET /stellar/balance/:key (50 VUs, 30s duration)"
k6 run \
  --vus 50 \
  --duration 30s \
  --out json="$RESULTS_DIR/stellar-balance-load-test.json" \
  scripts/load-tests/stellar-balance.js

echo ""
echo "✅ Load tests completed!"
echo "Results saved to: $RESULTS_DIR"
