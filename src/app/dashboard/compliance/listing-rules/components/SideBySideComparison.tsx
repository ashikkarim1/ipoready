'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ListingReadinessReport } from '@/lib/listing-rules'
import { getExchangeConfig, ExchangeCode } from '@/lib/exchange-config'

interface SideBySideComparisonProps {
  exchange1: ExchangeCode
  report1: ListingReadinessReport
  exchange2: ExchangeCode
  report2: ListingReadinessReport
}

export function SideBySideComparison({
  exchange1,
  report1,
  exchange2,
  report2,
}: SideBySideComparisonProps) {
  const config1 = getExchangeConfig(exchange1)
  const config2 = getExchangeConfig(exchange2)

  // Guard clause to ensure both configs are available
  if (!config1 || !config2) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <p className="text-red-600 font-semibold">Unable to load exchange configurations</p>
      </div>
    )
  }

  const renderComplianceIcon = (compliant: boolean) => {
    return compliant ? (
      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
    >
      <div className="p-6 border-b border-gray-200">
        <h3 className="h4 font-bold text-gray-900">
          {config1.name} vs {config2.name}
        </h3>
      </div>

      <div className="divide-x divide-gray-200">
        <div className="grid grid-cols-2 gap-0">
          {/* Exchange 1 Column */}
          <div className="p-6 space-y-6">
            <div>
              <h4 className="h4 font-bold text-gray-900 mb-2">{config1.name}</h4>
              <p className="caption-sm text-gray-600">{config1.country}</p>
            </div>

            {/* Compliance Score */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="label-sm font-semibold text-gray-600 uppercase mb-2">Compliance Score</p>
              <p className="text-3xl font-bold text-gray-900">{report1.complianceScore}</p>
              <p className={`text-sm font-semibold mt-1 ${
                report1.overallStatus === 'ready'
                  ? 'text-green-600'
                  : report1.overallStatus === 'at-risk'
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}>
                {report1.overallStatus.toUpperCase()}
              </p>
            </div>

            {/* Key Metrics */}
            <div className="space-y-3">
              <p className="label font-semibold text-gray-700 uppercase">Key Requirements</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="body-sm text-gray-600">Public Float: {config1.minPublicFloat}%</span>
                  {renderComplianceIcon(report1.gaps.some((g) => g.metric.includes('Public Float')))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="body-sm text-gray-600">Min Shares: {config1.minShares.toLocaleString()}</span>
                  {renderComplianceIcon(report1.gaps.some((g) => g.metric.includes('Public Shares')))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="body-sm text-gray-600">Min Price: ${config1.minSharePrice}</span>
                  {renderComplianceIcon(true)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="body-sm text-gray-600">Audit Cmte: {config1.requiresAuditCommittee ? 'Required' : 'Optional'}</span>
                  {renderComplianceIcon(report1.summary.criticalViolations === 0)}
                </div>
              </div>
            </div>

            {/* Violations Summary */}
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <p className="label-sm font-semibold text-red-900 uppercase mb-2">Issues Found</p>
              <div className="space-y-1 body-sm">
                <p className="text-red-700"><span className="font-bold">{report1.summary.criticalViolations}</span> Critical</p>
                <p className="text-red-700"><span className="font-bold">{report1.summary.errorViolations}</span> Errors</p>
                <p className="text-red-700"><span className="font-bold">{report1.summary.warningViolations}</span> Warnings</p>
              </div>
            </div>
          </div>

          {/* Exchange 2 Column */}
          <div className="p-6 space-y-6">
            <div>
              <h4 className="h4 font-bold text-gray-900 mb-2">{config2.name}</h4>
              <p className="caption-sm text-gray-600">{config2.country}</p>
            </div>

            {/* Compliance Score */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="label-sm font-semibold text-gray-600 uppercase mb-2">Compliance Score</p>
              <p className="text-3xl font-bold text-gray-900">{report2.complianceScore}</p>
              <p className={`text-sm font-semibold mt-1 ${
                report2.overallStatus === 'ready'
                  ? 'text-green-600'
                  : report2.overallStatus === 'at-risk'
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}>
                {report2.overallStatus.toUpperCase()}
              </p>
            </div>

            {/* Key Metrics */}
            <div className="space-y-3">
              <p className="label font-semibold text-gray-700 uppercase">Key Requirements</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="body-sm text-gray-600">Public Float: {config2.minPublicFloat}%</span>
                  {renderComplianceIcon(report2.gaps.some((g) => g.metric.includes('Public Float')))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="body-sm text-gray-600">Min Shares: {config2.minShares.toLocaleString()}</span>
                  {renderComplianceIcon(report2.gaps.some((g) => g.metric.includes('Public Shares')))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="body-sm text-gray-600">Min Price: ${config2.minSharePrice}</span>
                  {renderComplianceIcon(true)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="body-sm text-gray-600">Audit Cmte: {config2.requiresAuditCommittee ? 'Required' : 'Optional'}</span>
                  {renderComplianceIcon(report2.summary.criticalViolations === 0)}
                </div>
              </div>
            </div>

            {/* Violations Summary */}
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <p className="label-sm font-semibold text-red-900 uppercase mb-2">Issues Found</p>
              <div className="space-y-1 body-sm">
                <p className="text-red-700"><span className="font-bold">{report2.summary.criticalViolations}</span> Critical</p>
                <p className="text-red-700"><span className="font-bold">{report2.summary.errorViolations}</span> Errors</p>
                <p className="text-red-700"><span className="font-bold">{report2.summary.warningViolations}</span> Warnings</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-blue-50 border-t border-gray-200 p-6">
        <h4 className="body-sm font-bold text-blue-900 mb-2">Recommendation</h4>
        <p className="body-sm text-blue-800">
          {report1.complianceScore > report2.complianceScore
            ? `${config1.name} is the better fit with a compliance score of ${report1.complianceScore} vs ${report2.complianceScore}.`
            : report2.complianceScore > report1.complianceScore
            ? `${config2.name} is the better fit with a compliance score of ${report2.complianceScore} vs ${report1.complianceScore}.`
            : 'Both exchanges have equal compliance scores. Consider business objectives, trading volume, and investor base.'}
        </p>
      </div>
    </motion.div>
  )
}
