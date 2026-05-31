# IPO Coach: World-Class Proactive AI Agent
**"We own the data. We own the value. AI is the tool."**

---

## CORE PHILOSOPHY

**The IPO Coach is not a chatbot.**

It's a proactive agent that:
1. **Watches your data continuously** (not just when you ask)
2. **Predicts what will break your deal** (before you realize it)
3. **Tells you exactly what to do next** (with step-by-step plans)
4. **Learns from every IPO** (getting smarter, not dumber)
5. **Speaks in founder/CFO language** (never jargon)

**We pay for AI. You benefit from 100+ IPO datapoints we own.**

---

## IPO COACH CAPABILITIES

### 1. PROACTIVE ALERTS (Real-Time Monitoring)

#### System monitors for:

**TIMELINE RISKS**
- If cap table cleanup pace → audit delay (warn 45 days early)
- If board recruitment pace → can't meet governance deadline (warn 30 days early)
- If legal doc completion → regulatory filing delay (warn 60 days early)
- If auditor not selected → can't start audit on time (warn 90 days early)

**CASH RUNWAY RISKS**
- If burn rate remains constant, runway = X months (flag if < 6 months before IPO)
- If IPO costs ($2-5M) not yet funded, flag now

**TEAM CAPACITY RISKS**
- If one person (usually CFO) has > 50% of IPO tasks, flag burnout risk
- If key roles empty (CFO, General Counsel, VP Ops), flag gaps

**DOCUMENT RISKS**
- If key document hasn't been updated > 90 days, flag staleness
- If document completion % decreases (not increasing), flag regression

**SEQUENCING RISKS**
- If doing tasks out of order (e.g., board before cap table cleanup), flag
- If dependencies not being met (e.g., audit can't start without clean cap table)

#### Alert Delivery:
- **Red Alert (Act today):** Cap table has $2M+ unreconciled equity, auditor says they can't start without cleanup
- **Yellow Alert (Act this week):** You're 3 weeks behind cap table cleanup pace
- **Blue Alert (Plan now):** In 45 days, you'll need an auditor. Have you started interviews?

---

### 2. PREDICTIVE COACHING (AI-Driven Next Steps)

#### Coach analyzes:
- Your current PACE score (where you are)
- Your timeline (where you're going)
- Phase progression data (where others got stuck)
- Your team capacity (what you can actually do)

#### Coach recommends:
```
"Based on your data, here's what moves you fastest:"

PRIORITY 1: Cap table cleanup (3 weeks of work)
- Why: Blocks audit start, which blocks financial statements, which blocks prospectus
- Impact: Moves PACE from 68 → 74
- Timeline impact: Saves 2 weeks vs current plan
- Effort: 120 hours across 3 people
- Action plan: [30-day step-by-step breakdown]

PRIORITY 2: Auditor selection & engagement (2 weeks of work)
- Why: Give auditor 4-6 weeks to start field work
- Impact: Moves PACE from 74 → 79
- Timeline impact: Saves 1 week + reduces risk
- Effort: 40 hours across CFO & counsel
- Action plan: [step-by-step breakdown]

PRIORITY 3: Board recruitment (ongoing, 6 weeks)
- Why: Governance = deal requirement for IPO
- Impact: Moves PACE from 79 → 85
- Timeline impact: Saves 2 weeks (board can accelerate some decisions)
- Effort: 60 hours of founder + CFO time spread over 6 weeks
- Action plan: [step-by-step breakdown]

If you do these 3 in order, you save 5 weeks vs original timeline.
Current pace: IPO day 280. Optimized pace: IPO day 245.
```

---

### 3. DAILY EMAIL COACHING

#### Email subjects (vary by data, not generic):

**Type 1: Action Items**
- "Your cap table is 30% clean. Need to be 70% by June 15. Here's the 3-day plan."
- "Auditor follow-up: You asked 5 firms for proposals. 3 have responded. Call the other 2 today."
- "Board seat 4 just became available. Your CFO should make the call by EOD Thursday."

**Type 2: Warnings**
- "Your IPO date assumes Q3 2026. At current pace, you're hitting Q4. Here's how to catch up."
- "You haven't updated your cap table in 37 days. Getting stale = audit delays."
- "Cash runway = 8 months. IPO day = month 9. No buffer. Get funding or adjust timeline."

**Type 3: Wins**
- "You closed 6 tasks this week! Cap table moved from 30% → 40%. Keep it up."
- "Legal approved 4 docs for final review. You're on track for prospectus filing."
- "Board recruitment: 2 confirmed, 2 in final discussion. Best week yet."

**Type 4: Tips & Tricks**
- "Cap table cleanup hack: Use this template to find reconciliation errors faster"
- "Auditor question: Here are the 5 things auditors always ask about equity"
- "IPO timeline: Here's what really happens in each phase (not the textbook version)"

---

### 4. CONTEXTUAL HELP SYSTEM

When user asks anything, IPO Coach provides answers using YOUR company's data:

**User asks:** "How long will cap table cleanup take?"
**Coach replies:** "For you, specifically: 3 weeks. Here's why:
- You have 47 equity holders
- 12 unresolved vesting issues
- Average cleanup pace: 15 holders/week
- Your team has 2 people on this
- Timeline: Week 1 (30 holders cleaned), Week 2-3 (remaining 17 + conflict resolution)

Want a step-by-step plan?"

**User asks:** "Do we need a lead auditor yet?"
**Coach replies:** "Yes, and here's why:
- Your target audit start date: July 1 (based on your IPO timeline)
- Auditor needs 4-6 weeks notice to schedule
- You should have interviews done by: May 15
- Today is May 31
- You're at risk of delaying audit by 3 weeks

Action: Call the 3 auditors you rated highest this week. I'll remind you daily."

**User asks:** "What's holding up our IPO?"
**Coach replies:** "Three things:
1. Cap table (BLOCKING audit) - 30% done, 3 weeks to complete
2. Auditor selection (BLOCKING audit start) - Not yet selected
3. Board recruitment (BLOCKING governance) - 2/5 seats filled

Fix cap table and select auditor → You gain 4 weeks. Do it by June 15."

---

## COACH DATA SOURCES

The coach uses:
- **Your company's uploaded data** (cap table, financials, timeline, tasks)
- **Your task completion history** (pace, delays, rework cycles)
- **100+ IPO datapoints we own** (NOT public data, NOT AI-trained data)
  - What actually takes 6 weeks vs 2 weeks
  - Which tasks block which other tasks
  - Where founders typically get surprised
  - Which regulatory requirements actually matter
  - Which document issues cause audit delays
- **Real-time monitoring** (flags changes, not guessing)

**We do NOT:**
- Use your data to train public AI models
- Share your data with competitors or AI vendors
- Make random guesses based on the internet
- Treat your IPO like a generic project

**We DO:**
- Own the data and the insights
- Update our models as new IPOs complete
- Treat your data as your competitive advantage
- Use AI as a tool to deliver our insights faster

---

## IMPLEMENTATION: COACH ENGINE RULES

### Rule Set 1: Timeline Prediction
```
IF timeline_days_to_ipo <= 180
AND phase_current <= 4
THEN risk_level = "HIGH"
AND recommend_focus = [Phase 5 prep, auditor selection, board]

IF pace_by_phase = falling
AND weeks_to_next_milestone <= 6
THEN alert_level = "RED"
AND action = "reallocate team immediately"

IF cap_table_clean_pct < (timeline_days_to_ipo / 10)
THEN prediction = "audit_delay = 3-6 weeks"
AND recommendation = "prioritize cap table cleanup now"
```

### Rule Set 2: Team Capacity
```
IF person_task_count / total_task_count > 0.5
AND person_role = "CFO"
THEN risk = "burnout"
AND action = "reallocate 30% of CFO tasks to others"

IF role_empty = ["CFO" OR "General Counsel" OR "VP Ops"]
AND days_to_ipo < 120
THEN alert = "CRITICAL"
AND action = "hire immediately or defer IPO"
```

### Rule Set 3: Document Freshness
```
IF document_days_since_update > 90
AND document_type = [cap_table, financials, board_memo, legal_docs]
THEN alert = "YELLOW"
AND action = "update document and re-circulate"

IF document_completion_pct declining for 2 weeks
THEN alert = "RED"
AND action = "investigate blockers immediately"
```

### Rule Set 4: Milestone Sequencing
```
IF task_completed = "board_recruitment"
AND task_not_completed = "cap_table_cleanup"
THEN warning = "OUT_OF_ORDER"
AND recommendation = "Complete cap table first, board recruitment is downstream"

IF audit_start_date_planned - (today + 6_weeks) < 0
THEN alert = "AUDIT_AT_RISK"
AND action = "select auditor this week"
```

---

## COACH COMMUNICATION STYLE

✅ **Use data from THEIR IPO, not generic facts**
- Bad: "Most IPOs take 18 months"
- Good: "Your timeline is 12 months. At current pace, you'll finish in 14. Here's why and how to fix it."

✅ **Be specific about impact**
- Bad: "Cap table cleanup is important"
- Good: "Cap table cleanup is blocking your audit. Audit is blocking financials. Financials are blocking prospectus. Fix cap table by June 15 or slip IPO by 4 weeks."

✅ **Speak founder/CFO language, never jargon**
- Bad: "Optimize Phase 4 task velocity metrics"
- Good: "You're doing 8 legal tasks per week. Auditor can start when this hits 12/week. Get them help."

✅ **Always give the action plan, not just the warning**
- Bad: "You're behind on cap table"
- Good: "You're behind on cap table. Here's the 3-week daily plan to catch up, with roles assigned."

✅ **Show confidence without arrogance**
- Bad: "You're doing everything wrong"
- Good: "You're on a path. Here's a smarter path. Difference = 4 weeks."

---

## COACH SUCCESS METRICS

- **User engagement:** 85%+ read coach emails within 24 hours
- **Action rate:** 70%+ take recommended action within 3 days
- **Timeline accuracy:** Coach predictions off by <2 weeks for 95% of companies
- **Upgrade impact:** Companies that engage with coach = 60% upgrade rate
- **NPS:** Coach-engaged users rate IPOReady 8.5/10 vs non-engaged 6.5/10

---

## COACH FAILURE MODES (Fix Immediately)

🔴 **Coach makes generic recommendation** (not specific to their data)
→ Fix: Every recommendation must include their specific numbers

🔴 **Coach recommends conflicting actions** (do X and Y simultaneously, but they're incompatible)
→ Fix: Coach always sequences priorities, not simultaneous

🔴 **User doesn't understand why coach recommended something**
→ Fix: Coach always explains the "why" (what blocks what, where data comes from)

🔴 **Coach prediction is wrong multiple times**
→ Fix: Retrain rule immediately, add new data point

🔴 **Coach overwhelms user with too many alerts**
→ Fix: Prioritize ruthlessly. Max 3 actionable alerts per day.
