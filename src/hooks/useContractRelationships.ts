import { useState, useEffect } from 'react'
import { ContractNode } from '@/app/dashboard/documents/contracts-map/ContractsMap'

interface RelationshipResponse {
  relationships: any[]
  nodes: any[]
  edges: any[]
  company_id: string
  exchange: string | null
  summary?: {
    total: number
    required: number
    submitted: number
    missing: number
    recommended: number
  }
}

interface UseContractRelationshipsReturn {
  nodes: ContractNode[]
  loading: boolean
  error: string | null
  summary: RelationshipResponse['summary'] | null
  refresh: () => Promise<void>
}

/**
 * Hook to fetch and manage contract relationships for a company
 * @param companyId - The company ID to fetch relationships for
 * @param exchange - Optional exchange code to filter relationships
 * @returns Contract nodes, loading state, error state, and summary
 */
export function useContractRelationships(
  companyId: string | null,
  exchange?: string | null
): UseContractRelationshipsReturn {
  const [nodes, setNodes] = useState<ContractNode[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<RelationshipResponse['summary'] | null>(null)

  const fetchRelationships = async () => {
    if (!companyId) return

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

      const data: RelationshipResponse = await response.json()

      // Transform API response to ContractNode format
      const transformedNodes: ContractNode[] = data.relationships.map(
        (rel: any) => {
          // Determine status based on submission and requirement
          let status: 'submitted' | 'recommended' | 'required-missing' =
            'recommended'
          if (rel.status === 'submitted' || rel.status === 'approved') {
            status = 'submitted'
          } else if (rel.is_required && rel.status !== 'submitted') {
            status = 'required-missing'
          }

          return {
            id: rel.target_document_type_id,
            name: rel.document_type_name,
            type: rel.is_required ? 'Required' : 'Recommended',
            status,
            submittedAt: rel.submitted_at,
            description:
              rel.document_type_description ||
              rel.metadata?.description ||
              `${rel.document_type_name} document`,
            icon: null as any, // Icons will be added by component
          }
        }
      )

      setSummary(data.summary || null)
      setNodes(transformedNodes)
    } catch (err) {
      console.error('Error fetching contract relationships:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRelationships()
  }, [companyId, exchange])

  return {
    nodes,
    loading,
    error,
    summary,
    refresh: fetchRelationships,
  }
}