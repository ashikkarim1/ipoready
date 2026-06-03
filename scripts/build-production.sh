#!/bin/bash

################################################################################
# IPOReady Production Build Script
# 
# Automates the complete build process:
# 1. Environment validation
# 2. Dependency installation
# 3. Database migrations
# 4. Demo data seeding
# 5. Application build
# 6. Post-build verification
#
# Usage: ./scripts/build-production.sh
################################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Utility functions
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✅${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

log_error() {
    echo -e "${RED}❌${NC} $1"
}

print_header() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║ $1"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
}

################################################################################
# Step 1: Environment Validation
################################################################################
print_header "STEP 1: Environment Validation"

# Check Node.js
if ! command -v node &> /dev/null; then
    log_error "Node.js not found. Please install Node.js v18+"
    exit 1
fi
NODE_VERSION=$(node --version)
log_success "Node.js installed: $NODE_VERSION"

# Check npm
if ! command -v npm &> /dev/null; then
    log_error "npm not found. Please install npm v9+"
    exit 1
fi
NPM_VERSION=$(npm --version)
log_success "npm installed: $NPM_VERSION"

# Check environment variables
if [ ! -f ".env.local" ]; then
    log_warning ".env.local not found. Creating template..."
    cat > .env.local << 'EOF'
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ipoready

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here-min-32-characters
NEXTAUTH_URL=http://localhost:3000

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=ipoready-uploads
AWS_REGION=us-east-1

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Email
RESEND_API_KEY=your-resend-api-key
EOF
    log_warning "Please update .env.local with your actual credentials"
    read -p "Press ENTER after updating .env.local..."
fi

# Check required env vars
required_vars=("DATABASE_URL" "NEXTAUTH_SECRET" "NEXTAUTH_URL")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        log_warning "Environment variable $var is not set"
    fi
done

log_success "Environment validation complete"

################################################################################
# Step 2: Install Dependencies
################################################################################
print_header "STEP 2: Installing Dependencies"

log_info "Running npm install..."
npm install --legacy-peer-deps

if [ $? -eq 0 ]; then
    log_success "Dependencies installed successfully"
else
    log_error "Failed to install dependencies"
    exit 1
fi

################################################################################
# Step 3: Database Migrations
################################################################################
print_header "STEP 3: Running Database Migrations"

log_info "Applying database migrations..."
npm run db:migrate

if [ $? -eq 0 ]; then
    log_success "Database migrations complete"
else
    log_error "Database migrations failed"
    exit 1
fi

################################################################################
# Step 4: Seed Production Demo Data
################################################################################
print_header "STEP 4: Seeding Production Demo Data"

log_info "Seeding demo data for test@ipoready.com..."
npm run seed:demo

if [ $? -eq 0 ]; then
    log_success "Demo data seeded successfully"
else
    log_warning "Demo data seeding failed (non-critical)"
fi

################################################################################
# Step 5: Build Application
################################################################################
print_header "STEP 5: Building Application"

log_info "Running Next.js build..."
npm run build

if [ $? -eq 0 ]; then
    log_success "Application built successfully"
else
    log_error "Build failed"
    exit 1
fi

################################################################################
# Step 6: Build Verification
################################################################################
print_header "STEP 6: Build Verification"

# Check .next directory
if [ -d ".next" ]; then
    log_success "Build artifact (.next) exists"
else
    log_error "Build artifact (.next) not found"
    exit 1
fi

# Check bundle size
BUNDLE_SIZE=$(du -sh .next | awk '{print $1}')
log_success "Bundle size: $BUNDLE_SIZE"

# Check for TypeScript errors
log_info "Checking TypeScript..."
npm run lint

if [ $? -eq 0 ]; then
    log_success "TypeScript check passed"
else
    log_warning "TypeScript check found issues (review above)"
fi

################################################################################
# Success Summary
################################################################################
print_header "✨ BUILD COMPLETE ✨"

echo "🎉 IPOReady production build completed successfully!"
echo ""
echo "📋 Build Summary:"
echo "  • Node.js: $NODE_VERSION"
echo "  • npm: $NPM_VERSION"
echo "  • Bundle Size: $BUNDLE_SIZE"
echo "  • Database: Migrated ✓"
echo "  • Demo Data: Seeded ✓"
echo "  • Application: Built ✓"
echo ""
echo "🚀 Next Steps:"
echo "  1. Start the application: npm start"
echo "  2. Open http://localhost:3000"
echo "  3. Login with:"
echo "     Email: test@ipoready.com"
echo "     Password: TestPassword123!"
echo ""
echo "📊 Demo Features to Explore:"
echo "  • Material Contracts: /dashboard/documents/contracts-map"
echo "  • Cap Table: /dashboard/compliance/dilution"
echo "  • Financial KPI: /dashboard/financial-mgmt/tracking"
echo ""
echo "📖 For deployment: See PRODUCTION_BUILD_GUIDE.md"
echo ""

log_success "Build ready for deployment!"
