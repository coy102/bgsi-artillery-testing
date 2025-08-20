#!/bin/bash

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🎯 Artillery Load Test Runner${NC}"
echo "=============================="

# Check if filename is provided as argument
if [ $# -eq 0 ]; then
    echo -e "${YELLOW}Usage: $0 <test-file.yml>${NC}"
    echo ""
    echo -e "${BLUE}Looking for available test files...${NC}"
    find . -name "*-api-test.yml" -type f 2>/dev/null | head -5
    echo ""
    echo -e "${YELLOW}Example: $0 sbeacon-assign-project-api-test.yml${NC}"
    exit 1
fi

TEST_FILE="$1"

# Check if test file exists
if [ ! -f "$TEST_FILE" ]; then
    echo -e "${RED}❌ Test file '$TEST_FILE' not found!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Test file: $TEST_FILE${NC}"
echo ""

# Load environment variables from .env file
if [ -f .env ]; then
    echo -e "${BLUE}📄 Loading environment variables from .env file...${NC}"
    export $(cat .env | grep -v '^#' | xargs)
    echo -e "${GREEN}✅ Environment variables loaded${NC}"
else
    echo -e "${YELLOW}⚠️  .env file not found!${NC}"
    echo -e "${YELLOW}Please set environment variables manually:${NC}"
    echo "export SBEACON_API_URL=\"https://your-api-url.com\""
    echo "export JWT_TOKEN=\"your-jwt-token\""
    echo "export ARTILLERY_KEY=\"your-artillery-key\" # optional"
    exit 1
fi

echo ""

# Check required environment variables
if [ -z "$SBEACON_API_URL" ]; then
    echo -e "${RED}❌ SBEACON_API_URL not found in .env file!${NC}"
    exit 1
fi

if [ -z "$JWT_TOKEN" ]; then
    echo -e "${RED}❌ JWT_TOKEN not found in .env file!${NC}"
    exit 1
fi

# Display configuration
echo -e "${PURPLE}🔧 Configuration${NC}"
echo "==============="
echo -e "${CYAN}API URL:${NC} $SBEACON_API_URL"
echo -e "${CYAN}JWT Token:${NC} ${JWT_TOKEN:0:20}..."

if [ -n "$ARTILLERY_KEY" ]; then
    echo -e "${CYAN}Artillery Cloud:${NC} Enabled (${ARTILLERY_KEY:0:10}...)"
    RECORD_OPTIONS="--record --key $ARTILLERY_KEY"
    # RECORD_OPTIONS="--output test-run-report.json"
else
    echo -e "${CYAN}Artillery Cloud:${NC} Disabled"
    RECORD_OPTIONS=""
fi

echo ""
echo -e "${YELLOW}Press Enter to start the test, or Ctrl+C to cancel...${NC}"
read -r

echo ""
echo -e "${GREEN}🚀 Starting Artillery Load Test...${NC}"
echo "=================================================="
echo ""

# Run the test
START_TIME=$(date +%s)

if artillery run "$TEST_FILE" $RECORD_OPTIONS; then
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    
    echo ""
    echo -e "${GREEN}✅ Load test completed successfully!${NC}"
    echo -e "${CYAN}Duration: ${DURATION}s${NC}"
    
    if [ -n "$ARTILLERY_KEY" ]; then
        echo -e "${BLUE}📊 Check Artillery Cloud dashboard for detailed results${NC}"
    fi
    
    exit 0
else
    echo ""
    echo -e "${RED}❌ Load test failed!${NC}"
    echo -e "${YELLOW}Check the error messages above for details.${NC}"
    exit 1
fi