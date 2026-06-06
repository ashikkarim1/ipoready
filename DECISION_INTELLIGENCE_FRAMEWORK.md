# Decision Intelligence Framework for IPOReady

**Status:** Strategic Blueprint for Phase 2+ Implementation  
**Owner:** Product Strategy  
**Last Updated:** June 2026

---

## Overview

IPOReady's pivot from "IPO Planning Tool" → "Decision Intelligence Operating System" requires embedding domain expertise into the product so that every decision shows:

1. **Regulatory basis** — Why this matters (jurisdiction + company factors)
2. **Historical precedent** — How similar companies decided
3. **Risk assessment** — Upside/downside of alternative decisions
4. **Audit trail** — Proof of informed decision-making

---

## Core Architecture

### 1. Decision Context Model

Every decision in IPOReady is tagged with context that makes it defensible:

```typescript
interface DecisionContext {
  // Company context
  companyId: string;
  jurisdiction: 'TSXV' | 'TSX' | 'CSE' | 'NASDAQ' | 'NYSE' | 'OTC';
  companySize: 'micro' | 'small' | 'mid' | 'large'; // by revenue
  
  // Decision parameters
  decisionType: 'disclosure' | 'governance' | 'timing' | 'resourcing';
  topic: 'customer_concentration' | 'related_party_tx' | 'audit_committee' | ...; // 47 types
  
  // Regulatory basis
  applicableRules: {
    rule_id: string;
    jurisdiction: string;
    threshold: number;
    requirement: string;
  }[];
  
  // Historical precedent
  comparables: {
    companyName: string; // anonymized in UI
    jurisdiction: string;
    timing: number; // days from event to disclosure
    decision: string; // what they chose to do
    outcome: string; // regulatory feedback received
    relevanceScore: 0.0 to 1.0; // how similar is this company?
  }[];
  
  // Risk assessment
  risks: {
    riskType: 'regulatory' | 'reputational' | 'litigation' | 'timing';
    likelihood: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    mitigation: string;
  }[];
  
  // Audit trail
  decisionMade: {
    timestamp: string;
    decidedBy: 'ceo' | 'cfo' | 'legal_counsel' | 'audit_committee';
    chosenPath: string;
    reasoning: string;
    counsel: {
      firmName: string;
      adviceGiven: string;
      date: string;
    };
  };
}
```

### 2. Decision Types & Guidance

#### A. Disclosure Decisions
**Pattern:** "Material event X occurred. Do we disclose? When?"

**Decision Intelligence:**
```
Event: Customer representing 18% of revenue was lost

→ Regulatory Basis:
   - TSXV: Customer concentration > 10% requires MD&A disclosure (NI 51-102)
   - NASDAQ: Significant customer loss (>10%) triggers 8-K requirement
   - This company: TSXV, therefore MD&A disclosure required

→ Historical Precedent:
   - 23 similar TSXV companies (similar revenue, customer concentration)
   - 21 disclosed within 3 days (83%)
   - 2 disclosed within 10 days (9%)
   - 0 delayed beyond 30 days (0%)
   - Median disclosure timing: 2.4 days

→ Risk Assessment:
   - If disclosed within 3 days: Regulatory compliance ✓, Investor confidence ✓
   - If disclosed within 30 days: Regulatory risk (8% chance of comment letter), Reputational ✓
   - If NOT disclosed: 72% probability of regulatory finding, $50K in legal fees

→ Recommendation:
   "Based on 23 similar TSXV companies, disclose in next 48 hours. 
    This timing has 96% regulatory approval rate in our dataset."

→ Audit Trail:
   ✓ CEO approved disclosure on [date]
   ✓ Legal counsel confirmed timing on [date]
   ✓ Board informed of decision on [date]
```

#### B. Governance Decisions
**Pattern:** "Do we need an audit committee? Independent director? Comp committee?"

**Decision Intelligence:**
```
Question: Should we establish a compensation committee before listing?

→ Regulatory Basis:
   - TSXV: Comp committee required if company > $10M revenue (TSX Company Manual 2.2.1)
   - This company: $45M revenue, therefore REQUIRED
   - Non-compliance penalty: $25K + listing delayed until remedied

→ Historical Precedent:
   - 97 TSXV companies analyzed
   - 96 established comp committee pre-listing (99%)
   - 1 attempted to establish post-listing (delayed listing 8 weeks, regulatory cost $45K)
   - Best practice timing: Establish at month 3 of IPO readiness

→ Risk Assessment:
   - If established pre-listing: 0% regulatory risk, Timeline ✓
   - If delayed to post-listing: 92% probability of listing delay, Cost impact: $50-100K

→ Recommendation:
   "REQUIRED by TSXV. Establish now (month 3 of your IPO cycle).
    99% of similar companies did this pre-listing.
    Cost: ~$20K compensation committee setup + insurance.
    Cost of delay: $50-100K in legal + listing delay."

→ Next Steps:
   1. CFO to propose 2-3 independent director candidates [by end of week]
   2. Board to interview and select [week 2]
   3. Announce in listing document [week 3]
```

#### C. Timing Decisions
**Pattern:** "When should we file our prospectus? Start audit? File for exemptions?"

**Decision Intelligence:**
```
Question: When should we start the financial audit?

→ Regulatory Basis:
   - TSXV: Audited financials required for prior 2 fiscal years (TSX Company Manual 4.1)
   - Timeline: Audit takes 8-12 weeks, review drafts takes 2 weeks
   - If your fiscal year-end is [date], audit must complete by [date]

→ Historical Precedent:
   - 45 similar TSXV companies analyzed
   - Average audit duration: 11.2 weeks
   - Companies that started audit too late: 8 (delayed listing 3-6 weeks each)
   - Critical path: Start audit 16 weeks before your target listing date

→ Risk Assessment:
   - If you start audit TODAY: On-time completion (98%), Listing on target ✓
   - If you start in 4 weeks: 65% probability of 2-week listing delay
   - If you start in 8 weeks: 92% probability of 4+ week listing delay

→ Recommendation:
   "Start audit selection process THIS MONTH (you're at week 9, 
    need to start by week 12 at latest). Your target listing date of [date]
    requires audit completion by [date]."
```

#### D. Resource Decisions
**Pattern:** "Do we hire a CFO? Audit committee chair? VP of Compliance?"

**Decision Intelligence:**
```
Question: Do we need to hire a dedicated CFO before listing?

→ Regulatory Basis:
   - TSXV: CFO sign-off required on all public filings (NI 52-109)
   - Company size: $45M revenue
   - Current state: Finance managed by accounting manager (not CFO)
   - Regulatory risk: Current person cannot legally sign NI 52-109 certs

→ Historical Precedent:
   - 78 TSXV companies, $40-50M revenue
   - 76 hired CFO pre-listing (97%)
   - 2 attempted to use existing accounting manager (both faced regulatory delays)
   - Average time to hire/onboard: 8 weeks
   - Average cost: $180-220K/year ($45K signing, $135-175K salary)

→ Risk Assessment:
   - If you hire CFO now (week 9): 6-week onboarding leaves 10 weeks for filing prep ✓
   - If you hire in week 12: 3-week onboarding margin is tight (60% of companies faced filing delays)
   - If you hire post-listing: Regulatory risk (unsigned certs), Compliance cost: $50K+

→ Recommendation:
   "Hire CFO now. 97% of similar companies did. Timeline: 8 weeks to find/hire/onboard.
    Cost: ~$220K + benefits. Cost of delay: Regulatory risk + $50K in legal fees."
   
→ Job Description:
   - 15+ years in public company finance
   - NI 52-109 and SOX compliance experience
   - Big 4 audit background preferred
   - Salary range: $180-220K + equity (0.25-0.5%)
```

---

## Implementation Architecture

### Phase 2: Build Decision Context Collector

**Goal:** For every decision in the platform, automatically capture context

**What to build:**
1. Decision logging middleware
   - Every user action → recorded with context
   - Who decided? When? Why?
   - Supports audit trails (non-repudiation)

2. Comparable company finder
   - User makes decision about [topic]
   - System queries: "Similar companies who faced this decision"
   - Results: Historical precedent + outcomes

3. Regulatory basis linker
   - Decision → applicable rules (from regulatory knowledge base)
   - Shows: Citation, requirement, threshold, jurisdiction-specific nuances

4. Risk assessment engine
   - Decision → risks (regulatory, reputational, timing, litigation)
   - Quantified: Likelihood × Impact matrix
   - Mitigation strategies (from Big 4 experience)

### Phase 3: Build Decision Oracle

**Goal:** AI recommends decisions with transparent reasoning

**What to build:**
1. Pattern recognition
   - "Companies with X factors + Y decision = Z outcome"
   - ML model learns from historical data

2. Accuracy metrics
   - Every recommendation shows: "This recommendation had 96% approval rate in our dataset"
   - Uncertainty quantified: "High confidence" vs. "Medium confidence"

3. Explainability
   - "We recommend X because:"
     - 23 similar companies chose X
     - Regulatory basis: TSX Manual 3.2.1
     - Timing advantage: Typically 3 days faster

4. Audit readiness
   - Every recommendation tied to documented precedent
   - Can show: "Here's the 23 companies this recommendation is based on"
   - Regulatory defensibility: "This follows Big 4 guidance document [X]"

### Phase 4: Build Decision Confidence Dashboard

**Goal:** Executives can see and govern all decision risks

**What to show:**
1. Open decisions (decisions not yet made)
   - Topic: "Customer concentration disclosure required?"
   - Decision window: "Must decide within 7 days"
   - Recommended path: "Disclose (96% of similar companies did)"
   - Risk if delayed: "Regulatory comment letter (8% probability)"

2. Made decisions (executed decisions with outcomes)
   - Topic: "Q2 MD&A language change (revenue decline)"
   - Decision made: "Full disclosure + risk factor expansion"
   - Outcome: "Regulatory approval within 2 weeks (96th percentile speed)"
   - Learning: "This disclosure pattern + risk factor combo → faster approval"

3. Pending decisions (waiting for counsel review, board approval)
   - Topic: "Related party transaction disclosure timing"
   - Recommended path: "Announce 48 hours before filing"
   - Legal review status: "Counsel feedback due by [date]"
   - Board approval status: "Audit committee review pending"

---

## User Experience Flows

### Flow 1: CEO Gets Daily PACE™ Pulse + Decision Items

**Email (every morning 7am):**

```
Subject: Your PACE™ is 67 — Here are today's 3 critical decisions

Your PACE™: 67 (+2 from yesterday)

📊 PACE Breakdown:
   Governance prep: 85% (on track)
   Financial audit: 60% (delayed by 1 week)
   Legal preparation: 92% (accelerating)

⚠️ CRITICAL DECISIONS TODAY:
   1. Material customer loss disclosure timing (due by 5pm)
      Your choice: Disclose today OR in 3 days?
      96% of similar companies disclosed within 48 hours.
      Regulatory risk if delayed: 8% probability of comment letter.
      Recommended: Disclose today (2pm board call to approve)
      
   2. CFO hire approval (waiting for your sign-off)
      Recruiter has 3 candidates.
      97% of similar companies hired CFO by this time.
      Recommended: Interview candidate #1 and #2 this week.
      
   3. Comp committee appointment (schedule confirmation)
      Need independent director name by Friday.
      99% of similar companies appointed by month 3.
      You're on track (month 3.5).
      Recommended: Confirm director appointment in board call today.

🎯 Today's top 3 tasks:
   □ Board call 2pm (approve customer disclosure)
   □ Meet with recruiter re: CFO candidates
   □ Legal counsel review of disclosure language

View full decision dashboard → [link]
```

### Flow 2: CFO Reviewing Disclosure Decision

**Dashboard view:**

```
DISCLOSURE DECISION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Topic: Customer concentration loss (Acme Corp, 18% of revenue)

REGULATORY BASIS
────────────────
✓ TSXV: Concentration > 10% requires MD&A disclosure (NI 51-102 s. 4.1.4)
✓ This company: Qualifies (18% loss is material)
✓ Timing: Must disclose "without unreasonable delay" (interpreted as <10 business days)

DECISION OPTIONS
────────────────
Option A: Disclose in Q2 MD&A (immediate, 2 days to prepare)
  Regulatory approval rate: 96%
  Comparable outcomes: 21/23 companies chose this
  Timeline impact: No delay
  Cost: ~$5K counsel time for MD&A language review

Option B: Disclose in material change report (separate disclosure, 3 days to prepare)
  Regulatory approval rate: 94%
  Comparable outcomes: 2/23 companies chose this
  Timeline impact: No delay
  Cost: ~$8K counsel time + filing fees ($500)

Option C: Wait to disclose in earnings call transcript (3 weeks delay)
  Regulatory approval rate: 72%
  Comparable outcomes: 0/23 companies chose this
  Timeline impact: +3 week regulatory review, customer communication delay
  Cost: $15-20K in potential legal remediation

HISTORICAL PRECEDENT
─────────────────────
Similar TSXV companies who lost major customer:

Company | Revenue | Loss % | Chosen Path | Timing | Outcome
─────────────────────────────────────────────────────────────
[Anon]  | $47M   | 16%    | Q2 MD&A     | 2 days | Approved
[Anon]  | $42M   | 22%    | Q2 MD&A     | 2 days | Approved
[Anon]  | $51M   | 14%    | MCR         | 4 days | Approved
...
Median timing to disclosure: 2.4 days
Regulatory approval rate: 96%

RISK ASSESSMENT
────────────────
IF Option A (Disclose in 2 days):
  ✓ Regulatory risk: LOW (96% approval)
  ✓ Reputational: Proactive disclosure shows management diligence
  ✓ Litigation: Low (timely disclosure protects company)
  ✓ Timeline: No impact (on track for listing)
  
IF Option B (Disclose in 3 days):
  ✓ Regulatory risk: LOW (94% approval)
  ⚠️ Reputational: Separate disclosure might alarm investors (8% chance)
  ✓ Litigation: Low
  ✓ Timeline: No impact
  
IF Option C (Wait 3 weeks):
  🔴 Regulatory risk: HIGH (72% approval, 8% delay probability)
  🔴 Reputational: Very high (investor perception of cover-up)
  🔴 Litigation: Medium (post-hoc disclosure vulnerable to challenge)
  🔴 Timeline: +3 week delay (critical path impact)
  💰 Cost: $15-20K in legal remediation + listing delay

RECOMMENDATION
────────────────
Disclose in Q2 MD&A within 2 days.

Why: 96% regulatory approval, 21/23 similar companies chose this,
     no timeline impact, lowest cost.

Counsel review: $5K (~0.5 days)
Execution: Draft language by EOD, counsel sign-off by EOD+1, board approval day 2

AUDIT TRAIL
────────────
□ Decision made by: [Click to sign off]
□ Counsel concurrence: [Waiting for legal counsel]
□ Board approval: [Waiting for audit committee]
□ Timeline: Made [date], Execute [date]

Recommendation: Click "Make This Decision" to record in audit trail.
```

---

## Phase 2-5 Roadmap

| Phase | Timeline | Capability | Business Impact |
|-------|----------|-----------|-----------------|
| **Phase 2** | Months 2-4 | Decision Context Collector + Historical Precedent Finder | Enables defensible decision-making |
| **Phase 3** | Months 3-5 | Risk Assessment Engine + ML Pattern Recognition | Accuracy >90%, pricing power $15K/mo |
| **Phase 4** | Months 4-6 | Decision Oracle + Recommendation Engine | Executive confidence + lock-in |
| **Phase 5** | Months 5-7 | Immutable Audit Trails + SOX Compliance | $50K+/mo pricing, personal liability protection |

---

## Success Metrics

### Operational Metrics
- Decision context collection rate: >95% of decisions logged
- Historical precedent match rate: >80% of decisions have 10+ comparable companies
- Recommendation accuracy: Tracked vs. actual outcomes (target >90% by Phase 3)

### Business Metrics
- Customer retention (post-IPO): >90% stay on platform in Year 2
- ARPU growth: $3K → $15K → $50K across phases
- Net Revenue Retention: >120% (expansion from advisory services)

### Defensibility Metrics
- Regulatory comment letters: <5% of companies using recommendations
- Customer liability insurance discounts: Track if companies get premium reductions
- Acquisition valuations: Track sale prices vs. revenue multiples (target 6-8x)

---

## Conclusion

Decision Intelligence transforms IPOReady from a planning tool into the operating system for going public. By embedding regulatory expertise, historical precedent, and risk assessment into every decision, IPOReady becomes indispensable — and defensible.

**The moat:** Not what we know, but what our customers teach us.
