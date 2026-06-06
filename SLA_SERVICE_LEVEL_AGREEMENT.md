# SERVICE LEVEL AGREEMENT (SLA)

**IPOReady Inc.**

**Effective Date:** June 6, 2026

---

## 1. INTRODUCTION

This Service Level Agreement ("SLA") establishes the service level standards, commitments, and remedies for IPOReady's cloud-based IPO readiness workflow management platform ("Service"). This SLA applies to all customers ("Customer" or "Customers") who have executed a Services Agreement with IPOReady Inc. ("Provider" or "we").

## 2. SERVICE AVAILABILITY & UPTIME GUARANTEE

### 2.1 Monthly Uptime Commitment

Provider commits to maintaining the Service with a monthly uptime guarantee of **99.5%** during the Measurement Period (each calendar month).

**Maximum Permitted Downtime:** 3.6 hours per calendar month (43.2 hours per calendar year)

### 2.2 Uptime Definition

"Uptime" is calculated as the percentage of time during which the Service is available and operational to Customers, measured from Provider's primary monitoring infrastructure. The Service is considered "available" when:

- Authentication services are operational
- Core platform functionality is accessible
- Data persistence and retrieval operations complete successfully
- The platform responds to user requests without critical system errors

### 2.3 Measurement Period and Calculation

**Measurement Period:** Each calendar month (1st through last day of month, UTC-5 timezone)

**Uptime Percentage Calculation:**

```
Uptime % = ((Total Minutes in Month - Downtime Minutes) / Total Minutes in Month) × 100
```

Where downtime is measured in consecutive 5-minute intervals where the Service is unavailable to 5% or more of global users.

### 2.4 Availability Monitoring

Provider maintains redundant, geographically distributed monitoring infrastructure to verify Service availability. Customer may access real-time uptime status via the IPOReady Status Page at status.ipoready.com.

---

## 3. PERFORMANCE SERVICE LEVEL OBJECTIVES (SLOs)

### 3.1 Latency Commitments

Provider commits to the following performance metrics during normal operating conditions:

| Metric | Target | Condition |
|--------|--------|-----------|
| **P99 Latency** | < 250 milliseconds | 99th percentile response time |
| **P95 Latency** | < 200 milliseconds | 95th percentile response time |
| **P50 Latency** | < 100 milliseconds | 50th percentile response time |

### 3.2 Performance Definition

"Latency" is measured as the time elapsed from when a valid Customer API request is received by Provider's infrastructure until a complete response is transmitted back to the Client. Measurements exclude network transit time and Client-side processing.

### 3.3 Performance Measurement

- Performance is measured across all geographic regions where the Service operates
- Measurements are taken from Provider's edge infrastructure and application servers
- Provider publishes monthly performance reports with P50, P95, and P99 percentiles
- Customer may access performance dashboards within their account console

### 3.4 Performance Exclusions

The following conditions are excluded from performance SLO commitments:

- Requests originating from Client networks with latency > 100ms to nearest Provider edge location
- Bulk data import/export operations (measured separately with documented thresholds)
- Customer-initiated load testing without prior Provider approval
- External DDoS attacks or network congestion beyond Provider's control

---

## 4. DATA AVAILABILITY & DURABILITY GUARANTEE

### 4.1 Data Durability Commitment

Provider guarantees **99.9% data durability** for all Customer data stored within the Service, calculated monthly.

**Definition:** Data durability is the probability that data remains accessible and uncorrupted for any 30-day period.

### 4.2 Data Replication & Backup

Provider maintains the following data protection measures:

- **Geographic Redundancy:** Data replicated across minimum 3 distinct geographic regions
- **Real-time Replication:** Database replication with < 1 second RPO (Recovery Point Objective)
- **Daily Automated Backups:** Incremental backups performed every 6 hours; retained for 90 days
- **RTO Commitment:** Recovery Time Objective of 2 business hours maximum for full data restoration
- **Encryption:** AES-256 encryption at-rest; TLS 1.3 encryption in-transit

### 4.3 Data Recovery

In the event of data loss or corruption:

1. Provider will initiate recovery procedures within 1 business hour of notification
2. Customer will be provided with transaction logs for root cause analysis
3. Recovery from backup will be completed within 2 business hours
4. Provider will document all recovery activities in a detailed incident report

### 4.4 Customer Responsibilities

Customer is responsible for:

- Maintaining local backups of critical documents (Provider recommends weekly exports)
- Following Provider's cloud storage integration best practices
- Notifying Provider immediately upon discovery of suspected data corruption
- Completing Provider's mandatory security training for user account administrators

---

## 5. SUPPORT RESPONSE TIME COMMITMENTS

Provider commits to the following Support response times based on issue severity classification:

### 5.1 Severity Levels

| Severity | Definition | Examples |
|----------|-----------|----------|
| **CRITICAL** | Service unavailable; affects all users; data loss risk | Complete platform outage, authentication system failure, database corruption |
| **HIGH** | Major functionality impaired; affects multiple users; significant business impact | Specific feature broken for user segment, performance degradation > 50%, data inconsistency |
| **MEDIUM** | Moderate functionality impact; affects limited users; workaround available | Single user account issue, minor feature malfunction, configuration error |
| **LOW** | Minimal impact; cosmetic issues; no business impact | UI display issue, documentation error, feature request clarification |

### 5.2 Response Time SLAs by Severity

| Severity | Initial Response | Escalation | Target Resolution |
|----------|------------------|------------|-------------------|
| **CRITICAL** | 15 minutes | 30 minutes | 4 business hours |
| **HIGH** | 1 hour | 2 hours | 8 business hours |
| **MEDIUM** | 4 hours | 8 hours | 24 business hours |
| **LOW** | 24 hours | 48 hours | 5 business days |

**Notes:**
- Response time = time from ticket creation to first substantive Provider response
- Escalation time = time to senior engineer engagement
- During non-business hours (see Section 5.3), response times are best-effort

### 5.3 Support Hours

**Standard Support Hours:** Monday–Friday, 09:00–18:00 EST

- **Coverage:** 5-day business week support with guaranteed response times
- **Holidays:** US federal holidays excluded; Customer will be notified of holiday schedules

**Extended Support (Optional):**

- **24/7 Best-Effort Support:** Available for CRITICAL issues outside business hours
- **Premium 24/5 Support:** Available with Premium support tier (separate agreement)
- **After-Hours Escalation:** CRITICAL issues reported outside business hours will be addressed by on-call engineer within 45 minutes (best-effort)

### 5.4 Support Channels

Customer may report issues via:

- **Support Portal:** support.ipoready.com (preferred method)
- **Email:** support@ipoready.com
- **Escalation Email:** escalations@ipoready.com (CRITICAL issues only)

---

## 6. EXCLUSIONS FROM SLA

The following events and conditions are excluded from SLA commitments and will not result in Service Credits:

### 6.1 Scheduled Maintenance

- **Planned Maintenance Windows:** Monthly maintenance window scheduled for first Sunday of each month, 02:00–04:00 UTC (2-hour window)
- **Emergency Maintenance:** Security patches and critical infrastructure repairs performed with 4-hour advance notice when possible
- **Notification:** All scheduled maintenance announced minimum 72 hours in advance via status page and customer notifications
- **Frequency:** Provider limits scheduled maintenance to once monthly (except emergencies)

### 6.2 Customer-Related Issues

Downtime caused by the following are excluded:

- Customer misconfiguration of cloud storage integrations
- Customer data exceeding storage limits
- Customer's failure to apply required security updates to client applications
- Customer's deliberate or negligent misuse of the Service
- Customer's use of Service in violation of Provider's Acceptable Use Policy
- Customer's third-party service failures (Internet Service Provider, cloud storage provider outages)

### 6.3 External Events

The following external events exclude SLA liability:

- Internet service provider outages or network degradation beyond Provider's infrastructure
- Third-party cloud provider outages (Neon PostgreSQL, Google Cloud infrastructure)
- DDoS attacks or other malicious external interference
- Natural disasters, acts of God, or governmental actions
- Nuclear accident, war, or terrorism

### 6.4 Service Modifications

SLA commitments do not apply to:

- Beta, trial, or evaluation versions of the Service
- Service features marked as experimental or pre-release
- Services discontinued or modified with 30-day notice

---

## 7. SERVICE CREDIT REMEDIES

### 7.1 Service Credit Entitlement

If Provider fails to meet the Uptime Guarantee in any calendar month, Customer is entitled to Service Credits as the sole and exclusive remedy. Service Credits are non-transferable, non-refundable financial credits applied to future monthly invoices.

### 7.2 Service Credit Calculation

Monthly uptime achievement and corresponding credits:

| Uptime Percentage | Monthly Credit |
|-------------------|----------------|
| 99.0% – < 99.5% | 10% of monthly fees |
| 95.0% – < 99.0% | 25% of monthly fees |
| 90.0% – < 95.0% | 50% of monthly fees |
| < 90.0% | 100% of monthly fees |

**Calculation Example:**
- Monthly service cost: $5,000 USD
- Achieved uptime: 98.5% (1.08 hours downtime)
- Credit: 10% × $5,000 = $500 credit applied to next month's invoice

### 7.3 Performance SLA Credits

If performance SLOs are not met for 3+ consecutive days in a measurement period:

| Metric Missed | Duration | Credit |
|---------------|----------|--------|
| P99 > 250ms | 3–7 days | 5% of monthly fees |
| P99 > 250ms | 8–14 days | 15% of monthly fees |
| P99 > 250ms | 15+ days | 25% of monthly fees |

### 7.4 Claim Process

To receive Service Credits:

1. **Notification:** Customer must notify Provider in writing within 10 calendar days of the month in which the SLA was not met
2. **Documentation:** Include specific dates/times of outage, impact description, and relevant logs
3. **Verification:** Provider will verify claim and respond within 5 business days
4. **Credit Application:** Credits are applied automatically to next month's invoice within 15 business days of approval
5. **No Refund:** If Service is terminated, accumulated unused Service Credits are forfeited

### 7.5 Maximum Liability

Service Credits represent Customer's sole and exclusive remedy for SLA breach. Provider's total liability for any SLA breach shall not exceed the total fees paid by Customer in the 3 months preceding the breach (maximum $15,000 USD unless otherwise agreed in writing).

### 7.6 No Double Remedy

Customers may not claim Service Credits for the same downtime event under multiple SLA categories (uptime, performance, or data availability). The highest applicable credit will be issued.

---

## 8. ESCALATION & DISPUTE RESOLUTION

### 8.1 Escalation Process

For unresolved support issues or SLA disputes:

1. **Tier 1 (Support Team):** Address within 5 business days
2. **Tier 2 (Support Manager):** Escalate unresolved Tier 1 issues within 5 business days
3. **Tier 3 (VP Engineering):** Final escalation within 10 business days
4. **Executive Review:** Contact sales@ipoready.com for C-level escalation

### 8.2 Dispute Resolution

If Customer disputes an SLA determination:

1. Provide written dispute notice within 30 days of incident
2. Include original incident evidence and Provider's response
3. Provider will conduct independent review within 10 business days
4. Both parties may agree to independent third-party measurement verification (cost shared equally)

---

## 9. MONITORING, REPORTING & TRANSPARENCY

### 9.1 Status Page

Provider maintains a public status page at **status.ipoready.com** displaying:

- Real-time service status (operational, degraded, partial outage, major outage)
- Incident history (last 90 days)
- Performance metrics (uptime %, latency percentiles)
- Scheduled maintenance calendar
- Incident postmortem links (when applicable)

### 9.2 Monthly Performance Reports

Provider delivers monthly SLA performance reports including:

- Uptime percentage achievement
- Performance metrics (P50, P95, P99 latency)
- Data durability confirmation
- Incident summary (if any)
- Comparative monthly trends

**Delivery:** By the 5th business day following end of month via customer portal

### 9.3 Incident Postmortems

For any unplanned downtime > 30 minutes or SLA breach:

- Postmortem prepared within 5 business days
- Root cause analysis and remediation plan included
- Published to status page and shared with affected Customers
- Follow-up action items tracked publicly

---

## 10. SERVICE IMPROVEMENT COMMITMENTS

### 10.1 Quarterly Reviews

Provider commits to:

- Review SLA performance quarterly with Customer
- Analyze trends and identify improvement opportunities
- Discuss any needed SLA adjustments
- Share roadmap improvements impacting availability/performance

### 10.2 Continuous Improvement

Provider will:

- Invest in infrastructure redundancy and automation
- Conduct quarterly disaster recovery testing
- Perform annual security audits (SOC 2 Type II)
- Monitor industry best practices and adjust standards accordingly

---

## 11. SPECIAL PROVISIONS

### 11.1 Premium Support Tier (Optional)

Customers may upgrade to Premium Support for:

- 24/7 support availability (not best-effort)
- 15-minute response SLA for all severity levels
- Dedicated support engineer assignment
- Monthly business reviews with Provider leadership
- Advanced monitoring and alerting capabilities

**Premium Support Pricing:** Contact sales@ipoready.com for details

### 11.2 Service Level Adjustments

Provider reserves the right to adjust SLA terms with 60 days' written notice if:

- Substantial new infrastructure is added (SLA improvements)
- Industry standard benchmarks change significantly
- Customer's usage patterns materially exceed normal parameters

Customers not accepting adjusted terms may terminate without penalty within 30 days.

### 11.3 Early Access / Beta Features

Early access and beta features are excluded from SLA coverage. Provider will clearly label beta features and establish separate beta SLAs if applicable.

---

## 12. DEFINITIONS

| Term | Definition |
|------|-----------|
| **Downtime** | Consecutive 5-minute period when Service is unavailable to ≥5% of users globally |
| **Uptime %** | (Total Minutes in Month - Downtime Minutes) / Total Minutes in Month × 100 |
| **Latency** | Elapsed time from request receipt to complete response transmission |
| **Data Durability** | Probability data remains accessible and uncorrupted over 30-day period |
| **RTO** | Recovery Time Objective (max time to restore service) |
| **RPO** | Recovery Point Objective (max time window of acceptable data loss) |
| **Business Day** | Monday–Friday, 09:00–18:00 EST, excluding US federal holidays |
| **Service Credit** | Non-transferable financial credit applied to future monthly fees |

---

## 13. TERM & TERMINATION

### 13.1 SLA Term

This SLA is effective as of the date stated above and continues for the duration of Customer's Services Agreement, unless earlier terminated per Section 13.2.

### 13.2 Termination Rights

- **Provider Termination:** Provider may terminate this SLA with 90 days' written notice
- **Customer Termination:** If Provider materially breaches SLA terms and fails to cure within 30 days, Customer may terminate Services Agreement without penalty
- **Renewal:** This SLA automatically renews with annual Services Agreement renewals unless updated by written amendment

### 13.3 Survival

Sections 7 (Service Credits), 10 (Monitoring), and 12 (Definitions) survive termination for purposes of resolving any outstanding SLA disputes.

---

## 14. CONTACT INFORMATION & ESCALATION

**Support Portal:** support.ipoready.com

**General Support Email:** support@ipoready.com

**Escalation Email:** escalations@ipoready.com

**Sales & Premium Support:** sales@ipoready.com

**Legal Notices:** legal@ipoready.com

**Mailing Address:**
```
IPOReady Inc.
Legal & Compliance
[Address]
[City, State ZIP]
[Country]
```

---

## 15. AMENDMENTS & UPDATES

This SLA may be amended by Provider with 30 days' written notice to Customer. Material changes to Uptime Guarantee or Performance SLOs require 60 days' notice. Customer's continued use of the Service constitutes acceptance of amended terms.

---

## ACKNOWLEDGMENT

By executing a Services Agreement with IPOReady Inc., Customer acknowledges receipt and understanding of this Service Level Agreement and agrees to be bound by its terms and conditions.

**Last Updated:** June 6, 2026

**Version:** 1.0

---

### APPENDIX A: SCHEDULED MAINTENANCE WINDOW

**Monthly Maintenance Window (First Sunday of Each Month):**
- **Time:** 02:00–04:00 UTC (Sunday morning)
- **Duration:** Maximum 2 hours
- **Frequency:** Once per calendar month (planned)
- **Notification:** 72 hours advance notice via status page
- **Expected Impact:** Feature degradation possible; data queries may be slow

**Emergency Maintenance:** As needed with 4-hour advance notice

---

### APPENDIX B: GEOGRAPHIC REGIONS

The Service is available in the following geographic regions:

- **North America (Primary):** Toronto, Canada (Neon primary)
- **Backup Region 1:** Northern Virginia, USA
- **Backup Region 2:** Central Canada (secondary Neon)

Data is automatically replicated across all regions in real-time.

---

### APPENDIX C: PERFORMANCE BENCHMARK DATA

Baseline performance metrics (measured over preceding 90-day period):

- **P99 Latency Current:** ~180ms (baseline)
- **P95 Latency Current:** ~120ms (baseline)
- **Monthly Uptime Current:** ~99.87% (baseline)

These metrics are reviewed quarterly and updated as improvements are deployed.

---

**END OF SERVICE LEVEL AGREEMENT**

