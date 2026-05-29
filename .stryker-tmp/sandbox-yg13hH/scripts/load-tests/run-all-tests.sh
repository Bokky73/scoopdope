#!/bin/bash
set -e

# Load Testing Script for scoopdope
# Runs various load test scenarios and generates reports

API_URL="${API_URL:-http://localhost:3000}"
RESULTS_DIR="./load-test-results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🚀 Starting scoopdope Load Tests"
echo "API URL: $API_URL"
echo "Results Directory: $RESULTS_DIR"

# Create results directory
mkdir -p "$RESULTS_DIR"

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo "❌ k6 is not installed. Please install it first:"
    echo "   https://k6.io/docs/getting-started/installation/"
    exit 1
fi

# Function to run a load test
run_test() {
    local test_name=$1
    local test_file=$2
    local description=$3

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📊 Running: $test_name"
    echo "📝 Description: $description"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    local output_file="$RESULTS_DIR/${test_name}_${TIMESTAMP}.json"

    k6 run \
        --out json="$output_file" \
        --env API_URL="$API_URL" \
        "scripts/load-tests/$test_file"

    echo "✅ Test completed. Results saved to: $output_file"
}

# Run all tests
run_test "user-journey" "user-journey.js" \
    "Realistic user journey: register → login → browse → enroll → learn"

run_test "high-concurrency" "high-concurrency.js" \
    "High concurrency test with 1000-10000 concurrent users"

run_test "stress-test" "stress-test.js" \
    "Stress test to find breaking points"

# Generate summary report
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📈 Load Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Count test files
test_count=$(ls -1 "$RESULTS_DIR"/*_${TIMESTAMP}.json 2>/dev/null | wc -l)
echo "✅ Completed $test_count load tests"
echo "📁 Results saved in: $RESULTS_DIR"

# Display file sizes
echo ""
echo "Test Results:"
ls -lh "$RESULTS_DIR"/*_${TIMESTAMP}.json 2>/dev/null | awk '{print "  - " $9 " (" $5 ")"}'

echo ""
echo "✨ Load testing completed successfully!"
echo ""
echo "Next steps:"
echo "  1. Review results in: $RESULTS_DIR"
echo "  2. Analyze performance metrics"
echo "  3. Identify bottlenecks"
echo "  4. Optimize as needed"
