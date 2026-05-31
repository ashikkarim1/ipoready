/**
 * Exchange-Specific IPO Guides
 * Regulatory requirements, timelines, and cost breakdowns by exchange
 */

export const EXCHANGE_GUIDES = {
  TSX: {
    name: 'Toronto Venture Exchange',
    jurisdiction: 'Canada',
    region: 'ca-central-1',
    currency: 'CAD',
    timeline: {
      min: 18,
      max: 24,
      unit: 'months',
    },
    costs: {
      lowEnd: 2500000,
      highEnd: 4000000,
      currency: 'CAD',
      breakdown: [
        { item: 'Legal fees (securities counsel)', amount: 800000, note: 'Big Law firm required' },
        { item: 'Audit and financial statements', amount: 600000, note: 'Big 4 auditor required' },
        { item: 'Investment banker/underwriter', amount: 500000, note: '3-5% of capital raised' },
        { item: 'Exchange listing fee', amount: 50000, note: 'One-time' },
        { item: 'Transfer agent', amount: 20000, note: 'Annual' },
        { item: 'Regulatory filing (SEDAR+)', amount: 10000, note: 'Provincial + federal' },
        { item: 'Continuous disclosure compliance', amount: 100000, note: 'Annual ongoing' },
      ],
    },
    requirements: [
      'Audit: Must be Big 4 or equivalent',
      'Board: Minimum 3 directors, majority independent',
      'Governance: SOX-equivalent controls',
      'Cap Table: Clean cap table (<10 equity exceptions)',
      'Prospectus: Form 41-101F1 (comprehensive)',
      'Financial: 2+ years audited financials',
      'Disclosure: NI 51-102 (continuous disclosure)',
      'Audit Committee: Required',
      'ESG: Climate/governance disclosures encouraged',
    ],
    timeline_phases: [
      { phase: 'Pre-Planning', months: 1 },
      { phase: 'Corporate Restructuring', months: 2 },
      { phase: 'Financial Audit', months: 3 },
      { phase: 'Legal Documentation', months: 3 },
      { phase: 'Regulatory Filing', months: 3 },
      { phase: 'Marketing/Roadshow', months: 6 },
      { phase: 'Listing Application', months: 2 },
      { phase: 'Post-Listing', months: 1 },
    ],
    pros: [
      'Institutional investor access',
      'High liquidity (300M+ shares traded daily)',
      'Strong regulatory protection',
      'Brand value (most prestigious Canadian exchange)',
    ],
    cons: [
      'Expensive (highest cost)',
      'Long timeline (18-24 months)',
      'Rigorous audit requirements',
      'Ongoing compliance burden',
    ],
    ideal_for: 'Profitable companies, $50M+ revenue, seeking institutional capital',
  },

  NASDAQ: {
    name: 'NASDAQ Stock Market',
    jurisdiction: 'United States',
    region: 'us-east-1',
    currency: 'USD',
    timeline: {
      min: 12,
      max: 18,
      unit: 'months',
    },
    costs: {
      lowEnd: 4000000,
      highEnd: 7000000,
      currency: 'USD',
      breakdown: [
        { item: 'Legal fees (securities counsel)', amount: 1200000, note: 'US securities law required' },
        { item: 'Audit and financial statements', amount: 800000, note: 'Big 4 auditor required' },
        { item: 'Investment banker/underwriter', amount: 1500000, note: '5-7% of capital raised' },
        { item: 'Exchange listing fee', amount: 125000, note: 'One-time' },
        { item: 'Transfer agent', amount: 30000, note: 'Annual' },
        { item: 'SEC filing (EDGAR)', amount: 50000, note: 'Federal + state' },
        { item: 'Investor relations', amount: 200000, note: 'First year launch' },
        { item: 'Continuous disclosure compliance', amount: 300000, note: 'Annual ongoing' },
      ],
    },
    requirements: [
      'Audit: Must be Big 4 or PCAOB-registered',
      'Board: Minimum 3 directors, majority independent',
      'Governance: Sarbanes-Oxley Section 302/404',
      'Cap Table: Clean cap table, US tax compliance',
      'Prospectus: Form S-1 (detailed)',
      'Financial: 2+ years audited financials',
      'Disclosure: SEC Regulation S-K compliance',
      'Audit Committee: Required (financial expert)',
      'Compensation Committee: Required',
      'FINRA: Compliance officer required',
    ],
    timeline_phases: [
      { phase: 'Pre-Planning', months: 1 },
      { phase: 'Corporate Restructuring', months: 2 },
      { phase: 'Financial Audit', months: 3 },
      { phase: 'Legal Documentation', months: 2 },
      { phase: 'Regulatory Filing', months: 3 },
      { phase: 'Marketing/Roadshow', months: 4 },
      { phase: 'Listing Application', months: 2 },
      { phase: 'Post-Listing', months: 1 },
    ],
    pros: [
      'Global brand prestige',
      'Largest institutional investor base',
      'Higher liquidity (1B+ shares daily)',
      'Enables M&A currency (stock-for-stock deals)',
    ],
    cons: [
      'Highest cost (4M-7M)',
      'Aggressive timeline (12-18 months)',
      'US tax complexity (Form 20-F for foreign issuers)',
      'SOX compliance burden ($2M+ annual)',
    ],
    ideal_for: 'High-growth tech, $100M+ revenue, seeking global capital',
  },

  CSE: {
    name: 'Canadian Securities Exchange',
    jurisdiction: 'Canada',
    region: 'ca-central-1',
    currency: 'CAD',
    timeline: {
      min: 4,
      max: 6,
      unit: 'months',
    },
    costs: {
      lowEnd: 300000,
      highEnd: 500000,
      currency: 'CAD',
      breakdown: [
        { item: 'Legal fees (securities counsel)', amount: 150000, note: 'Small to mid-size firm OK' },
        { item: 'Audit or review engagement', amount: 80000, note: 'Review OK, full audit not required' },
        { item: 'CSE listing fee', amount: 20000, note: 'One-time' },
        { item: 'Transfer agent', amount: 15000, note: 'Annual' },
        { item: 'Regulatory filing (SEDAR+)', amount: 5000, note: 'Provincial filing' },
        { item: 'IR/marketing', amount: 30000, note: 'Launch push' },
      ],
    },
    requirements: [
      'Audit: Review (not full audit) acceptable',
      'Board: Minimum 1 director (can be yourself)',
      'Governance: Basic disclosure-only model',
      'Cap Table: Reasonably clean (some exceptions OK)',
      'Prospectus: Form CSE-F1 (shorter)',
      'Financial: 1 year financial statements or pro forma',
      'Disclosure: CSE Policy 3 (disclosure obligations)',
      'Escrow: Yes (80% of floated shares)',
    ],
    timeline_phases: [
      { phase: 'Pre-Planning', months: 1 },
      { phase: 'Corporate Restructuring', months: 1 },
      { phase: 'Financial Review', months: 1 },
      { phase: 'Legal Documentation', months: 1 },
      { phase: 'Regulatory Filing', months: 1 },
      { phase: 'Listing Decision', months: 1 },
      { phase: 'Post-Listing', months: 0 },
    ],
    pros: [
      'Fast timeline (4-6 months)',
      'Lowest cost ($300K-500K)',
      'Founder-friendly (minimal governance)',
      'Early stage OK (pre-revenue acceptable)',
    ],
    cons: [
      'Lower liquidity (smaller investor base)',
      'Less institutional interest',
      'Higher risk perception',
      'Escrow requirements (lock-up period)',
    ],
    ideal_for: 'Early-stage, emerging growth, $1M-20M revenue, capital-light models',
  },

  OTC: {
    name: 'Over-The-Counter Markets (OTC Pink)',
    jurisdiction: 'United States',
    region: 'us-east-1',
    currency: 'USD',
    timeline: {
      min: 2,
      max: 4,
      unit: 'months',
    },
    costs: {
      lowEnd: 50000,
      highEnd: 100000,
      currency: 'USD',
      breakdown: [
        { item: 'Legal fees', amount: 30000, note: 'Basic documentation only' },
        { item: 'OTC Markets fee', amount: 5000, note: 'Annual' },
        { item: 'Transfer agent (US)', amount: 10000, note: 'Annual' },
        { item: 'SEC filing (Form 10 or SB-2)', amount: 5000, note: 'If required' },
      ],
    },
    requirements: [
      'Audit: No audit required',
      'Board: No minimum board required',
      'Governance: Minimal governance',
      'Cap Table: No clean-up required',
      'Financial: Current disclosure (if Pink Current)',
      'Disclosure: OTC Markets disclosure rules',
      'No escrow (if compliant)',
    ],
    timeline_phases: [
      { phase: 'Pre-Planning', months: 0.5 },
      { phase: 'Corporate Setup', months: 0.5 },
      { phase: 'OTC Application', months: 1 },
      { phase: 'Trading', months: 2 },
    ],
    pros: [
      'Minimal cost ($50K-100K)',
      'Fast timeline (2-4 months)',
      'No audit requirement',
      'Founder retains full control',
    ],
    cons: [
      'Very low liquidity (bid-ask spreads huge)',
      'High fraud risk (pump & dump)',
      'Retail investor base only',
      'Hard to convert to real exchange',
      'Reputational risk',
    ],
    ideal_for: 'NOT RECOMMENDED for serious IPOs. Cash-light exits only.',
  },
}

export function getExchangeGuide(exchange: string) {
  return EXCHANGE_GUIDES[exchange as keyof typeof EXCHANGE_GUIDES] || null
}

export function recommendExchange(params: {
  revenue: number
  growthRate: number
  profitability: boolean
  sector: string
  targetCapitalRaised: number
  timeline: number
}): string {
  const { revenue, growthRate, profitability, sector, targetCapitalRaised, timeline } = params

  // Rule-based recommendation engine
  if (timeline < 6 && targetCapitalRaised < 5000000) return 'CSE'
  if (sector === 'tech' && growthRate > 50 && targetCapitalRaised > 50000000) return 'NASDAQ'
  if (profitability && revenue > 50000000 && targetCapitalRaised > 20000000) return 'TSX'
  if (revenue < 1000000 || !profitability) return 'CSE'
  if (targetCapitalRaised > 30000000 && timeline > 12) return 'NASDAQ'

  return 'TSX' // Default to TSX for mid-market
}
