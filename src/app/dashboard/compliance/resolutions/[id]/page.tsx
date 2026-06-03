'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Resolution {
  id: string
  resolution_type: string
  company_name: string
  approval_date: string
  status: string
  board_members: string[]
  approval_count: number
  created_at: string
  updated_at: string
  document_title: string
  html_content: string
}

interface Approval {
  id: string
  board_member_name: string
  approval_status: string
  approval_date: string | null
}

export default function ResolutionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [resolution, setResolution] = useState<Resolution | null>(null)
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const resolutionId = params.id as string

  useEffect(() => {
    if (resolutionId) {
      fetchResolution()
    }
  }, [resolutionId])

  const fetchResolution = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/compliance/resolutions/${resolutionId}`)
      if (!response.ok) throw new Error('Failed to fetch resolution')
      const data = await response.json()
      setResolution(data.resolution)
      setApprovals(data.approvals || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/compliance/resolutions/${resolutionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!response.ok) throw new Error('Failed to update status')
      const data = await response.json()
      setResolution(data.resolution)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status')
    }
  }

  const handleDownload = (format: 'docx' | 'pdf') => {
    window.location.href = `/api/compliance/resolutions/${resolutionId}/download?format=${format}`
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure? This action cannot be undone.')) return
    try {
      const response = await fetch(`/api/compliance/resolutions/${resolutionId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete resolution')
      router.push('/dashboard/compliance/resolutions')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    }
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

  const getApprovalStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    }
    return colors[status] || colors.pending
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!resolution) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">{error || 'Resolution not found'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const approvalPercentage = Math.round(
    (resolution.approval_count / resolution.board_members.length) * 100
  )

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <Link href="/dashboard/compliance/resolutions" className="text-blue-600 hover:underline mb-2 block">
            &larr; Back to Resolutions
          </Link>
          <h1 className="text-3xl font-bold">{resolution.document_title}</h1>
          <p className="text-gray-600 mt-1">{resolution.company_name}</p>
        </div>
        <Badge className={getStatusColor(resolution.status)}>
          {resolution.status.charAt(0).toUpperCase() + resolution.status.slice(1)}
        </Badge>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-500 text-sm">Approval Date</p>
            <p className="text-lg font-semibold">{new Date(resolution.approval_date).toLocaleDateString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-500 text-sm">Board Members</p>
            <p className="text-lg font-semibold">{resolution.board_members.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-500 text-sm">Approvals</p>
            <p className="text-lg font-semibold">{resolution.approval_count} / {resolution.board_members.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-500 text-sm">Status %</p>
            <p className="text-lg font-semibold">{approvalPercentage}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="document" className="space-y-6">
        <TabsList>
          <TabsTrigger value="document">Resolution Document</TabsTrigger>
          <TabsTrigger value="approvals">Board Approvals</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        {/* Document Tab */}
        <TabsContent value="document">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Resolution Document</CardTitle>
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Download
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleDownload('docx')}>
                        Word Document (.docx)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload('pdf')}>
                        PDF Document (.pdf)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm max-w-none bg-gray-50 p-6 rounded border"
                dangerouslySetInnerHTML={{ __html: resolution.html_content }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals">
          <Card>
            <CardHeader>
              <CardTitle>Board Member Approvals</CardTitle>
              <CardDescription>Track approval status from each board member</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {approvals.length > 0 ? (
                  approvals.map(approval => (
                    <div key={approval.id} className="flex justify-between items-center p-3 border rounded bg-gray-50">
                      <div>
                        <p className="font-medium">{approval.board_member_name}</p>
                        {approval.approval_date && (
                          <p className="text-sm text-gray-500">
                            {approval.approval_status === 'approved' ? 'Approved' : 'Pending'} {' '}
                            {new Date(approval.approval_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Badge className={getApprovalStatusColor(approval.approval_status)}>
                        {approval.approval_status.charAt(0).toUpperCase() + approval.approval_status.slice(1)}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No board members added</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Resolution Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Company Name</p>
                  <p className="font-medium">{resolution.company_name}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Resolution Type</p>
                  <p className="font-medium">{resolution.resolution_type.replace(/_/g, ' ').toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Approval Date</p>
                  <p className="font-medium">{new Date(resolution.approval_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Current Status</p>
                  <p className="font-medium capitalize">{resolution.status}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Created</p>
                  <p className="font-medium">{new Date(resolution.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Last Updated</p>
                  <p className="font-medium">{new Date(resolution.updated_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Status Change */}
              <div className="pt-4 border-t space-y-4">
                <p className="font-medium">Change Status</p>
                <div className="flex gap-2">
                  {['draft', 'approved', 'executed', 'archived'].map(status => (
                    <Button
                      key={status}
                      variant={resolution.status === status ? 'default' : 'outline'}
                      onClick={() => handleStatusChange(status)}
                      className={resolution.status === status ? 'bg-blue-600' : ''}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Danger Zone */}
              <div className="pt-4 border-t space-y-4">
                <p className="font-medium text-red-600">Danger Zone</p>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                >
                  Delete Resolution
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
