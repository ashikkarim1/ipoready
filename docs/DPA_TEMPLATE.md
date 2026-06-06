# Data Processing Agreement (DPA) Template

**For Use With:** Service Providers and Processors  
**Effective Date:** June 6, 2026  
**Template Version:** 1.0

---

## 1. Data Processing Terms

This Data Processing Agreement ("DPA") supplements the Service Agreement dated [DATE] between IPOReady Inc. ("Company," "Controller") and [SERVICE PROVIDER NAME] ("Provider," "Processor").

### 1.1 Scope of Processing

**Subject Matter:** Processing of personal data in connection with [SERVICE DESCRIPTION]
- Example: "Cloud hosting and storage services for the IPOReady platform"

**Duration:** For the term of the Service Agreement, plus [X] days following termination

**Nature of Processing:** [Select all that apply]
- [ ] Collection
- [ ] Recording
- [ ] Organization
- [ ] Storage
- [ ] Alteration
- [ ] Retrieval
- [ ] Use
- [ ] Transmission
- [ ] Deletion
- [ ] Destruction

**Purpose:** [Specify uses]
- Example: "To provide cloud hosting, backup, disaster recovery, and database services"

### 1.2 Categories of Data

**Personal Data Types** (select all collected):
- [ ] Identifiers (name, email, phone, IP address, device ID)
- [ ] Commercial Information (billing address, transaction history, subscription tier)
- [ ] Internet Activity (pages visited, features used, search queries, time logs)
- [ ] Geolocation Data (approximate location from IP address)
- [ ] Professional Information (job title, company, experience level)
- [ ] Document Content (uploaded files and metadata)
- [ ] Unique Identifiers (user IDs, session tokens)
- [ ] Other: [Specify]

**Sensitive Data** (if applicable):
- [ ] Authentication data (hashed passwords, API keys)
- [ ] Financial account information (last 4 digits for Stripe)
- [ ] Inferred information (preferences, readiness profiles)

### 1.3 Categories of Data Subjects

- [ ] Employees of Company (system admins)
- [ ] End Users of Company (IPOReady subscribers)
- [ ] Employees of Company Users (people with account access)
- [ ] Third Parties (investors, advisors, referenced in documents)

### 1.4 Duration of Processing

**Start Date:** Upon execution of Service Agreement  
**End Date:** [Termination or 30 days after Service Agreement ends]  
**Data Deletion:** Within 30 days of termination (or as required by law)

---

## 2. Processor Obligations

### 2.1 Processing Instructions

The Provider shall:

1. **Process only per instructions** - No processing beyond what Company explicitly requests
2. **Implement appropriate safeguards** - Technical and organizational security measures
3. **Limit access** - Only employees with need-to-know access personal data
4. **Ensure confidentiality** - NDAs with all staff with data access
5. **Ensure deletion/return** - Securely delete data upon termination
6. **Cooperate with requests** - Respond to data subject rights requests
7. **Assist with compliance** - Support Company's regulatory compliance

### 2.2 Sub-Processors

**Current Authorized Sub-Processors:**

[Provider fills in]

Example:
- AWS (Infrastructure): Storage, compute, backups
- Cloudflare (Security): DDoS protection, WAF
- [Others as applicable]

**New Sub-Processors:**
1. Provider will notify Company of any new sub-processors at least 30 days in advance
2. Company may object to new sub-processor on privacy grounds
3. If objection upheld, Company may suspend service or terminate agreement
4. New sub-processor must execute equivalent DPA with Company

### 2.3 Security Measures

Provider certifies it has implemented and maintains:

**Technical Measures:**
- ✅ Encryption of data in transit (TLS 1.2+)
- ✅ Encryption of data at rest (AES-256 or equivalent)
- ✅ Access controls and authentication (role-based, MFA)
- ✅ Intrusion detection and prevention systems
- ✅ Regular security patching and updates
- ✅ Vulnerability scanning and penetration testing
- ✅ Malware and antivirus protection
- ✅ Backup systems and disaster recovery

**Organizational Measures:**
- ✅ Written security policy and procedures
- ✅ Staff training on data protection
- ✅ Non-disclosure agreements with all staff
- ✅ Background checks for administrative access
- ✅ Physical security (locked facilities, access controls)
- ✅ Incident response plan
- ✅ Data protection impact assessments (if required)

**Audit and Monitoring:**
- ✅ Annual security audits (third-party preferred)
- ✅ SOC 2 Type II certification (or equivalent)
- ✅ Compliance with ISO 27001 (or equivalent)
- ✅ Penetration testing (at least annual)

### 2.4 Data Subject Rights

Provider shall, without undue delay, assist Company in fulfilling:
- Right to access/know
- Right to rectification/correction
- Right to erasure/deletion
- Right to restrict processing
- Right to data portability
- Right to object
- Rights related to automated decision-making

**Process:**
1. Company receives request from data subject
2. Company contacts Provider with request
3. Provider fulfills request within 10 business days
4. Provider provides output to Company
5. Company provides to data subject with 30-day response

### 2.5 Data Breach Notification

**Upon discovering a breach, Provider shall:**

1. Notify Company **without undue delay** (within 24 hours recommended)
2. Provide breach details: What data, when, how many people
3. Describe remediation steps already taken
4. Assist Company investigation
5. Provide documentation for regulators
6. Cooperate with Company's notification process

**Company's Responsibility:**
- Company will notify data subjects and regulators as required

---

## 3. Compliance and International Transfers

### 3.1 GDPR Compliance

For EU/EEA data subjects, this DPA is governed by:
- Regulation (EU) 2016/679 (GDPR)
- Applicable national data protection laws
- Decisions of EDPB (European Data Protection Board)

### 3.2 Standard Contractual Clauses (SCCs)

**For US-based Processors:**

This DPA incorporates the EU Standard Contractual Clauses (Module Two: Controller-Processor) as adopted by the European Commission (Decision 2021/914/EU) for transfers of personal data from the EU/EEA to the United States.

**Module:** Two (Controller to Processor)

**Protective Measures:**
- Confidentiality and security obligations
- Assistance with data subject rights
- Deletion/return of data upon termination
- Limitation on sub-processing
- Assistance with regulatory requests
- Data impact assessments

### 3.3 Supplementary Measures

Both parties acknowledge that additional safeguards may be required based on:
- Data nature and sensitivity
- Processing purposes
- Legal/regulatory requirements
- Assessment of US laws and surveillance

**Additional Measures:**
1. Encryption of data in transit and at rest
2. Contractual commitment to dispute overreaching government demands
3. Transparency about government requests when legally permitted
4. Notification to Company of government requests
5. Annual compliance certification

---

## 4. Data Handling and Retention

### 4.1 Responsibility

**Company remains responsible for:**
- Determining lawfulness of data collection
- Specifying processing purposes and instructions
- Obtaining necessary consents
- Complying with data subject rights requests
- Complying with regulatory obligations

**Provider is responsible for:**
- Implementing security measures
- Assisting with data subject rights
- Securing authorization for sub-processors
- Immediately notifying of breaches
- Ensuring staff compliance with confidentiality

### 4.2 Deletion Upon Termination

**Within 30 days of Service Agreement termination:**

1. [ ] Provider deletes all personal data
2. [ ] Provider returns all personal data to Company
3. [ ] Provider certifies deletion/return in writing
4. [ ] Provider explains any legal holds on data

**Exception:** Provider may retain data if required by law (in which case Provider certifies legal obligation and ensures confidentiality)

### 4.3 Audit Rights

Company has the right to:

1. **Conduct audits** - Upon reasonable notice
2. **Request certifications** - SOC 2, ISO 27001, GDPR compliance
3. **Receive audit reports** - Third-party assessments (may be redacted for confidentiality)
4. **Inspect facilities** - With reasonable notice (security areas may be limited)
5. **Review subprocessor agreements** - To verify equivalent protections

---

## 5. Limitation of Liability

### 5.1 Liability Allocation

**Company remains liable for:**
- Lawfulness of data collection
- Accuracy and quality of personal data
- Compliance with collection/use restrictions

**Provider is liable for:**
- Breach of DPA obligations
- Unauthorized processing
- Security failures
- Breach notification delays

### 5.2 Limitation Clause

Neither party shall be liable for:
- Indirect, incidental, or consequential damages
- Loss of data, business, or profits
- Damages arising from data subject claims (unless due to Provider breach)

---

## 6. Termination and Consequences

### 6.1 Termination Rights

**Company may terminate if:**
- Provider materially breaches DPA and doesn't cure within 30 days
- Provider undergoes insolvency or dissolution
- Provider loses required certifications (SOC 2, etc.)
- Regulatory order prevents Company use
- Company elects to use alternative provider

**Notice Required:** 30 days (except for material breach, which is 30 days to cure + 30 days to terminate)

### 6.2 Post-Termination Obligations

Upon termination, Provider shall:

1. Within 3 days: Stop processing personal data
2. Within 7 days: Cease using data for own purposes
3. Within 30 days: Delete or return all personal data
4. Within 30 days: Certify deletion/return in writing
5. Upon request: Provide reasonable cooperation (may be chargeable)

---

## 7. Defined Terms

**"Personal Data":** Any information relating to an identified or identifiable natural person (name, identification number, online identifier, etc.)

**"Processing":** Any operation performed on personal data (collection, recording, organization, use, transmission, deletion, etc.)

**"Data Subject":** The individual to whom personal data relates

**"Data Breach":** Unauthorized access, disclosure, or loss of personal data

**"Standard Contractual Clauses":** EU-approved clauses for lawful international data transfers (Module Two)

---

## 8. Agreement on Performance

### 8.1 Service Level Agreements (SLAs)

Provider commits to:

| Metric | Target | Measurement |
|--------|--------|-------------|
| Service Availability | 99.5% uptime | Monthly |
| Response to Audit Requests | 10 business days | Per request |
| Breach Notification | 24 hours | Per incident |
| Data Deletion | 30 days | Post-termination |

### 8.2 Performance Monitoring

1. Company will monitor compliance monthly
2. Issues will be raised via support ticket
3. Critical issues escalated to privacy@ipoready.com
4. Quarterly compliance review calls
5. Annual security assessment

---

## 9. Governing Law and Dispute Resolution

### 9.1 Governing Law

This DPA is governed by:
- **For EU/EEA Data Subjects:** Laws of the EU and the state where Company is located
- **Interpretation:** GDPR and EDPB guidance take precedence
- **Dispute Resolution:** Escalation to Company and Provider leadership, then binding arbitration

### 9.2 Regulatory Cooperation

Both parties shall:
- Cooperate with Data Protection Authorities
- Provide information for investigations
- Not challenge legal process (unless legally permitted)
- Notify the other of any DPA inquiries

---

## 10. Execution and Amendment

### 10.1 Signatures

By signing below, both parties confirm:
1. They have authority to enter this DPA
2. They understand their obligations
3. They commit to GDPR/CCPA compliance
4. They accept the terms as written

**Company Representative:**

Name: ________________________  
Title: _________________________  
Email: _________________________  
Date: __________________________  

**Provider Representative:**

Name: ________________________  
Title: _________________________  
Email: _________________________  
Date: __________________________  

### 10.2 Amendment

This DPA may only be amended by:
1. Written agreement of both parties
2. Mutual email confirmation (documented in writing)
3. Automatic amendment for legal compliance (notify other party)

---

## 11. Implementation Checklist

### For Company (IPOReady)

- [ ] Identify all service providers processing personal data
- [ ] Create list of sub-processors
- [ ] Categorize data types and purposes
- [ ] Execute DPA with each provider
- [ ] Maintain copies in central location
- [ ] Review annually for adequacy
- [ ] Track sub-processor changes
- [ ] Conduct vendor security audits

### For Provider

- [ ] Confirm agreement to DPA terms
- [ ] Document all sub-processors
- [ ] Implement security measures
- [ ] Create incident response plan
- [ ] Prepare for audit requests
- [ ] Train staff on confidentiality
- [ ] Establish data deletion procedures
- [ ] Obtain SOC 2 / ISO 27001 (if applicable)

---

## 12. Appendices

### Appendix A: List of Sub-Processors

[Provider to complete]

```
Sub-Processor Name | Purpose | Location | DPA Status
[Name] | [Purpose] | [Country] | [Signed/Pending]
```

### Appendix B: Data Categories

[Company to specify]

```
Data Category | Examples | Sensitivity | Retention
[Category] | [Examples] | [High/Medium/Low] | [Duration]
```

### Appendix C: Technical and Organizational Measures

[Provider to certify]

```
Measure | Description | Certification
[Measure] | [Description] | [SOC2/ISO/Other]
```

---

## Quick Version (Minimal)

If Provider prefers a shorter DPA, use this minimum version:

---

### MINIMAL DPA

**Between:** IPOReady Inc. ("Company") and [Provider Name] ("Provider")

**Scope:** Provider processes personal data on Company's behalf.

**Provider Obligations:**
1. Process data only per Company instructions
2. Keep data confidential and secure
3. Do not process for own purposes
4. Assist with data subject rights requests
5. Notify Company of data breaches
6. Delete data upon termination

**EU Data Transfers:**
- Provider agrees to comply with GDPR Article 28
- Standard Contractual Clauses (Module Two) incorporated
- Provider certifies appropriate safeguards

**Sub-Processors:**
- Provider notifies Company of sub-processors 30 days in advance
- Company may object and terminate if objection upheld

**Liability:**
- Provider indemnifies Company for breach of this DPA
- Provider maintains cyber liability insurance (if required)

**Term:**
- Duration of Service Agreement plus 30 days
- Either party may terminate for material breach (30 days notice + cure period)

---

**Agreed and executed as of [DATE]:**

Company: IPOReady Inc.  
Authorized By: ____________________  

Provider: [Provider Name]  
Authorized By: ____________________  

---

## Version Control

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | June 6, 2026 | Initial template |

**Next Review:** June 6, 2027 (Annual)  
**Owner:** Privacy Team (privacy@ipoready.com)
