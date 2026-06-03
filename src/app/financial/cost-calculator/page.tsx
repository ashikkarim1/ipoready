'use client'
import { useState } from 'react'
import { Calculator, Download, Share2 } from 'lucide-react'

export default function CostCalculatorPage() {
  const [inputs, setInputs] = useState({
    estimatedProceeds: 100000000,
    exchangeFees: 2500000,
    legalFees: 5000000,
    accountingFees: 2500000,
    underwritingFees: 5000000,
    marketingFees: 1500000,
    otherFees: 1000000,
  })

  const totalCosts = Object.values(inputs).slice(1).reduce((a, b) => a + b, 0)
  const netProceeds = inputs.estimatedProceeds - totalCosts

  const costBreakdown = [
    { label: 'Exchange Fees', value: inputs.exchangeFees, key: 'exchangeFees' },
    { label: 'Legal Fees', value: inputs.legalFees, key: 'legalFees' },
    { label: 'Accounting Fees', value: inputs.accountingFees, key: 'accountingFees' },
    { label: 'Underwriting Fees', value: inputs.underwritingFees, key: 'underwritingFees' },
    { label: 'Marketing Fees', value: inputs.marketingFees, key: 'marketingFees' },
    { label: 'Other Fees', value: inputs.otherFees, key: 'otherFees' },
  ]

  return (
    <div style={{ background: '#F7F6F4', minHeight: '100vh', colorScheme: 'light' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Calculator className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />
              <h1 className="serif text-3xl sm:text-4xl font-bold" style={{ color: 'var(--color-text-primary)' }}>IPO Cost Calculator</h1>
            </div>
            <p className="text-sm sm:text-base" style={{ color: 'var(--color-text-secondary)' }}>Estimate your total IPO costs and net proceeds</p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors" style={{ background: 'white', border: '1px solid #E5E4E0', color: 'var(--color-text-primary)' }} onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-opacity" style={{ background: 'var(--color-accent)', color: 'white' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.9'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Inputs */}
          <div className="lg:col-span-2">
            <div className="p-7 rounded-2xl" style={{ background: '#FFFFFF', border: '1px solid #E5E4E0' }}>
              <h2 className="font-bold text-lg mb-6" style={{ color: '#1A1A1A' }}>Fee Breakdown</h2>
              <div className="space-y-5">
                {costBreakdown.map((item) => (
                  <div key={item.key} className="flex items-center gap-6">
                    <label className="flex-1 text-sm font-medium" style={{ color: '#1A1A1A' }}>{item.label}</label>
                    <input
                      type="number"
                      value={item.value}
                      onChange={(e) => {
                        const newValue = parseInt(e.target.value) || 0
                        setInputs(prev => ({
                          ...prev,
                          [item.key]: newValue,
                        }))
                      }}
                      className="w-40 px-4 py-2.5 rounded-lg border text-sm font-medium"
                      style={{ borderColor: '#E5E4E0', background: '#F0EFED', color: '#1A1A1A' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="p-7 rounded-2xl" style={{ background: '#FFFFFF', border: '1px solid #E5E4E0' }}>
              <h3 className="font-bold text-lg mb-6" style={{ color: '#1A1A1A' }}>Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#717171' }}>Gross Proceeds</span>
                  <span className="font-bold text-base" style={{ color: '#1A1A1A' }}>${(inputs.estimatedProceeds / 1000000).toFixed(1)}M</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#717171' }}>Total Costs</span>
                  <span className="font-bold text-base" style={{ color: '#DC2626' }}>${(totalCosts / 1000000).toFixed(1)}M</span>
                </div>
                <div className="h-px" style={{ background: '#E5E4E0' }} />
                <div className="flex items-center justify-between pt-2">
                  <span className="font-bold text-base" style={{ color: '#1A1A1A' }}>Net Proceeds</span>
                  <span className="font-bold text-lg" style={{ color: '#2D7A5F' }}>${(netProceeds / 1000000).toFixed(1)}M</span>
                </div>
                <div className="text-xs mt-3" style={{ color: '#9A9A9A' }}>
                  {((totalCosts / inputs.estimatedProceeds) * 100).toFixed(1)}% of gross proceeds
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
