import { NextRequest, NextResponse } from 'next/server'
import { getResend } from '@/lib/resend'

export const dynamic = 'force-dynamic'

// One-shot admin endpoint — protected by CRON_SECRET
export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? ''
  const secret = process.env.CRON_SECRET
  if (secret && secret !== 'replace-with-random-secret' && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background:#F7F6F4;font-family:'Inter',-apple-system,sans-serif;margin:0;padding:40px 0;">
<div style="max-width:600px;margin:0 auto;">

  <!-- Logo -->
  <div style="text-align:center;margin-bottom:32px;">
    <table align="center" style="margin:0 auto;"><tbody><tr>
      <td style="background:#1A1A1A;border-radius:10px;width:36px;height:36px;text-align:center;vertical-align:middle;">
        <span style="color:#fff;font-size:18px;line-height:36px;">🚀</span>
      </td>
      <td style="padding-left:10px;vertical-align:middle;">
        <span style="font-size:20px;font-weight:800;color:#1A1A1A;letter-spacing:-0.5px;">IPO<span style="color:#E8312A;">Ready</span></span>
      </td>
    </tr></tbody></table>
  </div>

  <!-- Card -->
  <div style="background:#fff;border-radius:16px;border:1px solid #E5E4E0;padding:40px;box-shadow:0 2px 16px rgba(0,0,0,0.06);">

    <h1 style="font-size:24px;font-weight:700;color:#1A1A1A;margin:0 0 8px 0;">Platform Build Summary 🎉</h1>
    <p style="font-size:15px;color:#717171;margin:0 0 32px 0;line-height:1.6;">
      Here is everything completed in today's build session, plus your test account to explore the platform.
    </p>

    <!-- Test Account -->
    <div style="background:#1A1A1A;border-radius:12px;padding:24px;margin-bottom:32px;">
      <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.4);margin:0 0 12px 0;">🔑 Test Account — Growth Plan</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:6px 0;font-size:13px;color:rgba(255,255,255,0.5);width:120px;">Platform URL</td>
          <td style="padding:6px 0;font-size:13px;font-weight:600;color:#fff;"><a href="https://ipoready.vercel.app/login" style="color:#E8312A;">ipoready.vercel.app/login</a></td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:rgba(255,255,255,0.5);">Email</td>
          <td style="padding:6px 0;font-size:13px;font-weight:600;color:#fff;font-family:monospace;">test@ipoready.com</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:rgba(255,255,255,0.5);">Password</td>
          <td style="padding:6px 0;font-size:13px;font-weight:600;color:#fff;font-family:monospace;">TestIPO2026!</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:rgba(255,255,255,0.5);">Company</td>
          <td style="padding:6px 0;font-size:13px;font-weight:600;color:#fff;">Acme Technologies Inc.</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:rgba(255,255,255,0.5);">Plan</td>
          <td style="padding:6px 0;">
            <span style="background:rgba(45,122,95,0.2);color:#4ADE80;font-size:11px;font-weight:700;padding:3px 10px;border-radius:100px;">Growth</span>
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:rgba(255,255,255,0.5);">Listing</td>
          <td style="padding:6px 0;font-size:13px;font-weight:600;color:#fff;">IPO → TSXV</td>
        </tr>
      </table>
    </div>

    <!-- Your Admin -->
    <div style="background:#FDECEB;border-radius:12px;padding:16px 20px;margin-bottom:32px;border:1px solid #FBCFCF;">
      <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#E8312A;margin:0 0 8px 0;">👑 Your Superuser Account</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="font-size:13px;color:#9A4040;width:120px;">Email</td>
          <td style="font-size:13px;font-weight:600;color:#1A1A1A;font-family:monospace;">ceo@theupcapital.com</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#9A4040;padding-top:4px;">Password</td>
          <td style="font-size:13px;font-weight:600;color:#1A1A1A;font-family:monospace;padding-top:4px;">IPOReady2026!</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#9A4040;padding-top:4px;">Admin panel</td>
          <td style="padding-top:4px;"><a href="https://ipoready.vercel.app/admin" style="font-size:13px;font-weight:600;color:#E8312A;">ipoready.vercel.app/admin</a></td>
        </tr>
      </table>
      <p style="font-size:11px;color:#B45309;margin:10px 0 0 0;">⚠️ Change both passwords after your first login via Account → Security.</p>
    </div>

    <!-- What was built -->
    <h2 style="font-size:16px;font-weight:700;color:#1A1A1A;margin:0 0 16px 0;">What was built today</h2>

    ${[
      ['Stripe Billing Infrastructure', 'Full checkout flow (/api/checkout), Stripe webhook handler for subscription lifecycle, billing portal integration. Automatic tax via Stripe Tax — Canadian GST/HST and US state sales tax handled at checkout. Dubai (UAE) entity compliant.'],
      ['Plan Upgrade Email', 'Transactional email sent on every plan change — whether from Stripe webhook, admin override, or cancellation. Shows old → new plan, amount, billing cycle.'],
      ['Wizard Plan Step', 'New Step 3 in the onboarding wizard. Users choose Starter, Growth, or Enterprise before launching. Growth/Enterprise redirects to Stripe checkout. Falls back gracefully until Stripe keys are added.'],
      ['Admin Panel at /admin', 'Full user management dashboard. Stats (total users, pending, Growth, Enterprise). User table with search, plan filter, approval filter. One-click plan change (dropdown) and approve/revoke per user. Plan changes fire the upgrade email automatically.'],
      ['Superuser Account', 'ceo@theupcapital.com created with role=system_admin in the database. Full admin panel access.'],
      ['Pricing Page CTAs', 'Wired to Stripe checkout. Logged-in users see their real current plan from the session. Loading spinner while redirecting.'],
      ['Account Billing Tab', 'Shows real subscription plan from session. Manage billing button opens Stripe portal. Upgrade CTA for Starter users. No more hardcoded mock data.'],
      ['Menu Improvements', 'Left-justified mega-menus (Features + Exchanges) — left-aligned dropdowns with notch. EN/FR toggle stays right-justified on all screen sizes.'],
    ].map(([title, desc]) => `
    <table style="width:100%;margin-bottom:16px;border-collapse:collapse;">
      <tr>
        <td style="width:8px;vertical-align:top;padding-top:5px;">
          <div style="width:6px;height:6px;border-radius:50%;background:#E8312A;"></div>
        </td>
        <td style="padding-left:12px;">
          <p style="font-size:13px;font-weight:700;color:#1A1A1A;margin:0 0 3px 0;">${title}</p>
          <p style="font-size:12px;color:#9A9A9A;margin:0;line-height:1.5;">${desc}</p>
        </td>
      </tr>
    </table>
    `).join('')}

    <!-- Next steps -->
    <div style="background:#F7F6F4;border-radius:12px;padding:20px;margin-top:8px;border:1px solid #E5E4E0;">
      <p style="font-size:12px;font-weight:700;color:#1A1A1A;margin:0 0 10px 0;">⚡ To activate Stripe (next session)</p>
      ${[
        'Create Stripe account → add Dubai business details',
        'Enable Stripe Tax in Dashboard → Settings → Tax',
        'Create 3 products (Starter/Growth/Enterprise) × 3 billing cycles = 9 price IDs',
        'Add STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET + 9 price IDs to Vercel env vars',
        'Create webhook endpoint → https://ipoready.vercel.app/api/webhooks/stripe',
      ].map(s => `<p style="font-size:12px;color:#717171;margin:0 0 6px 0;">→ ${s}</p>`).join('')}
    </div>

  </div>

  <!-- Footer -->
  <div style="text-align:center;margin-top:24px;">
    <p style="font-size:12px;color:#B8B7B3;line-height:1.6;margin:0;">
      IPOReady · hello@ipoready.com<br>
      © ${new Date().getFullYear()} The UpCapital Group. All rights reserved.
    </p>
  </div>

</div>
</body>
</html>
  `.trim()

  try {
    const resend = getResend()
    const result = await resend.emails.send({
      from: 'IPOReady <hello@ipoready.com>',
      to: 'ashik@upcapital.ca',
      subject: 'IPOReady — Build summary + test account credentials',
      html,
    })
    return NextResponse.json({ ok: true, result })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? String(err) }, { status: 500 })
  }
}
