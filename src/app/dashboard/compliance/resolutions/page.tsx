'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type ResolutionType = 'prospectus_approval' | 'listing_approval' | 'underwriting_authorization' | 'material_contracts'

interface Resolution {
  id: string
  resolution_type: ResolutionType
  company_name: string
  approval_date: string
  status: 'draft' | 'approved' | 'executed' | 'archived'
  board_members: string[]
  approval_count: number
  created_at: string
  document_title: string
}

export default function ResolutionsPage() {
  const router = useRouter()
  const [resolutions, setResolutions] = useState<Resolution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchResolutions()
  }, [])

  const fetchResolutions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/compliance/resolutions')
      if (!response.ok) throw new Error('Failed to fetch resolutions')
      const data = await response.json()
      setResolutions(data.resolutions || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resolution?')) return
    try {
      const response = await fetch(`/api/compliance/resolutions/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete resolution')
      setResolutions(resolutions.filter(r => r.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  const getTypeLabel = (type: ResolutionType): string => {
    const labels: Record<ResolutionType, string> = {
      prospectus_approval: 'Prospectus Approval',
      listing_approval: 'Listing Approval',
      underwriting_authorization: 'Underwriting Authorization',
      material_contracts: 'Material Contracts',
    }
    return labels[type]
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      approved: 'bg-blue-100 text-blue-800',
      executed: 'bg-green-100 text-green-800',
      archived: 'bg-neutral-100 text-neutral-800',
    }
    return colors[status] || colors.draft
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Corporate Resolutions</h1>
          <p className="text-slate-600 mt-1">Manage and generate board resolutions for IPO compliance</p>
        </div>
        <Link href="/dashboard/compliance/resolutions/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            + New Resolution
          </Button>
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && resolutions.length === 0 && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <h3 className="text-base font-semibold text-slate-900 mb-2">No resolutions yet</h3>
            <p className="text-slate-600 text-sm mb-6">Create your first board resolution to get started</p>
            <Link href="/dashboard/compliance/resolutions/new">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Create First Resolution
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Resolutions List */}
      {!loading && resolutions.length > 0 && (
        <div className="grid gap-4">
          {resolutions.map(resolution => (
            <Card key={resolution.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold text-slate-900">
                      {resolution.document_title}
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm text-slate-600">
                      {getTypeLabel(resolution.resolution_type)} • {resolution.company_name}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(resolution.status)}>
                    {resolution.status.charAt(0).toUpperCase() + resolution.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                  <div>
                    <p className="text-slate-600 font-semibold mb-1">Approval Date</p>
                    <p className="text-slate-900 font-medium">{new Date(resolution.approval_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 font-semibold mb-1">Board Members</p>
                    <p className="text-slate-900 font-medium">{resolution.board_members.length} members</p>
                  </div>
                  <div>
                    <p className="text-slate-600 font-semibold mb-1">Approvals</p>
                    <p className="text-slate-900 font-medium">{resolution.approval_count} / {resolution.board_members.length}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 font-semibold mb-1">Created</p>
                    <p className="text-slate-900 font-medium">{new Date(resolution.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/dashboard/compliance/resolutions/${resolution.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Download
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => {
                          window.location.href = `/api/compliance/resolutions/${resolution.id}/download?format=docx`
                        }}
                      >
                        Word Document (.docx)
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          window.location.href = `/api/compliance/resolutions/${resolution.id}/download?format=pdf`
                        }}
                      >
                        PDF Document (.pdf)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(resolution.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Quick Reference */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">About Corporate Resolutions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>Prospectus Approval:</strong> Board approval of the prospectus document before filing with securities regulators.
          </p>
          <p>
            <strong>Listing Approval:</strong> Board authorization to list the company's securities on a public exchange.
          </p>
          <p>
            <strong>Underwriting Authorization:</strong> Board authorization for underwriters to manage the public offering.
          </p>
          <p>
            <strong>Material Contracts:</strong> Board approval of material contracts required before listing.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
