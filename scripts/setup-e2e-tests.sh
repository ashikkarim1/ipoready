#!/bin/bash

# IPOReady E2E Test Setup Script
# Sets up the test environment and runs initial configuration

set -e

echo "======================================"
echo "IPOReady E2E Test Environment Setup"
echo "======================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_step() {
  echo -e "${BLUE}➜${NC} $1"
}

print_success() {
  echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

# Check prerequisites
print_step "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is not installed"
  exit 1
fi
print_success "Node.js $(node --version) found"

# Check npm
if ! command -v npm &> /dev/null; then
  echo "❌ npm is not installed"
  exit 1
fi
print_success "npm $(npm --version) found"

# Check PostgreSQL (optional)
if ! command -v psql &> /dev/null; then
  print_warning "PostgreSQL client not found (optional, needed for manual DB operations)"
else
  print_success "PostgreSQL client found"
fi

# Install/Update Playwright
print_step "Installing Playwright dependencies..."
npm install --save-dev @playwright/test &> /dev/null || npm install --save-dev @playwright/test
print_success "Playwright installed"

# Install Playwright browsers
print_step "Installing Playwright browsers..."
npx playwright install --with-deps chromium firefox webkit &> /dev/null
print_success "Browsers installed"

# Setup environment file
print_step "Setting up environment files..."
if [ ! -f ".env.test" ]; then
  if [ -f ".env.test.example" ]; then
    cp .env.test.example .env.test
    print_success ".env.test created from example"
  else
    print_warning ".env.test.example not found"
  fi
else
  print_success ".env.test already exists"
fi

# Create test directories
print_step "Creating test directories..."
mkdir -p test-results test-files
print_success "Test directories created"

# Create test-files with sample content
print_step "Creating test files..."
if [ ! -d "test-files" ]; then
  mkdir -p test-files
fi

# Create sample PDF
if [ ! -f "test-files/prospectus-test.pdf" ]; then
  echo "PDF test content" > test-files/prospectus-test.pdf
  print_success "Created test PDF"
fi

# Create sample Excel
if [ ! -f "test-files/financials-2024.xlsx" ]; then
  echo "XLSX test content" > test-files/financials-2024.xlsx
  print_success "Created test Excel"
fi

# Create sample DOCX
if [ ! -f "test-files/articles-of-incorporation.docx" ]; then
  echo "DOCX test content" > test-files/articles-of-incorporation.docx
  print_success "Created test DOCX"
fi

# Run database migrations (optional)
if [ "$1" == "--migrate" ]; then
  print_step "Running database migrations..."
  npm run db:migrate
  print_success "Database migrations completed"
fi

# Display available commands
echo ""
echo "======================================"
echo "Setup Complete!"
echo "======================================"
echo ""
echo -e "${GREEN}Available commands:${NC}"
echo ""
echo "  npm run test:e2e              # Run all E2E tests"
echo "  npm run test:e2e:ui           # Run tests in UI mode (interactive)"
echo "  npm run test:e2e:debug        # Run tests in debug mode"
echo "  npm run test:e2e:report       # View HTML test report"
echo ""
echo "  npm run test:e2e:login        # Run login tests"
echo "  npm run test:e2e:documents    # Run document tests"
echo "  npm run test:e2e:capital-markets # Run capital markets tests"
echo "  npm run test:e2e:navigation   # Run navigation tests"
echo ""
echo "  npm run test:e2e:chromium     # Run with Chromium"
echo "  npm run test:e2e:firefox      # Run with Firefox"
echo "  npm run test:e2e:webkit       # Run with WebKit"
echo "  npm run test:e2e:mobile       # Run mobile tests"
echo ""
echo "Quick Start:"
echo "  1. npm run dev                # Start the application"
echo "  2. npm run test:e2e           # Run all tests (in another terminal)"
echo ""
echo "Documentation:"
echo "  - ./tests/e2e/README.md                 # E2E tests overview"
echo "  - ./tests/E2E_TESTING_GUIDE.md          # Comprehensive testing guide"
echo ""
