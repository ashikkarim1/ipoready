# IPOReady Admin Technical Reference

**For:** Advanced troubleshooting, emergency procedures, technical details  
**Last Updated:** June 7, 2026  
**Audience:** DevOps engineers, database administrators, senior developers

---

## Table of Contents

1. [API Endpoints Reference](#api-endpoints-reference)
2. [Database Schema Overview](#database-schema-overview)
3. [Error Codes & Solutions](#error-codes--solutions)
4. [Performance Tuning](#performance-tuning)
5. [Security Hardening](#security-hardening)
6. [Debugging Guide](#debugging-guide)

---

## API Endpoints Reference

### Authentication

**Verify Admin Access:**
```bash
GET /api/health
Response:
{
  "status": "ok",
  "timestamp": "2026-06-07T14:32:00Z"
}
```

**Check Session:**
```bash
GET /api/auth/session
Response:
{
  "user": {
    "id": "user-123",
    "email": "admin@ipoready.com",
    "name": "Admin Name",
    "role": "system_admin"
  },
  "expires": "2026-06-08T14:32:00Z"
}
```

### User Management Endpoints

**List All Users:**
```
GET /api/admin/users
Authorization: Bearer <token> or Session cookie

Query Parameters: None

Response:
{
  "users": [
    {
      "id": "user-123",
      "name": "John Doe",
      "email": "john@company.com",
      "role": "user",
      "is_approved": true,
      "created_at": "2026-05-01T10:00:00Z",
      "company_id": "company-456",
      "company_name": "ACME Corp",
      "subscription_plan": "growth",
      "target_exchange": "NYSE",
      "stripe_customer_id": "cus_xxx"
    }
  ]
}
```

**Approve/Revoke User:**
```
PATCH /api/admin/users/{user_id}/approve
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "approved": true  // or false to revoke
}

Response:
{
  "success": true,
  "user_id": "user-123",
  "approved": true
}

Error Responses:
- 403: Not authorized (not system_admin)
- 404: User not found
- 500: Database error
```

**Change User Plan:**
```
PATCH /api/admin/users/{user_id}/plan
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "plan": "enterprise"  // starter, growth, enterprise
}

Response:
{
  "success": true,
  "user_id": "user-123",
  "plan": "enterprise",
  "billing_cycle_start": "2026-06-07T00:00:00Z",
  "billing_cycle_end": "2026-07-07T00:00:00Z"
}
```

### SEC Filing Ingestion

**Trigger Ingestion:**
```
POST /api/admin/ingest-sec-filings
Authorization: Bearer <token>

Query Parameters:
- companyIds (optional): "cik1,cik2,cik3"
- limit (optional, default 50): max companies to process
- filingType (optional): "10-K", "10-Q", "8-K", "S-1"

Response:
{
  "message": "SEC filing ingestion completed",
  "statistics": {
    "total": 50,
    "successful": 48,
    "failed": 2,
    "duration_ms": 45000,
    "avg_per_company_ms": 900
  },
  "errors": [
    {
      "companyId": "acme-001",
      "cik": "0000789019",
      "error": "Filing not found in EDGAR"
    }
  ]
}
```

**Get Ingestion Status:**
```
GET /api/admin/ingest-sec-filings
(Status via GET request)

Response:
{
  "status": "ok",
  "companies_coverage": {
    "total": 1247,
    "with_10k": 1089,
    "with_10q": 1156,
    "with_s1": 340
  },
  "recent_syncs": [
    {
      "id": "sync-001",
      "source": "SEC_EDGAR",
      "company_id": "apple-inc",
      "filing_type": "10-K",
      "created_at": "2026-06-06T14:32:00Z",
      "status": "completed",
      "duration_ms": 3421,
      "records_ingested": 45
    }
  ]
}
```

### Dashboard & Monitoring

**Get Dashboard Stats:**
```
GET /api/dashboard/stats

Response:
{
  "uptime": "99.94%",
  "requests": {
    "total": 2543098,
    "last_hour": 12543,
    "last_minute": 210,
    "errors": 31,
    "error_rate": "0.24%"
  },
  "latency": {
    "p50": 85,
    "p75": 142,
    "p95": 187,
    "p99": 402
  },
  "database": {
    "connections": 45,
    "max_connections": 100,
    "usage": "45%",
    "active_queries": 8
  }
}
```

### Rate Limiting

**Get Rate Limit Stats:**
```
GET /api/admin/rate-limit/stats
Authorization: Bearer <token>

Response:
{
  "status": "success",
  "data": {
    "limits": {
      "public": {
        "requests": 100,
        "window_minutes": 1,
        "key_format": "rl:pub:${ip}"
      },
      "authenticated": {
        "requests": 1000,
        "window_hours": 1,
        "key_format": "rl:auth:${user_id}"
      }
    },
    "current_usage": {
      "top_ips": [
        {
          "ip": "203.0.113.42",
          "requests": 87,
          "percentage": "87%",
          "status": "normal"
        }
      ],
      "users_at_limit": []
    }
  }
}
```

**Reset Rate Limit:**
```
POST /api/admin/rate-limit
Authorization: Bearer <token>

Request Body:
{
  "action": "reset",
  "target_type": "ip",
  "target": "203.0.113.42",
  "prefix": "rl:pub"
}

Response:
{
  "status": "success",
  "message": "Rate limit reset for key: 203.0.113.42"
}
```

**Adjust Rate Limit:**
```
POST /api/admin/rate-limit
Authorization: Bearer <token>

Request Body:
{
  "action": "adjust",
  "target_type": "user",
  "target_id": "user-789",
  "new_limit": 2000,
  "window": "hour",
  "expiration": "2026-07-07T23:59:59Z",
  "reason": "Enterprise integration"
}

Response:
{
  "status": "success",
  "message": "Rate limit adjusted",
  "adjustment": {
    "user_id": "user-789",
    "old_limit": 1000,
    "new_limit": 2000,
    "expires_at": "2026-07-07T23:59:59Z"
  }
}
```

---

## Database Schema Overview

### Core Tables

#### `users`
```sql
Table: users
├─ id (UUID, PK)
├─ email (VARCHAR, UNIQUE)
├─ name (VARCHAR)
├─ role (VARCHAR: 'user', 'system_admin', 'company_admin')
├─ is_approved (BOOLEAN, default false)
├─ phone_number (VARCHAR)
├─ whatsapp_opted_in (BOOLEAN)
├─ company_id (FK → companies.id)
├─ created_at (TIMESTAMP)
├─ updated_at (TIMESTAMP)
├─ last_login (TIMESTAMP)
└─ password_hash (VARCHAR, for non-OAuth users)

Indexes:
- idx_users_email (UNIQUE)
- idx_users_company_id
- idx_users_is_approved
- idx_users_role
- idx_users_created_at
```

#### `companies`
```sql
Table: companies
├─ id (UUID, PK)
├─ name (VARCHAR)
├─ cik (VARCHAR, SEC CIK number)
├─ target_exchange (VARCHAR: 'NYSE', 'NASDAQ', 'TSX', 'TSXV')
├─ listing_type (VARCHAR: 'IPO', 'RTO', 'SPAC')
├─ subscription_plan (VARCHAR: 'starter', 'growth', 'enterprise')
├─ stripe_customer_id (VARCHAR)
├─ stripe_subscription_id (VARCHAR)
├─ plan_expires_at (TIMESTAMP)
├─ sector (VARCHAR)
├─ estimated_public_date (DATE)
├─ created_at (TIMESTAMP)
└─ updated_at (TIMESTAMP)

Indexes:
- idx_companies_cik
- idx_companies_name
- idx_companies_target_exchange
- idx_companies_subscription_plan
- idx_companies_plan_expires_at
```

#### `filings`
```sql
Table: filings
├─ id (UUID, PK)
├─ company_id (FK → companies.id)
├─ cik (VARCHAR, reference)
├─ filing_type (VARCHAR: '10-K', '10-Q', '8-K', 'S-1', '424B5')
├─ accession_number (VARCHAR, UNIQUE, SEC identifier)
├─ filing_date (DATE)
├─ report_date (DATE)
├─ full_text (TEXT or JSONB, raw filing content)
├─ extracted_data (JSONB, parsed fields)
├─ html_url (VARCHAR)
├─ txt_url (VARCHAR)
├─ ingested_at (TIMESTAMP)
├─ last_updated (TIMESTAMP)
└─ error_log (JSONB, any parsing errors)

Indexes:
- idx_filings_company_id
- idx_filings_cik
- idx_filings_accession_number (UNIQUE)
- idx_filings_filing_type
- idx_filings_filing_date
- idx_filings_ingested_at
```

#### `data_sync_log`
```sql
Table: data_sync_log
├─ id (UUID, PK)
├─ source (VARCHAR: 'SEC_EDGAR', 'GOOGLE_DRIVE', 'DROPBOX')
├─ company_id (FK → companies.id)
├─ filing_id (FK → filings.id, optional)
├─ status (VARCHAR: 'pending', 'running', 'completed', 'failed')
├─ records_processed (INTEGER)
├─ records_failed (INTEGER)
├─ duration_ms (INTEGER)
├─ error_message (TEXT)
├─ created_at (TIMESTAMP)
├─ completed_at (TIMESTAMP)
└─ metadata (JSONB)

Indexes:
- idx_data_sync_log_source
- idx_data_sync_log_company_id
- idx_data_sync_log_status
- idx_data_sync_log_created_at
```

### Relationships Diagram

```
users
├─ N:1 → companies (user.company_id → company.id)
├─ 1:1 → sessions (via NextAuth)
└─ N:M → filings (implicit via company_id)

companies
├─ 1:N → users
├─ 1:N → filings
├─ 1:N → data_sync_log
└─ 1:1 → stripe_subscription (external reference)

filings
├─ N:1 → companies
├─ N:1 → data_sync_log
└─ Contains extracted_data (JSONB) with raw document fields

data_sync_log
├─ N:1 → companies
├─ N:1 → filings (optional)
└─ Tracks all data ingestion events
```

---

## Error Codes & Solutions

### HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| **200** | OK | Success |
| **400** | Bad Request | Check request parameters |
| **401** | Unauthorized | Re-authenticate |
| **403** | Forbidden | User lacks permission (not system_admin) |
| **404** | Not Found | Resource doesn't exist |
| **409** | Conflict | Duplicate data or state conflict |
| **429** | Too Many Requests | Rate limit exceeded, wait before retrying |
| **500** | Internal Server Error | Backend error, check logs |
| **502** | Bad Gateway | API server unreachable |
| **503** | Service Unavailable | Database/services down |
| **504** | Gateway Timeout | Request took too long |

### Database Error Codes (PostgreSQL)

| Code | Error | Solution |
|------|-------|----------|
| **23505** | Unique violation | Duplicate value in unique column |
| **23503** | Foreign key violation | Referenced record doesn't exist |
| **42601** | Syntax error | Invalid SQL statement |
| **57P03** | Cannot connect | Database connection failed |
| **57014** | Query cancelled | Query exceeded timeout |

**Example:**
```
ERROR: duplicate key value violates unique constraint "users_email_key"
DETAIL: Key (email)=(user@company.com) already exists

Solution:
1. Check if user already exists: SELECT * FROM users WHERE email = 'user@company.com'
2. If duplicate, use existing user ID
3. If mistake, update email: UPDATE users SET email = 'new@email.com' WHERE id = 'user-123'
```

### Common Application Errors

#### Auth Errors

**"Invalid credentials"**
```
Cause: Wrong password or user doesn't exist
Solution: Check user table, reset password via email
```

**"Session expired"**
```
Cause: NextAuth token expired (default 30 days)
Solution: User must re-login, increase token expiry if needed
```

**"CORS error: No 'Access-Control-Allow-Origin' header"**
```
Cause: Cross-origin request not allowed
Solution: Check CORS configuration in next.config.js
```

#### Database Errors

**"Too many connections"**
```
Cause: Connection pool exhausted
Solution: Kill idle connections (see Database Health Checks)
```

**"Deadlock detected"**
```
Cause: Two queries waiting for each other's locks
Solution: Application retry will usually succeed, but check query patterns
```

**"Disk quota exceeded"**
```
Cause: Database storage full
Solution: Delete old backups, archive old filings, upgrade storage
```

#### SEC Ingestion Errors

**"CIK not found in EDGAR"**
```
Cause: Invalid CIK number in companies table
Solution: Update CIK: UPDATE companies SET cik = '0000789019' WHERE id = 'xxx'
```

**"HTML parsing failed"**
```
Cause: SEC EDGAR changed document format
Solution: Update SEC parser in src/lib/sec-parser/
```

**"Filing already ingested"**
```
Cause: Duplicate ingestion attempt
Solution: Safe to ignore, system deduplicates by accession_number
```

---

## Performance Tuning

### Query Optimization

**Identify Slow Queries:**
```sql
-- Enable query logging
ALTER SYSTEM SET log_min_duration_statement = 1000;  -- Log queries > 1 second
SELECT pg_reload_conf();

-- View slow query log
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC LIMIT 10;
```

**Common N+1 Query Issues:**

❌ **BAD: N+1 queries**
```javascript
// Loads 1 company + N user queries
const company = await db.query(
  'SELECT * FROM companies WHERE id = $1',
  [companyId]
);
const users = await Promise.all(
  userIds.map(id => 
    db.query('SELECT * FROM users WHERE id = $1', [id])
  )
);
// Results in 1 + 100 queries for 100 users!
```

✅ **GOOD: Single batch query**
```javascript
// Load company and all users in 2 queries
const [company] = await db.query(
  'SELECT * FROM companies WHERE id = $1',
  [companyId]
);
const users = await db.query(
  'SELECT * FROM users WHERE id = ANY($1)',
  [userIds]
);
// Results in 2 queries regardless of user count
```

**Index Optimization:**
```sql
-- Find missing indexes (queries doing sequential scans)
SELECT query, calls, total_time 
FROM pg_stat_statements 
WHERE query ILIKE '%Seq Scan%'
ORDER BY total_time DESC 
LIMIT 5;

-- Example: Add index for frequently filtered column
CREATE INDEX idx_filings_company_filing_type 
ON filings(company_id, filing_type);

-- Verify index is being used
EXPLAIN ANALYZE 
SELECT * FROM filings 
WHERE company_id = '123' AND filing_type = '10-K';
```

### Connection Pool Tuning

**Current Configuration:**
```
Max Connections: 100
Connection Timeout: 30 seconds
Idle Timeout: 600 seconds (10 minutes)
```

**Optimization for High Load:**
```sql
-- Increase max connections (if server has resources)
ALTER SYSTEM SET max_connections = 200;

-- Reduce idle timeout to free up connections
ALTER SYSTEM SET idle_in_transaction_session_timeout = 300000;  -- 5 minutes

-- Apply changes
SELECT pg_reload_conf();
```

### Caching Strategy

**Current Implementation:**
- Redis for rate limiting (in-memory)
- Database query results cached in application memory
- HTTP cache headers on static assets

**To Improve Caching:**
```javascript
// Example: Cache SEC filing lookups
const cacheKey = `filing:${companyId}:${filingType}`;
const cached = await redis.get(cacheKey);

if (!cached) {
  const filing = await db.query(/* ... */);
  await redis.setex(cacheKey, 3600, JSON.stringify(filing)); // 1 hour TTL
  return filing;
}
return JSON.parse(cached);
```

---

## Security Hardening

### Access Control

**Verify Role-Based Access:**
```sql
-- Check admin users
SELECT id, email, role FROM users WHERE role = 'system_admin';

-- Check if admin accounts have passwords (should use OAuth)
SELECT id, email, role, password_hash IS NOT NULL as has_password 
FROM users WHERE role = 'system_admin';
```

**Remove Unnecessary Admin Access:**
```sql
-- Audit: Find old admins who haven't logged in
SELECT id, email, last_login 
FROM users 
WHERE role = 'system_admin' 
AND last_login < now() - INTERVAL '90 days';

-- Remove if appropriate
UPDATE users 
SET role = 'user' 
WHERE id = 'user-to-downgrade';
```

### Secrets Management

**Current Secrets (should be in environment variables, never in code):**
```
NEXTAUTH_SECRET=xxx
DATABASE_URL=postgres://xxx
STRIPE_SECRET_KEY=sk_xxx
GOOGLE_OAUTH_CLIENT_ID=xxx
GOOGLE_OAUTH_CLIENT_SECRET=xxx
SEC_PARSER_API_KEY=xxx  (if applicable)
```

**Verify No Secrets in Git:**
```bash
# Check for common secret patterns
git log --all -S 'sk_' --oneline  # Stripe keys
git log --all -S 'AKIA' --oneline  # AWS keys
git log --all -S 'BEGIN RSA PRIVATE KEY' --oneline
```

### Audit Logging

**Enable Database Audit Log (Neon):**
```sql
-- Enable pgAudit extension
CREATE EXTENSION IF NOT EXISTS pgaudit;

-- Log all writes to audit tables
ALTER SYSTEM SET 'pgaudit.log' = 'WRITE';

-- Log administrative changes
ALTER SYSTEM SET 'pgaudit.log_statement' = 'all';

SELECT pg_reload_conf();

-- View audit logs
SELECT event_type, function_name, object_type, object_name, statement
FROM pgaudit.event_log
ORDER BY event_time DESC
LIMIT 50;
```

---

## Debugging Guide

### Enable Debug Logging

**For Node.js/Next.js:**
```bash
# Run with debug logging
DEBUG=* npm run dev

# More selective
DEBUG=admin:* npm run dev
```

**Set Log Level in .env:**
```
LOG_LEVEL=debug
DEBUG_MODE=true
```

### Common Debugging Scenarios

#### Scenario 1: User Can't Login

**Steps:**

1. **Check if user exists**
   ```sql
   SELECT id, email, is_approved, role FROM users 
   WHERE email = 'user@company.com';
   ```

2. **Check NextAuth session**
   ```bash
   # Browser console
   fetch('/api/auth/session').then(r => r.json()).then(console.log)
   ```

3. **Check credentials are correct**
   - Verify user typing correct email/password
   - Check if email has leading/trailing whitespace

4. **Review auth logs**
   ```bash
   # Check auth errors
   tail -50 /var/log/auth.log | grep -i error
   ```

5. **If OAuth login failing**
   - Verify Google OAuth credentials in .env
   - Check redirect URI matches configured value
   - Test: https://accounts.google.com/signin/oauth/register

#### Scenario 2: SEC Filing Ingestion Hanging

**Check Process:**
```bash
# See if ingestion process is running
ps aux | grep ingest

# If stuck, find long-running queries
psql $DATABASE_URL << EOF
SELECT pid, query, EXTRACT(EPOCH FROM (now() - query_start)) as duration_sec
FROM pg_stat_activity
WHERE query ILIKE '%sec%' OR query ILIKE '%filing%';
EOF

# Kill if needed
SELECT pg_terminate_backend(pid);
```

#### Scenario 3: Dashboard Showing Wrong Data

**Clear Cache:**
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();

// Clear Next.js cache
rm -rf .next

// Restart dev server
npm run dev
```

**Verify Data:**
```sql
-- Check company record
SELECT * FROM companies WHERE id = 'company-id';

-- Check filings
SELECT filing_type, filing_date, COUNT(*) 
FROM filings 
WHERE company_id = 'company-id'
GROUP BY filing_type, filing_date;
```

### Browser DevTools Debugging

**Network Tab:**
1. Open DevTools → Network
2. Perform action that fails
3. Look for failed requests (red)
4. Click request → Response tab
5. Check error message

**Application Tab:**
1. Open DevTools → Application
2. Check Cookies → session token present?
3. Check Local Storage → auth data?
4. Check IndexedDB → cache data?

**Console Tab:**
1. Look for red errors (Uncaught exceptions)
2. Look for yellow warnings
3. Try commands: `console.log(window.location)` to verify URL

---

**Need Help?** Reference the main [Admin Panel Guide](./ADMIN_PANEL_GUIDE.md) or contact ops@ipoready.com
