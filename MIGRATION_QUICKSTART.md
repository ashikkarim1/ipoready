# Database Migration Quickstart (us-east-1 → Montreal)

**Time to Complete:** ~30 minutes  
**Downtime:** ~15 minutes  
**Risk Level:** Low (backed up database)

---

## 🎯 What This Does

Moves your IPOReady database from **us-east-1 (USA)** to **ca-east-1 (Montreal, Canada)** to achieve **PIPEDA compliance**.

---

## ✅ Pre-Migration Checklist

- [ ] Read NEON_MIGRATION_GUIDE.md
- [ ] Have PostgreSQL client tools installed (`psql`, `pg_dump`)
- [ ] Have Neon console access (https://console.neon.tech)
- [ ] Schedule 30 minutes of focused time
- [ ] Notify team that database migration is starting

---

## 🚀 Quick Start (3 Steps)

### Step 1️⃣: Run the Migration Script

```bash
cd /Users/test/Documents/Claude/Projects/IPOReady

# Make script executable (if not already)
chmod +x migrate-to-montreal.sh

# Run it
./migrate-to-montreal.sh
```

The script will:
- ✅ Backup your current database
- ✅ Ask you to create a Montreal database in Neon console
- ✅ Restore data to Montreal
- ✅ Verify data integrity
- ✅ Update your .env.local with new connection string

### Step 2️⃣: Create Montreal Database in Neon Console

When the script prompts you:

1. Log in to https://console.neon.tech
2. Select your **IPOReady** project
3. Click **"Branches"** → **"Add Branch"**
4. Set **Region:** `ca-east-1` (Canada - Montreal)
5. Create empty database
6. Copy the connection string: `postgresql://...ca-east-1...`
7. Paste it into the terminal when prompted

⏱️ **Takes 1-2 minutes**

### Step 3️⃣: Restart and Test

```bash
# Restart your application
npm run dev

# In another terminal, test it works
curl http://localhost:3000/api/health

# Should return status 200 ✅
```

---

## 📋 What Happens

| Phase | Time | Action |
|-------|------|--------|
| **Backup** | 2 min | Exports database to compressed file |
| **Create Montreal DB** | 2 min | You create it in Neon console |
| **Restore** | 3 min | Restores data to Montreal |
| **Verify** | 2 min | Script checks data integrity |
| **Update Config** | 1 min | Updates .env.local |
| **Test** | 5 min | You verify app still works |
| **Total** | ~15 min | Done! |

---

## ✅ How to Verify Success

After migration, run these checks:

```bash
# 1. Check database location
psql "$NEW_DATABASE_URL" -c "SELECT version();"
# Should show: PostgreSQL ... on ... (Amazon RDS... ca-east-1...)

# 2. Count records match
psql "$NEW_DATABASE_URL" -c "SELECT COUNT(*) FROM companies;"

# 3. App connects
curl http://localhost:3000/api/health

# 4. Data export API works
curl -X POST http://localhost:3000/api/user/data-export \
  -H "Content-Type: application/json" \
  -d '{"password":"testpass"}'

# All should return ✅
```

---

## ⚠️ If Something Goes Wrong

### Rollback (Revert to us-east-1)

```bash
# Restore old connection string
cp .env.local.backup.* .env.local

# Restart app
npm run dev

# Old database is unchanged and still accessible
```

**Backup location:** `.env.local.backup.YYYYMMDD-HHMMSS`  
**Database backup:** `/tmp/ipoready-backup-*.sql.gz`

---

## 📋 Manual Steps (If Script Fails)

**If the script doesn't work, do this manually:**

```bash
# 1. Backup
pg_dump "$DATABASE_URL" --compress=9 --file=/tmp/backup.sql.gz

# 2. Get new Montreal URL from Neon console
MONTREAL_URL="postgresql://...ca-east-1..."

# 3. Restore
gunzip -c /tmp/backup.sql.gz | psql "$MONTREAL_URL"

# 4. Update .env.local
# Edit .env.local and replace old URL with new Montreal URL

# 5. Test
npm run dev
curl http://localhost:3000/api/health
```

---

## 🎯 Success Criteria

After migration, you should see:

✅ **PIPEDA Compliance**
- Database in Montreal (ca-east-1)
- Personal data stays in Canada
- All users' information compliant with PIPEDA

✅ **Functionality**
- App connects without errors
- Data export API works
- Account deletion API works
- All features functional

✅ **Documentation**
- COMPLIANCE_CHECKLIST.md updated
- Team notified
- Backup preserved for 30 days

---

## 📞 Need Help?

- **Full Guide:** See `NEON_MIGRATION_GUIDE.md`
- **Neon Support:** https://neon.tech/docs
- **Script Output:** Read the terminal output carefully
- **Backup Location:** `/tmp/ipoready-backup-*.sql.gz`

---

## 🎉 Post-Migration

**After 24 hours of successful operation:**

1. Verify everything is working
2. Delete the old us-east-1 database in Neon console
3. Keep the backup for 30 days (then delete)
4. Update team that migration is complete

---

**Status:** Ready to migrate  
**Next Action:** Run `./migrate-to-montreal.sh`  
**Expected Completion:** May 24, 2026 (within 1 hour)
