#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
    echo "📄 Loading environment variables from .env file..."
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Environment variables loaded successfully"
else
    echo "❌ .env file not found!"
    exit 1
fi

# Check if Artillery key is set
if [ -z "$ARTILLERY_KEY" ]; then
    echo "❌ ARTILLERY_KEY not found in .env file!"
    exit 1
fi

#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
    echo "📄 Loading environment variables from .env file..."
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Environment variables loaded successfully"
else
    echo "❌ .env file not found!"
    exit 1
fi

# Check if Artillery key is set
if [ -z "$ARTILLERY_KEY" ]; then
    echo "❌ ARTILLERY_KEY not found in .env file!"
    exit 1
fi

# Check if SBEACON_API_URL is set
if [ -z "$SBEACON_API_URL" ]; then
    echo "❌ SBEACON_API_URL not found in .env file!"
    exit 1
fi

# Check if JWT_TOKEN is set
if [ -z "$JWT_TOKEN" ]; then
    echo "⚠️  JWT_TOKEN not found in .env file! API tests may fail with 401/403 errors."
fi

echo "🔗 Target API URL: $SBEACON_API_URL"
echo "🔐 JWT Token: ${JWT_TOKEN:0:20}..." # Show first 20 chars only

# Find all *-api-test.yml files in tests directory
echo "🔍 Looking for *-api-test.yml files in tests directory..."
api_test_files=$(find tests/api -name "*-api-test.yml" -type f)

if [ -z "$api_test_files" ]; then
    echo "❌ No *-api-test.yml files found in tests directory!"
    exit 1
fi

echo "📋 Found API test files:"
echo "$api_test_files"
echo ""

# Counter for success/failure tracking
total_tests=0
successful_tests=0
failed_tests=0

# Run each API test file
for test_file in $api_test_files; do
    echo "🚀 Running API test: $test_file"
    echo "==============================================="
    
    # Increment total counter
    ((total_tests++))
    
    # Run artillery with record and key from .env
    if artillery run "$test_file"; then
    # if artillery run "$test_file" --record --key "$ARTILLERY_KEY"; then
        echo "✅ API test completed successfully: $test_file"
        ((successful_tests++))
    else
        echo "❌ API test failed: $test_file"
        ((failed_tests++))
    fi
    
    echo ""
    echo "==============================================="
    echo ""
done

# Print summary
echo "📊 API TEST EXECUTION SUMMARY"
echo "==============================================="
echo "Total API tests run: $total_tests"
echo "Successful tests: $successful_tests"
echo "Failed tests: $failed_tests"
echo ""

if [ $failed_tests -eq 0 ]; then
    echo "🎉 All API tests completed successfully!"
    exit 0
else
    echo "⚠️  Some API tests failed. Check the logs above for details."
    exit 1
fi