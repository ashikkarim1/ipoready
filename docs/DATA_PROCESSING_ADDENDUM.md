# Data Processing Addendum (DPA)

**IPOReady Inc. / IPOReady SAS**

**Effective Date:** June 6, 2026

**Last Updated:** June 6, 2026

---

## 1. INTRODUCTION & SCOPE

This Data Processing Addendum ("DPA") is entered into between **IPOReady Inc.** and/or **IPOReady SAS** (hereinafter "Company" or "Data Controller"), and our customers who engage our services (hereinafter "Client" or "Data Processor"). This DPA governs the processing of personal data in accordance with:

- **General Data Protection Regulation (GDPR)** (EU Regulation 2016/679)
- **California Consumer Privacy Act (CCPA)** (California Civil Code §1798.100 et seq.)
- **California Privacy Rights Act (CPRA)** (Effective January 1, 2023)
- **Regulations in other jurisdictions** where IPOReady operates

This DPA supplements the Master Service Agreement ("MSA") between the parties and forms an integral part thereof.

### 1.1 Data Categories & Processing Activities

IPOReady processes the following categories of personal data on behalf of Clients:

**Personal Data Processed:**
- **Identity Information:** Full names, email addresses, phone numbers, business titles
- **Account Data:** User IDs, usernames, authentication credentials, account preferences
- **Company Information:** Company names, legal entities, incorporation details, addresses
- **Financial Data:** Billing information, payment card data (processed via Stripe), transaction history
- **Document Data:** Filing documents, prospectuses, SEC filings, regulatory correspondence, company confidential information embedded in documents
- **Behavioral Data:** Login timestamps, feature usage patterns, activity logs, document access logs
- **Communication Data:** Email content, notification preferences, communication history
- **Device Data:** IP addresses, browser type, device identifiers, operating system, cookie data
- **Compliance Data:** Regulatory submissions, audit logs, compliance attestations

### 1.2 Processing Purpose

IPOReady processes personal data for the following purposes:

1. **Core Service Delivery**
   - IPO/RTO readiness assessment and planning
   - Regulatory compliance tracking and documentation
   - Document management and storage
   - Financial benchmarking and analysis
   - User authentication and account management

2. **Service Improvement & Optimization**
   - Product analytics and feature usage monitoring
   - Performance optimization
   - User experience enhancement
   - Machine learning for predictive IPO readiness modeling

3. **Legal & Compliance Obligations**
   - Regulatory reporting
   - Incident response and breach notification
   - Audit trail maintenance
   - Fraud detection and prevention

4. **Communication & Support**
   - Email notifications and alerts
   - Customer support and assistance
   - Product updates and announcements
   - Survey and feedback collection

5. **Business Operations**
   - Billing and invoicing
   - Subscription management
   - Customer relationship management
   - Business continuity and disaster recovery

### 1.3 Data Subjects

Data subjects include, but are not limited to:

- Client employees and contractors
- Client representatives (executives, board members, counsel)
- Investors and shareholders
- Advisors and consultants
- Regulatory bodies and their representatives
- End users of Client applications
- Individuals referenced in Client documents and filings

### 1.4 Duration of Processing

Personal data shall be processed for the duration of the Service Agreement and for such additional period as required by applicable law (typically 3-7 years for regulatory and tax compliance).

---

## 2. SCOPE OF PROCESSOR OBLIGATIONS

As a Data Processor, IPOReady shall:

### 2.1 Process Data Only as Instructed

IPOReady shall process personal data only on documented instructions from the Client and shall not:

- Process personal data for purposes other than those specified in the MSA and this DPA
- Transfer personal data to third parties without prior written authorization
- Retain personal data after service termination except as required by law
- Combine personal data received from different Clients (except as anonymized/aggregated analytics)

### 2.2 Access Controls & Confidentiality

IPOReady shall:

- **Limit Access:** Restrict access to personal data to authorized employees, contractors, and agents who have a legitimate need to process it
- **Confidentiality Agreements:** Ensure all personnel with data access have executed written confidentiality agreements
- **Role-Based Access Control (RBAC):** Implement granular RBAC aligned with the principle of least privilege
- **Authentication:** Require multi-factor authentication (MFA) for all personnel accessing personal data
- **Session Management:** Enforce automatic session termination after 30 minutes of inactivity
- **Personnel Screening:** Conduct background checks on employees with access to sensitive personal data

**Personnel Access Schedule:**
- Engineering: Database access (read/write) for service debugging
- Support Team: Limited read access to customer data for support purposes only
- Finance: Access to billing and transaction data only
- Compliance & Legal: Access to audit logs and incident records

### 2.3 Data Security & Encryption

IPOReady shall implement and maintain comprehensive security measures:

#### 2.3.1 Encryption Standards

- **In Transit:** TLS 1.3 or higher for all data transmission
- **At Rest:** AES-256 encryption for all customer data at rest
- **Database:** Encrypted PostgreSQL databases with encrypted backups
- **Credentials:** Encrypted storage using bcryptjs or equivalent (cost factor ≥12)
- **API Keys & Secrets:** Encrypted storage in environment variables, never logged

#### 2.3.2 Infrastructure Security

- **Firewalls:** Enterprise-grade firewalls with IP whitelisting
- **DDoS Protection:** Cloudflare or equivalent DDoS mitigation
- **Network Segmentation:** Segregation of database, application, and storage layers
- **Web Application Firewall (WAF):** Enabled on all public-facing endpoints
- **Intrusion Detection:** Real-time monitoring and alerting for suspicious activity

#### 2.3.3 Application Security

- **Input Validation:** Strict validation of all user inputs
- **SQL Injection Prevention:** Parameterized queries; no dynamic SQL
- **Cross-Site Scripting (XSS) Prevention:** Content Security Policy (CSP) headers
- **CSRF Protection:** Anti-CSRF tokens on all state-changing operations
- **Rate Limiting:** API rate limiting to prevent brute-force attacks
- **Vulnerability Scanning:** Regular automated scanning and manual penetration testing

#### 2.3.4 Access Logging & Monitoring

- **Comprehensive Logging:** All data access attempts logged with timestamp, user ID, action, and data accessed
- **Log Retention:** Access logs retained for minimum 12 months
- **Log Encryption:** Encrypted storage of all audit logs
- **Real-Time Monitoring:** Alerts for suspicious patterns (e.g., bulk data exports, unusual access times)
- **SIEM Integration:** Events forwarded to security information and event management system

### 2.4 Subprocessor Management

Refer to Section 3 (Subprocessors) for detailed subprocessor information, authorization procedures, and breach protocols.

### 2.5 Data Subject Rights Support

IPOReady shall provide reasonable support to enable Clients to fulfill data subject rights requests:

- **Access Rights (GDPR Art. 15, CCPA §1798.100):** Data export in machine-readable format within 15 business days
- **Rectification (GDPR Art. 16):** Correction of inaccurate personal data within 10 business days
- **Erasure (GDPR Art. 17, CCPA §1798.105):** Safe deletion of personal data within 30 days (subject to legal hold requirements)
- **Restriction (GDPR Art. 18):** Limitation of processing upon request within 5 business days
- **Data Portability (GDPR Art. 20, CPRA §1798.100(d)):** Export in structured, machine-readable format within 15 business days
- **Objection (GDPR Art. 21):** Cessation of processing for direct marketing within 10 business days
- **Automated Decision-Making (GDPR Art. 22):** Meaningful human review of algorithmic decisions

**Data Export Formats:**
- CSV for structured data
- JSON for hierarchical/relational data
- PDF for document metadata
- XML for complex data structures

---

## 3. SUBPROCESSORS

### 3.1 Current Approved Subprocessors

IPOReady engages the following subprocessors for specific processing activities. All subprocessors have entered into Data Processing Agreements containing equivalent GDPR/CCPA-compliant obligations.

#### 3.1.1 INFRASTRUCTURE & HOSTING

| Subprocessor | Location | Purpose | Data Category | DPA | GDPR SCC |
|--------------|----------|---------|----------------|-----|----------|
| **Vercel Inc.** | USA (Virginia & N. Virginia) | Application hosting, CDN, edge functions, serverless functions | All | Yes | Yes (Standard Contractual Clauses) |
| **Neon (Founder SF, Inc.)** | USA (AWS infrastructure: N. Virginia, Oregon) | PostgreSQL database hosting, managed backups, query logs | All personal data in database | Yes | Yes (Standard Contractual Clauses) |
| **AWS S3** (via Vercel/Neon) | USA (N. Virginia, Oregon) | Cloud storage for backups and archive | Backup copies of personal data | Yes | Yes (Data Processing Addendum) |

#### 3.1.2 PAYMENT PROCESSING

| Subprocessor | Location | Purpose | Data Category | PCI DSS | DPA |
|--------------|----------|---------|----------------|---------|-----|
| **Stripe Inc.** | USA (San Francisco, CA) | Payment processing, subscription management, billing | Payment cards (tokenized), transaction history, billing addresses | Level 1 (PCI DSS 3.2.1) | Yes (Data Processing Addendum) |

#### 3.1.3 COMMUNICATIONS & NOTIFICATIONS

| Subprocessor | Location | Purpose | Data Category | DPA | GDPR SCC |
|--------------|----------|---------|----------------|-----|----------|
| **Resend Inc.** | USA | Transactional email delivery | Email addresses, notification content, user identifiers | Yes | Yes (Standard Contractual Clauses) |
| **Twilio Inc.** | USA (San Francisco, CA) | SMS and WhatsApp messaging | Phone numbers, message content, user identifiers | Yes | Yes (Data Processing Addendum) |

#### 3.1.4 CLOUD STORAGE INTEGRATIONS (CONDITIONAL)

For Clients who integrate third-party cloud storage, IPOReady acts as intermediary:

| Service | Purpose | Access | Data Category | User Controls |
|---------|---------|--------|----------------|----|
| **Google Drive** | Document storage & retrieval | OAuth2 token (user-controlled) | Client documents, metadata | User revokes via Google Account Settings |
| **Microsoft OneDrive** | Document storage & retrieval | OAuth2 token (user-controlled) | Client documents, metadata | User revokes via Microsoft Account Settings |
| **Dropbox** | Document storage & retrieval | OAuth2 token (user-controlled) | Client documents, metadata | User revokes via Dropbox Settings |
| **Box** | Enterprise document management | OAuth2 token (user-controlled) | Client documents, metadata | User revokes via Box Settings |

**Critical:** Users maintain exclusive control over cloud storage credentials. IPOReady does not store these credentials and cannot access third-party storage without active user authorization.

#### 3.1.5 ANALYTICS & MONITORING

| Subprocessor | Location | Purpose | Data Category | Anonymization | DPA |
|--------------|----------|---------|----------------|----------------|-----|
| **Vercel Analytics** | USA | Performance metrics, uptime monitoring | Anonymized event data, no PII | Yes (IP anonymized) | Yes (Vercel DPA) |
| **Sentry (Functional Software Inc.)** | USA | Error tracking & debugging | Error messages, stack traces, user identifiers | Partially | Yes (Data Processing Addendum) |

#### 3.1.6 AI & MACHINE LEARNING

| Subprocessor | Location | Purpose | Data Category | GDPR Compliance | Data Residency |
|--------------|----------|---------|----------------|-----------------|-----------------|
| **Anthropic (Claude API)** | USA (servers in Virginia) | IPO readiness scoring, document analysis, predictive modeling | Anonymized company metrics, financial data, filing documents | Yes (Terms of Service include data processing restrictions) | USA |

**Claude AI Restrictions:**
- No personal names or email addresses sent to Claude
- Company data anonymized before API calls
- All document processing uses anonymized identifiers
- Claude does not train on customer data (verified in API ToS)
- Request data minimization for all API calls

### 3.2 Subprocessor Authorization & Change Procedures

#### 3.2.1 Current Authorization

Clients authorize IPOReady to engage the subprocessors listed in Section 3.1 for processing as described.

#### 3.2.2 New Subprocessor Notification

For new subprocessors or changes to existing subprocessor terms:

1. **Advance Notice:** IPOReady shall provide at least **30 calendar days' advance notice** to Client
2. **Notice Content:** Notice shall include:
   - Name, location, and contact information of new subprocessor
   - Description of processing activities
   - Data categories involved
   - Security measures and certifications
   - Execution date
   - Link to subprocessor's Data Processing Addendum or privacy policy
3. **Objection Right:** Client may object on reasonable grounds within 20 days
4. **Conflict Resolution:** If Client objects, parties shall discuss in good faith; if unresolved, Client may terminate affected services without penalty

#### 3.2.3 Subprocessor Monitoring

IPOReady shall:

- **Annual Audits:** Conduct or review annual security audits of critical subprocessors
- **Compliance Verification:** Verify ongoing GDPR, CCPA, and SOC 2 Type II compliance
- **SLA Monitoring:** Monitor performance against Service Level Agreements
- **Breach Notification:** Maintain subprocessor breach notification protocols (see Section 7)

---

## 4. DATA TRANSFER MECHANISMS

### 4.1 Legal Basis for International Transfers

IPOReady operates infrastructure in the United States. Data transfers from EU/EEA and other jurisdictions are governed by the following mechanisms:

### 4.2 Standard Contractual Clauses (SCCs)

**Applicable to:** Vercel, Neon, Stripe, Twilio, Resend, Sentry, AWS

IPOReady and applicable subprocessors have executed Standard Contractual Clauses (as approved by the European Commission):

- **Module One** (Controller-to-Processor): For arrangements where IPOReady acts as processor
- **Module Two** (Processor-to-Processor): For onward transfers to subprocessors
- **Supplementary Measures:** As required post-Schrems II decision

#### 4.2.1 Schrems II Supplementary Measures

Following EU Court of Justice Decision C-311/18 (Schrems II), IPOReady implements:

- **Data Minimization:** Only necessary data transferred; anonymization where feasible
- **Encryption:** End-to-end encryption for sensitive data in transit and at rest
- **Access Restrictions:** Limited to authorized personnel in the USA
- **Contractual Safeguards:** SCCs with additional security obligations
- **Legal Assessment:** Monitoring of USA surveillance laws and regulations
- **Mechanism Review:** SCCs reviewed annually for adequacy post-Schrems II

#### 4.2.2 SCC Documentation

Standard Contractual Clause agreements are maintained at:

- **Vercel:** Available via Vercel's privacy documentation
- **Neon:** Available via Neon's DPA
- **Stripe:** Available via Stripe's Data Processing Addendum
- **Twilio:** Available via Twilio's Data Processing Addendum

Clients may request certified copies upon reasonable notice.

### 4.3 Binding Corporate Rules (BCRs)

Not applicable; IPOReady currently operates as a single entity in multiple jurisdictions. Future BCR adoption shall be communicated in writing.

### 4.4 Adequacy Decisions

IPOReady does not rely on Adequacy Decisions but instead on Standard Contractual Clauses as the primary transfer mechanism.

### 4.5 Country-Specific Restrictions

#### 4.5.1 EU/EEA Restrictions

- Personal data of EU/EEA residents processed on SCCs only
- Compliance monitoring for adequacy of USA protections
- Quarterly review of US surveillance laws impacting data protection

#### 4.5.2 UK Restrictions (Post-Brexit)

UK personal data:
- Transfers on UK-US SCCs (as approved by the UK ICO)
- Processing restricted to Section 3 lawful bases
- GDPR (UK) Article 32 security standards maintained

#### 4.5.3 Canada

Canadian personal data subject to:
- **PIPEDA** (Personal Information Protection and Electronic Documents Act)
- **Provincial Privacy Laws** (Quebec: Law 25, Alberta: PIPA, etc.)
- SCCs for US-based hosting
- Data residency options available upon request

### 4.6 Data Residency & Localization

#### 4.6.1 Default Architecture

- **Application Layer:** Hosted on Vercel with global CDN (content cached globally, origin in USA)
- **Database Layer:** Neon PostgreSQL hosted on AWS US regions
- **Backups:** Encrypted, stored in AWS S3 (US N. Virginia primary, Oregon secondary)
- **Email & Messaging:** Processed in USA (Resend, Twilio)

#### 4.6.2 Data Residency Options

Upon written request, Clients may request:

1. **EU Data Residency Package**
   - Database replica in Frankfurt (AWS eu-central-1)
   - Backup storage in Germany
   - Additional latency: 80-120ms
   - Estimated cost increase: 30-40%
   - Setup time: 4-6 weeks

2. **Canada Data Residency Package**
   - Database replica in Toronto (AWS ca-central-1)
   - All backups retained in Canada
   - Additional latency: 20-40ms
   - Estimated cost increase: 20-30%
   - Setup time: 2-4 weeks

#### 4.6.3 Residency Terms

- Minimum contract extension: 12 months
- Separate Data Processing Addendum for residency arrangement required
- Ongoing monitoring and audit rights included
- Migration back to default architecture: 30-day notice required

---

## 5. DATA SUBJECT RIGHTS FULFILLMENT

### 5.1 Right of Access (GDPR Article 15 | CCPA §1798.100)

#### 5.1.1 GDPR Right of Access

Data subjects may request a copy of personal data processing by submitting a verifiable request to **privacy@ipoready.com**.

**Response Requirements:**
- **Timeline:** Within 30 calendar days of receipt
- **Format:** Structured, commonly used, machine-readable format (CSV, JSON, XML)
- **Content:** All personal data, processing purposes, recipients, retention period
- **Extensions:** If complex, 60 days permitted with notice
- **Exemptions:** Trade secrets, attorney-client privileged communications (redacted)

#### 5.1.2 CCPA Right to Know

California residents have the right to know what personal information is collected, used, shared, and sold.

**Response Requirements:**
- **Timeline:** Within 45 calendar days (extendable to 90 days with notice)
- **Format:** Downloadable or emailable machine-readable format
- **Content:** Categories of personal information, collection source, business purpose, categories of third parties
- **Verification:** Verified consumer request required (government ID or declaration under penalty of perjury)

**Request Submission:** privacy@ipoready.com with subject line "CCPA Access Request"

### 5.2 Right of Rectification (GDPR Article 16)

Data subjects may request correction of inaccurate personal data.

**Procedure:**
1. Submit correction request to **privacy@ipoready.com** specifying:
   - Data to be corrected
   - Reason for correction
   - Supporting documentation (if available)

2. IPOReady shall:
   - Verify the inaccuracy within 10 business days
   - Correct personal data within 5 business days of verification
   - Notify data subject of corrections made
   - Inform recipients of corrections (if logged)

**Limitations:**
- Customers may self-correct account information via dashboard
- Historical data for regulatory compliance may be appended (not overwritten)
- Audit trail of corrections maintained

### 5.3 Right of Erasure (GDPR Article 17 | CCPA §1798.105)

Data subjects may request deletion of personal data, subject to legal and contractual obligations.

#### 5.3.1 Grounds for Erasure

Erasure is permitted when:

- Data is no longer necessary for collection purposes
- Consent is withdrawn
- Processing is unlawful
- Legal obligations require erasure
- Data subject is a child and data was collected unlawfully

#### 5.3.2 Erasure Restrictions

Erasure **shall not occur** when:

- Data is necessary to perform contract with client
- Data is subject to legal holds or regulatory obligations
- Data is necessary for legal claims or defense
- Data is 3+ years old (archived for compliance purposes, with restricted access)
- Data relates to completed financial transactions (kept per tax law)

#### 5.3.3 Erasure Process

1. **Request Submission:** Email to **privacy@ipoready.com** with:
   - Account identifier
   - Categories of data to delete
   - Reason for erasure request

2. **IPOReady Review:**
   - Determine applicable legal restrictions (5 business days)
   - Identify data subject to deletion vs. retention
   - Notify data subject of decision and any restrictions

3. **Execution:**
   - Delete non-restricted data within 30 calendar days
   - Secure deletion (cryptographic erasure of encryption keys)
   - Retain only data required by law (encrypted, access-restricted)

### 5.4 Right to Restriction (GDPR Article 18)

Data subjects may request suspension of data processing under certain conditions.

**Grounds:**
- Data subject contests the accuracy of personal data
- Processing is unlawful but data subject requests restriction instead of erasure
- Data is no longer necessary but needed for data subject to establish/exercise/defend legal claims
- Data subject objects to processing (pending determination of legitimate interests)

**Restrictions Implemented:**
- Data processing limited to storage only
- No sharing with third parties (except upon legal obligation)
- Data subject notified before lifting restrictions
- Duration: up to 12 months pending resolution

### 5.5 Right to Data Portability (GDPR Article 20 | CPRA §1798.100(d))

Data subjects may receive personal data in structured, commonly-used, machine-readable format for transmission to another service.

**Eligible Data:**
- Account information
- Profile data
- Activity logs
- Customer-provided content

**Excluded Data:**
- Data derived from algorithmic decision-making
- Aggregated/anonymized data
- Data subject to legal restrictions

**Format Options:**
- CSV (tabular data)
- JSON (hierarchical data)
- XML (complex data structures)
- Excel (formatted data)

**Process:**
1. Request submission to **privacy@ipoready.com**
2. Verification within 5 business days
3. Data export within 15 calendar days
4. Download available for 30 days

### 5.6 Right to Object (GDPR Article 21)

Data subjects may object to processing for:
- Direct marketing (automated decision-making, profiling)
- Processing based on legitimate interests

**Marketing Objection:**
- One-click unsubscribe link in all promotional emails
- Processing ceases within 10 business days
- No additional contact for marketing purposes

**Legitimate Interest Objection:**
- Submit objection to **privacy@ipoready.com**
- IPOReady ceases processing within 30 days unless:
  - Compelling legitimate interests override
  - Legal claims require processing

### 5.7 Automated Decision-Making & Profiling (GDPR Article 22)

IPOReady uses automated processing for:
- **IPO Readiness Scoring:** Machine learning model predicting IPO timeline probability
- **Regulatory Risk Assessment:** Algorithmic detection of compliance gaps
- **Document Categorization:** Automated routing and tagging of filings

#### 5.7.1 Data Subject Rights

Data subjects have the right to:
- **Meaningful Explanation:** How automated decisions were made
- **Human Review:** Request manual review of automated decisions affecting them
- **Challenge:** Present arguments against automated decision

#### 5.7.2 Safeguards

- **Transparency:** Scoring methodology published in Help Center
- **Human Override:** Support team can override scores upon request
- **Explainability:** AI models use interpretable features (not black-box neural networks alone)
- **Regular Audit:** Quarterly bias audits on scoring models
- **Consent:** Explicit opt-in for advanced analytics (non-essential)

**Human Review Process:**
1. Data subject submits request to **privacy@ipoready.com** specifying:
   - Decision being appealed
   - Reasons for objection
2. IPOReady assigns human reviewer within 5 business days
3. Manual review conducted using full context
4. Decision communicated within 20 business days with explanation

### 5.8 Right Not to be Subject to Automated Processing (GDPR Article 22(4))

Data subjects may opt out of automated decision-making for:
- **Non-essential analytics:** Engagement tracking, feature recommendations, predictive scoring (optional)
- **Profiling:** User segmentation for marketing or upselling

**Excluded from Opt-Out:**
- Automated processing necessary for contract performance (authentication, authorization)
- Automated processing based on explicit legal basis (e.g., fraud detection)

**Opting Out:**
- Via Account Settings → Privacy & Data
- Via email to **privacy@ipoready.com**
- Processing ceases within 5 business days
- No impact on core service functionality

### 5.9 Data Subject Rights Request Process

#### 5.9.1 Submission Methods

All requests may be submitted via:

1. **Email:** privacy@ipoready.com
   - Subject line: "[DATA SUBJECT RIGHT] [Request Type]"
   - Include: Full name, email, account ID (if applicable), detailed request
   
2. **Online Portal:** https://ipoready.com/data-subject-rights (if available)
   - Requires email verification
   - Form submission with guided templates

3. **Mail (USA):**
   ```
   IPOReady Inc.
   Attention: Data Protection Officer
   [Address]
   ```

4. **Mail (Canada/EU):**
   ```
   IPOReady SAS
   Attention: Data Protection Officer
   [Address]
   ```

#### 5.9.2 Verification & Authentication

- **For account holders:** Account email verification sufficient
- **For third parties:** Photo ID copy (redacted) + signed declaration under penalty of perjury
- **For authorized representatives:** Power of attorney or legal guardian documentation

#### 5.9.3 Response Timeline Commitment

| Request Type | Standard Timeline | Extended Timeline | Max Extension |
|-------------|------------------|-------------------|----------------|
| Access | 30 days | 60 days | 90 days total |
| Rectification | 10 days | N/A | 15 days max |
| Erasure | 30 days | 60 days | 90 days total |
| Restriction | 5 days | 30 days | 30 days max |
| Portability | 15 days | 45 days | 60 days total |
| Objection | 10 days (marketing) | 30 days (other) | 30 days max |

#### 5.9.4 Response Format

- **Confirmation:** Immediate acknowledgment of receipt
- **Status Updates:** If response requires >15 days, weekly updates provided
- **Final Response:** Timeline adherence, detailed explanation, copies of data or decision rationale
- **Appeal:** Instructions for appealing decision, supervisor contact information

### 5.10 Fees & Costs

- **No fees** for first data subject rights request per year
- **Subsequent requests:** Reasonable cost-based fee (not to exceed €10-50 per request)
- **Frivolous/repetitive requests:** May be declined
- Fees waived if data subject demonstrates financial hardship

---

## 6. DATA RETENTION & DELETION

### 6.1 Retention Schedule

IPOReady retains personal data according to the following schedule:

| Data Category | Retention Period | Basis | Notes |
|---------------|------------------|-------|-------|
| **Account/Identity** | Duration of service + 2 years | Billing, legal claims | Extended 2 years post-termination |
| **Billing/Payment** | Duration + 7 years | Tax law (US), GAAP | Federal tax audit period |
| **Access Logs** | 12 months | Security/audit | Deleted after 12 months |
| **Error Logs** | 90 days | Debugging, GDPR minimization | Older logs archived encrypted |
| **Customer Support** | 3 years | Legal claims, service improvement | After 3 years, anonymized |
| **Email Communications** | 3 years | Legal claims, compliance | After 3 years, subject to erasure requests |
| **Device/Cookie Data** | 13 months | GDPR consent period | Max 13-month cookie retention |
| **Anonymized Analytics** | Indefinite | Aggregated trends | Non-identifiable, no retention limits |
| **Documents (Client-Uploaded)** | Duration of service | Service delivery | Deleted upon account termination or erasure request |
| **Backup Copies** | 6 months (cold storage) | Disaster recovery, GDPR Article 32 | Geo-replicated, encrypted |
| **Audit Trails** | 5 years | Regulatory compliance, SOC 2 | Required for financial audit |
| **Compliance Records** | 7 years (post-termination) | Securities law, FINRA rules | For companies subject to securities regulations |

### 6.2 Deletion Process

#### 6.2.1 Automated Deletion

- **Cookie/session data:** Automatic expiration per browser settings
- **Error logs:** 90-day automatic purge
- **Temporary files:** 30-day automatic cleanup

#### 6.2.2 Manual Deletion

- **Access logs:** 12-month manual archival and deletion
- **Support records:** 3-year manual anonymization and deletion
- **Backup purging:** 6-month cold storage manual deletion from all replicas

#### 6.2.3 Secure Deletion Methods

All deletions performed using:

- **Cryptographic Erasure:** Encryption keys destroyed (rendering data unrecoverable)
- **Hardware Destruction:** For decommissioned storage devices (certified destruction)
- **Overwrite:** Multiple passes (DOD 5220.22-M standard) if cryptographic erasure unavailable
- **Certificate of Deletion:** Provided upon request for critical data

### 6.3 Post-Termination Data Handling

Upon service termination:

1. **Data Extraction Period:** Client has 30 days to export personal data
2. **Automated Deletion:** Non-archived data deleted after 30 days
3. **Archival & Retention:** Data subject to legal holds retained encrypted
4. **Notification:** Client notified of deletion schedule upon termination

---

## 7. SECURITY INCIDENT NOTIFICATION

### 7.1 Incident Definition

A personal data security incident is defined as a breach of security resulting in:

- Unauthorized or accidental access to personal data
- Loss or destruction of personal data
- Unauthorized modification of personal data
- Illegal processing of personal data

**Excludes:** Failed attempts, unauthorized access attempts without successful data breach

### 7.2 Notification Timeline

#### 7.2.1 Internal Notification to Client

**Timing:** Within 72 hours of discovery of breach (or as soon as reasonably practicable)

**Content:**
- Nature and scope of breach
- Categories of data affected
- Approximate number of individuals affected
- Likely consequences
- Measures taken to contain breach
- Contact point for further information

**Method:** Email to primary contact + compliance officer, followed by phone call for Tier 1 breaches

#### 7.2.2 Data Subject Notification (If Required)

**Timing:** Without undue delay and where feasible not later than 30 calendar days after becoming aware

**Applicable in:** Breaches involving special categories of data or presenting high risk to individual rights

**Content:**
- Name and contact of Data Protection Officer
- Description of breach
- Likely consequences
- Measures taken to address breach
- Measures individuals should take
- Where personal data has been disclosed to third parties

**Method:** Email + SMS + postal mail (if email unavailable)

#### 7.2.3 Authority Notification (If Required)

**Timing:** Without undue delay and not later than 72 hours after becoming aware (GDPR)

**To:** Supervisory Authority (e.g., CNIL in France, ICO in UK, California Attorney General for CCPA)

**Applicable When:**
- Breach results in risk to rights/freedoms (GDPR)
- Breach affects California residents > 500 individuals (CCPA)
- Breach affects other jurisdictions per their thresholds

### 7.3 Incident Response Procedures

#### 7.3.1 Incident Detection & Containment

1. **Detection:** Automated alerts from:
   - Intrusion detection systems
   - Log aggregation (Sentry, CloudWatch)
   - Unusual data access patterns
   - Subprocessor breach notifications
   - Security tool alerts

2. **Initial Assessment (within 2 hours):**
   - Isolate affected systems
   - Preserve evidence (logs, snapshots)
   - Assemble incident response team
   - Determine severity (Tier 1-3)

3. **Containment (within 4-24 hours):**
   - Block unauthorized access
   - Revoke compromised credentials
   - Patch vulnerabilities
   - Segment affected networks
   - Secure evidence for forensic analysis

#### 7.3.2 Incident Severity Classification

| Severity | Data Type | Affected Individuals | Timeline | Actions |
|----------|-----------|---------------------|----------|---------|
| **Tier 1** | Special categories, financial, health | >1,000 | 72 hours | All notifications |
| **Tier 2** | Identifiable personal data, auth data | 100-1,000 | 72 hours | Selective notifications |
| **Tier 3** | Limited exposure, low risk | <100 | 30 days | Client notification only |

#### 7.3.3 Investigation & Forensics

1. **Forensic Analysis:**
   - Engage external forensic firm for Tier 1 breaches
   - Preserve all logs and evidence
   - Timeline reconstruction
   - Root cause analysis

2. **Investigation Report (within 20 business days):**
   - What happened (timeline)
   - Who accessed data (if determinable)
   - What data was affected
   - Why incident occurred (root cause)
   - Recommended remediation

3. **Remediation & Prevention:**
   - Security patches deployed
   - Access controls strengthened
   - Monitoring enhanced
   - Policy updates implemented

### 7.4 Subprocessor Breach Notification

#### 7.4.1 Subprocessor Obligations

All subprocessors are contractually required to notify IPOReady within 24 hours of discovering breaches affecting personal data.

#### 7.4.2 Escalation to Client

Upon subprocessor notification:

1. **Assessment:** IPOReady immediately assesses impact to Client data
2. **Client Notification:** Within 48 hours per Section 7.2.1
3. **Coordination:** IPOReady manages communication with subprocessor and coordinates response

### 7.5 Breach Management Contacts

**Primary Contact (IPOReady):**
- Email: **privacy@ipoready.com**
- Phone: [to be provided]
- Name: [Chief Privacy Officer / Data Protection Officer]

**Escalation Contact:**
- Email: **incidents@ipoready.com**
- Phone: [to be provided]
- Name: [Chief Information Security Officer]

**24/7 Incident Hotline:**
- Phone: [to be provided]
- Available for Tier 1 breach verification and emergency coordination

### 7.6 Breach Notification Requirements by Jurisdiction

#### 7.6.1 GDPR (EU/EEA)

- **Timeline:** 72 hours to authority (Article 33)
- **Data Subject Notice:** Required unless low risk (Article 34)
- **Authority to Notify:** National Data Protection Authority
- **Exceptions:** Encrypted data may not require notification (if key not compromised)

#### 7.6.2 CCPA (California)

- **Timeline:** "Without unreasonable delay" (General: 30-45 days is standard)
- **Required Notice:** California residents + California Attorney General (if >500 individuals)
- **Media Notice:** Required if >500 individuals in any single jurisdiction (statewide notification)
- **Content:** Name of agency issuing notice, description of breach, toll-free number for credit monitoring

#### 7.6.3 CPRA (California Privacy Rights Act)

- **Timeline:** Without undue delay; "expedient time and manner" (effective Jan 2023)
- **Threshold:** >500 CA residents = Attorney General notification
- **Special Categories:** Encrypted/redacted data may not trigger notification
- **Credit Monitoring:** Offer 12-month complimentary credit monitoring

#### 7.6.4 Other Jurisdictions

- **Canada (PIPEDA):** Notify Privacy Commissioner + individuals if real risk of harm (schedule TBD)
- **UK (UK-GDPR):** Notify ICO within 72 hours + data subjects without undue delay
- **Australia (Privacy Act):** Notify Information Commissioner + individuals without undue delay (if serious harm likely)

### 7.7 Post-Breach Activities

#### 7.7.1 Credit Monitoring (if applicable)

- For breaches involving payment card data or social security numbers
- 12-month enrollment at no cost to affected individuals
- Provider: [Equifax/Experian/TransUnion TBD]
- Enrollment codes sent via postal mail

#### 7.7.2 Lessons Learned Review

- 30-day internal review after incident
- Root cause analysis presentation to leadership
- Process improvements documented
- Client communication plan review

#### 7.7.3 Client Breach Attestation

- IPOReady certifies completion of investigation
- Copies of breach report provided to Client
- Insurance claim filing coordination
- Public statement coordination (if breach becomes public)

---

## 8. AUDIT RIGHTS & COMPLIANCE VERIFICATION

### 8.1 Audit Rights

Clients and their authorized representatives may audit IPOReady's compliance with this DPA upon reasonable notice.

#### 8.1.1 Audit Scope

Audits may cover:

- Data processing activities and purposes
- Security controls and certifications
- Subprocessor management and oversight
- Data subject rights fulfillment
- Incident response and remediation
- Compliance with international data transfer mechanisms
- Personnel access and confidentiality agreements
- Retention and deletion procedures

#### 8.1.2 Audit Frequency & Timing

| Audit Type | Frequency | Notice | Duration |
|-----------|-----------|--------|----------|
| **Self-Assessment Audit** | Annual | 30 days | 1-2 business days |
| **Third-Party Audit (SOC 2)** | Annual | N/A | 3-5 days |
| **GDPR Supervisory Authority Audit** | As required | As required | As required |
| **CCPA Regulatory Audit** | As required | As required | As required |

#### 8.1.3 Audit Procedures

**Pre-Audit:**
1. Client submits audit request to **compliance@ipoready.com** with:
   - Audit scope and objectives
   - Proposed audit dates
   - Required documentation
   - Auditor credentials

2. IPOReady reviews request and confirms logistics:
   - Availability and scheduling
   - Confidentiality agreement for auditors
   - On-site access arrangements

**During Audit:**
- Access to documentation and system configurations
- Interviews with relevant personnel
- Log review and forensic data analysis
- Security control testing
- Subprocessor documentation review
- Observation of operational procedures

**Post-Audit:**
1. IPOReady provides draft audit response within 10 business days
2. Client/auditor provides findings draft
3. IPOReady has 15 business days to respond to findings
4. Final audit report issued with remediation timeline

#### 8.1.4 Limitations on Audit Rights

- **Confidentiality:** Auditors bound by written confidentiality agreements
- **Scope Limitation:** Audits limited to scope of this DPA; trade secrets and other confidential information redacted
- **No Disruption:** Audit shall not materially disrupt service operations
- **Cost:** Client bears audit costs; IPOReady provides reasonable personnel support at no cost
- **Frequency:** Maximum one self-assessment audit per calendar year (unless incident investigation)

### 8.2 Compliance Certifications & Standards

IPOReady maintains the following compliance certifications:

#### 8.2.1 ISO & Security Standards

| Certification | Scope | Status | Next Audit |
|--------------|-------|--------|-----------|
| **ISO 27001** | Information Security Management | Seeking | Q4 2026 |
| **SOC 2 Type II** | Controls over service delivery and security | Completed | Annual |
| **GDPR Compliance** | Data protection practices | Self-assessed | Ongoing |

#### 8.2.2 Industry-Specific Certifications

- **PCI DSS 3.2.1** (Stripe, not IPOReady directly): Payment processing via certified processors
- **HIPAA BAA:** Available upon request (not currently in scope for core service)

#### 8.2.3 Certification Evidence

Current certifications available upon reasonable request:
- SOC 2 Type II report (redacted for generic details)
- ISO 27001 certificate (once obtained)
- Privacy impact assessments
- Penetration testing reports (executive summary)

### 8.3 Security Incident Disclosures

Clients may request disclosure of:

- Types of incidents experienced (aggregated, non-identifying)
- Incident count and categorization
- Timeframe of incidents (last 12, 24, 36 months)
- Remediation measures taken
- Root cause categories

**Restrictions:** Identifiable information about other clients withheld; incident reports redacted

### 8.4 Data Protection Impact Assessments (DPIAs)

#### 8.4.1 When DPIA Required

Clients should conduct DPIAs when:

- Processing sensitive or special categories of data
- Large-scale processing (100,000+ individuals)
- Novel processing methods (AI/profiling)
- Cross-border data transfers

#### 8.4.2 IPOReady Support

- Provide data flow documentation and technical specifications
- Identify security controls and safeguards
- Assess risk levels and likelihood of harm
- Recommend additional mitigation measures
- Document risk assessment in writing

#### 8.4.3 DPIA Templates

IPOReady provides DPIA templates for:
- Basic personal data processing
- Document management workflows
- User analytics and profiling
- Cross-border transfers

---

## 9. SPECIAL CATEGORIES OF DATA (SENSITIVE PERSONAL DATA)

### 9.1 Special Categories Definition (GDPR Article 9)

IPOReady may process special categories of data when submitted by Clients in documents, including:

- **Health Data:** Medical histories, health conditions, disability information
- **Genetic Data:** DNA information, genetic testing results
- **Racial/Ethnic Origin:** Diversity monitoring data
- **Political Opinions:** Political affiliations, contributions
- **Religious Beliefs:** Religious affiliation, activities
- **Trade Union Membership:** Union participation, activities
- **Sex Life/Sexual Orientation:** Personal relationship data
- **Criminal Records:** Convictions, legal proceedings

### 9.2 Lawful Basis for Processing Special Categories

Processing of special categories permitted only when:

1. **Explicit Consent:** Data subject has given explicit consent
2. **Employment Law:** Processing necessary for employment/social security obligations
3. **Vital Interests:** Processing necessary to protect vital interests
4. **Legitimate Activities:** Processing by certain organizations (unions, religious organizations)
5. **Public Domain:** Data already manifestly made public by data subject
6. **Legal Claims:** Processing necessary for legal claims/defense
7. **Public Interest:** Processing for public health or research purposes
8. **Preventive/Occupational Health:** Occupational health & safety

### 9.3 Restrictions on Special Category Data

IPOReady shall:

- **Not sell or share** special categories of data without explicit consent
- **Limit disclosure** to authorized personnel only (legal, compliance, support)
- **Encrypt all special categories** using AES-256
- **Audit access** to special category data monthly
- **Restrict automated decision-making** based solely on special categories
- **Provide additional privacy notices** before collection

### 9.4 Data Subject Rights for Special Categories

Enhanced protections apply:

- Right of access: Standard procedures apply (Section 5.1)
- Right to erasure: Granted unless exceptions apply (Section 5.3)
- Right to object: Automatic respect for objections (Section 5.6)
- Automated decision-making restrictions: Additional safeguards (Section 5.7)

---

## 10. CROSS-BORDER DATA TRANSFERS & THIRD-PARTY DISCLOSURE

### 10.1 Data Sharing with Subprocessors

Refer to Section 3 (Subprocessors) for detailed list of subprocessors with whom personal data is shared, including:

- Countries of processing
- Processing purposes
- Data categories transferred
- Contractual safeguards (SCCs, DPAs)

### 10.2 Legally Compelled Disclosures

#### 10.2.1 Government Requests

If IPOReady receives a legally binding request (court order, subpoena, warrant, statutory demand) for personal data:

1. **Notification:** IPOReady shall notify Client of the request within 72 hours (unless legally prohibited)
2. **Challenge:** IPOReady shall challenge overbroad or unlawful requests
3. **Minimal Disclosure:** Only provide data specifically identified in request
4. **Request Details:** Notify Client of:
   - Requesting authority
   - Data requested
   - Timeline for response
   - Exemptions asserted (if any)

#### 10.2.2 Transparency Reports

IPOReady publishes annual transparency reports disclosing:

- Number and type of government requests received
- Number of requests with data disclosed
- Average response time
- Jurisdictions making requests
- Categories of data requested

**Publication:** [TBD - Annual transparency report link]

#### 10.2.3 GDPR/CCPA Restrictions on Government Access

- **GDPR:** IPOReady shall refuse requests violating GDPR unless GDPR-compliant legal basis exists
- **CCPA:** For California residents, applies restrictions to sale of personal information to governments
- **Mutual Legal Assistance:** International requests must comply with applicable treaties

### 10.3 Prohibited Disclosures

IPOReady shall **not** disclose personal data to:

- Marketing/advertising networks (without explicit consent)
- Data brokers or data resellers
- Competitors of Client
- Parties for purposes outside the scope of this DPA
- Parties without equivalent data protection standards (unless SCCs/adequacy decision applies)

---

## 11. CONFIDENTIALITY & OBLIGATIONS SUMMARY

### 11.1 IPOReady Obligations (Data Processor)

IPOReady shall:

1. **Process data only as instructed** (Section 2.1)
2. **Maintain confidentiality** of all personnel with data access (Section 2.2)
3. **Implement comprehensive security** (Section 2.3)
4. **Manage subprocessors responsibly** (Section 3)
5. **Implement secure data transfers** (Section 4)
6. **Facilitate data subject rights** (Section 5)
7. **Retain/delete data appropriately** (Section 6)
8. **Notify of breaches promptly** (Section 7)
9. **Allow audits and verification** (Section 8)
10. **Handle special categories safely** (Section 9)
11. **Refuse unlawful requests** (Section 10.2)
12. **Provide this DPA to subprocessors** (Section 3)
13. **Document processing activities** (Section 11.2)

### 11.2 Documentation & Records

IPOReady maintains:

- **Records of Processing Activities** (GDPR Article 30, CCPA requirements)
- **Data Processing Agreements with all subprocessors**
- **Security incident logs** (12+ months)
- **Access logs** (12 months minimum)
- **Data subject rights request logs** (3 years)
- **Consent records** (where applicable)
- **Risk assessments** (data protection impact assessments)

**Access:** Available to Client and supervisory authorities upon reasonable request

### 11.3 Client Obligations

Client shall:

- **Ensure lawful basis for processing** (GDPR Article 6, CCPA eligibility)
- **Obtain data subject consent** where required
- **Provide privacy notices** to data subjects disclosing processing
- **Notify IPOReady of legal changes** affecting data processing
- **Cooperate in breach response** and incident investigations
- **Comply with audit procedures** (Section 8)
- **Use data only as specified** in this DPA
- **Ensure compliance** with applicable data protection laws

---

## 12. TERM, TERMINATION & DATA HANDLING

### 12.1 Term of DPA

This DPA becomes effective upon the Effective Date and continues for the duration of the Master Service Agreement.

### 12.2 Termination Effects

Upon termination or expiration of the MSA:

#### 12.2.1 Data Handling Options (within 30 days)

Client may elect one of the following:

**Option A: Data Export & Deletion**
- IPOReady exports all personal data in machine-readable format
- Client downloads data within 30-day window
- After 30 days, all personal data securely deleted
- Encrypted backups retained for 90 days only
- No residual copies retained except as required by law

**Option B: Continued Processing (Limited)**
- Personal data retained encrypted for up to 12 months
- Processing limited to storage only (no active use)
- No new data processing or analysis
- Monthly fees apply (TBD)
- Ongoing backup and security maintained
- Client terminates at any time with 10 days' notice

**Option C: Legacy Data Retention (Compliance Only)**
- Data retained for compliance/legal hold purposes only
- Encrypted, access restricted, no analytics
- Minimum 3 years; maximum 7 years
- Processing limited to legal claims/regulatory obligations
- No active use, analytics, or third-party disclosure

#### 12.2.2 Certification of Deletion

Upon completion of deletion per Option A:

- IPOReady provides written certification of secure deletion
- Includes deletion methodology and timeline
- Signed by Chief Information Security Officer or Data Protection Officer
- Certificate retained by both parties (3-year minimum)

### 12.3 Survival Obligations

The following obligations survive termination:

- Confidentiality (indefinitely)
- Data subject rights (until retention period expires)
- Breach notification (within 72 hours of discovery)
- Audit rights (1 year post-termination)
- Indemnification (applicable jurisdictions)

---

## 13. LIABILITY & INDEMNIFICATION

### 13.1 Processor Liability

IPOReady's liability under this DPA shall be limited to:

- **Direct damages:** Actual, demonstrable harm resulting from breach of DPA obligations
- **Capped amount:** Liability capped at fees paid in 12 months preceding breach
- **Exclusions:** Consequential, indirect, punitive damages excluded

### 13.2 GDPR Article 82 Liability

Under GDPR Article 82:

- **Joint Liability:** Data Controller and Processor jointly liable for damages
- **Processor Exemption:** Processor exempt from liability if proves non-responsibility
- **Unlimited Liability:** GDPR does not limit damages for death, bodily injury, or fundamental rights violations

### 13.3 Indemnification

Client shall indemnify IPOReady from:

- Claims arising from Client's violation of data protection laws
- Claims arising from Client's instructions to IPOReady
- Claims from data subjects for unlawful processing initiated by Client
- Claims arising from Client's failure to obtain necessary consents

---

## 14. DISPUTE RESOLUTION & GOVERNING LAW

### 14.1 Governing Law

This DPA shall be governed by and construed in accordance with:

- **For EU Customers:** Laws of the jurisdiction of the EU data protection authority overseeing processing (e.g., CNIL for France)
- **For UK Customers:** Laws of England and Wales, subject to UK-GDPR
- **For Canadian Customers:** Laws of the Province of Ontario (contract interpretation) and applicable PIPEDA/privacy laws (substantive)
- **For US Customers:** Laws of the State of Delaware (contract interpretation) and applicable state privacy laws (substantive)

### 14.2 Dispute Resolution Procedure

1. **Negotiation (30 days):** Parties attempt resolution in good faith
2. **Escalation (30 days):** Chief Privacy Officer escalates to executive leadership
3. **Mediation (60 days):** Parties submit to mediation before litigation/arbitration
4. **Arbitration:** If unresolved, disputes submitted to:
   - **EU/International:** ICC Arbitration (London seat)
   - **North America:** JAMS Arbitration (New York seat)
   - **Canada:** CCDC Mediation/Arbitration

### 14.3 Supervisory Authority Cooperation

Nothing in this DPA limits either party's right to file a complaint with applicable supervisory authorities:

- **EU:** National Data Protection Authority (e.g., CNIL, ICO)
- **California:** California Attorney General
- **Canada:** Office of the Privacy Commissioner of Canada

---

## 15. AMENDMENTS & UPDATES

### 15.1 Updates to DPA

IPOReady may update this DPA to:

- Reflect changes in applicable law
- Enhance security and compliance measures
- Respond to supervisory authority guidance
- Implement new subprocessors (per Section 3.2)

### 15.2 Change Notification

IPOReady shall provide:

- **30 calendar days' advance notice** of material changes
- **Written notification** to Client's primary contact + legal contact
- **Summary of changes** with effective date
- **Right to object** on reasonable grounds (see Section 3.2.2)

### 15.3 Non-Material Changes

Minor clarifications, corrections, or policy improvements may be implemented with:

- **10 business days' notice**
- **Annual change summary** in next compliance report

---

## 16. CONTACT INFORMATION & ESCALATION

### 16.1 Data Protection Officer

**Name:** [To be appointed]
**Email:** dpo@ipoready.com
**Phone:** [To be provided]
**Address:** [Corporate office address]

### 16.2 Privacy & Compliance Lead

**Email:** privacy@ipoready.com
**Phone:** [To be provided]
**Response Time:** 2 business days

### 16.3 Emergency/Incident Contact

**Email:** incidents@ipoready.com
**Phone:** [24/7 emergency hotline - to be provided]
**Purpose:** Critical security incidents, breach notification escalation

### 16.4 Data Subject Rights Requests

**Submission:** privacy@ipoready.com with subject line "[DATA SUBJECT RIGHT] [Request Type]"

### 16.5 Complaint & Appeal Process

**First Level:** privacy@ipoready.com
**Escalation:** dpo@ipoready.com
**Timeline:** Acknowledgment within 2 business days, resolution attempt within 10 business days

---

## 17. REGULATORY COMPLIANCE CHECKLIST

### GDPR Compliance

- ✓ Written Data Processing Agreement (this DPA)
- ✓ Processor instructions documented
- ✓ Sub-processor management (Article 28(2)-(4))
- ✓ Data subject rights support (Articles 12-22)
- ✓ Security measures (Article 32)
- ✓ International transfer mechanisms (SCCs) (Chapter V)
- ✓ Breach notification procedures (Article 33)
- ✓ Confidentiality obligations (Article 28(3))
- ✓ Audit rights (Article 28(3)(h))

### CCPA Compliance

- ✓ Service Provider Definition (Cal. Civ. Code §1798.140(ag))
- ✓ Restricted Use Obligation (§1798.140(w), §1798.100(d))
- ✓ Data Consumer Rights Support
- ✓ Security Measures (§1798.150)
- ✓ Breach Notification (§1798.82)
- ✓ Opt-Out Support (§1798.120)
- ✓ Non-Reidentification (§1798.100(d)(2))

### CPRA Compliance (California Privacy Rights Act)

- ✓ Contractor Definition (Cal. Civ. Code §1798.140(ag))
- ✓ Use Limitation
- ✓ Data Minimization
- ✓ Data Security (§1798.150)
- ✓ Consumer Rights Support (access, deletion, portability, opt-out)
- ✓ Automated Decision-Making Restrictions (§1798.110(d))
- ✓ Profiling Restrictions (§1798.110(e))
- ✓ Sensitive Personal Information Restrictions

### Canada (PIPEDA) Compliance

- ✓ Accountability (Schedule 1, Principle 1)
- ✓ Identification of Purpose (Principle 2)
- ✓ Consent (Principle 3)
- ✓ Limiting Use, Disclosure, Retention (Principle 4)
- ✓ Accuracy (Principle 5)
- ✓ Safeguards (Principle 6)
- ✓ Openness (Principle 7)
- ✓ Individual Access (Principle 8)
- ✓ Complaint Procedures (Principle 9)

---

## 18. ANNEXES & APPENDICES

### Annex A: Data Processing Activities

[To be completed with Client-specific details in SOW]

### Annex B: Security Measures

[Detailed technical controls - refer to Section 2.3]

### Annex C: Sub-processor List

[Current: Refer to Section 3.1; Updated: Communicated separately]

### Annex D: Standard Contractual Clauses

[Attached separately; also available via:
- Vercel: https://vercel.com/legal/data-processing-addendum
- Neon: https://neon.tech/legal
- Stripe: https://stripe.com/en-ca/privacy
- Twilio: https://www.twilio.com/legal]

### Annex E: Data Subject Rights Templates

Available upon request:
- Data Access Request Template
- Data Erasure Request Template
- Data Portability Request Template
- Objection to Processing Template
- Human Review Appeal Template

---

## 19. ACKNOWLEDGMENT & SIGNATURE

This Data Processing Addendum is incorporated into and forms an integral part of the Master Service Agreement dated __________.

**FOR IPOREADY INC. / IPOREADY SAS:**

```
_____________________________________
Name: [To be signed]
Title: [Chief Privacy Officer / CEO]
Date: _______________________________

_____________________________________
Name: [To be signed]
Title: [Data Protection Officer]
Date: _______________________________
```

**FOR CLIENT:**

```
_____________________________________
Name: _______________________________
Title: _______________________________
Company: ____________________________
Date: _______________________________
```

---

## APPENDIX: FREQUENTLY ASKED QUESTIONS

### Q1: Is this DPA GDPR-compliant?

**A:** Yes. This DPA incorporates the required elements of GDPR Articles 28, 32, 33 and includes:
- Written processing instructions
- Confidentiality obligations
- Standard Contractual Clauses for international transfers
- Data subject rights support
- Breach notification procedures
- Audit rights and security measures

### Q2: What about CCPA/CPRA compliance?

**A:** Yes. This DPA includes CCPA-specific provisions for:
- Service Provider restrictions on data use
- Consumer rights (access, deletion, portability, opt-out)
- Automatic opt-out from automated decision-making
- Sensitive personal information restrictions
- Breach notification for California residents

### Q3: Is my data encrypted?

**A:** Yes. All personal data is encrypted:
- **In Transit:** TLS 1.3
- **At Rest:** AES-256
- **Backups:** Encrypted copies in multiple regions
- **Sensitive Data:** Double-encrypted with key rotation quarterly

### Q4: Can you delete my data?

**A:** Yes. You may request deletion under:
- GDPR Article 17 (Right to Erasure)
- CCPA §1798.105 (Right to Delete)
- State privacy laws (CPRA, etc.)

Deletion limited by legal holds, compliance obligations, and 3-7 year archival periods for specific data categories.

### Q5: What if there's a security breach?

**A:** We notify you within 72 hours (GDPR) or without unreasonable delay (CCPA). Notification includes:
- Nature of breach
- Data affected
- Number of individuals
- Steps taken to remediate
- Your next steps

### Q6: How long do you keep my data?

**A:** Retention depends on data type (see Section 6.1). Typically:
- Account data: 2 years after termination
- Billing: 7 years (tax requirement)
- Access logs: 12 months
- Support records: 3 years

### Q7: Who is authorized to access my data?

**A:** Limited personnel with need-to-know:
- Engineering (debugging only)
- Support (customer service)
- Compliance (audit & incident response)
- Finance (billing only)

All personnel bound by confidentiality agreements.

### Q8: Can you sell my data?

**A:** No. We are a Data Processor, not a Data Seller. We process data only as instructed by the Client (Data Controller). We never:
- Sell personal data
- Share data with marketers
- Use data for our own purposes
- Combine data from different clients

---

**Version:** 1.0  
**Last Updated:** June 6, 2026  
**Next Review:** June 6, 2027

For questions or concerns, contact: **privacy@ipoready.com**
