# IPOReady: AI Capital Markets Operating System Architecture

## Strategic Vision

IPOReady evolves from a document/task tracker to an **autonomous IPO execution team** that behaves like elite capital markets advisors while respecting human approval boundaries.

**Not:** "IPO software"
**But:** The AI Capital Markets Operating System

---

## Current State → Evolved State

### Current (MVP):
- Task checklist by phase
- PACE score (task completion weighted average)
- Document tracker
- Billing/subscription

### Evolved (Phase 2 - with Agent Layer):
- Autonomous agent orchestration
- Multi-specialist agent teams (9 agent types)
- Real-time readiness scoring with predictive factors
- Proactive risk flagging & sequencing validation
- Post-IPO compliance lifecycle

---

## Architecture: 4-Layer Stack

```
┌─────────────────────────────────────────────────────────┐
│ PRESENTATION LAYER (Existing)                           │
│ • Dashboard, PACE cards, documents, checklists          │
│ • Agent insights injected into existing UI              │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ ORCHESTRATION LAYER (NEW - Agent Framework)             │
│ • IPO Chief of Staff Agent (master orchestrator)        │
│ • Agent message bus & context sharing                   │
│ • Approval workflow routing                             │
│ • Knowledge graph (tasks, dependencies, deadlines)      │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ SPECIALIST AGENTS LAYER (NEW - 9 Agent Types)           │
│ └─ Executive Layer (CEO, CFO, Board)                    │
│ └─ Legal & Securities Layer (Securities, Disclosure)    │
│ └─ Finance & Audit Layer (Audit, Financial Reporting)   │
│ └─ Capital Markets Layer (IB Coord, Market Readiness)   │
│ └─ Operational Layer (IR, Exchange, Due Diligence)      │
│ └─ Post-IPO Layer (Compliance Agent)                    │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ DATA & KNOWLEDGE LAYER (Existing + Enhanced)            │
│ • Database (companies, tasks, documents, benchmarks)    │
│ • Knowledge Base (SEC rules, law firm checklists,       │
│   exchange requirements, regulatory frameworks,         │
│   public filings - SEDAR+, EDGAR)                       │
│ • Company State (PACE factors, milestones, risks)       │
└─────────────────────────────────────────────────────────┘
```

---

## File Structure: Where Code Goes

```
src/
├── lib/
│   ├── ai-companion.ts (EXISTING - Anthropic integration)
│   │   └── Extend: Load agent context, route to agents
│   │
│   ├── agents/ (NEW - Agent implementations)
│   │   ├── types.ts
│   │   │   ├── AgentContext (shared state passed to all agents)
│   │   │   ├── AgentAction (what agents return: recommendations, flags, tasks)
│   │   │   ├── AgentRole (enum of agent types)
│   │   │   └── ApprovalBoundary (what needs human sign-off)
│   │   │
│   │   ├── orchestrator.ts (MASTER - Chief of Staff Agent)
│   │   │   ├── loadContextForCompany(companyId)
│   │   │   ├── identifyBlockers(companyId) → returns list of risks
│   │   │   ├── orchestrateAgents(companyId) → calls specialists in dependency order
│   │   │   ├── flagExceptionToApprover(risk, context, approver_type)
│   │   │   └── scheduleProactiveChecks(companyId)
│   │   │
│   │   ├── executive/ (NEW - C-suite agents)
│   │   │   ├── ceo-advisor.ts
│   │   │   │   ├── coachOnReadiness(context)
│   │   │   │   ├── prepareFounderDiligence(context)
│   │   │   │   └── assessInvestorNarrative(context)
│   │   │   │
│   │   │   ├── cfo-capital-markets.ts
│   │   │   │   ├── assessFinancialReadiness(context)
│   │   │   │   ├── checkReportingQuality(context)
│   │   │   │   ├── modelPublicCompanyForecasts(context)
│   │   │   │   └── identifyInternalControlsGaps(context)
│   │   │   │
│   │   │   └── board-governance.ts
│   │   │       ├── assessBoardReadiness(context)
│   │   │       ├── flagGovernanceGaps(context)
│   │   │       └── recommendCommitteeSetup(context)
│   │   │
│   │   ├── legal-securities/ (NEW - Regulatory agents)
│   │   │   ├── securities-counsel.ts
│   │   │   │   ├── orchestrateFilings(exchange, context)
│   │   │   │   ├── validateDisclosureReadiness(context)
│   │   │   │   ├── trackSECComments(context)
│   │   │   │   └── recommendLegalReview(risk_category, context)
│   │   │   │
│   │   │   └── disclosure-agent.ts
│   │   │       ├── suggestMDnA(context)
│   │   │       ├── generateRiskFactors(context)
│   │   │       ├── validateConsistency(context)
│   │   │       └── checkDisclosureControls(context)
│   │   │
│   │   ├── finance-audit/ (NEW - Financial readiness)
│   │   │   ├── audit-readiness.ts
│   │   │   │   ├── assessPCAOBReadiness(context)
│   │   │   │   ├── flagAuditBlockers(context)
│   │   │   │   ├── validateFinancialStatements(context)
│   │   │   │   └── detectRevenueRecognitionRisks(context)
│   │   │   │
│   │   │   └── financial-reporting.ts
│   │   │       ├── prepareHistoricalStatements(context)
│   │   │       ├── prepareQuarterlyReporting(context)
│   │   │       ├── generateProFormas(context)
│   │   │       └── modelEPS(context)
│   │   │
│   │   ├── capital-markets/ (NEW - Market execution)
│   │   │   ├── ib-coordination.ts
│   │   │   │   ├── coordinateWithBankers(context)
│   │   │   │   ├── manageComparableSet(context)
│   │   │   │   ├── trackInvestorTargets(context)
│   │   │   │   └── updateValuationScenarios(context)
│   │   │   │
│   │   │   └── market-readiness.ts
│   │   │       ├── assessIPOWindow(context)
│   │   │       ├── monitorSectorSentiment(context)
│   │   │       ├── compareToIdealTiming(context)
│   │   │       └── assessVolatilityImpact(context)
│   │   │
│   │   ├── operations/ (NEW - Execution agents)
│   │   │   ├── exchange-readiness.ts
│   │   │   │   ├── validateListingEligibility(exchange, context)
│   │   │   │   ├── detectExchangeDeficiencies(exchange, context)
│   │   │   │   ├── checkFloatRequirements(context)
│   │   │   │   └── assessGovernanceRequirements(exchange, context)
│   │   │   │
│   │   │   ├── ir-agent.ts
│   │   │   │   ├── prepareInvestorMessaging(context)
│   │   │   │   ├── generateFAQs(context)
│   │   │   │   ├── prepareEarningsScript(context)
│   │   │   │   └── manageAnalystFeedback(context)
│   │   │   │
│   │   │   └── due-diligence.ts
│   │   │       ├── collectMissingDocs(context)
│   │   │       ├── organizeDueDisligenceRoom(context)
│   │   │       ├── detectMissingEvidence(context)
│   │   │       ├── autoFollowUp(context)
│   │   │       └── categorizeByRisk(context)
│   │   │
│   │   └── post-ipo/ (NEW - Compliance & retention)
│   │       └── compliance-agent.ts
│   │           ├── monitorInsiderTradingWindows(context)
│   │           ├── trackQuarterlyFilings(context)
│   │           ├── validateEarningsReadiness(context)
│   │           ├── monitorDisclosureDeadlines(context)
│   │           └── checkGovernanceCompliance(context)
│   │
│   ├── agent-knowledge/ (NEW - Knowledge bases)
│   │   ├── sec-rules.ts
│   │   │   ├── S-1 filing requirements
│   │   │   ├── Common SEC comment patterns (by issue)
│   │   │   ├── Disclosure rules (Item 105, Item 7, etc.)
│   │   │   └── Timeline expectations
│   │   │
│   │   ├── canadian-securities.ts
│   │   │   ├── NI 41-101 (prospectus requirements)
│   │   │   ├── CSA multi-jurisdictional guidance
│   │   │   ├── SEDAR+ filing checklists
│   │   │   └── Continuous disclosure rules
│   │   │
│   │   ├── exchange-rules.ts
│   │   │   ├── TSX listing standards
│   │   │   ├── NASDAQ listing standards
│   │   │   ├── NYSE listing standards
│   │   │   ├── TSXv/CSE/OTC/JSE rules
│   │   │   └── Float & governance requirements
│   │   │
│   │   ├── law-firm-checklists.ts
│   │   │   ├── Cooley IPO checklist
│   │   │   ├── Latham & Watkins IPO checklist
│   │   │   ├── Goodwin Procter IPO checklist
│   │   │   └── Osler Hoskin & Harcourt checklists
│   │   │
│   │   ├── public-filings.ts
│   │   │   ├── EDGAR S-1 corpus (patterns, examples)
│   │   │   ├── SEDAR prospectus corpus
│   │   │   ├── MD&A patterns by sector
│   │   │   ├── Risk factor templates (by sector/exchange)
│   │   │   └── Disclosure comparables (peer benchmarks)
│   │   │
│   │   └── ipo-benchmarks.ts
│   │       ├── Historical IPO timelines by exchange
│   │       ├── Phase progression curves
│   │       ├── Team readiness benchmarks
│   │       └── Funding burn rate expectations
│   │
│   ├── agent-api.ts (NEW - API layer for agents)
│   │   ├── POST /api/agents/orchestrate
│   │   │   └── Trigger full agent analysis for company
│   │   │
│   │   ├── GET /api/agents/status/:companyId
│   │   │   └── Get latest agent recommendations & flags
│   │   │
│   │   ├── POST /api/agents/request-approval
│   │   │   └── Route decision to appropriate approver
│   │   │
│   │   ├── GET /api/agents/blockers/:companyId
│   │   │   └── List top blockers identified by agents
│   │   │
│   │   └── POST /api/agents/feedback
│   │       └── User feedback → improve agent recommendations
│   │
│   └── agent-context.ts (NEW - Shared state)
│       ├── CompanyContext {
│       │   id, name, sector, exchange, listing_type,
│       │   pace_score, current_phase, estimated_days_to_ipo,
│       │   cash_runway_months, team_size, cfo_hired_at, board_size,
│       │   auditor_selected, investor_sophistication,
│       │   tasks[], documents[], milestones[], risks[]
│       │ }
│       ├── AgentRequest { agent_role, action, context, timestamp }
│       ├── AgentResponse {
│       │   agent_role, insights[], recommendations[], 
│       │   flags[], approval_requests[], tasks_to_create[]
│       │ }
│       └── ApprovalWorkflow {
│           type (legal_decision, accounting_opinion, valuation, audit_signoff),
│           requester_agent, required_approver,
│           evidence[], timestamp, resolved_at, resolution
│         }
│
├── app/api/
│   ├── agents/ (NEW - Agent API endpoints)
│   │   ├── orchestrate/route.ts
│   │   ├── status/route.ts
│   │   ├── blockers/route.ts
│   │   ├── approve/route.ts
│   │   └── feedback/route.ts
│   │
│   ├── pace/scores/route.ts (ENHANCED)
│   │   └── Add agent insights to response
│   │
│   ├── tasks/route.ts (ENHANCED)
│   │   └── Agent-created tasks include source agent reference
│   │
│   └── companies/:id/route.ts (ENHANCED)
│       └── Include agent status, blockers, recommendations
│
└── app/dashboard/ (ENHANCED)
    ├── page.tsx
    │   └── Add "Agent Insights" card showing top blockers
    │
    ├── components/
    │   ├── AgentBlockersCard.tsx
    │   │   └── Top 3-5 risks identified by agent team
    │   │
    │   ├── AgentRecommendationsCard.tsx
    │   │   └── Prioritized next actions from agents
    │   │
    │   ├── AgentApprovalQueue.tsx
    │   │   └── Pending human approvals (legal, accounting, etc.)
    │   │
    │   └── AgentOrchestrationStatus.tsx
    │       └── When agents last ran, what they found, next check scheduled
```

---

## Agent Capabilities & Boundaries

### ✅ AI Autonomously:
- **Tracks:** deadlines, compliance requirements, document statuses
- **Drafts:** MD&A sections, risk factors, disclosure suggestions
- **Validates:** consistency, completeness, peer comparables
- **Organizes:** due diligence, documentation, evidence collection
- **Flags:** risks, missing documents, sequencing violations, deficiencies
- **Recommends:** next actions, risk mitigations, team additions
- **Orchestrates:** task dependencies, timeline adjustments, escalations

### ❌ Humans Approve (Never Autonomous):
- Legal advice (only AI recommends legal review)
- Accounting opinions (only AI validates against standards)
- Valuation opinions (only AI tracks comps & suggests review points)
- Underwriter pricing (AI models scenarios, human decides)
- Audit signoff (AI prepares evidence, auditor signs)
- Securities law judgments (AI detects gaps, lawyer judges legality)

---

## Integration Points: How Agents Feed Current UI

### Dashboard (app/dashboard/page.tsx)
**Current:** PACE score card, current phase, task count
**Enhanced:**
```
┌─────────────────────────────────────────────┐
│ PACE Score: 58% (Behind Schedule)           │
│ Current Phase: Financial Audit              │
│                                             │
│ ⚠️ Agent Blockers (3 items)                 │
│ ├─ CFO not yet hired → 15% slower timeline |
│ ├─ Auditor selection missing → blocks audit|
│ └─ Cap table cleaning unfinished           │
│                                             │
│ 🎯 Agent Recommendations                   │
│ ├─ Hire CFO within 30 days (confidence: 92%)|
│ ├─ Select Big 4 auditor (compliance gate)  │
│ └─ Complete cap table cleanup (evidence)   │
│                                             │
│ ✓ Next Agent Checks: In 7 days at 9am     │
└─────────────────────────────────────────────┘
```

### PACE Page (app/pace/page.tsx)
**Current:** Phase breakdown, benchmarks, sequencing alerts
**Enhanced:**
```
┌─────────────────────────────────────────────┐
│ Peer Comparison                             │
│ Your Company: 58%                           │
│ TSXv Median:   65%                          │
│ TSXv P90:      78%                          │
│                                             │
│ 📊 Agent Analysis:                          │
│ "Your financial audit phase is 2.5 weeks   |
│ behind median TSXv companies. CFO absence  |
│ is primary driver. Recommended: Urgent CFO |
│ hiring to recover 14 days."                |
│                                             │
│ ⚠️ Sequencing Alerts                       │
│ ├─ ✓ Legal docs started before filing     |
│ ├─ ✗ Board formation before roadshow      |
│ └─ ⚠️ Cap table should be clean NOW       |
└─────────────────────────────────────────────┘
```

### Documents Page (app/documents/page.tsx)
**Current:** Document library with completion %, dates
**Enhanced:**
```
┌─────────────────────────────────────────────┐
│ 📄 Articles of Incorporation                |
│ Status: FINAL | 95% → 100% (ready)         |
│ Last Updated: 2 days ago                   |
│ 🤖 Agent: "Complete ✓ Per regulatory req" |
│                                             │
│ 📄 Audited Financial Statements            |
│ Status: IN PROGRESS | 45% → needs work     |
│ Last Updated: 5 days ago (stale!)          |
│ 🤖 Agent: "BLOCKED: Waiting for auditor   |
│ engagement. Recommend expedite selection."|
│                                             │
│ 📄 Board Meeting Minutes                    |
│ Status: NOT STARTED | 0%                   |
│ 🤖 Agent: "Missing: Required for board    |
│ independence validation. Start immediately.|
│ Gap: 8 items from Cooley checklist."      |
└─────────────────────────────────────────────┘
```

### Tasks (app/checklist/page.tsx)
**Current:** Task list with status, assigned_to, due_date
**Enhanced:**
```
┌─────────────────────────────────────────────┐
│ Task: Hire CFO                              |
│ Phase: Corporate Restructuring              |
│ Status: NOT STARTED | Due: 2026-06-30     |
│ Priority: CRITICAL                         │
│ ⚠️ BLOCKED by: Agent CFO recommendation   |
│                                             │
│ 🤖 CFO Agent Insights:                     |
│ "CFO appointment is critical path item.   |
│ Your timeline assumes CFO by week 6.       |
│ Without CFO: +18 days to IPO date.         |
│ Comparable companies hired at similar      |
│ stage → recommend start recruiting now."  |
│                                             │
│ 📎 Related Tasks Created by Agents:        |
│ ├─ Search CFO candidates (created by CEO Agent)
│ ├─ Brief board on CFO hiring (Board Agent) |
│ └─ Prepare CFO offer package (CEO Agent)   |
└─────────────────────────────────────────────┘
```

---

## Agent Orchestration Flow: Example

### Trigger: Daily 9am Agent Run
```
1. Chief of Staff Agent (orchestrator) wakes up
   └─ Load company context (PACE, phase, factors, tasks, docs)
   
2. Route to specialist agents (in dependency order):
   ├─ Exchange Readiness Agent
   │  └─ "Are we even eligible for TSXv yet?"
   │  └─ Return: [✓ eligible, 2 minor doc gaps]
   │
   ├─ CFO Agent (capital markets)
   │  └─ "Is financial reporting ready?"
   │  └─ Return: [✗ CFO not hired, ✗ audit blocked]
   │
   ├─ Securities Counsel Agent
   │  └─ "Are disclosures complete & consistent?"
   │  └─ Return: [⚠️ risk factors incomplete, ✓ MD&A structure good]
   │
   ├─ Board Governance Agent
   │  └─ "Is board ready for public company?"
   │  └─ Return: [⚠️ missing 1 independent director]
   │
   └─ Due Diligence Agent
      └─ "Do we have all evidence?"
      └─ Return: [✗ missing 3 vendor contracts]

3. Chief of Staff Synthesizes:
   ├─ Identify top 3 blockers
   ├─ Prioritize recommendations
   ├─ Create tasks for missed items
   ├─ Flag items needing human approval
   │  ├─ "Should we hire interim CFO vs wait?" (CEO decides)
   │  └─ "Is our risk disclosure legally adequate?" (legal reviews)
   │
   └─ Schedule next check: +7 days

4. Update Dashboard:
   ├─ Inject blockers card
   ├─ Inject recommendations card
   ├─ Create approval queue if needed
   └─ Log agent run (for audit trail)
```

---

## Implementation Phasing

### Phase 2a: Foundation (Weeks 1-2)
- [ ] Agent framework & context types
- [ ] Orchestrator agent (master coordinator)
- [ ] Chief of Staff agent implementation
- [ ] Agent API endpoints

### Phase 2b: Specialist Agents (Weeks 3-4)
- [ ] Executive layer (CEO, CFO, Board agents)
- [ ] Legal/Securities layer (Securities Counsel, Disclosure)
- [ ] Finance layer (Audit Readiness, Financial Reporting)

### Phase 2c: Operations Layer (Weeks 5-6)
- [ ] Exchange Readiness agent
- [ ] IR Agent
- [ ] Due Diligence Agent
- [ ] Capital Markets layer (IB Coordination, Market Readiness)

### Phase 2d: Post-IPO + UI Integration (Weeks 7-8)
- [ ] Compliance Agent
- [ ] Dashboard integration (blockers, recommendations cards)
- [ ] PACE page enhancements
- [ ] Documents page agent insights
- [ ] Approval workflow UI

---

## Success Metrics

✅ Agents proactively identify blockers 2+ weeks before impact
✅ PACE score includes agent predictive factors (not just task %)
✅ Dashboard shows AI insights alongside metrics
✅ Users can see which agent made each recommendation
✅ Approval queue reduces CFO/CEO decision time to <2 hours
✅ Post-IPO compliance agent creates sticky ARR (sticky coefficient >95%)

---

## Knowledge Base Sources (Priority Order)

1. **Public Filings Database (HIGHEST ROI)**
   - EDGAR S-1 corpus (scraped SEC filings)
   - SEDAR+ prospectus corpus
   - Pattern extraction: risk factors by sector, MD&A structures

2. **Securities Regulators**
   - SEC rules, comment patterns, guidance
   - Canadian Securities Administrators (NI 41-101, etc.)

3. **Law Firm Checklists**
   - Cooley, Latham, Goodwin, Osler public IPO guides
   - Structured requirements by phase

4. **Historical IPO Data**
   - Timeline benchmarks by exchange & sector
   - Team size vs. duration correlations

5. **Investment Banks**
   - Roadshow prep frameworks
   - Comps methodology
   - Valuation scenario templates

---

## Why This is the Moat

1. **Irreplaceable**: Once embedded, replacing IPOReady means losing all agent context & historical decisions
2. **Proprietary Knowledge**: Your public filing corpus & agent learning become defensible assets
3. **Network Effects**: Every company that uses IPOReady adds data → agents get smarter → stickier product
4. **Sticky ARR**: Post-IPO compliance agent creates recurring value for 10+ years
5. **Regulatory Defensibility**: Agents never make legal/accounting decisions → compliance clean

This is not "document management software."

This is the operating system for going public.
