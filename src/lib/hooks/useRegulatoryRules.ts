import { useState, useEffect, useCallback } from 'react'

export interface RegulatoryExchange {
  id: string
  country: string
  name: string
  acronym: string
  regulatoryBody: string
  requiredDocuments: string[]
  validationRules: Record<string, any>
  reconciliationRules: Record<string, any>
}

export interface RegulatoryRulesState {
  exchanges: RegulatoryExchange[]
  selectedExchange: RegulatoryExchange | null
  isLoading: boolean
  error: string | null
  lastFetch: Date | null
}

const REGULATORY_EXCHANGES: Record<string, RegulatoryExchange> = {
  'TSX': {
    id: 'tsx',
    country: 'Canada',
    name: 'Toronto Stock Exchange',
    acronym: 'TSX',
    regulatoryBody: 'CSA/OSC',
    requiredDocuments: [
      'Management Information Circular',
      'Annual Financial Statements',
      'MD&A',
      'Corporate Governance',
      'Risk Management Summary',
    ],
    validationRules: {
      financialCompleteness: 0.95,
      filingTimeline: 90,
      disclosureRequirements: ['SEDAR+ submission'],
    },
    reconciliationRules: {
      cashFlowVariance: 5,
      revenueVariance: 3,
      equityVariance: 2,
    },
  },
  'TSXV': {
    id: 'tsxv',
    country: 'Canada',
    name: 'TSX Venture Exchange',
    acronym: 'TSXV',
    regulatoryBody: 'CSA/TSXV',
    requiredDocuments: [
      'Form 2A1 - Business Acquisition',
      'Form 2A2 - Property Acquisition',
      'Form 2B - Corporate Restructuring',
      'Auditor Report',
      'Management Discussion & Analysis',
    ],
    validationRules: {
      financialCompleteness: 0.90,
      filingTimeline: 120,
      disclosureRequirements: ['SEDAR+ submission'],
    },
    reconciliationRules: {
      cashFlowVariance: 8,
      revenueVariance: 5,
      equityVariance: 3,
    },
  },
  'CSE': {
    id: 'cse',
    country: 'Canada',
    name: 'Canadian Securities Exchange',
    acronym: 'CSE',
    regulatoryBody: 'CSA/CSE',
    requiredDocuments: [
      'Initial Listing Application',
      'Accountant Certification',
      'Corporate Structure',
      'Management Bios',
      'Business Plan Summary',
    ],
    validationRules: {
      financialCompleteness: 0.85,
      filingTimeline: 150,
      disclosureRequirements: ['CSE filing system'],
    },
    reconciliationRules: {
      cashFlowVariance: 10,
      revenueVariance: 8,
      equityVariance: 5,
    },
  },
  'SEC Edgar': {
    id: 'sec-edgar',
    country: 'United States',
    name: 'SEC Electronic Data Gathering',
    acronym: 'SEC Edgar',
    regulatoryBody: 'SEC',
    requiredDocuments: [
      'Form S-1',
      'Form 10-K',
      'Form 10-Q',
      'Audited Financial Statements',
      'Risk Factors',
      'Executive Compensation',
      'MD&A',
    ],
    validationRules: {
      financialCompleteness: 0.98,
      filingTimeline: 60,
      disclosureRequirements: ['EDGAR submission', 'XBRL format'],
    },
    reconciliationRules: {
      cashFlowVariance: 2,
      revenueVariance: 1,
      equityVariance: 1,
    },
  },
  'NASDAQ': {
    id: 'nasdaq',
    country: 'United States',
    name: 'NASDAQ Stock Market',
    acronym: 'NASDAQ',
    regulatoryBody: 'SEC/NASDAQ',
    requiredDocuments: [
      'Form S-1',
      'Audited Financial Statements',
      'Corporate Governance',
      'Executive Compensation',
      'Risk Factors',
      'Business Description',
      'Use of Proceeds',
    ],
    validationRules: {
      financialCompleteness: 0.99,
      filingTimeline: 45,
      disclosureRequirements: ['EDGAR submission', 'XBRL format', 'NASDAQ approval'],
    },
    reconciliationRules: {
      cashFlowVariance: 2,
      revenueVariance: 1,
      equityVariance: 1,
    },
  },
  'NYSE': {
    id: 'nyse',
    country: 'United States',
    name: 'New York Stock Exchange',
    acronym: 'NYSE',
    regulatoryBody: 'SEC/NYSE',
    requiredDocuments: [
      'Form S-1',
      'Audited Financial Statements',
      'Corporate Governance Charter',
      'Executive Compensation',
      'Risk Factors',
      'Board & Management',
      'Capital Structure',
    ],
    validationRules: {
      financialCompleteness: 0.99,
      filingTimeline: 45,
      disclosureRequirements: ['EDGAR submission', 'XBRL format', 'NYSE approval'],
    },
    reconciliationRules: {
      cashFlowVariance: 2,
      revenueVariance: 1,
      equityVariance: 1,
    },
  },
}

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export function useRegulatoryRules(exchangeId?: string) {
  const [state, setState] = useState<RegulatoryRulesState>({
    exchanges: [],
    selectedExchange: null,
    isLoading: true,
    error: null,
    lastFetch: null,
  })

  // Initialize exchanges
  useEffect(() => {
    const initializeExchanges = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }))

        // Simulate API fetch (in production, this would call /api/regulatory/exchanges)
        const exchanges = Object.values(REGULATORY_EXCHANGES)
        const selectedExchange = exchangeId
          ? REGULATORY_EXCHANGES[exchangeId] || null
          : null

        setState((prev) => ({
          ...prev,
          exchanges,
          selectedExchange,
          isLoading: false,
          lastFetch: new Date(),
        }))
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch regulatory rules',
        }))
      }
    }

    initializeExchanges()
  }, [exchangeId])

  // Select exchange
  const selectExchange = useCallback((id: string) => {
    const exchange = REGULATORY_EXCHANGES[id] || null
    setState((prev) => ({
      ...prev,
      selectedExchange: exchange,
    }))
  }, [])

  // Get requirements for exchange
  const getRequirements = useCallback((exchangeId: string) => {
    const exchange = REGULATORY_EXCHANGES[exchangeId]
    return exchange ? exchange.requiredDocuments : []
  }, [])

  // Get validation rules for exchange
  const getValidationRules = useCallback((exchangeId: string) => {
    const exchange = REGULATORY_EXCHANGES[exchangeId]
    return exchange ? exchange.validationRules : {}
  }, [])

  // Get reconciliation rules for exchange
  const getReconciliationRules = useCallback((exchangeId: string) => {
    const exchange = REGULATORY_EXCHANGES[exchangeId]
    return exchange ? exchange.reconciliationRules : {}
  }, [])

  // Refresh data
  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }))
    try {
      const exchanges = Object.values(REGULATORY_EXCHANGES)
      setState((prev) => ({
        ...prev,
        exchanges,
        isLoading: false,
        lastFetch: new Date(),
      }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh',
      }))
    }
  }, [])

  return {
    ...state,
    selectExchange,
    getRequirements,
    getValidationRules,
    getReconciliationRules,
    refresh,
  }
}
