/**
 * Onboarding Checklist Guidance
 * Per-item guidance text, resources, and recommendations
 */

export interface ChecklistItemGuidance {
  name: string
  category: 'Legal' | 'Financial' | 'Governance' | 'Tax' | 'Operations' | 'Compliance'
  description: string
  ipoReadyGuidance: string
  externalResources: {
    title: string
    url: string
    type: 'guide' | 'template' | 'vendor' | 'regulatory'
  }[]
  estimatedDays: number
  commonMistakes: string[]
}

export const ONBOARDING_GUIDANCE: Record<string, ChecklistItemGuidance> = {
  'Company Formation & Legal Structure': {
    name: 'Company Formation & Legal Structure',
    category: 'Legal',
    description: 'Ensure your company has proper legal structure (corporation vs. partnership vs. LLC) that meets exchange requirements.',
    ipoReadyGuidance: `IPOReady helps you:
- Verify your current legal structure meets exchange requirements
- Identify any restructuring needed before listing
- Review incorporation documents for completeness
- Ensure all required corporate resolutions are documented
- We'll connect you with legal counsel if restructuring is needed.`,
    externalResources: [
      {
        title: 'TSX Company Manual - Corporate Structure',
        url: 'https://www.tsx.com/listings/listing-with-us/listing-requirements',
        type: 'regulatory',
      },
      {
        title: 'SEDAR+ Filing Requirements',
        url: 'https://www.sedarplus.ca/',
        type: 'regulatory',
      },
      {
        title: 'Corporate Structure Checklist',
        url: 'https://www.ipoready.ai/resources/corporate-structure-checklist',
        type: 'template',
      },
    ],
    estimatedDays: 5,
    commonMistakes: [
      'Using incorrect corporate entity type for target exchange',
      'Missing or incomplete articles of incorporation',
      'Outdated bylaws or governance documents',
      'Shareholder agreements that conflict with IPO requirements',
    ],
  },
  'Business Registration & Permits': {
    name: 'Business Registration & Permits',
    category: 'Legal',
    description: 'Verify all required business licenses, permits, and registrations are current and valid across all jurisdictions.',
    ipoReadyGuidance: `IPOReady helps you:
- Identify all required permits for your business and jurisdictions
- Create a tracking spreadsheet for renewal dates
- Verify compliance status with each jurisdiction
- Flag any expired or missing permits
- Connect you with regulatory specialists if needed
- Ensure all permits transfer smoothly to public company status.`,
    externalResources: [
      {
        title: 'Business Licensing Guide by Province',
        url: 'https://www.canada.ca/en/services/business/start-operating.html',
        type: 'guide',
      },
      {
        title: 'Permits & Licenses Checklist',
        url: 'https://www.ipoready.ai/resources/permits-licenses',
        type: 'template',
      },
    ],
    estimatedDays: 7,
    commonMistakes: [
      'Overlooking permits in secondary operating jurisdictions',
      'Expired licenses discovered during IPO due diligence',
      'Not planning for permit transfers to new public company entity',
      'Missing industry-specific regulatory permits',
    ],
  },
  'Bank Account & Basic Financials': {
    name: 'Bank Account & Basic Financials',
    category: 'Financial',
    description: 'Establish business bank account and implement basic accounting systems and financial record-keeping.',
    ipoReadyGuidance: `IPOReady helps you:
- Ensure separate business and personal accounting
- Verify accounting software is IPO-ready (QuickBooks, SAP, etc.)
- Review historical financial records for completeness
- Identify any gaps in financial documentation
- Connect you with accounting firms that understand IPO requirements
- Prepare preliminary financial summaries for your advisor.`,
    externalResources: [
      {
        title: 'Accounting Standards for IPO Companies',
        url: 'https://www.cica.ca/guidance/',
        type: 'regulatory',
      },
      {
        title: 'Financial Record-Keeping Checklist',
        url: 'https://www.ipoready.ai/resources/financial-records',
        type: 'template',
      },
    ],
    estimatedDays: 3,
    commonMistakes: [
      'Mixing personal and business finances',
      'Inadequate accounting records for historical periods',
      'Using non-standard accounting software',
      'Not establishing audit trails for transactions',
    ],
  },
  'Board of Directors Formation': {
    name: 'Board of Directors Formation',
    category: 'Governance',
    description: 'Establish formal Board of Directors with required independence and committee structure.',
    ipoReadyGuidance: `IPOReady helps you:
- Identify director candidates matching exchange requirements
- Structure board committees (Audit, Compensation, Governance)
- Ensure director independence requirements are met
- Create board resolutions and approval documentation
- Develop director and officer liability insurance (D&O)
- Track director qualifications and disclosures
- Prepare biographical summaries for prospectus.`,
    externalResources: [
      {
        title: 'TSX Corporate Governance Guidelines',
        url: 'https://www.tsx.com/listings/listing-with-us/corporate-governance',
        type: 'regulatory',
      },
      {
        title: 'Board Composition Requirements by Exchange',
        url: 'https://www.ipoready.ai/resources/board-requirements',
        type: 'guide',
      },
      {
        title: 'Director Biography Template',
        url: 'https://www.ipoready.ai/resources/director-bio-template',
        type: 'template',
      },
    ],
    estimatedDays: 10,
    commonMistakes: [
      'Insufficient director independence at listing',
      'Missing required board committees',
      'Directors with conflicts of interest',
      'Inadequate director experience in public companies',
    ],
  },
  'Cap Table Cleanup (if applicable)': {
    name: 'Cap Table Cleanup (if applicable)',
    category: 'Governance',
    description: 'Clean and validate capitalization table; resolve any equity issues or unclear holdings.',
    ipoReadyGuidance: `IPOReady helps you:
- Audit your current cap table for completeness
- Identify and resolve unclear shareholdings
- Validate all equity grants and conversions
- Resolve any founder disputes or equity issues
- Convert simple cap table to IPO-ready format
- Use IPOReady's Cap Table Management tool for validation
- Prepare cap table for prospectus disclosure.`,
    externalResources: [
      {
        title: 'IPOReady Cap Table Management Tool',
        url: 'https://www.ipoready.ai/cap-table',
        type: 'guide',
      },
      {
        title: 'Cap Table Audit Checklist',
        url: 'https://www.ipoready.ai/resources/cap-table-audit',
        type: 'template',
      },
    ],
    estimatedDays: 14,
    commonMistakes: [
      'Unclear or missing equity documentation',
      'Unrecorded option grants or exercises',
      'Founder disputes over equity splits',
      'Incorrect warrant or convertible note accounting',
    ],
  },
  'Audit Selection': {
    name: 'Audit Selection',
    category: 'Financial',
    description: 'Select Big Four or mid-size auditor experienced with IPO companies in your sector.',
    ipoReadyGuidance: `IPOReady helps you:
- Connect you with Big Four and quality mid-size auditors
- Provide auditor comparison matrix (fees, experience, timeline)
- Facilitate RFP process and auditor interviews
- Review engagement letter terms
- Ensure auditor understands IPO timeline
- Plan audit scope and preliminary audit procedures
- Identify any financial statement restatement risks early.`,
    externalResources: [
      {
        title: 'Selecting an IPO Auditor Guide',
        url: 'https://www.ipoready.ai/resources/auditor-selection',
        type: 'guide',
      },
      {
        title: 'Auditor Interview Checklist',
        url: 'https://www.ipoready.ai/resources/auditor-interview',
        type: 'template',
      },
    ],
    estimatedDays: 5,
    commonMistakes: [
      'Selecting auditor based on cost alone',
      'Choosing auditor without IPO experience',
      'Delaying auditor engagement (limits restatement time)',
      'Not clarifying audit scope for IPO requirements',
    ],
  },
  'Legal Counsel Engagement': {
    name: 'Legal Counsel Engagement',
    category: 'Legal',
    description: 'Engage experienced IPO counsel (Canadian or international firm with IPO track record).',
    ipoReadyGuidance: `IPOReady helps you:
- Connect you with top-tier IPO counsel (Blake, McCarthy, Miller Thomson, etc.)
- Provide counsel comparison matrix and experience summaries
- Facilitate counsel interviews and proposal process
- Review engagement letter scope and fees
- Coordinate between you, underwriters, and auditor
- IPOReady includes legal guidance within our platform—counsel supplements this
- Plan legal work streams and timeline.`,
    externalResources: [
      {
        title: 'IPO Legal Counsel Directory',
        url: 'https://www.ipoready.ai/resources/legal-counsel-directory',
        type: 'guide',
      },
      {
        title: 'Legal Counsel Interview Checklist',
        url: 'https://www.ipoready.ai/resources/counsel-interview',
        type: 'template',
      },
    ],
    estimatedDays: 3,
    commonMistakes: [
      'Selecting local corporate counsel without IPO experience',
      'Engaging counsel too late in the process',
      'Not clarifying which counsel handles which deliverables',
      'Changing counsel mid-process (delays and rework)',
    ],
  },
  'Insurance Review': {
    name: 'Insurance Review',
    category: 'Operations',
    description: 'Review existing insurance policies; obtain D&O, fiduciary, and general liability coverage appropriate for public company.',
    ipoReadyGuidance: `IPOReady helps you:
- Audit current insurance coverage against public company needs
- Prepare D&O insurance RFP for underwriters
- Identify gaps in coverage (fiduciary, crime, cyber, etc.)
- Connect you with insurance brokers experienced in IPO transitions
- Coordinate with underwriters on insurance requirements
- Ensure insurance in place before listing
- Track insurance renewal dates post-IPO.`,
    externalResources: [
      {
        title: 'Insurance Requirements for Public Companies',
        url: 'https://www.ipoready.ai/resources/insurance-requirements',
        type: 'guide',
      },
      {
        title: 'D&O Insurance Comparison Template',
        url: 'https://www.ipoready.ai/resources/do-insurance-template',
        type: 'template',
      },
    ],
    estimatedDays: 7,
    commonMistakes: [
      'Inadequate D&O coverage limits for public company size',
      'Not obtaining tail coverage for pre-IPO period',
      'Overlooking cyber or crime insurance needs',
      'Changing insurance carriers without continuity verification',
    ],
  },
  'Tax Planning & Compliance': {
    name: 'Tax Planning & Compliance',
    category: 'Tax',
    description: 'Engage tax advisor; address any historical tax compliance issues; plan tax structure for public company.',
    ipoReadyGuidance: `IPOReady helps you:
- Connect you with tax advisors experienced in IPO structuring
- Identify any historical tax compliance gaps
- Plan optimal tax structure for public company status
- Review transfer pricing (if applicable)
- Assess US tax exposure if targeting US exchanges
- Plan for post-IPO tax obligations
- Coordinate with auditor on tax review procedures.`,
    externalResources: [
      {
        title: 'Tax Considerations for IPO Companies',
        url: 'https://www.ipoready.ai/resources/tax-considerations',
        type: 'guide',
      },
      {
        title: 'Tax Compliance Checklist',
        url: 'https://www.ipoready.ai/resources/tax-compliance',
        type: 'template',
      },
    ],
    estimatedDays: 5,
    commonMistakes: [
      'Outstanding tax assessment or dispute pre-IPO',
      'Unclear tax history for acquired entities',
      'Not planning for post-IPO tax obligations',
      'Failure to document tax positions for audit',
    ],
  },
  'Governance Documents': {
    name: 'Governance Documents',
    category: 'Governance',
    description: 'Create or update bylaws, board resolutions, committee charters, and shareholder agreements.',
    ipoReadyGuidance: `IPOReady helps you:
- Provide governance document templates (bylaws, committee charters, etc.)
- Review existing governance documents for IPO compliance
- Identify required board resolutions and shareholder approvals
- Prepare shareholder meeting notice and proxy materials
- Document all corporate approvals required for IPO
- Ensure governance aligns with exchange listing rules
- Create governance policies for post-IPO compliance.`,
    externalResources: [
      {
        title: 'IPOReady Governance Documents Library',
        url: 'https://www.ipoready.ai/resources/governance-docs',
        type: 'guide',
      },
      {
        title: 'Bylaws Template for Public Companies',
        url: 'https://www.ipoready.ai/resources/bylaws-template',
        type: 'template',
      },
    ],
    estimatedDays: 10,
    commonMistakes: [
      'Governance documents not aligned with exchange requirements',
      'Missing board resolutions for IPO-critical decisions',
      'Shareholder agreement conflicts with IPO terms',
      'Out-of-date or non-standard governance policies',
    ],
  },
  'SOX Compliance Infrastructure': {
    name: 'SOX Compliance Infrastructure',
    category: 'Compliance',
    description: 'NASDAQ/NYSE requirement: Establish SOX 404 compliance infrastructure and internal controls.',
    ipoReadyGuidance: `IPOReady helps you:
- Explain SOX 404 requirements and timeline
- Connect you with SOX compliance specialists
- Help design internal control framework
- Document control procedures and risk assessment
- Coordinate with auditor on SOX scope
- Prepare for initial SOX audit
- Plan post-IPO SOX management and documentation.`,
    externalResources: [
      {
        title: 'SOX 404 Compliance Guide',
        url: 'https://www.ipoready.ai/resources/sox-404',
        type: 'guide',
      },
      {
        title: 'Internal Control Assessment Template',
        url: 'https://www.ipoready.ai/resources/sox-template',
        type: 'template',
      },
    ],
    estimatedDays: 20,
    commonMistakes: [
      'Starting SOX infrastructure too late',
      'Inadequate documentation of control procedures',
      'Not involving IT in control design',
      'Underestimating ongoing SOX management costs',
    ],
  },
}

export function getGuidance(itemName: string): ChecklistItemGuidance | undefined {
  return ONBOARDING_GUIDANCE[itemName]
}
