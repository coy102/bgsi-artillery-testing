# Load Testing Repository

This repository contains configuration and scripts for comprehensive load testing using a combination of Playwright (for UI testing) and Artillery (for API load testing).

## Prerequisites

Before getting started, ensure you have the following installed:

- **Node.js** (version 22 or newer)
- **npm** or **yarn**
- **Artillery** (requires registration at [artillery.io](https://www.artillery.io/) to generate reports)

Install Artillery globally:

```bash
npm install -g artillery
```

## Environment Configuration

Create a `.env` file based on the provided `.env.example` template:

```bash
# Authentication credentials
LOGIN_EMAIL=your-email@example.com     # Email for browser login tests
LOGIN_PASSWORD=your-password           # Password for browser login tests

# API Authentication
JWT_TOKEN=your-jwt-token-here          # Required for REST API testing

# API Endpoints
SBEACON_API_URL=https://your-sbeacon-api.com
SVEP_API_URL=https://your-svep-api.com
PGX_API_URL=https://your-pgx-api.com

# Web Application
WEB_URL=https://your-web-app.com

# Artillery Configuration
ARTILLERY_KEY=your-artillery-key       # Required for generating Artillery reports
```

## Project Structure

### API Testing

- **Location**: `tests/api/...`
- **Configuration**: You need to manually set values (Projects and S3 Path URLs) in the `tests/api/constants` file
- **Purpose**: Load testing for REST API endpoints

### Browser Testing

- **Location**: `tests/browser`
- **Assets**: The `fixtures` folder contains assets for upload testing using Playwright browser tests
- **Purpose**: End-to-end UI load testing

## Getting Started

1. Clone this repository
2. Install dependencies: `npm install`
3. Configure your `.env` file with the appropriate values
4. Update the constants in `tests/api/constants` for API testing
5. Run your desired test suite

## Additional Notes

- Ensure your Artillery account is properly configured to generate detailed reports
- Browser tests use Playwright's robust testing framework for reliable UI automation
- API tests leverage Artillery's powerful load testing capabilities
