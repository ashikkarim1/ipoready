# IPOReady Phase 1: Regulatory Integrations Quick Start

## What You've Just Received

This comprehensive setup package includes everything needed to integrate Canadian and US regulatory filing platforms into IPOReady before your pilot customer launch.

### Package Contents

| Document | Purpose | Read Time | Action Required |
|---|---|---|---|
| **`.env.template`** | Complete environment variables reference with all required credentials | 5 min | Copy to `.env.local`, fill credentials |
| **`SEDAR2_REGISTRATION_GUIDE.md`** | Step-by-step Canadian regulatory filing registration (5–14 days) | 15 min | Start SEDAR 2 account + API request NOW |
| **`SEC_EDGAR_REGISTRATION_GUIDE.md`** | US regulatory filing integration (NO credentials needed, immediate) | 15 min | Read, then build integration |
| **`PHASE1_CREDENTIALS_CHECKLIST.md`** | Complete tracking checklist for all integrations and dependencies | 10 min | Print + track progress weekly |
| **`SANDBOX_SETUP_GUIDE.md`** | Step-by-step testing guide for sandbox environments | 20 min | Use for QA and integration testing |
| **`PHASE1_SETUP_QUICK_START.md`** | This file — executive summary and timeline | 5 min | Reference for weekly status updates |

---

## Timeline at a Glance

```
WEEK 1 (Days 1–7)
├─ SEC EDGAR Setup (DONE IMMEDIATELY — No credentials needed)
│  ├─ Day 1: Add EDGAR config to .env.local
│  ├─ Day 2–3: Build EDGAR API service (searchCIK, getFilings, getCompanyFacts)
│  ├─ Day 3–4: Add filing status widget to `/integrations`
│  ├─ Day 4: Add dashboard filing card (when company is US-listed)
│  └─ Day 5: QA testing with real SEC data (Apple, Tesla, etc.)
│
└─ SEDI Setup (LIGHTWEIGHT — Public portal only)
   ├─ Day 2: Add SEDI config to .env.local
   ├─ Day 3–4: Build SEDI web scraping or CSV import service
   ├─ Day 4: Add insider alert widget to dashboard
   └─ Day 5: QA testing with real insider transaction data

WEEK 2–3 (Days 8–21) ← SEDAR 2 IS THE CRITICAL PATH
├─ SEDAR 2 Account Registration (Immediate, Day 1)
│  ├─ Day 1: Create account at https://www.sedarplus.ca
│  ├─ Day 1–2: Verify email + enable 2FA
│  └─ Day 3: Confirm manual filing search works
│
└─ SEDAR 2 API Access (2–4 weeks, parallel path)
   ├─ Path A: Partner with Filing Agent (3–7 days) — RECOMMENDED
   │  ├─ Day 3: Identify Canadian law firm with SEDAR 2 access
   │  ├─ Day 4–5: Sign data sharing agreement
   │  ├─ Day 6–7: Receive API credentials
   │  └─ Day 8: Integrate with IPOReady
   │
   └─ Path B: Direct CSA Application (2–4 weeks) — FALLBACK
      ├─ Day 3: Email CSA at consultation@securities-administrators.ca
      ├─ Days 4–14: CSA review and Q&A
      ├─ Days 15–21: CSA approval (if granted)
      └─ Day 22: Receive API credentials

WEEK 4 (Days 22–28) — INTEGRATION & QA
├─ Add SEDAR 2 API credentials to .env.local
├─ Build SEDAR 2 API service (searchCompany, getProspectusStatus, getInsiderFilings)
├─ Test against sandbox environment (unlimited requests, no rate limiting)
├─ Test against production (real Canadian data)
├─ Add SEDAR 2 status widget to `/integrations`
├─ Add dashboard filing card (when company is Canadian-listed)
└─ Full integration QA (all 3 platforms together)

LAUNCH DAY (After Week 4)
└─ ✓ All 3 platforms integrated and verified
   ✓ SEC EDGAR: Live filing status checks
   ✓ SEDAR 2: Live prospectus & insider monitoring
   ✓ SEDI: Insider transaction alerts
   ✓ Dashboard shows dual-exchange filing status
```

---

## Critical Path: What Must Happen Before Launch

### The Bottleneck: SEDAR 2 API Access (14–28 days)

**SEDAR 2 is the longest approval process.** Start immediately.

**Week 1, Day 1: Choose Your Path**

#### Path A: Partner with Filing Agent (RECOMMENDED — 3–7 days)

| Step | Who | Timeline | Details |
|---|---|---|---|
| **Identify Partner** | Your team | Day 1 | Call a Toronto/Vancouver law firm with IPO experience (Osler, Miller Thomson, Davies, McCarthy Tétrault) |
| **Pitch & Negotiate** | Your team | Days 2–4 | Explain IPOReady's use case, propose data sharing agreement, negotiate terms |
| **Sign Agreement** | Legal + Partner firm | Days 5–6 | Execute data sharing agreement, establish support SLA |
| **Receive Credentials** | Partner firm | Days 7–8 | Receive `SEDAR2_API_KEY`, `SEDAR2_API_SECRET`, sandbox credentials |
| **Integrate & Test** | Engineering | Days 9–14 | Build SEDAR 2 service, test in sandbox, deploy to production |

**Timeline: ~2 weeks (including integration)**

**Pros:**
- Fastest path to API access
- Partner provides ongoing support
- Shared responsibility for API management

**Cons:**
- Requires partnership negotiation
- Gives partner visibility into your company data

#### Path B: Direct CSA Application (2–4 weeks)

| Step | Who | Timeline | Details |
|---|---|---|---|
| **Prepare Application** | Your team | Days 1–3 | Draft proposal explaining IPOReady's technology, data security practices |
| **Submit to CSA** | Your team | Day 4 | Email to `consultation@securities-administrators.ca` |
| **CSA Review** | Canadian Securities Administrators | Days 5–14 | CSA evaluates your proposal, may ask clarifying questions |
| **Follow-up (if needed)** | Your team | Day 10 | Send follow-up email if no response (CSA can be slow) |
| **CSA Approval** | CSA | Days 15–28 | CSA approves (or requests more info) |
| **Receive Credentials** | CSA | Day 28 | Receive API credentials + sandbox credentials |
| **Integrate & Test** | Engineering | Days 29–35 | Build SEDAR 2 service, test in sandbox, deploy to production |

**Timeline: ~5 weeks (including integration)**

**Pros:**
- Direct relationship with regulator
- No third-party dependency
- Cleaner data flow (no partner intermediary)

**Cons:**
- Slow CSA approval process
- May require multiple Q&A rounds
- Highest uncertainty

### Recommendation

**Start both paths in parallel, then execute the one that completes first.**

1. **Day 1:** Create SEDAR 2 account + start Path A (call law firms) + start Path B (draft CSA email)
2. **Days 2–7:** Execute Path A in parallel with Path B email submission
3. **Days 8–14:** Whichever path completes first → integrate with IPOReady
4. **Days 15+:** Cancel the slower path if necessary

---

## Week-by-Week Action Items

### Week 1: Foundation (Days 1–7)

**Goal:** SEC EDGAR and SEDI done, SEDAR 2 account created + API request submitted

- [ ] **Day 1**
  - [ ] Copy `.env.template` to `.env.local`
  - [ ] Create SEDAR 2 account at https://www.sedarplus.ca
  - [ ] Email CSA at consultation@securities-administrators.ca (draft in advance)
  - [ ] Call 3 law firms to discuss SEDAR 2 partnership

- [ ] **Day 2**
  - [ ] Add SEC EDGAR config to `.env.local`
  - [ ] Verify SEDAR 2 email + enable 2FA
  - [ ] Follow up with law firms (send proposal)

- [ ] **Day 3**
  - [ ] Start EDGAR API service (`/src/lib/edgar.ts`)
  - [ ] Test EDGAR with Apple (CIK 0000320193)
  - [ ] Confirm CSA received your email + follow up if needed

- [ ] **Day 4**
  - [ ] Complete EDGAR integration (searchCIK, getFilings functions)
  - [ ] Add SEDI config to `.env.local`
  - [ ] Confirm law firm partnership (if Path A chosen)

- [ ] **Day 5–7**
  - [ ] EDGAR testing with multiple companies (Apple, Tesla, Airbnb)
  - [ ] Build SEDI web scraping service
  - [ ] Add dashboard widgets for both EDGAR + SEDI
  - [ ] QA testing

### Week 2: SEDAR 2 API Access (Days 8–14)

**Goal:** Receive SEDAR 2 API credentials (via Path A or B)

- [ ] **If Path A (Partner):**
  - [ ] Finalize partnership agreement
  - [ ] Receive API credentials by Day 7–8
  - [ ] Begin integration immediately

- [ ] **If Path B (CSA):**
  - [ ] Answer any CSA questions (Day 8–10)
  - [ ] Await CSA decision (Day 10–14)
  - [ ] May extend into Week 3

- [ ] **Parallel Work (Both Paths):**
  - [ ] Create SEDAR 2 integration service (`/src/lib/sedar2.ts`)
  - [ ] Design database schema for cached filings
  - [ ] Set up sandbox testing environment
  - [ ] Draft SEDAR 2 unit tests

### Week 3: SEDAR 2 Integration (Days 15–21)

**Goal:** SEDAR 2 integrated, tested, and ready for production

- [ ] **Receive Credentials**
  - [ ] Store in `.env.local`: `SEDAR2_API_KEY`, `SEDAR2_API_SECRET`
  - [ ] Store sandbox credentials: `SEDAR2_SANDBOX_API_KEY`, etc.

- [ ] **Sandbox Testing**
  - [ ] Test company search in sandbox
  - [ ] Test prospectus retrieval
  - [ ] Test insider filing retrieval
  - [ ] Verify unlimited rate limiting in sandbox

- [ ] **Production Testing**
  - [ ] Test with real Canadian company (Magna International)
  - [ ] Test with real TSXV IPO
  - [ ] Verify rate limiting (100 req/min)
  - [ ] Verify caching (1-hour TTL)

- [ ] **Add Dashboard Widgets**
  - [ ] SEDAR 2 status on `/integrations`
  - [ ] Filing status card on `/dashboard`
  - [ ] Insider alert badge

### Week 4: Full Integration & Launch Prep (Days 22–28)

**Goal:** All 3 platforms integrated, tested, monitoring in place

- [ ] **Final QA (All Platforms)**
  - [ ] Test dual-exchange companies (TSX + NASDAQ simultaneously)
  - [ ] Verify rate limiting compliance (EDGAR: 5/sec, SEDAR 2: 100/min)
  - [ ] Verify caching reduces API calls by 80%+
  - [ ] Test error handling (404, 429, timeouts)

- [ ] **Monitoring & Logging**
  - [ ] API response times logged
  - [ ] Failed requests logged + alerted
  - [ ] Rate limit hits logged + alerted
  - [ ] Cache hit rate monitored

- [ ] **Pre-Launch Verification**
  - [ ] All secrets in environment variables (no hardcoded keys)
  - [ ] Credentials rotated annually scheduled
  - [ ] Backup strategy for API credentials documented
  - [ ] Rollback plan for each platform documented

- [ ] **Documentation**
  - [ ] SEDAR2_REGISTRATION_GUIDE.md ✓ Complete
  - [ ] SEC_EDGAR_REGISTRATION_GUIDE.md ✓ Complete
  - [ ] PHASE1_CREDENTIALS_CHECKLIST.md ✓ Complete
  - [ ] SANDBOX_SETUP_GUIDE.md ✓ Complete
  - [ ] API response time SLA documented (target: < 5 sec)
  - [ ] Error handling guide documented

- [ ] **Launch Approval**
  - [ ] Dev Lead signoff: Integration code reviewed
  - [ ] DevOps Lead signoff: Monitoring in place
  - [ ] Product Lead signoff: Feature requirements met
  - [ ] Security Lead signoff: No secrets exposed

---

## Credentials You'll Receive

### SEC EDGAR (No credentials needed)

✓ **Immediate.** All public, free, no registration required.

Configuration example:
```bash
EDGAR_API_BASE_URL=https://www.sec.gov/cgi-bin/browse-edgar
EDGAR_USER_AGENT=IPOReady/1.0 (+https://www.ipoready.ai; hello@ipoready.ai)
EDGAR_CACHE_TTL=86400
```

### SEDI (No API key needed)

✓ **Immediate.** Public portal access, manual or automated web scraping.

Configuration example:
```bash
SEDI_PUBLIC_PORTAL_URL=https://www.sedi.ca
SEDI_CACHE_TTL=604800
```

### SEDAR 2 (Credentials from CSA or filing agent)

⏳ **2–4 weeks.** Requires approval + partnership negotiation.

You will receive:
```bash
SEDAR2_API_KEY=your_sedar2_api_key_here
SEDAR2_API_SECRET=your_sedar2_api_secret_here
SEDAR2_BASE_URL=https://www.sedarplus.ca/api/v1
SEDAR2_SANDBOX_API_KEY=your_sandbox_api_key_here
SEDAR2_SANDBOX_API_SECRET=your_sandbox_api_secret_here
```

---

## Integration Effort Estimate

| Integration | Setup | Build | Test | Monitoring | Total |
|---|---|---|---|---|---|
| **SEC EDGAR** | 2 hrs | 8 hrs | 4 hrs | 2 hrs | **16 hrs** |
| **SEDI** | 1 hr | 4 hrs | 2 hrs | 1 hr | **8 hrs** |
| **SEDAR 2** | 2 hrs | 8 hrs | 6 hrs | 2 hrs | **18 hrs** |
| **Integration** | — | 4 hrs | 4 hrs | 2 hrs | **10 hrs** |
| **TOTAL** | 5 hrs | 24 hrs | 16 hrs | 7 hrs | **52 hours** |

**Calendar time:** 4 weeks (parallelized)  
**Effort (1 engineer):** 52 hours  
**Effort (2 engineers):** 26 hours

---

## Success Metrics

By launch, you should have:

### Functional Requirements

- [ ] Dashboard shows "Prospectus filed [date]" for US-listed companies (SEC EDGAR)
- [ ] Dashboard shows "Prospectus filed [date]" for Canadian-listed companies (SEDAR 2)
- [ ] Dashboard shows insider trading alerts (SEDI)
- [ ] Filing status updates within 1 hour of regulatory filing
- [ ] Dual-exchange companies show both filing statuses

### Performance Requirements

- [ ] API response time < 5 seconds (average)
- [ ] Cache hit rate > 80% (reduces API calls)
- [ ] Uptime > 99.5% (measured per platform)
- [ ] Rate limiting compliance: 0 rejected requests due to exceeding limits

### Reliability Requirements

- [ ] Failed API requests handled gracefully (user sees "Data unavailable, try again later")
- [ ] Timeouts handled with retry + exponential backoff
- [ ] All secrets secured (no hardcoded keys, environment variables only)
- [ ] Monitoring in place (response times, error rates, rate limit hits)

---

## Getting Help

### Document References

1. **"How do I register for SEDAR 2?"** → `SEDAR2_REGISTRATION_GUIDE.md`
2. **"How do I set up SEC EDGAR?"** → `SEC_EDGAR_REGISTRATION_GUIDE.md`
3. **"What credentials do I need?"** → `PHASE1_CREDENTIALS_CHECKLIST.md`
4. **"How do I test the integrations?"** → `SANDBOX_SETUP_GUIDE.md`
5. **"What's the environment variable template?"** → `.env.template`

### Key Contacts

| Question | Contact | Response Time |
|---|---|---|
| "How do I get SEDAR 2 API access?" | Canadian Securities Administrators | 2–4 weeks |
| | Email: `consultation@securities-administrators.ca` | |
| | Phone: 1-855-622-4357 | |
| "How do I access SEDAR 2 sandbox?" | CSA or your filing agent partner | 24 hours |
| | Email: `sedar.support@nca-afc.ca` | |
| "What's the SEC EDGAR API documentation?" | SEC (public docs) | Immediate |
| | URL: `https://www.sec.gov/edgar/sec-api-documentation.html` | |

---

## Common Pitfalls & Solutions

| Pitfall | Solution |
|---|---|
| **Forgot to add User-Agent header to SEC EDGAR requests** | All SEC requests REQUIRE User-Agent. Check: `'User-Agent': 'IPOReady/1.0 (+https://www.ipoready.ai)'` |
| **Hardcoded API keys in code** | Use `.env.local` for dev, environment variables in production. Never commit `.env.local`. |
| **Rate limiting errors (429 Conflict)** | Implement exponential backoff + request queuing. Space requests: SEC EDGAR 100ms apart, SEDAR 2 600ms apart. |
| **Slow SEDAR 2 responses** | Normal (CSA servers can be slow during market hours). Increase timeout to 30s, implement caching. |
| **SEDAR 2 sandbox data resets randomly** | Sandbox data is reset periodically by CSA. Don't rely on persistent test data. |
| **Company not found in any platform** | Company may be private or delisted. Verify via manual search first. |

---

## Deployment Checklist

Before deploying to production, verify:

- [ ] **All Environment Variables Set**
  - [ ] EDGAR_* variables configured
  - [ ] SEDAR2_* variables configured (production, not sandbox)
  - [ ] SEDI_* variables configured
  - [ ] All API keys present (no "undefined" values)

- [ ] **Secrets Secured**
  - [ ] No API keys in code (check git history)
  - [ ] API keys only in environment variables
  - [ ] Secrets rotated (not using stale keys)

- [ ] **Monitoring Active**
  - [ ] Response time metrics logged
  - [ ] Error rate metrics logged
  - [ ] Rate limit alerts configured
  - [ ] Cache performance metrics available

- [ ] **Rollback Plan**
  - [ ] If SEC EDGAR fails: Fall back to manual filing status entry
  - [ ] If SEDAR 2 fails: Fall back to manual filing status entry
  - [ ] If SEDI fails: Insider alerts disabled (non-critical)
  - [ ] Documented in runbook

- [ ] **QA Passed**
  - [ ] SEC EDGAR integration tested with 3+ companies
  - [ ] SEDAR 2 integration tested in sandbox + production
  - [ ] SEDI integration tested with real insider data
  - [ ] Error handling tested (404, 429, timeout scenarios)
  - [ ] Rate limiting compliance verified

---

## Frequently Asked Questions

**Q: Do I need to register with SEC for EDGAR?**  
A: No. SEC EDGAR is public and free. No registration, no API key, no credentials needed.

**Q: How long does SEDAR 2 approval take?**  
A: 2–4 weeks if you apply directly to CSA. 3–7 days if you partner with a filing agent (recommended).

**Q: Can I use the sandbox credentials in production?**  
A: No. Sandbox APIs return test data and have unlimited rate limits. You must switch to production credentials before launch.

**Q: What if CSA rejects my SEDAR 2 application?**  
A: Partner with a filing agent instead (Path A). Fastest backup.

**Q: How often should I cache filing status?**  
A: Recommended: 1 hour for SEDAR 2 (filings update once per day), 24 hours for SEC EDGAR (similar frequency).

**Q: What happens if I hit the rate limit?**  
A: SEC EDGAR: 429 error. Implement exponential backoff (wait 1s, 2s, 4s...). SEDAR 2: Similar. Both retry automatically with this guide's code samples.

**Q: Can I test with real live data?**  
A: Yes. Both EDGAR and SEDI use live data. SEDAR 2 has a separate sandbox with test data.

---

## Next Steps

1. **Print this document + the checklist.** Pin to your wall.
2. **Day 1, Morning:** Create SEDAR 2 account + email CSA + call law firms.
3. **Day 1, Afternoon:** Copy `.env.template` to `.env.local` and start SEC EDGAR setup.
4. **Day 2–3:** Build EDGAR API service.
5. **Day 4–7:** Build SEDI service + QA.
6. **Day 8–14:** Receive SEDAR 2 credentials (fastest path) + begin integration.
7. **Day 15–21:** SEDAR 2 integration + full testing.
8. **Day 22–28:** Launch prep + final QA.
9. **Launch:** All 3 platforms live.

---

**Document Version:** 1.0  
**Last Updated:** June 2026  
**Created for:** IPOReady Phase 1 Launch  
**Total Read Time:** 20 minutes  
**Total Setup Time:** 4 weeks (parallelized)
