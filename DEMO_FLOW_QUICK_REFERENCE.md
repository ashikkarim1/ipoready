# IPOReady Phase 2 Demo Flow — Quick Reference Guide

**Document:** E2E Demo Flow for Sales, Success, and Product Teams  
**Duration:** ~15 minutes  
**Date:** June 3, 2026

---

## At-a-Glance Flow

```
Dashboard
  └─ Scene 1: Sidebar Navigation (show 3 new sections)
  
Financial Management
  └─ Scene 2: Cost Calculator (TechCorp = $18.5M costs, $81.5M net)
  └─ Scene 3: Budget Tracking (6-month progress, $6.2M spent, alert)

Cap Table
  └─ Scene 4: Dilution Scenarios (18.5M shares, 3 scenarios, export CSV)

Compliance
  └─ Scene 5: Listing Rules (TSX: 8/10 met, 2% float gap identified)
  └─ Scene 6: Resolutions Manager (12 templates, download prospectus approval as Word)
  └─ Scene 7: Consent Letters (4 required, 2 received, 2 pending)
```

---

## Scene Breakdown

| Scene | Section | Key Action | Expected Output |
|-------|---------|-----------|-----------------|
| 1 | Dashboard | Show sidebar | 3 new menu items visible |
| 2 | Financial Mgmt → Cost Calculator | Fill TechCorp data | $18.5M total costs breakdown |
| 3 | Financial Mgmt → Budget Tracking | Review 6-month burn | $6.2M spent (35%), alert on underwriting |
| 4 | Cap Table → Dilution Scenarios | Load TechCorp + 3 scenarios | Current/optimistic/conservative shown |
| 5 | Compliance → Listing Rules | Select TSX | 8/10 requirements met, 370k shares gap |
| 6 | Compliance → Resolutions | Download prospectus | Word document with TechCorp data merged |
| 7 | Compliance → Consent Letters | Review status | 2 received, 2 pending (legal counsel critical) |

---

## Demo Data: TechCorp Inc.

**Company Profile**
- Name: TechCorp Inc.
- Exchange: TSX (main board)
- Complexity: Medium
- Timeline: 6-month IPO prep

**Financial Profile**
- Gross Proceeds Target: $100M
- Total IPO Costs: $18.5M
- Net Proceeds: $81.5M
- Cost Percentage: 18.5% of gross

**Cap Table**
- Total Shares (Current): 18,500,000
- Share Classes: 3 (Common A, Series A, Series B, Options)
- Total Shareholders: 12
- Founder Ownership: 40.5%
- VC Ownership: 43.2%
- Employees/Angels: 16.3%

**IPO Scenarios**
1. **Current:** 18.5M shares (pre-IPO)
2. **Optimistic:** +5M shares → $100M proceed → Founders 28.2%
3. **Conservative:** +3M shares → $45M proceed → Founders 31.1%

**Budget Tracking (6 months)**
- Total Budgeted: $17.5M
- Total Spent: $6.2M (35%)
- Remaining: $11.3M
- Key Alert: Underwriting at 90% of budget

**Compliance Status**
- Governance Compliance: 8 of 10 (80%)
- Critical Gap: Public Float 8% vs. 10% required (370k shares)
- Resolutions: 5 done, 2 in progress, 5 pending (12 total)
- Consent Letters: 2 received, 2 pending

---

## Key Talking Points

### Financial Management
> "We give you total transparency on IPO costs. Every dollar is accounted for, from exchange fees to marketing. At TechCorp, costs are $18.5M on a $100M offering — right in the 15-20% industry standard. The budget tracker shows you're on track for most categories, but underwriting is at 90%; that's a board conversation about timing."

### Cap Table
> "Your cap table feeds into IPO planning automatically. We model three scenarios so you know exactly how much founders get diluted. With TechCorp, founders go from 40.5% ownership today to 28% in the optimistic scenario — totally acceptable for a board. You can see the same for every VC, every employee, and every angel."

### Compliance
> "TSX has 10 hard requirements for listing. TechCorp meets 8 of them. The one gap is public float — you're at 8%, TSX needs 10%. That's 370k shares. We show you three ways to solve it, and we give you real legal documents to manage the process. All your resolutions, all your consent letters, all tracked in one place."

---

## Export Deliverables

**Scene 2 (Cost Calculator)**
- PDF: Detailed cost breakdown with assumptions
- Format: Sharable link for advisors

**Scene 3 (Budget Tracking)**
- PDF: 6-month burn report
- CSV: Budget vs. actual by category

**Scene 4 (Dilution Scenarios)**
- CSV: All three scenarios (current, optimistic, conservative)
- Format: Ready for financial model integration

**Scene 6 (Resolutions)**
- DOCX: Prospectus approval resolution
- Format: Ready to print, sign, notarize
- Data: TechCorp-specific terms auto-filled

**Scene 7 (Consent Letters)**
- ZIP: All 4 consent letters as PDFs
- Summary: Compliance checklist (what's done vs. pending)

---

## Demo Setup Checklist

### Pre-Demo (5 minutes before)
- [ ] Load TechCorp company context
- [ ] Clear browser cache (fresh load)
- [ ] Verify cost calculator loads instantly
- [ ] Verify cap table data loaded (18.5M shares visible)
- [ ] Verify TSX listing rules configured
- [ ] Have Word open (for resolution download demo)
- [ ] Have download folder visible

### During Demo
- [ ] Screen share high-res (test on attendee side)
- [ ] Have chat open for Q&A
- [ ] Have cell phone for callouts (in case Slack messages)
- [ ] Have water (15-min demo is tiring to narrate)

### Post-Demo (follow-up)
- [ ] Send E2E_DEMO_FLOW.md to attendees
- [ ] Offer "guided walkthrough" for their CFO/GC
- [ ] Ask which features they'd use first
- [ ] Discuss API integration for their cap table tool

---

## Common Questions & Answers

**Q: Is this real data or examples?**  
A: TechCorp is a demo company, but the costs, timelines, and compliance requirements are all based on actual 2025-2026 IPO market data. The financial estimates update monthly. Compliance rules are pulled directly from TSX Policy 1.1, 3.1, 3.3, 4.1-4.4.

**Q: Can we use our own cap table data?**  
A: Yes. Upload your Excel file, and the system validates it and auto-loads all holdings, share classes, and fully-diluted scenarios. The dilution modeling works on any cap table.

**Q: What if we list on NASDAQ instead of TSX?**  
A: The listing rules validator works for TSX, TSXV, CSE, NASDAQ, NYSE, and OTC. Just change the exchange selector, and the requirement checklist updates automatically.

**Q: Do the resolutions need legal review?**  
A: Yes — and that's why each template is designed to be reviewed by securities counsel before adoption. You download as Word, send to counsel, they edit, you re-upload the final version.

**Q: How often do the cost estimates update?**  
A: Monthly, based on IPO market data from Q1 2026 onward. Underwriting spreads, audit fees, and legal rates all adjust as market conditions change.

---

## Estimated Demo Timeline

| Time | Scene | Activity |
|------|-------|----------|
| 0:00 | Start | Intro: "Today we're walking through the complete IPO workflow" |
| 0:30 | Scene 1 | Dashboard sidebar navigation (30 sec) |
| 1:00 | Scene 2 | Cost Calculator: fill TechCorp data, show $18.5M (1 min) |
| 2:00 | Scene 3 | Budget Tracking: 6-month burn, alerts (1 min) |
| 3:00 | Scene 4 | Cap Table: load TechCorp, show 3 scenarios, export (1 min) |
| 4:30 | Scene 5 | Listing Rules: TSX requirements, highlight float gap (1.5 min) |
| 6:00 | Scene 6 | Resolutions: download prospectus approval as Word (1.5 min) |
| 7:30 | Scene 7 | Consent Letters: show status, critical path (1.5 min) |
| 9:00 | Close | Summary: "All three workflows connected in one system" (1 min) |
| 10:00 | Q&A | Questions, use cases, pricing (5-10 min) |
| 15:00 | End | |

---

## Visual Specs for Design Team

**Colors**
- Financial Management: Accent orange (`var(--color-accent)`)
- Cap Table: Info blue (`var(--color-info)`)
- Compliance: Security blue (`var(--color-security)`)
- Success states: Green (`var(--color-success)`)
- Warning/At-Risk: Orange/yellow (`var(--color-warning)`)

**Typography**
- Headlines: 2xl bold (32px)
- Section titles: lg bold (18px)
- Labels: sm bold (14px)
- Body: sm regular (14px)

**Spacing & Layout**
- Section padding: 6 (24px)
- Card spacing: 4 (16px)
- Grid gaps: 4 (16px)
- Border radius: lg (8px)

---

## Success Metrics (QA/Demo Team)

**All Scenes Working**
- ✓ Dashboard loads < 1 sec
- ✓ Cost Calculator accepts input & calculates
- ✓ Budget Tracker shows all items + alerts
- ✓ Cap Table displays holdings + scenarios
- ✓ Listing Rules shows compliance checklist
- ✓ Resolutions downloads as Word
- ✓ Consent Letters shows status tracking

**Exports Working**
- ✓ Cost breakdown exports as PDF
- ✓ Budget report exports as PDF
- ✓ Dilution scenarios export as CSV
- ✓ Prospectus resolution exports as DOCX
- ✓ Consent letters export as ZIP

**Data Continuity**
- ✓ Cap table data feeds to dilution scenarios
- ✓ Financial estimates feed to prospectus
- ✓ Dilution changes update public float
- ✓ Budget changes update cost breakdown

---

## Related Documents

1. **Full Demo Flow:** `E2E_DEMO_FLOW.md` (comprehensive, with ASCII mockups and data tables)
2. **Architecture Docs:** `/src/app/financial`, `/src/app/cap-table`, `/src/app/compliance`
3. **API Specs:** `/src/app/api/cost-calculator`, `/api/cap-table`, `/api/listing-rules`
4. **Component Tests:** `/src/components/__tests__`

---

**Generated:** June 3, 2026  
**For:** Sales, Success, Product, Demo Teams  
**Approval:** Ready for Phase 2 Launch
