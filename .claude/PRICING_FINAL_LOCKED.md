# IPOReady Pricing - FINAL LOCKED
## 3 Months at 50% Off, Then Full Price

---

## 💰 PRICING (LOCKED)

### **BASE PRICING (Month 4 onwards)**
- 🇨🇦 **Canada: $499 USD/month**
- 🇺🇸 **USA: $999 USD/month**

### **LAUNCH OFFER (3 Months - June 15 to Sept 14)**
- 🇨🇦 **Canada: $249.50 USD/month** (50% off)
- 🇺🇸 **USA: $499.50 USD/month** (50% off)
- **Auto-renews at full price on month 4**
- **NO trial option** - straight to discounted pricing

---

## 📊 CUSTOMER JOURNEY (EXACT)

### **Day 1 (June 15): Signup**
```
Customer registers for free Starter
↓
"Upgrade to Professional: 50% off for 3 months!"
↓
Select region (Canada or USA)
↓
Enter payment method
↓
Charge applied immediately:
  - Canada: $249.50
  - USA: $499.50
```

### **Month 1 (June 15 - July 14): First Charge**
```
Charge: $249.50 (Canada) or $499.50 (USA)
Email: "Welcome to Professional! 50% off for 3 months."
Dashboard banner: "Your discount pricing ends in 2 months"
Features: Professional tier unlocked
```

### **Month 2 (July 15 - Aug 14): Recurring at 50% Off**
```
Auto-charge: $249.50 (Canada) or $499.50 (USA)
Email: "Your subscription renewed. 1 month of discounts left!"
Dashboard banner: "Your discount pricing ends in 1 month"
```

### **Month 3 (Aug 15 - Sept 14): Last Month of Discount**
```
Auto-charge: $249.50 (Canada) or $499.50 (USA)
Email (Day 1): "Last month of 50% off! Next month it's full price."
Email (Day 20): "FINAL REMINDER: Tomorrow your price increases to $499/$999"
Dashboard: Red banner "Your 50% discount expires tomorrow"
```

### **Month 4+ (Sept 15 onwards): FULL PRICE**
```
Auto-charge: $499 (Canada) or $999 (USA)
Email: "Your subscription renewed at full price."
No more discount
Cancel option always available
```

---

## 📈 REVENUE MODEL

### **Scenario: Conservative (6 customers by June 30)**

```
JUNE (16 days): Acquire 6 customers
├─ 4 Canada @ $249.50 = $998
├─ 2 USA @ $499.50 = $999
└─ June revenue: $1,997

JULY (all 6 renew at 50% off):
├─ 4 Canada @ $249.50 = $998
├─ 2 USA @ $499.50 = $999
└─ July MRR: $1,997

AUGUST (all 6 renew at 50% off + add 2 new):
├─ 4 Canada @ $249.50 = $998
├─ 2 USA @ $499.50 = $999
├─ 2 new USA @ $499.50 = $999 (at discount)
└─ August MRR: $2,996

SEPTEMBER (all 6 hit full price! + 2 new):
├─ 4 Canada @ $499 = $1,996 ✅ (FULL PRICE!)
├─ 2 USA @ $999 = $1,998 ✅ (FULL PRICE!)
├─ 2 USA @ $499.50 = $999 (still in discount window)
└─ September MRR: $4,993 ✅ (GOAL HIT!)

OCTOBER (8 customers, most at full price):
├─ 4 Canada @ $499 = $1,996
├─ 4 USA @ $999 = $3,996
└─ October MRR: $5,992 ✅ (Well above $3K!)

BY DECEMBER (10-12 customers):
├─ All at full price ($499 or $999)
├─ 6 Canada @ $499 = $2,994
├─ 4-6 USA @ $999 = $3,996-$5,994
└─ December MRR: $6,990-$8,988
```

### **Key Revenue Insight:**
```
Month 1-3: Customers pay 50% off
Month 4+: Automatic price jump to full price
         (Customer is already "locked in" to the service)

By September: Your first cohort pays FULL PRICE
             = automatic 2x revenue increase
             = very predictable
             = no churn expected (they've been using it 3 months)
```

---

## ✅ FEATURES INCLUDED (ALL TIERS)

**Professional Tier ($249.50/$499.50 first 3 months, then $499/$999):**
- ✅ Market Advantage Intelligence (real-time IPO data + what-if scenarios)
- ✅ Investor Match CRM (track conversations, personalize outreach)
- ✅ PACE™ Benchmarking (see how you compare to peers)
- ✅ Compliance Checklists (pre-IPO requirements)
- ✅ Cap Table + Advanced Analytics
- ✅ Prospectus Auto-Builder (when available)
- ✅ Multi-Country Filing Support (when available)
- ✅ Email support (24-48 hour response)
- ❌ Listed Services (post-IPO compliance - priced separately later)
- ❌ API access (Enterprise only)
- ❌ White-label (Enterprise only)

---

## 🌍 REGION DETECTION

**At signup: "Where is your company based?"**
```
☐ Canada → Price shown: $249.50/month (3 months), then $499/month
☐ USA    → Price shown: $499.50/month (3 months), then $999/month
☐ Other  → Default to USA pricing
```

**Database field:**
```sql
region: ENUM('Canada', 'USA')
subscription_price: DECIMAL(10,2)  -- Stores either 249.50, 499.50, 499, or 999
discount_expires_at: TIMESTAMP      -- 3 months from signup
months_remaining_at_discount: INT   -- 3, 2, 1, or 0
```

---

## 💳 STRIPE SETUP

### **Two Products (One per region)**

```
Product 1: "Professional (Canada)"
├─ Price 1: $249.50 USD/month (recurring) - Launch offer
├─ Price 2: $499 USD/month (recurring) - Full price

Product 2: "Professional (USA)"
├─ Price 1: $499.50 USD/month (recurring) - Launch offer
├─ Price 2: $999 USD/month (recurring) - Full price
```

### **Subscription Management:**
```
When customer signs up:
├─ Determine region (Canada or USA)
├─ Create subscription with LAUNCH price (50% off)
├─ Set discount_expires_at = NOW + 3 months
├─ On day 91 (month 4), upgrade subscription to FULL price
└─ Email notification: "Your 50% discount has ended"

At month 4:
├─ Update subscription's price plan
├─ Next charge will be full price
├─ Send email: "Welcome to full price, enjoy the platform!"
```

---

## 📧 EMAIL TEMPLATES

### **Email 1: Welcome (Day 1 of Month 1)**
```
Subject: Welcome to IPOReady Professional! 🚀

Hi [Company],

You're in! Your Professional subscription is now active.

💰 Your Offer:
├─ First 3 months: $[249.50 | 499.50]/month (50% off!)
├─ Month 4 onwards: $[499 | 999]/month (full price)
└─ Next charge: [DATE + 30 days]

✅ Features Unlocked:
├─ Market Advantage Intelligence (real-time IPO data)
├─ Investor Match CRM (track conversations)
├─ PACE™ Benchmarking (compare to peers)
└─ Compliance Checklists (don't miss anything)

👉 Next Steps:
1. Explore Market Advantage dashboard
2. Add your first investors to CRM
3. Run your readiness benchmark

Questions? Reply to this email or schedule a demo.

Best,
IPOReady Team
```

### **Email 2: Month 2 Renewal**
```
Subject: Your Professional subscription renewed ✅

Hi [Company],

Your monthly subscription renewed today!

💰 Charge: $[249.50 | 499.50] USD
⏰ Next charge: [DATE + 30 days]
🎁 Discount expires: [DATE - 30 days] (1 month left!)

Your invoice is attached.

Best,
IPOReady Team
```

### **Email 3: Final Month of Discount (Day 1 of Month 3)**
```
Subject: Last month of 50% off - Heads up! 🚨

Hi [Company],

Your subscription just renewed at the discounted price.

💰 This month: $[249.50 | 499.50]
📅 NEXT month: $[499 | 999] (50% discount ends!)

The good news: You've been using Professional for 2 months now. 
We think you're going to love paying full price for the value you're getting.

Questions about the price increase? Reply to this email.

Best,
IPOReady Team
```

### **Email 4: 20 Days Before Full Price**
```
Subject: Your Professional price is increasing Sept 15

Hi [Company],

Quick heads up: Your 50% discount ends in 10 days!

🎁 Current: $[249.50 | 499.50]/month
💰 Starting Sept 15: $[499 | 999]/month

This is the real price for Professional — it reflects the value 
of Market Advantage Intelligence + Investor Match + everything else.

You can cancel anytime at Settings > Subscription > Cancel.

Best,
IPOReady Team
```

### **Email 5: Full Price Renewal (Day 1 of Month 4)**
```
Subject: Your Professional subscription renewed at full price ✅

Hi [Company],

Your subscription just renewed at the full Professional price!

💰 Charge: $[499 | 999] USD
⏰ Next charge: [DATE + 30 days]

Thank you for being a Professional subscriber. Your support means everything.

Invoice attached. Questions? Reply to this email.

Best,
IPOReady Team
```

### **Email 6: Payment Failed (Any Time)**
```
Subject: Payment failed - Update your payment method

Hi [Company],

We tried to charge your card for Professional, but it failed.

❌ Error: [Card declined / Expired / Insufficient funds]

👉 Fix it now: [Update Payment Method Link]

If we don't hear from you in 3 days, we'll pause your Professional features.

Need help? Reply to this email.

Best,
IPOReady Team
```

---

## 🚀 LAUNCH MESSAGING

### **Email to Waitlist (June 15)**
```
Subject: IPOReady Professional is live - 50% off for 3 months!

Hi [Name],

We're launching Professional today — the only platform that combines 
real-time IPO intelligence + investor relationship management.

🎯 LAUNCH OFFER: 50% Off for 3 Months
├─ Canada: $249.50/month (then $499/month)
├─ USA: $499.50/month (then $999/month)
└─ Offer ends Sept 15 (3 months from launch)

What's included:
✅ Market Advantage Intelligence (when should you go public?)
✅ Investor Match CRM (track + personalize outreach)
✅ PACE™ Benchmarking (how ready are you vs peers?)
✅ Compliance Checklists (all requirements covered)

[Get Professional Button]

This offer is available for the next 3 months. Lock it in now.

Best,
IPOReady Team
```

### **LinkedIn Post**
```
🚀 IPOReady Professional is live!

The only platform that gives pre-IPO companies:
• Real-time market intelligence (should we go public now?)
• Investor relationship management (who to approach, when)
• PACE benchmarking (how ready are we vs peers?)
• Compliance automation (nothing gets missed)

🎯 Launch offer: 50% off for 3 months. Then full price.

For the first time, IPO prep is streamlined, intelligent, and achievable.

Link in bio. #IPO #Startups
```

### **Homepage Banner**
```
🚀 LAUNCH OFFER: Professional 50% Off (3 Months Only)

Get real-time IPO intelligence + investor CRM.
50% discount ends September 15.

[Get Professional Button]
```

---

## 📅 KEY DATES

```
June 7:   Pricing locked, implementation starts
June 15:  🚀 LAUNCH DAY
          └─ Customers start getting 50% off

July 15:  1 month of discount used, 2 months left
Aug 15:   2 months of discount used, 1 month left
Sept 15:  🔴 DISCOUNT ENDS - All early customers move to FULL PRICE
          └─ Revenue jumps to full price (~2x)

Oct 1:    First full month of regular pricing
          └─ Revenue stabilizes at full price
```

---

## 💡 WHY THIS WORKS

✅ **3 months = Long enough to prove value**
   - Customers have time to see ROI
   - Less likely to cancel during discount
   - By month 4, they're "locked in" psychologically

✅ **Automatic price increase = No surprises**
   - They know month 4 it goes to full price
   - Creates urgency: "upgrade now at 50% off"
   - Revenue jumps automatically (no new sales needed!)

✅ **Regional pricing = Fair**
   - Canada: $499 (lower purchasing power)
   - USA: $999 (higher market price)
   - Both get same 50% discount

✅ **No trial = Commitment**
   - No freemium complexity
   - People who pay (even at discount) are serious
   - Higher retention than free trial users

✅ **Revenue ramp is predictable**
   - Month 1-3: Discounted revenue
   - Month 4: Price jump (all early customers hit full price)
   - Each new cohort: Same pattern

✅ **Easy to execute**
   - No trial logic needed
   - Just 2 Stripe products (Canada/USA)
   - Subscription auto-upgrades after 3 months

---

## 🎯 SUCCESS METRICS

**By July 31 (hit $3K/month?):**
- Need: 6-8 customers (all paying $249.50-$499.50)
- Revenue: ~$2K-$3K MRR
- Status: Good momentum

**By September 15 (discount ends):**
- Have: 6-10 customers
- Revenue: $2.5K-$5K MRR (all on discount)
- Key: No churn (they're locked in!)

**By October 1 (first full-price month):**
- Have: 6-10 customers (all paying full price now)
- Revenue: $4K-$8K MRR 🚀 (automatic 2x increase!)
- Key: Lock in more customers while discount still active

**By December 31:**
- Target: 12-15 customers
- Revenue: $8K-$12K MRR (all at full price)
- Status: Consistent revenue base built

---

## ✅ IMPLEMENTATION CHECKLIST

- [ ] Database schema: Add `region`, `discount_expires_at`, `months_remaining_at_discount`
- [ ] Stripe: Create 2 products (Canada + USA) with 2 prices each
- [ ] API: Build `/api/billing/start-subscription` endpoint
- [ ] API: Build webhook to auto-upgrade subscription after 3 months
- [ ] Frontend: Region selector at signup
- [ ] Frontend: Pricing display shows correct price + "3 months" messaging
- [ ] Frontend: Billing dashboard shows discount countdown
- [ ] Emails: Create all 6 email templates
- [ ] Emails: Schedule automated sends (day 1, month 2, month 3, 20 days before, month 4, failure)
- [ ] Legal: Update TOS with auto-renewal terms
- [ ] Testing: Test subscription lifecycle (signup → month 1 → month 2 → month 3 → auto-upgrade → month 4)

---

## 🚀 STATUS

✅ **Pricing: LOCKED**
   - Canada: $249.50 (3 months) → $499 (ongoing)
   - USA: $499.50 (3 months) → $999 (ongoing)

✅ **Strategy: LOCKED**
   - 3 months at 50% off, then full price
   - Auto-renews at full price on month 4
   - No trial option

✅ **Timeline: LOCKED**
   - Launch: June 15
   - Goal: $3K+ MRR by September (when discount ends + price jumps)

✅ **Documentation: COMPLETE**
   - 6 email templates (ready to use)
   - Implementation checklist
   - Revenue projections

**Ready to build!**
