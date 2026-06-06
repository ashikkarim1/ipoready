# IPOReady Privacy Policy - Quick Reference Guide

**Version:** 1.0  
**Last Updated:** June 6, 2026  
**Audience:** Privacy Team, Legal, Support, Engineering

---

## Privacy Policy Location

- **Web Version:** https://ipoready.com/privacy-policy
- **Markdown:** `/public/privacy-policy.md`
- **Plain Text:** `/public/privacy-policy.txt`
- **Checklist:** `/docs/PRIVACY_POLICY_CHECKLIST.md`
- **Contact:** privacy@ipoready.com

---

## Key Privacy Contacts

| Role | Email | Phone | Availability |
|------|-------|-------|--------------|
| Privacy Lead | privacy@ipoready.com | [TBD] | 24/7 for incidents |
| Data Protection Officer (DPO) | dpo@ipoready.com | [TBD] | Business hours |
| Legal Counsel | [TBD] | [TBD] | Business hours |
| Support Privacy Escalation | support+privacy@ipoready.com | [TBD] | 24/5 |

---

## What We Collect

### By Category

| Category | Examples | Duration |
|----------|----------|----------|
| **Account Data** | Name, email, phone, password | Account active + 2 years |
| **Company Data** | Legal structure, financials, board info | Account active + 7 years |
| **Documents** | SEC filings, prospectuses, statements | Account active + 7 years |
| **Billing Data** | Card last 4 digits (via Stripe), address, invoices | 7 years (tax) |
| **Usage Data** | Pages visited, features used, timestamps | 25 months (analytics) |
| **Log Data** | IP addresses, error logs, API calls | 90 days |
| **Cookies** | Session tokens, preferences, analytics | Session to 12 months |

### What We DON'T Collect

- ✗ Full credit card numbers (Stripe handles)
- ✗ Passwords in plain text (bcrypt hashed)
- ✗ Social security numbers (unless tax ID disclosed)
- ✗ Biometric data
- ✗ Health information (unless in documents)
- ✗ Children's personal data (under 13)
- ✗ Precise geolocation
- ✗ Behavioral data for cross-context advertising

---

## What We Use Data For

| Purpose | Legal Basis | User Benefit |
|---------|-------------|--------------|
| Running the service | Contract | Core functionality |
| Payments and billing | Contract + Legal | Subscription management |
| Customer support | Contract | Help when needed |
| Security and fraud prevention | Legitimate interest + Legal | Account protection |
| Product improvement | Legitimate interest | Better features |
| Analytics and insights | Legitimate interest | Performance optimization |
| Marketing (opt-in only) | Consent | Relevant offers |
| Legal compliance | Legal obligation | Regulatory adherence |

---

## Who We Share Data With

### Service Providers (Data Processors)

**Infrastructure & Hosting**
- AWS: Document storage, backups, hosting
- Neon: PostgreSQL database
- Vercel: Application deployment

**Payments**
- Stripe: Payment processing (PCI compliant)

**Communications**
- Resend: Email delivery
- Twilio: SMS/WhatsApp/voice

**Analytics**
- Google Analytics 4: User behavior tracking

**AI & Automation**
- Anthropic: Document analysis for compliance triggers
- OpenAI: Document summarization (if enabled)

### Do NOT Share
- ❌ No "sale" of personal data (CCPA definition)
- ❌ No cross-context behavioral advertising sharing
- ❌ No unaffiliated third-party sharing
- ❌ No sharing for cash/valuable consideration

### Do Share When Required
- ✓ Law enforcement (court order, subpoena)
- ✓ SEC/regulatory investigation
- ✓ Fraud prevention necessities
- ✓ Legal proceedings (disclosure required)

---

## User Privacy Rights

### GDPR Rights (EU/EEA Users)

| Right | What They Can Do | Response Time | How They Request |
|-------|------------------|----------------|------------------|
| **Access** | Get copy of their data | 30 days | Settings > Privacy |
| **Rectification** | Fix inaccurate data | 30 days | Settings > Privacy |
| **Erasure** | Delete their data | 30 days | Settings > Privacy |
| **Restrict** | Limit processing | 30 days | Settings > Privacy |
| **Portability** | Download in CSV/JSON | 30 days | Settings > Privacy |
| **Object** | Opt-out of processing | 30 days | Settings > Privacy |
| **Complaint** | Report to DPA | N/A | DPA website |
| **Automated Decisions** | Opt-out of PACE scoring | 30 days | Settings > Privacy |

### CCPA Rights (California Users)

| Right | What They Can Do | Response Time | How They Request |
|-------|------------------|----------------|------------------|
| **Know** | See what we collected | 45 days | Settings > Privacy |
| **Delete** | Request deletion | 45 days | Settings > Privacy |
| **Correct** | Update inaccurate data | 45 days | Settings > Privacy |
| **Opt-Out** | Opt-out of "sale/sharing" | Immediately | Settings > Privacy |
| **Limit Use** | Limit sensitive data use | 45 days | Settings > Privacy |
| **Non-Discrimination** | No penalty for requesting | N/A | We enforce |
| **Appeal** | Appeal our denial | 45 days | Email privacy team |

### Multi-State Rights (VA, CO, CT, UT, NV)

All states have similar rights to CCPA:
- Right to Know
- Right to Delete
- Right to Correct
- Right to Data Portability
- Right to Opt-Out of Automated Decisions
- Right to Opt-Out of Targeted Advertising

---

## How to Handle Privacy Requests

### Step 1: Receive Request

**Online Portal (Preferred)**
- User submits via Settings > Privacy & Data
- System auto-logs request
- Confirmation email sent

**Email**
- Send to: privacy@ipoready.com
- Subject: "Privacy Request - [Name]"
- Include: Name, email, account ID, request type

**Phone/Chat**
- Route to privacy@ipoready.com
- Document request in ticket system
- Send confirmation email

### Step 2: Verify Identity

**For Account Users:**
- Verify email address on file
- Confirm account creation date
- Check last login date

**For Non-Account Users:**
- Request: Email address + proof of residence
- May request: Last 4 of payment method
- May request: Alternative identifier

**For Sensitive Requests (Delete, Access, Portability):**
- Send verification email
- Require reply from original email
- May request government ID (for sensitive data)

### Step 3: Fulfill Request

**Access Request (Scope: All personal data)**
- Export from database
- Format: CSV or JSON
- Include: All data per policy
- Exclude: Trade secrets, third-party sensitive data

**Delete Request (Scope: Personal identifiers)**
- Deactivate account immediately
- Delete from active systems (7 days)
- Remove from backups (30 days)
- Maintain legal hold data
- Send deletion confirmation

**Correct Request (Scope: Specific fields)**
- Identify inaccuracy
- Update database
- Notify user of change
- Document correction

**Opt-Out Request (Scope: Marketing + Processing)**
- Remove from marketing list
- Flag account for no marketing
- Disable analytics (if requested)
- Send confirmation

**Portability Request (Scope: User-provided data)**
- Export structured format
- Include: Account info, documents, messages
- Exclude: Derived data, log data
- Format: ZIP with CSV/JSON files

### Step 4: Respond to User

**Response Template**
```
Thank you for your [access/delete/correct/opt-out] request.

Request ID: [AUTO-GENERATED]
Request Type: [Type]
Received Date: [Date]
Deadline: [30 days GDPR / 45 days CCPA]

Status: [In Progress / Completed / Denied]

[Details about fulfillment or denial reason]

If you have questions, contact privacy@ipoready.com
```

**Response Timeline**
- GDPR: 30 days (extendable 60 days for complex)
- CCPA/CPRA: 45 days (extendable 45 days for complex)
- Other states: 30-45 days

---

## Data Retention Schedule (Quick Reference)

| Data Type | Keep Until | Delete After |
|-----------|-----------|--------------|
| Active account info | Active + 2 years | 2 years post-closure |
| Documents & files | Active + 7 years | 7 years post-closure |
| Transactions | 7 years | 7 years (tax law) |
| Email logs | 1 year | 1 year |
| Support tickets | 2 years | 2 years |
| Analytics | 25 months | 25 months |
| Server logs | 90 days | 90 days |
| Failed logins | 90 days | 90 days |
| Backups | 30 days after delete | 30 days |
| Legal holds | Per legal directive | As released |

**Important:** Retention periods start AFTER account closure.

---

## Common Privacy Requests - Response Scripts

### "I want to download my data"

**Response:**
```
Thank you for requesting your data. Here's what we'll provide:
- Account information (name, email, billing address)
- All documents you uploaded
- Your message history and annotations
- Your PACE assessment results
- Usage data and preferences

We'll deliver this as a ZIP file with CSV exports within 30 days.
You can download your data anytime in Settings > Privacy & Data.

Request ID: [AUTO]
```

### "I want to delete my account"

**Response:**
```
We can delete your account data. Here's what happens:

Immediate (24 hours):
- Account deactivated
- Access revoked
- Data hidden from view

Quick (7 days):
- Removed from active systems
- No longer searchable
- Not accessible to team

Final (30 days):
- Deleted from backup systems
- Confirmation email sent

Note: We keep legal/financial records for 7 years per regulation.

Request ID: [AUTO]
```

### "I want to opt-out of marketing"

**Response:**
```
Done! We've removed you from our marketing list.

This means:
- No more promotional emails
- No marketing analytics tracking
- No targeted content

You'll still receive:
- Account notifications
- Billing information
- Service updates
- Security alerts

You can manage preferences anytime in Settings > Privacy & Data.
```

### "I want to correct my data"

**Response:**
```
We can help you update your information.

You can update directly in Settings:
- Account information (name, email, phone)
- Company details
- Preferences and settings

For complex changes, we can help. Just tell us what needs fixing.

Request ID: [AUTO]
```

---

## Incident Response Quick Guide

### Privacy Breach Detected

**Immediately (Within 1 hour):**
1. Isolate affected systems
2. Notify privacy@ipoready.com
3. Preserve evidence
4. Document discovery details

**Within 24 Hours:**
1. Assess scope of breach
2. Identify affected users
3. Determine regulatory requirements
4. Prepare notification

**Within 3 Days (GDPR):**
1. Notify Data Protection Authority
2. Document investigation
3. Identify remediation steps

**Within 30 Days (User Notification):**
1. Send notification email to all affected users
2. Include: What happened, what data, what we're doing
3. Provide credit monitoring (if financial data)
4. Publish transparency report (recommended)

### Regulatory Investigation

**Immediate Response:**
1. Acknowledge receipt
2. Assign investigation lead
3. Establish response timeline
4. Preserve all records

**Ongoing:**
1. Provide requested documents
2. Meet timeline requirements
3. Keep legal counsel informed
4. Document all communications

---

## Cookies and Tracking

### Essential Cookies (Always On)

- `next-auth.session-token`: Login session (30 days)
- `next-auth.csrf-token`: Security (session)
- `Language`: Language preference (1 year)
- `Currency`: Currency preference (1 year)

### Analytics Cookies (Opt-In)

- `_ga`, `_gid`: Google Analytics (2 years)
- `GA4_CONSENT`: Consent status (1 year)

### Marketing Cookies (Opt-In)

- LinkedIn Insights: Conversion tracking (3 months)
- Drift/Intercom: Chat analytics (session/1 year)

### Cookie Management

**User Control:**
- Cookie banner on first visit
- Granular options: Essential + Analytics + Marketing
- Preference update in Settings > Privacy
- DNT signal automatically disables analytics

---

## Third-Party Integrations

### When User Connects Cloud Storage

**What Happens:**
1. User clicks "Connect [Service]" in Settings
2. Redirects to service login (NOT through us)
3. User grants permission to IPOReady
4. Service provides OAuth token (NOT password)
5. We sync file metadata (NOT contents)

**What We Get:**
- File names and IDs
- Modification dates
- Sharing status
- Folder structure

**What We DON'T Get:**
- User's password
- Other people's files
- Files in private folders
- Service account credentials

**User Can:**
- Disconnect anytime in Settings
- Revoke permissions in service
- Delete synced metadata

### When User Enables Slack Integration

**What Happens:**
1. User authorizes Slack workspace
2. We send compliance alerts to Slack
3. Alerts include: Trigger type, company, date
4. No raw document data sent

**What We Share:**
- Alert notifications only
- Mentions of company milestones
- Trigger type and timestamp

**What We DON'T Share:**
- Document contents
- Financial details
- Any proprietary information

---

## Compliance Checkpoints

### Monthly

- [ ] Monitor privacy@ipoready.com inbox
- [ ] Process pending privacy requests
- [ ] Review incident logs (none expected)
- [ ] Check analytics consent rate
- [ ] Verify DNT signal compliance

### Quarterly

- [ ] Audit vendor compliance
- [ ] Review data retention policy adherence
- [ ] Test privacy request workflow
- [ ] Verify cookie consent tracking
- [ ] Check for unauthorized data shares

### Annually

- [ ] Full policy review and update
- [ ] Legal compliance audit
- [ ] Security audit (SOC 2)
- [ ] DPA renewal with vendors
- [ ] Staff privacy training
- [ ] Incident response drill
- [ ] User privacy rights survey

---

## Key Policy Highlights

### What Makes Us GDPR Compliant

1. ✅ Lawful basis documented (contract, legal, consent, legitimate interest)
2. ✅ Privacy notice provided upfront
3. ✅ All 8 user rights supported
4. ✅ Data Protection Officer appointed
5. ✅ Data Processing Agreements in place
6. ✅ International transfers secured with SCCs
7. ✅ 72-hour breach notification capability
8. ✅ Data by design and default

### What Makes Us CCPA Compliant

1. ✅ No sale of personal information
2. ✅ No sharing for cross-context advertising
3. ✅ All consumer rights supported
4. ✅ Opt-out mechanisms available
5. ✅ Non-discrimination guaranteed
6. ✅ Appeal process documented
7. ✅ Sensitive information minimized
8. ✅ Automated decision-making opt-out

### What Makes Us COPPA Compliant

1. ✅ Service not directed at children under 13
2. ✅ No collection from children under 13
3. ✅ Parental consent required for ages 13-17
4. ✅ Parents can request data deletion
5. ✅ Parents can withdraw consent
6. ✅ No advertising directed at children
7. ✅ FTC compliance reporting process

---

## Red Flags and Escalation

### Immediately Escalate To privacy@ipoready.com

- Data breach or unauthorized access
- Regulatory investigation or subpoena
- GDPR complaint filed with DPA
- CCPA complaint or legal notice
- Pattern of privacy complaints
- Service provider security incident
- Public privacy disclosure request
- Media inquiry about data practices

### Contact Legal Counsel

- Litigation related to privacy
- Regulatory enforcement action
- Contractual privacy disputes
- International data transfer challenge
- Children's privacy violation accusation

---

## Useful Links

**Internal Resources**
- Policy: `/public/privacy-policy.md`
- Checklist: `/docs/PRIVACY_POLICY_CHECKLIST.md`
- DPA Template: [Internal Drive]
- Incident Plan: [Internal Drive]

**External Resources**
- GDPR Text: https://gdpr-info.eu/
- CCPA Text: https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=201720180AB375
- CPRA Text: https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202020180AB701
- EDPB Guidelines: https://edpb.ec.europa.eu/
- FTC COPPA: https://www.ftc.gov/coppa

**Regulatory Contacts**
- **EU DPA:** https://edpb.ec.europa.eu/about-edpb/board/members_en
- **CA Attorney General:** https://oag.ca.gov/
- **FTC:** https://reportfraud.ftc.gov/

---

## FAQ For Support Team

**Q: User says "I want all my data deleted."**
A: This is a "Right to Erasure" request. Route to privacy@ipoready.com with user's name, email, and account ID. We have 30 days to respond.

**Q: User asks for a copy of our privacy policy in a different format.**
A: We have three versions: Markdown, plain text, and web. Send them the plain text version if they prefer, or direct to privacy-policy.md.

**Q: What's the difference between "delete" and "opt-out"?**
A: Delete = remove your personal data. Opt-out = stop processing your data (but keep for legal reasons). Make sure you clarify which they want.

**Q: A user says "I never consented to marketing emails."**
A: Check our email records. If they signed up with consent, confirm they saw the checkbox. If there's an issue, remove them and apologize. Route to support+privacy@ipoready.com.

**Q: What should I do if I see a customer data leak?**
A: Do NOT investigate alone. Immediately email privacy@ipoready.com and security@ipoready.com with details. Include: where you found it, what data, when you noticed.

**Q: Can I share customer data with [partner]?**
A: No, unless authorized in writing. All data sharing decisions go through privacy@ipoready.com.

---

**Last Updated:** June 6, 2026  
**Next Review:** June 6, 2027  
**Questions?** Email privacy@ipoready.com
