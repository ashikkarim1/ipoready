/**
 * Cost Calculator Utilities
 * Helper functions for IPO cost management
 */

export interface CostItem {
  id: string
  name: string
  category: 'capex' | 'opex'
  subcategory: string
  amount: number
  timeline: 'pre-ipo' | 'pre-launch' | 'post-launch'
  notes: string
  createdAt?: Date
  updatedAt?: Date
}

export interface CostMetrics {
  capexTotal: number
  opexTotal: number
  grandTotal: number
  capexPercentage: string
  opexPercentage: string
  itemCount: number
  averageItem: number
  capexOpexRatio: string
}

/**
 * Calculate cost metrics from cost items
 */
export function calculateCostMetrics(costs: CostItem[]): CostMetrics {
  const capexTotal = costs
    .filter((c) => c.category === 'capex')
    .reduce((sum, c) => sum + c.amount, 0)
  const opexTotal = costs
    .filter((c) => c.category === 'opex')
    .reduce((sum, c) => sum + c.amount, 0)
  const grandTotal = capexTotal + opexTotal

  return {
    capexTotal,
    opexTotal,
    grandTotal,
    capexPercentage: grandTotal > 0 ? ((capexTotal / grandTotal) * 100).toFixed(1) : '0',
    opexPercentage: grandTotal > 0 ? ((opexTotal / grandTotal) * 100).toFixed(1) : '0',
    itemCount: costs.length,
    averageItem: costs.length > 0 ? grandTotal / costs.length : 0,
    capexOpexRatio: opexTotal > 0 ? (capexTotal / opexTotal).toFixed(2) : '0',
  }
}

/**
 * Generate CSV export from cost items
 */
export function generateCSVExport(costs: CostItem[]): string {
  const headers = ['Cost Item', 'Category', 'Subcategory', 'Amount', 'Timeline', 'Notes']
  const rows = costs.map((cost) => [
    cost.name,
    cost.category,
    cost.subcategory,
    cost.amount.toString(),
    cost.timeline,
    cost.notes || '',
  ])

  const metrics = calculateCostMetrics(costs)
  rows.push([], ['CAPEX Total', '', '', metrics.capexTotal.toString()])
  rows.push(['OPEX Total', '', '', metrics.opexTotal.toString()])
  rows.push(['GRAND TOTAL', '', '', metrics.grandTotal.toString()])

  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n')
}
