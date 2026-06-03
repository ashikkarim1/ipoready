'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
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
  Network,
  ArrowRight,
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
      <div style={{ background: '#F7F6F4', minHeight: '100vh' }} className="flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block mb-4">
            <Loader className="w-12 h-12 animate-spin" style={{ color: '#E8312A' }} />
          </div>
          <p className="text-text-muted">Loading contracts network...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#F7F6F4', minHeight: '100vh' }} className="flex flex-col">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto w-full" style={{ paddingTop: '3rem', paddingBottom: '2rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}>
          
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2 mb-4">
            <span className="pill text-xs font-bold uppercase tracking-wider"
              style={{ background: '#FDECEB', color: '#E8312A' }}>
              <Network className="w-3.5 h-3.5 inline mr-1.5" />
              Contract Network
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.06 }}
            className="serif text-nav"
            style={{ fontSize: '2.5rem', lineHeight: '1.2', marginBottom: '1rem' }}>
            Material Contracts<br />
            <span style={{ color: '#E8312A' }}>Network Visualization</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="text-text-muted text-lg leading-relaxed" style={{ maxWidth: '620px', marginBottom: requiredMissing.length > 0 ? '1.5rem' : '0' }}>
            Interactive graph of all prospectus relationships and document dependencies. Click any node to upload, review, or manage documents.
          </motion.p>

          {/* Alert if docs missing */}
          {requiredMissing.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.18 }}
              className="card p-6" style={{ background: '#FDECEB', border: '1px solid #F5E5E1', marginTop: '1.5rem' }}>
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#FFD4CE' }}>
                  <AlertCircle className="w-5 h-5" style={{ color: '#E8312A' }} />
                </div>
                <div>
                  <h3 className="font-semibold text-nav mb-1">Action Required</h3>
                  <p className="text-sm text-text-muted">
                    {requiredMissing.length} required document{requiredMissing.length > 1 ? 's' : ''} missing. {riskAssessment}.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </section>

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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card p-8 max-w-md w-full mx-4">
            <div className="text-center">
              {uploadStatus === 'uploading' && (
                <>
                  <div className="inline-block mb-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200" style={{ borderTopColor: '#E8312A' }}></div>
                  </div>
                  <h3 className="h4 font-semibold text-nav mb-2">
                    Uploading Document
                  </h3>
                  <p className="text-sm text-text-muted">
                    {uploadingNode.name}
                  </p>
                </>
              )}
              {uploadStatus === 'success' && (
                <>
                  <div className="inline-block p-3 rounded-full mb-4" style={{ background: '#EAF5F0' }}>
                    <CheckCircleIcon className="w-6 h-6" style={{ color: '#2D7A5F' }} />
                  </div>
                  <h3 className="h4 font-semibold text-nav mb-2">
                    Upload Successful
                  </h3>
                  <p className="text-sm text-text-muted mb-2">
                    {uploadingNode.name} has been uploaded and saved.
                  </p>
                  <p className="caption-sm text-text-muted">
                    The graph will update automatically
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}