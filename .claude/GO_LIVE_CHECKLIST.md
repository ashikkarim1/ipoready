# IPOReady June 15th Go-Live Checklist
## Paid Tier Launch: $99/month Trial Offer

**Launch Date:** June 15, 2026 (8 days from now)  
**Trial Price:** $99/month (first month only)  
**Target Audience:** Professional + Enterprise tier customers  
**Success Criteria:** First paid customer onboarded by June 15th

---

## 🔴 CRITICAL PATH (Must Complete)

### 1. BILLING & STRIPE INTEGRATION (OWNER: Finance/Dev)
- [ ] **Stripe Account Setup** (if not done)
  - [ ] Connect Stripe API keys to Vercel env vars
  - [ ] Configure webhook endpoints for payment events
  - [ ] Set up Stripe product/pricing structure
  
- [ ] **Trial Logic** 
  - [ ] Create $99 one-time trial charge in Stripe
  - [ ] Auto-downgrade to $0 after trial month ends
  - [ ] Send "trial ending" email 3 days before expiration
  - [ ] Handle failed payment retry + notification
  
- [ ] **Billing Database**
  - [ ] Verify `billing_history` table schema
  - [ ] Add `trial_started_at`, `trial_ends_at` columns (if missing)
  - [ ] Add `subscription_status` tracking (active/expired/cancelled)
  - [ ] Add `payment_method_id` for stored cards

- [ ] **Subscription API Routes** (OWNED BY: Backend)
  - [ ] `POST /api/billing/start-trial` — Initiate $99 charge
  - [ ] `POST /api/billing/update-payment-method` — Save card for next month
  - [ ] `GET /api/billing/current-subscription` — Get active subscription
  - [ ] `POST /api/billing/cancel-subscription` — Handle cancellations
  - [ ] `POST /api/billing/webhooks` — Handle Stripe events (payment.succeeded, invoice.payment_failed, etc.)

- [ ] **Payment UI Components**
  - [ ] Stripe Elements integration (card input form)
  - [ ] Loading states + error handling
  - [ ] "Billing updated successfully" confirmation
  - [ ] PCI compliance: never send card data to backend (Stripe tokens only)

---

### 2. ONBOARDING FLOW FOR PAID TIERS (OWNER: Product/Frontend)

- [ ] **Signup → Trial Offer Upsell**
  - [ ] After free signup, show "Upgrade to Professional for $99/month trial"
  - [ ] CTA button: "Start Your Trial"
  - [ ] Clear disclaimer: "Trial ends in 30 days. Then $X/month unless cancelled."
  
- [ ] **Payment Modal / Page**
  - [ ] Card input form (Stripe Elements)
  - [ ] Billing address (optional but recommended)
  - [ ] Confirm order summary (Starter: free → Professional: $99 trial)
  - [ ] "Agree to terms" checkbox
  - [ ] Loading spinner during payment processing
  
- [ ] **Post-Payment Success**
  - [ ] Redirect to dashboard
  - [ ] Show "Welcome to Professional! Your trial is active." banner
  - [ ] Unlock Professional features immediately
  - [ ] Send confirmation email with receipt

- [ ] **Failed Payment Handling**
  - [ ] Show error message (e.g., "Card declined. Please try another payment method.")
  - [ ] Allow retry without losing form data
  - [ ] Send follow-up email with recovery link

---

### 3. FEATURE GATING BY TIER (OWNER: Frontend/Product)

**Current Tiers:**
- **Starter (Free)**: Cap table, basic checklists
- **Professional ($99 trial, then $X/month)**: Market Advantage, Investor Match, Filing Systems
- **Enterprise ($X/month)**: All + White Label + API + Dedicated Support

- [ ] **Implement Tier Check Middleware**
  - [ ] Create `useSubscriptionTier()` hook to get user's tier
  - [ ] Wrap protected features in `<ProfessionalFeature>` component
  - [ ] Show "Upgrade required" modal for locked features
  - [ ] Link to `/upgrade` or `/billing` from locked features

- [ ] **Professional-Tier Features to Unlock**
  - [ ] ✅ Market Advantage (Pre-IPO Intelligence)
  - [ ] ✅ Investor Match (CRM + Outreach)
  - [ ] ✅ Listed Services (Post-IPO Compliance)
  - [ ] ✅ Multi-Country Filing (when ready)
  - [ ] ⏸️ Prospectus Auto-Builder (phase 2 - if ready, unlock; else gray out)

- [ ] **Starter Features Remain Free**
  - [ ] Cap table
  - [ ] Checklists (IPO timeline, milestones)
  - [ ] Document library
  - [ ] Team management (basic)

- [ ] **Enterprise Features (Locked Until Enterprise Purchase)**
  - [ ] Custom branding / white-label
  - [ ] API access
  - [ ] Dedicated Slack support channel
  - [ ] Priority feature requests

---

### 4. PAYMENT PROCESSING & COMPLIANCE (OWNER: Security/Dev)

- [ ] **PCI DSS Compliance Check**
  - [ ] Never store raw card data on servers
  - [ ] Use Stripe.js for all card handling
  - [ ] Use Stripe webhooks for sensitive events (don't poll)
  - [ ] Add HTTPS everywhere (should already be done)
  - [ ] Log payment events but NOT card details

- [ ] **Stripe Security**
  - [ ] Webhook signature verification: validate `X-Stripe-Signature` header
  - [ ] Store only Stripe `customer_id` and `payment_method_id` in DB
  - [ ] Set up Stripe API version locking to avoid breaking changes
  - [ ] Test with Stripe test keys first, then live keys

- [ ] **Error Logging & Monitoring**
  - [ ] Log all Stripe API calls (for debugging)
  - [ ] Set up alerts for failed payments (email to support@)
  - [ ] Monitor webhook delivery: if payment webhook fails, retry emails sent
  - [ ] Dashboard: show payment history + receipt downloads

---

### 5. CUSTOMER NOTIFICATIONS (OWNER: Marketing/Email)

- [ ] **Email Templates**
  - [ ] Welcome email (post-signup, pre-payment)
  - [ ] Trial started confirmation + receipt
  - [ ] Trial ending in 7 days warning
  - [ ] Trial ending in 3 days reminder
  - [ ] Trial expired → subscription active (auto-charged)
  - [ ] Payment failed notification + retry link
  - [ ] Subscription cancelled confirmation
  - [ ] Invoice / receipt (auto-generated from Stripe)

- [ ] **In-App Notifications**
  - [ ] Trial days remaining (banner on dashboard)
  - [ ] Payment method expiring soon (e.g., card expires in 30 days)
  - [ ] Subscription about to renew (email + in-app)
  - [ ] Subscription cancelled (locked features notification)

---

### 6. ACCOUNT MANAGEMENT UI (OWNER: Frontend)

**New Page: `/dashboard/billing` or `/account/subscription`**

- [ ] **Subscription Status Card**
  - [ ] Current plan (Starter / Professional / Enterprise)
  - [ ] Status (Active trial / Active subscription / Cancelled)
  - [ ] Days remaining in trial (if applicable)
  - [ ] Next billing date
  - [ ] Monthly cost (when trial ends)

- [ ] **Payment Method Management**
  - [ ] Display last 4 digits of card, expiration date
  - [ ] "Update payment method" button
  - [ ] "Remove payment method" (only if backup exists)
  - [ ] Auto-delete expired cards from Stripe

- [ ] **Billing History**
  - [ ] Table: Date | Amount | Status | Receipt download
  - [ ] Filter by: All / Paid / Failed / Pending
  - [ ] Download PDF receipt / invoice

- [ ] **Subscription Actions**
  - [ ] "Upgrade to Enterprise" button (if on Professional)
  - [ ] "Cancel subscription" button (with exit survey)
  - [ ] "Reactivate subscription" if cancelled (within grace period?)

---

### 7. ANALYTICS & MONITORING (OWNER: Product/Analytics)

- [ ] **Track Conversion Metrics**
  - [ ] Free signup → trial offer shown (% of signups)
  - [ ] Trial offer shown → payment started (% conversion to payment page)
  - [ ] Payment started → payment completed (% success rate)
  - [ ] Failed payments → retry success rate
  - [ ] Trial completed → auto-charged (% of trials that convert)

- [ ] **Stripe Dashboard Monitoring**
  - [ ] Daily revenue report
  - [ ] Failed payment rate
  - [ ] Customer churn (cancellations)
  - [ ] Failed webhooks (re-trigger if needed)

- [ ] **Set Up Alerts**
  - [ ] Alert if failed payment rate > 5%
  - [ ] Alert if webhook delivery fails
  - [ ] Alert if unusual payment volume (fraud detection)

---

## 🟡 SUPPORTING TASKS (Important but not blocking)

### 8. MARKETING & LAUNCH MESSAGING (OWNER: Marketing)

- [ ] **Pricing Page Update**
  - [ ] Professional: "$99/month first month, then $X/month"
  - [ ] Enterprise: "Custom pricing + dedicated support"
  - [ ] Feature comparison table: Starter vs Professional vs Enterprise
  - [ ] FAQ: "How much does it cost after the trial?" etc.

- [ ] **Landing Page Banner**
  - [ ] "Launch offer: Professional trial for $99/month. Ends June 30."
  - [ ] Link to signup/upgrade page

- [ ] **First Customer Outreach**
  - [ ] Email to waitlist: "IPOReady Professional is now available"
  - [ ] LinkedIn post: Launch announcement
  - [ ] Personal outreach to pilot companies (offer trial)

- [ ] **Help Center / Knowledge Base**
  - [ ] "How to upgrade to Professional"
  - [ ] "What's included in each plan?"
  - [ ] "How do I cancel my subscription?"
  - [ ] "What happens when my trial ends?"

---

### 9. LEGAL & TERMS (OWNER: Legal)

- [ ] **Terms of Service Update**
  - [ ] Add billing terms section
  - [ ] Clarify auto-renewal (trial → subscription)
  - [ ] Cancellation policy
  - [ ] Refund policy (if any)

- [ ] **Privacy Policy**
  - [ ] Stripe payment processing disclosure
  - [ ] Data retention for billing records (7 years for tax)

- [ ] **Trial Terms Disclosure**
  - [ ] "Trial lasts 30 days from [start date]"
  - [ ] "Auto-renews unless cancelled before [end date]"
  - [ ] Clear cancellation instructions

---

### 10. CUSTOMER SUPPORT PREP (OWNER: Support)

- [ ] **Support Team Training**
  - [ ] How to handle refund requests
  - [ ] How to cancel a subscription
  - [ ] How to manually credit an account
  - [ ] How to check Stripe dashboard for payment history
  - [ ] Escalation: Stripe disputes, fraud, etc.

- [ ] **Support Documentation**
  - [ ] Runbook: "Customer wants refund"
  - [ ] Runbook: "Customer didn't receive invoice"
  - [ ] Runbook: "Card declined, customer frustrated"

- [ ] **Support Inbox Setup**
  - [ ] Create billing@ipoready.com (or support@)
  - [ ] Set up auto-replies for billing questions
  - [ ] Create support ticket template for billing issues

---

### 11. TESTING & QA (OWNER: QA/Dev)

- [ ] **Payment Flow Testing (with Stripe test keys)**
  - [ ] Test successful payment ($99 charge)
  - [ ] Test failed payment (use test card 4000000000000002)
  - [ ] Test declined payment (card 4000000000000069)
  - [ ] Test webhook delivery (manually trigger via Stripe dashboard)
  - [ ] Test email notifications (check that emails send)
  - [ ] Test tier gating (Professional feature locked on Starter account)

- [ ] **Edge Cases**
  - [ ] Test refund flow (cancel subscription, is refund issued?)
  - [ ] Test payment retry (if first payment fails, does it retry?)
  - [ ] Test account downgrade (trial → free, are features locked?)
  - [ ] Test 30-day trial countdown (accurate date calculations)
  - [ ] Test timezone handling (what if customer in Tokyo, charge time in UTC?)

- [ ] **Database Testing**
  - [ ] Verify billing_history records created
  - [ ] Verify subscription_status updated
  - [ ] Verify no orphaned records
  - [ ] Test data integrity with 100 trial charges

- [ ] **Mobile & Browser Testing**
  - [ ] Payment form on mobile (responsive)
  - [ ] Payment form on Safari/Chrome/Firefox
  - [ ] Test on slow network (3G) — loading states

---

### 12. DEPLOYMENT & INFRASTRUCTURE (OWNER: DevOps)

- [ ] **Environment Variables**
  - [ ] `STRIPE_PUBLIC_KEY` (publishable key)
  - [ ] `STRIPE_SECRET_KEY` (secret key — never expose!)
  - [ ] `STRIPE_WEBHOOK_SECRET` (webhook signing secret)
  - [ ] All set in Vercel + local .env.local for testing

- [ ] **Webhook Endpoint**
  - [ ] Deploy `/api/billing/webhooks` endpoint
  - [ ] Whitelist Stripe IP ranges (if applicable)
  - [ ] Test endpoint responds with 200 OK
  - [ ] Configure webhook events in Stripe dashboard:
    - [ ] `payment_intent.succeeded`
    - [ ] `payment_intent.payment_failed`
    - [ ] `customer.subscription.updated`
    - [ ] `customer.subscription.deleted`
    - [ ] `invoice.payment_succeeded`
    - [ ] `invoice.payment_failed`

- [ ] **Database Migrations**
  - [ ] Create/verify `billing_history` table
  - [ ] Add indices on `user_id`, `created_at` for fast queries
  - [ ] Verify schema matches payment processing code

- [ ] **Staging Environment**
  - [ ] Deploy to staging with test Stripe keys
  - [ ] Run full payment flow on staging
  - [ ] Verify emails send in staging (to test email address)
  - [ ] Get approval from stakeholders before prod push

- [ ] **Production Rollout**
  - [ ] Switch to live Stripe keys
  - [ ] Monitor logs for first 24 hours
  - [ ] Have incident response plan ready
  - [ ] On-call engineer available June 15-20

---

## 📋 DAY-BY-DAY EXECUTION PLAN

### **June 7 (Today) - Setup & Foundation**
- [ ] Stripe account fully configured
- [ ] All API keys in env vars
- [ ] Database schema verified / migrated
- [ ] Billing routes stubbed out (`/api/billing/*`)

### **June 8-9 (Sunday-Monday) - Backend Development**
- [ ] Implement `/api/billing/start-trial` endpoint
- [ ] Implement `/api/billing/webhooks` endpoint
- [ ] Implement subscription status tracking in DB
- [ ] Test with Stripe test keys
- [ ] Start email template creation

### **June 10-11 (Tuesday-Wednesday) - Frontend Development**
- [ ] Build payment modal (Stripe Elements)
- [ ] Build tier gating components
- [ ] Build billing dashboard page
- [ ] Implement trial countdown logic
- [ ] Create "upgrade required" modals

### **June 12 (Thursday) - Integration & Testing**
- [ ] Connect frontend to backend
- [ ] Full end-to-end testing (signup → payment → feature unlock)
- [ ] Test email notifications
- [ ] Test failed payment flows
- [ ] QA sign-off

### **June 13 (Friday) - Staging Validation**
- [ ] Deploy to staging with test Stripe keys
- [ ] Full regression testing
- [ ] Stakeholder review & approval
- [ ] Customer support training

### **June 14 (Saturday) - Final Prep**
- [ ] Switch to live Stripe keys in prod (careful!)
- [ ] Final monitoring setup
- [ ] On-call rotation confirmed
- [ ] Marketing materials ready
- [ ] First customer outreach ready to send

### **June 15 (Sunday) - LAUNCH DAY**
- [ ] Announce trial offer publicly
- [ ] Send outreach to waitlist
- [ ] Monitor first payments
- [ ] Support team on standby
- [ ] Close first paying customer! 🎉

---

## 💰 PRICING DECISION (TO BE CONFIRMED)

**Current assumption:**
- Starter: **Free**
- Professional: **$99 trial first month, then $X/month** ← Need to decide
- Enterprise: **Custom** ← Need to decide

**Questions to answer:**
1. What is the post-trial price for Professional? ($999/mo? $2,999/mo? $5,000/mo?)
2. What is the Enterprise pricing? (contact sales? $X/mo?)
3. Do we offer annual discounts? (e.g., 20% off if paid annually)
4. Are there add-ons? (e.g., "API access: +$500/mo")

---

## 🎯 SUCCESS METRICS (June 15-30)

- [ ] At least 1 paid customer onboarded
- [ ] $0 failed payments from our side (all failures are customer's card)
- [ ] <2 hour response time for support questions
- [ ] All email notifications sent correctly
- [ ] No security/PCI violations
- [ ] Stripe dashboard shows clean transaction history

---

## 📞 ESCALATION CONTACTS

- **Billing Issue:** support@ipoready.com
- **Payment Failed:** engineering@ipoready.com
- **Stripe Technical:** Stripe support dashboard
- **Legal/Compliance:** [CEO/COO]
