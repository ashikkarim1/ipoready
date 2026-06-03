/**
 * Phase 2 Dummy Data
 * Comprehensive realistic data for IPO cost estimates, cap table scenarios,
 * financial tracking, listing requirements, corporate resolutions, and consent letters
 */

import { Exchange, ListingType, Currency } from '@/types'

// ─────────────────────── IPO COST ESTIMATES ───────────────────────

export interface IPOCostEstimate {
  id: string
  companyId?: string
  companyName: string
  sector: string
  listingType: ListingType
  targetExchange: Exchange
  estimatedMarketCap: number
  currency: Currency
  offeringSize: number
  estimatedDate: string
  costs: {
    underwriting: {
      fee: number
      description: string
    }
    legalFees: {
      issuersCount: number
      underwritersCount: number
      auditorsCount: number
      total: number
    }
    accountingFees: {
      auditPreparation: number
      attestation: number
      consultancy: number
      total: number
    }
    printingAndPostage: {
      prospectus: number
      regulatory: number
      marketing: number
      total: number
    }
    roadshowAndMarketing: {
      investor: number
      media: number
      digital: number
      total: number
    }
    transferAgent: {
      initial: number
      annual: number
    }
    exchangeListing: {
      applicationFee: number
      reviewFee: number
      annualFee: number
    }
    consulting: {
      priceOptimization: number
      disclosureConsult: number
      compliance: number
      total: number
    }
    miscellaneous: {
      accountingServices: number
      bankingServices: number
      insurance: number
      other: number
      total: number
    }
  }
  totalEstimatedCost: number
  costAsPercentageOfOffering: number
  timeline: {
    kickoff: string
    dueDigilligence: string
    prospectusFilingStart: string
    prospectusApproved: string
    roadshowBegins: string
    pricingDate: string
    listingDate: string
    totalMonths: number
  }
  assumptions: string[]
  riskFactors: string[]
}

export const IPO_COST_ESTIMATES: IPOCostEstimate[] = [
  {
    id: 'cost-est-001',
    companyName: 'TechVenture Solutions Inc.',
    sector: 'Software & Services',
    listingType: 'ipo',
    targetExchange: 'nasdaq',
    estimatedMarketCap: 750000000,
    currency: 'USD',
    offeringSize: 125000000,
    estimatedDate: '2026-09-15',
    costs: {
      underwriting: {
        fee: 6250000,
        description: '5% of offering size',
      },
      legalFees: {
        issuersCount: 450000,
        underwritersCount: 250000,
        auditorsCount: 200000,
        total: 900000,
      },
      accountingFees: {
        auditPreparation: 300000,
        attestation: 200000,
        consultancy: 150000,
        total: 650000,
      },
      printingAndPostage: {
        prospectus: 80000,
        regulatory: 60000,
        marketing: 90000,
        total: 230000,
      },
      roadshowAndMarketing: {
        investor: 200000,
        media: 150000,
        digital: 120000,
        total: 470000,
      },
      transferAgent: {
        initial: 50000,
        annual: 30000,
      },
      exchangeListing: {
        applicationFee: 500,
        reviewFee: 48500,
        annualFee: 55000,
      },
      consulting: {
        priceOptimization: 100000,
        disclosureConsult: 80000,
        compliance: 70000,
        total: 250000,
      },
      miscellaneous: {
        accountingServices: 40000,
        bankingServices: 35000,
        insurance: 60000,
        other: 25000,
        total: 160000,
      },
    },
    totalEstimatedCost: 9609000,
    costAsPercentageOfOffering: 7.69,
    timeline: {
      kickoff: '2026-01-15',
      dueDigilligence: '2026-03-30',
      prospectusFilingStart: '2026-04-15',
      prospectusApproved: '2026-07-01',
      roadshowBegins: '2026-08-01',
      pricingDate: '2026-09-08',
      listingDate: '2026-09-15',
      totalMonths: 8,
    },
    assumptions: [
      'No material litigation during process',
      'Market conditions remain stable',
      'No major organizational changes',
      'Auditors can complete work on schedule',
      'No SEC comment delays',
    ],
    riskFactors: [
      'Tech sector volatility could impact pricing',
      'Regulatory delays could extend timeline',
      'Market correction could reduce offering size',
      'Talent retention risks during IPO process',
    ],
  },
  {
    id: 'cost-est-002',
    companyName: 'Biotech Innovations Corp.',
    sector: 'Biotechnology',
    listingType: 'ipo',
    targetExchange: 'nasdaq',
    estimatedMarketCap: 1200000000,
    currency: 'USD',
    offeringSize: 200000000,
    estimatedDate: '2026-10-20',
    costs: {
      underwriting: {
        fee: 12000000,
        description: '6% of offering size for biotech',
      },
      legalFees: {
        issuersCount: 600000,
        underwritersCount: 400000,
        auditorsCount: 300000,
        total: 1300000,
      },
      accountingFees: {
        auditPreparation: 450000,
        attestation: 350000,
        consultancy: 200000,
        total: 1000000,
      },
      printingAndPostage: {
        prospectus: 150000,
        regulatory: 100000,
        marketing: 120000,
        total: 370000,
      },
      roadshowAndMarketing: {
        investor: 400000,
        media: 250000,
        digital: 150000,
        total: 800000,
      },
      transferAgent: {
        initial: 75000,
        annual: 45000,
      },
      exchangeListing: {
        applicationFee: 500,
        reviewFee: 48500,
        annualFee: 55000,
      },
      consulting: {
        priceOptimization: 150000,
        disclosureConsult: 120000,
        compliance: 100000,
        total: 370000,
      },
      miscellaneous: {
        accountingServices: 80000,
        bankingServices: 70000,
        insurance: 120000,
        other: 50000,
        total: 320000,
      },
    },
    totalEstimatedCost: 16384000,
    costAsPercentageOfOffering: 8.19,
    timeline: {
      kickoff: '2026-02-01',
      dueDigilligence: '2026-04-15',
      prospectusFilingStart: '2026-05-01',
      prospectusApproved: '2026-08-15',
      roadshowBegins: '2026-09-01',
      pricingDate: '2026-10-13',
      listingDate: '2026-10-20',
      totalMonths: 9,
    },
    assumptions: [
      'FDA approval timeline met',
      'Clinical trial success',
      'No IP litigation',
      'Key personnel remain stable',
    ],
    riskFactors: [
      'FDA regulatory delays',
      'Clinical trial setbacks',
      'Biotech sector valuation pressure',
      'Patent litigation risks',
    ],
  },
  {
    id: 'cost-est-003',
    companyName: 'Maple Minerals Ltd.',
    sector: 'Mining & Metals',
    listingType: 'ipo',
    targetExchange: 'tsx',
    estimatedMarketCap: 300000000,
    currency: 'CAD',
    offeringSize: 50000000,
    estimatedDate: '2026-08-10',
    costs: {
      underwriting: {
        fee: 3000000,
        description: '6% of offering size',
      },
      legalFees: {
        issuersCount: 200000,
        underwritersCount: 150000,
        auditorsCount: 100000,
        total: 450000,
      },
      accountingFees: {
        auditPreparation: 200000,
        attestation: 150000,
        consultancy: 100000,
        total: 450000,
      },
      printingAndPostage: {
        prospectus: 60000,
        regulatory: 40000,
        marketing: 50000,
        total: 150000,
      },
      roadshowAndMarketing: {
        investor: 150000,
        media: 80000,
        digital: 70000,
        total: 300000,
      },
      transferAgent: {
        initial: 40000,
        annual: 25000,
      },
      exchangeListing: {
        applicationFee: 500,
        reviewFee: 15000,
        annualFee: 12500,
      },
      consulting: {
        priceOptimization: 80000,
        disclosureConsult: 60000,
        compliance: 50000,
        total: 190000,
      },
      miscellaneous: {
        accountingServices: 30000,
        bankingServices: 25000,
        insurance: 50000,
        other: 20000,
        total: 125000,
      },
    },
    totalEstimatedCost: 4312500,
    costAsPercentageOfOffering: 8.63,
    timeline: {
      kickoff: '2026-01-20',
      dueDigilligence: '2026-03-15',
      prospectusFilingStart: '2026-04-01',
      prospectusApproved: '2026-06-15',
      roadshowBegins: '2026-07-01',
      pricingDate: '2026-08-03',
      listingDate: '2026-08-10',
      totalMonths: 7,
    },
    assumptions: [
      'No environmental setbacks',
      'Commodity prices stable',
      'Permitting on track',
      'No Indigenous consultation delays',
    ],
    riskFactors: [
      'Commodity price volatility',
      'Mining jurisdiction uncertainty',
      'Permitting delays',
      'Environmental review challenges',
    ],
  },
  {
    id: 'cost-est-004',
    companyName: 'FinTech Innovations Inc.',
    sector: 'Financial Technology',
    listingType: 'direct_listing',
    targetExchange: 'nyse',
    estimatedMarketCap: 2500000000,
    currency: 'USD',
    offeringSize: 0,
    estimatedDate: '2026-11-15',
    costs: {
      underwriting: {
        fee: 5000000,
        description: 'Direct listing - reduced banker fees',
      },
      legalFees: {
        issuersCount: 400000,
        underwritersCount: 200000,
        auditorsCount: 250000,
        total: 850000,
      },
      accountingFees: {
        auditPreparation: 350000,
        attestation: 300000,
        consultancy: 150000,
        total: 800000,
      },
      printingAndPostage: {
        prospectus: 80000,
        regulatory: 50000,
        marketing: 80000,
        total: 210000,
      },
      roadshowAndMarketing: {
        investor: 300000,
        media: 200000,
        digital: 200000,
        total: 700000,
      },
      transferAgent: {
        initial: 60000,
        annual: 40000,
      },
      exchangeListing: {
        applicationFee: 500,
        reviewFee: 68500,
        annualFee: 110000,
      },
      consulting: {
        priceOptimization: 120000,
        disclosureConsult: 100000,
        compliance: 80000,
        total: 300000,
      },
      miscellaneous: {
        accountingServices: 50000,
        bankingServices: 40000,
        insurance: 80000,
        other: 30000,
        total: 200000,
      },
    },
    totalEstimatedCost: 8184500,
    costAsPercentageOfOffering: 0.0,
    timeline: {
      kickoff: '2026-03-01',
      dueDigilligence: '2026-05-15',
      prospectusFilingStart: '2026-06-01',
      prospectusApproved: '2026-09-01',
      roadshowBegins: '2026-10-01',
      pricingDate: '2026-11-08',
      listingDate: '2026-11-15',
      totalMonths: 8,
    },
    assumptions: [
      'No regulatory delays for fintech',
      'Market conditions favorable for direct listing',
      'No major compliance issues',
    ],
    riskFactors: [
      'Regulatory scrutiny of fintech sector',
      'Market conditions for direct listings',
      'Cryptocurrency volatility',
      'Cybersecurity risks',
    ],
  },
  {
    id: 'cost-est-005',
    companyName: 'GreenEnergy Solutions Ltd.',
    sector: 'Renewable Energy',
    listingType: 'ipo',
    targetExchange: 'tsxv',
    estimatedMarketCap: 150000000,
    currency: 'CAD',
    offeringSize: 25000000,
    estimatedDate: '2026-09-01',
    costs: {
      underwriting: {
        fee: 1750000,
        description: '7% of offering size for junior market',
      },
      legalFees: {
        issuersCount: 150000,
        underwritersCount: 100000,
        auditorsCount: 75000,
        total: 325000,
      },
      accountingFees: {
        auditPreparation: 150000,
        attestation: 100000,
        consultancy: 75000,
        total: 325000,
      },
      printingAndPostage: {
        prospectus: 40000,
        regulatory: 30000,
        marketing: 35000,
        total: 105000,
      },
      roadshowAndMarketing: {
        investor: 100000,
        media: 60000,
        digital: 50000,
        total: 210000,
      },
      transferAgent: {
        initial: 30000,
        annual: 15000,
      },
      exchangeListing: {
        applicationFee: 250,
        reviewFee: 7500,
        annualFee: 5000,
      },
      consulting: {
        priceOptimization: 60000,
        disclosureConsult: 45000,
        compliance: 40000,
        total: 145000,
      },
      miscellaneous: {
        accountingServices: 20000,
        bankingServices: 15000,
        insurance: 35000,
        other: 15000,
        total: 85000,
      },
    },
    totalEstimatedCost: 2795750,
    costAsPercentageOfOffering: 11.18,
    timeline: {
      kickoff: '2026-01-15',
      dueDigilligence: '2026-03-01',
      prospectusFilingStart: '2026-04-01',
      prospectusApproved: '2026-06-30',
      roadshowBegins: '2026-07-15',
      pricingDate: '2026-08-25',
      listingDate: '2026-09-01',
      totalMonths: 7,
    },
    assumptions: [
      'Government green energy subsidies maintained',
      'Environmental approvals on track',
      'No supply chain disruptions',
    ],
    riskFactors: [
      'Government policy changes',
      'Energy commodity prices',
      'Supply chain risks',
      'Environmental challenges',
    ],
  },
]

// ─────────────────────── CAP TABLE DILUTION SCENARIOS ───────────────────────

export interface CapTableScenario {
  id: string
  companyId?: string
  companyName: string
  scenarioName: string
  description: string
  date: string
  assumptions: string[]
  roundDetails: {
    roundType: string
    fundingAmount: number
    currency: Currency
    pricePerShare: number
    sharesIssued: number
  }
  beforeScenario: {
    totalShares: number
    commonOutstanding: number
    optionsOutstanding: number
    warrantsOutstanding: number
    convertiblesOutstanding: number
  }
  afterScenario: {
    totalShares: number
    commonOutstanding: number
    optionsOutstanding: number
    warrantsOutstanding: number
    convertiblesOutstanding: number
    fullyDilutedShares: number
  }
  shareholderImpact: Array<{
    shareholderId: string
    shareholderName: string
    preRoundShares: number
    preRoundOwnership: number
    postRoundShares: number
    postRoundOwnership: number
    dilution: number
  }>
}

export const CAP_TABLE_SCENARIOS: CapTableScenario[] = [
  {
    id: 'cap-scen-001',
    companyName: 'TechVenture Solutions Inc.',
    scenarioName: 'Series C Funding Round',
    description: 'Series C investment with standard anti-dilution protection',
    date: '2026-06-01',
    assumptions: [
      'Series C investors have weighted average anti-dilution',
      'No down round provisions triggered',
      'All outstanding options assumed exercised',
      'Convertible notes convert at Series C price',
    ],
    roundDetails: {
      roundType: 'Series C',
      fundingAmount: 50000000,
      currency: 'USD',
      pricePerShare: 25.0,
      sharesIssued: 2000000,
    },
    beforeScenario: {
      totalShares: 10000000,
      commonOutstanding: 8000000,
      optionsOutstanding: 1500000,
      warrantsOutstanding: 200000,
      convertiblesOutstanding: 300000,
    },
    afterScenario: {
      totalShares: 12000000,
      commonOutstanding: 10000000,
      optionsOutstanding: 1500000,
      warrantsOutstanding: 200000,
      convertiblesOutstanding: 300000,
      fullyDilutedShares: 12300000,
    },
    shareholderImpact: [
      {
        shareholderId: 'founder-001',
        shareholderName: 'John Smith (Founder/CEO)',
        preRoundShares: 4000000,
        preRoundOwnership: 40.0,
        postRoundShares: 4000000,
        postRoundOwnership: 33.33,
        dilution: 6.67,
      },
      {
        shareholderId: 'founder-002',
        shareholderName: 'Sarah Johnson (Founder/CTO)',
        preRoundShares: 2000000,
        preRoundOwnership: 20.0,
        postRoundShares: 2000000,
        postRoundOwnership: 16.67,
        dilution: 3.33,
      },
      {
        shareholderId: 'series-a-001',
        shareholderName: 'Venture Capital Partners A',
        preRoundShares: 2500000,
        preRoundOwnership: 25.0,
        postRoundShares: 2500000,
        postRoundOwnership: 20.83,
        dilution: 4.17,
      },
      {
        shareholderId: 'series-b-001',
        shareholderName: 'Growth Capital Ventures B',
        preRoundShares: 1500000,
        preRoundOwnership: 15.0,
        postRoundShares: 1500000,
        postRoundOwnership: 12.5,
        dilution: 2.5,
      },
      {
        shareholderId: 'employees',
        shareholderName: 'Employee Stock Option Pool',
        preRoundShares: 0,
        preRoundOwnership: 0.0,
        postRoundShares: 1500000,
        postRoundOwnership: 12.5,
        dilution: 0.0,
      },
    ],
  },
  {
    id: 'cap-scen-002',
    companyName: 'TechVenture Solutions Inc.',
    scenarioName: 'IPO with Full Warrant Exercise',
    description: 'IPO scenario including all warrant conversions and dilutive effects',
    date: '2026-09-15',
    assumptions: [
      'All warrants exercise on IPO announcement',
      'All employee options fully vested and exercised',
      'Convertible notes convert at IPO price ($32)',
      'No secondary offerings by founders',
    ],
    roundDetails: {
      roundType: 'IPO',
      fundingAmount: 125000000,
      currency: 'USD',
      pricePerShare: 32.0,
      sharesIssued: 3906250,
    },
    beforeScenario: {
      totalShares: 12000000,
      commonOutstanding: 10000000,
      optionsOutstanding: 1500000,
      warrantsOutstanding: 200000,
      convertiblesOutstanding: 300000,
    },
    afterScenario: {
      totalShares: 16006250,
      commonOutstanding: 15406250,
      optionsOutstanding: 0,
      warrantsOutstanding: 0,
      convertiblesOutstanding: 0,
      fullyDilutedShares: 16006250,
    },
    shareholderImpact: [
      {
        shareholderId: 'founder-001',
        shareholderName: 'John Smith (Founder/CEO)',
        preRoundShares: 4000000,
        preRoundOwnership: 33.33,
        postRoundShares: 4000000,
        postRoundOwnership: 24.97,
        dilution: 8.36,
      },
      {
        shareholderId: 'founder-002',
        shareholderName: 'Sarah Johnson (Founder/CTO)',
        preRoundShares: 2000000,
        preRoundOwnership: 16.67,
        postRoundShares: 2000000,
        postRoundOwnership: 12.49,
        dilution: 4.18,
      },
      {
        shareholderId: 'series-a-001',
        shareholderName: 'Venture Capital Partners A',
        preRoundShares: 2500000,
        preRoundOwnership: 20.83,
        postRoundShares: 2500000,
        postRoundOwnership: 15.61,
        dilution: 5.22,
      },
      {
        shareholderId: 'series-b-001',
        shareholderName: 'Growth Capital Ventures B',
        preRoundShares: 1500000,
        preRoundOwnership: 12.5,
        postRoundShares: 1500000,
        postRoundOwnership: 9.36,
        dilution: 3.14,
      },
      {
        shareholderId: 'employees',
        shareholderName: 'Employee Stock Option Pool',
        preRoundShares: 1500000,
        preRoundOwnership: 12.5,
        postRoundShares: 1500000,
        postRoundOwnership: 9.36,
        dilution: -3.14,
      },
      {
        shareholderId: 'ipo-investors',
        shareholderName: 'IPO Public Investors',
        preRoundShares: 0,
        preRoundOwnership: 0.0,
        postRoundShares: 3906250,
        postRoundOwnership: 24.39,
        dilution: 0.0,
      },
    ],
  },
]

// ─────────────────────── FINANCIAL TRACKING HISTORY ───────────────────────

export interface FinancialTrackingEntry {
  month: string
  category: string
  budgeted: number
  actual: number
  variance: number
  variancePercent: number
  notes: string
}

export interface FinancialTrackingHistory {
  id: string
  companyId?: string
  companyName: string
  currency: Currency
  period: string
  startDate: string
  endDate: string
  budgetTotal: number
  actualTotal: number
  varianceTotal: number
  variancePercentTotal: number
  entries: FinancialTrackingEntry[]
  summaryByCategory: Array<{
    category: string
    budgetedTotal: number
    actualTotal: number
    varianceTotal: number
    variancePercent: number
    percentOfBudget: number
  }>
}

export const FINANCIAL_TRACKING_HISTORIES: FinancialTrackingHistory[] = [
  {
    id: 'fin-track-001',
    companyName: 'TechVenture Solutions Inc.',
    currency: 'USD',
    period: '6-Month IPO Preparation Budget (Jan-Jun 2026)',
    startDate: '2026-01-01',
    endDate: '2026-06-30',
    budgetTotal: 3500000,
    actualTotal: 3642500,
    varianceTotal: -142500,
    variancePercentTotal: -4.07,
    entries: [
      {
        month: '2026-01',
        category: 'Legal & Compliance',
        budgeted: 400000,
        actual: 425000,
        variance: -25000,
        variancePercent: -6.25,
        notes: 'Additional securities counsel added for SEC preparation',
      },
      {
        month: '2026-01',
        category: 'Accounting & Audit',
        budgeted: 300000,
        actual: 295000,
        variance: 5000,
        variancePercent: 1.67,
        notes: 'Audit prep came in on schedule',
      },
      {
        month: '2026-01',
        category: 'Investor Relations',
        budgeted: 80000,
        actual: 85000,
        variance: -5000,
        variancePercent: -6.25,
        notes: 'Additional IR advisor consulting',
      },
      {
        month: '2026-02',
        category: 'Legal & Compliance',
        budgeted: 400000,
        actual: 440000,
        variance: -40000,
        variancePercent: -10.0,
        notes: 'Due diligence commenced, external counsel fees increased',
      },
      {
        month: '2026-02',
        category: 'Accounting & Audit',
        budgeted: 300000,
        actual: 320000,
        variance: -20000,
        variancePercent: -6.67,
        notes: 'Extended audit field work',
      },
      {
        month: '2026-02',
        category: 'Investor Relations',
        budgeted: 80000,
        actual: 75000,
        variance: 5000,
        variancePercent: 6.25,
        notes: 'Efficient investor calls schedule',
      },
      {
        month: '2026-03',
        category: 'Legal & Compliance',
        budgeted: 400000,
        actual: 385000,
        variance: 15000,
        variancePercent: 3.75,
        notes: 'Templates completed, drafting efficiency improved',
      },
      {
        month: '2026-03',
        category: 'Accounting & Audit',
        budgeted: 300000,
        actual: 305000,
        variance: -5000,
        variancePercent: -1.67,
        notes: 'Final audit adjustments',
      },
      {
        month: '2026-03',
        category: 'Investor Relations',
        budgeted: 80000,
        actual: 95000,
        variance: -15000,
        variancePercent: -18.75,
        notes: 'Additional investor meetings and presentation prep',
      },
      {
        month: '2026-04',
        category: 'Legal & Compliance',
        budgeted: 450000,
        actual: 475000,
        variance: -25000,
        variancePercent: -5.56,
        notes: 'SEC comment preparation begins',
      },
      {
        month: '2026-04',
        category: 'Accounting & Audit',
        budgeted: 300000,
        actual: 290000,
        variance: 10000,
        variancePercent: 3.33,
        notes: 'Audit complete, financial statements finalized',
      },
      {
        month: '2026-04',
        category: 'Investor Relations',
        budgeted: 150000,
        actual: 160000,
        variance: -10000,
        variancePercent: -6.67,
        notes: 'Roadshow planning and materials development',
      },
      {
        month: '2026-05',
        category: 'Legal & Compliance',
        budgeted: 450000,
        actual: 460000,
        variance: -10000,
        variancePercent: -2.22,
        notes: 'S-1 filing preparation in progress',
      },
      {
        month: '2026-05',
        category: 'Accounting & Audit',
        budgeted: 300000,
        actual: 315000,
        variance: -15000,
        variancePercent: -5.0,
        notes: 'SOX readiness assessment initiated',
      },
      {
        month: '2026-05',
        category: 'Investor Relations',
        budgeted: 150000,
        actual: 155000,
        variance: -5000,
        variancePercent: -3.33,
        notes: 'Communications strategy finalized',
      },
      {
        month: '2026-06',
        category: 'Legal & Compliance',
        budgeted: 450000,
        actual: 435000,
        variance: 15000,
        variancePercent: 3.33,
        notes: 'S-1 filed successfully',
      },
      {
        month: '2026-06',
        category: 'Accounting & Audit',
        budgeted: 300000,
        actual: 322000,
        variance: -22000,
        variancePercent: -7.33,
        notes: 'SOX framework documentation complete',
      },
      {
        month: '2026-06',
        category: 'Investor Relations',
        budgeted: 150000,
        actual: 170000,
        variance: -20000,
        variancePercent: -13.33,
        notes: 'Early investor engagement and feedback rounds',
      },
    ],
    summaryByCategory: [
      {
        category: 'Legal & Compliance',
        budgetedTotal: 2400000,
        actualTotal: 2515000,
        varianceTotal: -115000,
        variancePercent: -4.79,
        percentOfBudget: 69.07,
      },
      {
        category: 'Accounting & Audit',
        budgetedTotal: 1800000,
        actualTotal: 1847000,
        varianceTotal: -47000,
        variancePercent: -2.61,
        percentOfBudget: 50.75,
      },
      {
        category: 'Investor Relations',
        budgetedTotal: 790000,
        actualTotal: 815000,
        varianceTotal: -25000,
        variancePercent: -3.16,
        percentOfBudget: 22.38,
      },
      {
        category: 'Infrastructure & Systems',
        budgetedTotal: 510000,
        actualTotal: 465500,
        varianceTotal: 44500,
        variancePercent: 8.73,
        percentOfBudget: 12.77,
      },
    ],
  },
]

// ─────────────────────── LISTING REQUIREMENTS VALIDATION ───────────────────────

export interface ListingRequirementValidation {
  id: string
  companyId?: string
  companyName: string
  exchange: Exchange
  listingType: ListingType
  validationDate: string
  requirements: Array<{
    requirementId: string
    category: string
    requirement: string
    applicableExchanges: Exchange[]
    applicableListingTypes: ListingType[]
    status: 'met' | 'in_progress' | 'not_met' | 'waived' | 'pending'
    evidence: string[]
    notes: string
    targetCompletionDate?: string
  }>
  overallStatus: 'compliant' | 'partially_compliant' | 'non_compliant'
  compliancePercentage: number
  actionItems: Array<{
    item: string
    priority: 'critical' | 'high' | 'medium' | 'low'
    dueDate: string
    assignedTo: string
    status: 'pending' | 'in_progress' | 'completed'
  }>
}

export const LISTING_REQUIREMENT_VALIDATIONS: ListingRequirementValidation[] = [
  {
    id: 'val-001',
    companyName: 'TechVenture Solutions Inc.',
    exchange: 'nasdaq',
    listingType: 'ipo',
    validationDate: '2026-06-01',
    requirements: [
      {
        requirementId: 'nasdaq-001',
        category: 'Financial Requirements',
        requirement: 'Minimum Stockholders Equity of $30 million',
        applicableExchanges: ['nasdaq'],
        applicableListingTypes: ['ipo'],
        status: 'met',
        evidence: [
          'December 2025 audited balance sheet: $95 million stockholders equity',
        ],
        notes: 'Exceeds minimum by 3.17x',
        targetCompletionDate: undefined,
      },
      {
        requirementId: 'nasdaq-002',
        category: 'Financial Requirements',
        requirement: 'Minimum Operating History of 2 Years',
        applicableExchanges: ['nasdaq'],
        applicableListingTypes: ['ipo'],
        status: 'met',
        evidence: ['Company founded March 2022, currently 3+ years operating'],
        notes: 'Incorporated 2022, exceeds requirements',
        targetCompletionDate: undefined,
      },
      {
        requirementId: 'nasdaq-003',
        category: 'Market Capitalization',
        requirement: 'Minimum Market Value of Public Float $40 million',
        applicableExchanges: ['nasdaq'],
        applicableListingTypes: ['ipo'],
        status: 'in_progress',
        evidence: ['Series C valuation: $750 million'],
        notes:
          'Expected public float will exceed minimum based on proposed offering size of $125M',
        targetCompletionDate: '2026-09-15',
      },
      {
        requirementId: 'nasdaq-004',
        category: 'Governance Requirements',
        requirement: 'Majority Independent Board Members',
        applicableExchanges: ['nasdaq'],
        applicableListingTypes: ['ipo'],
        status: 'in_progress',
        evidence: [
          'Current board: 2 founders, recruiting 3 independent directors',
        ],
        notes:
          'On track to achieve 60% independence by IPO. Board independence policy draft completed.',
        targetCompletionDate: '2026-08-01',
      },
      {
        requirementId: 'nasdaq-005',
        category: 'Committee Requirements',
        requirement: 'Audit Committee, Compensation Committee, Nominating Committee',
        applicableExchanges: ['nasdaq'],
        applicableListingTypes: ['ipo'],
        status: 'in_progress',
        evidence: [
          'Audit committee charter drafted',
          'Compensation committee recruiting chair',
        ],
        notes: 'All three committees to be fully staffed by August 2026',
        targetCompletionDate: '2026-08-15',
      },
      {
        requirementId: 'nasdaq-006',
        category: 'Disclosure Requirements',
        requirement: 'SOX Section 302 CEO/CFO Certification',
        applicableExchanges: ['nasdaq'],
        applicableListingTypes: ['ipo'],
        status: 'in_progress',
        evidence: ['SOX readiness assessment underway'],
        notes:
          'Internal control assessment framework being implemented. First certifications required by IPO',
        targetCompletionDate: '2026-09-01',
      },
      {
        requirementId: 'nasdaq-007',
        category: 'Disclosure Requirements',
        requirement: 'SOX Section 404 Internal Control Assessment',
        applicableExchanges: ['nasdaq'],
        applicableListingTypes: ['ipo'],
        status: 'in_progress',
        evidence: [
          'Big 4 auditor engaged for SOX 404 readiness review',
          'Control inventory 60% complete',
        ],
        notes:
          'On track for attestation. First full 404(b) assessment will be included in Year 1 10-K',
        targetCompletionDate: '2026-09-30',
      },
      {
        requirementId: 'nasdaq-008',
        category: 'Legal Documentation',
        requirement: 'Articles of Incorporation and Bylaws',
        applicableExchanges: ['nasdaq'],
        applicableListingTypes: ['ipo'],
        status: 'met',
        evidence: ['Restated articles filed with state, bylaws compliant'],
        notes: 'Updated to include NASDAQ listing provisions',
        targetCompletionDate: undefined,
      },
      {
        requirementId: 'nasdaq-009',
        category: 'Code of Conduct',
        requirement: 'Code of Business Conduct & Ethics',
        applicableExchanges: ['nasdaq'],
        applicableListingTypes: ['ipo'],
        status: 'met',
        evidence: ['Code adopted by board, published to website'],
        notes: 'Compliant with NASDAQ Rule 5610',
        targetCompletionDate: undefined,
      },
    ],
    overallStatus: 'partially_compliant',
    compliancePercentage: 78,
    actionItems: [
      {
        item: 'Recruit 3 independent board directors',
        priority: 'critical',
        dueDate: '2026-08-01',
        assignedTo: 'John Smith (CEO)',
        status: 'in_progress',
      },
      {
        item: 'Complete SOX 302 controls documentation',
        priority: 'critical',
        dueDate: '2026-08-31',
        assignedTo: 'CFO & Audit Committee',
        status: 'in_progress',
      },
      {
        item: 'Finalize Audit Committee charter',
        priority: 'high',
        dueDate: '2026-08-15',
        assignedTo: 'Board Secretary',
        status: 'in_progress',
      },
      {
        item: 'Establish Compensation Committee',
        priority: 'high',
        dueDate: '2026-08-01',
        assignedTo: 'Board Nominating Chair',
        status: 'pending',
      },
    ],
  },
]

// ─────────────────────── CORPORATE RESOLUTIONS ───────────────────────

export interface CorporateResolution {
  id: string
  companyId?: string
  companyName: string
  type: 'prospectus' | 'listing' | 'underwriting' | 'other'
  title: string
  description: string
  resolutionDate: string
  approvedDate?: string
  approvedBy: string
  status: 'draft' | 'approved' | 'executed' | 'archived'
  boardMeetingMinutes?: string
  keyProvisions: string[]
  effectiveness: string
  consentRequired: string[]
  document?: {
    fileName: string
    fileUrl?: string
  }
}

export const CORPORATE_RESOLUTIONS: CorporateResolution[] = [
  {
    id: 'res-001',
    companyName: 'TechVenture Solutions Inc.',
    type: 'prospectus',
    title: 'Authorization of Prospectus and Registration Statement',
    description:
      'Resolution authorizing management to prepare and file a prospectus and registration statement with the SEC for the proposed IPO',
    resolutionDate: '2026-04-15',
    approvedDate: '2026-04-16',
    approvedBy: 'Board of Directors',
    status: 'executed',
    boardMeetingMinutes: 'Board Meeting of April 15, 2026',
    keyProvisions: [
      'Authorization for CEO and CFO to execute and file all registration documents with the SEC',
      'Authorization to negotiate underwriting agreement terms',
      'Delegation of specific matters to the Audit Committee',
      'Authorization for officers to make non-material amendments',
      'Confirmation of corporate information and governance',
    ],
    effectiveness: 'Effective as of April 16, 2026, and continuing through closing',
    consentRequired: ['SEC Staff', 'NASDAQ Listing Qualifications Panel'],
    document: {
      fileName: 'Resolution_Prospectus_TechVenture.pdf',
    },
  },
  {
    id: 'res-002',
    companyName: 'TechVenture Solutions Inc.',
    type: 'listing',
    title: 'Authorization for NASDAQ Listing Application',
    description:
      'Board resolution authorizing the submission of the NASDAQ listing application and compliance with NASDAQ Listing Standards',
    resolutionDate: '2026-05-01',
    approvedDate: '2026-05-01',
    approvedBy: 'Board of Directors',
    status: 'executed',
    boardMeetingMinutes: 'Board Meeting of May 1, 2026',
    keyProvisions: [
      'Submission of NASDAQ listing application with all required documentation',
      'Commitment to comply with NASDAQ Listing Standards',
      'Authorization for officers to negotiate listing terms',
      'Confirmation of independent board composition',
      'Adoption of NASDAQ-required governance policies',
    ],
    effectiveness: 'Effective as of May 1, 2026, until listing clearance',
    consentRequired: ['NASDAQ Listing Qualifications Panel'],
    document: {
      fileName: 'Resolution_NASDAQ_Listing_TechVenture.pdf',
    },
  },
  {
    id: 'res-003',
    companyName: 'TechVenture Solutions Inc.',
    type: 'underwriting',
    title: 'Appointment of Underwriters and Authorization of Underwriting Agreement',
    description:
      'Resolution appointing the underwriters and authorizing the execution of the underwriting agreement',
    resolutionDate: '2026-05-15',
    approvedDate: '2026-05-15',
    approvedBy: 'Board of Directors',
    status: 'executed',
    boardMeetingMinutes: 'Board Meeting of May 15, 2026',
    keyProvisions: [
      'Appointment of Goldman Sachs, Morgan Stanley, and Jefferies as underwriters',
      'Authorization to negotiate underwriting terms including underwriting discount',
      'Authorization for option to purchase additional shares (green shoe)',
      'Authorization to enter into lock-up agreements',
      'Delegation to management for pre-pricing discussions',
    ],
    effectiveness: 'Effective upon execution of underwriting agreement',
    consentRequired: ['Underwriters', 'SEC', 'NASDAQ'],
    document: {
      fileName: 'Resolution_Underwriting_Agreement_TechVenture.pdf',
    },
  },
  {
    id: 'res-004',
    companyName: 'TechVenture Solutions Inc.',
    type: 'other',
    title: 'Employee Stock Option Plan Amendment and Assumption',
    description:
      'Resolution approving the amendment to the Employee Stock Option Plan and assumption post-IPO',
    resolutionDate: '2026-06-01',
    approvedDate: '2026-06-01',
    approvedBy: 'Board of Directors & Stockholders',
    status: 'executed',
    boardMeetingMinutes: 'Board Meeting of June 1, 2026 & Stockholder Meeting of June 15, 2026',
    keyProvisions: [
      'Amendment of existing Employee Stock Option Plan effective upon IPO',
      'Authorization of additional shares available for future grants (5 million shares)',
      'Automatic acceleration of certain options upon change of control',
      'Establishment of trading window restrictions',
      'Assumption of all outstanding options by public company',
    ],
    effectiveness: 'Effective as of IPO listing date',
    consentRequired: ['Stockholders (completed June 15, 2026)'],
    document: {
      fileName: 'Resolution_ESOP_Amendment_TechVenture.pdf',
    },
  },
]

// ─────────────────────── CONSENT LETTERS ───────────────────────

export interface ConsentLetter {
  id: string
  companyId?: string
  companyName: string
  fromParty: string
  fromPartyType: 'auditor' | 'lawyer' | 'advisor' | 'vendor' | 'other'
  consentType: string
  title: string
  description: string
  issuedDate: string
  effectiveDate: string
  expiryDate?: string
  status: 'draft' | 'received' | 'executed' | 'expired'
  scopeOfConsent: string[]
  conditions: string[]
  limitations: string[]
  reliabilityDate?: string
  document?: {
    fileName: string
    fileUrl?: string
  }
}

export const CONSENT_LETTERS: ConsentLetter[] = [
  {
    id: 'consent-001',
    companyName: 'TechVenture Solutions Inc.',
    fromParty: 'Deloitte & Touche LLP',
    fromPartyType: 'auditor',
    consentType: 'Auditor Consent Letter',
    title: 'Auditor Consent to Use of Audit Report in Registration Statement',
    description:
      'Formal consent from auditors to include their audit report and financial statement audit work in the S-1 registration statement',
    issuedDate: '2026-07-10',
    effectiveDate: '2026-07-10',
    expiryDate: '2027-07-10',
    status: 'received',
    scopeOfConsent: [
      'Permission to include 2024 and 2025 audited financial statements',
      'Permission to reference audit report in prospectus',
      'Permission to use audit work papers in SEC filings',
      'Auditor expertise regarding SOX Section 404',
    ],
    conditions: [
      'No material changes to audited financial statements after consent date',
      'Auditor remains independent per PCAOB standards',
      'No subsequent events that would require audit amendments',
    ],
    limitations: [
      'Consent covers only the specific financial statements dated December 31, 2025 and 2024',
      'Auditor consent does not extend to future quarterly reports',
      'Consents for future 10-Q and 10-K filings will be required separately',
    ],
    reliabilityDate: '2026-07-10',
    document: {
      fileName: 'Auditor_Consent_Deloitte_TechVenture.pdf',
    },
  },
  {
    id: 'consent-002',
    companyName: 'TechVenture Solutions Inc.',
    fromParty: 'WilmerHale',
    fromPartyType: 'lawyer',
    consentType: 'Company Counsel Consent Letter',
    title: 'Company Counsel Consent to Use of Legal Opinion in Registration Statement',
    description:
      'Formal consent from company securities counsel to include their legal opinion regarding validity of common stock in the registration statement',
    issuedDate: '2026-07-08',
    effectiveDate: '2026-07-08',
    expiryDate: '2027-07-08',
    status: 'received',
    scopeOfConsent: [
      'Permission to include legal opinion on validity of common stock',
      'Permission to reference counsel expertise in prospectus',
      'Permission to disclose counsel as company securities counsel',
      'Opinion covers incorporation, capitalization, and authority matters',
    ],
    conditions: [
      'Certificate of Incorporation and bylaws remain as delivered',
      'No material changes to corporate structure',
      'All representations and warranties remain true and correct',
    ],
    limitations: [
      'Opinion is as of the effective date only',
      'Opinion relates only to matters of federal law and Delaware law',
      'Opinion does not cover tax or SEC compliance matters',
      'Opinion is limited to counsel who provides it',
    ],
    reliabilityDate: '2026-07-08',
    document: {
      fileName: 'Counsel_Consent_WilmerHale_TechVenture.pdf',
    },
  },
  {
    id: 'consent-003',
    companyName: 'TechVenture Solutions Inc.',
    fromParty: 'PwC (Underwriter Counsel)',
    fromPartyType: 'lawyer',
    consentType: 'Underwriter Counsel Consent Letter',
    title: 'Underwriter Counsel Consent to Use of Legal Opinion',
    description:
      'Formal consent from underwriter counsel to include their legal opinion in the registration statement',
    issuedDate: '2026-07-15',
    effectiveDate: '2026-07-15',
    expiryDate: '2027-07-15',
    status: 'draft',
    scopeOfConsent: [
      'Permission to include legal opinions on offering structure',
      'Permission to reference underwriter counsel in prospectus',
      'Opinion covers securities law and underwriting agreement validity',
    ],
    conditions: [
      'No material changes to terms of underwriting agreement',
      'Underwriting agreement terms remain as reviewed',
    ],
    limitations: [
      'Opinion limited to federal securities law',
      'Does not extend to state law issues',
      'Limited to underwriter counsel providing opinion',
    ],
    reliabilityDate: undefined,
    document: {
      fileName: 'Counsel_Consent_PwC_Underwriter_TechVenture.pdf',
    },
  },
  {
    id: 'consent-004',
    companyName: 'TechVenture Solutions Inc.',
    fromParty: 'JP Morgan (Transfer Agent)',
    fromPartyType: 'vendor',
    consentType: 'Transfer Agent Consent',
    title: 'Transfer Agent Consent to Serve as Public Company Transfer Agent',
    description:
      'Formal consent from transfer agent to serve the company as transfer agent following IPO',
    issuedDate: '2026-06-20',
    effectiveDate: '2026-09-15',
    expiryDate: undefined,
    status: 'received',
    scopeOfConsent: [
      'Agreement to serve as transfer agent for public company shares',
      'Provision of transfer agent services and support',
      'Maintenance of registered agent services',
      'Compliance with SEC Rule 17Ad-13 requirements',
    ],
    conditions: [
      'Company maintains required net capital and insurance',
      'Company provides accurate capitalization information',
      'No material adverse changes in company operations',
    ],
    limitations: [
      'Transfer agent reserves right to terminate with 90 days notice',
      'Contingent on completion of IPO as planned',
      'Services subject to standard transfer agent fee schedule',
    ],
    reliabilityDate: '2026-09-15',
    document: {
      fileName: 'Transfer_Agent_Consent_JPMorgan_TechVenture.pdf',
    },
  },
  {
    id: 'consent-005',
    companyName: 'TechVenture Solutions Inc.',
    fromParty: 'EY (IPO Advisor)',
    fromPartyType: 'advisor',
    consentType: 'IPO Advisor Consent Letter',
    title: 'Go-Public Advisor Consent to Use Reports and Materials',
    description:
      'Formal consent from IPO advisor to include their analysis and reports in the IPO process documentation',
    issuedDate: '2026-06-30',
    effectiveDate: '2026-06-30',
    expiryDate: '2026-12-31',
    status: 'received',
    scopeOfConsent: [
      'Permission to use market readiness assessment',
      'Permission to include IPO timeline analysis',
      'Permission to use cost-benefit analysis in internal documents',
      'Reference to advisor work in prospectus',
    ],
    conditions: [
      'Advisor remains engaged through IPO completion',
      'No public disclosure without advisor approval',
      'Advisor compensated per engagement letter',
    ],
    limitations: [
      'Consent covers only specific reports reviewed',
      'Does not extend to future advisory services',
      'Recommendations subject to change based on market conditions',
    ],
    reliabilityDate: '2026-06-30',
    document: {
      fileName: 'Advisor_Consent_EY_TechVenture.pdf',
    },
  },
]

// ─────────────────────── EXPORT HELPER FUNCTION ───────────────────────

export const phase2DummyData = {
  ipoCostEstimates: IPO_COST_ESTIMATES,
  capTableScenarios: CAP_TABLE_SCENARIOS,
  financialTrackingHistories: FINANCIAL_TRACKING_HISTORIES,
  listingRequirementValidations: LISTING_REQUIREMENT_VALIDATIONS,
  corporateResolutions: CORPORATE_RESOLUTIONS,
  consentLetters: CONSENT_LETTERS,
}

export default phase2DummyData
