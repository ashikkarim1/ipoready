# Board & Talent Marketplace - Implementation Guide

## Overview
This guide walks through implementing the Board & Talent Marketplace backend system with anti-circumvention finders fee logic.

## Files Created

### Database Schema
- **File:** `/migrations/022_board_talent_marketplace.sql`
- **Tables:** 4 core tables + 3 views + 1 function
- **Seed Data:** 15 realistic professionals

### API Routes

#### Professional Management
| Route | Method | File |
|-------|--------|------|
| `/api/professionals/register` | POST | `src/app/api/professionals/register/route.ts` |
| `/api/professionals/search` | GET | `src/app/api/professionals/search/route.ts` |
| `/api/professionals/[id]` | GET | `src/app/api/professionals/[id]/route.ts` |
| `/api/professionals/verify` | POST | `src/app/api/professionals/verify/route.ts` |
| `/api/professionals/recommendations` | GET | `src/app/api/professionals/recommendations/route.ts` |

#### Introduction Management
| Route | Method | File |
|-------|--------|------|
| `/api/introductions/request` | POST | `src/app/api/introductions/request/route.ts` |
| `/api/introductions/[id]/accept` | POST | `src/app/api/introductions/[id]/accept/route.ts` |

#### Hiring & Fee Calculation (Anti-Circumvention Core)
| Route | Method | File |
|-------|--------|------|
| `/api/hiring/confirm` | POST | `src/app/api/hiring/confirm/route.ts` |
| `/api/hiring/[id]/calculate-fees` | POST | `src/app/api/hiring/[id]/calculate-fees/route.ts` |

#### Professional Statistics
| Route | Method | File |
|-------|--------|------|
| `/api/professional-stats/referral-earnings` | GET | `src/app/api/professional-stats/referral-earnings/route.ts` |

### Utilities
- **File:** `src/lib/marketplace-utils.ts`
- **Functions:** Fee calculations, validation, matching logic

### Documentation
- **API Docs:** `BOARD_TALENT_MARKETPLACE_API.md`
- **Tests:** `test-board-talent-marketplace.sql`
- **This Guide:** `MARKETPLACE_IMPLEMENTATION_GUIDE.md`

## Deployment Steps

### 1. Apply Database Migration
```bash
# Connect to your Neon database and run:
psql $DATABASE_URL < migrations/022_board_talent_marketplace.sql
```

This will:
- Create 4 tables (professionals, professional_introductions, hiring_confirmations, professional_referrals)
- Create 3 views for easy querying
- Create 1 function for fee verification
- Add triggers for automatic timestamp updates
- Seed 15 realistic professionals with varied expertise

### 2. Verify Migration Success
```bash
# Run verification queries:
psql $DATABASE_URL < test-board-talent-marketplace.sql
```

Expected results:
- 15 professionals (all verified)
- All indexes created
- Views and functions available

### 3. Test API Routes Locally
```bash
npm run dev
```

Then test endpoints:
```bash
# 1. Search professionals
curl "http://localhost:3000/api/professionals/search?industry=Technology&verified=true"

# 2. Get recommendations
curl "http://localhost:3000/api/professionals/recommendations?company_id=<your-company-uuid>&role=director"

# 3. Register new professional
curl -X POST http://localhost:3000/api/professionals/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "professionalTitle": "Board Director",
    "yearsPublicExperience": 10
  }'
```

### 4. Authentication Setup

All routes use NextAuth with the existing auth configuration:

```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
```

Required for protected endpoints:
- User must have active session
- Company user roles: access company data
- Admin role: verify professionals, calculate fees

### 5. Environment Variables
No additional environment variables needed - uses existing:
- `DATABASE_URL`: Neon PostgreSQL connection
- `NEXTAUTH_*`: Existing auth config

## Anti-Circumvention Logic Deep Dive

### Problem Solved
Companies could hire professionals through IPOReady, but then pay them directly off-platform to avoid the 2% finders fee.

### Solution: Dual-Confirmation Matching
The system requires BOTH parties to submit identical compensation packages:

1. **Company Submits First**
   ```json
   {
     "introductionId": "uuid",
     "hireDate": "2026-07-15",
     "position": "Audit Committee Member",
     "compensationPackage": {
       "cash": 50000,
       "bonus": 10000
     },
     "confirmedByRole": "company"
   }
   ```

2. **Professional Submits Identical Package**
   ```json
   {
     "introductionId": "uuid",
     "hireDate": "2026-07-15",
     "position": "Audit Committee Member",
     "compensationPackage": {
       "cash": 50000,
       "bonus": 10000  // Must match company's amount
     },
     "confirmedByRole": "professional"
   }
   ```

3. **System Verifies Match**
   - Compares all compensation components
   - If match → Finders fee is due ($60,000 × 2% = $1,200)
   - If mismatch → Marked as disputed for manual resolution

4. **Fee Automatically Calculated**
   - Invoice generated within the system
   - Payment due within 30 days
   - Escalation for overdue payments

### Dispute Resolution
If compensation doesn't match:
```json
{
  "error": "Compensation packages do not match",
  "details": {
    "companyPackage": {"cash": 50000, "bonus": 10000},
    "professionalPackage": {"cash": 50000, "bonus": 15000}
  },
  "action": "Marked as disputed - requires manual resolution"
}
```

Admin must manually review and resolve before closing the record.

## Fee Structure

### Finders Fee
- **Rate:** 2% of total compensation
- **Base:** Cash + Bonus (excludes equity)
- **Example:** $60,000 total → $1,200 finders fee
- **Timing:** Due within 30 days of confirmation match
- **Recipient:** IPOReady platform

### Referral Commission
- **Rate:** 10% of finders fee
- **Base:** Professional-to-professional referrals
- **Example:** $1,200 finders fee → $120 referral commission
- **Timing:** Earned when hire is confirmed, paid when IPOReady receives payment
- **Recipient:** Referring professional

### Examples
| Scenario | Compensation | Finders Fee | Referral Commission |
|----------|--------------|------------|-------------------|
| Board Member | $50k + $10k = $60k | $1,200 | $120 |
| Senior Director | $75k + $15k = $90k | $1,800 | $180 |
| Executive | $100k + $30k = $130k | $2,600 | $260 |
| VP/C-Suite | $150k + $50k = $200k | $4,000 | $400 |

## Testing Workflow

### Manual Testing Checklist

```markdown
## 1. Professional Registration
- [ ] Create new professional via POST /api/professionals/register
- [ ] Verify email uniqueness (duplicate should fail with 409)
- [ ] Check professional is created with "unverified" status
- [ ] Verify all fields stored correctly

## 2. Professional Verification
- [ ] Admin verifies professional via POST /api/professionals/verify
- [ ] Status changes from "unverified" to "verified"
- [ ] verified_at timestamp is set
- [ ] verified_by_user_id is recorded

## 3. Search & Discovery
- [ ] Search by industry returns matching professionals
- [ ] Search by region returns matching professionals
- [ ] Search by experience filters correctly
- [ ] Limit and offset pagination works
- [ ] Verified-only filter works

## 4. Smart Matching
- [ ] GET /api/professionals/recommendations returns top 3
- [ ] Match scores are calculated (0-100)
- [ ] Industry match boosts score
- [ ] Experience is considered
- [ ] Results sorted by relevance

## 5. Introduction Workflow
- [ ] Company requests introduction via POST /api/introductions/request
- [ ] Introduction created with "pending" status
- [ ] Professional can see pending introductions
- [ ] Professional accepts via POST /api/introductions/[id]/accept
- [ ] Status changes to "accepted"
- [ ] responded_at timestamp recorded

## 6. Anti-Circumvention Core (Critical)
- [ ] Company submits hire confirmation
- [ ] Professional submits different compensation → Marked as "disputed"
- [ ] Professional submits matching compensation → Both confirmed
- [ ] Admin calculates fees → Fee amount calculated
- [ ] Email sent to company about fee due
- [ ] Payment status updated to "invoice_sent"

## 7. Fee Calculations
- [ ] $60,000 total → $1,200 finders fee (2%)
- [ ] $1,200 finders fee → $120 referral commission (10%)
- [ ] Multiple scenarios tested (various compensation levels)
- [ ] Equity not included in fee calculation

## 8. Professional Stats
- [ ] Professional views referral earnings
- [ ] Pending/earned/paid commissions tracked
- [ ] Direct hiring finders fees shown
- [ ] Commission history displays correctly
```

## Integration with Existing Systems

### User Authentication
Routes integrate with existing NextAuth:
```typescript
const session = await getServerSession(authOptions)
const user = session?.user as { id?: string; companyId?: string; role?: string }
```

### Database Connection
Uses existing Neon database client:
```typescript
import { sql } from '@/lib/db'
```

### Company Association
Professionals are matched with companies via:
- `professional_introductions.company_id`
- `hiring_confirmations.company_id`
- Requires `user.companyId` from session

### Email Notifications (Future)
When fees are calculated, send emails to:
- Company: "IPOReady finders fee of $X is due within 30 days"
- Professional: "Your hire for [Company] is confirmed - commission earned"

## Performance Considerations

### Indexes Created
- `professionals.email` - for unique constraint
- `professionals.verification_status` - for admin workflows
- `professionals.industries` - GIN index for array searches
- `professionals.regions` - GIN index for array searches
- `professional_introductions.company_id` - for company queries
- `professional_introductions.status` - for filtering
- `hiring_confirmations.company_id` - for company queries
- `hiring_confirmations.payment_status` - for billing queries
- Plus many others for optimal query performance

### Query Optimization
- Search uses indexed columns
- Array queries use PostgreSQL GIN indexes
- Recommendations caches calculation in memory
- Views pre-aggregate common queries

## Security Considerations

### Authentication
- All endpoints require NextAuth session (except register)
- Role-based access control for admin functions
- Company ID verified for company-owned resources
- Professional email verified for professional-owned resources

### Data Validation
- Email format validated
- UUID format validated
- Compensation packages validated
- Status values validated against enum

### Anti-Circumvention
- Dual-confirmation prevents fee evasion
- Package matching prevents amount misstatement
- Dispute detection flags non-matching records
- Manual review required for conflicts

## Monitoring & Maintenance

### Key Metrics to Track
```sql
-- Monthly new professionals
SELECT DATE_TRUNC('month', created_at) as month, COUNT(*) as new_professionals
FROM professionals GROUP BY month ORDER BY month DESC;

-- Introduction success rate
SELECT
  status,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM professional_introductions), 2) as percentage
FROM professional_introductions
GROUP BY status;

-- Fee collection status
SELECT
  payment_status,
  COUNT(*) as count,
  SUM(COALESCE(finders_fee_amount, 0)) as total_fees
FROM hiring_confirmations
GROUP BY payment_status;

-- Disputed cases
SELECT
  COUNT(*) as disputed_count,
  COUNT(CASE WHEN is_disputed THEN 1 END) as dispute_count
FROM hiring_confirmations;
```

## Troubleshooting

### Migration Fails
**Problem:** Foreign key constraint error  
**Solution:** Ensure `users` and `companies` tables exist (they should from Phase 1)

### Routes Return 404
**Problem:** Routes not found  
**Solution:** Ensure files are in correct path and Next.js is restarted

### Authentication Errors
**Problem:** Routes return 401 Unauthorized  
**Solution:** Verify NextAuth session is active via `npm run dev` and browser session

### Database Connection
**Problem:** "no rows returned" from query  
**Solution:** Verify migration was applied with `psql $DATABASE_URL < migrations/022_board_talent_marketplace.sql`

## Next Steps (Phase 2)

- [ ] Stripe integration for payment collection
- [ ] Email notifications for all state changes
- [ ] Professional review/rating system
- [ ] Dashboard for marketplace activity
- [ ] Analytics and reporting
- [ ] Batch verification workflows
- [ ] Advanced filtering (saved searches)
- [ ] Professional profile enrichment (LinkedIn scraping)
- [ ] Compliance certifications database
- [ ] Multi-language support (FR)
