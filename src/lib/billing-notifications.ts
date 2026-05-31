import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPaymentFailureEmail(
  userEmail: string,
  companyName: string
) {
  try {
    const result = await resend.emails.send({
      from: "billing@ipoready.ai",
      to: userEmail,
      subject: `Payment Failed - Update Your Billing Method`,
      html: `
        <h1>Payment Failed</h1>
        <p>Hi,</p>
        <p>We were unable to process a payment for your ${companyName} IPOReady subscription.</p>
        <p>Please update your payment method to continue using IPOReady:</p>
        <p><a href="https://app.ipoready.ai/settings/billing">Update Payment Method</a></p>
        <p>If you have questions, please contact support@ipoready.ai</p>
      `,
    });

    console.log("Payment failure email sent:", result);
    return result;
  } catch (error) {
    console.error("Failed to send payment failure email:", error);
    throw error;
  }
}

export async function sendSubscriptionRenewalEmail(
  userEmail: string,
  companyName: string,
  plan: string,
  amount: number
) {
  try {
    const result = await resend.emails.send({
      from: "billing@ipoready.ai",
      to: userEmail,
      subject: `Your IPOReady Subscription to ${plan} has been renewed`,
      html: `
        <h1>Subscription Renewed</h1>
        <p>Hi,</p>
        <p>Your subscription for ${companyName} has been successfully renewed.</p>
        <p><strong>Plan:</strong> ${plan}</p>
        <p><strong>Amount:</strong> $${(amount / 100).toFixed(2)}</p>
        <p>Thank you for using IPOReady!</p>
        <p>Have questions? Contact support@ipoready.ai</p>
      `,
    });

    console.log("Renewal email sent:", result);
    return result;
  } catch (error) {
    console.error("Failed to send renewal email:", error);
    throw error;
  }
}

export async function sendSubscriptionCancelledEmail(
  userEmail: string,
  companyName: string
) {
  try {
    const result = await resend.emails.send({
      from: "billing@ipoready.ai",
      to: userEmail,
      subject: `Your IPOReady Subscription has been Cancelled`,
      html: `
        <h1>Subscription Cancelled</h1>
        <p>Hi,</p>
        <p>Your IPOReady subscription for ${companyName} has been cancelled.</p>
        <p>You will lose access to premium features at the end of your current billing period.</p>
        <p>If this was a mistake, you can reactivate your subscription anytime:</p>
        <p><a href="https://app.ipoready.ai/settings/billing">Reactivate Subscription</a></p>
        <p>We'd love to hear your feedback. Contact support@ipoready.ai</p>
      `,
    });

    console.log("Cancellation email sent:", result);
    return result;
  } catch (error) {
    console.error("Failed to send cancellation email:", error);
    throw error;
  }
}

export async function sendTrialExpiryEmail(
  userEmail: string,
  companyName: string,
  daysRemaining: number
) {
  try {
    const result = await resend.emails.send({
      from: "billing@ipoready.ai",
      to: userEmail,
      subject: `Your IPOReady Trial Expires in ${daysRemaining} Days`,
      html: `
        <h1>Your Trial is Expiring</h1>
        <p>Hi,</p>
        <p>Your IPOReady trial for ${companyName} will expire in ${daysRemaining} days.</p>
        <p>Upgrade to a paid plan to keep using all IPOReady features:</p>
        <p><a href="https://app.ipoready.ai/settings/billing">Upgrade Now</a></p>
        <p>Have questions? Contact support@ipoready.ai</p>
      `,
    });

    console.log("Trial expiry email sent:", result);
    return result;
  } catch (error) {
    console.error("Failed to send trial expiry email:", error);
    throw error;
  }
}

export async function sendTrialUpgradeEmail(
  userEmail: string,
  companyName: string,
  plan: string
) {
  try {
    const result = await resend.emails.send({
      from: "billing@ipoready.ai",
      to: userEmail,
      subject: `Welcome to IPOReady ${plan} Plan!`,
      html: `
        <h1>Upgrade Successful</h1>
        <p>Hi,</p>
        <p>Thank you for upgrading to the ${plan} plan!</p>
        <p>Your IPOReady account for ${companyName} now has access to all premium features.</p>
        <p>Get started:</p>
        <p><a href="https://app.ipoready.ai/dashboard">Go to Dashboard</a></p>
        <p>Need help? Contact support@ipoready.ai</p>
      `,
    });

    console.log("Trial upgrade email sent:", result);
    return result;
  } catch (error) {
    console.error("Failed to send trial upgrade email:", error);
    throw error;
  }
}

export async function sendTrialExpiredEmail(
  userEmail: string,
  companyName: string
) {
  try {
    const result = await resend.emails.send({
      from: "billing@ipoready.ai",
      to: userEmail,
      subject: `Your IPOReady Trial Has Expired - Upgrade Now`,
      html: `
        <h1>Trial Expired</h1>
        <p>Hi,</p>
        <p>Your IPOReady trial for ${companyName} has expired.</p>
        <p>Your trial data remains safe and will be preserved when you upgrade.</p>
        <p><strong>Upgrade to continue:</strong></p>
        <ul>
          <li><strong>Starter Plan:</strong> $99/month - Perfect for early-stage companies</li>
          <li><strong>Growth Plan:</strong> $299/month - For scaling teams</li>
          <li><strong>Enterprise Plan:</strong> Custom pricing - For established companies</li>
        </ul>
        <p><a href="https://app.ipoready.ai/account?tab=billing">Choose Your Plan & Upgrade</a></p>
        <p>Questions? Our team is here to help:</p>
        <p>
          📧 support@ipoready.ai<br>
          📞 +1-416-555-0123<br>
          🌐 https://ipoready.ai/support
        </p>
      `,
    });

    console.log("Trial expired email sent:", result);
    return result;
  } catch (error) {
    console.error("Failed to send trial expired email:", error);
    throw error;
  }
}

export async function sendTrialExpiryReminder(
  userEmail: string,
  companyName: string,
  daysRemaining: number = 1
) {
  try {
    const result = await resend.emails.send({
      from: "billing@ipoready.ai",
      to: userEmail,
      subject: `Your IPOReady Trial Expires in ${daysRemaining} Day${daysRemaining > 1 ? 's' : ''}`,
      html: `
        <h1>Trial Expiring Soon</h1>
        <p>Hi,</p>
        <p>Your IPOReady trial for ${companyName} expires in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}.</p>
        <p>All your cap table data will remain safe, and you can continue using it after upgrading to a paid plan.</p>
        <p><strong>Upgrade now to keep analyzing:</strong></p>
        <ul>
          <li><strong>Starter Plan:</strong> $99/month - View, edit, 3x scenarios, CSV import</li>
          <li><strong>Growth Plan:</strong> $299/month - Unlimited scenarios, integrations, investor portal</li>
          <li><strong>Enterprise Plan:</strong> Custom pricing - Everything + API access</li>
        </ul>
        <p><a href="https://app.ipoready.ai/account?tab=billing">Upgrade Now</a></p>
        <p>Have questions? We're here to help: support@ipoready.ai</p>
      `,
    });

    console.log("Trial expiry reminder email sent:", result);
    return result;
  } catch (error) {
    console.error("Failed to send trial expiry reminder email:", error);
    throw error;
  }
}

export async function sendSubscriptionConfirmation(
  userEmail: string,
  companyName: string,
  planTier: string,
  nextBillingDate: string
) {
  try {
    const planNames: Record<string, string> = {
      starter: "Starter",
      growth: "Growth",
      enterprise: "Enterprise",
    };

    const planDescriptions: Record<string, string> = {
      starter: "View, edit, 3x scenarios, CSV import",
      growth: "Unlimited scenarios, integrations, investor portal",
      enterprise: "Everything + API access + dedicated support",
    };

    const result = await resend.emails.send({
      from: "billing@ipoready.ai",
      to: userEmail,
      subject: `Welcome to IPOReady ${planNames[planTier]}!`,
      html: `
        <h1>Subscription Confirmed</h1>
        <p>Hi,</p>
        <p>Your upgrade to the <strong>${planNames[planTier]}</strong> plan is confirmed!</p>
        <p><strong>Plan Details:</strong></p>
        <ul>
          <li>Plan: ${planNames[planTier]} ($${planTier === 'starter' ? '99' : planTier === 'growth' ? '299' : 'contact sales'}/month)</li>
          <li>Company: ${companyName}</li>
          <li>Next Billing Date: ${nextBillingDate}</li>
          <li>Features: ${planDescriptions[planTier]}</li>
        </ul>
        <p>You now have full access to all ${planNames[planTier]} features. Get started:</p>
        <p><a href="https://app.ipoready.ai/dashboard">Go to Dashboard</a></p>
        <p>Questions or need help? Contact support@ipoready.ai</p>
      `,
    });

    console.log("Subscription confirmation email sent:", result);
    return result;
  } catch (error) {
    console.error("Failed to send subscription confirmation email:", error);
    throw error;
  }
}

export async function sendAutoUpgradeNotice(
  userEmail: string,
  companyName: string,
  planTier: string,
  billingDate: string
) {
  try {
    const planNames: Record<string, string> = {
      starter: "Starter",
      growth: "Growth",
      enterprise: "Enterprise",
    };

    const planPrices: Record<string, string> = {
      starter: "$99",
      growth: "$299",
      enterprise: "contact sales",
    };

    const result = await resend.emails.send({
      from: "billing@ipoready.ai",
      to: userEmail,
      subject: `Your Trial Ended - Auto-Upgrade to ${planNames[planTier]}`,
      html: `
        <h1>Trial Complete & Auto-Upgrade Applied</h1>
        <p>Hi,</p>
        <p>Your 14-day IPOReady trial for ${companyName} has ended.</p>
        <p>Since you had a payment method on file, we've automatically upgraded you to the <strong>${planNames[planTier]}</strong> plan to keep your access uninterrupted.</p>
        <p><strong>Next Steps:</strong></p>
        <ul>
          <li>Plan: ${planNames[planTier]} (${planPrices[planTier]}/month)</li>
          <li>Your card will be charged on: ${billingDate}</li>
          <li>All your cap table data is preserved and ready to use</li>
        </ul>
        <p>If you'd like to change your plan or cancel, you can manage your subscription anytime:</p>
        <p><a href="https://app.ipoready.ai/account?tab=billing">Manage Subscription</a></p>
        <p>Need help? Contact support@ipoready.ai</p>
      `,
    });

    console.log("Auto-upgrade notice email sent:", result);
    return result;
  } catch (error) {
    console.error("Failed to send auto-upgrade notice email:", error);
    throw error;
  }
}
