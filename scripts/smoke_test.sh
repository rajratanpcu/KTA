#!/usr/bin/env bash
# ==============================================================================
# KTA ERP - Automated Production Deployment Smoke Test Suite
# Usage: ./smoke_test.sh [BACKEND_URL] [FRONTEND_URL]
# Example: ./smoke_test.sh https://kta-erp-backend.onrender.com https://kta-erp.vercel.app
# ==============================================================================

set -eo pipefail

BACKEND_URL="${1:-http://localhost:8080}"
FRONTEND_URL="${2:-http://localhost:5173}"

echo "================================================================="
echo "        KTA ERP Production Deployment Smoke Test Suite           "
echo "================================================================="
echo "Target Backend API : ${BACKEND_URL}"
echo "Target Frontend UI : ${FRONTEND_URL}"
echo "Timestamp          : $(date)"
echo "-----------------------------------------------------------------"

PASSED_COUNT=0
FAILED_COUNT=0

test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_code="$3"
    local auth_header="$4"

    echo -n "[TEST] Checking ${name}... "

    local http_code
    if [ -n "${auth_header}" ]; then
        http_code=$(curl -s -o /dev/null -w "%{http_code}" -H "${auth_header}" "${url}" || echo "000")
    else
        http_code=$(curl -s -o /dev/null -w "%{http_code}" "${url}" || echo "000")
    fi

    if [ "${http_code}" == "${expected_code}" ]; then
        echo "PASSED (HTTP ${http_code})"
        ((PASSED_COUNT++))
    else
        echo "FAILED (Expected ${expected_code}, got ${http_code})"
        ((FAILED_COUNT++))
    fi
}

# 1. Health & Readiness
test_endpoint "Backend Health Check" "${BACKEND_URL}/actuator/health" "200"

# 2. Public API or Protected Without Auth (Expect 401 Unauthorized)
test_endpoint "Security Barrier (Unauthorized Access)" "${BACKEND_URL}/api/products" "401"

# 3. Authenticated Core REST API Queries
AUTH="Authorization: Basic YWRtaW46YWRtaW4xMjM=" # admin:admin123 base64
test_endpoint "Categories API (Authenticated)" "${BACKEND_URL}/api/categories" "200" "${AUTH}"
test_endpoint "Products API (Authenticated)" "${BACKEND_URL}/api/products" "200" "${AUTH}"
test_endpoint "Godowns API (Authenticated)" "${BACKEND_URL}/api/godowns" "200" "${AUTH}"
test_endpoint "Stock Balances API (Authenticated)" "${BACKEND_URL}/api/stock/balances" "200" "${AUTH}"
test_endpoint "Transport Bills API (Authenticated)" "${BACKEND_URL}/api/transport/bills" "200" "${AUTH}"

# 4. Frontend Asset & Single Page App Availability
test_endpoint "Frontend Landing Page" "${FRONTEND_URL}/" "200"

echo "-----------------------------------------------------------------"
echo "Smoke Test Summary: ${PASSED_COUNT} Passed, ${FAILED_COUNT} Failed"
if [ ${FAILED_COUNT} -eq 0 ]; then
    echo "STATUS: ALL SMOKE TESTS PASSED - SYSTEM READY FOR VERIFICATION"
    exit 0
else
    echo "STATUS: SMOKE TESTS ENCOUNTERED FAILURES - REVIEW LOGS"
    exit 1
fi
