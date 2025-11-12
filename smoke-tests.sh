#!/bin/bash

# Smoke tests for Classroom Participation Tracker
# Tests: Nginx routing, Database connectivity, Authentication system

# Don't exit on error - we want to run all tests
set +e

BASE_URL="${BASE_URL:-http://hsapp.yungu.org}"
PARTICIPATION_PATH="/participation"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test results
print_test() {
    local test_name=$1
    local status=$2
    local details=$3
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✓${NC} $test_name"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗${NC} $test_name"
        if [ -n "$details" ]; then
            echo -e "  ${RED}Error:${NC} $details"
        fi
        ((TESTS_FAILED++))
    fi
}

# Function to make HTTP request and check response
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    local description=$5
    
    if [ -z "$expected_status" ]; then
        expected_status=200
    fi
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$PARTICIPATION_PATH$endpoint" 2>&1)
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$PARTICIPATION_PATH$endpoint" 2>&1)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_status" ]; then
        print_test "$description" "PASS"
        if command -v jq &> /dev/null; then
            echo "$body" | jq . 2>/dev/null || echo "$body"
        else
            echo "$body"
        fi
        return 0
    else
        print_test "$description" "FAIL" "Expected $expected_status, got $http_code"
        echo "Response: $body"
        return 1
    fi
}

echo "=========================================="
echo "Smoke Tests for Participation Tracker"
echo "=========================================="
echo "Base URL: $BASE_URL"
echo "Path: $PARTICIPATION_PATH"
echo ""

# Test 1: Health check endpoint
echo "1. Testing Health Check Endpoint..."
test_endpoint "GET" "/api/health" "" 200 "Health check endpoint"

# Test 2: Database connectivity (via health check)
echo ""
echo "2. Testing Database Connectivity..."
health_response=$(curl -s "$BASE_URL$PARTICIPATION_PATH/api/health")
if echo "$health_response" | grep -q '"database":"connected"'; then
    print_test "Database connection" "PASS"
else
    print_test "Database connection" "FAIL" "Database not connected"
fi

# Test 3: Signup endpoint - Create test user
echo ""
echo "3. Testing User Signup..."
TEST_EMAIL="smoketest_$(date +%s)@example.com"
TEST_NAME="Smoke Test User"
TEST_PASSWORD="testpass123"

signup_response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$TEST_NAME\",\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" \
    "$BASE_URL$PARTICIPATION_PATH/api/auth/signup" 2>&1)

signup_http_code=$(echo "$signup_response" | tail -n1)
signup_body=$(echo "$signup_response" | sed '$d')

if [ "$signup_http_code" = "200" ]; then
    print_test "User signup" "PASS"
    if command -v jq &> /dev/null; then
        echo "$signup_body" | jq . 2>/dev/null || echo "$signup_body"
    else
        echo "$signup_body"
    fi
    
    # Extract user ID if available
    if command -v jq &> /dev/null; then
        USER_ID=$(echo "$signup_body" | jq -r '.user.id // empty' 2>/dev/null)
    fi
else
    print_test "User signup" "FAIL" "HTTP $signup_http_code"
    echo "Response: $signup_body"
    
    # If user already exists, try with different email
    if echo "$signup_body" | grep -q "already exists"; then
        TEST_EMAIL="smoketest_$(date +%s)_retry@example.com"
        echo "Retrying with different email: $TEST_EMAIL"
        signup_response=$(curl -s -w "\n%{http_code}" -X POST \
            -H "Content-Type: application/json" \
            -d "{\"name\":\"$TEST_NAME\",\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" \
            "$BASE_URL$PARTICIPATION_PATH/api/auth/signup" 2>&1)
        signup_http_code=$(echo "$signup_response" | tail -n1)
        signup_body=$(echo "$signup_response" | sed '$d')
        
        if [ "$signup_http_code" = "200" ]; then
            print_test "User signup (retry)" "PASS"
            if command -v jq &> /dev/null; then
                echo "$signup_body" | jq . 2>/dev/null || echo "$signup_body"
            else
                echo "$signup_body"
            fi
        fi
    fi
fi

# Test 4: Signin endpoint - Login with test user
echo ""
echo "4. Testing User Signin..."
signin_response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" \
    "$BASE_URL$PARTICIPATION_PATH/api/auth/signin" 2>&1)

signin_http_code=$(echo "$signin_response" | tail -n1)
signin_body=$(echo "$signin_response" | sed '$d')

if [ "$signin_http_code" = "200" ]; then
    print_test "User signin" "PASS"
    if command -v jq &> /dev/null; then
        echo "$signin_body" | jq . 2>/dev/null || echo "$signin_body"
    else
        echo "$signin_body"
    fi
else
    print_test "User signin" "FAIL" "HTTP $signin_http_code"
    echo "Response: $signin_body"
fi

# Test 5: Signin with wrong password
echo ""
echo "5. Testing Signin with Wrong Password..."
wrong_password_response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"wrongpassword\"}" \
    "$BASE_URL$PARTICIPATION_PATH/api/auth/signin" 2>&1)

wrong_password_http_code=$(echo "$wrong_password_response" | tail -n1)
wrong_password_body=$(echo "$wrong_password_response" | sed '$d')

if [ "$wrong_password_http_code" = "400" ]; then
    print_test "Signin validation (wrong password)" "PASS"
else
    print_test "Signin validation (wrong password)" "FAIL" "Expected 400, got $wrong_password_http_code"
fi

# Test 6: Signin with non-existent email
echo ""
echo "6. Testing Signin with Non-existent Email..."
nonexistent_response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"nonexistent_$(date +%s)@example.com\",\"password\":\"testpass\"}" \
    "$BASE_URL$PARTICIPATION_PATH/api/auth/signin" 2>&1)

nonexistent_http_code=$(echo "$nonexistent_response" | tail -n1)
nonexistent_body=$(echo "$nonexistent_response" | sed '$d')

if [ "$nonexistent_http_code" = "400" ]; then
    print_test "Signin validation (non-existent email)" "PASS"
else
    print_test "Signin validation (non-existent email)" "FAIL" "Expected 400, got $nonexistent_http_code"
fi

# Test 7: Signup validation - missing fields
echo ""
echo "7. Testing Signup Validation..."
missing_fields_response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Test\"}" \
    "$BASE_URL$PARTICIPATION_PATH/api/auth/signup" 2>&1)

missing_fields_http_code=$(echo "$missing_fields_response" | tail -n1)
missing_fields_body=$(echo "$missing_fields_response" | sed '$d')

if [ "$missing_fields_http_code" = "400" ]; then
    print_test "Signup validation (missing fields)" "PASS"
else
    print_test "Signup validation (missing fields)" "FAIL" "Expected 400, got $missing_fields_http_code"
fi

# Test 8: Signup validation - short password
echo ""
echo "8. Testing Signup Password Length Validation..."
short_password_response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Test User\",\"email\":\"shortpass@example.com\",\"password\":\"12345\"}" \
    "$BASE_URL$PARTICIPATION_PATH/api/auth/signup" 2>&1)

short_password_http_code=$(echo "$short_password_response" | tail -n1)
short_password_body=$(echo "$short_password_response" | sed '$d')

if [ "$short_password_http_code" = "400" ]; then
    print_test "Signup validation (short password)" "PASS"
else
    print_test "Signup validation (short password)" "FAIL" "Expected 400, got $short_password_http_code"
fi

# Test 9: Email case sensitivity
echo ""
echo "9. Testing Email Case Sensitivity..."
# Try signing in with uppercase email
case_test_response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$(echo $TEST_EMAIL | tr '[:lower:]' '[:upper:]')\",\"password\":\"$TEST_PASSWORD\"}" \
    "$BASE_URL$PARTICIPATION_PATH/api/auth/signin" 2>&1)

case_test_http_code=$(echo "$case_test_response" | tail -n1)
case_test_body=$(echo "$case_test_response" | sed '$d')

if [ "$case_test_http_code" = "200" ]; then
    print_test "Email case insensitivity" "PASS"
else
    print_test "Email case insensitivity" "FAIL" "Expected 200, got $case_test_http_code"
fi

# Summary
echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "${GREEN}Passed:${NC} $TESTS_PASSED"
echo -e "${RED}Failed:${NC} $TESTS_FAILED"
echo "Total: $((TESTS_PASSED + TESTS_FAILED))"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed.${NC}"
    exit 1
fi

