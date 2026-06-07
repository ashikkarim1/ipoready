# IPOReady Pricing Strategy (Final)
## Effective June 15, 2026

---

## 📊 PRICING TIERS

### **STARTER (Free)**
**Target:** Early-stage companies exploring IPO path
- Cap table management
- IPO checklists & milestones
- Document library
- Team management (basic)
- No credit card required

---

### **PROFESSIONAL (Pre-IPO Bundle)**
**Target:** Series B-D companies actively preparing for IPO  
**Features:** Market Advantage + Investor Match + All Pre-IPO Tools

#### Trial Offer
- **First month: $99** (one-time charge, same for both regions)
- Auto-renews at full price on day 31

#### Monthly Subscription (Post-Trial)
- **🇨🇦 Canada: $499 CAD/month**
- **🇺🇸 USA: $999 USD/month**

#### Features Included
✅ Market Advantage Intelligence (real-time data, what-if scenarios, trend analysis)
✅ Investor Match (CRM, outreach templates, email tracking)
✅ Filing Systems (multi-country IPO filing helpers - when ready)
✅ Prospectus Auto-Builder (when available)
✅ PACE™ Benchmarking (IPO readiness scoring)
✅ Cap Table + Advanced Analytics
✅ Compliance Checklists (pre-IPO only)
✅ Email support (48-hour response)

#### What's NOT Included
❌ Listed Services (post-IPO compliance) - priced separately
❌ White-label / API access - Enterprise only
❌ Dedicated support - Enterprise only

---

### **LISTED SERVICES (Post-IPO Compliance)**
**Status:** Coming later (Phase 2)
**Pricing:** TBD (separate line item or add-on)

---

### **ENTERPRISE (Custom)**
**Target:** Public companies, institutional investors, investment banks

#### Pricing Model
- **Custom pricing** (sales-driven, minimum $X/month)
- Multi-seat licenses
- Annual contracts with discounts

#### Features Included
✅ Everything in Professional
✅ Listed Services (post-IPO module)
✅ API access (for integrations)
✅ White-label dashboard
✅ Dedicated Slack support channel
✅ Priority feature requests
✅ Training + onboarding
✅ SLA guarantees

---

## 🌍 CURRENCY & REGION LOGIC

**Automatic Detection:**
```
User signs up with:
- Address in Canada OR
- Company registered in Canada
→ Show pricing in CAD, charge in CAD

User signs up with:
- Address in USA OR  
- Company registered in USA
→ Show pricing in USD, charge in USD

All others → Default to USD
```

**Database Field:**
```sql
-- Add to users or subscriptions table
currency: ENUM('USD', 'CAD')
region: ENUM('USA', 'CANADA', 'OTHER')
```

**Stripe Setup:**
- Create 2 products in Stripe:
  - Professional (CAD) - $499 CAD/month
  - Professional (USD) - $999 USD/month
- Same product ID prefix, different prices
- Webhook handles both currencies

---

## 💳 TRIAL → PAID FLOW

### Day 1-30: Trial Period
- Charge: $99 (one-time, any region)
- Status: `subscription_status = 'trial'`
- Features: Full Professional access
- Email (Day 1): "Welcome! Your $99 trial is active."
- Email (Day 7): "7 days left in your trial"
- Email (Day 27): "3 days left! Your card will be charged $499 CAD / $999 USD"

### Day 31: Auto-Renewal
- Charge: $499 CAD or $999 USD (based on region)
- Status: `subscription_status = 'active'`
- Email: "Welcome to Professional! Your subscription is now active."
- If charge fails: Email customer with retry link + phone support

### Monthly (Day 1 of next month)
- Auto-charge previous month's rate
- Send invoice/receipt
- If declined: Notify customer, offer payment method update, lock features after 3 failed attempts

### Cancellation
- User clicks "Cancel subscription" on /dashboard/billing
- Status: `subscription_status = 'cancelled'`
- Professional features locked immediately
- Refund: None (terms state no refunds for digital services)
- Exit survey: "Why are you leaving?" (optional)

---

## 📈 REVENUE PROJECTIONS (Estimates)

### Scenario 1: Conservative (10 customers by Dec 2026)
| Month | Customers | Trial Revenue | Recurring Revenue | Total MRR |
|-------|-----------|---|---|---|
| June | 1 | $99 | $0 | $99 |
| July | 3 | $297 | $999 | $1,296 |
| Aug | 5 | $495 | $2,997 | $3,492 |
| Sept | 7 | $693 | $5,994 | $6,687 |
| Oct | 8 | $792 | $7,992 | $8,784 |
| Nov | 9 | $891 | $8,991 | $9,882 |
| Dec | 10 | $990 | $9,990 | **$10,980 MRR** |

**Annual Revenue (2026):** ~$65K (6 months active)

---

### Scenario 2: Aggressive (30 customers by Dec 2026)
| Month | Customers | Trial Revenue | Recurring Revenue | Total MRR |
|-------|-----------|---|---|---|
| June | 3 | $297 | $0 | $297 |
| July | 8 | $792 | $2,997 | $3,789 |
| Aug | 15 | $1,485 | $8,982 | $10,467 |
| Sept | 22 | $2,178 | $19,978 | $22,156 |
| Oct | 27 | $2,673 | $26,973 | $29,646 |
| Nov | 30 | $2,970 | $29,970 | $32,940 |
| Dec | 32 | $3,168 | $31,968 | **$35,136 MRR** |

**Annual Revenue (2026):** ~$200K (6 months active, growing)

---

## 🎯 LAUNCH STRATEGY

### Week 1 (June 15-21): Pilot Phase
- Offer trial to: pilot companies + waitlist (5-10 customers)
- Monitor for bugs, support issues
- Gather feedback on pricing perception
- No paid ads yet

### Week 2-4 (June 22 - July 15): Soft Launch
- Announce to broader network (LinkedIn, email)
- Refine based on early customer feedback
- Onboard 5-15 more customers
- Collect case studies from first customers

### Month 2+ (August onward): Growth
- Paid acquisition channels (ads, partnerships)
- Case studies + testimonials
- Enterprise sales outreach
- Consider adjusting pricing if feedback suggests

---

## ⚠️ IMPORTANT IMPLEMENTATION NOTES

### 1. Currency Handling
- All prices shown in user's preferred currency
- Stripe handles exchange rates (or we set fixed rates)
- Database stores both: amount + currency

### 2. Tax Compliance
- Canada: Add GST/HST (5-15% depending on province) ← TBD
- USA: Sales tax handling varies by state ← Use Stripe's tax calculation or manual
- Consider using Stripe Tax feature: automatically calculates & collects

### 3. Payment Retry Logic
- Day 1 (charge fails): Notify customer, retry automatically
- Day 3 (still failed): Send reminder email with payment update link
- Day 5 (still failed): Lock Professional features
- Day 7 (still failed): Send "subscription will be cancelled" notice
- Day 10: Cancel subscription, move to Starter

### 4. Refund Policy
- Trials ($99): Non-refundable (digital service)
- Subscriptions: No refunds for partial months, but can cancel anytime
- Exceptions: Only at CEO discretion (fraud, billing error, etc.)
- Update Terms of Service to clarify

### 5. Future Add-Ons (Phase 2)
- API Access: +$500/month (Enterprise tier)
- White-Label: +$2,000/month (Enterprise tier)
- Listed Services: TBD (separate pricing)
- Custom Integrations: $X per integration
- Priority Support: +$200/month

---

## 📋 IMPLEMENTATION CHECKLIST (Updated)

### Stripe Setup
- [ ] Create product: "Professional (CAD)" - $499 CAD/month
- [ ] Create product: "Professional (USD)" - $999 USD/month
- [ ] Create trial plan: $99 one-time charge
- [ ] Set up automatic renewal after trial
- [ ] Configure webhook events

### Database
- [ ] Add `currency` column to subscriptions table (USD/CAD)
- [ ] Add `trial_started_at` column
- [ ] Add `trial_ends_at` column
- [ ] Add `subscription_status` column (trial/active/cancelled)
- [ ] Add `payment_method_id` for stored cards

### Frontend
- [ ] Detect user region (address or company registration)
- [ ] Show pricing in user's currency
- [ ] Payment form (Stripe Elements) with billing address
- [ ] Trial → Renewal messaging (clear what happens after $99)
- [ ] Billing dashboard showing current price

### Compliance
- [ ] Update Terms of Service with billing terms
- [ ] Update Privacy Policy with Stripe disclosure
- [ ] Add trial/auto-renewal disclosure on payment page
- [ ] Ensure GDPR-compliant for EU users (if applicable)

---

## 🎊 Launch Messaging

### Email Subject (Trial Offer)
**"IPOReady Professional: 30-Day Trial for $99"**

### Email Body
```
Hi [Company],

We're excited to launch IPOReady Professional — the only platform that combines 
IPO readiness intelligence with investor relationship management.

🎯 **What You Get (Professional Tier):**
✅ Market Advantage Intelligence (real-time data on IPO conditions)
✅ Investor Match CRM (track conversations, personalized outreach)
✅ PACE™ Benchmarking (see how you compare to peers)
✅ Compliance Checklists (all pre-IPO requirements)
✅ Prospectus Auto-Builder (coming soon)

💰 **Special Offer: 30-Day Trial for Just $99**
After 30 days, your subscription renews at $999 USD / $499 CAD per month.
Cancel anytime — no hidden fees.

[Start Your Trial Button]

Questions? Reply to this email or schedule a demo: [link]

Best,
The IPOReady Team
```

### Landing Page CTA
```
"Try Professional for $99

Unlock market intelligence + investor tracking.
30-day trial, full access, cancel anytime.

→ Start Trial"
```

---

## 📞 Questions to Answer

1. **Tax handling?**
   - Use Stripe Tax feature? Manual calculation? Outsource to accountant?
   - What tax ID should be on invoices?

2. **Refund exceptions?**
   - Can customers request refunds within 7 days?
   - What's the process?

3. **Enterprise pricing?**
   - Minimum contract value? ($5K/month? $10K/month?)
   - Who closes Enterprise deals? (CEO? Sales person?)

4. **Billing support?**
   - Dedicated billing email? (billing@ipoready.com)
   - Support hours?

---

## 🚀 GO-LIVE READINESS

**Status: PRICING LOCKED ✅**

- [x] Professional tier pricing confirmed ($499 CAD / $999 USD)
- [x] Trial offer confirmed ($99/month, 1 month only)
- [x] Currency logic defined
- [x] Features assigned to tiers
- [ ] Stripe products created
- [ ] Payment form built
- [ ] Region detection implemented
- [ ] Billing dashboard built
- [ ] Email templates created

**Target Go-Live: June 15, 2026** ✅
