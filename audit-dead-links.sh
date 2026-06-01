#!/bin/bash

# IPOReady Dead Links Audit
# Checks all external URLs referenced in the codebase

echo "🔍 IPOReady Dead Links Audit"
echo ""

# Extract all URLs from TypeScript/JavaScript files
echo "📝 Scanning codebase for URLs..."
URLS=$(grep -r "https\?://" \
  /Users/test/Documents/Claude/Projects/IPOReady/src \
  --include="*.ts" \
  --include="*.tsx" \
  --include="*.js" \
  -h | grep -o "https\?://[a-zA-Z0-9.-]*\.[a-zA-Z]{2,}" | sort -u)

DEAD_COUNT=0
WORKING_COUNT=0
TIMEOUT_COUNT=0
ERROR_COUNT=0

echo "🔗 Checking URLs..."
echo ""

for url in $URLS; do
  # Use curl with --head to check if URL is accessible
  # Timeout after 5 seconds, follow redirects, silent mode
  status_code=$(curl -s --head --max-time 5 -w "%{http_code}" \
    --output /dev/null "$url" 2>/dev/null)
  
  if [ -z "$status_code" ]; then
    echo "⏱️  $url - TIMEOUT"
    ((TIMEOUT_COUNT++))
  elif [ "$status_code" -lt 200 ] || [ "$status_code" -ge 500 ]; then
    echo "❌ $url - ERROR ($status_code)"
    ((ERROR_COUNT++))
  elif [ "$status_code" -ge 400 ] && [ "$status_code" -lt 500 ]; then
    echo "❌ $url - DEAD ($status_code)"
    ((DEAD_COUNT++))
  elif [ "$status_code" -ge 200 ] && [ "$status_code" -lt 400 ]; then
    echo "✅ $url ($status_code)"
    ((WORKING_COUNT++))
  else
    echo "⚠️  $url - UNKNOWN ($status_code)"
    ((ERROR_COUNT++))
  fi
done

echo ""
echo "📊 Audit Summary"
echo "==============="
echo "✅ Working: $WORKING_COUNT"
echo "❌ Dead: $DEAD_COUNT"
echo "⏱️  Timeout: $TIMEOUT_COUNT"
echo "⚠️  Errors: $ERROR_COUNT"
echo ""

if [ "$DEAD_COUNT" -gt 0 ]; then
  echo "🚨 WARNING: Found $DEAD_COUNT dead links!"
  exit 1
else
  echo "✨ All URLs are reachable!"
  exit 0
fi
