# CORS & CSRF Implementation Checklist

Track progress as you apply CORS and CSRF protection across the codebase.

---

## Phase 1: Core Setup (Completed)

- [x] Update `next.config.js` with CORS headers
- [x] Create `src/lib/middleware/csrf.ts` with token generation/validation
- [x] Create `src/lib/middleware/auth.ts` for authentication checks
- [x] Create `src/lib/middleware/cors.ts` for origin validation
- [x] Create `src/lib/middleware/index.ts` for middleware composition
- [x] Create `src/app/api/csrf/route.ts` for token issuing
- [x] Create `src/lib/csrf.ts` for client-side token management
- [x] Create `src/lib/hooks/useCsrf.ts` React hook
- [x] Create example API route: `src/app/api/example/secure/route.ts`
- [x] Create documentation: `CSRF_CORS_SETUP.md`

---

## Phase 2: API Route Migration

### Critical API Routes (Whitelist Exceptions)
- [ ] `/api/auth/*` - NextAuth endpoints (skip CSRF)
- [ ] `/api/webhooks/*` - Stripe webhooks (use signature verification)
- [ ] `/api/health` - Health checks (skip CSRF)

### High Priority (Financial/Security)
- [ ] `/api/billing/*` - Stripe integration
  - [ ] POST billing updates → Add CSRF validation
  - [ ] POST webhook handler → Keep whitelisted (signature-based)
  
- [ ] `/api/team/*` - Team management
  - [ ] POST invite → Add CSRF validation
  - [ ] DELETE member → Add CSRF validation
  - [ ] PATCH roles → Add CSRF validation

- [ ] `/api/documents/*` - Document management
  - [ ] POST upload → Add CSRF validation
  - [ ] DELETE document → Add CSRF validation
  - [ ] PATCH metadata → Add CSRF validation

### Medium Priority (User Data)
- [ ] `/api/account/*` - Account settings
  - [ ] PATCH profile → Add CSRF validation
  - [ ] PATCH settings → Add CSRF validation
  - [ ] POST verify-email → Add CSRF validation

- [ ] `/api/company/*` - Company data
  - [ ] PATCH details → Add CSRF validation
  - [ ] POST setup-wizard → Add CSRF validation

- [ ] `/api/checklist/*` - Checklist updates
  - [ ] PATCH item status → Add CSRF validation
  - [ ] POST completion → Add CSRF validation

### Low Priority (Read-Only/Notifications)
- [ ] `/api/notifications/*` - Notifications
  - [ ] GET list → Keep as-is (read-only)
  - [ ] DELETE notification → Add CSRF validation
  - [ ] PATCH preferences → Add CSRF validation

- [ ] `/api/predictions/*` - Predictions
  - [ ] GET analysis → Keep as-is (read-only)
  - [ ] POST refresh → Add CSRF validation

- [ ] `/api/cap-table/*` - Cap table data
  - [ ] GET data → Keep as-is (read-only)
  - [ ] POST update → Add CSRF validation
  - [ ] PATCH metadata → Add CSRF validation

---

## Phase 3: Form Integration

### Dashboard Components
- [ ] Account settings form → Use `useCsrf()` hook
- [ ] Team invite form → Use `useCsrf()` hook
- [ ] Document upload form → Use `useCsrf()` hook
- [ ] Company details form → Use `useCsrf()` hook
- [ ] Checklist action buttons → Use `useCsrf()` hook

### Modals & Dialogs
- [ ] Edit dialogs → Inject token on open
- [ ] Confirmation modals → Inject token before submit
- [ ] Batch action forms → Inject token on selection

### Lists & Tables
- [ ] Action buttons (delete, edit, archive) → Use `useCsrf()` hook
- [ ] Bulk actions → Inject token in batch request
- [ ] Inline editing → Inject token on save

---

## Phase 4: Integration Examples

### Form Pattern
```tsx
// Components using forms need this pattern:
import { useCsrf } from '@/lib/hooks/useCsrf'

export function MyForm() {
  const { token, isLoading } = useCsrf()
  
  return (
    <form onSubmit={handleSubmit}>
      {!isLoading && (
        <input type="hidden" name="csrf_token" value={token} />
      )}
      {/* form fields */}
    </form>
  )
}
```

- [ ] Account settings form (`/dashboard/account`)
- [ ] Team invite form (`/dashboard/team`)
- [ ] Billing form (`/dashboard/account/billing`)
- [ ] Company setup form (`/trial/*`)
- [ ] Document upload form (`/dashboard/documents`)

### Fetch Pattern
```tsx
// Components using fetch need this pattern:
import { useCsrf } from '@/lib/hooks/useCsrf'

export function MyComponent() {
  const { fetch: csrfFetch } = useCsrf()
  
  const handleAction = async () => {
    const response = await csrfFetch('/api/endpoint', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
}
```

- [ ] Action buttons in tables
- [ ] Modal form submissions
- [ ] Batch actions
- [ ] Notification actions
- [ ] Team management actions

### API Route Pattern
```typescript
// All POST/PUT/DELETE/PATCH routes need this pattern:
import { validateCsrfMiddleware } from '@/lib/middleware/csrf'
import { requireCompany } from '@/lib/middleware/auth'
import { withCors } from '@/lib/middleware/cors'

export async function POST(req: NextRequest) {
  const corsError = await withCors(req)
  if (corsError) return corsError
  
  const authCheck = await requireCompany(req)
  if (!authCheck.valid) return NextResponse.json({ error: authCheck.error }, { status: 401 })
  
  const csrfError = await validateCsrfMiddleware(req)
  if (csrfError) return csrfError
  
  // Process request
}
```

- [ ] `/api/billing/*` routes
- [ ] `/api/team/*` routes
- [ ] `/api/documents/*` routes
- [ ] `/api/account/*` routes
- [ ] `/api/company/*` routes
- [ ] `/api/checklist/*` routes
- [ ] `/api/cap-table/*` routes
- [ ] `/api/notifications/*` routes

---

## Phase 5: Testing

### Unit Tests
- [ ] `src/lib/middleware/csrf.ts`
  - [ ] generateCsrfToken() generates valid tokens
  - [ ] validateCsrfToken() accepts valid tokens
  - [ ] validateCsrfToken() rejects invalid tokens
  - [ ] validateCsrfToken() rejects expired tokens
  - [ ] Token cleanup removes old tokens

- [ ] `src/lib/middleware/auth.ts`
  - [ ] withAuth() accepts authenticated users
  - [ ] withAuth() rejects unauthenticated users
  - [ ] requireRole() enforces role restrictions
  - [ ] requireCompany() checks company access

- [ ] `src/lib/middleware/cors.ts`
  - [ ] Allowed origins pass validation
  - [ ] Blocked origins fail validation
  - [ ] Preflight requests return correct headers
  - [ ] Methods whitelist enforced

### Integration Tests
- [ ] POST request with valid CSRF token → succeeds
- [ ] POST request without CSRF token → returns 403
- [ ] POST request with invalid CSRF token → returns 403
- [ ] POST request with expired CSRF token → returns 403
- [ ] POST request from unauthorized origin → returns 403
- [ ] GET request (no CSRF needed) → succeeds
- [ ] OPTIONS preflight from allowed origin → succeeds
- [ ] OPTIONS preflight from blocked origin → fails

### E2E Tests
- [ ] Form submission with token injection → succeeds
- [ ] Fetch request with hook → succeeds
- [ ] Token auto-refresh on expiry → works
- [ ] Cross-origin form submission → fails gracefully
- [ ] Token not sent in request → fails with 403

---

## Phase 6: Verification & Cleanup

### Code Review Checklist
- [ ] All POST/PUT/DELETE/PATCH routes have CSRF validation
- [ ] All forms use `useCsrf()` hook or inject tokens
- [ ] No hardcoded CSRF tokens
- [ ] No tokens exposed in logs
- [ ] Error messages don't leak token information
- [ ] CORS headers match production domains
- [ ] Security headers present on all responses

### Security Verification
- [ ] Test CSRF attacks with curl/Postman → blocked
- [ ] Test CORS bypass attempts → blocked
- [ ] Check for token leakage in browser storage
- [ ] Verify HTTP-only cookie flag set
- [ ] Verify Secure flag in production
- [ ] Test IP mismatch detection
- [ ] Test token expiry enforcement

### Performance Verification
- [ ] Token endpoint response time < 100ms
- [ ] Token validation adds < 2ms overhead
- [ ] No duplicate token requests (caching works)
- [ ] Memory usage stable (cleanup works)
- [ ] No token leaks in memory

### Cleanup
- [ ] Remove old CSRF code if any
- [ ] Remove hardcoded tokens from examples
- [ ] Update API documentation
- [ ] Update team wiki/runbook
- [ ] Create incident response guide

---

## Phase 7: Deployment

### Pre-Deployment
- [ ] All tests passing (unit + integration + e2e)
- [ ] Code review completed
- [ ] Security review completed
- [ ] Performance benchmarks acceptable
- [ ] Staging environment tested

### Staging Deployment
- [ ] Deploy to staging
- [ ] Run full test suite
- [ ] Test with real users (if applicable)
- [ ] Monitor error logs
- [ ] Check CSRF token stats
- [ ] Verify CORS headers

### Production Deployment
- [ ] Create deployment plan
- [ ] Set up monitoring/alerting
- [ ] Prepare rollback plan
- [ ] Deploy to production
- [ ] Monitor logs for CSRF failures
- [ ] Monitor CORS rejections
- [ ] Check user feedback

### Post-Deployment
- [ ] Monitor metrics for 24 hours
- [ ] Check error rate (should be 0 CSRF errors)
- [ ] Verify token stats (`/api/csrf-stats`)
- [ ] Update runbook with any issues
- [ ] Schedule follow-up review

---

## Phase 8: Documentation & Training

- [ ] Update API documentation with CSRF requirements
- [ ] Document CORS policy for partners
- [ ] Create developer guide (CSRF_CORS_SETUP.md)
- [ ] Create troubleshooting guide
- [ ] Train team on new patterns
- [ ] Update security docs
- [ ] Create incident response guide

---

## Progress Tracking

### Overall Progress
```
Phase 1: Core Setup ...................... 100% (10/10)
Phase 2: API Route Migration ............. 0% (0/XX)
Phase 3: Form Integration ............... 0% (0/XX)
Phase 4: Integration Examples ........... 0% (0/XX)
Phase 5: Testing ........................ 0% (0/XX)
Phase 6: Verification & Cleanup ......... 0% (0/XX)
Phase 7: Deployment ..................... 0% (0/XX)
Phase 8: Documentation .................. 0% (0/XX)

Total: 10% (10/100)
```

### Next Steps
1. Create list of all API routes needing CSRF
2. Prioritize routes by security impact
3. Begin Phase 2 migration
4. Test each route as it's updated

---

## Notes

- Token generation uses `randomBytes()` for cryptographic randomness
- IP binding prevents token theft across networks
- Single-use pattern (tokens deleted after validation)
- HTTP-only cookies prevent XSS token theft
- Automatic cleanup runs every 1 hour
- Tokens expire after 24 hours
- Cache tokens in sessionStorage (not localStorage) for security
- Test CSRF protection with curl/Postman before production
