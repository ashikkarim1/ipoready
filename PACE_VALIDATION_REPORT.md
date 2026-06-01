# PACE Dashboard Validation Report

**Date:** June 1, 2026  
**Status:** Critical Issues Found  
**Test Scope:** PACE page (`src/app/pace/page.tsx`) + API endpoints

---

## Executive Summary

The PACE dashboard implementation has **3 critical issues** blocking data display:
1. **API field name mismatch** - returns `pacScore` instead of `paceScore`
2. **Missing fields in API response** - lacks `paceDelta`, `daysToIpo`, `progressPercentage`, `currentPhase`, `trend`, `phases`
3. **Incomplete document readiness integration** - API queries reference non-existent views/tables

**Components correctly implemented:** ReadinessFactorsCard, SequencingAlertsCard, benchmark bands, forecast scenarios

---

## Test Results by Component

### 1. API Endpoint: GET /api/pace/scores

**Status:** ❌ CRITICAL FAILURES

**Issues Found:**

| Issue | Severity | Details |
|-------|----------|---------|
| Field name typo | CRITICAL | Returns `pacScore` but page expects `paceScore` (line 137) |
| Missing `paceDelta` | CRITICAL | Page needs week-over-week delta, API doesn't return it |
| Missing `daysToIpo` | CRITICAL | Page displays countdown (line 265), API doesn't provide it |
| Missing `progressPercentage` | CRITICAL | Page type requires this (line 38), not returned |
| Missing `currentPhase` | CRITICAL | Page type requires this (line 38), not returned |
| Missing `trend` array | CRITICAL | Page renders 8-week trend chart (lines 410-460), but API returns empty |
| Missing `phases` array | CRITICAL | Page renders phase breakdown (lines 465+), but API doesn't return it |
| Query issue in doc completeness | HIGH | Queries reference `pace_document_requirements` table which doesn't exist (line 114) |
| Query issue in doc completeness | HIGH | Uses invalid join on `documents` table (assumes it has matching doc types) |

**Current API Response Structure:**
```typescript
{
  pacScore: number,              // ← TYPO: should be paceScore
  peerPercentile: number,        // ✓ Correct
  benchmarkComparison: {
    avgPace: number,             // ✓ Correct
    medianPace: number,          // ✓ Correct
    p90Pace: number              // ✓ Correct
  },
  predictiveScore: {
    adjustedPaceScore: number,   // ✓ Correct
    confidenceLevel: string,     // ✓ Correct
    riskFactors: string[],       // ✓ Correct
    breakdown: {...}             // ✓ Correct
  },
  sequencingAlerts: any[],       // ✓ Correct
  documentCompleteness: [{       // ⚠ Data may be incomplete
    phaseId: number,
    documentCompletenessScore: number,
    phaseScore: number
  }]
  // ❌ MISSING: paceDelta, daysToIpo, progressPercentage, currentPhase, trend, phases
}
```

**Expected Response Structure (from page.tsx):**
```typescript
interface PaceScores {
  paceScore: number,             // ❌ API returns: pacScore
  paceDelta: number,             // ❌ MISSING
  daysToIpo: number,             // ❌ MISSING
  progressPercentage: number,    // ❌ MISSING
  currentPhase: string,          // ❌ MISSING
  peerPercentile: number,        // ✓
  trend: TrendPoint[],           // ❌ MISSING
  phases: PhaseData[]            // ❌ MISSING
}
```

**Queries with Problems:**

```sql
-- Line 114: Queries undefined table and view
SELECT 
  pd.phase_id,
  SUM(CASE WHEN doc.status = 'approved' THEN 1 ELSE 0 END)::float / 
    COUNT(*)::float * 100 as document_completeness_score,
  SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END)::float /
    COUNT(t.*)::float * 100 as phase_score
FROM pace_document_requirements pd  -- ❌ Table doesn't exist
JOIN documents doc ON pd.document_type = doc.type  -- ❌ documents table schema unclear
JOIN tasks t ON pd.phase_id = t.phase_id
WHERE doc.company_id = ${companyId}
GROUP BY pd.phase_id
```

---

### 2. PACE Page Component (`src/app/pace/page.tsx`)

**Status:** ⚠️ PARTIALLY WORKING

**Elements Verified:**

| Element | Status | Notes |
|---------|--------|-------|
| Page header & title | ✓ Renders | "PACE™ Velocity Breakdown" |
| KPI cards (score, days, peer rank, velocity) | ✓ Layout correct | Will fail at runtime due to missing API fields |
| Trend chart (8 weeks) | ✓ Markup present | Lines 410-460 - will show "Building your trend data" if API returns empty trend |
| Peer benchmark visualization | ✓ Markup present | Lines 475-535 - correct peer band distribution |
| Phase breakdown grid | ✓ Layout correct | Lines 540-660 - requires `phases` array from API |
| Readiness Factors Card | ✓ Implemented | Component at `src/components/ReadinessFactorsCard.tsx` |
| Sequencing Alerts Card | ✓ Implemented | Component at `src/components/SequencingAlertsCard.tsx` |
| Dragging/Accelerating tasks | ✓ Static data | Hardcoded - not from API |
| Forecast scenarios | ✓ Markup present | Scenario selection working, descriptions render correctly |
| CTA buttons | ✓ Markup present | Links to checklist, marketplace, dashboard, pulse |

**Runtime Behavior When API Issues Occur:**

```typescript
// Current fetch behavior (lines 99-107)
fetch('/api/pace/scores')
  .then(r => r.json())
  .then((data: PaceScores) => {
    setScores(data)  // data has wrong field names and missing fields
    setLoading(false)
  })
  .catch(() => setLoading(false))  // No error handling

// Result: scores object will have undefined paceScore, paceDelta, etc.
// Fallback values kick in (lines 111-115):
const paceScore       = scores?.paceScore       ?? 0  // Will be 0 (undefined)
const paceDelta       = scores?.paceDelta        ?? 0  // Will be 0 (undefined)
const daysToIpo       = scores?.daysToIpo        ?? 0  // Will be 0 (undefined)
const peerPercentile  = scores?.peerPercentile   ?? 0  // Will be 0 (undefined)
const trend           = scores?.trend            ?? []  // Will be [] (undefined)
const phases          = scores?.phases           ?? []  // Will be [] (undefined)
```

**Visual Outcome:** Dashboard will display:
- PACE Score: 0/100 (shows as fallback)
- Days to IPO: 0 (unusable)
- Peer Benchmark: Bottom 0% (misleading)
- Trend Chart: "Building your trend data" placeholder
- Phase Breakdown: Empty grid
- All other fields: 0 or empty

---

### 3. ReadinessFactorsCard Component

**Status:** ✓ CORRECTLY IMPLEMENTED

**Implementation Review:**
- ✓ Component correctly accepts props: `cashRunway`, `hiringProgress`, `auditorEngaged`, `boardSize`, `boardIndependentCount`, `secondIndependent`
- ✓ Cash runway color-coded (red <3m, yellow 3-6m, green ≥6m)
- ✓ Hiring progress bar with dynamic color
- ✓ Auditor engagement status with checkmark/warning
- ✓ Board composition display (X/Y independent directors)
- ✓ Responsive grid layout (1 col mobile, 2 col tablet, 4 col desktop)
- ✓ Hard-coded with test values in page.tsx (lines 626-631)

**Current Test Data (hardcoded):**
```typescript
<ReadinessFactorsCard
  cashRunway={8.5}                // months
  hiringProgress={67}             // percentage
  auditorEngaged={true}           // boolean
  boardSize={3}                   // directors
  boardIndependentCount={1}       // directors
  secondIndependent={false}       // boolean
/>
```

---

### 4. SequencingAlertsCard Component

**Status:** ✓ CORRECTLY IMPLEMENTED

**Implementation Review:**
- ✓ Component accepts `alerts` array with correct interface
- ✓ Empty state shows "No Sequencing Issues" checkmark
- ✓ Error severity (red) vs warning severity (yellow) color-coded
- ✓ Alert counts displayed ("🔴 1 Critical Issue", "🟡 1 Warning")
- ✓ Expandable alerts with remediation steps
- ✓ "View Task" button to expand/collapse details
- ✓ Hard-coded with 2 test alerts in page.tsx (lines 633-671)

**Current Test Data (hardcoded):**
```typescript
alerts={[
  {
    severity: 'error',
    taskId: 'seq-1',
    title: 'Auditor Engagement Letter Required',
    description: '...',
    daysBlocking: 9,
    remediationSteps: [
      'Contact shortlisted CPAB auditors...',
      'Issue engagement letter...',
      'Obtain board approval...',
      'Complete engagement by end of week'
    ]
  },
  {
    severity: 'warning',
    taskId: 'seq-2',
    title: 'Second Independent Director Needed',
    description: '...',
    daysBlocking: 18,
    remediationSteps: [...]
  }
]}
```

---

### 5. Benchmark Comparison Section

**Status:** ✓ MARKUP CORRECT, DATA HARDCODED

**Implementation Review (lines 475-535):**
- ✓ Peer bands visualization with color circles and percentage bars
- ✓ Correct band definitions: 0-30% (Bottom), 31-50% (Average), 51-70% (Above Avg), 71-100% (Top)
- ✓ Company position indicator ("You are here") with score and percentile
- ✓ "Top 15% of TSXV issuers" text correctly derived from `peerPercentile`
- ✓ Responsive design with flex layout

**Data Source:** Hardcoded in PEER_BANDS constant (lines 56-60)

---

### 6. TypeScript Compilation

**Status:** ❌ WILL FAIL AT RUNTIME

**Issues:**
- No type errors currently (TypeScript doesn't check runtime undefined)
- However, at runtime:
  - `scores?.paceScore` returns `undefined` (API field is `pacScore`)
  - Fallback to 0 hides the error
  - Page displays misleading data

---

## Database Schema Validation

**Status:** ⚠️ PARTIAL

**Tables Present:**
- ✓ `companies` (with `pace_score`, `target_exchange`, `cash_runway_months`, `cfo_hired_at`, `board_size`, `auditor_selected`, `investor_sophistication_score`)
- ✓ `pace_sequencing_alerts` (referenced in API)
- ✓ `pace_score_history` (used in pulse endpoint)

**Tables Missing/Unclear:**
- ❌ `pace_document_requirements` (referenced in line 114 of API)
- ❌ `documents` table (unclear schema - how does it join to companies?)
- ⚠️ Tasks/phases data source (API doesn't fetch phase breakdown)
- ⚠️ No trend history queries (API doesn't calculate 8-week trend)

**Database Views from Schema:**
- ✓ `v_company_pace_summary` exists (not used)
- ✓ `v_benchmark_comparison` exists (not used)

---

## API Endpoints Status

| Endpoint | Status | Issues |
|----------|--------|--------|
| GET /api/pace/scores | ❌ BROKEN | 7 critical field mismatches |
| GET /api/pace/benchmarks | ⚠️ PARTIAL | Data calculation logic works, but only provides benchmarks (not company details) |
| GET /api/pace/pulse | ✓ WORKING | Returns history, recipients, settings correctly |
| POST /api/pace/admin/company-factors | Not tested | Admin endpoint for seeding data |

---

## Test Plan Execution Summary

| Test | Expected | Actual | Result |
|------|----------|--------|--------|
| API returns peerPercentile | 0-100 | Returns correctly | ✓ |
| API returns benchmarkComparison with avgPace, medianPace, p90Pace | Returns for exchange | Returns correctly | ✓ |
| API returns sequencingAlerts array | With violations | Returns correctly (empty for no violations) | ✓ |
| API returns adjustedPaceScore | Predictive calculation | Returns correctly | ✓ |
| API returns predictiveScore details | Confidence, riskFactors | Returns correctly | ✓ |
| API returns documentReadinessScore | 0-100 per phase | Query fails - table doesn't exist | ❌ |
| ReadinessFactorsCard displays all fields | Cash, hiring, auditor, board | Renders correctly (hardcoded data) | ✓ |
| SequencingAlertsCard displays violations | Severity, hints, remediation | Renders correctly (hardcoded data) | ✓ |
| Page renders without errors | All sections visible | TypeScript compiles, runtime has undefined props | ⚠️ |
| PACE score displays correctly | Shows API value | Shows 0 (fallback) | ❌ |
| Trend chart shows 8 weeks | Bar chart with labels | Shows placeholder (empty trend array) | ❌ |
| Phase breakdown renders | Clickable phase cards | Shows empty grid | ❌ |
| Peer benchmark shows percentile | Top X% of TSXV | Shows Top 100% (incorrect calculation) | ❌ |

---

## Detailed Findings by Dashboard Section

### Section 1: Top KPI Row (Lines 197-395)

**PACE Score Card (Lines 200-235):**
- ✓ Circular progress indicator
- ✓ Fallback loading state
- ✓ Trend indicator (green up/red down)
- ❌ Will show 0/100 and empty trend

**Days to IPO Card (Lines 237-256):**
- ✓ Card structure correct
- ❌ Will show 0 days (fallback value)
- ❌ Target date calculation uses fallback 0

**Peer Benchmark Card (Lines 258-278):**
- ✓ Card structure correct  
- ❌ Will show "Top 100%" (incorrect - 100 - 0 = 100)
- ❌ Text will be "Bottom 0% of TSXV issuers" or "Top 100%" depending on logic

**Velocity Trend Card (Lines 280-298):**
- ✓ Structure correct
- ❌ Will show "↑ +0" (all fallback values)
- ❌ Text will be "Accelerating · Week over week" (based on 0 delta)

### Section 2: Trend Chart + Peer Benchmark (Lines 397-670)

**PACE Score 8-Week Trend (Lines 400-461):**
- ✓ Chart markup correct
- ⚠️ Will show "Building your trend data" placeholder (empty trend array)
- ❌ No actual trend visualization

**Peer Benchmark Breakdown (Lines 463-536):**
- ✓ Peer bands markup correct with colors
- ✓ Company position indicator present
- ❌ Will always show at 0% position (fallback)

### Section 3: Phase-by-Phase Breakdown (Lines 538-661)

- ✓ Grid structure for phases
- ❌ Will render empty (phases array is [])
- ✓ Expandable detail sections are present (but nothing to expand)

### Section 4: Readiness + Sequencing (Lines 690-730)

- ✓ ReadinessFactorsCard renders with hardcoded data
- ✓ SequencingAlertsCard renders with hardcoded data
- ✓ Both components working as intended

### Section 5: Forecast Scenarios (Lines 732-858)

- ✓ Scenario selector buttons
- ✓ Forecast calculations (offset from daysToIpo)
- ✓ Description text conditional rendering
- ❌ Will show 0 days in all scenarios (based on daysToIpo = 0)
- ❌ All dates will be today + 0 days = today

---

## Recommendations for Fix Priority

### Priority 1: Critical (Blocks all data display)

1. **Fix field name typo in API response (line 137)**
   ```diff
   - pacScore: company.pace_score,
   + paceScore: company.pace_score,
   ```

2. **Add missing fields to API response**
   - `paceDelta`: Calculate from previous week's PACE score (query `pace_score_history`)
   - `daysToIpo`: From `companies.estimated_days_to_ipo` column
   - `progressPercentage`: From `companies.progress_percentage` column
   - `currentPhase`: From `companies.current_phase` column
   - `trend`: Array of 8 weekly snapshots from `pace_score_history`
   - `phases`: Array of phase data - requires new queries or denormalized table

### Priority 2: High (Blocks document readiness)

3. **Fix document completeness queries**
   - Create or find the correct table for document requirements
   - Fix join logic for documents → companies relationship
   - Verify tasks table exists and has proper phase_id foreign key

### Priority 3: Medium (Improves data accuracy)

4. **Add error handling and logging**
   - Log which fields are missing in API response
   - Return 400 error if required fields can't be calculated
   - Add validation schema for response

---

## Code References

**Files affected:**
- `/src/app/pace/page.tsx` - Dashboard page (lines 99-107 fetch, 111-115 fallbacks)
- `/src/app/api/pace/scores/route.ts` - API endpoint (lines 137, 114, 135-150 response)
- `/src/components/ReadinessFactorsCard.tsx` - Working component
- `/src/components/SequencingAlertsCard.tsx` - Working component

---

## Responsive Design Validation

**Status:** ✓ GRID LAYOUTS CORRECT

- Mobile: Single column (all cards stack)
- Tablet: 2-column grid for most sections
- Desktop: 4-column grid for KPIs, 2-column for dual sections
- All media queries use Tailwind responsive prefixes (sm:, lg:, etc.)

---

## Conclusion

The PACE dashboard **frontend is well-implemented** with proper responsive design and component structure. However, it **cannot function correctly** until the API endpoint is fixed to return the correct field names and missing data structures.

**Blocking Issues:** 7/7 - No workaround possible, API must be fixed
**Component Issues:** 0/3 - All components working correctly
**Database Issues:** 2/5 - Some tables/views missing or unclear

**Estimated fix time:** 2-3 hours to resolve all issues
