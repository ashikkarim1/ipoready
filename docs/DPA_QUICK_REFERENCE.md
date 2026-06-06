# DPA Quick Reference Guide

**IPOReady Data Processing Addendum - At a Glance**

---

## DOCUMENT OVERVIEW

| Document | Location | Purpose | Audience |
|----------|----------|---------|----------|
| **Master DPA** | `/docs/DATA_PROCESSING_ADDENDUM.md` | Complete legal agreement governing data processing | Customers, Legal, Compliance |
| **Implementation Guide** | `/docs/DPA_IMPLEMENTATION_GUIDE.md` | Operational procedures and setup | Internal Teams, DPO |
| **Quick Reference** | This document | Key facts and contacts at a glance | Everyone |

---

## ONE-PAGE DPA SUMMARY

**What it is:** A legally binding agreement explaining how IPOReady processes and protects personal data on behalf of customers.

**Who needs it:** All customers subject to GDPR, CCPA, PIPEDA, or other data protection regulations.

**Key promises IPOReady makes:**
1. Process data ONLY as instructed by the customer
2. Protect data with military-grade encryption (AES-256, TLS 1.3)
3. Limit access to authorized employees only
4. Notify customers of security breaches within 72 hours
5. Help customers fulfill data subject rights (access, deletion, portability, etc.)
6. Use only approved subprocessors (Vercel, Neon, Stripe, Twilio, Resend, Anthropic)
7. Allow audits of security controls
8. Delete data appropriately when no longer needed

**What we process:** Names, emails, company info, financial data, documents, activity logs, payment info

**Where data is stored:** USA (AWS/Vercel infrastructure); EU and Canada options available

**How long we keep it:** 2-7 years depending on data type; customers can request deletion anytime

---

## CRITICAL SECTIONS QUICK LOOKUP

| Section | Topic | Page Range | Key Points |
|---------|-------|-----------|-----------|
| **1** | Scope & Processing Activities | 1-4 | What data, what we use it for, who we process it for |
| **2** | Processor Obligations | 5-10 | Security controls, encryption, access limits, confidentiality |
| **3** | Subprocessors | 10-14 | List of vendors, SCCs, how we manage them |
| **4** | Data Transfers | 14-18 | How data moves between US/EU/Canada; Standard Contractual Clauses |
| **5** | Data Subject Rights | 18-35 | How customers can exercise GDPR/CCPA rights |
| **6** | Retention & Deletion | 35-37 | How long we keep data, how we delete it securely |
| **7** | Breach Notification | 37-42 | What we do if there's a security incident |
| **8** | Audit Rights | 42-45 | How customers can audit our security |
| **9** | Special Categories** | 45-46 | How we handle sensitive data (health, religion, race, etc.) |
| **10** | Cross-Border & 3rd Parties | 46-47 | Who we share data with, government requests |
| **11** | Confidentiality Summary | 47-48 | Obligations of both parties |
| **12** | Termination & Data Handling | 48-49 | What happens when service ends |

---

## KEY NUMBERS & TIMELINES

| Item | Standard | GDPR | CCPA/CPRA | Notes |
|------|----------|------|-----------|-------|
| **Breach Notification** | 72 hours | 72 hours | No unreasonable delay (30-45 days typical) | To customer first, then regulators |
| **Data Access Request** | 30 days | 30 days | 45 days (extendable to 90) | Provide in machine-readable format |
| **Erasure Request** | 30 days | 30 days | 45 days (extendable to 90) | Subject to legal hold exceptions |
| **Data Portability** | 15 days | 30 days | 45 days (extendable to 60) | CSV, JSON, or XML format |
| **Subprocessor Notice** | 30 days | 30 days | 30 days | Advance notice before changes |
| **Audit Frequency** | 1/year | 1/year | As required | Reasonable notice required |
| **Log Retention** | 12 months | 12 months | 12 months | Min; can be longer for audit |
| **Data Retention** | Varies | 2-7 years | 2-7 years | Depends on data category |

---

## SECURITY CHECKLIST

**Encryption:**
- [ ] All data encrypted in transit (TLS 1.3)
- [ ] All data encrypted at rest (AES-256)
- [ ] Encryption keys rotated quarterly

**Access Control:**
- [ ] Multi-factor authentication (MFA) required
- [ ] Role-based access control (RBAC) implemented
- [ ] 30-minute session timeout
- [ ] All personnel signed confidentiality agreements

**Monitoring:**
- [ ] 24/7 intrusion detection system (IDS)
- [ ] Real-time security alerts
- [ ] Monthly access audit
- [ ] Log retention: 12+ months

**Certifications:**
- [ ] SOC 2 Type II (annual)
- [ ] ISO 27001 (target Q4 2026)
- [ ] Penetration testing (annual)

---

## SUBPROCESSOR REFERENCE TABLE

| Subprocessor | Purpose | Data Categories | Location | SCC | Breach Notification |
|--------------|---------|------------------|----------|-----|-------------------|
| **Vercel** | Hosting | All (except payments) | USA | Yes | 24-48 hrs |
| **Neon** | Database | All | USA/optional EU | Yes | 24 hrs |
| **Stripe** | Payments | Payment cards (tokenized) | USA | Yes | Per PCI DSS |
| **Twilio** | SMS/WhatsApp | Phone numbers, message content | USA | Yes | 24 hrs |
| **Resend** | Email | Email addresses, content | USA | Yes | 24-48 hrs |
| **Anthropic** | AI Analysis | Anonymized company data | USA | Yes | 24-48 hrs |
| **Google Drive** (optional) | Cloud storage | User documents | USA or user's region | User-controlled | Per Google |
| **OneDrive** (optional) | Cloud storage | User documents | USA or user's region | User-controlled | Per Microsoft |

---

## DATA SUBJECT RIGHTS AT A GLANCE

| Right | Applies To | Process | Timeline |
|-------|-----------|---------|----------|
| **Access** | GDPR Art. 15, CCPA §1798.100 | Email privacy@ipoready.com → Get CSV/JSON export | 30 days (GDPR) / 45 days (CCPA) |
| **Erasure** | GDPR Art. 17, CCPA §1798.105 | Email privacy@ipoready.com → Approved unless legal hold | 30 days |
| **Rectification** | GDPR Art. 16 | Dashboard self-service or email request → Correct data | 10 days |
| **Portability** | GDPR Art. 20, CPRA | Email request → Download machine-readable file | 15 days |
| **Objection** | GDPR Art. 21 | Marketing: Unsubscribe link; Other: Email request | 10 days (marketing) / 30 days (other) |
| **No Profiling** | GDPR Art. 22, CPRA | Request in Account Settings → Automated decisions stop | 5 days |

**Where to Submit:**
- **Email:** privacy@ipoready.com
- **Subject Line:** [DATA SUBJECT RIGHT] [Request Type]
- **Online Form:** https://ipoready.com/data-subject-rights (TBD)

---

## GDPR COMPLIANCE MATRIX

| GDPR Article | Requirement | How We Meet It | Evidence |
|--------------|-------------|----------------|----------|
| **Art. 5** | Lawful, fair, transparent | DPA explains processing; privacy notice provided | Privacy Policy, DPA |
| **Art. 6** | Lawful basis | Processing on customer instruction (contract) | MSA + DPA |
| **Art. 12-22** | Data subject rights | Procedures for access, erasure, portability, objection | DPA Sec. 5, templates |
| **Art. 28** | Data processor agreement | This DPA | DPA itself |
| **Art. 32** | Security measures | Encryption, access controls, monitoring | DPA Sec. 2.3, SOC 2 |
| **Art. 33** | Breach notification | Notify within 72 hours | DPA Sec. 7 |
| **Art. 34** | Data subject notification | Notify individuals if high risk | DPA Sec. 7.2 |
| **Ch. V** | International transfers | Standard Contractual Clauses | DPA Sec. 4, Annex D |

---

## CCPA/CPRA COMPLIANCE MATRIX

| Regulation | Requirement | How We Meet It | Evidence |
|------------|-------------|----------------|----------|
| **Cal. Civ. Code §1798.100** | Right to know | Data access requests within 45 days | DPA Sec. 5.1 |
| **§1798.105** | Right to delete | Erasure requests within 45 days | DPA Sec. 5.3 |
| **§1798.110** | Right to correct | Rectification of inaccurate data | DPA Sec. 5.2 |
| **§1798.120** | Right to limit use | No sale/sharing unless opted in | DPA Sec. 3.2 |
| **CPRA §1798.100(d)** | Right to portability | Export in machine-readable format | DPA Sec. 5.5 |
| **§1798.150** | Data breach liability | Notify without unreasonable delay | DPA Sec. 7 |
| **CPRA §1798.110(d)** | No automated decision-making | Can opt out of profiling | DPA Sec. 5.7 |

---

## INCIDENT RESPONSE FLOW

```
BREACH DETECTED
    ↓
[0-4 hrs] Isolate systems, assess severity (Tier 1/2/3)
    ↓
[4 hrs] Notify Customer (email + phone for Tier 1)
    ↓
[24 hrs] Contain breach, preserve evidence
    ↓
[72 hrs] Notify regulators if required (Tier 1, high risk)
    ↓
[30 days] Notify individuals (if applicable)
    ↓
[20 days] Complete forensic investigation, issue report
    ↓
[Ongoing] Remediate security gaps, implement fixes
```

**24/7 Emergency Contact:** incidents@ipoready.com or [phone number]

---

## GDPR vs. CCPA vs. CPRA COMPARISON

| Aspect | GDPR | CCPA | CPRA |
|--------|------|------|------|
| **Jurisdiction** | EU/EEA/UK | California | California (effective 2023) |
| **Scope** | All personal data | "Personal information" | Expanded: includes inferred data |
| **Breach Notification** | 72 hours | Without unreasonable delay | Without undue delay (expedient) |
| **Data Subject Rights** | Access, erasure, rectification, portability, objection | Access, deletion, opt-out | + portability, correction, limit profiling |
| **Automated Decision-Making** | Prohibited unless justified | N/A | Prohibited unless justified |
| **Special Categories** | Prohibited unless justified | N/A | Sensitive information (similar rules) |
| **Data Minimization** | Explicitly required | Implied | Explicit (CPRA Sec. 1798.100) |
| **Consent** | Required (opt-in) | Opt-out for "sale" | Opt-in for sale/share, opt-out others |

---

## CUSTOMER DPA CHECKLIST

**When implementing DPA with customer:**

- [ ] Send DPA document & signature page
- [ ] Obtain signed DPA within 30 days
- [ ] Add DPA reference to MSA (if not already included)
- [ ] Provide DPA summary to customer's legal team
- [ ] Document completion in CRM
- [ ] Brief account manager on DPA terms
- [ ] Confirm customer's Data Controller contact info
- [ ] Inform customer of privacy@ipoready.com email

**At contract renewal:**
- [ ] Check for DPA updates needed (legal/regulatory changes)
- [ ] Confirm customer still understands data handling practices
- [ ] Review subprocessor list (any changes?)
- [ ] Discuss audit/compliance needs

---

## COMMON QUESTIONS & ANSWERS

**Q: Is the DPA required by law?**
A: Yes, GDPR Article 28 requires a written Data Processing Agreement. CCPA also expects processor-level agreements. We provide this DPA to comply with law and demonstrate best practices.

**Q: Who signs the DPA?**
A: The Customer (Data Controller) and IPOReady (Data Processor). Typically signed by legal representative from each party.

**Q: Can we customize the DPA?**
A: Some customization possible (e.g., data residency, specific subprocessors), but core terms should align with law. Contact legal@ipoready.com to discuss.

**Q: How do we handle international transfers?**
A: We use Standard Contractual Clauses (SCCs) approved by the European Commission. This is the primary mechanism post-Schrems II.

**Q: What if there's a security breach?**
A: We notify you within 72 hours (GDPR) or without unreasonable delay (CCPA). Notification includes what data was affected, what we're doing to fix it, and steps you should take.

**Q: Can we get a SOC 2 report?**
A: Yes! We're pursuing SOC 2 Type II certification. Request via compliance@ipoready.com.

**Q: What about data deletion requests?**
A: We honor all data deletion requests (GDPR Article 17, CCPA §1798.105) within 30 days, except where legal holds or regulatory requirements apply.

**Q: Do you sell our data?**
A: No. As a Data Processor, we only process data per your instructions. We never sell, share, or use data for our own purposes.

---

## CONTACT INFORMATION

| Role | Email | Phone | Response Time |
|------|-------|-------|----------------|
| **Privacy Inquiries** | privacy@ipoready.com | [Phone] | 2 business days |
| **Data Subject Rights** | privacy@ipoready.com | [Phone] | 24 hours (acknowledgment) |
| **Compliance/Audit** | compliance@ipoready.com | [Phone] | 2-5 business days |
| **Security/Breach** | incidents@ipoready.com | [24/7 hotline] | Immediate |
| **Data Protection Officer** | dpo@ipoready.com | [Phone] | 2 business days |
| **Legal Questions** | legal@ipoready.com | [Phone] | 5 business days |

---

## DOCUMENT VERSIONS & UPDATES

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.0 | June 6, 2026 | Initial DPA | Current |
| 1.1 | TBD | Updates based on customer feedback | Planned (Sept 2026) |
| 2.0 | TBD | Major revision post-audit | Planned (2027) |

**Updates:** IPOReady provides 30-day advance notice of material changes. Minor clarifications may be made with 10-day notice.

---

## USEFUL LINKS & RESOURCES

- **DPA Master Document:** https://github.com/ipoready/docs/DATA_PROCESSING_ADDENDUM.md
- **Privacy Policy:** https://ipoready.com/privacy
- **Terms of Service:** https://ipoready.com/terms
- **Security Incident Report:** https://ipoready.com/security
- **Data Subject Rights Form:** https://ipoready.com/data-subject-rights (TBD)
- **Transparency Report:** https://ipoready.com/transparency (annual)
- **Subprocessor Amendments:** https://ipoready.com/subprocessors (updates)

---

## FOR REGULATORY AUTHORITIES

**If you're a supervisory authority or regulator investigating IPOReady:**

- **GDPR Supervisory Authority Contact:** dpo@ipoready.com
- **CCPA Attorney General Contact:** privacy@ipoready.com
- **PIPEDA Privacy Commissioner Contact:** privacy@ipoready.com

We respond to all regulatory requests within 20 business days.

---

## APPROVAL & ACKNOWLEDGMENT

This Quick Reference reflects the Data Processing Addendum effective June 6, 2026.

**Document Owner:** Chief Privacy Officer  
**Last Updated:** June 6, 2026  
**Next Review:** December 6, 2026  

For corrections or questions: **dpo@ipoready.com**

---

**Version:** 1.0  
**Last Revised:** June 6, 2026  
**Status:** FINAL
