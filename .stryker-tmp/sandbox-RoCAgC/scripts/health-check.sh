#!/bin/bash

# Health Check Smoke Test Script
# This script can be used in CI/CD pipelines to verify the application is healthy after deployment

set -e

# Configuration
API_URL="${API_URL:-http://localhost:3000}"
HEALTH_ENDPOINT="${API_URL}/health"
MAX_RETRIES="${MAX_RETRIES:-30}"
RETRY_INTERVAL="${RETRY_INTERVAL:-5}"

echo "🏥 Starting health check smoke test..."
echo "📍 Endpoint: ${HEALTH_ENDPOINT}"
echo "🔄 Max retries: ${MAX_RETRIES}"
echo "⏱️  Retry interval: ${RETRY_INTERVAL}s"
echo ""

# Function to check health endpoint
check_health() {
    local response
    local http_code
    
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" "${HEALTH_ENDPOINT}" || echo "HTTPSTATUS:000")
    http_code=$(echo "${response}" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo "${response}" | sed -e 's/HTTPSTATUS:.*//g')
    
    echo "HTTP Status: ${http_code}"
    
    if [ "${http_code}" -eq 200 ]; then
        echo "✅ Health check passed!"
        echo "📊 Response body:"
        echo "${body}" | jq '.' 2>/dev/null || echo "${body}"
        return 0
    elif [ "${http_code}" -eq 503 ]; then
        echo "❌ Health check failed - Service unavailable"
        echo "📊 Response body:"
        echo "${body}" | jq '.' 2>/dev/null || echo "${body}"
        return 1
    elif [ "${http_code}" -eq 000 ]; then
        echo "🔌 Connection failed - Service not reachable"
        return 1
    else
        echo "⚠️  Unexpected HTTP status: ${http_code}"
        echo "📊 Response body:"
        echo "${body}"
        return 1
    fi
}

# Main retry loop
retry_count=0
while [ ${retry_count} -lt ${MAX_RETRIES} ]; do
    echo "🔍 Attempt $((retry_count + 1))/${MAX_RETRIES}"
    
    if check_health; then
        echo ""
        echo "🎉 Health check smoke test PASSED!"
        echo "✨ Application is healthy and ready to serve traffic"
        exit 0
    fi
    
    retry_count=$((retry_count + 1))
    
    if [ ${retry_count} -lt ${MAX_RETRIES} ]; then
        echo "⏳ Waiting ${RETRY_INTERVAL}s before next attempt..."
        sleep ${RETRY_INTERVAL}
        echo ""
    fi
done

echo ""
echo "💥 Health check smoke test FAILED!"
echo "❌ Application failed to become healthy after ${MAX_RETRIES} attempts"
echo "🔧 Check application logs and configuration"
exit 1