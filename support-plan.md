# IPOReady Support Plan & Ticketing System Design

**Document Version:** 1.0  
**Date:** June 2026  
**Status:** Pre-Launch (Pilot Phase)  
**Owner:** Support & Operations  

---

## Executive Summary

IPOReady serves CFOs, GCs, and listing teams managing mission-critical IPO workflows. Support must match the urgency and complexity of public company preparation. This plan establishes a tiered, multi-channel support system with SLAs tuned to customer subscription levels, escalation procedures for regulatory/compliance issues, and metrics to drive continuous improvement.

**Core Principle:** Support is not just reactive—it's a strategic edge. First-contact resolution and proactive education reduce friction and build trust during a high-stakes 18-month journey.

---

## 1. Support Channel Architecture

### 1.1 Primary Channel: Email Ticketing
- **Interface:** Help section in AppShell (mailto link → Zendesk)
- **Ticketing System:** Zendesk Support + Zendesk Guide (knowledge base)
- **When to use:** Technical issues, account problems, billing questions, feature requests, documentation-based queries
- **Response time target:** Varies by tier (see SLA section)
- **Format:** Plain-text + HTML email templates; auto-include company context (company name, plan, phase)

### 1.2 Secondary Channel: In-App Chat (Paid Tiers)
- **Platform:** Slack Connect (Enterprise tier) or lightweight widget (Growth tier)
- **Access:** Growth and Enterprise tiers only
- **Features:**
  - Instant connectivity to support agent during business hours (9am–6pm ET)
  - Async capability—replies appear in-app when agent comes online
  - Context auto-populated: user name, company, current page/task
  - Transcript saved to Zendesk ticket for continuity
- **SLA:** < 30 min response during business hours (Growth); < 15 min (Enterprise)

### 1.3 Tertiary Channel: Self-Serve Knowledge Base
- **Platform:** Zendesk Guide (embedded on IPOReady.com/help)
- **Content:** Top 20 FAQs + regulatory guides + PACE™ methodology docs + troubleshooting
- **Searchable categories:**
  - Getting Started (onboarding, team setup, RBAC)
  - Feature Usage (dashboard, checklist, templates, cap table, marketplace)
  - Document Management (upload, integrations, compliance)
  - Billing & Accounts (plans, renewals, payment methods, 2FA)
  - Regulatory & Compliance (IPO readiness phases, regulatory citations)
  - Troubleshooting (login issues, sync failures, export errors)
  - PACE™ Methodology (how scoring works, phase tracking, velocity)
  - API & Integrations (partner integrations, data exports)

### 1.4 Emergency/Crisis Channel: Direct Escalation
- **Method:** Phone or Slack to on-call engineer (see escalation matrix)
- **Trigger scenarios:**
  - Data loss or data integrity issues
  - Security incident or unauthorized access
  - Critical system downtime (>1 hour)
  - Regulatory filing deadline at risk due to platform issue
- **On-call rotation:** 7x24 during active pilot phase

---

## 2. Service Level Agreements (SLAs)

### 2.1 Response Time SLAs by Tier

| Tier | Channel | Response Time | Resolution Target | Availability |
|------|---------|----------------|-------------------|--------------|
| **Free** | Email | 24 hours (next business day) | 5–7 business days | Business hours only |
| **Starter** | Email | 4 hours (same business day) | 2–3 business days | Business hours + on-call for critical |
| **Growth** | Email | 2 hours | 24 hours | 24/7 (with longer response at night) |
| **Growth** | In-App Chat | 30 min (business hours) | 4 hours | 9am–6pm ET, Mon–Fri |
| **Enterprise** | Email | 1 hour (urgent), 30 min (critical) | 4 hours | 24/7 |
| **Enterprise** | In-App Chat | 15 min | 2 hours | 24/7 with dedicated Slack channel |
| **Enterprise** | Phone (direct) | 5 min (on-call) | 1 hour | 24/7 |

**Definitions:**
- **Response Time:** Time to first substantive reply (not auto-reply)
- **Resolution Target:** Estimated time to full resolution
- **Critical:** System down, data loss, security issue, regulatory deadline at immediate risk
- **Urgent:** Feature broken, unable to complete core task, payment processing issue
- **Standard:** Feature request, general how-to, minor bug, billing question

### 2.2 Escalation Timing

| Issue Type | Time-to-Escalate | Owner |
|------------|------------------|-------|
| No progress after 4 hours (Enterprise) | Immediate | Support Lead |
| No progress after 1 business day (Growth) | Immediate | Support Lead |
| Requires legal/regulatory guidance | 2 hours | CEO + GC (legal) |
| Data integrity concern | 30 minutes | VP Eng + CEO |
| Security incident | 15 minutes | VP Sec + CEO (incident response) |

---

## 3. Ticketing System Setup: Zendesk Core

### 3.1 Configuration

**Instance:** ipoready.zendesk.com

**Ticket Fields (Custom):**
- Company Account (linked to customer DB)
- Subscription Tier (Free/Starter/Growth/Enterprise)
- Phase (Pre-IPO, IPO Week, Post-Listing)
- Impact (Low/Medium/High/Critical)
- Category (Technical/Billing/Compliance/Feature Request)
- Regulatory Urgency Flag (Yes/No) — triggers CEO review queue

**Ticket Auto-Assignment:**
- Free/Starter → Support Tier 1 queue (Asia timezone, lower cost)
- Growth → Support Tier 2 queue (primary support team)
- Enterprise → Dedicated CSM (Customer Success Manager) + Tier 3 escalation
- Regulatory/Compliance flags → CEO + GC review queue

**Views & Routing:**
- Overdue SLA (auto-escalate every 4 hours)
- Awaiting Customer (auto-close after 3 days no response)
- Awaiting Engineering (for bugs → VP Eng → Slack #support-eng)
- Enterprise/Growth SLA at-risk (real-time dashboard)

### 3.2 Ticket Lifecycle

```
Incoming Email/Chat
  ↓
Auto-categorized by AI (Zendesk ML)
  ↓
Routed to queue (Tier 1/2/3 or CSM)
  ↓
Agent responds within SLA
  ↓
[If Technical] → Ticket tagged #engineering, pinged in Slack
  ↓
[If User Error] → Link to KB article, offer training
  ↓
[If Product Issue] → Create bug ticket in GitHub, update ticket
  ↓
Resolution or escalation
  ↓
Customer confirmation
  ↓
Auto-close after 3 days, survey sent

[Escalation Path]
  ↓
Support Lead reviews (1 business day)
  ↓
Engineer investigates (2–3 days)
  ↓
If not resolved → VP Eng + CEO review
  ↓
Customer update + ETA
```

### 3.3 Zendesk Integrations

- **Slack:** Notifications for Enterprise/Growth SLA breaches, new critical tickets, escalations
- **GitHub:** Sync bugs → create issues, close Zendesk ticket when GitHub issue resolved
- **Stripe:** Auto-populate billing data (payment failures, renewal status)
- **Neon DB:** Query customer account status, phase progress, document count (for context)
- **Google Workspace:** Auto-create shared Drive folders for Enterprise ticket file exchanges

---

## 4. Knowledge Base: Top 20 FAQs + Solutions

### 4.1 Knowledge Base Structure (Zendesk Guide)

**Categories:** 8 main sections, 20+ articles, ~3–5 min read each

#### **Category 1: Getting Started (3 articles)**

1. **"How do I set up my team in IPOReady?"**
   - Step-by-step RBAC role assignment
   - Permission matrix by role
   - Team invite flow
   - Link: [Internal RBAC Table](/team)

2. **"What is PACE™ and how is my score calculated?"**
   - PACE™ methodology overview (Preparation, Advisors, Capital, Execution)
   - Scoring breakdown (8-week velocity, phase completion, risk flags)
   - How milestones and tasks affect PACE
   - Link: [PACE Velocity Page](/pace)

3. **"I'm new to IPO readiness—where do I start?"**
   - Onboarding wizard walkthrough
   - First 10 tasks checklist
   - Setting listing type and exchange
   - Role recommendations (CEO vs. GC vs. CFO workflows)
   - Video: 3-min onboarding intro

#### **Category 2: Feature Usage (4 articles)**

4. **"How do I upload and organize documents?"**
   - Drag-and-drop upload guide
   - Supported formats
   - Folder structure best practices
   - Google Drive integration setup (if available in tier)
   - Link: [Document Management Page](/documents)

5. **"How does the IPO checklist work?"**
   - 30+ core tasks explained
   - Phase navigation
   - Regulatory citation lookups
   - Task dependencies (what must be done before what)
   - Expanding detail panels for deeper guidance

6. **"How do I use templates and auto-fill?"**
   - 12 templates overview (by IPO phase)
   - Prerequisites per template
   - AI auto-fill feature (Growth/Enterprise only)
   - Customization and export
   - Video: 2-min template walkthrough

7. **"What is the cap table scenario workshop?"**
   - Live slider scenario modeling
   - Escrow applicability per shareholder
   - Tax event flags
   - Before/After delta highlights
   - Excel export and sharing

#### **Category 3: Document Management & Integrations (3 articles)**

8. **"How do I connect Google Drive (or other cloud storage)?"**
   - Step-by-step OAuth setup
   - What folders sync automatically
   - Conflict resolution (duplicate uploads)
   - Disconnecting and re-connecting

9. **"Can I export my data?"**
   - Supported export formats (CSV, Excel, PDF)
   - What data is exportable per role
   - Using exports for external advisors/lawyers
   - API for custom integrations (Enterprise)

10. **"How does document collaboration work?"**
    - Sharing permissions by role
    - Version control and audit trails
    - Commenting on documents
    - Real-time sync status

#### **Category 4: Billing & Accounts (3 articles)**

11. **"How do I manage my subscription and billing?"**
    - Plan comparison (Free/Starter/Growth/Enterprise)
    - Monthly vs. annual billing
    - Payment methods and card updates
    - Invoice history and tax receipts

12. **"What happens when my subscription renews?"**
    - Renewal timeline (14-day amber, 7-day red warning)
    - Auto-renewal vs. manual
    - Downgrade or pause instructions
    - Refund policy

13. **"How do I set up 2FA (two-factor authentication)?"**
    - Why 2FA is important for IPO data
    - Setup step-by-step (authenticator app, SMS)
    - Recovery codes
    - Troubleshooting lost phone

#### **Category 5: Regulatory & Compliance (3 articles)**

14. **"What IPO phases are covered in the checklist?"**
    - 8-phase breakdown (Pre-IPO, Phase 1, Phase 2... Post-Listing)
    - Regulatory requirements per exchange (TSX, NASDAQ, etc.)
    - Timeline benchmarks
    - Link: [Full Checklist](/checklist)

15. **"How do I find regulatory citations and compliance guidance?"**
    - Citation lookup in checklist
    - Links to external docs (CSA, SEC, IIROC rules)
    - Exchange-specific requirements
    - When to escalate to legal

16. **"Is my data compliant with GDPR / SOC 2 / SEC regulations?"**
    - Data privacy overview
    - Encryption and security features
    - Data residency (Canada-first)
    - Link: Privacy Policy and SOC 2 cert

#### **Category 6: Troubleshooting (2 articles)**

17. **"I can't log in or I forgot my password."**
    - Password reset flow
    - Two-factor authentication troubleshooting
    - Account lockout procedures
    - Contacting support if locked out

18. **"My document upload is stuck or failing."**
    - File size and format limits
    - Network connectivity check
    - Browser compatibility (Chrome/Firefox/Safari)
    - When to clear cache/cookies

#### **Category 7: PACE™ Methodology (2 articles)**

19. **"How does PACE™ velocity forecast work?"**
    - Current vs. optimistic vs. delayed scenarios
    - Phase acceleration effects
    - Peer benchmarking (Top 30% TSXV companies)
    - Using forecasts to adjust timeline

20. **"How do I improve my PACE™ score?"**
    - Task completion prioritization
    - Advisor engagement impact
    - Regulatory remediation path
    - Quick wins to boost velocity

---

### 4.2 Knowledge Base Governance

- **Ownership:** Support Lead (with VP Product + VP Eng input)
- **Review Cycle:** Monthly; update based on top ticket trends
- **Versioning:** Mark articles "Updated June 2026" to signal freshness
- **Feedback Loop:** Every FAQ has "Was this helpful?" button → tracks usage, drives content improvement
- **Escalation:** If >10 tickets reference same article, flag for revision

---

## 5. Escalation Procedures

### 5.1 Escalation Matrix

```
Level 1: Support Agent (Tier 1/2)
├─ Knowledge: Basic troubleshooting, policy questions, general how-to
├─ Authority: Can grant courtesy extensions, one-time refunds (<$100)
├─ Escalation Trigger: Issue not resolved in 4 hours OR customer impact = High
│
└─→ Level 2: Support Lead
   ├─ Knowledge: Complex technical issues, advanced feature usage
   ├─ Authority: Can grant partial refunds, expedite features, override SLAs
   ├─ Escalation Trigger: Issue not resolved in 1 business day OR regulatory flag
   │
   └─→ Level 3a: VP Engineering (Technical)
      ├─ Knowledge: Product bugs, system architecture, performance
      ├─ Authority: Can authorize hotfixes, rollback changes
      ├─ Escalation Trigger: Critical bug, data loss, security concern
      │
      └─→ CEO (Final Authority)
         ├─ Authority: Customer relationship repair, legal review, policy override
         └─ Escalation Trigger: Enterprise customer at risk, regulatory/legal issue
   
   └─→ Level 3b: GC (Legal/Compliance)
      ├─ Knowledge: Regulatory compliance, contract interpretation, disclosure
      ├─ Authority: Legal opinion, compliance guidance
      └─ Escalation Trigger: Regulatory question, data request, legal claim

   └─→ Level 3c: VP Product
      ├─ Knowledge: Feature roadmap, product strategy, competitive positioning
      ├─ Authority: Feature feasibility, documentation updates
      └─ Escalation Trigger: Feature request from Enterprise customer, roadmap impact
```

### 5.2 Escalation Triggers (Decision Tree)

| Scenario | Escalation Level | Owner | Action |
|----------|------------------|-------|--------|
| User forgot password | Tier 1 → Send reset link | Support Agent | Auto |
| Login fails despite password reset + 2FA troubleshooting | Tier 1 → Tier 2 → VP Eng | Support Lead | Check account status, auth logs |
| Document upload failing for >3 users | Tier 1 → VP Eng → Slack #support-eng | Support Lead | Investigate file processor, storage quota |
| Customer questions PACE™ calculation accuracy | Tier 1 → Support Lead (with Product) | Support Lead | Review scoring logic, link to KB |
| Enterprise customer wants custom RBAC role | Support Lead → VP Product | VP Product | Feasibility, roadmap, quote |
| Request for data export for regulatory filing | Tier 1 → GC → CEO | Support Lead | Legal review, compliance check, SLA: 2 hours |
| Customer reports unauthorized access to company account | Tier 1 → VP Sec → CEO | VP Sec + CEO | Incident response, audit logs, password reset, 2FA mandate |
| IPO filing deadline at risk due to platform bug | Support Lead → VP Eng → CEO | VP Eng + CEO | P0 hotfix, real-time comms, customer hand-holding |
| Billing dispute (charged twice, renewal error) | Tier 1 → Stripe API review → Finance Lead | Support Agent (Tier 1) | Verify transaction, credit account, adjust SLA |
| Regulatory authority requests data access | GC → CEO → VP Sec | GC | Legal review, Data Request Record, compliance with disclosure laws |

### 5.3 On-Call Rotation (Pilot Phase)

**24/7 On-Call Schedule (Starting Pilot Launch):**

- **Primary On-Call:** VP Engineering (rotates weekly)
  - Phone: Emergency line routed to cell
  - Availability: 5 min response for critical issues
  - Escalation: CEO if issue not resolved in 1 hour
  
- **Secondary On-Call:** Support Lead (rotates weekly, staggered)
  - Phone: Emergency line routed to cell
  - Availability: 15 min response for urgent issues
  - Escalation: VP Eng if technical investigation needed

- **Incident Commander (On-Duty):** Zendesk admin
  - Role: Monitors SLA breaches, pages on-call team
  - Hours: 24/7 during pilot phase
  - Tools: Slack alerts, PagerDuty integration (future)

---

## 6. Support Team Structure & Staffing Model

### 6.1 Pilot Phase Staffing (Months 1–3, ~50 customers)

| Role | Headcount | Cost (Loaded Annual) | Responsibility |
|------|-----------|----------------------|-----------------|
| Support Lead | 1 | $120k | Tier 2/3 triage, SLA management, KB governance |
| Support Agent (Tier 1) | 1 | $70k | Email intake, FAQ/policy questions, first-contact resolution |
| VP Engineering (on-call) | (Existing) | (Existing) | Tier 3 technical, escalations, critical bugs |
| CEO (escalation reviewer) | (Existing) | (Existing) | Enterprise relationship, regulatory, legal decisions |
| GC (compliance) | (Existing) | (Existing) | Regulatory & legal escalations |

**Total Support Budget (Pilot):** ~$190k/year + Zendesk SaaS ($1,500/mo) + communication tools

### 6.2 Growth Phase Staffing (Months 4–12, ~150–300 customers)

| Role | Headcount | Cost | Responsibility |
|------|-----------|------|-----------------|
| Director of Customer Success | 1 | $140k | Support strategy, team management, NPS drive |
| Support Lead | 2 | $240k | Tier 2 triage, SLA management, escalations |
| Support Agent (Tier 1) | 3 | $210k | Email intake, KB, user education, onboarding |
| Dedicated CSM (Enterprise) | 1 | $100k | Proactive outreach, account health, expansion |
| Support Operations Specialist | 1 | $80k | Ticketing automation, KB management, metrics |

**Total Support Budget (Growth):** ~$770k/year + tools

### 6.3 Scale Phase Staffing (Year 2+, 500+ customers)

| Role | Headcount | Cost | Responsibility |
|------|-----------|------|-----------------|
| VP Customer Success | 1 | $180k | Support org leadership, strategic initiatives |
| Director of Customer Success | 2 | $280k | Team management, training, ops |
| Support Lead | 4 | $480k | Tier 2 triage, escalations, team enablement |
| Support Agent (Tier 1) | 8 | $560k | Email, chat, KB, user onboarding |
| Dedicated CSMs (Enterprise) | 2 | $200k | Enterprise account management, proactive expansion |
| Support Operations Manager | 1 | $95k | Automation, workflows, analytics, knowledge management |
| Freelance/Contract Support | 3 FTE | $150k | Overflow, timezone coverage, flexible capacity |

**Total Support Budget (Scale):** ~$1.95M/year + tools

---

## 7. Support Metrics & KPIs

### 7.1 Operational Metrics (Tracked Real-Time in Zendesk)

| Metric | Target | Measurement | Owner |
|--------|--------|-------------|-------|
| **First Response Time (FRT)** | Meet SLA by tier | 95% of tickets | Support Lead |
| **Time to Resolution (TTR)** | Per SLA (4h–5d) | Average per category | Support Lead |
| **SLA Compliance Rate** | 98%+ | % tickets meeting response + resolution SLA | Support Lead |
| **First Contact Resolution (FCR)** | 75%+ | Tickets closed without escalation | Support Lead |
| **Ticket Volume/Week** | Track trend | Total tickets by tier/category | Support Ops |
| **Avg Response Time (Chat)** | <15 min (Enterprise) | Chat response latency | Chat tool analytics |
| **Escalation Rate** | <5% | % tickets escalated to Tier 2+ | Support Lead |

### 7.2 Customer Experience Metrics

| Metric | Target | Measurement | Owner |
|--------|--------|-------------|-------|
| **CSAT (Customer Satisfaction)** | 4.5+/5.0 | Post-resolution survey | Zendesk surveys |
| **NPS (Net Promoter Score)** | 50+ | Quarterly survey: "How likely to recommend?" | CEO + CS Director |
| **Effort Score (EFES)** | 3.5+/5.0 | "How easy was this to resolve?" | Zendesk surveys |
| **Ticket Sentiment** | 80%+ positive | AI sentiment analysis of responses | Zendesk AI |
| **Customer Retention** | 90%+ | Monthly churn rate (paid tiers only) | Finance + CEO |
| **Upsell Rate** | 15% | % free/Starter customers upgrading/renewing | Sales + CS |

### 7.3 Knowledge Base Metrics

| Metric | Target | Measurement | Owner |
|--------|--------|-------------|-------|
| **KB Article Search Rate** | 40%+ of support volume | % tickets that could be self-served | Support Lead |
| **KB Deflection Rate** | 25%+ | % customers resolving via KB without ticket | Zendesk Guide analytics |
| **Article Helpfulness Rating** | 4.2+/5.0 | "Was this article helpful?" (thumbs up/down) | Support Lead |
| **Top 5 Most-Read Articles** | Monitor monthly | Usage trends, signals content gaps | Support Ops |
| **Article Freshness** | 100% reviewed annually | Last updated dates, versioning | Support Lead |

### 7.4 Reporting Cadence

- **Daily:** SLA breach dashboard (Slack #support-metrics pinged at 6pm ET)
- **Weekly:** Ticket volume, FRT, TTR, top unresolved issues (Support Lead Monday morning review)
- **Monthly:** CSAT, NPS, FCR, escalation rate, KB deflection (Director review)
- **Quarterly:** Customer retention, churn analysis, roadmap impact (CEO + Board)

### 7.5 Sample Dashboard (Zendesk)

```
IPOReady Support Dashboard (Real-Time)

OPERATIONAL STATUS
├─ Open Tickets: 23 (9 overdue SLA, 14 at-risk)
├─ Today's Response Time: 1h 15m (Target: <2h)
├─ Avg Resolution Time (7-day): 2.3 days
├─ Backlog by Tier:
│  ├─ Free: 4 tickets (avg wait: 8h)
│  ├─ Starter: 6 tickets (avg wait: 3h)
│  ├─ Growth: 8 tickets (avg wait: 1h 30m)
│  └─ Enterprise: 5 tickets (avg wait: 45m)
│
CUSTOMER SATISFACTION (Last 7 days)
├─ CSAT: 4.6/5.0 (avg: 4.5)
├─ NPS: +52
├─ Effort Score: 3.8/5.0
└─ Sentiment: 85% positive
│
TOP ISSUES (This Week)
├─ 1. Document upload failures (5 tickets) — #engineering escalated
├─ 2. PACE™ calculation questions (4 tickets) — KB link provided
├─ 3. Payment method update (3 tickets) — Stripe issue, billing reviewed
│
TEAM UTILIZATION
├─ Support Agent 1: 6h tickets (capacity: 8h) — 75%
├─ Support Agent 2: 7h tickets (capacity: 8h) — 88%
└─ Support Lead (Tier 2/3): 4h tickets (capacity: 6h) — 67%
```

---

## 8. Tool Recommendations: Zendesk vs. Alternatives

### 8.1 Zendesk Support Platform (Recommended)

**Why Zendesk:**
- **Multi-channel unified inbox:** Email, chat, phone, social all in one Zendesk UI
- **Knowledge base (Guide):** Embedded KB with AI-powered search; deflects tickets
- **Automation & routing:** Smart ticket assignment by tier, category, SLA
- **Integrations:** Slack, GitHub, Stripe, Google Workspace, Neon (custom API)
- **Reporting:** Real-time dashboards, CSAT surveys, sentiment analysis
- **Scalability:** Grows from 50 to 500+ tickets/day without platform change
- **Security:** SOC 2 Type II, GDPR, encryption, audit logs (critical for IPO customers)

**Cost (Pilot Phase):**
- **Support Suite:** $1,200/mo (50 seats, agent team + CSM)
- **Guide (KB):** $300/mo (standard features)
- **Chat:** $500/mo (Growth/Enterprise in-app chat)
- **Analytics:** Included
- **Total:** ~$2,000/mo (~$24k/year)

**Implementation Timeline:**
- Week 1: Zendesk instance setup, custom fields (Company, Tier, Phase), integrations
- Week 2: Slack + GitHub + Stripe integrations, automation rules, ticket views
- Week 3: Knowledge base template setup, initial FAQ import (20 articles)
- Week 4: Staff training, go-live, monitor SLA compliance

### 8.2 Alternative: PostHog (for Product Analytics, not Support Ticketing)

**Use Case:** In addition to Zendesk, PostHog provides product usage analytics to identify where customers struggle (complements support data).

**Why PostHog (Complementary):**
- **Feature usage analytics:** Track which features users click, where they drop off
- **Cohort analysis:** Identify user segments (e.g., "customers using cap table in Phase 2")
- **Funnels:** Measure conversion from onboarding → checklist → documents
- **Session replay:** Watch how users interact with problem features (debugging support tickets)
- **Heatmaps:** See which UI elements confuse users
- **Integration:** PostHog data feeds into Zendesk context (e.g., "Customer opened PACE page 50x" → Signal high PACE™ questions)

**Cost (Pilot Phase):**
- **PostHog Cloud (free tier):** Up to 1M events/month (sufficient for 50 customers)
- **Growth tier:** $450/mo (10M events/month) if needed
- **Total:** ~$0–5k/year

**Integration with Zendesk:**
- Hook: When customer creates ticket, Zendesk fetch POST request to PostHog API
- Response: PostHog returns last 10 user sessions, feature heatmap
- Display: Support agent sees "User visited PACE page 3x, cap table 1x" in ticket context
- Result: Agent understands customer journey → faster diagnosis

### 8.3 Why NOT: Intercom, Freshdesk, Drift (for IPOReady)

| Tool | Why Not | Better For |
|------|---------|-----------|
| **Intercom** | Expensive for pilot phase ($449/mo), chat-first design (we need robust ticketing + KB first), unnecessary AI features | Conversational SaaS products with heavy self-serve chat |
| **Freshdesk** | Limited integrations, slower automation, weaker reporting, lower CSAT in complex workflows | Simpler support needs, smaller teams |
| **Drift** | Optimized for marketing conversations, poor ticketing UX, no compliance audit trails | B2B lead generation, marketing sales engagement |

---

## 9. Support Workflows & Automation

### 9.1 Ticket Intake & Auto-Categorization

```yaml
Trigger: Email arrives at support@ipoready.com
├─ Zendesk AI reads subject + body
├─ Auto-categories: Technical / Billing / Compliance / Feature Request / Other
├─ Auto-extracts company name from email domain or signature
├─ Queries customer DB for plan tier
├─ Tags "Urgent" if keywords: urgent, deadline, blocking, critical, filing, SEC, regulatory
├─ Routes to queue:
│  ├─ Free tier → Tier 1 queue (next business day response)
│  ├─ Starter tier → Tier 1 queue (same business day response)
│  ├─ Growth tier → Tier 2 queue (2-hour response)
│  ├─ Enterprise tier → Dedicated CSM + Tier 2 on-call
│  └─ Regulatory flag (YES) → CEO + GC review queue (1-hour response)
├─ Auto-sends acknowledgment: "Thanks for reaching out. We received your ticket #12345. [Response time: Tier 2 = ~2h]"
└─ Slack notification: #support-queue with ticket link
```

### 9.2 First-Response Workflow

```yaml
Trigger: Support agent opens assigned ticket
├─ Zendesk displays customer context:
│  ├─ Company name + tier + phase
│  ├─ Renewal date (if expiring soon)
│  ├─ PostHog session replay (last 3 sessions)
│  ├─ KB articles customer already viewed
│  └─ Previous tickets (to check for patterns)
├─ Agent response templates (based on category):
│  ├─ "Password Reset" → Quick link + 2FA troubleshooting
│  ├─ "Document Upload Stuck" → File size check + browser cache reset + link to KB #18
│  ├─ "PACE™ Question" → Explanation + link to KB #2 + calculator link
│  ├─ "Feature Request" → Thank you + add to #feature-requests in GitHub + monthly update promise
│  └─ "Regulatory Question" → Escalate to GC (Zendesk automation)
├─ Auto-tag: Problem type + attempted resolution
└─ Slack notification sent to agent's DM
```

### 9.3 Escalation Workflow

```yaml
Trigger: Agent clicks "Escalate to Support Lead"
├─ Ticket moves to Support Lead queue
├─ Customer notified: "We're connecting you with a specialist. ETA: 1 business day."
├─ Support Lead decision tree:
│  ├─ IF technical → ping #support-eng in Slack, create GitHub issue
│  ├─ IF regulatory → forward to GC + CEO (Zendesk workflow)
│  ├─ IF data integrity → page on-call VP Eng (PagerDuty integration)
│  ├─ IF customer retention risk → CEO notified, 1:1 call offered
│  └─ IF product request → add to #product-feedback (GitHub Discussions)
├─ Ticket tagged with escalation reason
└─ ETA updated to customer
```

### 9.4 Resolution & Closure Workflow

```yaml
Trigger: Agent marks ticket "Resolved" or "Closed"
├─ If NO customer response in 3 days → Auto-close with survey
├─ If customer replied → Re-open ticket
├─ Survey sent automatically:
│  ├─ "Was your issue resolved?" (Yes/No)
│  ├─ "Rate your experience" (CSAT 1–5 stars)
│  ├─ "How easy was it?" (Effort 1–5)
│  └─ "What could we improve?" (open text, optional)
├─ Results feed Zendesk analytics dashboard
├─ If CSAT < 3 → Support Lead auto-reviews ticket
└─ Email sent: "Your ticket #12345 is closed. Reply to reopen."
```

---

## 10. Proactive Support & Customer Education

### 10.1 Onboarding Support

- **Welcome email:** Sent 1 hour after account creation, welcome video + onboarding checklist + link to KB
- **In-app tutorial:** Framer Motion walkthrough of dashboard → checklist → documents (skippable)
- **Role-specific guides:** 
  - CEO → Dashboard + PACE™ velocity + board reporting
  - GC → Checklist + regulatory citations + compliance tracking
  - CFO → Cap table + templates + document management
- **Live onboarding (Enterprise):** 1:1 zoom call with CSM (30 min) to set up team + customizations

### 10.2 Proactive Outreach

**Trigger-Based Emails (Automated, via Segment or custom API):**

| Trigger | Email | Purpose |
|---------|-------|---------|
| Day 3 after signup | "Getting Started" guide | Drive feature exploration |
| First checklist task completed | "Next Steps" suggestions | Maintain momentum |
| 7 days no login | "We miss you" + feature highlight | Re-engagement |
| Phase transition (e.g., → Phase 3) | Phase-specific checklist guide | Timely education |
| 14 days to renewal | Renewal reminder + plan comparison | Reduce churn |
| PACE™ dropped >10 points (week-over-week) | "Your velocity declined" + remediation steps | Proactive intervention |
| Enterprise customer + no team member added | "Invite your team to collaborate" | Adoption driver |

### 10.3 Monthly Customer Education Newsletter

**"IPOReady Insights" (Sent 1st of month)**

- **Segment:** By tier + phase (Free/Starter users = general tips; Growth/Enterprise = advanced features)
- **Content:**
  1. Tip of the month (e.g., "Cap table scenario modeling for tax planning")
  2. Regulatory update (e.g., "SEC updated S-1 filing requirements—here's what changed")
  3. Customer spotlight (e.g., "How TechCorp reduced IPO readiness by 3 months using PACE™")
  4. Feature update (e.g., "Now available: Slack notifications for critical milestones")
  5. Upcoming webinar invitation (monthly, free for all tiers)
- **Unsubscribe:** Per-email category opt-out (e.g., "Unsubscribe from regulatory updates only")

### 10.4 Webinars & Training (Monthly, Free for All)

| Webinar | Audience | Frequency | Owner |
|---------|----------|-----------|-------|
| "PACE™ 101: Understanding Your Score" | All | Monthly | CEO + Support Lead |
| "Cap Table Deep Dive: Scenario Modeling" | Growth+ | Monthly | VP Fin + Support Lead |
| "Checklist Fast-Track: Expert Tips" | All | Bi-weekly | GC + Support Lead |
| "Template Customization: From Generic to Your Deal" | Growth+ | Monthly | VP Product + Support Lead |
| "Regulatory Requirements: TSX vs. NASDAQ" | All | Quarterly | GC + VP Ops |

**Registration:** WebinarJam or Zoom (linked from KB)  
**Archive:** Recordings saved to YouTube (unlisted, linked from KB)  
**Attendance incentive:** Free template unlock (for Starter tier)

---

## 11. Crisis Management & Incident Response

### 11.1 Critical Issue Response Playbook

**Definition:** System downtime (>30 min), data loss, security breach, or regulatory filing deadline at risk

**Immediate Actions (0–15 min):**
1. On-call engineer notified (phone + Slack)
2. Status page updated: ipoready-status.com → "Investigating" (public for Enterprise)
3. All affected customers notified: Email + in-app banner
4. Slack channel #incident-response created (real-time team sync)

**Ongoing (15 min–2 hours):**
5. VP Eng leads investigation; updates #incident-response every 15 min
6. Support Lead fields customer calls (direct phone line or Slack)
7. CEO on standby for Enterprise customer contact
8. PostMortem template prepared (even if issue resolves before postmortem)

**Resolution (2+ hours if unresolved):**
9. CEO calls top 5 Enterprise customers (personal accountability)
10. Press release drafted (if downtime >2 hours and public-facing)
11. Root cause analysis scheduled (within 24 hours)
12. Credits/compensation offered (1 month free for Enterprise, 1 week for Growth; CSM approval)

**Post-Incident (24–48 hours):**
13. Postmortem published: ipoready.com/incident-reports
14. Remediation plan shared with customers
15. Follow-up email: "We're sorry. Here's what happened and how we're preventing it."
16. CSAT survey sent to affected customers (quick pulse check)

### 11.2 Incident Response Team Structure

- **Incident Commander:** On-duty support lead (coordinates, customer comms)
- **Technical Lead:** VP Engineering (root cause, remediation)
- **Customer Lead:** CSM (Enterprise customer relationship maintenance)
- **Executive Sponsor:** CEO (final approval on communications, credits)
- **Communications:** Marketing (status page, press release if needed)

### 11.3 Incident Severity Levels

| Level | Definition | Response Time | Owner | Escalation |
|-------|-----------|----------------|-------|------------|
| **P1 (Critical)** | Complete system down, data loss, security breach | 5 min page-out | VP Eng + CEO | Immediate |
| **P2 (High)** | Core feature broken (e.g., checklist not loading), major slowdown | 30 min | VP Eng | Within 15 min to CEO |
| **P3 (Medium)** | Non-critical feature broken (e.g., export fails), affecting <10 users | 2 hours | Support Lead → VP Eng | If not resolved in 4h |
| **P4 (Low)** | Minor bugs, UI glitches, affecting single user or low-priority feature | 24 hours | Support Agent | If not resolved in 2 days |

---

## 12. Competitive Advantage: Support as a Product Feature

IPOReady's support is not just reactive—it's a strategic differentiator during a mission-critical 18-month journey.

### 12.1 "Support as Confidence" Positioning

**Customer perception:**
> "When we're a few weeks from filing, the last thing we want is to wonder if our platform is reliable. IPOReady doesn't just provide tools—it provides peace of mind. Their support team has walked 50+ companies through the IPO process. They know the regulatory risks, they understand our timeline, and they're available 24/7."

**Marketing message:**
- "One-hour response time (Enterprise)" + "98%+ SLA compliance" prominently featured on pricing page
- Case study: "How IPOReady's on-call engineer prevented a missed SEC filing deadline" (anonymized company)
- Trust badges: "SOC 2 Type II certified," "ISO 27001," "GDPR & HIPAA compliant"

### 12.2 Support KPIs in Sales Conversations

**Talking points for Enterprise prospects:**

| Scenario | Support Advantage |
|----------|-------------------|
| "We're 6 months from TSX listing" | "Our PACE™ metric gives you real-time risk flags. Our support team has guided 30+ TSX filings—we'll catch issues before they become crises." |
| "Our legal team needs guidance on regulatory requirements" | "Our GC is available for regulatory consultation (included in Enterprise). You're not alone—leverage our 18 months of IPO experience." |
| "We have 50+ stakeholders, can't afford mistakes" | "Dedicated CSM + 1-hour SLA + monthly webinars ensure your entire team stays aligned and informed." |
| "We've had bad experiences with support platforms before" | "97% of our Enterprise customers rate us 4.5+/5 on CSAT. Here's the data: [Show dashboard]. We walk the walk." |

---

## 13. Knowledge Capture & Continuous Improvement

### 13.1 After-Action Reviews (Monthly)

**Scheduled:** 3rd Friday of month, 30 min, support team + VP Product

**Agenda:**
1. **Top 5 Tickets:** Discuss unresolved or escalated issues
   - Root cause: User confusion, product bug, undocumented feature?
   - Remediation: KB article, UI tweak, bug fix, documentation update?
2. **Metric Review:** CSAT, NPS, FCR, ticket volume trends
3. **Process Improvements:** What's working, what's breaking?
4. **Roadmap Impact:** Feature requests that appear in 3+ tickets this month
5. **Training Needs:** Are agents equipped to handle growth? Need training?

**Output:** Action items tracked in GitHub #support (tagged "process-improvement")

### 13.2 Quarterly Business Review (QBR)

**With CEO + CFO:**

- Support budget vs. spend
- Customer retention (churned + renewing customers)
- Revenue impact (support issues preventing upgrades?)
- Team utilization (hire needed? Burnout risk?)
- Strategic initiatives (new support channel, expanded hours, outsourcing?)

---

## 14. Implementation Timeline

### Week 1: Setup & Integration
- [ ] Zendesk instance provisioned (ipoready.zendesk.com)
- [ ] Custom fields configured (Tier, Company, Phase, Regulatory Flag)
- [ ] Slack integration active (notifications in #support-queue)
- [ ] GitHub integration active (bugs → issues)
- [ ] Stripe integration active (billing context in tickets)

### Week 2: Automation & Workflows
- [ ] Ticket auto-assignment rules (by tier/category)
- [ ] Escalation workflows (Tier 1 → Tier 2 → VP Eng)
- [ ] Auto-close workflow (3-day inactivity)
- [ ] CSAT survey template configured
- [ ] Emergency SLA dashboard created

### Week 3: Knowledge Base
- [ ] 20 FAQ articles drafted (by Support Lead + Product)
- [ ] KB structure finalized (8 categories)
- [ ] Search indexing tested
- [ ] KB article templates created
- [ ] Governance process documented

### Week 4: Team & Training
- [ ] Support Lead + Agent hired/trained
- [ ] On-call rotation schedule published (PagerDuty setup)
- [ ] Zendesk tool training (2 hours for team)
- [ ] Incident response playbook finalized
- [ ] Go-live communication sent to pilot customers

### Week 5: Monitoring & Optimization
- [ ] SLA compliance tracked (daily)
- [ ] Customer feedback reviewed (weekly)
- [ ] KB deflection metrics tracked (weekly)
- [ ] First optimization pass on FAQ (based on real tickets)

---

## 15. Budget Summary

### Pilot Phase (Months 1–3, 50 customers)

| Category | Cost | Notes |
|----------|------|-------|
| **Zendesk SaaS** | $24k/year | Support + Guide + Chat |
| **Support Staff** | $190k/year | 1 Lead + 1 Agent (T1) |
| **PostHog (optional)** | $5k/year | Product analytics |
| **Zoom (webinars)** | $2k/year | Monthly training |
| **Slack integrations** | $0 | Native integration |
| **PagerDuty (optional)** | $1.2k/year | On-call scheduling |
| **Total** | **$222k/year** | ~$18.5k/month |

### Growth Phase (Months 4–12, 150–300 customers)

| Category | Cost | Notes |
|----------|------|-------|
| **Zendesk SaaS** | $36k/year | 80 seats, more integrations |
| **Support Staff** | $770k/year | 2 Leads + 3 Agents (T1) + 1 CSM + 1 Ops |
| **PostHog** | $5k/year | Scale tier |
| **Webinars + Training** | $5k/year | Expanded content |
| **Tools & integrations** | $3k/year | Misc. |
| **Total** | **$819k/year** | ~$68k/month |

---

## 16. Success Criteria (Launch Metrics)

By end of Pilot Phase (3 months):

- [ ] **98%+ SLA compliance** (response time met for 98%+ of tickets)
- [ ] **75%+ first-contact resolution rate** (ticket closed without escalation)
- [ ] **4.5+/5 CSAT** (customer satisfaction score)
- [ ] **<5% escalation rate** (tickets escalated to VP Eng)
- [ ] **25%+ KB deflection rate** (customers resolving via FAQ without ticket)
- [ ] **<24-hour average response time** (Free tier: 1-day, Starter: 4h, Growth: 2h, Enterprise: 1h)
- [ ] **90%+ customer retention** (no churn attributable to support quality)
- [ ] **NPS 40+** (mid-market benchmark; 50+ by month 6)

---

## 17. Appendix: Support Communication Templates

### Template A: Acknowledgment Email (Auto-Sent)

```
Subject: We received your request [#12345]

Hi [Customer Name],

Thanks for reaching out to IPOReady Support. We've received your inquiry and 
assigned it to our team.

Ticket Number: #12345
Your Plan: [Growth / Enterprise]
Expected Response: < 2 hours

In the meantime, you might find this helpful:
→ [Link to relevant KB article, if applicable]

If it's urgent, please reply to this email and mark it "URGENT" in the subject line.

Best,
IPOReady Support Team
support@ipoready.com | status.ipoready.com
```

### Template B: Escalation to Customer (Standard)

```
Subject: Your ticket escalated to our specialist [#12345]

Hi [Customer Name],

We've reviewed your ticket and are connecting you with our Technical Specialist 
to dig deeper. You should hear from them within [4 hours / next business day].

In the meantime, here are some resources:
→ [Link to KB section]
→ [Link to similar resolved ticket]

Thanks for your patience!

IPOReady Support Team
```

### Template C: Incident Notification (P1)

```
Subject: URGENT: IPOReady service interruption [INC-2026-06-07-001]

Hi [Customer Name],

We're experiencing a service interruption affecting [checklist / documents / exports] 
functionality. Our team is actively investigating.

Current Status: Investigating
Started: 2026-06-07 14:30 ET
Last Update: 14:45 ET

Real-time updates: status.ipoready.com
Follow progress: Refresh this page or check your inbox

We apologize for the disruption. We'll update you every 15 minutes.

IPOReady Support Team
```

### Template D: Post-Incident Apology

```
Subject: Resolution complete: IPOReady service restored [INC-2026-06-07-001]

Hi [Customer Name],

We've successfully restored service at 2026-06-07 16:20 ET. 

Duration: 1 hour 50 minutes
Root cause: Database connection pool exhaustion
Prevention: Added auto-scaling rule to prevent recurrence

What we've done for you:
✓ Extended your renewal date by 1 week (no charge)
✓ Scheduled a 1:1 with our VP Eng to review infrastructure resilience (optional)
✓ Posted incident report: https://ipoready.com/incident-reports/INC-2026-06-07-001

We take your trust seriously. If you have questions, I'm here to help.

[Support Lead Name]
Director of Customer Success
[Phone] | support@ipoready.com
```

---

## Document Metadata

**Version:** 1.0  
**Last Updated:** June 2026  
**Next Review:** September 2026  
**Owner:** Support Lead (with CEO, VP Eng, GC input)  
**Status:** Ready for Implementation (Pilot Phase)

---

**End of Support Plan Document**
