# Onboarding System - Quick Start Guide

## For Developers

### 1. Apply Database Migration
```bash
# Apply the schema migration
npm run migrate -- migrations/013_onboarding_checklist_schema.sql

# Verify tables created
psql -d ipoready -c "\dt onboarding*"
```

### 2. Run Tests
```bash
# Unit tests
npm test -- onboarding.unit.test.ts

# Integration tests
npm test -- onboarding.integration.test.ts

# UX tests
npm test -- onboarding.ux.test.ts

# All onboarding tests
npm test -- onboarding

# Load testing (requires k6)
k6 run src/__tests__/onboarding/load-test.k6.js
```

### 3. Start Development Server
```bash
npm run dev
# App available at http://localhost:3000
```

### 4. Access Onboarding Workflow
```
http://localhost:3000/onboarding
```

## For QA / Testing

### Manual Testing Checklist

#### Welcome Stage
- [ ] Page loads with welcome message
- [ ] All 5 exchange buttons visible (TSX, NASDAQ, CSE, TSXV, OTC)
- [ ] Clicking exchange initiates onboarding
- [ ] Loading spinner appears during initialization
- [ ] Success transitions to checklist stage

#### Checklist Stage
- [ ] Progress bar visible at top
- [ ] Shows "0 of 10 items completed" initially
- [ ] Items grouped by category (Legal, Financial, Governance, Tax, Operations, Compliance)
- [ ] Each category collapsible/expandable
- [ ] Items show checkbox, name, required flag (*), estimated days, status
- [ ] Checkbox toggles item completion
- [ ] Clicking checkbox updates progress bar
- [ ] "Learn More" button shows guidance modal
- [ ] Guidance modal displays:
  - [ ] IPOReady help section
  - [ ] External resources with clickable links
  - [ ] Links open in new tabs
- [ ] Modal closes when clicking elsewhere

#### Progress Tracking
- [ ] Progress percentage updates in real-time
- [ ] Item count updates as items are checked
- [ ] All required items must be completed (optional can skip)
- [ ] Completing all required items triggers completion stage

#### Completion Stage
- [ ] Shows success message
- [ ] Displays "Start PACE Workflow" button
- [ ] Button links to /dashboard
- [ ] Progress is 100%

### Mobile Testing
- [ ] Buttons stack vertically on small screens
- [ ] Text readable on mobile (no overflow)
- [ ] Checkboxes/buttons touch-friendly (48px+)
- [ ] Modal content scrollable on small screens
- [ ] Navigation works on mobile

## For DevOps / Deployment

### Pre-Deployment
```bash
# 1. Verify migration syntax
psql -d ipoready -f migrations/013_onboarding_checklist_schema.sql --dry-run

# 2. Check database state
psql -d ipoready -c "SELECT COUNT(*) FROM onboarding_templates;"

# 3. Run full test suite
npm test -- onboarding

# 4. Run load test
k6 run src/__tests__/onboarding/load-test.k6.js --vus 50 --duration 2m
```

### Deployment
```bash
# 1. Backup current database
pg_dump ipoready > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Apply migration
npm run migrate -- migrations/013_onboarding_checklist_schema.sql

# 3. Verify tables
psql -d ipoready -c "
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_name LIKE 'onboarding%';"

# 4. Check seed data
psql -d ipoready -c "SELECT COUNT(*) FROM onboarding_templates;"

# 5. Restart application
npm run build && npm start

# 6. Monitor logs
tail -f logs/app.log | grep onboarding
```

### Post-Deployment Verification
```bash
# Check API health
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/onboarding/progress

# Verify no errors
grep ERROR logs/app.log

# Check database performance
psql -d ipoready -c "
  SELECT * FROM pg_stat_user_indexes 
  WHERE relname LIKE 'onboarding%';"
```

## API Testing (cURL)

### 1. Start Onboarding
```bash
curl -X POST http://localhost:3000/api/onboarding/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"exchange": "nasdaq"}'

# Response:
# {
#   "success": true,
#   "checklistId": "550e8400-e29b-41d4-a716-446655440000",
#   "status": "in_progress",
#   "totalItems": 10
# }
```

### 2. Get Progress
```bash
curl http://localhost:3000/api/onboarding/progress \
  -H "Authorization: Bearer $TOKEN"

# Response:
# {
#   "status": "in_progress",
#   "completionPercentage": 0,
#   "totalItems": 10,
#   "completedItems": 0
# }
```

### 3. Get Items
```bash
curl http://localhost:3000/api/onboarding/items \
  -H "Authorization: Bearer $TOKEN"

# Optional filters:
# curl "http://localhost:3000/api/onboarding/items?category=Legal"
# curl "http://localhost:3000/api/onboarding/items?status=pending"
```

### 4. Update Item
```bash
curl -X PATCH http://localhost:3000/api/onboarding/items/550e8400-e29b-41d4-a716-446655440001 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status": "completed"}'

# Response:
# {
#   "itemId": "550e8400-e29b-41d4-a716-446655440001",
#   "status": "completed",
#   "checklistCompletion": 10,
#   "checklistStatus": "in_progress"
# }
```

## Environment Variables

Required for production:
```
NEXTAUTH_URL=https://ipoready.ai
NEXTAUTH_SECRET=your-secret-key
DATABASE_URL=postgresql://user:pass@host:5432/ipoready
```

## Troubleshooting

### Database
```bash
# Check connection
psql -d ipoready -c "SELECT 1"

# View table structure
psql -d ipoready -c "\d onboarding_checklists"

# Count records
psql -d ipoready -c "SELECT COUNT(*) FROM onboarding_checklists"
```

### API
```bash
# Check server logs
tail -f .next/server.log | grep onboarding

# Test endpoint directly
curl -i http://localhost:3000/api/onboarding/progress

# Check database query
psql -d ipoready -c "EXPLAIN ANALYZE SELECT * FROM onboarding_checklists LIMIT 1"
```

### Frontend
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build

# Start fresh
npm run dev
```

## Performance Monitoring

### Database Query Performance
```sql
SELECT * FROM pg_stat_user_tables WHERE relname LIKE 'onboarding%';
SELECT * FROM pg_stat_user_indices WHERE relname LIKE 'idx_onboarding%';
```

### API Response Times
```bash
# Test API latency
time curl -X GET http://localhost:3000/api/onboarding/progress \
  -H "Authorization: Bearer $TOKEN"
```

### Load Test Results
```bash
# Run load test with summary
k6 run src/__tests__/onboarding/load-test.k6.js --summary-export=summary.json

# View results
cat summary.json | jq '.metrics'
```

## Support

For issues:
1. Check error logs
2. Verify database connectivity
3. Run test suite
4. Check authentication/authorization
5. Review ONBOARDING_IMPLEMENTATION.md for architecture details

---

**Last Updated:** 2026-06-01
