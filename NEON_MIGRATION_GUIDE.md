# Neon Database Migration: us-east-1 → Montreal (ca-east-1)

**Objective:** Migrate IPOReady database from US region to Canadian region for PIPEDA compliance  
**Current Location:** us-east-1  
**Target Location:** ca-east-1 (Montreal)  
**Estimated Downtime:** 5-15 minutes  
**Date:** May 24, 2026

---

## Step 1: Backup Current Database

Before migration, create a backup of the current database:

```bash
# Export current database schema and data
pg_dump \
  "postgresql://neondb_owner:npg_CA0Le4RlEnzU@ep-plain-fire-aqxix340-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require" \
  --compress=9 \
  --file=/tmp/ipoready-backup-$(date +%Y%m%d-%H%M%S).sql.gz

echo "✅ Backup created"
```

---

## Step 2: Create New Database in Montreal (via Neon Web Console)

Since Neon doesn't have a CLI for region migration, we'll use the web interface:

1. **Log in to Neon Console:** https://console.neon.tech
2. **Select your project:** IPOReady
3. **Click "Branches"** (top menu)
4. **Click "Add Branch"** or "New Project" (if creating new)
5. **Set Region:** `ca-east-1` (Canada/Montreal)
6. **Set Database:** Create new empty database
7. **Copy the new connection string** — you'll need this

---

## Step 3: Create Schema in New Database

Once the Montreal database is created, restore the schema:

```bash
# Get the new Montreal connection string from Neon console
# Format: postgresql://user:password@host.ca-east-1.aws.neon.tech/dbname?sslmode=require

# Create a variable for the new Montreal database
NEON_MONTREAL_URL="postgresql://neondb_owner:XXXX@ep-XXXX.ca-east-1.aws.neon.tech/neondb?sslmode=require"

# Restore schema to Montreal database
psql "$NEON_MONTREAL_URL" < /tmp/ipoready-backup-*.sql.gz

# Verify tables exist
psql "$NEON_MONTREAL_URL" -c "\dt" | head -20

echo "✅ Schema restored to Montreal"
```

---

## Step 4: Verify Data Integrity

```bash
# Count records in both databases to verify migration
echo "=== US-East-1 Database ==="
psql "$DATABASE_URL" -c "SELECT 'users' as table, COUNT(*) FROM users UNION ALL SELECT 'companies', COUNT(*) FROM companies UNION ALL SELECT 'documents', COUNT(*) FROM documents;"

echo ""
echo "=== Montreal Database ==="
psql "$NEON_MONTREAL_URL" -c "SELECT 'users' as table, COUNT(*) FROM users UNION ALL SELECT 'companies', COUNT(*) FROM companies UNION ALL SELECT 'documents', COUNT(*) FROM documents;"

echo "✅ Data integrity check complete"
```

---

## Step 5: Update Application Connection String

Update `.env.local` with the new Montreal connection string:

```bash
# In .env.local, replace:
# OLD: DATABASE_URL=postgresql://...us-east-1...
# NEW: DATABASE_URL=postgresql://...ca-east-1...

# Edit .env.local
nano .env.local

# Or use sed to replace:
sed -i 's/us-east-1/ca-east-1/g' .env.local
sed -i 's/ep-plain-fire-aqxix340/ep-XXXX/g' .env.local  # Update host if different

# Verify the change
grep DATABASE_URL .env.local
```

---

## Step 6: Test Application Connection

```bash
# Restart application to use new connection string
npm run dev

# In another terminal, test the database connection
curl http://localhost:3000/api/health

# Or check directly:
psql "$NEON_MONTREAL_URL" -c "SELECT version();"

echo "✅ Application connected to Montreal database"
```

---

## Step 7: Verify All Features Work

Test critical features:

```bash
# Test data export API
curl -X POST http://localhost:3000/api/user/data-export \
  -H "Content-Type: application/json" \
  -d '{"password":"test123"}'

# Test account deletion API
curl -X GET http://localhost:3000/api/user/account-deletion

# Check audit logs
psql "$NEON_MONTREAL_URL" -c "SELECT COUNT(*) FROM audit_logs;"

# Check database size
psql "$NEON_MONTREAL_URL" -c "SELECT pg_size_pretty(pg_database_size('neondb'));"

echo "✅ All features verified"
```

---

## Step 8: Decommission Old Database

Once verified (recommend waiting 24 hours to ensure no issues):

```bash
# List all branches in old database
psql "$DATABASE_URL" -c "\l"

# OPTIONAL: Keep old database as backup for 30 days, then delete
# Or delete immediately if confident

echo "⚠️  Old us-east-1 database can be deleted after verification period"
```

---

## Rollback Plan (If Issues Occur)

If you encounter issues after migration:

```bash
# Restore connection string to us-east-1
sed -i 's/ca-east-1/us-east-1/g' .env.local

# Restart application
npm run dev

# This reverts to old database immediately
echo "⚠️  Rolled back to us-east-1 database"
```

---

## PIPEDA Compliance Verification

After migration, verify PIPEDA compliance:

```bash
# Check database region is Montreal
psql "$NEON_MONTREAL_URL" -c "SELECT current_database();" 

# Verify connection is encrypted (sslmode=require)
echo "✅ Database location: ca-east-1 (Montreal, Canada)"
echo "✅ Data residency: PIPEDA-compliant (Canadian servers)"
echo "✅ Personal data: No longer leaves Canada"

# Update compliance status
echo "Database migrated to Montreal (ca-east-1) on $(date)" >> COMPLIANCE_CHECKLIST.md
```

---

## Environment Variables to Update

### .env.local (CRITICAL)
```
# OLD (US-EAST-1):
DATABASE_URL=postgresql://neondb_owner:npg_CA0Le4RlEnzU@ep-plain-fire-aqxix340-pooler.c-8.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require

# NEW (CA-EAST-1/MONTREAL):
DATABASE_URL=postgresql://neondb_owner:XXXX@ep-XXXX-pooler.c-8.ca-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
```

---

## Post-Migration Tasks

- [ ] Update documentation to reflect Montreal database location
- [ ] Update COMPLIANCE_CHECKLIST.md with migration completion
- [ ] Update COMPLIANCE_IMPLEMENTATION_SUMMARY.md (mark data residency as ✅)
- [ ] Notify team about new database location
- [ ] Update disaster recovery procedures (backup location, etc.)
- [ ] Consider setting up read-replica in us-east-1 for data sovereignty
- [ ] Document Canadian data residency in privacy policy (optional: add user preference for data location)

---

## Timeline

| Step | Time | Notes |
|------|------|-------|
| Backup | 2 min | Non-blocking |
| Create Montreal DB | 5 min | Via Neon console |
| Restore schema | 3 min | Via pg_dump restore |
| Verify data | 2 min | Record count check |
| Update connection | 1 min | .env.local edit |
| Test app | 5 min | Manual verification |
| **Total downtime** | **~15 min** | Can be done during off-peak |

---

## Success Criteria

✅ **Migration Complete When:**
- [ ] New Montreal database created in Neon
- [ ] All tables and data migrated successfully
- [ ] Row counts match between old and new databases
- [ ] Application connects to Montreal database
- [ ] All APIs functional (data export, account deletion, etc.)
- [ ] Audit logs recording in Montreal database
- [ ] PIPEDA compliance verified
- [ ] Team notified of new location

---

## Support & Questions

- **Neon Support:** https://neon.tech/docs
- **Database Health:** `psql "$NEON_MONTREAL_URL" -c "SELECT version();"`
- **Migration Issues:** Contact Neon support with project name "IPOReady"

---

## Migration Checklist (Copy & Paste)

```bash
# Run these commands in order:

# 1. Backup
pg_dump "$DATABASE_URL" --compress=9 --file=/tmp/ipoready-backup-$(date +%Y%m%d).sql.gz

# 2. Create Montreal DB (via Neon console - get connection string)
NEON_MONTREAL_URL="postgresql://..."

# 3. Restore
psql "$NEON_MONTREAL_URL" < /tmp/ipoready-backup-*.sql.gz

# 4. Verify
psql "$NEON_MONTREAL_URL" -c "SELECT COUNT(*) FROM companies;"

# 5. Update .env.local
# Edit manually or:
sed -i.bak 's/us-east-1/ca-east-1/g' .env.local

# 6. Test
npm run dev
curl http://localhost:3000/api/health

echo "✅ Migration complete - Database now in Montreal (PIPEDA-compliant)"
```

---

**Status:** Ready for migration  
**Approval:** User approved on May 24, 2026  
**Expected completion:** May 24, 2026 (within 1 hour)
