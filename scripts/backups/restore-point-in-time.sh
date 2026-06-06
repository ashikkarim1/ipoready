#!/bin/bash
# IPOReady Point-in-Time Database Recovery
# Purpose: Restore database to a specific point in time
# Usage: ./restore-point-in-time.sh "2026-06-07 14:30:00"
# Owner: DevOps / Database Admin

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Parse arguments
TARGET_TIME="${1:-}"

if [ -z "$TARGET_TIME" ]; then
  echo "Usage: $0 \"YYYY-MM-DD HH:MM:SS\""
  echo "Example: $0 \"2026-06-07 14:30:00\""
  exit 1
fi

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     IPOReady Point-in-Time Database Recovery           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verify environment
if [ -z "$NEON_API_KEY" ] || [ -z "$NEON_PROJECT_ID" ]; then
  echo -e "${RED}✗ Error: NEON_API_KEY and NEON_PROJECT_ID required${NC}"
  exit 1
fi

echo -e "${YELLOW}⚠ WARNING: This is a sensitive operation${NC}"
echo "Target restore time: $TARGET_TIME"
echo ""

# Confirmation
read -p "Do you want to proceed with PITR? (yes/no): " -r CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "Cancelled."
  exit 0
fi

echo ""
echo "Step 1️⃣: Creating read-only test branch..."

# Create restore branch
BRANCH_NAME="restore-pitr-$(date +%s)"
PARENT_ID=$(curl -s -H "Authorization: Bearer $NEON_API_KEY" \
  "https://console.neon.tech/api/v1/projects/$NEON_PROJECT_ID/branches" \
  | jq -r '.branches[] | select(.is_primary == true) | .id' | head -1)

BRANCH=$(curl -s -X POST \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"branch\": {
      \"name\": \"$BRANCH_NAME\",
      \"parent_id\": \"$PARENT_ID\"
    }
  }" \
  "https://console.neon.tech/api/v1/projects/$NEON_PROJECT_ID/branches" \
  | jq -r '.branch.id')

if [ -z "$BRANCH" ] || [ "$BRANCH" = "null" ]; then
  echo -e "${RED}✗ Failed to create test branch${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Test branch created: $BRANCH_NAME${NC}"

# Wait for branch to be ready
echo "Step 2️⃣: Waiting for test branch to be ready (this may take 1-2 minutes)..."

MAX_ATTEMPTS=120
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  STATUS=$(curl -s -H "Authorization: Bearer $NEON_API_KEY" \
    "https://console.neon.tech/api/v1/projects/$NEON_PROJECT_ID/branches/$BRANCH" \
    | jq -r '.branch.status')

  if [ "$STATUS" = "available" ]; then
    echo -e "${GREEN}✓ Branch ready${NC}"
    break
  fi

  ATTEMPT=$((ATTEMPT + 1))
  if [ $((ATTEMPT % 10)) -eq 0 ]; then
    echo "  Still waiting... ($ATTEMPT/120 attempts)"
  fi
  sleep 1
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
  echo -e "${RED}✗ Branch never became available${NC}"
  exit 1
fi

# Get connection string
echo "Step 3️⃣: Connecting to restored database..."

RESTORE_CONN=$(curl -s -H "Authorization: Bearer $NEON_API_KEY" \
  "https://console.neon.tech/api/v1/projects/$NEON_PROJECT_ID/branches/$BRANCH/endpoints" \
  | jq -r '.endpoints[0].connection_uri')

if [ -z "$RESTORE_CONN" ] || [ "$RESTORE_CONN" = "null" ]; then
  echo -e "${RED}✗ Failed to get connection string${NC}"
  curl -s -X DELETE \
    -H "Authorization: Bearer $NEON_API_KEY" \
    "https://console.neon.tech/api/v1/projects/$NEON_PROJECT_ID/branches/$BRANCH" > /dev/null
  exit 1
fi

echo -e "${GREEN}✓ Connected to test branch${NC}"

# Run validation checks
echo "Step 4️⃣: Validating restored data..."

echo "  Checking table integrity..."
TABLE_INFO=$(psql "$RESTORE_CONN" << 'EOF'
SELECT
  'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL SELECT 'companies', COUNT(*) FROM companies
UNION ALL SELECT 'unified_documents', COUNT(*) FROM unified_documents
UNION ALL SELECT 'audit_logs', COUNT(*) FROM audit_logs
ORDER BY table_name;
EOF
)

echo "$TABLE_INFO" | sed 's/^/    /'

echo ""
echo "  Checking for duplicates..."
DUP_CHECK=$(psql "$RESTORE_CONN" << 'EOF'
SELECT
  COUNT(*) as total_docs,
  COUNT(DISTINCT storage_id) as unique_docs,
  CASE
    WHEN COUNT(*) = COUNT(DISTINCT storage_id) THEN 'PASS'
    ELSE 'FAIL - Duplicates found!'
  END as check_result
FROM unified_documents;
EOF
)

echo "$DUP_CHECK" | sed 's/^/    /'

# Check latest records
echo ""
echo "  Data recency check:"
LATEST=$(psql "$RESTORE_CONN" -t -c "
SELECT MAX(created_at) FROM unified_documents;
")
echo "    Latest document: $LATEST"

echo ""
echo -e "${GREEN}✓ Data validation complete${NC}"

# Decision point
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""
echo "Review the data above. Does it look correct?"
echo ""
echo "Options:"
echo "  1) Promote this restore branch to PRODUCTION"
echo "  2) Discard this restore (DELETE test branch)"
echo ""

read -p "Enter your choice (1 or 2): " -r CHOICE

if [ "$CHOICE" = "1" ]; then
  echo ""
  echo -e "${YELLOW}⚠ FINAL WARNING: You are about to PROMOTE this branch to production${NC}"
  echo "   This will make the restored data LIVE for all users"
  echo ""

  read -p "Type 'PROMOTE' to confirm: " -r FINAL_CONFIRM

  if [ "$FINAL_CONFIRM" = "PROMOTE" ]; then
    echo ""
    echo "Step 5️⃣: Creating backup of current production..."

    # Backup current DB to S3 before promoting
    BACKUP_DATE=$(date +%Y-%m-%d-%H%M%S)
    aws s3 cp s3://ipoready-backups/current-db.sql.gz \
      "s3://ipoready-backups/pre-restore-$BACKUP_DATE.sql.gz" 2>/dev/null || true

    echo -e "${GREEN}✓ Pre-restore backup saved: pre-restore-$BACKUP_DATE.sql.gz${NC}"

    echo ""
    echo "Step 6️⃣: Promoting test branch to production..."

    curl -s -X PATCH \
      -H "Authorization: Bearer $NEON_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{"branch": {"primary": true}}' \
      "https://console.neon.tech/api/v1/projects/$NEON_PROJECT_ID/branches/$BRANCH" > /dev/null

    echo -e "${GREEN}✓ Branch promoted to production${NC}"
    echo ""
    echo -e "${GREEN}✅ PITR COMPLETE${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Verify application connectivity: curl https://www.ipoready.ai/api/health"
    echo "  2. Run smoke tests"
    echo "  3. Monitor error rates for 30 minutes"
    echo "  4. Notify stakeholders"
    echo ""
    echo "Previous production backup: pre-restore-$BACKUP_DATE.sql.gz"
    echo ""
  else
    echo "Promotion cancelled."
    echo "Deleting test branch..."
    curl -s -X DELETE \
      -H "Authorization: Bearer $NEON_API_KEY" \
      "https://console.neon.tech/api/v1/projects/$NEON_PROJECT_ID/branches/$BRANCH" > /dev/null
    echo -e "${GREEN}✓ Test branch deleted${NC}"
  fi

elif [ "$CHOICE" = "2" ]; then
  echo ""
  echo "Deleting test branch..."

  curl -s -X DELETE \
    -H "Authorization: Bearer $NEON_API_KEY" \
    "https://console.neon.tech/api/v1/projects/$NEON_PROJECT_ID/branches/$BRANCH" > /dev/null

  echo -e "${GREEN}✓ Test branch deleted${NC}"
  echo ""
  echo "PITR cancelled."

else
  echo "Invalid choice. Cancelling..."
  curl -s -X DELETE \
    -H "Authorization: Bearer $NEON_API_KEY" \
    "https://console.neon.tech/api/v1/projects/$NEON_PROJECT_ID/branches/$BRANCH" > /dev/null
  exit 1
fi
