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

# Find all *-browser-test.yml files in tests directory
echo "🔍 Looking for *-browser-test.yml files in tests directory..."
browser_test_files=$(find tests/browsers -name "*-browser-test.yml" -type f)

if [ -z "$browser_test_files" ]; then
    echo "❌ No *-browser-test.yml files found in tests directory!"
    exit 1
fi

echo "📋 Found browser test files:"
echo "$browser_test_files"
echo ""

# Counter for success/failure tracking
total_tests=0
successful_tests=0
failed_tests=0

# Run each browser test file
for test_file in $browser_test_files; do
    echo "🚀 Running test: $test_file"
    echo "==============================================="
    
    # Increment total counter
    ((total_tests++))
    
    # Run artillery with record and key from .env
    # if artillery run "$test_file"; then
    if artillery run "$test_file" --record --key "$ARTILLERY_KEY"; then
        echo "✅ Test completed successfully: $test_file"
        ((successful_tests++))
    else
        echo "❌ Test failed: $test_file"
        ((failed_tests++))
    fi
    
    echo ""
    echo "==============================================="
    echo ""
done
