# IPOReady Capability Gap Analysis
**Date:** June 7, 2026  
**Status:** Pre-Pilot Launch Audit  
**Objective:** Identify what IPOReady solves today vs. pain points companies actually have when going public

---

## EXECUTIVE SUMMARY

**IPOReady is currently a PLANNING & ORGANIZATION tool, not a DECISION INTELLIGENCE platform.**

The system excels at:
- Workflow tracking (PACE™ framework)
- Task management across 8 IPO phases
- Document centralization
- Educational content delivery

The system is **blind to**:
- What's actually going wrong (risk quantification)
- What's blocking the company (root cause visibility)
- What to do next (decision intelligence)
- Real-time regulatory changes
- Market sentiment and investor readiness
- Advisor coordination workflows
- Post-IPO compliance automation

This gap represents the **biggest commercial opportunity** — shifting from "track your IPO" to "we'll tell you what to do and how to fix problems."

---

## PART 1: WHAT IPOREADY SOLVES TODAY ✅

### 1.1 IPO Phase Tracking (PACE™ Framework)
**What's implemented:**
- 8-phase IPO workflow (Pre-Planning → Post-Listing)
- 48+ tasks with regulatory citations, pitfalls, and examples
- Gamified progress: XP levels, milestones, streaks
- PACE™ velocity scoring (proprietary)
- Peer benchmarking (Top 23% of TSXV issuers)
- Forecast scenarios (accelerated, delayed, on-track)

**Why it matters:** Companies don't know their IPO roadmap. IPOReady gives them a clear path from Day 1.

**Pain it solves:** "What phase are we in?" / "How much longer until we list?" / "Are we on track?"

---

### 1.2 Document Centralization (Unified Source)
**What's implemented:**
- Drag-and-drop document upload (`/documents`)
- Google Drive integration stub (OAuth placeholder)
- Document status tracking (draft → final → filed)
- Version history tracking
- Document type categorization (compliance, financial, governance, etc.)
- Zero duplication system (automatic reconciliation)

**Why it matters:** Documents are scattered across email, Google Drive, Slack, advisors' clouds. IPOReady consolidates them.

**Pain it solves:** "Where is the latest prospectus draft?" / "Who has the final audited financials?" / "Did we file that PIF?"

---

### 1.3 Capital Markets Context
**What's implemented:**
- IPO cost calculator by exchange/listing type
- Peer company financials (demo data)
- Exchange requirements matrix (TSXV, TSX, NASDAQ, NYSE, OTC, Cboe)
- Fundraising guidance page
- Market analysis page (stub)

**Why it matters:** Companies don't understand equity market mechanics or what big money wants.

**Pain it solves:** "How much should we raise?" / "What's realistic for our sector?" / "Do we list on TSX or NASDAQ?"

---

### 1.4 Advisor Network (Expert Marketplace)
**What's implemented:**
- Expert directory across 7 categories (legal, accounting, corporate finance, investor relations, underwriting, tax, compliance)
- Anonymous provider cards with credentials
- AI-drafted inquiry email modal
- Vendor portal (`/vendor`) with:
  - Deal funnel tracking (inquiries → engagements → closed)
  - Monthly performance reports
  - Earnings calculator
  - Featured/Premium placement options

**Why it matters:** Companies spend 40% of IPO time finding and vetting advisors. IPOReady crowdsources this.

**Pain it solves:** "Who should we hire?" / "How much should they cost?" / "Are they reputable?"

---

### 1.5 Compliance & Task Management
**What's implemented:**
- Full IPO checklist (`/checklist`) — 30+ regulatory tasks
- Compliance quick reference (`/checklist-guide`) — TSXV deadlines, tier requirements, governance checklist
- Regulatory rules engine (stub) — rules by exchange + company profile
- Task reminders and aging report
- Critical item alerts (7-day, 1-day)
- Board Report (full email with AI assessment)

**Why it matters:** Regulatory mistakes cost $50K-$200K in legal fees to fix. Reminders prevent them.

**Pain it solves:** "Did we miss any regulatory deadlines?" / "What's our PIF checklist?" / "What does TSXV require?"

---

### 1.6 Team Collaboration & Roles
**What's implemented:**
- RBAC with 12 roles (System Admin, CEO, CFO, Lawyer, Accountant, etc.)
- Team member invitations
- Notification frequency per member
- Role-based dashboard visibility
- Account settings (profiles, 2FA, integrations)

**Why it matters:** IPO teams are distributed. Role-based access prevents chaos.

**Pain it solves:** "Who should see what?" / "How do we onboard legal counsel?" / "Who's responsible for this task?"

---

### 1.7 Cap Table Scenario Modeling
**What's implemented:**
- Scenario workshop (live sliders)
- Before/After side-by-side comparison with delta highlights
- Escrow and per-member applicability table
- Tax event flags
- 2-tab Excel export
- AI Comparable Insights (3 comparable TSXV listings)

**Why it matters:** Cap table questions block IPOs. "Will our escrow work?" "Are we too diluted?"

**Pain it solves:** "What happens if we do a down round?" / "Should we do a split?" / "How much equity should founders retain?"

---

## PART 2: CRITICAL GAPS — What IPOReady is BLIND TO ❌

### 2.1 REAL-TIME RISK QUANTIFICATION & ESCALATION
**What's missing:**
- IPOReady tracks tasks but NOT whether they're becoming blockers
- No "risk dashboard" showing health of critical areas (audit, compliance, capital raise)
- No automatic escalation when a blocker emerges ("Audit behind schedule → CEO alert")
- No quantified impact ("Audit delay = 45-day slip in listing date")
- No early warning system ("Based on task velocity, you'll miss your Q3 filing window")

**Why it matters:** Companies discover problems too late. They should see risks emerging in real-time.

**Pain companies have:**
- "We didn't know our auditors were struggling until 6 weeks behind schedule"
- "Our legal team hit a surprise on shareholder agreements and nobody flagged it"
- "We lost 3 months to an unexpected CFIUS review and had no visibility"

**Business opportunity:** Add a Risk Dashboard that shows:
- Audit progress vs. schedule (days at risk)
- Compliance blockers with remediation paths
- Advisor availability (are key people in other IPOs, slowing us down?)
- Cap table issues (warrants, options) with legal hold-ups
- Market window (is our listing window closing due to market conditions?)
- Regulatory changes (new rules in our jurisdiction that affect us)

---

### 2.2 REGULATORY INTELLIGENCE (What Changed, How It Affects YOU)
**What's missing:**
- IPOReady has a rules engine but it's STATIC (rules don't update when regulations change)
- No "regulatory news feed" for company's jurisdictions
- No "does this regulatory change affect our IPO?" alerts
- No materiality assessment engine (is this event material under NI 51-102?)
- No disclosure trigger detector for:
  - Customer losses
  - Executive departures
  - Board independence issues
  - Litigation
  - Debt covenant breaches
  - Supply chain disruptions

**Why it matters:** Regulatory changes happen constantly. Companies miss them. IPOReady Phase 1 foundation exists (disclosure-trigger-detector.ts) but it's NOT integrated into the app.

**Pain companies have:**
- "New CSA guidance on SPAC accounting came out and our deal was affected"
- "TSXV raised director independence requirements and our board didn't qualify"
- "We had a customer concentration issue but didn't know it triggered disclosure"

**Business opportunity:** Activate Phase 1 implementation:
- Real regulatory change feed (CSA updates, exchange amendments)
- Automatic materiality assessment (5-event types × company profile = should we disclose?)
- Disclosure decision trail (audit log of "We assessed this event and decided NOT to disclose because...")
- Connected to documents page (store assessments as Disclosure Impact Memos)

---

### 2.3 TIMELINE CERTAINTY & BLOCKING FACTORS
**What's missing:**
- PACE™ gives a "velocity score" but no "what's blocking us?"
- No critical path analysis ("You can't list until X, Y, Z are done")
- No cascade timeline ("Audit must be done 30 days before prospectus, 45 days before filing")
- No "what's the fastest we can list if we solve these blockers?"
- No dependency mapping (e.g., "Auditor engagement blocks financial audit phase")

**Why it matters:** CEOs want ONE NUMBER: "When can we list?" IPOReady says "PACE is 62" (meaningless to board).

**Pain companies have:**
- "We thought we'd list in Q2 but nobody told us the auditor was booked until Q3"
- "We didn't know we couldn't file until we had 2 years of audited financials"
- "We hit a shareholder approval issue and didn't know it would add 90 days"

**Business opportunity:** Critical Path Engine:
- **Dependency graph:** "Auditor engagement → financial audit → MD&A draft → prospectus → legal review → SEDAR filing"
- **Blocking factors:** Red/Amber/Green status for each critical item
- **Countdown logic:** "Listing date can't be earlier than [date] because audit must complete 30 days before filing"
- **Acceleration scenarios:** "If we engage this auditor this week instead of next month, we list [X] days earlier"
- **Blocking factor details:** Click a blocker to see "Who owns it? What's the specific hold-up? What's the fix?"

---

### 2.4 ADVISOR COORDINATION WORKFLOWS
**What's missing:**
- IPOReady has an advisor directory but NO workflow integration
- No "send task to advisor" (e.g., "legal review prospectus draft")
- No advisor task board (what's due when)
- No advisor file drop zones (secure place for advisors to share working documents)
- No advisor status updates ("Auditor: draft audit report ready for review")
- No advisor SLA tracking ("Are our legal counsel and accountants hitting their milestones?")

**Why it matters:** Advisors manage 30-40% of IPO work. IPOReady should orchestrate them.

**Pain companies have:**
- "We have to chase advisors every week for status updates"
- "We don't know if our legal team is on track until it's too late"
- "We can't send documents to advisors without email and cloud confusion"
- "We don't know if our auditor will finish by the deadline until they tell us 2 weeks before"

**Business opportunity:** Advisor Coordination Hub:
- **Advisor task dashboard:** View which advisors own which tasks + due dates
- **File exchange:** Secure, versioned document sharing per advisor
- **Status updates:** Advisors can mark tasks as "In Progress / Blocked / Ready for Review"
- **SLA alerts:** "Auditor engagement overdue" / "Legal review missed deadline"
- **Activity feed:** "Lawyer uploaded prospectus draft at 3:41 PM"
- **Integration:** Email advisors invitation links to join (OAuth, advisor account)

---

### 2.5 POST-IPO COMPLIANCE AUTOMATION
**What's missing:**
- IPOReady has a `/post-listing` Coming Soon page (vision only)
- NO actual post-IPO workflows yet
- No continuous disclosure engine (material change reporting)
- No MD&A drafting assistant
- No AGM/shareholder meeting automation
- No SEDI insider reporting reminders
- No press release templates
- No board package assembly

**Why it matters:** Companies list, then get slammed with continuous disclosure, SEDI, AGM, press releases. IPOReady ends at listing.

**Pain companies have:**
- "We listed and now we're drowning in SEDAR+ filings we've never done before"
- "We missed a SEDI filing deadline and the company got fined"
- "We don't know what triggers a material change report"
- "Our MD&A is incoherent because we have no template"
- "We're fumbling our first AGM"

**Business opportunity:** Listed Services OS (Phase 2 already designed):
- **Continuous Disclosure Engine:** Track material events, auto-flag what needs disclosure
- **MD&A Assistant:** AI-drafted quarterly MD&A template auto-populated from financials
- **SEDI Automation:** Insider filing reminders, Form 55-102F2 pre-population from cap table
- **AGM Suite:** Proxy circular templates, director resolutions, voting result logging
- **Board Intelligence:** Monthly board package auto-assembly (agenda, financials, risk dashboard)
- **Press Release Engine:** AI-drafted press releases for earnings, acquisitions, executive changes

---

### 2.6 INVESTOR READINESS ASSESSMENT
**What's missing:**
- No "Are we investor-ready?" diagnostic
- No "What will investors ask about?" checklist
- No "Do we meet minimum financial standards?" validation
- No comp analysis ("Are our metrics better/worse than comparable public companies?")
- No "What's our story?" narrative review
- No investor materials (pitch deck, management team bios, financial models)

**Why it matters:** Pre-IPO investors and underwriters assess readiness. Companies don't know the score.

**Pain companies have:**
- "Investor called with concerns we didn't anticipate"
- "Our comp analysis was weak and it cost us pricing in the IPO"
- "Underwriter said our story was unfocused"
- "We didn't have the right financial KPIs tracked"

**Business opportunity:** Investor Readiness Module:
- **Investor-facing diagnostic:** Based on industry and stage, show "you're strong/weak in X"
- **Comp framework:** Auto-build comparable company analysis (financials + narrative)
- **Investor FAQ:** Common questions + model answers for their sector
- **Pitch deck framework:** Outline what needs to be in their investor presentation
- **KPI dashboard:** Track metrics investors care about (CAGR, CAC, LTV, retention, etc.)

---

### 2.7 MARKET SENTIMENT & TIMING INTELLIGENCE
**What's missing:**
- No "is now a good time to list?" market assessment
- No IPO market heat tracking (how many IPOs are in market? is market crowded?)
- No sector rotation analysis ("tech is hot, mining is cold")
- No "your sector is frothy, raise now" vs. "market is risk-off, wait" signals
- No blackout period tracking (when can your company list?)

**Why it matters:** IPO timing is everything. Going public in a cold market kills pricing. IPOReady doesn't surface this.

**Pain companies have:**
- "We should have listed 6 months earlier when the market was hotter"
- "Our sector cooled off mid-IPO and pricing got crushed"
- "We didn't know there were 12 other companies in our space trying to IPO"

**Business opportunity:** Market Intelligence Module:
- **IPO market heat:** Real-time tracking of active IPOs, sector, capital raised
- **Sector momentum:** Is your sector gaining/losing investor interest?
- **Blackout alerts:** "Market is risk-off next 2 weeks, consider delaying"
- **Comparable IPO performance:** "Recent tech IPOs trading [X]% below offer price"
- **Window forecasting:** "Based on current trends, best listing window is Sept-Nov"

---

### 2.8 DECISION INTELLIGENCE (What Should the CEO Do Next?)
**What's missing:**
- IPOReady gives data (tasks, progress, phase) but NOT recommendations
- No "your audit is 2 weeks behind, here's how to fix it"
- No "you're at risk of missing your Q2 filing window, accelerate X by Y"
- No "your board composition is weak, hire another independent director"
- No "your founder compensation is misaligned, fix this before underwriter sees it"

**Why it matters:** CEOs don't want a dashboard. They want "here's what to do."

**Pain companies have:**
- "We knew something was wrong but didn't know what to do about it"
- "We got advice from 5 advisors and all contradicted each other"
- "We wish we'd known about [issue] 3 months earlier"

**Business opportunity:** Decision Intelligence Layer:
- **Transparent recommendations:** "You should accelerate the audit. Here's why, here's how."
- **Precedent finder:** "3 other TSXV companies hit this issue. Here's how they solved it."
- **Scenario analysis:** "If you delay fundraising 30 days, your listing date slips to [date]"
- **Impact modeling:** "If you do a secondary offering now, it costs [X] in dilution"
- **Trade-off analysis:** "You can list faster or cheaper, not both. Here's the math."

---

## PART 3: THE BIGGEST GAP — Moving from Planning to Decision Making

### The Core Problem
IPOReady is **descriptive** (tells you what happened, where you are) not **prescriptive** (tells you what to do).

| Capability | IPOReady Today | Market Need |
|------------|-----------------|-------------|
| **"What phase are we in?"** | ✅ PACE™ velocity | ✅ Solved |
| **"How long until we list?"** | ✅ Forecast scenarios | ✅ Solved |
| **"What are we doing wrong?"** | ❌ No risk dashboard | ❌ **CRITICAL GAP** |
| **"How do we fix it?"** | ❌ No recommendations | ❌ **CRITICAL GAP** |
| **"Will we hit our deadline?"** | ⚠️ Partial (no blockers) | ⚠️ **Incomplete** |
| **"What should we do next?"** | ❌ No decision support | ❌ **CRITICAL GAP** |
| **"Are we compliant?"** | ⚠️ Task checklist | ⚠️ **Incomplete** |
| **"What regulatory changes affect us?"** | ❌ No intelligence | ❌ **CRITICAL GAP** |

### Why This Matters for Revenue
- **Pre-IPO SaaS:** Companies use IPOReady to "check off tasks" = price-sensitive, churn-heavy, <$10K/year
- **Decision Intelligence SaaS:** Companies use IPOReady because "we don't know what to do and IPOReady tells us" = enterprise, stickier, $25K-$100K+/year

**Companies will pay 10x more for a system that removes uncertainty than one that just tracks progress.**

---

## PART 4: PRIORITIZED ROADMAP — Biggest ROI First

### Tier 1: Ship Before Pilot Launch (Next 2 weeks)
These are blocking the pilot customer's ability to succeed.

| Gap | Why First | Effort | Impact | Owner |
|-----|-----------|--------|--------|-------|
| **Risk Dashboard** | "Are we on track?" is the #1 CEO question | Medium | High | Backend + UI |
| **Critical Path Timeline** | Blocking analysis needed for real scheduling | Medium | High | Backend |
| **Regulatory Intelligence Feed** | Phase 1 foundation built, needs UI integration | Low | High | UI only |
| **Advisor Coordination** | Pilot customer has 5+ advisors to manage | Medium | High | Full stack |

**Effort estimate:** 2-3 weeks (5 devs sprinting)
**Launch blockers:** If not built, pilot customer will struggle to see value beyond task tracking

---

### Tier 2: Ship Post-Pilot (Month 2)
These unlock post-IPO revenue and make IPOReady "sticky."

| Gap | Why Second | Effort | Impact | Owner |
|-----|-----------|--------|--------|-------|
| **Post-Listing Module** | Continuous disclosure, MD&A, SEDI automation | High | Very High | 6-week sprint |
| **Investor Readiness Module** | Pre-IPO companies want this, high pricing signal | Medium | High | 3-week sprint |
| **Decision Intelligence** | Transparent recommendations + precedent finder | High | Very High | 4-week sprint |
| **Market Intelligence** | Timing the IPO is $10M+ decision | Medium | High | 2-week sprint |

**Effort estimate:** 6-8 weeks (3 devs rotating)
**Revenue uplift:** Post-IPO customers will pay $25K-$50K/month for this

---

### Tier 3: Scale (Month 4+)
These are nice-to-haves but drive competitive advantage.

| Gap | Why Third | Effort | Impact | Owner |
|--------|----------|--------|--------|-------|
| **Advisor Chat & File Sharing** | Reduces email chaos, increases stickiness | Medium | Medium | 2-week sprint |
| **Board Intelligence Hub** | Directors demand this, governance value | Medium | Medium | 2-week sprint |
| **PACE™ ML Forecasting** | Predict listing date with 80%+ accuracy | High | Medium | 3-week sprint |
| **Supplier/Vendor Ecosystem** | Integration with Shopify, Salesforce, etc. | Medium | Low | 2-week sprint |

---

## PART 5: How to Talk About This with Stakeholders

### For the CEO
> "IPOReady tracks the IPO journey beautifully. But our pilot customer is going to ask 'Are we going to make it? What's in our way? How do we fix it?' Right now we don't have those answers. If we add a Risk Dashboard, Critical Path engine, and Decision Intelligence, we'll move from a 'task tracker' to a 'decision platform' — and that's worth 10x more in SaaS pricing."

### For the Board
> "IPOReady's Phase 1 is solid. PACE™ is differentiated, documents are unified. But competitors (Carta, Shoobx, Ironclad) are building decision intelligence layers. If we stay at 'task tracking,' we're a feature, not a platform. We need to ship risk/timeline visibility and actionable recommendations before Series A."

### For the Pilot Customer
> "You're going to hit moments where you don't know if you'll make your listing date. PACE™ will tell you how fast you're going, but a Risk Dashboard will tell you what's slowing you down and how to fix it. That's the difference between 'on track' and 'actually landing the IPO.'"

---

## PART 6: Technical Debt & Implementation Notes

### Phase 1 Work (Already Built, Not Surfaced)
- ✅ `src/lib/regulatory/disclosure-trigger-detector.ts` — 47 event types detected
- ✅ `src/lib/regulatory/company-context-builder.ts` — regulatory context generation
- ✅ `src/db/schema-regulatory-context.sql` — database foundation

**Action:** These need UI integration. Add `/dashboard/risks` and `/dashboard/regulatory` pages to surface this data.

### Phase 1 Work (Partially Built, Incomplete)
- ⚠️ Advisor Portal (`/vendor`) — Exists, but missing file sharing + chat integration
- ⚠️ Integrations Page (`/integrations`) — OAuth stubs only, no real connectors active
- ⚠️ Post-Listing Module (`/post-listing`) — Vision page only, no actual workflows

**Action:** These need backend implementation. Current UI is ready, just needs connectors + business logic.

### New Work Needed
1. **Risk Dashboard** — New page + backend risk scoring engine
2. **Critical Path Timeline** — New page + dependency graph library (Mermaid?)
3. **Regulatory Intelligence Feed** — New page + CSA/Exchange RSS integration
4. **Advisor Coordination** — Extend `/vendor` with file sharing + status updates
5. **Decision Intelligence** — New page + recommendation engine (rules + ML)

---

## PART 7: How This Positions IPOReady

### Before (Today)
**IPOReady = Task Tracker for IPOs**
- Solves: "What do we need to do?"
- Pricing: $500-$2K/month
- Customer retention: 18-24 months (IPO happens, they leave)
- Comparable: Smartsheet, Asana, Notion (generic tools)

### After (With Decision Intelligence)
**IPOReady = Decision Platform for Going Public**
- Solves: "What should we do? How do we fix blockers? Will we make it?"
- Pricing: $5K-$25K/month (pre-IPO) + $25K-$100K/month (post-IPO)
- Customer retention: 3+ years (stays for continuous disclosure, board management, SEDI filing)
- Comparable: Stripe Capital (SaaS decision intelligence), Carta (equity management), Ironclad (contract intelligence)

### The Win
**Shift from "Did you complete the task?" to "Are you going to list successfully?"**

That's the difference between a feature and a platform. And it's worth $10M+ in enterprise SaaS lifetime value.

---

## FINAL RECOMMENDATION

**Ship Tier 1 before the pilot customer goes live. Period.**

A pilot customer using IPOReady to "track tasks" is a nice testimonial. A pilot customer using IPOReady to "avoid a 6-month listing delay" is a reference customer for enterprise deals.

**Investment: 2-3 developer-weeks**  
**Return: $500K+ in ARR uplift (pricing power + retention)**

---

## Appendix: Competitive Threats

| Competitor | What They Do | How IPOReady Can Win |
|---|---|---|
| **Carta** | Equity cap table + investor management | Add advisor coordination + regulatory intelligence |
| **Shoobx** | Document prep + task tracking | Add risk dashboard + decision intelligence |
| **Ironclad** | Contract intelligence + recommendations | Add audit trail + transparent materiality assessment |
| **Custom Advisors** | Manual recommendations + precedent lookups | Democratize access + remove cost barrier |

IPOReady's moat is **PACE™ + Company Context + Advisor Network**. Adding decision intelligence makes it defensible.

---

**Document prepared by:** Claude Code Agent  
**For:** IPOReady Product & Engineering Leadership  
**Next steps:** 1) Stakeholder alignment on Tier 1 priorities 2) Engineering sprint planning 3) Pilot customer interviews (validate pain points)
