'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type ResolutionType = 'prospectus_approval' | 'listing_approval' | 'underwriting_authorization' | 'material_contracts'

interface FormData {
  resolutionType: ResolutionType | ''
  companyName: string
  approvalDate: string
  exchange: string
  boardMembers: string[]
  prospectusTitle: string
  targetExchange: string
  underwriterName: string
  offeringSize: string
  underwritingCommission: string
  contractDescription: string
  counterpartyName: string
  contractValue: string
}

export default function NewResolutionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newBoardMember, setNewBoardMember] = useState('')
  const [formData, setFormData] = useState<FormData>({
    resolutionType: '',
    companyName: '',
    approvalDate: new Date().toISOString().split('T')[0],
    exchange: '',
    boardMembers: [],
    prospectusTitle: '',
    targetExchange: '',
    underwriterName: '',
    offeringSize: '',
    underwritingCommission: '',
    contractDescription: '',
    counterpartyName: '',
    contractValue: '',
  })

  const handleAddBoardMember = () => {
    if (newBoardMember.trim()) {
      setFormData(prev => ({
        ...prev,
        boardMembers: [...prev.boardMembers, newBoardMember.trim()],
      }))
      setNewBoardMember('')
    }
  }

  const handleRemoveBoardMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      boardMembers: prev.boardMembers.filter((_, i) => i !== index),
    }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = (): boolean => {
    if (!formData.resolutionType) {
      setError('Please select a resolution type')
      return false
    }
    if (!formData.companyName.trim()) {
      setError('Company name is required')
      return false
    }
    if (!formData.approvalDate) {
      setError('Approval date is required')
      return false
    }
    if (formData.boardMembers.length === 0) {
      setError('At least one board member is required')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) return

    try {
      setLoading(true)

      const payload = {
        resolutionType: formData.resolutionType,
        companyName: formData.companyName,
        approvalDate: formData.approvalDate,
        boardMembers: formData.boardMembers,
        exchange: formData.exchange || undefined,
        prospectusDetails: formData.resolutionType === 'prospectus_approval' ? {
          prospectusTitle: formData.prospectusTitle,
        } : undefined,
        listingDetails: formData.resolutionType === 'listing_approval' ? {
          targetExchange: formData.targetExchange,
        } : undefined,
        underwritingDetails: formData.resolutionType === 'underwriting_authorization' ? {
          underwriterName: formData.underwriterName,
          offeringSize: formData.offeringSize,
          underwritingCommission: formData.underwritingCommission,
        } : undefined,
        contractDetails: formData.resolutionType === 'material_contracts' ? {
          contractDescription: formData.contractDescription,
          counterpartyName: formData.counterpartyName,
          contractValue: formData.contractValue,
        } : undefined,
      }

      const response = await fetch('/api/compliance/resolutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate resolution')
      }

      const data = await response.json()
      router.push(`/dashboard/compliance/resolutions/${data.resolutionId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Create New Resolution</h1>
        <p className="text-gray-600 mt-1">Generate a professional board resolution for IPO compliance</p>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter the basic details for the resolution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="resolutionType">Resolution Type *</Label>
                <Select value={formData.resolutionType} onValueChange={(value) => handleSelectChange('resolutionType', value)}>
                  <SelectTrigger id="resolutionType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prospectus_approval">Prospectus Approval</SelectItem>
                    <SelectItem value="listing_approval">Listing Approval</SelectItem>
                    <SelectItem value="underwriting_authorization">Underwriting Authorization</SelectItem>
                    <SelectItem value="material_contracts">Material Contracts</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <Label htmlFor="approvalDate">Approval Date *</Label>
                <Input
                  id="approvalDate"
                  name="approvalDate"
                  type="date"
                  value={formData.approvalDate}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="exchange">Exchange (Optional)</Label>
                <Select value={formData.exchange} onValueChange={(value) => handleSelectChange('exchange', value)}>
                  <SelectTrigger id="exchange">
                    <SelectValue placeholder="Select exchange" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tsx">TSX</SelectItem>
                    <SelectItem value="tsxv">TSXV</SelectItem>
                    <SelectItem value="cse">CSE</SelectItem>
                    <SelectItem value="nasdaq">NASDAQ</SelectItem>
                    <SelectItem value="nyse">NYSE</SelectItem>
                    <SelectItem value="otc">OTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Board Members */}
        <Card>
          <CardHeader>
            <CardTitle>Board Members</CardTitle>
            <CardDescription>Add all board members who will sign this resolution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newBoardMember}
                onChange={(e) => setNewBoardMember(e.target.value)}
                placeholder="Enter board member name"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddBoardMember()
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddBoardMember}
              >
                Add
              </Button>
            </div>

            {formData.boardMembers.length > 0 && (
              <div className="space-y-2">
                {formData.boardMembers.map((member, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                    <span>{member}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveBoardMember(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Type-Specific Details */}
        {formData.resolutionType === 'prospectus_approval' && (
          <Card>
            <CardHeader>
              <CardTitle>Prospectus Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="prospectusTitle">Prospectus Title</Label>
                <Input
                  id="prospectusTitle"
                  name="prospectusTitle"
                  value={formData.prospectusTitle}
                  onChange={handleInputChange}
                  placeholder="Enter prospectus title"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {formData.resolutionType === 'listing_approval' && (
          <Card>
            <CardHeader>
              <CardTitle>Listing Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="targetExchange">Target Exchange</Label>
                <Select value={formData.targetExchange} onValueChange={(value) => handleSelectChange('targetExchange', value)}>
                  <SelectTrigger id="targetExchange">
                    <SelectValue placeholder="Select exchange" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tsx">TSX</SelectItem>
                    <SelectItem value="tsxv">TSXV</SelectItem>
                    <SelectItem value="cse">CSE</SelectItem>
                    <SelectItem value="nasdaq">NASDAQ</SelectItem>
                    <SelectItem value="nyse">NYSE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {formData.resolutionType === 'underwriting_authorization' && (
          <Card>
            <CardHeader>
              <CardTitle>Underwriting Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="underwriterName">Underwriter Name</Label>
                <Input
                  id="underwriterName"
                  name="underwriterName"
                  value={formData.underwriterName}
                  onChange={handleInputChange}
                  placeholder="Enter underwriter name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="offeringSize">Offering Size</Label>
                  <Input
                    id="offeringSize"
                    name="offeringSize"
                    value={formData.offeringSize}
                    onChange={handleInputChange}
                    placeholder="e.g., $10,000,000"
                  />
                </div>
                <div>
                  <Label htmlFor="underwritingCommission">Underwriting Commission</Label>
                  <Input
                    id="underwritingCommission"
                    name="underwritingCommission"
                    value={formData.underwritingCommission}
                    onChange={handleInputChange}
                    placeholder="e.g., 4.5%"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {formData.resolutionType === 'material_contracts' && (
          <Card>
            <CardHeader>
              <CardTitle>Contract Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="contractDescription">Contract Description</Label>
                <Input
                  id="contractDescription"
                  name="contractDescription"
                  value={formData.contractDescription}
                  onChange={handleInputChange}
                  placeholder="Describe the contract"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="counterpartyName">Counterparty Name</Label>
                  <Input
                    id="counterpartyName"
                    name="counterpartyName"
                    value={formData.counterpartyName}
                    onChange={handleInputChange}
                    placeholder="Enter counterparty name"
                  />
                </div>
                <div>
                  <Label htmlFor="contractValue">Contract Value</Label>
                  <Input
                    id="contractValue"
                    name="contractValue"
                    value={formData.contractValue}
                    onChange={handleInputChange}
                    placeholder="e.g., $5,000,000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Generating...' : 'Generate Resolution'}
          </Button>
        </div>
      </form>
    </div>
  )
}
