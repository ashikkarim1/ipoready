'use client'

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl prose prose-lg">
        <h1 className="text-4xl font-bold mb-8">Disclaimer</h1>

        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded mb-8">
          <p className="text-lg font-bold text-red-900 mb-4">⚠️ IMPORTANT DISCLAIMER</p>
          <p className="text-red-800 mb-4">
            IPOReady Inc. is a <strong>workflow management tool</strong> designed to assist companies in organizing and tracking IPO readiness activities. It does NOT provide financial, investment, legal, tax, or securities advice. By using IPOReady, you acknowledge and accept all risks associated with your use and any decisions made based on information provided by or through the platform.
          </p>
        </div>

        <h2 className="text-2xl font-bold mt-10 mb-4">1. No Professional Advice</h2>
        <p>
          IPOReady and its Services:
        </p>
        <ul className="list-disc pl-8 my-4">
          <li>Do NOT constitute financial advice, investment advice, or investment recommendations</li>
          <li>Do NOT constitute legal advice, tax advice, or accounting advice</li>
          <li>Do NOT constitute securities or regulatory compliance advice</li>
          <li>Do NOT guarantee IPO success, timeline, valuation, or regulatory approval</li>
          <li>Do NOT replace professional counsel from qualified legal, financial, or accounting firms</li>
        </ul>

        <p className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-6">
          <strong>⚠️ YOU ARE SOLELY RESPONSIBLE</strong> for obtaining independent professional advice before making any IPO-related decisions. IPOReady users include this explicitly in their own legal review and compliance processes.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4">2. Accuracy of Information</h2>
        <p>
          IPOReady does not guarantee:
        </p>
        <ul className="list-disc pl-8 my-4">
          <li>Accuracy, completeness, or timeliness of benchmarking data</li>
          <li>Accuracy of historical IPO timelines or statistics referenced in the platform</li>
          <li>Accuracy of PACE scores or predictive models</li>
          <li>Accuracy of third-party data sources (SEDAR+, SEDI, TSX, etc.)</li>
          <li>Absence of errors, omissions, or obsolete information</li>
        </ul>

        <p>
          <strong>Benchmarking Note:</strong> IPO timelines vary significantly by company, sector, market conditions, and regulatory environment. Historical data may not predict future timelines.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4">3. Regulatory Compliance Responsibility</h2>
        <p className="bg-orange-50 border-l-4 border-orange-500 p-4 my-6">
          <strong>⚠️ CRITICAL:</strong> IPOReady does NOT:
        </p>
        <ul className="list-disc pl-8 my-4">
          <li>Ensure your company complies with securities laws or exchange requirements</li>
          <li>Guarantee that completing IPOReady checklists satisfies regulatory obligations</li>
          <li>Represent the views or endorsements of any securities regulator (SEC, OSC, SEDAR+, etc.)</li>
          <li>Substitute for professional legal counsel specializing in capital markets</li>
          <li>Verify accuracy or completeness of financial statements or disclosures</li>
        </ul>

        <p>
          Each company must:
        </p>
        <ul className="list-disc pl-8 my-4">
          <li>Engage qualified securities counsel licensed in their jurisdiction</li>
          <li>Comply with all applicable federal, provincial, and exchange regulations</li>
          <li>File all required documents and undergo necessary regulatory reviews</li>
          <li>Verify IPOReady checklists against official regulatory requirements</li>
        </ul>

        <h2 className="text-2xl font-bold mt-10 mb-4">4. Market Conditions & Timing</h2>
        <p>
          IPO success and timing depend on numerous external factors beyond any tool's control:
        </p>
        <ul className="list-disc pl-8 my-4">
          <li><strong>Market Volatility:</strong> Stock market conditions, investor appetite, economic outlook</li>
          <li><strong>Sector Dynamics:</strong> Industry trends, competitive landscape, regulatory environment</li>
          <li><strong>Company Performance:</strong> Revenue, profitability, growth rate, team leadership</li>
          <li><strong>Geopolitical Events:</strong> Recessions, crises, regulatory changes, trade disputes</li>
          <li><strong>Regulatory Changes:</strong> New listing requirements, disclosure standards, accounting rules</li>
        </ul>

        <p>
          IPOReady's predictive models cannot account for all such variables. Actual IPO timelines may differ significantly from estimates.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4">5. PACE™ Scoring Disclaimer</h2>
        <p>
          The PACE™ (Predictive Assessment of Capital Expedition) score:
        </p>
        <ul className="list-disc pl-8 my-4">
          <li>Is a <strong>benchmarking tool only</strong>, not a guarantee of IPO readiness</li>
          <li>Based on historical data and predictive models that may not apply to your company</li>
          <li>Uses internal factors (task completion, team readiness, cash runway) and external benchmarks</li>
          <li>Does NOT account for qualitative factors (founder credibility, board reputation, market moment)</li>
          <li>Should NOT be the sole basis for IPO timing decisions</li>
        </ul>

        <p>
          <strong>Proper Use:</strong> PACE scores should be reviewed with securities counsel and advisors to inform (not determine) IPO readiness discussions.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4">6. Document & Checklist Disclaimer</h2>
        <p>
          IPOReady's document templates, checklists, and guidance:
        </p>
        <ul className="list-disc pl-8 my-4">
          <li>Are general-purpose examples and may not comply with your specific jurisdiction or exchange</li>
          <li>Must be reviewed and customized by qualified legal counsel</li>
          <li>Do NOT substitute for professional legal document preparation</li>
          <li>May be outdated as laws and exchange requirements change</li>
          <li>Are provided for organizational purposes only</li>
        </ul>

        <p>
          <strong>Proper Use:</strong> All documents and checklists must be reviewed by securities lawyers and customized for your specific IPO filing jurisdiction (e.g., SEC/FINRA for US, OSC for Ontario, CSX for Canadian Sec. Exch.).
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4">7. Third-Party Data Disclaimer</h2>
        <p>
          IPOReady integrates public data from SEDAR+, SEDI, TSX, and other regulatory sources. This data:
        </p>
        <ul className="list-disc pl-8 my-4">
          <li>Is provided "AS-IS" from third-party sources and may contain errors</li>
          <li>Is not validated or guaranteed by IPOReady</li>
          <li>Users should verify critical information directly from source systems</li>
          <li>IPOReady is not responsible for inaccuracies or delays in third-party data</li>
        </ul>

        <h2 className="text-2xl font-bold mt-10 mb-4">8. No Guarantee of Service Continuity</h2>
        <p>
          While we strive for 99.9% uptime, IPOReady Services:
        </p>
        <ul className="list-disc pl-8 my-4">
          <li>May experience outages, maintenance windows, or service interruptions</li>
          <li>Are provided "AS IS" without guarantees of uninterrupted service</li>
          <li>Are not responsible for business losses due to service unavailability</li>
          <li>Users should maintain independent backups of critical data</li>
        </ul>

        <h2 className="text-2xl font-bold mt-10 mb-4">9. Cybersecurity Disclaimer</h2>
        <p>
          IPOReady implements industry-standard security measures, but:
        </p>
        <ul className="list-disc pl-8 my-4">
          <li>No system is 100% secure against all threats</li>
          <li>Users are responsible for protecting their account credentials</li>
          <li>Users should enable multi-factor authentication (MFA)</li>
          <li>Sensitive financial documents should be encrypted before upload</li>
          <li>IPOReady is not liable for unauthorized access due to user negligence</li>
        </ul>

        <p>
          <strong>Best Practices:</strong>
        </p>
        <ul className="list-disc pl-8 my-4">
          <li>Use strong, unique passwords</li>
          <li>Enable MFA on your account</li>
          <li>Do not share login credentials with team members (use team invite feature instead)</li>
          <li>Encrypt or redact sensitive information (salary data, cap table details) before upload</li>
          <li>Regularly review account activity and team access</li>
          <li>Contact security@ipoready.com if you suspect unauthorized access</li>
        </ul>

        <h2 className="text-2xl font-bold mt-10 mb-4">10. Financial Condition & Projections Disclaimer</h2>
        <p className="bg-red-50 border-l-4 border-red-500 p-4 my-6">
          <strong>⚠️ CRITICAL FOR IPO FILERS:</strong> Any financial projections or condition assessments made through or based on IPOReady:
        </p>
        <ul className="list-disc pl-8 my-4">
          <li>Must be prepared or reviewed by qualified chartered accountants (CAs) or certified public accountants (CPAs)</li>
          <li>Must comply with applicable accounting standards (IFRS, US GAAP)</li>
          <li>Must be audited or reviewed by Big 4 accounting firms before IPO filing</li>
          <li>Are the sole responsibility of your company and its CFO/finance team</li>
          <li>IPOReady does not prepare, audit, or verify financial statements</li>
        </ul>

        <p>
          <strong>False or misleading financial statements in securities filings constitute securities fraud.</strong> IPOReady users are solely responsible for the accuracy and completeness of all financial disclosures.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4">11. Limitation of Liability</h2>
        <p className="bg-gray-100 p-4 rounded my-6">
          <strong>IPOReady shall not be liable for:</strong>
        </p>
        <ul className="list-disc pl-8 my-4">
          <li>Any indirect, incidental, special, consequential, or punitive damages</li>
          <li>Loss of revenue, profits, data, or business opportunities</li>
          <li>Failure to achieve IPO, achieve IPO at expected valuation, or meet timeline</li>
          <li>Regulatory rejection, securities violations, or compliance failures</li>
          <li>Decisions made based on information from the platform</li>
          <li>Third-party actions or market events beyond our control</li>
        </ul>

        <p>
          <strong>Maximum Liability:</strong> Our total liability shall not exceed fees paid by you in the 12 months preceding the claim, or $100 USD, whichever is greater.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4">12. Assumption of Risk</h2>
        <p className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-6">
          <strong>By using IPOReady, you explicitly assume all risks associated with:</strong>
        </p>
        <ul className="list-disc pl-8 my-4">
          <li>Your IPO preparation and execution</li>
          <li>Any decisions made based on platform information</li>
          <li>Regulatory compliance and securities law adherence</li>
          <li>Accuracy of financial and legal disclosures</li>
          <li>Data security and privacy</li>
          <li>Service availability and performance</li>
        </ul>

        <h2 className="text-2xl font-bold mt-10 mb-4">13. Indemnification</h2>
        <p>
          You agree to indemnify and hold harmless IPOReady and its officers, directors, employees, and agents from any claims, damages, losses, or liabilities arising from:
        </p>
        <ul className="list-disc pl-8 my-4">
          <li>Your use of the platform</li>
          <li>Decisions made based on platform information</li>
          <li>Regulatory violations or securities violations</li>
          <li>Your content (financial data, documents, statements)</li>
          <li>Your violation of applicable laws</li>
        </ul>

        <h2 className="text-2xl font-bold mt-10 mb-4">14. Regulatory Disclosures</h2>
        <p>
          IPOReady is not registered as:
        </p>
        <ul className="list-disc pl-8 my-4">
          <li>A securities dealer or broker</li>
          <li>An investment advisor (in any jurisdiction)</li>
          <li>A law firm or legal practice</li>
          <li>An accounting firm or tax advisor</li>
          <li>A financial consultant</li>
        </ul>

        <p>
          <strong>We do not offer these services.</strong> Users must engage licensed professionals in each category.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4">15. Updates to Disclaimer</h2>
        <p>
          We may update this Disclaimer periodically. Your continued use of IPOReady constitutes acceptance of updated disclaimers. Major changes will be communicated via email or platform notice.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4">16. Contact & Support</h2>
        <div className="bg-gray-100 p-4 rounded my-4">
          <p><strong>Legal Questions:</strong> legal@ipoready.com</p>
          <p><strong>General Support:</strong> support@ipoready.com</p>
          <p><strong>Security Issues:</strong> security@ipoready.com</p>
        </div>

        <hr className="my-12" />

        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
          <p className="text-lg font-bold text-blue-900 mb-4">✅ RECOMMENDED ADVISORY TEAM FOR IPO</p>
          <p className="mb-4">
            To complement IPOReady's workflow tool, companies should assemble:
          </p>
          <ul className="list-disc pl-8 my-4">
            <li><strong>Securities Counsel:</strong> Law firm specialized in capital markets / IPO</li>
            <li><strong>Audit Firm:</strong> Big 4 (Deloitte, EY, KPMG, PwC) or equivalent</li>
            <li><strong>Investment Bank:</strong> Underwriter for IPO pricing, marketing, distribution</li>
            <li><strong>Accounting / CFO Advisory:</strong> Interim CFO services or Big 4 finance advisory</li>
            <li><strong>Compliance Counsel:</strong> Regulatory and compliance specialist</li>
            <li><strong>PR / Investor Relations:</strong> Messaging and stakeholder communications</li>
          </ul>
          <p className="text-sm text-blue-800 mt-4">
            IPOReady is a <strong>supplementary operational tool</strong>, not a substitute for professional services.
          </p>
        </div>

        <hr className="my-12" />

        <p className="text-gray-600 text-sm">
          This Disclaimer was last updated on May 24, 2026. By using IPOReady after this date, you accept these terms and disclaimers in their entirety.
        </p>
      </div>
    </div>
  )
}
