#!/bin/bash
# IPOReady Daily Backup Verification Script
# Purpose: Automated daily verification that backups meet SLA
# Schedule: 08:00 UTC daily (via CloudWatch Events)
# Owner: DevOps Team

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Logging
LOG_DIR="/var/log/ipoready"
LOG_FILE="$LOG_DIR/backup-verification-$(date +%Y-%m-%d).log"
mkdir -p "$LOG_DIR"

exec 1> >(tee -a "$LOG_FILE")
exec 2>&1

echo "🔍 IPOReady Daily Backup Verification"
echo "Timestamp: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "========================================"

# Verify environment variables
if [ -z "$NEON_API_KEY" ] || [ -z "$NEON_PROJECT_ID" ]; then
  echo -e "${RED}✗ Error: NEON_API_KEY and NEON_PROJECT_ID required${NC}"
  exit 1
fi

# 1. Check latest full backup status
echo ""
echo "1️⃣ Checking daily full backup..."

LATEST_BACKUP=$(curl -s -H "Authorization: Bearer $NEON_API_KEY" \
  "https://console.neon.tech/api/v1/projects/$NEON_PROJECT_ID/backups" \
  | jq -r '.backups[0]' 2>/dev/null)

if [ -z "$LATEST_BACKUP" ] || [ "$LATEST_BACKUP" = "null" ]; then
  echo -e "${RED}✗ Failed to fetch backup information${NC}"
  exit 1
fi

BACKUP_ID=$(echo "$LATEST_BACKUP" | jq -r '.id')
BACKUP_STATUS=$(echo "$LATEST_BACKUP" | jq -r '.status')
BACKUP_TIME=$(echo "$LATEST_BACKUP" | jq -r '.started_at')
BACKUP_SIZE=$(echo "$LATEST_BACKUP" | jq -r '.size_bytes / 1024 / 1024 | round')

echo "   ID: $BACKUP_ID"
echo "   Status: $BACKUP_STATUS"
echo "   Time: $BACKUP_TIME"
echo "   Size: ${BACKUP_SIZE}MB"

if [ "$BACKUP_STATUS" != "completed" ]; then
  echo -e "${RED}✗ Backup status is not 'completed': $BACKUP_STATUS${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Backup status: COMPLETED${NC}"

# 2. Check backup age (must be < 24 hours)
BACKUP_EPOCH=$(date -d "$BACKUP_TIME" +%s 2>/dev/null || date -j -f "%Y-%m-%dT%H:%M:%SZ" "$BACKUP_TIME" +%s)
NOW_EPOCH=$(date +%s)
BACKUP_AGE=$((($NOW_EPOCH - $BACKUP_EPOCH) / 3600))

echo ""
echo "2️⃣ Checking backup age..."
echo "   Age: ${BACKUP_AGE}h"

if [ $BACKUP_AGE -gt 24 ]; then
  echo -e "${RED}✗ Backup age EXCEEDS 24-hour SLA${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Backup age within SLA (< 24h)${NC}"

# 3. Check backup size sanity (must be > 100MB)
echo ""
echo "3️⃣ Checking backup size..."
echo "   Size: ${BACKUP_SIZE}MB"

if [ $BACKUP_SIZE -lt 100 ]; then
  echo -e "${RED}✗ Backup size suspicious (< 100MB)${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Backup size valid (> 100MB)${NC}"

# 4. Check WAL archive (requires S3)
echo ""
echo "4️⃣ Checking WAL archive..."

if command -v aws &> /dev/null; then
  WAL_COUNT=$(aws s3 ls s3://ipoready-backups/wal-archive/ --recursive 2>/dev/null | wc -l)

  if [ $WAL_COUNT -gt 100 ]; then
    echo "   Files: $WAL_COUNT"
    echo -e "${GREEN}✓ WAL archive healthy${NC}"
  else
    echo "   Files: $WAL_COUNT"
    echo -e "${YELLOW}⚠ WAL archive may be insufficient${NC}"
  fi
else
  echo -e "${YELLOW}⚠ AWS CLI not found, skipping WAL check${NC}"
fi

# 5. Check S3 replication (if configured)
echo ""
echo "5️⃣ Checking S3 cross-region replication..."

if command -v aws &> /dev/null; then
  REPL_STATUS=$(aws s3api get-bucket-replication \
    --bucket ipoready-backups-primary \
    --query 'ReplicationConfiguration.Rules[0].Status' \
    --output text 2>/dev/null || echo "NOT_CONFIGURED")

  echo "   Status: $REPL_STATUS"

  if [ "$REPL_STATUS" = "Enabled" ]; then
    echo -e "${GREEN}✓ Replication: ACTIVE${NC}"
  else
    echo -e "${YELLOW}⚠ Replication may not be configured${NC}"
  fi
else
  echo -e "${YELLOW}⚠ AWS CLI not found, skipping replication check${NC}"
fi

# 6. Verify database connectivity
echo ""
echo "6️⃣ Checking database connectivity..."

if [ -z "$DATABASE_URL" ]; then
  echo -e "${YELLOW}⚠ DATABASE_URL not set, skipping${NC}"
else
  if psql "$DATABASE_URL" -c "SELECT NOW();" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database: ACCESSIBLE${NC}"
  else
    echo -e "${RED}✗ Database: UNREACHABLE${NC}"
    exit 1
  fi
fi

# Summary
echo ""
echo "========================================"
echo -e "${GREEN}✅ All backup verification checks PASSED${NC}"
echo "Next check: $(date -u -d '+24 hours' '+%Y-%m-%d %H:%M UTC')"
echo ""
