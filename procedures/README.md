# IPOReady Disaster Recovery Procedures

**Start Here**: Read in this order for complete understanding.

---

## Quick Links

| Document | Purpose | Read Time | For Whom |
|----------|---------|-----------|----------|
| **incident-response.md** | Incident detection & response | 45 min | On-Call Engineers, SRE |
| **RECOVERY_RUNBOOK.md** | Step-by-step recovery procedures | 30 min | On-Call Engineers |
| **BACKUP_STRATEGY_SUMMARY.md** | Executive overview + approval | 20 min | Leadership |
| **backup.md** | Complete technical strategy | 45 min | DevOps + Engineers |
| **DR_TEST_SCHEDULE.md** | Monthly test calendar + procedures | 30 min | QA + DevOps |
| **DR_IMPLEMENTATION_CHECKLIST.md** | 4-week implementation plan | 20 min | Project Manager |

---

## Where to Find Everything

### For Emergency Situations (Active Incident)

**1. Immediate Action** (First 5 minutes - INCIDENT RESPONSE)
```
Open: procedures/incident-response.md
Scroll to: "Quick Reference Card" (print & laminate)
Action: Declare severity level (SEV 1-4)
Action: Page on-call team if SEV 1 or 2
Action: Create #incidents Slack channel
Action: Name Incident Commander
Follow: Response procedures for your severity level
```

**2. Immediate Action** (For Technical Recovery - after declaring incident)
```
Open: procedures/RECOVERY_RUNBOOK.md OR incident-response.md scenarios
Scroll to: Your scenario (auth, database, API, documents, etc.)
Follow: Step-by-step procedure
Use: Code snippets provided
Expected outcome: System restored within SLA
```

**3. Post-Incident**
```
Complete: Post-incident checklist (in incident-response.md)
Document: Timeline, root cause, impact, actions taken
Complete: Post-incident report using template
Schedule: Post-mortem meeting (24 hours later)
Create: GitHub issues for preventive actions
```

---

### For Planning & Strategy

**1. Get Approval from Leadership**
```
Start: BACKUP_STRATEGY_SUMMARY.md (Executive overview)
Duration: 20 minutes
Approval document: DR_IMPLEMENTATION_CHECKLIST.md (final page)
```

**2. Understand Technical Details**
```
Read: backup.md (complete technical strategy)
Sections: 1-6 (Database, Application, Cloud Storage, Data Retention)
Reference: During architecture discussions
```

**3. Plan Implementation**
```
Use: DR_IMPLEMENTATION_CHECKLIST.md (7-phase roadmap)
Timeline: 4 weeks from approval
Budget: See section "Budget & Costs"
Assign: Phase owners and task leads
```

---

### For Testing & Validation

**1. Monthly Test Schedule**
```
Reference: DR_TEST_SCHEDULE.md
Frequency: Every Friday (Week 1, 2, 3, 4 of each month)
Automation: GitHub Actions (mostly automated)
Time commitment: 45 min - 1.5 hours per test
```

**2. Run First Test**
```
Date: First Friday after production deployment
Test: PITR (Point-in-Time Recovery)
Script: scripts/test-pitr-recovery.ts
Expected duration: 1 hour
Expected result: ✅ PASSED
```

**3. Track Test Results**
```
Use: DR_TEST_RESULTS.csv (in procedures/ folder)
Update: After each monthly test
Review: During quarterly planning meetings
```

---

### For Team Training

**1. Onboarding New Engineers**
```
Modules:
  1. Read: BACKUP_STRATEGY_SUMMARY.md (20 min)
  2. Read: RECOVERY_RUNBOOK.md (30 min)
  3. Watch: Team training video (30 min) [TBD]
  4. Hands-on: Simulate 1 recovery scenario (1 hour)
Total: 2 hours
```

**2. On-Call Rotation Training**
```
Every engineer in on-call rotation must:
  1. Complete onboarding (above)
  2. Participate in 1 real DR test
  3. Sign-off on RECOVERY_RUNBOOK.md
  4. Get CTO approval
Total: 3 hours per engineer
```

**3. Quarterly Refresher**
```
For all engineers:
  - 30-min team meeting
  - Review recent incidents (if any)
  - Update contact information
  - Answer Q&A
```

---

## Document Structure

### backup.md (Main Strategy)
```
1. Executive Summary
2. Infrastructure Overview
3. Database Backup Strategy (Neon + S3)
4. Application Backup Strategy (Vercel)
5. Cloud Storage Backup
6. Data Retention & Compliance
7. Recovery Procedures (Database, App, Blobs)
8. Backup Schedule & Automation
9. Backup Storage & Infrastructure (AWS S3)
10. Monitoring & Alerting
11. Disaster Recovery Runbook (overview)
12. Documentation & Training
13. Cost Optimization
14. Revision History
15. Appendices (CLI commands, quick reference)
```

### RECOVERY_RUNBOOK.md (On-Call Procedures)
```
Quick Reference Card (print & laminate)
Scenario 1: Database Corruption (CRITICAL)
  - Option 1: PITR (5-30 min recovery)
  - Option 2: S3 Backup (40-60 min recovery)
Scenario 2: Deployment Failure (CRITICAL)
  - Option 1: Automatic Rollback (already done)
  - Option 2: Manual Rollback (1-10 min)
  - Option 3: Git Revert (5-10 min)
Scenario 3: Database Connection Timeout (HIGH)
  - Option 1: Reduce Connection Pool
  - Option 2: Kill Idle Connections
Scenario 4: Lost Document (MEDIUM)
  - Option 1: Cloud provider trash
  - Option 2: Version history
  - Option 3: Database backup
Scenario 5: Data Breach (SECURITY CRITICAL)
  - Containment & Response
  - Credential rotation
Scenario 6: Cascading Failures (CRITICAL)
  - Triage & emergency response
Scenario 7: Compliance Audit
  - Generate audit reports
Post-Recovery Checklist (all incidents)
Contact Information (encrypted)
```

### DR_TEST_SCHEDULE.md (Monthly Testing)
```
Test Calendar (4 tests per month)
Test 1: PITR (Week 1 Friday)
Test 2: Rollback (Week 2 Friday)
Test 3: Cloud Sync (Week 3 Friday)
Test 4: S3 Restore (Week 4 Friday)
Test Procedures (complete scripts)
GitHub Actions Automation (CI/CD)
Test Results Tracking (CSV spreadsheet)
Escalation Matrix (who to call if test fails)
```

### DR_IMPLEMENTATION_CHECKLIST.md (Implementation Plan)
```
Phase 1: Infrastructure Setup (Week 1)
  - AWS S3 configuration
  - Neon database configuration
  - Vercel configuration
Phase 2: Backup Automation Scripts (Week 2)
  - Database export script
  - Verification script
  - Blob backup script
  - Validation script
  - Recovery script
Phase 3: GitHub Actions Automation (Week 2-3)
  - Backup scheduling
  - DR testing
  - Monitoring & alerting
Phase 4: Documentation & Training (Week 3)
  - Main documentation
  - Recovery procedures
  - Testing schedule
  - Team training
Phase 5: Testing & Validation (Week 4)
  - Manual testing (all scenarios)
  - Automated test validation
  - Performance benchmarking
  - Load testing
Phase 6: Production Deployment (Week 4+)
  - Pre-deployment checklist
  - Production rollout
  - Initial backups
  - Post-deployment monitoring
  - Team handoff
Phase 7: Continuous Improvement (Ongoing)
  - Monthly monitoring
  - Quarterly review
  - Annual planning
Risk & Issue Tracking
Budget & Costs
Success Metrics
Sign-Off & Approval
```

---

---

## Incident Response (NEW - START HERE FOR LIVE INCIDENTS)

**SEE: procedures/incident-response.md**

This new document covers:
- **Detection**: How to identify incidents (monitoring, alerts, user reports)
- **Severity Levels**: SEV 1 (critical), SEV 2 (high), SEV 3 (medium), SEV 4 (low)
- **Response Procedures**: 
  - SEV 1: Page on-call, 5min response, 1hr resolution target
  - SEV 2: 15min response, 4hr resolution target
  - SEV 3: 1hr response, 1 business day resolution
- **Scenarios**: 8 detailed incident scenarios (auth, database, API, documents, payments, etc.)
- **Communication**: Status page updates, stakeholder notifications
- **Postmortem**: RCA template, lessons learned tracking

**When to use incident-response.md**:
- An incident is happening RIGHT NOW
- You need to declare severity and page the team
- You need to know exact response SLAs
- You need detailed scenarios for your specific issue
- You need postmortem templates

**When to use RECOVERY_RUNBOOK.md**:
- Incident already declared and diagnosed
- You know the root cause and need recovery steps
- You need to restore database, deploy, or recover data

---

## Common Workflows

### Workflow 1: ACTIVE INCIDENT - What to Do

```
1. Open: procedures/incident-response.md
2. Read: "Quick Reference Card" (first section)
3. Use severity decision tree: What's actually broken?
4. Declare incident in #incidents Slack channel
5. Page on-call team if SEV 1 or 2
6. Follow response procedures for your severity level
7. Jump to specific scenario (A-H) if needed
8. For recovery details: Jump to RECOVERY_RUNBOOK.md
9. After resolved: Complete post-incident checklist
10. Post-incident: Create incident report using template
```

### Workflow 2: Emergency - Database Down (Critical)

```
1. Open: RECOVERY_RUNBOOK.md
2. Jump to: "Scenario 1: Database Corruption"
3. Assess: Is PITR window still available? (< 7 days old)
4. If YES (recommended):
   - Run: PITR recover command
   - Wait: 5-30 minutes
   - Verify: Data integrity
5. If NO (unusual):
   - Run: S3 backup restore
   - Wait: 30-60 minutes
   - Verify: Data integrity
6. When stable:
   - Complete: Post-recovery checklist
   - Notify: Team via Slack
   - Schedule: Post-mortem (next day)
```

### Workflow 2: Emergency - Bad Deployment

```
1. Open: RECOVERY_RUNBOOK.md
2. Jump to: "Scenario 2: Deployment Failure"
3. Check: Did Vercel auto-rollback? (check dashboard)
4. If NO:
   - Run: vercel rollback command
   - Wait: 1-5 minutes
   - Verify: Health check passes
5. If rollback failed:
   - Run: git revert HEAD
   - Push to main
   - Wait: 2-5 minutes for deploy
6. When stable:
   - Complete: Post-recovery checklist
   - Root cause: Why did deployment fail?
   - Fix: Implement safeguard for next time
```

### Workflow 3: Monthly Testing

```
1. Open: DR_TEST_SCHEDULE.md
2. Find: This month's test (Week 1, 2, 3, or 4)
3. Run: GitHub Actions test (should be automatic)
4. Monitor: Test execution (watch logs)
5. Verify: Test result (pass or fail)
6. Document: Update test results CSV
7. If FAILED:
   - Debug: Check error messages
   - Fix: Resolve issue
   - Re-run: Test again
   - Report: Document root cause
```

### Workflow 4: Implementation Planning

```
1. Get approval: BACKUP_STRATEGY_SUMMARY.md
2. Create tickets: DR_IMPLEMENTATION_CHECKLIST.md
3. Assign phases: Distribute work to team
4. Schedule: Weekly sync meetings
5. Track: Jira board with checklist items
6. Validate: Manual testing at end of each phase
7. Deploy: Production rollout (Phase 6)
8. Monitor: Week 1 of production (Phase 6-7)
9. Close: Mark implementation complete
```

---

## File Locations (Absolute Paths)

```
/Users/test/Documents/Claude/Projects/IPOReady/
├── BACKUP_STRATEGY_SUMMARY.md (Executive overview)
├── backup.md (Complete technical strategy)
├── procedures/
│   ├── README.md (This file - procedures index)
│   ├── incident-response.md (Incident detection & response) *** START HERE FOR INCIDENTS ***
│   ├── RECOVERY_RUNBOOK.md (Emergency recovery procedures)
│   ├── DR_TEST_SCHEDULE.md (Monthly testing)
│   ├── DR_IMPLEMENTATION_CHECKLIST.md (Implementation plan)
│   ├── DR_TEST_RESULTS.csv (Test tracking - auto-updated)
│   └── VENDOR_CONTACTS.txt (Encrypted - not in repo)
├── incidents/ (Created during incidents)
│   ├── [DATE-HHMMUTC]-[TITLE]-report.md (Post-incident report)
│   └── [DATE-HHMMUTC]-[TITLE]/ (Incident logs and data)
├── scripts/
│   ├── backup-to-s3.ts (Database export)
│   ├── backup-blobs.ts (Blob manifest)
│   ├── verify-neon-backup.js (Verification)
│   ├── validate-recovery.ts (Validation)
│   ├── restore-from-s3.ts (Recovery)
│   ├── monthly-recovery-test.ts (Test automation)
│   └── monitor-deployment.ts (Post-deploy health)
├── .github/workflows/
│   ├── backup-schedule.yml (Daily backups)
│   └── dr-tests.yml (Monthly testing)
```

---

## Before Your First Shift (On-Call Engineer)

**Incident Response Training**:
- [ ] **Read** incident-response.md (45 min) - covers detection, severity levels, response procedures
- [ ] **Read** "Quick Reference Card" section (5 min) - severity decision tree, contact list
- [ ] **Print** Quick reference card from incident-response.md
- [ ] **Laminate** card and tape to desk (emergency procedures at desk)
- [ ] **Memorize** Severity levels (SEV 1-4) and response SLAs
- [ ] **Review** Your specific role:
  - [ ] Are you Incident Commander? (Read "Response Procedures" section)
  - [ ] Are you on-call engineer? (Read scenarios A-H)
  - [ ] Are you CTO? (Read escalation matrix)

**Disaster Recovery Training**:
- [ ] **Read** RECOVERY_RUNBOOK.md (30 min) - recovery procedures for 7 scenarios
- [ ] **Read** BACKUP_STRATEGY_SUMMARY.md (20 min) - backup overview
- [ ] **Print** Quick reference card (first page of runbook)
- [ ] **Test** access to all systems:
  - [ ] Neon console (https://console.neon.tech)
  - [ ] Vercel dashboard (https://vercel.com)
  - [ ] AWS console (https://console.aws.amazon.com)
  - [ ] GitHub repo (git clone [repo])
  - [ ] PagerDuty (check on-call assignment)
  - [ ] Slack (check #incidents channel access)

**Operational Setup**:
- [ ] **Bookmark** /procedures/README.md, incident-response.md, RECOVERY_RUNBOOK.md
- [ ] **Update** contacts: Replace placeholders with actual phone numbers
- [ ] **Verify** you have credentials for all systems
- [ ] **Join** on-call rotation (PagerDuty / scheduling system)
- [ ] **Get** CTO sign-off (confirming you're ready)
- [ ] **Test** your response to a simulated incident (chaos engineering)

**Total Time**: 3-4 hours  
**When Ready**: You can:
- Declare an incident and page the team correctly
- Identify severity and follow correct response procedures
- Execute recovery for common scenarios
- Communicate effectively with stakeholders

---

## Key Phone Numbers & Contacts

**⚠️ KEEP THIS ENCRYPTED - DO NOT COMMIT TO GIT**

Store in password manager (1Password, LastPass, Vault, etc.):

```
On-Call Phone: [Your current phone number]
CTO: [Name] [Phone number]
DevOps Lead: [Name] [Phone number]
CEO: [Name] [Phone number]
Neon Support: https://support.neon.tech
AWS Support: https://console.aws.amazon.com/support
Vercel Support: https://vercel.com/support
```

---

## FAQ

**Q: What do I do if a backup fails?**  
A: Open RECOVERY_RUNBOOK.md → "Post-Incident Checklist" → Escalate to infrastructure lead. Previous backup is available (24-hour buffer).

**Q: How long will a recovery take?**  
A: PITR (best case): 5-30 minutes. S3 restore (worst case): 30-60 minutes. Both under the 4-hour SLA.

**Q: Can I test the backup system myself?**  
A: Yes! Each recovery procedure in RECOVERY_RUNBOOK.md can be tested with the test database (ipoready-test).

**Q: What if I make a mistake during recovery?**  
A: That's why we test monthly. If you make a mistake:
1. Stop immediately
2. Contact infrastructure lead
3. Don't make changes without approval
4. Document exactly what happened
5. Use backup plan (option 2 in the runbook)

**Q: Who do I call if something is wrong?**  
A: See "Key Phone Numbers" section above. Or ping #incidents on Slack.

**Q: Where are the actual backup files stored?**  
A: S3 bucket `ipoready-backups-prod` (see backup.md section 9).

**Q: How do I verify a backup worked?**  
A: Run: `node scripts/verify-neon-backup.js` or check S3 bucket for daily uploads.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-06-07 | Initial creation: Complete DR strategy with 5 documents |

---

## Document Ownership & Maintenance

**Primary Owner**: Infrastructure Lead  
**Secondary Owner**: DevOps Team  
**Review Frequency**: Quarterly  
**Update Trigger**: After each incident or test failure  

**Last Updated**: 2026-06-07  
**Next Review**: 2026-09-07  

---

## How to Use This Folder

1. **Copy** this entire `/procedures/` folder to your team's shared drive (Google Drive, Dropbox, etc.)
2. **Encrypt** vendor contact information (separate file, not in repo)
3. **Share** RECOVERY_RUNBOOK.md with all on-call engineers
4. **Bookmark** README.md in every engineer's browser
5. **Print** quick reference card (laminate for durability)
6. **Test** monthly using DR_TEST_SCHEDULE.md

---

**Questions? Contact the Infrastructure Lead or DevOps Team.**

