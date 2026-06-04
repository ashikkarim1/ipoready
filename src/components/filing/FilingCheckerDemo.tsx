'use client'

import { useState } from 'react'
import { FilingCheckerDashboard } from './FilingCheckerDashboard'

export function FilingCheckerDemo() {
  const [showNotification, setShowNotification] = useState<string | null>(null)

  // Mock data for demonstration
  const mockFiling = {
    filingId: 'IPO-2024-001',
    exchangeId: 'TSX',
    status: 'not_ready' as const,
    completenessScore: 72,
    complianceScore: 65,
    qualityScore: 78,
    crossValidationScore: 71,
    issues: [
      {
        id: 'iss-001',
        severity: 'critical' as const,
        category: 'CA - Prospectus Section',
        description: 'Risk Factors disclosure incomplete',
        requiredFix:
          'Section 1.2 requires comprehensive risk factor analysis including market, financial, operational, and regulatory risks. Current submission lacks detail on foreign exchange exposure and competitive threats.',
        documentType: 'Risk Factors Document',
        resolved: false,
      },
      {
        id: 'iss-002',
        severity: 'critical' as const,
        category: 'CA - Financial Statements',
        description: 'Auditor consent letter missing',
        requiredFix:
          'CSA requires signed consent from auditors before filing. Submit CPAB-registered auditor consent and report on agreed-upon procedures.',
        documentType: 'Auditor Consent Letter',
        resolved: false,
      },
      {
        id: 'iss-003',
        severity: 'warning' as const,
        category: 'CA - Board Information',
        description: 'Board independence disclosure needs update',
        requiredFix:
          'Update board composition to show 2+ independent directors per CSA requirements. Include independence rationale for each director.',
        documentType: 'Board Resolution',
        resolved: false,
      },
      {
        id: 'iss-004',
        severity: 'warning' as const,
        category: 'US - SEC Compliance',
        description: 'SOX Section 404 compliance statement required',
        requiredFix:
          'For US listing, include management assessment of internal control effectiveness and auditor attestation report.',
        documentType: 'SOX 404 Assessment',
        resolved: false,
      },
      {
        id: 'iss-005',
        severity: 'info' as const,
        category: 'CA - Corporate Governance',
        description: 'Executive compensation disclosure - standard disclosure required',
        requiredFix:
          'Provide detailed compensation discussion and analysis (CD&A) for named executive officers.',
        documentType: 'Compensation Disclosure',
        resolved: false,
      },
      {
        id: 'iss-006',
        severity: 'info' as const,
        category: 'US - Environmental, Social & Governance',
        description: 'ESG reporting framework alignment',
        requiredFix:
          'Align ESG disclosures with SASB standards for your industry sector. Include climate-related financial risks.',
        documentType: 'ESG Report',
        resolved: false,
      },
    ],
    missingDocuments: [
      { docType: 'Auditor Consent Letter', required: true, hasTemplate: false },
      { docType: 'Risk Factors Document', required: true, hasTemplate: true },
      { docType: 'Board Resolution', required: true, hasTemplate: true },
      { docType: 'SOX 404 Assessment', required: false, hasTemplate: true },
    ],
    sections: [
      { name: 'Company Overview', completeness: 95, issues: 0 },
      { name: 'Business Description', completeness: 88, issues: 1 },
      { name: 'Risk Factors', completeness: 45, issues: 3 },
      { name: 'Financial Statements', completeness: 72, issues: 2 },
      { name: 'Management & Governance', completeness: 68, issues: 3 },
      { name: 'Executive Compensation', completeness: 65, issues: 1 },
      { name: 'Corporate Governance', completeness: 60, issues: 2 },
    ],
  }

  const handleResolveIssue = (issueId: string) => {
    setShowNotification(`Issue ${issueId} updated`)
    setTimeout(() => setShowNotification(null), 3000)
  }

  const handleExportPDF = () => {
    setShowNotification('PDF exported successfully')
    setTimeout(() => setShowNotification(null), 3000)
  }

  const handleShareStatus = () => {
    setShowNotification('Filing status shared via email')
    setTimeout(() => setShowNotification(null), 3000)
  }

  const handleReadyToFile = () => {
    setShowNotification('Submission ready! Proceeding to filing portal.')
    setTimeout(() => setShowNotification(null), 3000)
  }

  const handleViewFullReport = () => {
    setShowNotification('Opening comprehensive filing report...')
    setTimeout(() => setShowNotification(null), 3000)
  }

  return (
    <>
      {showNotification && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg z-50">
          {showNotification}
        </div>
      )}

      <FilingCheckerDashboard
        {...mockFiling}
        onResolveIssue={handleResolveIssue}
        onExportPDF={handleExportPDF}
        onShareStatus={handleShareStatus}
        onReadyToFile={handleReadyToFile}
        onViewFullReport={handleViewFullReport}
      />
    </>
  )
}
