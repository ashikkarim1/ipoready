'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import ContractsMap, { ContractNode } from './ContractsMap'
import {
  FileText,
  Zap,
  Handshake,
  Shield,
  DollarSign,
  Users,
  AlertCircle,
  Loader,
  CheckCircle as CheckCircleIcon,
} from 'lucide-react'

// Icon mapping for document types
const iconMap: Record<string, React.ReactNode> = {
  prospectus: <FileText className="w-5 h-5" />,
  financing_agreement: <DollarSign className="w-5 h-5" />,
  employment_contract: <Users className="w-5 h-5" />,
  ip_assignment: <Shield className="w-5 h-5" />,
  license_agreement: <FileText className="w-5 h-5" />,
  service_contract: <Handshake className="w-5 h-5" />,
  board_minutes: <FileText className="w-5 h-5" />,
  shareholder_resolution: <FileText className="w-5 h-5" />,
  auditor_report: <FileText className="w-5 h-5" />,
  tax_compliance: <FileText className="w-5 h-5" />,
  insurance_policy: <Shield className="w-5 h-5" />,
  lease_agreement: <FileText className="w-5 h-5" />,
  regulatory_approval: <CheckCircleIcon className="w-5 h-5" />,
  exchange_approval: <Zap className="w-5 h-5" />,
}

// Fallback mock data for development/demo
const mockContractNodes: ContractNode[] = [
  {
    id: 'prospectus',
    name: 'Prospectus',
    type: 'Core Document',
    status: 'submitted',
    submittedAt: '2024-05-15',
    description:
      'The main offering document filed with securities regulators. Contains all material information about the company and the offering.',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    id: 'financing-agreements',
    name: 'Financing Agreements',
    type: 'Required',
    status: 'submitted',
    submittedAt: '2024-05-10',
    description:
      'Existing financing agreements, credit facilities, and debt instruments. Critical for disclosure of capital structure.',
    icon: <DollarSign className="w-5 h-5" />,
  },
  {
    id: 'employment-contracts',
    name: 'Employment Contracts',
    type: 'Required',
    status: 'submitted',
    submittedAt: '2024-05-12',
    description:
      'Key executive employment agreements including compensation, vesting schedules, and change-of-control provisions.',
    icon: <Users className="w-5 h-5" />,
  },
  {
    id: 'ip-assignment',
    name: 'IP Assignment Agreement',
    type: 'Required',
    status: 'submitted',
    submittedAt: '2024-05-14',
    description:
      'Agreements assigning intellectual property to the company. Necessary to confirm clean IP ownership.',
    icon: <Shield className="w-5 h-5" />,
  },
  {
    id: 'material-service-contracts',
    name: 'Material Service Contracts',
    type: 'Required - Missing',
    status: 'required-missing',
    description:
      'Contracts with material vendors, suppliers, and service providers. Must be identified and reviewed for continuity risk.',
    icon: <Handshake className="w-5 h-5" />,
  },
  {
    id: 'underwriting-agreement',
    name: 'Underwriting Agreement',
    type: 'Recommended',
    status: 'recommended',
    description:
      'Template underwriting agreement terms. Recommended to review early to understand underwriter requirements and risks.',
    icon: <Zap className="w-5 h-5" />,
  },
  {
    id: 'registrar-agreement',
    name: 'Registrar Agreement',
    type: 'Recommended',
    status: 'recommended',
    description:
      'Transfer agent and registrar services agreement. Recommended to secure early in the process.',
    icon: <FileText className="w-5 h-5" />,
  },
]

export default function ContractsMapPage() {
  const searchParams = useSearchParams()
  const companyId = searchParams.get('companyId')
  const exchange = searchParams.get('exchange')

  const [nodes, setNodes] = useState<ContractNode[]>(mockContractNodes)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<ContractNode | null>(null)
  const [uploadingNode, setUploadingNode] = useState<ContractNode | null>(null)
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'uploading' | 'success'
  >('idle')

  // Fetch contract nodes from API if companyId provided
  useEffect(() => {
    if (!companyId) {
      return
    }

    const fetchNodes = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams({
          companyId,
        })
        if (exchange) params.append('exchange', exchange)

        const response = await fetch(`/api/documents/relationships?${params}`)
        if (!response.ok) {
          throw new Error('Failed to fetch contract relationships')
        }

        const data = await response.json()

        // Transform API response to ContractNode format
        const transformedNodes: ContractNode[] = data.relationships.map(
          (rel: any) => {
            // Determine status
            let status: 'submitted' | 'recommended' | 'required-missing' =
              'recommended'
            if (rel.status === 'submitted') {
              status = 'submitted'
            } else if (rel.is_required && rel.status !== 'submitted') {
              status = 'required-missing'
            }

            return {
              id: rel.target_document_type_id,
              name: rel.document_type_name,
              type: rel.is_required
                ? 'Required'
                : 'Recommended',
              status,
              submittedAt: rel.submitted_at,
              description: rel.metadata?.description || `${rel.document_type_name} document`,
              icon:
                iconMap[rel.document_type_code] ||
                <FileText className="w-5 h-5" />,
            }
          }
        )

        // Ensure prospectus is first
        const prospectusIndex = transformedNodes.findIndex(
          (n) => n.id === 'prospectus'
        )
        if (prospectusIndex > -1) {
          const prospectus = transformedNodes.splice(prospectusIndex, 1)[0]
          transformedNodes.unshift(prospectus)
        }

        setNodes(transformedNodes)
      } catch (err) {
        console.error('Error fetching contract nodes:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        // Fall back to mock data
        setNodes(mockContractNodes)
      } finally {
        setLoading(false)
      }
    }

    fetchNodes()
  }, [companyId, exchange])

  const handleNodeClick = (node: ContractNode) => {
    setSelectedNode(node)
  }

  const handleUploadClick = (node: ContractNode) => {
    setUploadingNode(node)
    // Simulate upload
    setUploadStatus('uploading')
    setTimeout(() => {
      setUploadStatus('success')
      // In a real app, update the node status via API
      setTimeout(() => {
        setUploadStatus('idle')
        setUploadingNode(null)
      }, 2000)
    }, 1500)
  }

  const requiredMissing = nodes.filter((n) => n.status === 'required-missing')
  const riskAssessment =
    requiredMissing.length > 0 ? '15M shares at risk' : 'All required docs submitted'

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading contracts network...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* Page header with context */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Material Contracts Network
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl">
              Interactive visualization of your prospectus relationships. Click any document
              node to view details, upload, or manage. Missing required documents are highlighted
              in pulsing red.
            </p>
          </div>
          {requiredMissing.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="font-bold text-base text-red-900">Action Required</p>
              </div>
              <p className="text-xs font-semibold text-red-700">
                {requiredMissing.length} required document{
                  requiredMissing.length > 1 ? 's' : ''
                }{' '}
                missing
              </p>
              <p className="text-xs text-red-600 mt-1">{riskAssessment}</p>
            </div>
          )}
        </div>
      </div>

      {/* Main graph area */}
      <div className="flex-1 overflow-hidden">
        <ContractsMap
          nodes={nodes}
          onNodeClick={handleNodeClick}
          onUploadClick={handleUploadClick}
          companyName={companyId ? 'Company' : 'Demo Company'}
        />
      </div>

      {/* Upload status modal */}
      {uploadingNode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              {uploadStatus === 'uploading' && (
                <>
                  <div className="inline-block">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    Uploading Document
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    {uploadingNode.name}
                  </p>
                </>
              )}
              {uploadStatus === 'success' && (
                <>
                  <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Upload Successful
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    {uploadingNode.name} has been uploaded and saved.
                  </p>
                  <p className="text-xs text-gray-500 mt-3">
                    The graph will update automatically
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}