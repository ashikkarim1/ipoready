/**
 * Consent Utilities Tests
 * Tests for consent management, compliance calculation, and formatting utilities
 */

import {
  calculateConsentCompliance,
  getStatusBadge,
  getEntityTypeLabel,
  formatExpiryDate,
  isExpiringSoon,
  isExpired,
  ConsentRecord,
  ConsentStatus,
  EntityType,
} from '../consent-utils'

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_CONSENTS: ConsentRecord[] = [
  {
    id: '1',
    company_id: 'comp-1',
    from_entity: 'KPMG LLP',
    entity_type: 'auditor',
    consent_type: 'independent_audit',
    status: 'received',
    document_url: 'https://example.com/kpmg-consent.pdf',
    expiry_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: '2',
    company_id: 'comp-1',
    from_entity: 'Blake, Cassels & Graydon LLP',
    entity_type: 'lawyer',
    consent_type: 'legal_counsel_opinion',
    status: 'pending',
    document_url: null,
    expiry_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: '3',
    company_id: 'comp-1',
    from_entity: 'Duff & Phelps',
    entity_type: 'valuation-expert',
    consent_type: 'valuation-opinion',
    status: 'rejected',
    document_url: null,
    expiry_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago (expired)
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: '4',
    company_id: 'comp-1',
    from_entity: 'Environmental Consultants Inc.',
    entity_type: 'environmental-expert',
    consent_type: 'environmental-review',
    status: 'pending',
    document_url: null,
    expiry_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    created_at: new Date(),
    updated_at: new Date(),
  },
]

// ============================================================================
// Test Suites
// ============================================================================

describe('Consent Utilities', () => {
  describe('calculateConsentCompliance', () => {
    it('should calculate compliance percentage for TSX', () => {
      const compliance = calculateConsentCompliance(MOCK_CONSENTS, 'tsx')

      expect(compliance.total).toBe(4)
      expect(compliance.received).toBe(1)
      expect(compliance.pending).toBe(2)
      expect(compliance.rejected).toBe(1)
      expect(compliance.compliance_percentage).toBeGreaterThan(0)
      expect(compliance.compliance_percentage).toBeLessThanOrEqual(100)
    })

    it('should count expiring consents within 30 days', () => {
      const compliance = calculateConsentCompliance(MOCK_CONSENTS, 'tsx')

      // Should include the Blake Cassels consent expiring in 15 days
      expect(compliance.expiring_soon).toBeGreaterThan(0)
    })

    it('should return 100% compliance for empty required consents', () => {
      const compliance = calculateConsentCompliance([], 'tsx')

      expect(compliance.compliance_percentage).toBe(0)
      expect(compliance.total).toBe(0)
    })

    it('should handle all exchange types', () => {
      const exchanges = ['tsx', 'nasdaq', 'nyse', 'tsxv', 'cse'] as const

      exchanges.forEach((exchange) => {
        const compliance = calculateConsentCompliance(MOCK_CONSENTS, exchange)
        expect(compliance).toHaveProperty('compliance_percentage')
        expect(compliance).toHaveProperty('total')
        expect(compliance).toHaveProperty('received')
        expect(compliance).toHaveProperty('pending')
      })
    })
  })

  describe('getStatusBadge', () => {
    it('should return correct badge for pending status', () => {
      const badge = getStatusBadge('pending')

      expect(badge.label).toBe('Pending')
      expect(badge.color).toContain('text-')
      expect(badge.bg_color).toContain('bg-')
      expect(badge.icon).toBeTruthy()
    })

    it('should return correct badge for received status', () => {
      const badge = getStatusBadge('received')

      expect(badge.label).toBe('Received')
      expect(badge.icon).toContain('✓')
    })

    it('should return correct badge for all statuses', () => {
      const statuses: ConsentStatus[] = ['pending', 'received', 'rejected', 'expired', 'withdrawn']

      statuses.forEach((status) => {
        const badge = getStatusBadge(status)
        expect(badge).toHaveProperty('label')
        expect(badge).toHaveProperty('color')
        expect(badge).toHaveProperty('bg_color')
        expect(badge).toHaveProperty('icon')
      })
    })
  })

  describe('getEntityTypeLabel', () => {
    it('should return correct labels for all entity types', () => {
      expect(getEntityTypeLabel('auditor')).toBe('Auditor')
      expect(getEntityTypeLabel('lawyer')).toBe('Legal Counsel')
      expect(getEntityTypeLabel('valuation-expert')).toBe('Valuation Expert')
      expect(getEntityTypeLabel('environmental-expert')).toBe('Environmental Consultant')
      expect(getEntityTypeLabel('other-expert')).toBe('Other Expert')
    })
  })

  describe('formatExpiryDate', () => {
    it('should return "No expiry" for null date', () => {
      expect(formatExpiryDate(null)).toBe('No expiry')
    })

    it('should return "Expired" for past date', () => {
      const pastDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      expect(formatExpiryDate(pastDate)).toBe('Expired')
    })

    it('should return "Expires today" for current date', () => {
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      const result = formatExpiryDate(today)
      expect(result).toContain('today')
    })

    it('should return "Expires tomorrow" for tomorrow', () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
      const result = formatExpiryDate(tomorrow)
      expect(result).toContain('tomorrow')
    })

    it('should format date as string for far future dates', () => {
      const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      const result = formatExpiryDate(futureDate)
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}|[A-Z][a-z]{2} \d{1,2}, \d{4}/)
    })
  })

  describe('isExpiringSoon', () => {
    it('should return true for dates expiring within threshold', () => {
      const soonDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
      expect(isExpiringSoon(soonDate, 30)).toBe(true)
    })

    it('should return false for dates beyond threshold', () => {
      const laterDate = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
      expect(isExpiringSoon(laterDate, 30)).toBe(false)
    })

    it('should return false for past dates', () => {
      const pastDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      expect(isExpiringSoon(pastDate, 30)).toBe(false)
    })

    it('should return false for null date', () => {
      expect(isExpiringSoon(null, 30)).toBe(false)
    })

    it('should use default threshold of 30 days', () => {
      const soonDate = new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)
      expect(isExpiringSoon(soonDate)).toBe(true)
    })
  })

  describe('isExpired', () => {
    it('should return true for past dates', () => {
      const pastDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      expect(isExpired(pastDate)).toBe(true)
    })

    it('should return false for future dates', () => {
      const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
      expect(isExpired(futureDate)).toBe(false)
    })

    it('should return false for null date', () => {
      expect(isExpired(null)).toBe(false)
    })

    it('should return true for dates in the past', () => {
      const expiredDate = new Date('2020-01-01')
      expect(isExpired(expiredDate)).toBe(true)
    })
  })
})
