# IPOReady On-Call Contact Matrix

**Quick Reference for Emergency Escalations**  
**Last Updated:** June 7, 2026  
**Print this page and keep on your desk during on-call week**

---

## PRIMARY ESCALATION CONTACTS

### TIER 1: On-Call Response (First 5 minutes)

```
🚨 IMMEDIATE RESPONSE REQUIRED
┌─────────────────────────────────────────────────────┐
│ ON-CALL ENGINEER (Weekly Rotation)                  │
│                                                     │
│ Phone: [+1 (415) XXX-XXXX]                          │
│ SMS:   [Same as phone]                              │
│ Slack: @on-call-engineer                            │
│ Email: oncall@ipoready.com                          │
│ Availability: 24/7 during on-call week              │
│                                                     │
│ Current (Jun 7-13): Alice Chen                      │
│ Next (Jun 14-20): Carol Singh                       │
│ Backup (always): tech-lead@ipoready.com             │
└─────────────────────────────────────────────────────┘
```

### TIER 2: Technical Leadership (5-15 minutes)

```
⚠️ ESCALATION FOR P1/P2 INCIDENTS
┌─────────────────────────────────────────────────────┐
│ VP ENGINEERING / TECH LEAD                          │
│ James Mitchell                                      │
│                                                     │
│ Phone: +1 (415) XXX-XXXX                            │
│ Slack: @james-mitchell                              │
│ Email: james.mitchell@ipoready.com                  │
│ Availability: 24/7 for escalations                  │
│ Response SLA: 5 minutes                             │
│                                                     │
│ Specialties:                                        │
│ • Architecture decisions                            │
│ • Emergency rollbacks                               │
│ • Feature flag toggles                              │
│ • Cross-team coordination                           │
└─────────────────────────────────────────────────────┘
```

### TIER 3: Operations (15-30 minutes for P1)

```
🔴 CRITICAL INCIDENTS (P1 ongoing > 30 min)
┌─────────────────────────────────────────────────────┐
│ VP OPERATIONS                                       │
│ Sarah Thompson                                      │
│                                                     │
│ Phone: +1 (415) XXX-XXXX                            │
│ Slack: @sarah-thompson                              │
│ Email: sarah.thompson@ipoready.com                  │
│ Availability: 24/7                                  │
│ Response SLA: 15 minutes (P1), 1 hour (P2)          │
│                                                     │
│ Authority:                                          │
│ • Declare incident severity                         │
│ • Authorize emergency spending                      │
│ • Customer communication decisions                  │
│ • Third-party vendor escalation                     │
└─────────────────────────────────────────────────────┘
```

### TIER 4: Executive (Data Loss / Regulatory)

```
🔐 CRITICAL DATA / REGULATORY BREACH
┌─────────────────────────────────────────────────────┐
│ CEO                                                 │
│ Marcus Johnson                                      │
│                                                     │
│ Phone: +1 (415) XXX-XXXX                            │
│ Slack: @marcus                                      │
│ Email: marcus@ipoready.com                          │
│ Availability: 24/7 emergencies only                 │
│ Response SLA: 30 minutes (data loss / SEC breach)   │
│                                                     │
│ Triggers:                                           │
│ • Data loss incident (> 100 records)                │
│ • Security breach (customer data exposed)           │
│ • Potential SEC filing required                     │
│ • Media coverage likely                             │
│ • Ongoing incident > 1 hour                         │
└─────────────────────────────────────────────────────┘
```

---

## SPECIALTY ENGINEERING CONTACTS

### Database & Infrastructure

```
📊 DATABASE EMERGENCIES
┌─────────────────────────────────────────────────────┐
│ DATABASE ADMIN / SRE                                │
│ Michael Zhang                                       │
│                                                     │
│ Phone: +1 (415) XXX-XXXX                            │
│ Slack: @michael-db                                  │
│ Email: michael.zhang@ipoready.com                   │
│ Available: Business hours + 24/7 for P1             │
│                                                     │
│ Expertise:                                          │
│ • Neon database optimization                        │
│ • Slow query analysis & fixes                       │
│ • Connection pool management                        │
│ • Backups & disaster recovery                       │
│ • Index creation & tuning                           │
│                                                     │
│ When to contact:                                    │
│ • Database latency > 5 seconds                      │
│ • Connection pool exhausted                         │
│ • Data corruption detected                          │
│ • Out of disk space                                 │
└─────────────────────────────────────────────────────┘
```

### Security & Data Protection

```
🔒 SECURITY INCIDENTS
┌─────────────────────────────────────────────────────┐
│ SECURITY LEAD                                       │
│ Rebecca Wilson                                      │
│                                                     │
│ Phone: +1 (415) XXX-XXXX                            │
│ Slack: @rebecca-sec                                 │
│ Email: rebecca.wilson@ipoready.com                  │
│ Available: Business hours + 24/7 for breaches       │
│                                                     │
│ Expertise:                                          │
│ • Security breach response                          │
│ • Data protection regulations (GDPR, CCPA)          │
│ • Encryption & key management                       │
│ • Audit logging & compliance                        │
│ • Incident forensics                                │
│                                                     │
│ When to contact:                                    │
│ • Potential data breach                             │
│ • Unauthorized data access                          │
│ • Customer PII exposed                              │
│ • Security vulnerability discovered                │
│ • Compliance breach suspected                       │
└─────────────────────────────────────────────────────┘
```

### Third-Party Services & Integrations

```
🔌 INTEGRATION FAILURES
┌─────────────────────────────────────────────────────┐
│ BACKEND LEAD / INTEGRATIONS                         │
│ David Thompson                                      │
│                                                     │
│ Phone: +1 (415) XXX-XXXX                            │
│ Slack: @david-integrations                          │
│ Email: david.thompson@ipoready.com                  │
│ Available: Business hours + 24/7 for P1             │
│                                                     │
│ Expertise:                                          │
│ • Stripe payment processing                         │
│ • Google Drive integration                          │
│ • Resend email delivery                             │
│ • Twilio SMS                                        │
│ • OAuth2 authentication flows                       │
│                                                     │
│ When to contact:                                    │
│ • Payment processing failures                       │
│ • Document upload/sync failures                     │
│ • Email delivery blocked                            │
│ • SMS not being sent                                │
│ • Authentication system down                        │
└─────────────────────────────────────────────────────┘
```

### Customer Communication

```
💬 CUSTOMER IMPACT MANAGEMENT
┌─────────────────────────────────────────────────────┐
│ VP CUSTOMER SUCCESS                                 │
│ Tom Bradley                                         │
│                                                     │
│ Phone: +1 (415) XXX-XXXX                            │
│ Slack: @tom-cs                                      │
│ Email: tom.bradley@ipoready.com                     │
│ Available: Business hours (escalate to CEO weekends)│
│                                                     │
│ Responsibilities:                                   │
│ • Customer communication during incidents           │
│ • Status page updates                               │
│ • Customer support ticket response                  │
│ • Compensation decisions                            │
│ • Customer reassurance messaging                    │
│                                                     │
│ Involve for:                                        │
│ • P1 incident ongoing > 15 minutes                  │
│ • Customer SLA breach imminent                      │
│ • Media coverage risk                               │
│ • Customer escalation received                      │
└─────────────────────────────────────────────────────┘
```

### Compliance & Regulatory

```
📋 COMPLIANCE & REGULATORY ISSUES
┌─────────────────────────────────────────────────────┐
│ HEAD OF COMPLIANCE / FINANCE                        │
│ Jennifer Wu                                         │
│                                                     │
│ Phone: +1 (415) XXX-XXXX                            │
│ Slack: @jenny-finance                               │
│ Email: jenny.wu@ipoready.com                        │
│ Available: Business hours + 24/7 for regulatory     │
│                                                     │
│ Expertise:                                          │
│ • SEC filing requirements                           │
│ • Regulatory breach notifications                   │
│ • Audit compliance                                  │
│ • Data protection regulations                       │
│ • Incident documentation for compliance             │
│                                                     │
│ When to contact:                                    │
│ • Data loss affecting customer IPO readiness        │
│ • Financial data corruption                         │
│ • Potential SEC disclosure required                 │
│ • Regulatory breach suspected                       │
│ • Audit-related incident                            │
└─────────────────────────────────────────────────────┘
```

---

## THIRD-PARTY EMERGENCY CONTACTS

### Hosting & Infrastructure

```
🖥️ VERCEL HOSTING
┌─────────────────────────────────────────────────────┐
│ Enterprise Support (24/7)                           │
│ URL: vercel.com/support                             │
│ Phone: +1-XXX-XXX-XXXX                              │
│ Email: support@vercel.com                           │
│ Status: vercel.com/status                           │
│                                                     │
│ For:                                                │
│ • Deployment failures                               │
│ • Function timeouts                                 │
│ • Edge network issues                               │
│ • Certificate problems                              │
│ • Account/billing issues                            │
│                                                     │
│ Reference number format: vercel_incident_XXXX       │
└─────────────────────────────────────────────────────┘
```

```
🗄️ NEON DATABASE
┌─────────────────────────────────────────────────────┐
│ Support (24/7)                                      │
│ URL: console.neon.tech/support                      │
│ Phone: +1-844-XXX-XXXX                              │
│ Email: support@neon.tech                            │
│ Status: neon.tech/status                            │
│ Discord: neon.tech/discord (live support)           │
│                                                     │
│ For:                                                │
│ • Database performance issues                       │
│ • Connection problems                               │
│ • Out of storage space                              │
│ • Backup/recovery needs                             │
│ • Scaling/autoscaling issues                        │
│                                                     │
│ Enterprise TAM: [TAM Name] +1-XXX-XXX-XXXX          │
└─────────────────────────────────────────────────────┘
```

### Payment Processing

```
💳 STRIPE PAYMENTS
┌─────────────────────────────────────────────────────┐
│ Support (24/7 for critical)                         │
│ URL: stripe.com/support                             │
│ Phone: +1-XXX-XXX-XXXX                              │
│ Email: support@stripe.com                           │
│ Status: stripe.com/status                           │
│                                                     │
│ For:                                                │
│ • Payment processing failures                       │
│ • Webhook delivery issues                           │
│ • Account suspension                                │
│ • High dispute rate                                 │
│ • API errors                                        │
│                                                     │
│ Account: [STRIPE_ACCOUNT_ID]                        │
│ Support tier: Premium                               │
└─────────────────────────────────────────────────────┘
```

### Email Delivery

```
📧 RESEND EMAIL SERVICE
┌─────────────────────────────────────────────────────┐
│ Support (Business hours, 24/7 for critical)         │
│ URL: resend.com/support                             │
│ Email: support@resend.com                           │
│ Status: resend.com/status                           │
│ Slack community: resend.slack.com                   │
│                                                     │
│ For:                                                │
│ • Email delivery failures                           │
│ • Domain authentication issues (DKIM/SPF/DMARC)     │
│ • High bounce rates                                 │
│ • Rate limiting                                     │
│ • Account suspension                                │
│                                                     │
│ Account: [RESEND_API_KEY_PREFIX]                    │
└─────────────────────────────────────────────────────┘
```

### SMS & Communications

```
📱 TWILIO SMS SERVICE
┌─────────────────────────────────────────────────────┐
│ Support (24/7)                                      │
│ URL: twilio.com/support                             │
│ Phone: +1-XXX-XXX-XXXX                              │
│ Email: support@twilio.com                           │
│ Status: status.twilio.com                           │
│                                                     │
│ For:                                                │
│ • SMS delivery failures                             │
│ • High bounce rate                                  │
│ • Rate limiting / throttling                        │
│ • Phone number verification                         │
│ • Account suspension                                │
│                                                     │
│ Account: [TWILIO_ACCOUNT_SID]                       │
│ Emergency: +1-XXX-XXX-XXXX (24/7 hotline)           │
└─────────────────────────────────────────────────────┘
```

### Cloud Storage

```
☁️ AWS / S3 STORAGE
┌─────────────────────────────────────────────────────┐
│ Support (24/7 for critical)                         │
│ URL: aws.amazon.com/support                         │
│ Phone: +1-XXX-XXX-XXXX                              │
│ Email: support@aws.amazon.com                       │
│ Status: status.aws.amazon.com                       │
│ TAM: [Your TAM Name] +1-XXX-XXX-XXXX                │
│                                                     │
│ For:                                                │
│ • S3 bucket access failures                         │
│ • Upload/download errors                            │
│ • Out of disk quota                                 │
│ • Access denied errors                              │
│ • Regional outages                                  │
│                                                     │
│ Account: [AWS_ACCOUNT_ID]                           │
│ Support level: Enterprise                           │
└─────────────────────────────────────────────────────┘
```

---

## INCIDENT SEVERITY & WHO TO CALL

### Decision Tree

```
INCIDENT REPORTED
│
├─ System completely down OR data loss suspected?
│  └─► CALL IMMEDIATELY (< 2 min):
│      1. On-Call Engineer (phone call)
│      2. Tech Lead James (Slack mention)
│      3. VP Ops Sarah (Slack mention)
│      → Follow P1 runbook for incident type
│
├─ Major feature broken OR API latency > 5 sec?
│  └─► NOTIFY (< 10 min):
│      1. On-Call Engineer (Slack @channel)
│      2. Tech Lead James (optional, Slack)
│      → Follow P2 runbook for incident type
│
├─ Minor feature broken OR performance issue < 5 sec?
│  └─► CREATE ISSUE (< 1 hour):
│      1. GitHub issue with severity P3
│      2. Assign to on-call engineer
│      → Schedule in next sprint
│
└─ Cosmetic issue OR documentation error?
   └─► BACKLOG (next sprint):
       1. GitHub issue with severity P4
       2. Add to backlog
       → Fix when capacity allows
```

### Call Decision Matrix

| Symptom | Severity | First Contact | Second Contact | Response SLA |
|---------|----------|---|---|---|
| Application completely down | P1 | On-Call (phone) | Tech Lead (call) | < 5 min |
| Data loss detected | P1 | On-Call (phone) | Security Lead (call) | < 5 min |
| Security breach | P1 | Security Lead (phone) | CEO (call) | < 5 min |
| Payment processing down | P1 | On-Call (phone) | Tech Lead (call) | < 5 min |
| Database offline | P1 | DB Admin (phone) | Tech Lead (call) | < 5 min |
| API latency > 5 sec | P2 | On-Call (Slack) | Tech Lead (optional) | < 30 min |
| Feature broken with workaround | P3 | On-Call (Slack) | None | < 4 hours |
| Cosmetic/documentation | P4 | GitHub issue | None | Next sprint |

---

## QUICK CALL CHECKLIST

When calling someone about an incident:

```
[ ] You have identified the correct contact for incident type
[ ] You have 30-second summary ready:
    "Hi [Name], we have a [SEVERITY] incident:
     - What: [Brief description]
     - When: [How long it's been happening]
     - Impact: [Who's affected]
     - Current status: [What we're doing]"
[ ] You are ready to transfer to conference call/Zoom
[ ] You have Datadog dashboard open
[ ] You have incident #incidents Slack thread ready
[ ] You know what decision/action you need from them

REMEMBER: Be specific, professional, and concise.
People are responding to an emergency.
```

---

## EMERGENCY CONTACTS POSTING

**Print and post in:**
- [ ] War room by monitor
- [ ] On-call engineer's desk
- [ ] Engineering team Slack pinned message
- [ ] PagerDuty escalation policy
- [ ] Phone emergency list in IT

---

## Last Updated

**Date:** June 7, 2026  
**Next Review:** July 7, 2026  
**Changes:** New comprehensive contact matrix for Q3 2026 on-call rotation

**Questions or updates?** Contact James Mitchell (@james-mitchell) or post in #ops-oncall
