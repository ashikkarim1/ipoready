'use client'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl prose prose-lg">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

        <p className="text-gray-600 mb-8">
          <strong>Last Updated:</strong> May 24, 2026
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4">1. Introduction</h2>
        <p>
          IPOReady Inc. ("Company," "we," "us," "our") is committed to protecting your privacy and ensuring you have a positive experience on our website and application ("Services"). This Privacy Policy explains our information practices, what information we collect, how we use it, and your rights regarding that information.
        </p>
        <p>
          This Privacy Policy applies to:
        </p>
        <ul className="list-disc pl-8 my-4">
          <li>Our website (ipoready.com)</li>
          <li>Our web application (app.ipoready.com)</li>
          <li>Mobile applications (iOS/Android)</li>
          <li>All related services and communications</li>
        </ul>

        <h2 className="text-2xl font-bold mt-10 mb-4">2. Jurisdiction & Compliance</h2>
        <p>
          IPOReady complies with:
        </p>
        <ul className="list-disc pl-8 my-4">
          <li><strong>United States:</strong> CCPA (California Consumer Privacy Act), GDPR where applicable</li>
          <li><strong>Canada:</strong> PIPEDA (Personal Information Protection and Electronic Documents Act), PECA (Personal Information Protection Act), and provincial privacy laws</li>
          <li><strong>EU/EEA:</strong> GDPR (General Data Protection Regulation) and ePrivacy Directive</li>
        </ul>

        <h2 className="text-2xl font-bold mt-10 mb-4">3. Information We Collect</h2>

        <h3 className="text-xl font-semibold mt-6 mb-3">3.1 Information You Provide</h3>
        <ul className="list-disc pl-8 my-4">
          <li><strong>Account Registration:</strong> Name, email, phone, company name, role, password</li>
          <li><strong>Company Information:</strong> Funding data, team size, sector, exchange listing targets, financial metrics</li>
          <li><strong>Documents:</strong> Uploaded files (cap tables, financial statements, legal documents)</li>
          <li><strong>Communications:</strong> Messages, support tickets, feedback, survey responses</li>
          <li><strong>Payment Information:</strong> Billing address, subscription plan (credit card processing handled by Stripe)</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3">3.2 Information Collected Automatically</h3>
        <ul className="list-disc pl-8 my-4">
          <li><strong>Device Information:</strong> IP address, browser type, operating system, device type</li>
          <li><strong>Usage Data:</strong> Pages visited, time spent, features used, interactions, error logs</li>
          <li><strong>Cookies & Tracking:</strong> Session cookies, authentication tokens, analytics cookies</li>
          <li><strong>Location Data:</strong> Derived from IP address (not precise location)</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3">3.3 Third-Party Data Sources</h3>
        <ul className="list-disc pl-8 my-4">
          <li>OAuth providers (Google, LinkedIn): Email, name, profile picture</li>
          <li>SEDAR+ / SEDI integrations: Publicly available company filings</li>
          <li>Stripe: Payment and subscription information</li>
        </ul>

        <h2 className="text-2xl font-bold mt-10 mb-4">4. How We Use Your Information</h2>
        <ul className="list-disc pl-8 my-4">
          <li><strong>Service Delivery:</strong> Providing IPO readiness tracking, document management, PACE scoring</li>
          <li><strong>Account Management:</strong> Authentication, account recovery, support</li>
          <li><strong>Communications:</strong> Service updates, billing notifications, feature announcements, support responses</li>
          <li><strong>Analytics & Improvement:</strong> Understanding usage patterns, improving platform features</li>
          <li><strong>Legal Compliance:</strong> Fraud prevention, security, regulatory compliance, legal obligations</li>
          <li><strong>Business Operations:</strong> Billing, revenue recognition, audit trails</li>
        </ul>

        <h2 className="text-2xl font-bold mt-10 mb-4">5. Legal Basis for Processing</h2>
        <p>
          We process your information based on:
        </p>
        <ul className="list-disc pl-8 my-4">
          <li><strong>Contract:</strong> Information needed to provide Services</li>
          <li><strong>Consent:</strong> Optional marketing communications, cookies beyond essential</li>
          <li><strong>Legitimate Interest:</strong> Platform security, fraud prevention, business analytics</li>
          <li><strong>Legal Obligation:</strong> Tax compliance, regulatory filings, law enforcement</li>
        </ul>

        <h2 className="text-2xl font-bold mt-10 mb-4">6. Data Sharing & Disclosure</h2>

        <h3 className="text-xl font-semibold mt-6 mb-3">6.1 We Do NOT Sell Your Data</h3>
        <p>
          IPOReady does not sell, rent, or lease personal information to third parties for marketing purposes.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">6.2 We Share Data With</h3>
        <ul className="list-disc pl-8 my-4">
          <li><strong>Service Providers:</strong> Stripe (payments), Resend (email), Twilio (SMS/WhatsApp), Slack (integrations), hosting providers</li>
          <li><strong>Legal Requirements:</strong> Law enforcement, courts, regulators (with proper legal process)</li>
          <li><strong>Business Transitions:</strong> Merger, acquisition, asset sale (with notice)</li>
          <li><strong>Your Explicit Consent:</strong> Third-party integrations you authorize</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3">6.3 Data Processing Agreements</h3>
        <p>
          All service providers operate under Data Processing Agreements (DPAs) ensuring GDPR/PIPEDA compliance and data protection standards.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4">7. Data Retention</h2>
        <table className="w-full border-collapse border border-gray-300 my-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left">Data Type</th>
              <th className="border border-gray-300 p-2 text-left">Retention Period</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2">Active Account Data</td>
              <td className="border border-gray-300 p-2">During account lifetime + 30 days after deletion</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-300 p-2">Financial Records</td>
              <td className="border border-gray-300 p-2">7 years (tax/legal compliance)</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Audit Logs</td>
              <td className="border border-gray-300 p-2">3 years (regulatory compliance)</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-300 p-2">Analytics/Cookies</td>
              <td className="border border-gray-300 p-2">13 months (or as per consent)</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Deleted Account Data</td>
              <td className="border border-gray-300 p-2">30 days in backup, then permanently deleted</td>
            </tr>
          </tbody>
        </table>

        <h2 className="text-2xl font-bold mt-10 mb-4">8. Your Privacy Rights</h2>

        <h3 className="text-xl font-semibold mt-6 mb-3">8.1 US Rights (CCPA)</h3>
        <ul className="list-disc pl-8 my-4">
          <li><strong>Right to Access:</strong> Request copy of data we hold about you</li>
          <li><strong>Right to Delete:</strong> Request erasure of personal information</li>
          <li><strong>Right to Opt-Out:</strong> Opt out of sale/sharing of data (we don't, but you have the right)</li>
          <li><strong>Right to Correct:</strong> Request correction of inaccurate data</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3">8.2 EU/EEA Rights (GDPR)</h3>
        <ul className="list-disc pl-8 my-4">
          <li>Right to access, rectification, erasure, restriction of processing</li>
          <li>Right to data portability (export in machine-readable format)</li>
          <li>Right to withdraw consent</li>
          <li>Right to object to processing</li>
          <li>Right to lodge complaint with supervisory authority</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3">8.3 Canadian Rights (PIPEDA)</h3>
        <ul className="list-disc pl-8 my-4">
          <li>Right to access personal information</li>
          <li>Right to request correction</li>
          <li>Right to withdraw consent</li>
          <li>Right to file complaint with Privacy Commissioner of Canada</li>
        </ul>

        <h2 className="text-2xl font-bold mt-10 mb-4">9. How to Exercise Your Rights</h2>
        <p>
          To exercise any privacy rights, submit a request to:
        </p>
        <div className="bg-gray-100 p-4 rounded my-4">
          <p><strong>Email:</strong> privacy@ipoready.com</p>
          <p><strong>Mail:</strong> IPOReady Inc., [Address], [City], [Country]</p>
          <p><strong>In-App:</strong> Account Settings → Privacy & Data</p>
        </div>
        <p>
          We will respond within:
        </p>
        <ul className="list-disc pl-8 my-4">
          <li><strong>US (CCPA):</strong> 45 days</li>
          <li><strong>EU (GDPR):</strong> 30 days</li>
          <li><strong>Canada (PIPEDA):</strong> 30 days</li>
        </ul>

        <h2 className="text-2xl font-bold mt-10 mb-4">10. Data Security</h2>
        <p>
          We implement industry-standard security measures:
        </p>
        <ul className="list-disc pl-8 my-4">
          <li>TLS/SSL encryption for all data in transit</li>
          <li>AES-256 encryption for sensitive data at rest</li>
          <li>bcryptjs hashing for passwords (12 salt rounds)</li>
          <li>Multi-factor authentication (MFA) optional for accounts</li>
          <li>Regular security audits and penetration testing</li>
          <li>Secure key management and access controls</li>
        </ul>

        <h2 className="text-2xl font-bold mt-10 mb-4">11. Cookies & Tracking</h2>
        <table className="w-full border-collapse border border-gray-300 my-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left">Cookie Type</th>
              <th className="border border-gray-300 p-2 text-left">Purpose</th>
              <th className="border border-gray-300 p-2 text-left">Consent Required</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2">Session/Authentication</td>
              <td className="border border-gray-300 p-2">Keep you logged in</td>
              <td className="border border-gray-300 p-2">No (essential)</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-300 p-2">Preferences</td>
              <td className="border border-gray-300 p-2">Remember settings (theme, language)</td>
              <td className="border border-gray-300 p-2">No (essential)</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Analytics (Google Analytics 4)</td>
              <td className="border border-gray-300 p-2">Track usage patterns, improve UX</td>
              <td className="border border-gray-300 p-2">Yes (optional)</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-300 p-2">Third-Party (Stripe, Slack)</td>
              <td className="border border-gray-300 p-2">Service integration</td>
              <td className="border border-gray-300 p-2">Yes (optional)</td>
            </tr>
          </tbody>
        </table>

        <h2 className="text-2xl font-bold mt-10 mb-4">12. International Data Transfers</h2>
        <p>
          Your data may be transferred to and processed in countries other than where you reside, including the United States and Canada. By using our Services, you consent to such transfers.
        </p>
        <p>
          For EU/EEA users: We use Standard Contractual Clauses and other lawful mechanisms to ensure adequate protections for international transfers.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4">13. Children's Privacy</h2>
        <p>
          Our Services are not intended for individuals under 18 years of age. We do not knowingly collect information from children. If we discover we have collected data from a minor, we will promptly delete it. Parents/guardians who believe their child has provided information should contact privacy@ipoready.com.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4">14. Third-Party Links</h2>
        <p>
          Our Services may contain links to third-party websites (SEDAR+, TSX, regulatory sites). We are not responsible for their privacy practices. Please review their policies before providing information.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4">15. Policy Updates</h2>
        <p>
          We may update this Privacy Policy periodically. Major changes will be announced via email or prominent notice on our website. Your continued use of Services after changes constitutes acceptance of the updated policy.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4">16. Contact Us</h2>
        <div className="bg-gray-100 p-4 rounded my-4">
          <p><strong>Privacy Officer:</strong> privacy@ipoready.com</p>
          <p><strong>Data Protection Authority Inquiries:</strong> dpa@ipoready.com</p>
          <p><strong>General Support:</strong> support@ipoready.com</p>
          <p><strong>Address:</strong> IPOReady Inc., [Address], [City], [Country]</p>
        </div>

        <hr className="my-12" />
        <p className="text-gray-600 text-sm">
          This Privacy Policy was last updated on May 24, 2026. We are committed to protecting your privacy and will continue to evolve our practices to meet regulatory standards.
        </p>
      </div>
    </div>
  )
}
