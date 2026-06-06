# On-Call Rotation Implementation Guide

**Document Version:** 1.0  
**Date:** June 7, 2026  
**Status:** Ready for Deployment  
**Target Audience:** Operations, Engineering Leadership

---

## Overview

This guide walks through implementing the complete on-call rotation system for IPOReady production. All documentation is complete and ready to deploy.

## Deliverables Summary

### 1. ON_CALL.md (1,663 lines, 48 KB)
**Complete production on-call management system**

**Contains:**
- Weekly rotation schedule template
- 4-tier escalation contact matrix
- On-call responsibilities & availability requirements
- 4 detailed runbooks with investigation steps, fixes, and escalation:
  - Database Slow Queries
  - API Latency Spikes
  - Third-Party Service Outages
  - Data Corruption Detection
- Tools integration (PagerDuty, Datadog, Slack, Health checks)
- Post-incident review process with templates
- Severity definitions and SLAs

**Usage:**
- Primary reference document for on-call engineers
- Source of truth for incident response procedures
- Updated after each incident with learnings

### 2. CONTACT_MATRIX.md (473 lines, 24 KB)
**One-page quick reference for emergency escalations**

**Contains:**
- 4-tier escalation contacts with phone/Slack/email
- 6 specialty engineering contacts (DB, Security, Integrations, CS, Finance)
- 6 third-party vendor emergency contacts
- Decision tree for incident severity classification
- Call checklist and posting locations
- Printable/laminate-ready format

**Usage:**
- Print and post in war room
- Keep at engineering desk during on-call week
- Reference during high-stress incident response
- Mobile-friendly for on-the-go escalation

---

## Pre-Implementation Checklist

### Infrastructure Setup

- [ ] **PagerDuty Account**
  - [ ] Organization created at pagerduty.com
  - [ ] IPOReady team added as members
  - [ ] Escalation policies configured (4-tier)
  - [ ] Mobile app installed on primary contacts
  - [ ] SMS/phone notifications enabled
  - [ ] Slack integration installed

- [ ] **Datadog Account**
  - [ ] Production environment connected
  - [ ] API monitoring dashboards created
  - [ ] Database performance dashboards created
  - [ ] Custom alerts configured for:
    - API latency p99 > 5s
    - Database queries > 5s
    - Error rate > 2%
    - Connection pool > 85%
  - [ ] Alert routing to PagerDuty enabled
  - [ ] Slack integration enabled

- [ ] **Slack Channels**
  - [ ] `#incidents` created (real-time incident updates)
  - [ ] `#ops-oncall` created (rotation notes, handoff)
  - [ ] `#alerts-critical` created (P1 alert feed)
  - [ ] `#alerts-warning` created (P2 alert feed)
  - [ ] PagerDuty bot installed in channels
  - [ ] Datadog bot installed in channels

### Contact Information

- [ ] Verify all phone numbers in CONTACT_MATRIX.md are correct
- [ ] Verify all Slack handles are accurate
- [ ] Verify all email addresses are active
- [ ] Set up emergency contact redundancy (backups for each contact)
- [ ] Create backup contact list for internet outage scenarios
- [ ] Store physical printed contact matrix in war room

### Team Training

- [ ] All on-call engineers read ON_CALL.md
- [ ] All on-call engineers read CONTACT_MATRIX.md
- [ ] Practice walkthrough of each runbook
- [ ] Dry-run incident simulation (optional but recommended)
- [ ] Document any clarifications needed
- [ ] Update runbooks based on team feedback

---

## Deployment Steps

### Step 1: Publish Documentation

```bash
# Files already created and committed
# Location: /docs/ON_CALL.md
# Location: /docs/CONTACT_MATRIX.md

# Verify in repository
git log --oneline | head -5
# Should show: "Add comprehensive on-call rotation and runbooks"
```

### Step 2: Configure PagerDuty

**2A. Create Escalation Policy**
```
Name: IPOReady On-Call (Main)
Escalation levels:
  Level 1: On-Call Engineer (2 min timeout)
    → Page: +1 (415) XXX-XXXX
    → SMS: +1 (415) XXX-XXXX
    → Slack: @on-call-engineer
  
  Level 2: Tech Lead James (5 min timeout)
    → Phone: +1 (415) XXX-XXXX
    → Slack: @james-mitchell
  
  Level 3: VP Ops Sarah (10 min timeout)
    → Phone: +1 (415) XXX-XXCK
    → Slack: @sarah-thompson
  
  Level 4: CEO Marcus (15 min timeout)
    → Phone: +1 (415) XXX-XXXX
    → Slack: @marcus
```

**2B. Create Service**
```
Name: IPOReady Production
Escalation Policy: IPOReady On-Call (Main)
Alert creation: Enabled
Incident creation: Manual + Automated
```

**2C. Configure Integrations**
```
- Datadog → PagerDuty service
- Slack → PagerDuty channel notifications
- Email → escalation notifications
```

### Step 3: Configure Datadog Alerts

**3A. API Latency Alert**
```
Metric: avg:trace.web.request.duration{service:ipoready-api}.percentile(0.99)
Condition: > 5000ms (5 seconds)
Severity: Critical
Notify: PagerDuty service
Action: Create incident
```

**3B. Database Query Alert**
```
Metric: avg:trace.db.query.duration{service:ipoready-api}
Condition: > 5000ms (5 seconds)
Severity: Critical
Notify: PagerDuty service
Action: Create incident
```

**3C. Error Rate Alert**
```
Metric: avg:trace.error_rate{service:ipoready-api}
Condition: > 0.02 (2%)
Severity: High
Notify: PagerDuty service
Action: Create incident
```

**3D. Connection Pool Alert**
```
Metric: database.connections / database.connections.max
Condition: > 0.85 (85% utilization)
Severity: High
Notify: PagerDuty service
Action: Create incident
```

### Step 4: Configure Slack Integration

**4A. Channel Setup**
```bash
# Create channels
/channel-create incidents
/channel-create ops-oncall
/channel-create alerts-critical
/channel-create alerts-warning

# Set descriptions
#incidents: "Real-time incident updates, P1/P2 status"
#ops-oncall: "On-call rotation, handoff notes, scheduling"
#alerts-critical: "P1 alerts from monitoring systems"
#alerts-warning: "P2 alerts from monitoring systems"

# Pin important documents
/pin ON_CALL.md
/pin CONTACT_MATRIX.md
```

**4B. Install Bots**
```
- PagerDuty bot → all channels
- Datadog bot → #alerts-critical, #alerts-warning
- StatusPage.io bot → #incidents (if using)
```

### Step 5: Create On-Call Schedule

**5A. Schedule Rotation (Jun-Dec 2026)**
```
Tools: Google Sheets, PagerDuty scheduling, or Calendly

Week 1 (Jun 7-13):    Alice Chen (Primary) / Bob Martinez (Backup)
Week 2 (Jun 14-20):   Carol Singh (Primary) / David Lee (Backup)
Week 3 (Jun 21-27):   Elena Rodriguez (Primary) / Frank Zhou (Backup)
Week 4 (Jun 28-Jul 4): Grace Kim (Primary) / Hannah Jackson (Backup)
[Continue pattern through December]
```

**5B. Configure Handoff**
```
Handoff timing: Every Friday 4:00 PM PST (23:00 UTC)
- Outgoing engineer: status update, context transfer
- Incoming engineer: acknowledge, verify setup
- Both: confirm in Slack #ops-oncall

Escalation policy updated automatically by PagerDuty schedule
```

**5C. Track Vacation/Time-off**
```
Rules:
- Max 2 consecutive weeks (then 4-week break)
- Swap with another engineer OR find replacement
- Notify manager 2 weeks in advance
- Mark in PagerDuty calendar
```

### Step 6: Set Up Monitoring Dashboards

**6A. Create Datadog Dashboard**
```
Name: IPOReady Production Incident Dashboard
Tiles:
  - API Response Time (p99, p95, p50)
  - Database Query Time (p99, p95, p50)
  - Error Rate by service
  - Connection pool utilization
  - Recent alerts (last 24h)
  - Deployments (timeline)
  - Host metrics (CPU, memory, disk)
  - Third-party status (Stripe, Google, etc)

Alerts: Show in dashboard
Refresh: Every 30 seconds
```

**6B. Create Status Page (StatusPage.io)**
```
Components:
  - API Server
  - Database
  - Payment Processing
  - Document Upload
  - Email Service
  - SMS Service

Monitor:
  - Health check endpoints
  - Third-party services
  - Automatic status updates
```

### Step 7: Test Everything

**7A. Test PagerDuty**
```bash
# Verify phone/SMS notifications work
# Manually trigger test alert from PagerDuty
# Confirm on-call engineer receives:
  [ ] Phone call
  [ ] SMS message
  [ ] Slack notification
  [ ] App notification

# Verify escalation chain
# If not acknowledged, should escalate to Level 2 in 2 minutes
```

**7B. Test Datadog Alerts**
```bash
# Trigger test alert (create dummy high latency)
# Verify arrives in PagerDuty
# Verify appears in #incidents Slack
# Verify on-call notified
```

**7C. Test Runbooks**
```bash
# Walk through each runbook step-by-step
# Verify all commands work:
  [ ] Health check endpoints return valid JSON
  [ ] Database commands execute successfully
  [ ] Vercel CLI commands work
  [ ] Neon CLI commands work
  [ ] Log commands return data

# Verify all dashboards are accessible
# Verify all escalation numbers work
```

**7D. Dry-Run Incident**
```bash
# (Optional but recommended)
# Simulate P1 incident with full team
# Trigger alert → acknowledge → investigate → resolve
# Measure: time to acknowledge, time to identify cause, time to fix
# Debrief: what went well, what to improve
```

### Step 8: Documentation & Training

**8A. Distribute Documentation**
```
- Slack pin: ON_CALL.md in #ops-oncall
- Slack pin: CONTACT_MATRIX.md in #incidents
- Email: Send to all engineers
- Wiki/Notion: Upload full copies
- Print: 10 copies of CONTACT_MATRIX.md for war room
```

**8B. Team Training Session (1 hour)**
```
Agenda:
  0-10 min: Overview of on-call system
  10-25 min: Walk through runbooks (2-3 examples)
  25-35 min: Demonstrate tool usage (PagerDuty, Datadog, Slack)
  35-45 min: Q&A and discussion
  45-60 min: Dry-run incident simulation (if time)

Recording: Archive for future reference
```

**8C. Onboarding Checklist for New Engineers**
```
Before first on-call week:
  [ ] Read ON_CALL.md cover to cover
  [ ] Read CONTACT_MATRIX.md and note key contacts
  [ ] Set up PagerDuty mobile app
  [ ] Test that all notification channels work
  [ ] Run through each runbook with buddy
  [ ] Ask 5 clarifying questions
  [ ] Shadow outgoing on-call engineer for 1 hour
  [ ] Confirm ready to take on-call duties
```

---

## Post-Implementation: First Incident Procedures

### When First Incident Occurs

**During the incident:**
1. Follow appropriate runbook from ON_CALL.md
2. Post status updates to #incidents every 15 min (P1) or 30 min (P2)
3. Escalate per CONTACT_MATRIX.md if needed
4. Document investigation steps and findings

**After incident resolved:**
1. Post "RESOLVED" in #incidents
2. Take screenshots of dashboards showing timeline
3. Note rough timeline (detection → identification → fix → recovery)
4. Share in #ops-oncall: what happened, what we learned

### First Post-Incident Review (24-48 hours after)

**Schedule meeting:**
- Participants: On-call engineer, tech lead, any others involved
- Duration: 30-60 minutes
- Timing: Next business day after incident
- Location: Zoom (invite all who helped)

**Follow format in ON_CALL.md section "Post-Incident Review Process":**
1. Timeline walkthrough
2. Root cause analysis
3. Severity assessment
4. Action items for prevention
5. Lessons learned
6. Appreciation

**Update documentation:**
- Update relevant runbook with new findings
- Add troubleshooting steps that worked
- Clarify escalation procedures if needed
- Share learning in #ops-oncall

### Continuous Improvement

**Monthly on-call reviews:**
- Analyze incidents from past 30 days
- Identify patterns (types, times, root causes)
- Update runbooks with learnings
- Propose infrastructure improvements
- Celebrate successful incident responses

**Quarterly on-call rotation review:**
- Assess rotation fairness (equal distribution)
- Get feedback from all on-call engineers
- Update schedule for next quarter
- Improve runbooks based on feedback

---

## Maintenance & Updates

### Monthly Tasks
```
[ ] Review all incidents from past month
[ ] Update runbooks with new discoveries
[ ] Test escalation procedures (dry run)
[ ] Verify all contact info still accurate
[ ] Check tool subscriptions active (PagerDuty, Datadog)
[ ] Archive old incident reports
```

### Quarterly Tasks
```
[ ] Full on-call team review meeting
[ ] Update contact matrix with any changes
[ ] Review SLAs and adjust if needed
[ ] Plan next quarter rotation
[ ] Train new team members
[ ] Conduct disaster recovery drill
```

### Annual Tasks
```
[ ] Complete comprehensive on-call program review
[ ] Update all tools and integrations
[ ] Audit security and permissions
[ ] Plan next year's rotation
[ ] Celebrate team for incident response excellence
```

---

## Success Metrics

### Measure on-call program health:

**Response Times**
- P1 acknowledge SLA: < 5 minutes (target 2 min)
- P1 mitigation SLA: < 15 minutes (target 10 min)
- P2 acknowledge SLA: < 30 minutes (target 15 min)

**Resolution Quality**
- First-time fix rate: > 70%
- Mean Time To Recovery (MTTR): < 30 minutes
- Incident recurrence rate: < 20%

**Team Health**
- On-call engineer satisfaction: > 4/5 stars
- Burnout risk assessment: Low (measured quarterly)
- Participation in post-mortems: 100%

**System Health**
- False alert rate: < 10% of total
- Missed incident rate: < 1% (what we should have alerted on)
- Third-party integration uptime: > 99.9%

---

## Quick Reference

### Files & Locations
| Document | Path | Size | Lines |
|----------|------|------|-------|
| On-Call Guide | `/docs/ON_CALL.md` | 48 KB | 1,663 |
| Contact Matrix | `/docs/CONTACT_MATRIX.md` | 24 KB | 473 |
| Implementation | `/docs/ON_CALL_IMPLEMENTATION.md` | This file | - |

### Key Contacts to Configure
- On-Call Primary: [Phone, SMS, Slack, Email]
- Tech Lead: [Phone, SMS, Slack, Email]
- VP Operations: [Phone, SMS, Slack, Email]
- CEO: [Phone, SMS, Slack, Email]

### Critical Tools
- PagerDuty: Escalation engine
- Datadog: Monitoring & alerting
- Slack: Team communication
- Vercel: Deployment management
- Neon: Database access

### Runbooks Available
1. Database Slow Queries (investigation, optimization, fixes)
2. API Latency Spikes (identification, endpoint analysis, optimization)
3. Third-Party Service Outages (detection, workarounds, communication)
4. Data Corruption Detected (backup procedures, recovery, forensics)

---

## Support & Questions

**Need help?**
- For on-call questions: Post in #ops-oncall Slack channel
- For incident response: Follow runbook, then escalate
- For documentation updates: Create GitHub issue
- For team feedback: Attend monthly on-call review

**Common questions:**
- *How do I get on the rotation?* → Ask engineering leadership
- *What if I need to swap shifts?* → Coordinate with another engineer, update PagerDuty
- *What if I miss an alert?* → It will escalate automatically; acknowledge when you see it
- *How do I update a runbook?* → Edit the .md file, create PR, get review, merge
- *What if the runbook doesn't help?* → Escalate to Tech Lead or VP Ops immediately

---

**Document Version:** 1.0  
**Last Updated:** June 7, 2026  
**Next Review:** June 21, 2026 (after first week of rotation)  
**Owner:** Engineering Operations Team
