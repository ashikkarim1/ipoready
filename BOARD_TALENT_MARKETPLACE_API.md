# Board & Talent Marketplace API Documentation

Central hub for connecting IPO-ready companies with qualified board members and executive talent.

## Overview

The Board & Talent Marketplace enables:
- Registration and verification of professional board members
- Smart matching of professionals to company needs
- Introduction requests with anti-circumvention finders fee logic
- Dual-confirmation hiring process ensuring fee collection
- Referral commission tracking (10% of finders fee)

## Database Schema

### professionals
Stores board members and executive talent profiles

```sql
- id: UUID (primary key)
- name, email, phone: Contact info
- linkedin_url, linkedin_verified: LinkedIn integration
- professional_title, years_public_experience: Qualifications
- industries, regions: Arrays for matching
- rate_expectations_annual, rate_expectations_hourly: Compensation
- bio, past_board_positions (JSONB), certifications: Background
- verification_status: 'unverified' | 'verified' | 'rejected'
- created_at, updated_at
```

### professional_introductions
Tracks introduction requests from companies to professionals

```sql
- id: UUID
- professional_id, company_id, requested_by_user_id: Foreign keys
- role_seeking: Position type
- message: Introduction message
- status: 'pending' | 'accepted' | 'rejected' | 'hired' | 'cancelled'
- created_at, updated_at
```

### hiring_confirmations (ANTI-CIRCUMVENTION CORE)
Implements dual-confirmation logic to prevent fee evasion

```sql
- id: UUID
- introduction_id, professional_id, company_id: Foreign keys
- hire_date, position: Hire details
- compensation_package (JSONB): {cash, bonus, equity}
- confirmed_by_company: boolean (true when company confirms)
- confirmed_by_professional: boolean (true when professional confirms)
- company_compensation_package: Company's stated compensation
- professional_compensation_package: Professional's stated compensation
- finders_fee_amount: 2% of total compensation (calculated when match)
- referral_commission_amount: 10% of finders fee (calculated)
- payment_status: 'pending' | 'invoice_sent' | 'paid' | 'disputed'
- is_disputed: boolean (true if packages don't match)
- created_at, updated_at
```

**Anti-Circumvention Logic:**
1. Company confirms hire with compensation package
2. Professional confirms same hire with their compensation package
3. If packages match → Finders fee is due ($X, 2% of total comp)
4. If packages don't match → Flagged as disputed for manual resolution
5. Payment due within 30 days

### professional_referrals
Tracks referral commissions when professionals refer other professionals

```sql
- id: UUID
- referrer_id, referred_id: Professional UUIDs
- hiring_confirmation_id: Link to the hire that generated commission
- referral_commission: 10% of finders fee
- status: 'pending' | 'earned' | 'paid'
- created_at, updated_at
```

## API Endpoints

### Professionals Management

#### POST /api/professionals/register
Register a new professional

**Request:**
```json
{
  "name": "Sarah Chen",
  "email": "sarah.chen@example.com",
  "phone": "+1-416-555-0101",
  "linkedinUrl": "https://linkedin.com/in/sarahchen",
  "professionalTitle": "Board Director",
  "yearsPublicExperience": 12,
  "industries": ["Technology", "SaaS"],
  "regions": ["Toronto", "San Francisco"],
  "rateExpectationsAnnual": 75000,
  "rateExpectationsHourly": 350,
  "bio": "Serial entrepreneur with 12 years of public company board experience",
  "certifications": ["CPA", "Chartered Director"],
  "yearsOfExperience": 22
}
```

**Response (201):**
```json
{
  "message": "Professional registered successfully",
  "professional": {
    "id": "uuid",
    "name": "Sarah Chen",
    "email": "sarah.chen@example.com",
    "professionalTitle": "Board Director",
    "verificationStatus": "unverified",
    "createdAt": "2026-06-04T10:00:00Z"
  }
}
```

#### GET /api/professionals/search
Search professionals with flexible filters

**Query Parameters:**
- `role`: Professional title keywords (partial match)
- `industry`: Industry name (comma-separated)
- `region`: Region name (comma-separated)
- `experience`: Minimum years of public experience
- `verified`: true/false (only verified professionals)
- `limit`: Results per page (default: 20, max: 100)
- `offset`: Pagination offset (default: 0)

**Example:**
```
GET /api/professionals/search?industry=Technology,Finance&region=Toronto&experience=10&verified=true&limit=20
```

**Response (200):**
```json
{
  "professionals": [
    {
      "id": "uuid",
      "name": "Sarah Chen",
      "professionalTitle": "Board Director",
      "industries": ["Technology", "SaaS"],
      "regions": ["Toronto", "San Francisco"],
      "yearsPublicExperience": 12,
      "rateExpectationsAnnual": 75000,
      "bio": "Serial entrepreneur...",
      "verificationStatus": "verified",
      "linkedinVerified": true
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 150,
    "hasMore": true
  }
}
```

#### GET /api/professionals/[id]
Get full professional profile

**Response (200):**
```json
{
  "professional": {
    "id": "uuid",
    "name": "Sarah Chen",
    "email": "sarah.chen@example.com",
    "phone": "+1-416-555-0101",
    "linkedinUrl": "https://linkedin.com/in/sarahchen",
    "linkedinVerified": true,
    "professionalTitle": "Board Director",
    "yearsPublicExperience": 12,
    "industries": ["Technology", "SaaS"],
    "regions": ["Toronto", "San Francisco"],
    "rateExpectationsAnnual": 75000,
    "rateExpectationsHourly": 350,
    "bio": "Serial entrepreneur...",
    "pastBoardPositions": [
      {
        "title": "Board Director",
        "company": "TechScale Inc.",
        "years": 4,
        "description": "Led Audit Committee"
      }
    ],
    "certifications": ["CPA", "Chartered Director"],
    "yearsOfExperience": 22,
    "verificationStatus": "verified",
    "verifiedAt": "2026-06-04T10:00:00Z",
    "createdAt": "2026-06-04T09:00:00Z",
    "updatedAt": "2026-06-04T10:00:00Z"
  }
}
```

#### POST /api/professionals/verify
**Admin only** - Verify or reject a professional

**Request:**
```json
{
  "professionalId": "uuid",
  "status": "verified",
  "notes": "LinkedIn verified, excellent board track record"
}
```

**Response (200):**
```json
{
  "message": "Professional verified successfully",
  "professional": {
    "id": "uuid",
    "name": "Sarah Chen",
    "verificationStatus": "verified",
    "verifiedAt": "2026-06-04T10:00:00Z"
  }
}
```

#### GET /api/professionals/recommendations
Smart matching recommendations for company needs

**Query Parameters:**
- `company_id`: Company UUID (required)
- `role`: Role seeking (e.g., "director", "audit committee")
- `industry`: Company industry for matching
- `region`: Preferred region
- `limit`: Number of recommendations (default: 3, max: 10)

**Example:**
```
GET /api/professionals/recommendations?company_id=uuid&role=audit%20committee&industry=Tech&region=Toronto&limit=3
```

**Response (200):**
```json
{
  "company": {
    "id": "uuid",
    "name": "TechCorp Inc."
  },
  "recommendations": [
    {
      "id": "uuid",
      "name": "Sarah Chen",
      "professionalTitle": "Board Director",
      "industries": ["Technology", "SaaS"],
      "regions": ["Toronto", "San Francisco"],
      "yearsPublicExperience": 12,
      "rateExpectationsAnnual": 75000,
      "certifications": ["CPA", "Audit Committee Expertise"],
      "matchScore": 92
    },
    {
      "id": "uuid",
      "name": "James Mitchell",
      "professionalTitle": "Board Chair - Compensation",
      "yearsPublicExperience": 15,
      "matchScore": 87
    }
  ],
  "metadata": {
    "totalMatched": 15,
    "criteria": {
      "role": "audit committee",
      "industry": "Tech",
      "region": "Toronto"
    }
  }
}
```

### Introductions

#### POST /api/introductions/request
Request introduction to a professional

**Requires:** Authentication, user's company match

**Request:**
```json
{
  "professionalId": "uuid",
  "companyId": "uuid",
  "roleSeeking": "Board Member - Audit Committee",
  "message": "We're looking for an experienced audit committee member..."
}
```

**Response (201):**
```json
{
  "message": "Introduction request sent successfully",
  "introduction": {
    "id": "uuid",
    "professionalId": "uuid",
    "companyId": "uuid",
    "roleSeeking": "Board Member - Audit Committee",
    "status": "pending",
    "introductionDate": "2026-06-04T10:00:00Z"
  }
}
```

#### POST /api/introductions/[id]/accept
Professional accepts an introduction request

**Requires:** Authentication as the invited professional

**Response (200):**
```json
{
  "message": "Introduction accepted successfully",
  "introduction": {
    "id": "uuid",
    "status": "accepted",
    "respondedAt": "2026-06-04T10:30:00Z"
  }
}
```

### Hiring & Fees (Anti-Circumvention Core)

#### POST /api/hiring/confirm
Confirm hiring details - Both company and professional must call this

**Requires:** Authentication, introduction must be accepted

**Request:**
```json
{
  "introductionId": "uuid",
  "hireDate": "2026-07-15",
  "position": "Board Member - Audit Committee",
  "compensationPackage": {
    "cash": 50000,
    "bonus": 10000,
    "equity": {
      "shares": 1000,
      "vesting_years": 4
    }
  },
  "confirmedByRole": "company"
}
```

**Response (200):**
```json
{
  "message": "Confirmation recorded for company - Both parties confirmed. Fees will be calculated.",
  "hiringConfirmation": {
    "id": "uuid",
    "hireDate": "2026-07-15",
    "position": "Board Member - Audit Committee",
    "compensationPackage": {
      "cash": 50000,
      "bonus": 10000,
      "equity": {"shares": 1000, "vesting_years": 4}
    },
    "confirmedByCompany": true,
    "confirmedByProfessional": true,
    "bothConfirmed": true,
    "paymentStatus": "pending",
    "isDisputed": false
  }
}
```

#### POST /api/hiring/[id]/calculate-fees
**Admin only** - Calculate finders fee when both parties confirm

**Anti-Circumvention Check:**
- Verifies both parties have confirmed
- Compares compensation packages
- If match → Calculates 2% finders fee
- If mismatch → Marks as disputed

**Response (200):**
```json
{
  "message": "Fees calculated successfully",
  "feeCalculation": {
    "hiringConfirmationId": "uuid",
    "totalCompensation": 60000,
    "findersFeeAmount": 1200,
    "findersFeePercentage": "2%",
    "referralCommissionAmount": 120,
    "referralCommissionPercentage": "10% of finders fee",
    "paymentStatus": "invoice_sent",
    "dueDate": "2026-07-04"
  },
  "nextSteps": [
    "Invoice will be generated and sent to company",
    "Payment of $1,200 is due within 30 days",
    "Referral commission of $120 tracked separately"
  ]
}
```

**Response (409) - Mismatch:**
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

### Professional Stats

#### GET /api/professional-stats/referral-earnings
Get professional's referral earnings and commission tracking

**Requires:** Authentication as professional

**Response (200):**
```json
{
  "professional": {
    "id": "uuid",
    "name": "Sarah Chen"
  },
  "referralEarnings": {
    "pendingCommission": 250,
    "earnedCommission": 1200,
    "paidCommission": 500,
    "totalReferralEarnings": 1950
  },
  "directFindersFees": {
    "totalFindersFees": 3600,
    "hireCount": 2
  },
  "combinedEarnings": {
    "totalEarnings": 5550
  },
  "referralHistory": [
    {
      "id": "uuid",
      "referredProfessional": "James Mitchell",
      "company": "TechCorp Inc.",
      "hireDate": "2026-06-15",
      "commission": 120,
      "status": "earned",
      "earnedDate": "2026-07-15",
      "paidDate": null
    }
  ],
  "directHiringHistory": [
    {
      "id": "uuid",
      "company": "TechCorp Inc.",
      "hireDate": "2026-05-20",
      "findersFee": 1800,
      "status": "paid"
    }
  ],
  "summary": {
    "totalReferrals": 3,
    "totalDirectHires": 2,
    "commissionRate": "10% of finders fee",
    "findersFeeRate": "2% of total compensation"
  }
}
```

## Fee Calculation Examples

### Example 1: Board Member Hire
- Compensation: $50,000 cash + $10,000 bonus = $60,000 total
- Finders Fee: $60,000 × 2% = **$1,200**
- Referral Commission: $1,200 × 10% = **$120**
- Payment Due: Within 30 days from confirmation

### Example 2: Executive Hire
- Compensation: $150,000 cash + $30,000 bonus + 2,000 shares = $180,000 total
- Finders Fee: $180,000 × 2% = **$3,600**
- Referral Commission: $3,600 × 10% = **$360**
- Payment Due: Within 30 days from confirmation

### Example 3: Dispute Scenario
- Company confirms: $100,000 cash + $20,000 bonus
- Professional confirms: $100,000 cash + $25,000 bonus
- **Result:** Mismatch detected → Marked as disputed
- **Action:** Manual resolution required

## Anti-Circumvention Mechanism

The system prevents companies from hiring professionals through IPOReady then paying them directly to avoid finders fees:

1. **Dual Confirmation Required**
   - Company submits: hire date, position, full compensation
   - Professional submits: same hire date, position, compensation
   - Both must match for fee to be due

2. **Package Matching**
   - System compares all compensation components
   - If any component differs → Marked as disputed
   - Requires manual intervention to resolve

3. **30-Day Payment Window**
   - Invoice generated immediately upon confirmation match
   - Payment due within 30 days
   - Tracking and escalation for overdue payments

4. **Dispute Resolution**
   - Automated detection of mismatches
   - Manual review by admin
   - Communication with both parties
   - Resolution required before payment closure

## Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request | Check required fields and formats |
| 401 | Unauthorized | Ensure authentication session is valid |
| 403 | Forbidden | Verify user role/permissions for action |
| 404 | Not Found | Check that referenced IDs exist |
| 409 | Conflict | Duplicate or incompatible record exists |
| 500 | Server Error | Contact support with error details |

## Testing the Marketplace

### Quick Start
1. Register 2-3 professionals via POST /api/professionals/register
2. Admin verifies professionals via POST /api/professionals/verify
3. Company searches for professionals via GET /api/professionals/search
4. Company requests introduction via POST /api/introductions/request
5. Professional accepts via POST /api/introductions/[id]/accept
6. Both confirm hire via POST /api/hiring/confirm (company first, then professional)
7. Admin calculates fees via POST /api/hiring/[id]/calculate-fees
8. Verify fees are correct and payment status updated

### Seed Data Included
15 realistic professionals with:
- Varied experience levels (7-15 years)
- Multiple industries (Tech, Finance, Healthcare, Energy, Real Estate, Consumer Goods, etc.)
- Different regions (Toronto, NYC, San Francisco, London, Calgary, etc.)
- Realistic compensation ranges based on ISS/Radford benchmarks
- Board position history and certifications

## Future Enhancements (Phase 2)

- Email notifications for fee collection
- Stripe integration for payment processing
- Dashboard for marketplace activity
- Analytics on match success rates
- Professional review/rating system
- Batch verification workflows
- API webhook notifications
- Advanced filtering and saved searches
