'use client'

import React from 'react'
import { CapTableData } from '@/lib/listing-rules'
import { motion } from 'framer-motion'

interface InputFormProps {
  formData: CapTableData
  onFieldChange: (field: keyof CapTableData, value: unknown) => void
  onSubmit: (e: React.FormEvent) => void
  isLoading?: boolean
}

export function InputForm({ formData, onFieldChange, onSubmit, isLoading }: InputFormProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target
    const field = name as keyof CapTableData

    if (type === 'checkbox') {
      onFieldChange(field, checked)
    } else if (type === 'number') {
      onFieldChange(field, parseFloat(value) || 0)
    } else {
      onFieldChange(field, value)
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={onSubmit}
      className="bg-white rounded-xl shadow-lg p-8 space-y-8"
    >
      {/* Company Section */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
          Company Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-50"
              placeholder="E.g., TechCorp Inc."
            />
          </div>
        </div>
      </div>

      {/* Share Structure Section */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
          Share Structure
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Total Authorized Shares
            </label>
            <input
              type="number"
              name="totalAuthorizedShares"
              value={formData.totalAuthorizedShares}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-50"
              placeholder="50,000,000"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Total Issued Shares
            </label>
            <input
              type="number"
              name="totalIssuedShares"
              value={formData.totalIssuedShares}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-50"
              placeholder="28,000,000"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Public Shares
            </label>
            <input
              type="number"
              name="publicShares"
              value={formData.publicShares}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-50"
              placeholder="7,000,000"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Public Share Percentage (%)
            </label>
            <input
              type="number"
              name="publicSharePercentage"
              value={formData.publicSharePercentage}
              onChange={handleInputChange}
              disabled={isLoading}
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-50"
              placeholder="25.00"
            />
          </div>
        </div>
      </div>

      {/* Offering Section */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
          Offering Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Proposed Offering Size (Millions)
            </label>
            <input
              type="number"
              name="proposedOfferingSize"
              value={formData.proposedOfferingSize}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-50"
              placeholder="75"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Proposed Shares in Offering
            </label>
            <input
              type="number"
              name="proposedSharesOffering"
              value={formData.proposedSharesOffering}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-50"
              placeholder="5,000,000"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Minimum Share Price
            </label>
            <input
              type="number"
              name="minSharePrice"
              value={formData.minSharePrice}
              onChange={handleInputChange}
              disabled={isLoading}
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-50"
              placeholder="4.00"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Proposed Share Price
            </label>
            <input
              type="number"
              name="proposedSharePrice"
              value={formData.proposedSharePrice}
              onChange={handleInputChange}
              disabled={isLoading}
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-50"
              placeholder="15.00"
            />
          </div>
        </div>
      </div>

      {/* Float Estimates Section */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
          Float Estimates (Optional)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Estimated Public Float (CAD Millions)
            </label>
            <input
              type="number"
              name="estimatedPublicFloatCAD"
              value={formData.estimatedPublicFloatCAD || ''}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-50"
              placeholder="105"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Estimated Public Float (USD Millions)
            </label>
            <input
              type="number"
              name="estimatedPublicFloatUSD"
              value={formData.estimatedPublicFloatUSD || ''}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-50"
              placeholder="78"
            />
          </div>
        </div>
      </div>

      {/* Financial History Section */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
          Financial & Governance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Years of Financial History
            </label>
            <input
              type="number"
              name="yearsOfFinancialHistory"
              value={formData.yearsOfFinancialHistory || 0}
              onChange={handleInputChange}
              disabled={isLoading}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-50"
              placeholder="2"
            />
          </div>
        </div>

        {/* Checkboxes */}
        <div className="mt-6 space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="hasAuditCommittee"
              checked={formData.hasAuditCommittee || false}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-semibold text-gray-700">Audit Committee Established</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="hasNominationCommittee"
              checked={formData.hasNominationCommittee || false}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-semibold text-gray-700">Nomination Committee Established</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="hasCompensationCommittee"
              checked={formData.hasCompensationCommittee || false}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-semibold text-gray-700">Compensation Committee Established</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="hasAuditedFinancials"
              checked={formData.hasAuditedFinancials || false}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-semibold text-gray-700">Audited Financials Available</span>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Validating...' : 'Validate Against Exchanges'}
        </button>
      </div>
    </motion.form>
  )
}
