/**
 * useListingRules Hook
 * ====================
 * React hook for validating cap table against exchange listing rules
 * Handles API calls, loading states, and error management
 */

import { useState, useCallback, useEffect } from 'react'
import { CapTableData, ListingReadinessReport } from '@/lib/listing-rules'
import { ExchangeCode } from '@/lib/exchange-config'

interface UseListingRulesOptions {
  autoValidate?: boolean
  compareWith?: ExchangeCode[]
}

interface UseListingRulesResult {
  report: ListingReadinessReport | null
  comparisonReports: ListingReadinessReport[] | null
  loading: boolean
  error: string | null
  validate: (capTableData: CapTableData, exchange: ExchangeCode, compareWith?: ExchangeCode[]) => Promise<void>
  reset: () => void
}

/**
 * Hook for listing rules validation
 */
export function useListingRules(options?: UseListingRulesOptions): UseListingRulesResult {
  const [report, setReport] = useState<ListingReadinessReport | null>(null)
  const [comparisonReports, setComparisonReports] = useState<ListingReadinessReport[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validate = useCallback(
    async (capTableData: CapTableData, exchange: ExchangeCode, compareWith?: ExchangeCode[]) => {
      try {
        setLoading(true)
        setError(null)

        const requestBody = {
          exchange,
          ...capTableData,
          ...(compareWith && compareWith.length > 0 && { compareWith }),
        }

        const response = await fetch('/api/compliance/listing-rules', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }))
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.error || 'Validation failed')
        }

        setReport(data.report || null)
        setComparisonReports(data.comparisonReports || null)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
        setError(errorMessage)
        setReport(null)
        setComparisonReports(null)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const reset = useCallback(() => {
    setReport(null)
    setComparisonReports(null)
    setLoading(false)
    setError(null)
  }, [])

  return {
    report,
    comparisonReports,
    loading,
    error,
    validate,
    reset,
  }
}

/**
 * Hook for managing multiple exchange validations
 */
export function useMultiExchangeValidation() {
  const [reports, setReports] = useState<Record<ExchangeCode, ListingReadinessReport>>({} as Record<ExchangeCode, ListingReadinessReport>)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateAll = useCallback(
    async (capTableData: CapTableData, exchanges: ExchangeCode[]) => {
      try {
        setLoading(true)
        setError(null)

        const results: Record<ExchangeCode, ListingReadinessReport> = {} as Record<ExchangeCode, ListingReadinessReport>

        for (const exchange of exchanges) {
          const requestBody = {
            exchange,
            ...capTableData,
          }

          const response = await fetch('/api/compliance/listing-rules', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          })

          if (!response.ok) {
            throw new Error(`Failed to validate ${exchange}`)
          }

          const data = await response.json()
          if (data.success && data.report) {
            results[exchange] = data.report
          }
        }

        setReports(results)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const reset = useCallback(() => {
    setReports({} as Record<ExchangeCode, ListingReadinessReport>)
    setLoading(false)
    setError(null)
  }, [])

  return {
    reports,
    loading,
    error,
    validateAll,
    reset,
  }
}

/**
 * Hook for form state management in listing rules validation
 */
export function useListingRulesForm(initialValues?: Partial<CapTableData>) {
  const [formData, setFormData] = useState<CapTableData>({
    companyName: initialValues?.companyName || '',
    totalAuthorizedShares: initialValues?.totalAuthorizedShares || 0,
    totalIssuedShares: initialValues?.totalIssuedShares || 0,
    publicShares: initialValues?.publicShares || 0,
    publicSharePercentage: initialValues?.publicSharePercentage || 0,
    minSharePrice: initialValues?.minSharePrice || 0,
    proposedOfferingSize: initialValues?.proposedOfferingSize || 0,
    proposedSharesOffering: initialValues?.proposedSharesOffering || 0,
    proposedSharePrice: initialValues?.proposedSharePrice || 0,
    estimatedPublicFloatCAD: initialValues?.estimatedPublicFloatCAD,
    estimatedPublicFloatUSD: initialValues?.estimatedPublicFloatUSD,
    hasAuditCommittee: initialValues?.hasAuditCommittee || false,
    hasNominationCommittee: initialValues?.hasNominationCommittee || false,
    hasCompensationCommittee: initialValues?.hasCompensationCommittee || false,
    hasAuditedFinancials: initialValues?.hasAuditedFinancials || false,
    yearsOfFinancialHistory: initialValues?.yearsOfFinancialHistory || 0,
    completedResolutions: initialValues?.completedResolutions || [],
    completedConsents: initialValues?.completedConsents || [],
  })

  const updateField = useCallback((field: keyof CapTableData, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }, [])

  const updateFields = useCallback((updates: Partial<CapTableData>) => {
    setFormData((prev) => ({
      ...prev,
      ...updates,
    }))
  }, [])

  const reset = useCallback(() => {
    setFormData({
      companyName: initialValues?.companyName || '',
      totalAuthorizedShares: initialValues?.totalAuthorizedShares || 0,
      totalIssuedShares: initialValues?.totalIssuedShares || 0,
      publicShares: initialValues?.publicShares || 0,
      publicSharePercentage: initialValues?.publicSharePercentage || 0,
      minSharePrice: initialValues?.minSharePrice || 0,
      proposedOfferingSize: initialValues?.proposedOfferingSize || 0,
      proposedSharesOffering: initialValues?.proposedSharesOffering || 0,
      proposedSharePrice: initialValues?.proposedSharePrice || 0,
      estimatedPublicFloatCAD: initialValues?.estimatedPublicFloatCAD,
      estimatedPublicFloatUSD: initialValues?.estimatedPublicFloatUSD,
      hasAuditCommittee: initialValues?.hasAuditCommittee || false,
      hasNominationCommittee: initialValues?.hasNominationCommittee || false,
      hasCompensationCommittee: initialValues?.hasCompensationCommittee || false,
      hasAuditedFinancials: initialValues?.hasAuditedFinancials || false,
      yearsOfFinancialHistory: initialValues?.yearsOfFinancialHistory || 0,
      completedResolutions: initialValues?.completedResolutions || [],
      completedConsents: initialValues?.completedConsents || [],
    })
  }, [initialValues])

  return {
    formData,
    updateField,
    updateFields,
    reset,
  }
}
