# IPOReady Pricing - FINAL (USD Only)
## June 15, 2026 Launch with Early Discount

---

## 💰 PRICING (LOCKED)

### **PROFESSIONAL TIER**

**🚀 EARLY BIRD OFFER (June 15 - July 15):**
- **First 30 days: $299.50/month** (50% off)
- Auto-renews at regular price on day 31

**📅 REGULAR PRICING (After July 15):**
- **$599 USD/month** (ongoing)

**✅ TRIAL OPTION (Still Available):**
- **$99 one-time charge** (first month)
- Auto-renews at regular price ($599) on day 31

---

## 📊 EARLY BIRD OFFER BREAKDOWN

```
June 15 - July 15: LAUNCH MONTH (50% Off)
├─ Option 1: Pay $99 trial
│  └─ Then $599/month starting day 31
│
├─ Option 2: Pay $299.50/month (early bird)
│  └─ Then $599/month starting month 2
│
└─ Which is better for customer?
   - Trial ($99) if they want to test
   - Early bird ($299.50) if they're ready to commit
   - Both get month 1 at ~$99-$300

After July 15: REGULAR PRICING
├─ New trial customers: $99 → $599
└─ New paying customers: $599/month
```

---

## ✅ FEATURES INCLUDED

**Professional Tier ($599/month after trial):**
- ✅ Market Advantage Intelligence (real-time data, what-if scenarios)
- ✅ Investor Match CRM (outreach tracking, email templates)
- ✅ PACE™ Benchmarking (IPO readiness scoring vs peers)
- ✅ Compliance Checklists (pre-IPO requirements)
- ✅ Cap Table + Advanced Analytics
- ✅ Prospectus Auto-Builder (when available)
- ✅ Multi-Country Filing Support (when available)
- ✅ Email support (24-48 hour response)
- ❌ Listed Services (post-IPO compliance - priced separately)
- ❌ API access (Enterprise only)
- ❌ White-label (Enterprise only)

---

## 🎯 CUSTOMER JOURNEY

### **Day 1: Signup**
```
User registers for free Starter tier
↓
"Ready for Professional? Get 50% off your first month!"
↓
Two options:
  A) Pay $99 trial (then $599/month on day 31)
  B) Pay $299.50/month (then $599/month on month 2)
```

### **Day 1-30: First Month**
```
Professional features UNLOCKED
Dashboard banner: "Your early bird pricing ends in X days"
Email (Day 7): "7 days left at 50% off"
Email (Day 27): "3 days left before renewal at $599/month"
```

### **Day 31: Renewal**
```
Charge: $599 USD (regular price)
Email: "Welcome to your full Professional subscription"
Update billing dashboard: Next charge date = 30 days from now
```

### **Month 2+: Recurring**
```
Auto-charge $599 USD on same day each month
Send receipt + invoice
Track in billing history
```

### **Cancellation**
```
Customer clicks "Cancel subscription" on /dashboard/billing
Status: subscription_status = 'cancelled'
Professional features: LOCKED immediately
Refund: None (digital service, non-refundable)
Exit survey: "Why are you leaving?" (optional)
```

---

## 📈 REVENUE MODEL

### **Scenario: Hit $3K/Month by July 31**

```
June 15-30: Launch Phase (16 days)
  Customer 1: Pays $99 trial         = $99
  Customer 2: Pays $299.50 early bird = $299.50
  Customer 3: Pays $99 trial         = $99
  Customer 4: Pays $299.50 early bird = $299.50
  Customer 5: Pays $99 trial         = $99
  ├─ Total June: $897 (trial revenue only)
  └─ All 5 locked in for July at $599/month

July 1-15: Mid-Month (15 days)
  All 5 existing customers renew at $599/month
  ├─ 5 × $599 = $2,995 MRR
  └─ Close to $3K/month! ✅

July 15+: Regular Pricing Phase
  New trial customers: Still $99 → $599
  New early birds: Gone (offer ended)
  New regular customers: $599/month
```

### **By End of 2026 (Conservative)**
```
June (16 days): 5 customers × $99 trial average = $500
July: 5 customers × $599 = $2,995
Aug: 7 customers × $599 = $4,193 (add 2 more)
Sept: 9 customers × $599 = $5,391 (add 2 more)
Oct: 11 customers × $599 = $6,589 (add 2 more)
Nov: 13 customers × $599 = $7,787 (add 2 more)
Dec: 15 customers × $599 = $8,985 (add 2 more)

Total 2026 Revenue: ~$37K (6 months active)
December MRR: $8,985 (close to $10K)
```

---

## 🌍 REGION SIMPLIFICATION

**All pricing in USD only.** No currency conversion.

```
User registration question:
  "Where is your company incorporated?"
  Options: USA / Canada / International

Why?
  - Simplifies Stripe setup (1 product, not 2)
  - Simplifies pricing logic (no CAD logic)
  - Simplifies support (1 price point)
  - Customers handle their own currency conversion
```

---

## 🔗 STRIPE SETUP (SIMPLIFIED)

### **Create 1 Product (Not 3)**

```
Product: Professional
├─ Price 1: $599 USD/month (recurring)
├─ Price 2: $99 USD (one-time trial)
└─ Price 3: $299.50 USD/month (early bird, June 15 - July 15)
```

### **Webhook Events to Listen For**
```
✅ payment_intent.succeeded → Send receipt email
✅ payment_intent.payment_failed → Retry + notify
✅ customer.subscription.updated → Log renewal
✅ customer.subscription.deleted → Lock features
✅ invoice.payment_succeeded → Send invoice
✅ invoice.payment_failed → Retry + notify
```

---

## 📧 EMAIL TEMPLATES

### **Email 1: Trial Started ($99)**
```
Subject: Welcome to IPOReady Professional! 🚀

Hi [Company],

You're in! Your Professional subscription is now active.

💰 Charge: $99 (first month trial)
📅 Next charge: [Date + 30 days] at $599/month
🔓 Features unlocked: Market Advantage, Investor Match, PACE Benchmarking

👉 Next steps:
1. Explore Market Advantage (real-time IPO data)
2. Add your first investors to Investor Match
3. Run your IPO readiness benchmark

Questions? Reply to this email.

Best,
The IPOReady Team
```

### **Email 2: Early Bird 50% Off**
```
Subject: Professional for $299.50/month (50% off, 1 month only)

Hi [Company],

Launch week special: Get Professional at 50% off.

💰 Charge: $299.50 (first month only - that's 50% off!)
📅 Next charge: [Date + 30 days] at $599/month
🔓 Features unlocked: Everything in Professional tier

This offer expires July 15. Early birds decided now lock in savings for month 1.

[Start Early Bird Subscription Button]

Best,
The IPOReady Team
```

### **Email 3: 7 Days Left**
```
Subject: Your Professional trial ends in 7 days

Hi [Company],

Your $99 trial expires on [DATE].

When it expires:
✅ Your subscription auto-renews at $599/month
✅ Professional features stay unlocked
✅ New charge appears on [DATE]

Want to cancel instead? Go to Settings → Billing → Cancel.

Best,
The IPOReady Team
```

### **Email 4: 3 Days Left (Last Chance)**
```
Subject: Last chance: Your Professional trial expires in 3 days

Hi [Company],

Quick reminder: Your trial expires [DATE].

On that day, we'll charge your card $599 for month 2.

If you want to cancel before we charge, click here: [Link]

Otherwise, enjoy Professional!

Best,
The IPOReady Team
```

### **Email 5: Renewal Confirmation**
```
Subject: Your Professional subscription renewed ✅

Hi [Company],

Your monthly subscription renewed today!

💰 Charge: $599 USD
📅 Next charge: [DATE + 30 days]
🔓 Features: Still active

Questions about your invoice? Reply to this email.

Best,
The IPOReady Team
```

### **Email 6: Payment Failed**
```
Subject: Payment failed - Update your card

Hi [Company],

We tried to charge your card for Professional, but it failed.

❌ Error: [Card declined / Expired / etc.]

👉 Fix it now: [Update Payment Method Link]

If you don't update by [DATE + 3 days], we'll lock your Professional features.

Need help? Reply to this email.

Best,
The IPOReady Team
```

---

## 🎯 EARLY BIRD OFFER MECHANICS

### **Date Range:** June 15 - July 15 (30 days exactly)

### **Who Qualifies:**
- Any customer signing up for Professional between June 15-July 15
- Both trial ($99) and early bird ($299.50) are available
- Offer ends July 16 at 00:00 UTC

### **Why 50% Off?**
- Creates urgency ("offer ends soon")
- Attracts decision-makers ("worth locking in now")
- Builds social proof ("early adopters getting savings")
- Sets stage for regular $599 price

### **After Offer Ends:**
- All new customers pay $99 trial → $599/month
- No more 50% discount
- But you can re-run it later (Black Friday, etc.)

---

## 🚀 LAUNCH MESSAGING

### **Homepage Banner**
```
"🚀 LAUNCH SPECIAL: Professional for $299.50/month (50% off)
Get IPO intelligence + investor CRM. Offer ends July 15."
```

### **Email to Waitlist**
```
Subject: IPOReady Professional is live - 50% off for 30 days

Hi [Name],

We're launching Professional today - the only platform that combines
IPO readiness intelligence with investor relationship management.

🎯 What you get:
✅ Market Advantage (real-time IPO data + what-if scenarios)
✅ Investor Match (CRM + personalized outreach templates)
✅ PACE Benchmarking (see how you rank vs peers)

💰 Launch offer: $299.50/month first month (50% off)
Then $599/month. Cancel anytime.

→ [Get Professional Link]

This offer expires July 15.

Best,
The IPOReady Team
```

### **LinkedIn Post**
```
🚀 Excited to announce: IPOReady Professional is live!

For the first time, companies can get real-time IPO readiness intelligence
+ investor relationship management in one platform.

📊 Includes:
• Market Advantage Intelligence (when should you go public?)
• Investor Match CRM (track conversations, personalize outreach)
• PACE™ Benchmarking (how ready are you really?)
• Compliance Checklists (don't miss anything)

Early birds get 50% off through July 15. Link in bio.

#IPO #Startups #FundRaising
```

---

## 💡 WHY THIS PRICING WORKS

**For Customers:**
- $99 trial = low-risk test drive
- $299.50 = feels like a deal (50% off!)
- $599 = still premium, but justified by value

**For Us:**
- $3K/month = only need 5-6 customers by July
- Early birds = social proof ("others are buying!")
- 50% discount = creates urgency (expires July 15)
- Can raise prices later when demand is proven

**For Growth:**
- Easy to scale from 5 customers → 15 customers
- Each new tier = easier to hit higher milestones
- $599 has room to grow ($999+ in 2027)

---

## ✅ IMPLEMENTATION CHECKLIST

- [ ] Update Stripe to 1 product with 3 prices
- [ ] Update database to track subscription price (trial vs early bird vs regular)
- [ ] Update payment form to show correct messaging
- [ ] Update billing dashboard to show renewal date + amount
- [ ] Create all 6 email templates
- [ ] Set up email schedule (Day 1, 7, 27, renewal, failed)
- [ ] Update pricing page to show launch offer
- [ ] Update homepage banner
- [ ] Prepare LinkedIn/email launch messaging
- [ ] Set calendar reminder: July 15 to REMOVE 50% discount

---

## 🎊 STATUS

**Pricing: LOCKED ✅**
**Offer: 50% Off for 30 Days ✅**
**All USD (Simplified) ✅**
**Ready to Build ✅**

Next: Update TODAY_ACTIONS.md with simplified Stripe setup
