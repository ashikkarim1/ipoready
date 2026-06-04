/**
 * Filing Documents Configuration
 *
 * Comprehensive configuration for IPO/RTO filing documents across major North American exchanges.
 * Includes NASDAQ, NYSE, TSX, TSX Venture, and CSE requirements with regulatory references.
 *
 * Each document defines:
 * - Category: Financial, Legal, Governance, Corporate, or Compliance
 * - Required flag: Whether the document is mandatory
 * - Estimated prep time in days
 * - Regulatory references (SEC/CSA items)
 * - Template/guide URLs
 * - Checklist of required elements
 */

export type ExchangeCode = 'nasdaq' | 'nyse' | 'tsx' | 'tsxv' | 'cse';
export type DocumentCategory = 'Financial' | 'Legal' | 'Governance' | 'Corporate' | 'Compliance';
export type DocumentStatus = 'not_started' | 'in_progress' | 'draft' | 'reviewed' | 'final' | 'approved';

/**
 * Filing document configuration interface
 */
export interface FilingDocument {
  /** Unique document identifier */
  id: string;

  /** Display name of the document */
  name: string;

  /** Document description explaining purpose and scope */
  description: string;

  /** Document category */
  category: DocumentCategory;

  /** Whether this document is required for listing */
  required: boolean;

  /** Estimated number of days to prepare */
  estimatedDays: number;

  /** URL to template or guide document (relative path) */
  template_url?: string;

  /** Regulatory reference (SEC item or CSA rule) */
  regulatory?: string;

  /** List of required elements/checklist items */
  checklist: string[];

  /** Additional notes or comments */
  notes?: string;

  /** Exchange codes this document applies to */
  applicableExchanges?: ExchangeCode[];
}

/**
 * Exchange-specific document requirements configuration
 */
export interface ExchangeDocumentConfig {
  /** Exchange identifier code */
  exchangeId: ExchangeCode;

  /** Full display name of exchange */
  exchangeName: string;

  /** Country of operation */
  country: 'US' | 'CA';

  /** Regulatory body */
  regulator: string;

  /** All documents required/recommended for this exchange */
  documents: FilingDocument[];

  /** Contact information for regulatory filing */
  regulatoryContact?: {
    email: string;
    phone?: string;
    website?: string;
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// NASDAQ DOCUMENT REQUIREMENTS
// ═════════════════════════════════════════════════════════════════════════════

export const NASDAQ_DOCUMENTS: FilingDocument[] = [
  // ────────────────── FINANCIAL DOCUMENTS ──────────────────
  {
    id: 'nasdaq-financial-statements',
    name: 'Audited Financial Statements (2-3 years)',
    category: 'Financial',
    required: true,
    description: 'Full audited financial statements including balance sheet, income statement, and cash flow statement for the last 2-3 fiscal years.',
    estimatedDays: 30,
    template_url: '/templates/financial-statements-nasdaq.pdf',
    regulatory: 'SEC Reg S-K Item 13 & 301(a); Regulation S-X Rule 2-02',
    checklist: [
      'Consolidated Balance Sheet (latest + prior year)',
      'Consolidated Statement of Operations (3 years)',
      'Consolidated Statement of Cash Flows (3 years)',
      'Consolidated Statement of Stockholders\' Equity (3 years)',
      'Notes to Consolidated Financial Statements',
      'Auditor\'s Opinion Letter',
      'Management\'s Discussion & Analysis (MD&A)',
      'Attestation of Internal Controls (SOX 404 for accelerated filers)',
    ],
  },
  {
    id: 'nasdaq-pro-forma-financials',
    name: 'Pro-forma Financial Statements',
    category: 'Financial',
    required: true,
    description: 'Pro-forma financial statements reflecting the impact of significant acquisitions, mergers, or reorganizations.',
    estimatedDays: 20,
    template_url: '/templates/proforma-nasdaq.pdf',
    regulatory: 'SEC Reg S-K Item 13; Regulation S-X Rule 8-05',
    checklist: [
      'Pro-forma Balance Sheet as of recent date',
      'Pro-forma Statement of Operations (full year)',
      'Pro-forma condensed combined financial statements',
      'Assumptions and adjustments narrative',
      'Explanatory notes to pro-forma statements',
      'Auditor consent for pro-forma inclusion',
    ],
  },
  {
    id: 'nasdaq-tax-returns',
    name: 'Federal & State Income Tax Returns',
    category: 'Financial',
    required: true,
    description: 'Complete federal and applicable state income tax returns for the last 3-5 years, including all schedules and attachments.',
    estimatedDays: 10,
    regulatory: 'SEC Reg S-K Item 13; IRS Form 10-K requirements',
    checklist: [
      'Federal Form 1120 / 1120-S (last 5 years)',
      'State income tax returns for jurisdiction of incorporation',
      'Schedule C (if applicable)',
      'Depreciation schedules',
      'Deferred tax asset/liability calculations',
      'Tax clearance letters or certifications',
      'Any amended returns (Form 1120-X)',
    ],
  },
  {
    id: 'nasdaq-financial-projections',
    name: 'Financial Projections & Forecasts',
    category: 'Financial',
    required: true,
    description: 'Management\'s projections for 3-5 years including revenue, EBITDA, net income, cash flow, and balance sheet forecasts.',
    estimatedDays: 25,
    template_url: '/templates/projections-nasdaq.xlsx',
    regulatory: 'SEC Reg S-K Item 10(b); Forward-Looking Statements',
    checklist: [
      '3-5 year revenue projections (detailed by segment)',
      'Operating expense projections',
      'EBITDA and Net Income forecasts',
      'Cash flow projections (operating, investing, financing)',
      'Balance sheet projections',
      'Key assumptions and sensitivities',
      'Comparison to historical performance',
      'Management narrative explaining methodology',
    ],
  },
  {
    id: 'nasdaq-valuation-report',
    name: 'Business Valuation Report',
    category: 'Financial',
    required: false,
    description: 'Third-party valuation report using DCF, comparable company, and precedent transaction methods.',
    estimatedDays: 30,
    template_url: '/templates/valuation-nasdaq.pdf',
    regulatory: 'SEC Reg S-K Item 13; Accounting Standards ASC 718',
    checklist: [
      'Executive summary of valuation',
      'DCF valuation analysis',
      'Comparable company analysis',
      'Precedent transactions analysis',
      'Equity value bridge and reconciliation',
      'Sensitivity analysis tables',
      'Valuer qualifications and assumptions',
      'Fair value allocation to common equity',
    ],
  },
  {
    id: 'nasdaq-accounting-policies',
    name: 'Accounting Policies & Estimates Documentation',
    category: 'Financial',
    required: true,
    description: 'Detailed documentation of all accounting policies, critical accounting estimates, and changes from prior years.',
    estimatedDays: 15,
    regulatory: 'SEC Reg S-K Item 7; Accounting Standards Codification',
    checklist: [
      'Complete accounting policy summary (revenue, inventory, PP&E, etc.)',
      'Critical accounting estimates (allowances, reserves, useful lives)',
      'Changes in accounting policies year-over-year',
      'Unusual or non-standard accounting treatments',
      'Related party transaction policies',
      'Consolidation and elimination policies',
      'Goodwill and intangible asset policies',
    ],
  },

  // ────────────────── LEGAL DOCUMENTS ──────────────────
  {
    id: 'nasdaq-articles-incorporation',
    name: 'Restated Articles of Incorporation/Certificate',
    category: 'Legal',
    required: true,
    description: 'Current, restated articles of incorporation reflecting all amendments and authorizations for public listing.',
    estimatedDays: 10,
    template_url: '/templates/articles-nasdaq.pdf',
    regulatory: 'SEC Reg S-K Item 2(a); NASDAQ Listing Rule 5110',
    checklist: [
      'Restated Articles of Incorporation (certified)',
      'All amendments to date',
      'Certificate of Good Standing from state',
      'Authorized share capital (common and preferred)',
      'Voting rights and preferences',
      'Board composition and election procedures',
      'Any anti-takeover provisions',
    ],
  },
  {
    id: 'nasdaq-bylaws',
    name: 'Bylaws and Corporate Governance Documents',
    category: 'Legal',
    required: true,
    description: 'Current bylaws establishing board and shareholder procedures, committee structure, and governance policies.',
    estimatedDays: 12,
    template_url: '/templates/bylaws-nasdaq.pdf',
    regulatory: 'SEC Reg S-K Item 2(d); NASDAQ Listing Rules 5205-5250',
    checklist: [
      'Restated Bylaws (current version)',
      'Board committee charters (Audit, Compensation, Nominating)',
      'Board of Directors procedures (meetings, voting, etc.)',
      'Shareholder meeting procedures',
      'Officer roles and responsibilities',
      'Indemnification provisions',
      'Whistleblower procedures',
    ],
  },
  {
    id: 'nasdaq-ip-documentation',
    name: 'Intellectual Property Documentation',
    category: 'Legal',
    required: true,
    description: 'Complete IP portfolio documentation including patents, trademarks, copyrights, trade secrets, and licensing agreements.',
    estimatedDays: 25,
    regulatory: 'SEC Reg S-K Item 13; Patent & Trademark Office records',
    checklist: [
      'Patent portfolio summary and status',
      'Trademark registration list and status',
      'Copyright registrations',
      'Trade secret protection policies',
      'License agreements (both in and out)',
      'IP acquisition history and documentation',
      'IP litigation history and settlements',
      'Third-party IP indemnification agreements',
    ],
  },
  {
    id: 'nasdaq-material-contracts',
    name: 'Material Contracts Disclosure',
    category: 'Legal',
    required: true,
    description: 'Summary and copies of all material contracts including vendor, customer, debt, and partnership agreements.',
    estimatedDays: 20,
    regulatory: 'SEC Reg S-K Item 10(e)',
    checklist: [
      'List of all material contracts (>$X threshold)',
      'Customer contracts with revenue concentration >10%',
      'Vendor/supplier contracts',
      'Debt instruments and financing agreements',
      'Joint venture and partnership agreements',
      'Lease agreements (equipment and real estate)',
      'License and royalty agreements',
      'Material termination provisions',
    ],
  },
  {
    id: 'nasdaq-litigation',
    name: 'Litigation & Legal Proceedings Disclosure',
    category: 'Legal',
    required: true,
    description: 'Complete disclosure of all pending or threatened litigation, claims, and regulatory investigations.',
    estimatedDays: 10,
    regulatory: 'SEC Reg S-K Item 3; Regulation S-X Rule 5-03',
    checklist: [
      'List of pending lawsuits and claims',
      'Threatened litigation summary',
      'Regulatory investigations and proceedings',
      'Settlement agreements and escrow arrangements',
      'Insurance coverage summary',
      'Assessment of litigation exposure',
      'Contingent liability estimates',
    ],
  },
  {
    id: 'nasdaq-licenses-permits',
    name: 'Licenses, Permits & Regulatory Approvals',
    category: 'Legal',
    required: true,
    description: 'Documentation of all licenses, permits, certifications, and regulatory approvals required for business operations.',
    estimatedDays: 15,
    regulatory: 'SEC Reg S-K Item 1(c); Industry-specific regulations',
    checklist: [
      'Business licenses and permits',
      'Industry-specific certifications',
      'Professional licenses (if applicable)',
      'Regulatory approvals and exemptions',
      'Compliance certifications',
      'Environmental permits and compliance',
      'FDA, FCC, or other agency approvals',
      'Renewal dates and status',
    ],
  },
  {
    id: 'nasdaq-legal-opinions',
    name: 'Legal Opinions (Counsel)',
    category: 'Legal',
    required: true,
    description: 'Formal legal opinions from securities counsel on formation, capitalization, authorization, and compliance matters.',
    estimatedDays: 10,
    template_url: '/templates/legal-opinions-nasdaq.pdf',
    regulatory: 'SEC Reg S-K Item 2; Legal Opinion Standards',
    checklist: [
      'Opinion on valid formation and good standing',
      'Opinion on authorized and validly issued shares',
      'Opinion on authorized securities',
      'Opinion on capitalization (no undisclosed securities)',
      'Opinion on compliance with law and material contracts',
      'Opinion on absence of conflicts',
      'Opinion on statutory/regulatory compliance',
    ],
  },
  {
    id: 'nasdaq-employee-agreements',
    name: 'Employee Agreements & Disclosure',
    category: 'Legal',
    required: true,
    description: 'Summary of employment agreements with executives, non-compete/non-disclosure agreements, and benefit plans.',
    estimatedDays: 15,
    regulatory: 'SEC Reg S-K Item 11; Regulation S-K Item 401',
    checklist: [
      'Named Executive Officer (NEO) employment agreements',
      'Non-compete and non-disclosure agreements',
      'Change of control provisions',
      'Key man insurance policies',
      'Employee benefit plan documents',
      'Stock option/RSU plan documentation',
      'Severance and severance agreements',
      'Golden parachute disclosures',
    ],
  },

  // ────────────────── GOVERNANCE DOCUMENTS ──────────────────
  {
    id: 'nasdaq-board-resolutions',
    name: 'Board Approval Resolutions',
    category: 'Governance',
    required: true,
    description: 'Certified board resolutions approving IPO, capitalization, corporate structure, and key decisions.',
    estimatedDays: 5,
    template_url: '/templates/board-resolutions-nasdaq.pdf',
    regulatory: 'SEC Reg S-K Item 2; NASDAQ Listing Rule 5110(a)(2)',
    checklist: [
      'Resolution approving IPO and engagement of underwriters',
      'Resolution approving form of prospectus',
      'Resolution approving board and committee composition',
      'Resolution on executive compensation',
      'Resolutions authorizing officers to execute documents',
      'Certified copies of all board minutes',
      'Secretary\'s certification of authority',
    ],
  },
  {
    id: 'nasdaq-shareholder-resolutions',
    name: 'Shareholder Approval Resolutions',
    category: 'Governance',
    required: true,
    description: 'Shareholder resolutions authorizing capitalization, option plans, share issuances, and governance structure.',
    estimatedDays: 10,
    template_url: '/templates/shareholder-resolutions-nasdaq.pdf',
    regulatory: 'SEC Reg S-K Item 2; State Corporate Law',
    checklist: [
      'Shareholder approval of authorized shares',
      'Shareholder approval of stock option/incentive plans',
      'Shareholder approval of any option pool reservation',
      'Approval of board composition and election',
      'Approval of compensation policies',
      'Waiver of preemptive rights',
      'Certified voting results and meeting minutes',
    ],
  },
  {
    id: 'nasdaq-officer-bios',
    name: 'Executive Officers & Director Biographies',
    category: 'Governance',
    required: true,
    description: 'Detailed biographies of all directors, executive officers, and key management with experience and compensation.',
    estimatedDays: 10,
    template_url: '/templates/officer-bios-nasdaq.pdf',
    regulatory: 'SEC Reg S-K Item 11, 13, 14, 15 & 16; DEF 14A',
    checklist: [
      'Director biographies (age, experience, qualifications)',
      'Executive officer backgrounds (education, prior roles)',
      'Committee assignments and leadership roles',
      'Compensation disclosure (salary, bonus, equity)',
      'Related party transaction disclosures',
      'Independence certifications',
      'Director and officer conflicts of interest',
    ],
  },
  {
    id: 'nasdaq-governance-policies',
    name: 'Corporate Governance Policies',
    category: 'Governance',
    required: true,
    description: 'Formal policies on code of conduct, insider trading, communications, and other governance matters.',
    estimatedDays: 15,
    template_url: '/templates/governance-policies-nasdaq.pdf',
    regulatory: 'NASDAQ Listing Rules 5110-5140; SOX 302/404',
    checklist: [
      'Code of Conduct/Ethics',
      'Insider Trading Policy',
      'Disclosure Committee Charter',
      'Anti-Hedging Policy',
      'Clawback Policy',
      'Director Independence standards',
      'Committee charter compliance summary',
      'Related party transaction policy',
    ],
  },
  {
    id: 'nasdaq-director-independence',
    name: 'Director Independence Certifications',
    category: 'Governance',
    required: true,
    description: 'Certifications of director independence, business relationships, and conflicts of interest assessments.',
    estimatedDays: 5,
    regulatory: 'NASDAQ Listing Rules 5605(a); Sarbanes-Oxley Act',
    checklist: [
      'Director independence questionnaires',
      'Business relationship disclosures',
      'Conflict of interest assessments',
      'Audit committee financial expert certifications',
      'Compensation committee certifications',
      'Nominating committee independence verification',
      'Related party transaction approvals',
    ],
  },
  {
    id: 'nasdaq-conflict-of-interest',
    name: 'Conflict of Interest Waivers & Approvals',
    category: 'Governance',
    required: false,
    description: 'Any waivers or approvals for conflicts of interest for directors, officers, or significant shareholders.',
    estimatedDays: 5,
    regulatory: 'SEC Reg S-K Item 13; NASDAQ Listing Rule 5110',
    checklist: [
      'Related party transaction disclosures',
      'Conflict of interest waivers',
      'Board approval of related party transactions',
      'Fairness opinions for related party deals',
      'Audit committee pre-approval documentation',
    ],
  },

  // ────────────────── CORPORATE DOCUMENTS ──────────────────
  {
    id: 'nasdaq-cap-table',
    name: 'Capitalization Table & Securities Schedule',
    category: 'Corporate',
    required: true,
    description: 'Detailed capitalization table showing all outstanding securities, options, warrants, and conversion rights.',
    estimatedDays: 15,
    template_url: '/templates/cap-table-nasdaq.xlsx',
    regulatory: 'SEC Reg S-K Item 3, 5, & 13',
    checklist: [
      'Complete cap table (common, preferred, options)',
      'Number of shares outstanding by class',
      'Fully diluted share calculation',
      'Warrant and option details',
      'Conversion rights and pricing',
      'Dividend preferences',
      'Liquidation preferences',
      'Voting agreements and voting history',
    ],
  },
  {
    id: 'nasdaq-shareholder-agreements',
    name: 'Shareholder & Investor Agreements',
    category: 'Corporate',
    required: true,
    description: 'All agreements between company and shareholders, including voting, drag-along, and information rights.',
    estimatedDays: 15,
    template_url: '/templates/shareholder-agreements-nasdaq.pdf',
    regulatory: 'SEC Reg S-K Item 13; Securities Act Section 4',
    checklist: [
      'Shareholder rights agreements',
      'Voting agreements',
      'Drag-along and tag-along agreements',
      'Co-sale rights documentation',
      'Registration rights agreements',
      'Anti-dilution provisions',
      'Redemption and repurchase agreements',
      'Information rights agreements',
    ],
  },
  {
    id: 'nasdaq-founder-shareholder-docs',
    name: 'Founder & Key Shareholder Documentation',
    category: 'Corporate',
    required: true,
    description: 'Agreements with founders including vesting schedules, repurchase rights, and founder equity documentation.',
    estimatedDays: 10,
    regulatory: 'SEC Reg S-K Item 5 & 13',
    checklist: [
      'Founder share purchase agreements',
      'Vesting schedule documentation',
      'Repurchase right agreements',
      'Restricted stock certificates',
      'Founder non-compete agreements',
      'Assignment of pre-company IP',
      'Good leaver/bad leaver provisions',
    ],
  },
  {
    id: 'nasdaq-stock-plans',
    name: 'Stock Option & Incentive Plans',
    category: 'Corporate',
    required: true,
    description: 'Complete documentation of equity compensation plans including option plans, RSU plans, and ESPP.',
    estimatedDays: 10,
    template_url: '/templates/stock-plans-nasdaq.pdf',
    regulatory: 'SEC Reg S-K Item 5 & 13; ASC 718 Stock Compensation',
    checklist: [
      'Stock option plan document',
      'Individual option grant agreements',
      'Restricted stock unit plan',
      'Employee Stock Purchase Plan (ESPP)',
      'Non-qualified deferred compensation plans',
      'Plan amendment documentation',
      'Board and shareholder approval',
      'Option pricing and valuation methodology',
    ],
  },
  {
    id: 'nasdaq-warrant-convertible',
    name: 'Warrants, Convertible Notes & Instruments',
    category: 'Corporate',
    required: false,
    description: 'Documentation of all outstanding warrants, convertible securities, and derivative instruments.',
    estimatedDays: 10,
    regulatory: 'SEC Reg S-K Item 5 & 13; Regulation S-X Rule 3-04',
    checklist: [
      'Warrant agreements and terms',
      'Convertible note documentation',
      'Conversion pricing and mechanics',
      'Warrant exercise procedures',
      'Outstanding warrant registers',
      'Convertible security valuation',
      'Anti-dilution provisions',
    ],
  },

  // ────────────────── COMPLIANCE DOCUMENTS ──────────────────
  {
    id: 'nasdaq-internal-controls',
    name: 'Internal Controls Assessment & SOX 404',
    category: 'Compliance',
    required: true,
    description: 'Documentation of internal control framework and management assessment per SOX 404 requirements.',
    estimatedDays: 45,
    template_url: '/templates/sox404-nasdaq.pdf',
    regulatory: 'Sarbanes-Oxley Act Section 404; COSO Framework',
    checklist: [
      'Control framework documentation (COSO)',
      'Risk assessment and control mapping',
      'Process documentation and flowcharts',
      'Control testing results',
      'Management certification of control effectiveness',
      'Auditor attestation on internal controls',
      'Remediation plans for control deficiencies',
      'Material weaknesses and significant deficiencies',
    ],
  },
  {
    id: 'nasdaq-compliance-policies',
    name: 'Compliance Program & Policies',
    category: 'Compliance',
    required: true,
    description: 'Formal compliance program including regulatory compliance policies, training records, and certifications.',
    estimatedDays: 20,
    template_url: '/templates/compliance-program-nasdaq.pdf',
    regulatory: 'SEC Reg S-K Item 1(c); Industry Regulations',
    checklist: [
      'Compliance policy manual',
      'Regulatory compliance checklist',
      'Training records for all employees',
      'Anti-corruption/FCPA compliance documentation',
      'Sanctions screening procedures',
      'Data privacy and cybersecurity policies',
      'Environmental compliance certifications',
      'Health and safety compliance records',
    ],
  },
  {
    id: 'nasdaq-environmental-social',
    name: 'Environmental, Social & Governance (ESG) Disclosure',
    category: 'Compliance',
    required: false,
    description: 'ESG metrics and disclosures covering environmental impact, labor practices, and governance.',
    estimatedDays: 30,
    template_url: '/templates/esg-nasdaq.pdf',
    regulatory: 'SEC Climate Disclosure Rules; SASB Standards',
    checklist: [
      'Environmental policy and carbon footprint',
      'Water usage and waste management',
      'Diversity and inclusion metrics',
      'Employee wellness and safety programs',
      'Supply chain labor practices',
      'Community engagement initiatives',
      'Board diversity disclosures',
      'Executive compensation ESG metrics',
    ],
  },
  {
    id: 'nasdaq-insurance',
    name: 'Insurance Coverage & Policies',
    category: 'Compliance',
    required: true,
    description: 'Documentation of all insurance policies including D&O, general liability, property, and specialized coverage.',
    estimatedDays: 10,
    regulatory: 'SEC Reg S-K Item 13',
    checklist: [
      'Directors & Officers (D&O) liability insurance',
      'General liability insurance',
      'Property and casualty insurance',
      'Workers\' compensation insurance',
      'Cyber liability insurance',
      'Product liability insurance (if applicable)',
      'Insurance policies and certificates',
      'Claims history and coverage summaries',
    ],
  },
  {
    id: 'nasdaq-risk-assessment',
    name: 'Risk Assessment & Management Framework',
    category: 'Compliance',
    required: true,
    description: 'Comprehensive risk identification, assessment, and mitigation framework covering operational, financial, and strategic risks.',
    estimatedDays: 25,
    template_url: '/templates/risk-assessment-nasdaq.pdf',
    regulatory: 'SEC Reg S-K Item 1A; Risk Management Framework',
    checklist: [
      'Risk identification and mapping',
      'Risk assessment methodology and scoring',
      'Risk mitigation strategies and controls',
      'Key risk indicators and monitoring',
      'Disaster recovery and business continuity plans',
      'Crisis management procedures',
      'Risk reporting and governance structure',
      'Risk appetite and tolerance documentation',
    ],
  },
];

// ═════════════════════════════════════════════════════════════════════════════
// NYSE DOCUMENT REQUIREMENTS
// ═════════════════════════════════════════════════════════════════════════════

export const NYSE_DOCUMENTS: FilingDocument[] = [
  // Inherits most NASDAQ documents with additional requirements
  ...NASDAQ_DOCUMENTS,
  // Additional NYSE-specific requirements
  {
    id: 'nyse-audit-committee-financial-expert',
    name: 'Audit Committee Financial Expert Certification',
    category: 'Governance',
    required: true,
    description: 'Certification that at least one audit committee member qualifies as financial expert per NYSE standards.',
    estimatedDays: 5,
    regulatory: 'NYSE Listed Company Manual 303A.07; SOX 407',
    checklist: [
      'Director biography with financial expertise',
      'Certification of financial expert status',
      'Audit committee chair financial background',
      'Specific accounting and auditing experience',
    ],
  },
  {
    id: 'nyse-compensation-committee-charter',
    name: 'Compensation Committee Charter',
    category: 'Governance',
    required: true,
    description: 'Formal charter for compensation committee with detailed responsibilities and independence requirements.',
    estimatedDays: 8,
    regulatory: 'NYSE Listed Company Manual 303A.05',
    checklist: [
      'Committee charter document',
      'Committee member independence verification',
      'Committee responsibilities and authority',
      'Compensation philosophy statement',
      'Executive compensation review procedures',
      'Say-on-pay voting procedures',
    ],
  },
];

// ═════════════════════════════════════════════════════════════════════════════
// TSX DOCUMENT REQUIREMENTS (CANADIAN IPO)
// ═════════════════════════════════════════════════════════════════════════════

export const TSX_DOCUMENTS: FilingDocument[] = [
  // ────────────────── FINANCIAL DOCUMENTS ──────────────────
  {
    id: 'tsx-financial-statements',
    name: 'Audited Financial Statements (2-3 years)',
    category: 'Financial',
    required: true,
    description: 'Full audited financial statements prepared in accordance with IFRS for the last 2-3 fiscal years.',
    estimatedDays: 35,
    template_url: '/templates/financial-statements-tsx.pdf',
    regulatory: 'NI 41-101 s.4.2; CSA Rule 52-102; IFRS',
    checklist: [
      'Consolidated Statement of Financial Position',
      'Consolidated Statement of Comprehensive Income',
      'Consolidated Statement of Changes in Equity',
      'Consolidated Statement of Cash Flows',
      'Notes to Consolidated Financial Statements',
      'Auditor\'s Opinion Letter',
      'Management Discussion & Analysis (MD&A)',
      'CPAB registered auditor report',
    ],
  },
  {
    id: 'tsx-financial-projections',
    name: 'Financial Projections & Forecasts',
    category: 'Financial',
    required: true,
    description: 'Management projections for 3-5 years including revenue, EBITDA, net income, and cash flow forecasts.',
    estimatedDays: 25,
    template_url: '/templates/projections-tsx.xlsx',
    regulatory: 'NI 41-101 s.13.1; CSA guidance on forecasts',
    checklist: [
      '3-5 year revenue and earnings projections',
      'EBITDA and operating cash flow forecasts',
      'Balance sheet and working capital projections',
      'Key assumptions and methodology',
      'Sensitivity analysis',
      'Management certification',
      'Comparison to historical results',
    ],
  },
  {
    id: 'tsx-pro-forma-financials',
    name: 'Pro-forma Financial Statements',
    category: 'Financial',
    required: true,
    description: 'Pro-forma statements reflecting impact of acquisitions, reorganizations, or significant transactions.',
    estimatedDays: 20,
    template_url: '/templates/proforma-tsx.pdf',
    regulatory: 'NI 41-101 s.4.9; Regulation 91-102',
    checklist: [
      'Pro-forma consolidated financial statements',
      'Pro-forma balance sheet and income statement',
      'Assumptions and adjustments narrative',
      'Pro-forma cash flow statements',
      'Auditor consent and review',
    ],
  },
  {
    id: 'tsx-tax-history',
    name: 'Income Tax History & Returns',
    category: 'Financial',
    required: true,
    description: 'Complete federal and provincial income tax returns for the last 3-5 years with all schedules.',
    estimatedDays: 10,
    regulatory: 'NI 41-101 s.13.3',
    checklist: [
      'Federal T2 returns (last 5 years)',
      'Provincial income tax returns',
      'NOL and tax credit documentation',
      'Any reassessments or disputes',
      'Tax clearance certificates',
      'CRA audit history',
    ],
  },

  // ────────────────── LEGAL DOCUMENTS ──────────────────
  {
    id: 'tsx-articles-incorporation',
    name: 'Articles of Incorporation/Amalgamation',
    category: 'Legal',
    required: true,
    description: 'Certified articles of incorporation reflecting all amendments and current share capital authorization.',
    estimatedDays: 10,
    template_url: '/templates/articles-tsx.pdf',
    regulatory: 'NI 41-101 s.2.1; TSX Company Manual s.309',
    checklist: [
      'Original Articles of Incorporation',
      'All Articles Amendments (certified)',
      'Certificate of Status from provincial registry',
      'Authorized share capital',
      'Voting rights and preferences',
      'Board composition',
      'Anti-takeover provisions',
    ],
  },
  {
    id: 'tsx-bylaws',
    name: 'Bylaws & Corporate Governance Documents',
    category: 'Legal',
    required: true,
    description: 'Current bylaws establishing board procedures, committee structure, and shareholder meeting protocols.',
    estimatedDays: 12,
    template_url: '/templates/bylaws-tsx.pdf',
    regulatory: 'NI 41-101 s.2.4; TSX Company Manual s.481',
    checklist: [
      'Current Bylaws (restated)',
      'Audit Committee Charter',
      'Compensation Committee Charter (if applicable)',
      'Nominating & Corporate Governance Committee Charter',
      'Board procedures and meeting protocols',
      'Officer roles and appointment procedures',
      'Shareholder meeting procedures',
    ],
  },
  {
    id: 'tsx-ip-documentation',
    name: 'Intellectual Property & Technology Documentation',
    category: 'Legal',
    required: true,
    description: 'Complete IP portfolio including patents, trademarks, copyrights, trade secrets, and technology licenses.',
    estimatedDays: 25,
    regulatory: 'NI 41-101 s.13; Intellectual Property Laws',
    checklist: [
      'Patent portfolio (Canadian and international)',
      'Trademark registrations',
      'Copyright registrations',
      'Trade secret protection documentation',
      'Technology transfer/license agreements',
      'IP acquisition history',
      'IP litigation history',
      'Third-party IP infringement assessment',
    ],
  },
  {
    id: 'tsx-material-contracts',
    name: 'Material Contracts Disclosure',
    category: 'Legal',
    required: true,
    description: 'List and copies of all material contracts including customer, supplier, financing, and partnership agreements.',
    estimatedDays: 20,
    regulatory: 'NI 41-101 s.10.1(c)',
    checklist: [
      'List of all material contracts (>$X)',
      'Major customer/supplier agreements',
      'Bank debt and financing agreements',
      'Operating leases (real estate, equipment)',
      'Licensing and royalty agreements',
      'Partnership and joint venture agreements',
      'Termination and change of control provisions',
    ],
  },
  {
    id: 'tsx-litigation',
    name: 'Litigation & Legal Proceedings',
    category: 'Legal',
    required: true,
    description: 'Disclosure of all material pending, threatened, or settled litigation and regulatory proceedings.',
    estimatedDays: 10,
    regulatory: 'NI 41-101 s.13.4; CSA guidance',
    checklist: [
      'Pending litigation list',
      'Threatened claims disclosure',
      'Regulatory investigations',
      'Settlement agreements',
      'Contingent liability estimates',
      'Insurance coverage for claims',
      'Litigation counsel assessment',
    ],
  },
  {
    id: 'tsx-licenses-permits',
    name: 'Licenses, Permits & Regulatory Approvals',
    category: 'Legal',
    required: true,
    description: 'Documentation of all licenses, permits, certifications, and regulatory approvals for operations.',
    estimatedDays: 15,
    regulatory: 'NI 41-101 s.13.1',
    checklist: [
      'Business licenses (federal, provincial, municipal)',
      'Industry-specific permits and certifications',
      'Professional licenses',
      'Regulatory exemptions and approvals',
      'Environmental permits',
      'Health and safety certifications',
      'Renewal status and dates',
    ],
  },

  // ────────────────── GOVERNANCE DOCUMENTS ──────────────────
  {
    id: 'tsx-board-resolutions',
    name: 'Board of Directors Resolutions',
    category: 'Governance',
    required: true,
    description: 'Board resolutions approving IPO, prospectus, corporate structure, and major transactions.',
    estimatedDays: 5,
    template_url: '/templates/board-resolutions-tsx.pdf',
    regulatory: 'NI 41-101 s.2.9; TSX Company Manual s.303',
    checklist: [
      'Resolution authorizing IPO',
      'Resolution approving prospectus contents',
      'Resolutions on board/committee composition',
      'Director independence resolutions',
      'Authorization to execute IPO documents',
      'Certified board minutes',
      'Secretary certificate of authority',
    ],
  },
  {
    id: 'tsx-shareholder-resolutions',
    name: 'Shareholder Meeting Resolutions',
    category: 'Governance',
    required: true,
    description: 'Shareholder approvals for capitalization, compensation plans, and governance matters.',
    estimatedDays: 10,
    template_url: '/templates/shareholder-resolutions-tsx.pdf',
    regulatory: 'NI 41-101 s.2.10; CBCA/OBCA',
    checklist: [
      'Shareholder approval of authorized shares',
      'Stock option/compensation plan approvals',
      'Director appointment resolutions',
      'Named executive compensation approvals',
      'Board composition approval',
      'Voting results documentation',
      'Meeting minutes and certifications',
    ],
  },
  {
    id: 'tsx-officer-directors',
    name: 'Executive Officers & Director Profiles',
    category: 'Governance',
    required: true,
    description: 'Detailed profiles of directors, executive officers, and key management with backgrounds and compensation.',
    estimatedDays: 12,
    template_url: '/templates/officer-profiles-tsx.pdf',
    regulatory: 'NI 41-101 s.2.7; Form 51-102F2',
    checklist: [
      'Director biographical information',
      'Executive officer backgrounds',
      'Business experience (5+ years)',
      'Committee assignments',
      'Compensation disclosure',
      'Related party transactions',
      'Director independence status',
      'Beneficial ownership percentages',
    ],
  },
  {
    id: 'tsx-corporate-governance',
    name: 'Corporate Governance Disclosure',
    category: 'Governance',
    required: true,
    description: 'Formal disclosure of corporate governance practices and policies per TSX requirements.',
    estimatedDays: 15,
    template_url: '/templates/governance-disclosure-tsx.pdf',
    regulatory: 'NI 41-101 s.2.3; TSX Company Manual s.481',
    checklist: [
      'Code of Conduct/Ethics',
      'Board diversity policy',
      'Director independence standards',
      'Committee charter compliance',
      'Whistleblower procedures',
      'Insider trading policies',
      'Executive compensation governance',
      'Director tenure and nomination process',
    ],
  },

  // ────────────────── CORPORATE DOCUMENTS ──────────────────
  {
    id: 'tsx-cap-table',
    name: 'Capitalization Table & Security Documentation',
    category: 'Corporate',
    required: true,
    description: 'Detailed capitalization table showing all shares, options, warrants, and conversion rights.',
    estimatedDays: 15,
    template_url: '/templates/cap-table-tsx.xlsx',
    regulatory: 'NI 41-101 s.5.1; Form 51-102F2',
    checklist: [
      'Complete capitalization table',
      'Share register',
      'Fully diluted capitalization',
      'Option and warrant registers',
      'Conversion pricing and mechanics',
      'Dividend and liquidation preferences',
      'Voting agreements',
      'Beneficial ownership summary',
    ],
  },
  {
    id: 'tsx-shareholders',
    name: 'Shareholder & Investor Agreements',
    category: 'Corporate',
    required: true,
    description: 'All agreements with shareholders including voting, drag-along, information rights, and registration rights.',
    estimatedDays: 15,
    regulatory: 'NI 41-101 s.5 & s.13',
    checklist: [
      'Voting agreements',
      'Shareholders\' agreement',
      'Drag-along and tag-along rights',
      'Co-sale agreements',
      'Registration rights agreements',
      'Information rights agreements',
      'Anti-dilution provisions',
      'Redemption agreements',
    ],
  },
  {
    id: 'tsx-stock-plans',
    name: 'Equity Incentive Plans & Option Documentation',
    category: 'Corporate',
    required: true,
    description: 'Stock option plans, RSU plans, and equity compensation documentation with plan documents and agreements.',
    estimatedDays: 10,
    template_url: '/templates/equity-plans-tsx.pdf',
    regulatory: 'NI 41-101 s.5; Form 51-102F2',
    checklist: [
      'Stock option plan document',
      'Option grant agreements',
      'Restricted stock unit plan (if applicable)',
      'Deferred share unit plan (if applicable)',
      'Plan participant register',
      'Board and shareholder approvals',
      'Option valuation methodology',
      'Plan amendment history',
    ],
  },

  // ────────────────── COMPLIANCE DOCUMENTS ──────────────────
  {
    id: 'tsx-internal-controls',
    name: 'Internal Control & Risk Management',
    category: 'Compliance',
    required: true,
    description: 'Documentation of internal controls, risk assessment, and compliance management framework.',
    estimatedDays: 30,
    template_url: '/templates/internal-controls-tsx.pdf',
    regulatory: 'NI 41-101 s.3.3; CSA guidance on controls',
    checklist: [
      'Internal control framework documentation',
      'Risk identification and assessment',
      'Control design and implementation',
      'Control testing results',
      'Management representation',
      'Control deficiencies and remediation',
      'Disclosure controls assessment',
      'Audit committee review',
    ],
  },
  {
    id: 'tsx-compliance-legal',
    name: 'Compliance & Regulatory Filing History',
    category: 'Compliance',
    required: true,
    description: 'Documentation of regulatory compliance, prior filings, and any regulatory actions or deficiencies.',
    estimatedDays: 15,
    regulatory: 'NI 41-101 s.13.1; CSA guidance',
    checklist: [
      'Prior regulatory filings and reports',
      'CRA audit history',
      'Provincial regulatory compliance',
      'Any regulatory violations or deficiencies',
      'Compliance certifications',
      'Environmental compliance records',
      'Health and safety compliance',
      'Anti-corruption policies and training',
    ],
  },
  {
    id: 'tsx-insurance',
    name: 'Insurance Policies & Coverage',
    category: 'Compliance',
    required: true,
    description: 'Complete insurance documentation including D&O, liability, property, and specialized coverage.',
    estimatedDays: 10,
    regulatory: 'NI 41-101 s.13',
    checklist: [
      'Directors & Officers liability insurance',
      'General and product liability insurance',
      'Property and casualty insurance',
      'Workers\' compensation coverage',
      'Cyber liability insurance',
      'Insurance policy summary sheet',
      'Coverage limits and deductibles',
      'Claims history and status',
    ],
  },
];

// ═════════════════════════════════════════════════════════════════════════════
// TSX VENTURE EXCHANGE DOCUMENT REQUIREMENTS
// ═════════════════════════════════════════════════════════════════════════════

export const TSXV_DOCUMENTS: FilingDocument[] = [
  // Inherits TSX documents but with modified requirements for venture companies
  // Venture companies have streamlined requirements
  ...TSX_DOCUMENTS.map(doc => ({
    ...doc,
    // Reduce estimated days for venture companies (faster process)
    estimatedDays: Math.ceil(doc.estimatedDays * 0.8),
  })).slice(0, 20), // Streamlined to 20 key documents
  {
    id: 'tsxv-business-plan',
    name: 'Business Plan & Development Stage Assessment',
    category: 'Financial',
    required: true,
    description: 'Business plan demonstrating market opportunity, competitive advantage, and growth strategy.',
    estimatedDays: 20,
    template_url: '/templates/business-plan-tsxv.pdf',
    regulatory: 'TSXV Handbook s.1.1; Development Stage Company',
    checklist: [
      'Executive summary',
      'Market analysis and opportunity',
      'Competitive landscape',
      'Business model and revenue strategy',
      'Marketing and sales plan',
      'Operations and management',
      '3-year financial projections',
      'Use of proceeds from offering',
    ],
  },
];

// ═════════════════════════════════════════════════════════════════════════════
// CANADIAN SECURITIES EXCHANGE (CSE) DOCUMENT REQUIREMENTS
// ═════════════════════════════════════════════════════════════════════════════

export const CSE_DOCUMENTS: FilingDocument[] = [
  // Streamlined requirements for CSE (smallest, fastest exchange)
  ...TSX_DOCUMENTS.slice(0, 15), // Core documents only
];

// ═════════════════════════════════════════════════════════════════════════════
// MASTER EXCHANGE DOCUMENT CONFIGURATION
// ═════════════════════════════════════════════════════════════════════════════

export const EXCHANGE_DOCUMENT_REQUIREMENTS: Record<ExchangeCode, ExchangeDocumentConfig> = {
  nasdaq: {
    exchangeId: 'nasdaq',
    exchangeName: 'NASDAQ Stock Market',
    country: 'US',
    regulator: 'Securities and Exchange Commission (SEC)',
    documents: NASDAQ_DOCUMENTS,
    regulatoryContact: {
      email: 'listingqualifications@nasdaq.com',
      website: 'https://www.nasdaq.com/listings',
    },
  },
  nyse: {
    exchangeId: 'nyse',
    exchangeName: 'New York Stock Exchange',
    country: 'US',
    regulator: 'Securities and Exchange Commission (SEC)',
    documents: NYSE_DOCUMENTS,
    regulatoryContact: {
      email: 'listed@nyse.com',
      website: 'https://www.nyse.com/listings',
    },
  },
  tsx: {
    exchangeId: 'tsx',
    exchangeName: 'Toronto Stock Exchange',
    country: 'CA',
    regulator: 'Ontario Securities Commission (OSC)',
    documents: TSX_DOCUMENTS,
    regulatoryContact: {
      email: 'listings@tsx.com',
      website: 'https://www.tsx.com/listings',
    },
  },
  tsxv: {
    exchangeId: 'tsxv',
    exchangeName: 'TSX Venture Exchange',
    country: 'CA',
    regulator: 'British Columbia Securities Commission (BCSC)',
    documents: TSXV_DOCUMENTS,
    regulatoryContact: {
      email: 'listedcompanies@tsxv.com',
      website: 'https://www.tsxv.com/',
    },
  },
  cse: {
    exchangeId: 'cse',
    exchangeName: 'Canadian Securities Exchange',
    country: 'CA',
    regulator: 'Ontario Securities Commission (OSC)',
    documents: CSE_DOCUMENTS,
    regulatoryContact: {
      email: 'listings@cse-csx.com',
      website: 'https://www.cse-csx.com/',
    },
  },
};

// ═════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Get document configuration for a specific exchange
 */
export function getExchangeDocumentConfig(exchangeId: ExchangeCode): ExchangeDocumentConfig | undefined {
  return EXCHANGE_DOCUMENT_REQUIREMENTS[exchangeId];
}

/**
 * Get all required documents for an exchange
 */
export function getRequiredDocuments(exchangeId: ExchangeCode): FilingDocument[] {
  const config = getExchangeDocumentConfig(exchangeId);
  return config ? config.documents.filter(doc => doc.required) : [];
}

/**
 * Get all documents by category for an exchange
 */
export function getDocumentsByCategory(
  exchangeId: ExchangeCode,
  category: DocumentCategory
): FilingDocument[] {
  const config = getExchangeDocumentConfig(exchangeId);
  return config ? config.documents.filter(doc => doc.category === category) : [];
}

/**
 * Calculate total estimated days to complete all documents
 */
export function calculateTotalEstimatedDays(exchangeId: ExchangeCode): number {
  const config = getExchangeDocumentConfig(exchangeId);
  if (!config) return 0;

  // Take max of required documents (can be done in parallel) plus 30% buffer for review
  const requiredDocs = config.documents.filter(doc => doc.required);
  const maxDays = Math.max(...requiredDocs.map(doc => doc.estimatedDays), 0);
  return Math.ceil(maxDays * 1.3);
}

/**
 * Get document checklist for a specific document ID
 */
export function getDocumentChecklist(
  exchangeId: ExchangeCode,
  documentId: string
): string[] {
  const config = getExchangeDocumentConfig(exchangeId);
  const doc = config?.documents.find(d => d.id === documentId);
  return doc?.checklist || [];
}

/**
 * Count documents by category
 */
export function countDocumentsByCategory(exchangeId: ExchangeCode): Record<DocumentCategory, number> {
  const config = getExchangeDocumentConfig(exchangeId);
  const categories: Record<DocumentCategory, number> = {
    Financial: 0,
    Legal: 0,
    Governance: 0,
    Corporate: 0,
    Compliance: 0,
  };

  if (!config) return categories;

  config.documents.forEach(doc => {
    categories[doc.category]++;
  });

  return categories;
}

/**
 * Get all documents across all exchanges (for search)
 */
export function getAllDocuments(): FilingDocument[] {
  const allDocs: FilingDocument[] = [];
  const seen = new Set<string>();

  Object.values(EXCHANGE_DOCUMENT_REQUIREMENTS).forEach(config => {
    config.documents.forEach(doc => {
      if (!seen.has(doc.id)) {
        allDocs.push(doc);
        seen.add(doc.id);
      }
    });
  });

  return allDocs;
}

/**
 * Search documents by name or description
 */
export function searchDocuments(query: string, exchangeId?: ExchangeCode): FilingDocument[] {
  const queryLower = query.toLowerCase();
  let docs = exchangeId ? EXCHANGE_DOCUMENT_REQUIREMENTS[exchangeId]?.documents || [] : getAllDocuments();

  return docs.filter(doc =>
    doc.name.toLowerCase().includes(queryLower) ||
    doc.description.toLowerCase().includes(queryLower) ||
    doc.checklist.some(item => item.toLowerCase().includes(queryLower))
  );
}
