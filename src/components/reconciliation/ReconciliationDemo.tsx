'use client'

import { useState, useCallback } from 'react'
import { ReconciliationDashboard, type MetricAlignment, type ReconciliationIssue, type AlertRule } from './ReconciliationDashboard'

// Demo component with interactive data
export function ReconciliationDemo() {
  const [refreshCount, setRefreshCount] = useState(0)
  const [metrics, setMetrics] = useState<MetricAlignment[]>([
    {
      metricId: '1',
      metric: 'Revenue',
      pace_value: '$45.2M',
      financial_value: '$45.1M',
      prospectus_value: '$45M+',
      cap_table_value: 'N/A',
      status: 'aligned',
      variance_percent: 0.22,
      isExplained: false,
      lastUpdated: new Date(),
    },
    {
      metricId: '2',
      metric: 'Growth%',
      pace_value: '15% YoY',
      financial_value: '12% YoY',
      prospectus_value: 'High growth',
      cap_table_value: 'N/A',
      status: 'needs_review',
      variance_percent: 3,
      isExplained: false,
      lastUpdated: new Date(),
    },
    {
      metricId: '3',
      metric: 'Margins',
      pace_value: '35%',
      financial_value: '32%',
      prospectus_value: '35%+',
      cap_table_value: 'N/A',
      status: 'needs_review',
      variance_percent: 3,
      isExplained: false,
      lastUpdated: new Date(),
    },
    {
      metricId: '4',
      metric: 'Headcount',
      pace_value: '125',
      financial_value: '125',
      prospectus_value: '130 (proj)',
      cap_table_value: '125',
      status: 'aligned',
      variance_percent: 0,
      isExplained: false,
      lastUpdated: new Date(),
    },
    {
      metricId: '5',
      metric: 'Runway',
      pace_value: '18 months',
      financial_value: '16 months',
      prospectus_value: '18+ months',
      cap_table_value: 'N/A',
      status: 'critical',
      variance_percent: 12,
      isExplained: false,
      lastUpdated: new Date(),
    },
    {
      metricId: '6',
      metric: 'Burn Rate',
      pace_value: '$250K/month',
      financial_value: '$280K/month',
      prospectus_value: '$250K/month',
      cap_table_value: 'N/A',
      status: 'needs_review',
      variance_percent: 12,
      isExplained: false,
      lastUpdated: new Date(),
    },
    {
      metricId: '7',
      metric: 'Unit Economics',
      pace_value: 'LTV:$8K CAC:$1.2K',
      financial_value: 'LTV:$7.5K CAC:$1.2K',
      prospectus_value: 'Strong unit eco',
      cap_table_value: 'N/A',
      status: 'needs_review',
      variance_percent: 6.67,
      isExplained: false,
      lastUpdated: new Date(),
    },
    {
      metricId: '8',
      metric: 'Customer Count',
      pace_value: '450',
      financial_value: '450',
      prospectus_value: '450+',
      cap_table_value: 'N/A',
      status: 'aligned',
      variance_percent: 0,
      isExplained: false,
      lastUpdated: new Date(),
    },
  ])

  const issues: ReconciliationIssue[] = [
    {
      id: '1',
      severity: 'critical',
      metric: 'Runway',
      source1: 'PACE',
      source2: 'Financials',
      value1: '18 months',
      value2: '16 months',
      variance: 12,
      impact: '2-month discrepancy could affect credibility with investors',
      suggestedFix: 'Update burn rate assumptions in Financials to align with PACE projections',
    },
    {
      id: '2',
      severity: 'warning',
      metric: 'Growth Rate',
      source1: 'PACE',
      source2: 'Financials',
      value1: '15% YoY',
      value2: '12% YoY',
      variance: 3,
      impact: 'Difference of 3% could affect valuation by ~$5M',
      suggestedFix: 'Review Q1 actuals and update growth trajectory',
    },
    {
      id: '3',
      severity: 'warning',
      metric: 'Burn Rate',
      source1: 'PACE',
      source2: 'Financials',
      value1: '$250K/month',
      value2: '$280K/month',
      variance: 12,
      impact: 'Higher burn rate impacts runway calculations',
      suggestedFix: 'Reconcile Q1 expense actuals and verify budget allocations',
    },
  ]

  const rules: AlertRule[] = [
    { metric: 'Revenue', max_variance_percent: 5, enabled: true },
    { metric: 'Growth %', max_variance_percent: 2, enabled: true },
    { metric: 'Headcount', max_variance_percent: 0, enabled: true },
    { metric: 'Burn Rate', max_variance_percent: 10, enabled: true },
    { metric: 'Runway', max_variance_percent: 5, enabled: true },
    { metric: 'Unit Economics', max_variance_percent: 8, enabled: true },
  ]

  const handleRefresh = useCallback(async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setRefreshCount(prev => prev + 1)

    // Update some metrics to simulate real reconciliation
    setMetrics(prev =>
      prev.map((metric, idx) => {
        if (idx === 1) { // Growth% metric
          return {
            ...metric,
            status: refreshCount % 2 === 0 ? 'needs_review' : 'aligned',
            variance_percent: refreshCount % 2 === 0 ? 3 : 1,
          }
        }
        return metric
      })
    )
  }, [refreshCount])

  const handleExportPDF = useCallback(async () => {
    // Simulate PDF export
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('Reconciliation report exported to PDF')
  }, [])

  return (
    <ReconciliationDashboard
      metrics={metrics}
      issues={issues}
      rules={rules}
      onRefresh={handleRefresh}
      onExportPDF={handleExportPDF}
      autoRefreshInterval={300000}
    />
  )
}
