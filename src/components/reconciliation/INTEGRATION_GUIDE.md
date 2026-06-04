# Reconciliation Engine Integration Guide

Complete guide for integrating the Reconciliation Engine into IPOReady dashboard pages.

## Quick Start

### 1. Install/Verify Dependencies

The component requires these packages (already in package.json):
- `react` ^18.3.1
- `framer-motion` ^12.40.0
- `recharts` ^3.8.1
- `lucide-react` ^1.16.0
- `tailwindcss` ^4.3.0

### 2. Import the Component

```tsx
import { ReconciliationDashboard } from '@/components/reconciliation'
```

### 3. Create a Page

```tsx
// app/dashboard/reconciliation/page.tsx
'use client'

import { useState } from 'react'
import { ReconciliationDashboard } from '@/components/reconciliation'
import type { MetricAlignment, ReconciliationIssue, AlertRule } from '@/components/reconciliation'

export default function ReconciliationPage() {
  const [metrics, setMetrics] = useState<MetricAlignment[]>([])
  const [issues, setIssues] = useState<ReconciliationIssue[]>([])
  const [rules, setRules] = useState<AlertRule[]>([])

  const handleRefresh = async () => {
    const response = await fetch('/api/reconciliation/check')
    const data = await response.json()
    setMetrics(data.metrics)
    setIssues(data.issues)
  }

  const handleExportPDF = async () => {
    const response = await fetch('/api/reconciliation/export-pdf', {
      method: 'POST',
      body: JSON.stringify({ metrics, issues }),
    })
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'reconciliation-report.pdf'
    a.click()
  }

  return (
    <ReconciliationDashboard
      metrics={metrics}
      issues={issues}
      rules={rules}
      onRefresh={handleRefresh}
      onExportPDF={handleExportPDF}
    />
  )
}
```

## Backend API Implementation

### API Endpoint: GET /api/reconciliation/check

Performs reconciliation check and returns current alignment status.

**Request:**
```
GET /api/reconciliation/check?companyId=abc123
```

**Response:**
```json
{
  "success": true,
  "session": {
    "id": "rec_123",
    "companyId": "abc123",
    "createdAt": "2024-01-15T10:30:00Z",
    "status": "completed"
  },
  "metrics": [
    {
      "metricId": "1",
      "metric": "Revenue",
      "pace_value": "$45.2M",
      "financial_value": "$45.1M",
      "prospectus_value": "$45M+",
      "cap_table_value": "N/A",
      "status": "aligned",
      "variance_percent": 0.22,
      "isExplained": false
    }
    // ... more metrics
  ],
  "issues": [
    // ... issues array
  ],
  "stats": {
    "aligned": 5,
    "needsReview": 2,
    "critical": 1,
    "totalMetrics": 8,
    "overallHealth": 62,
    "trending": "stable"
  },
  "checkedAt": "2024-01-15T10:30:00Z",
  "nextCheckScheduled": "2024-01-15T10:35:00Z"
}
```

**Implementation Example (Node.js/Express):**

```typescript
// api/reconciliation/check.ts
import { Router, Request, Response } from 'express'

export const router = Router()

router.get('/check', async (req: Request, res: Response) => {
  const { companyId } = req.query

  try {
    // 1. Fetch data from each source
    const paceData = await fetchFromPACE(companyId as string)
    const financialData = await fetchFromFinancials(companyId as string)
    const prospectusData = await fetchFromProspectus(companyId as string)
    const capTableData = await fetchFromCapTable(companyId as string)

    // 2. Compare metrics
    const metrics = compareMetrics({
      pace: paceData,
      financials: financialData,
      prospectus: prospectusData,
      capTable: capTableData,
    })

    // 3. Identify issues
    const issues = identifyIssues(metrics)

    // 4. Save session
    const session = await db.reconciliationSession.create({
      companyId: companyId as string,
      metrics,
      issues,
      status: 'completed',
    })

    return res.json({
      success: true,
      session,
      metrics,
      issues,
      stats: calculateStats(metrics),
      checkedAt: new Date(),
      nextCheckScheduled: new Date(Date.now() + 5 * 60 * 1000),
    })
  } catch (error) {
    console.error('Reconciliation check failed:', error)
    return res.status(500).json({ success: false, error: error.message })
  }
})
```

### API Endpoint: POST /api/reconciliation/explain

Saves explanation for intentional variance.

**Request:**
```json
{
  "sessionId": "rec_123",
  "metric": "Revenue",
  "explanation": "Growth rate reflects conservative Q1 actuals"
}
```

**Response:**
```json
{
  "success": true,
  "metric": "Revenue",
  "explanation": "Growth rate reflects conservative Q1 actuals",
  "status": "needs_review",
  "updatedAt": "2024-01-15T10:35:00Z"
}
```

### API Endpoint: POST /api/reconciliation/resolve

Marks a metric as resolved/explained.

**Request:**
```json
{
  "sessionId": "rec_123",
  "metric": "Growth%",
  "explanation": "Intentional difference due to Q1 restatement"
}
```

**Response:**
```json
{
  "success": true,
  "metric": "Growth%",
  "status": "resolved",
  "updatedAt": "2024-01-15T10:36:00Z",
  "changeLog": {
    "id": "log_123",
    "sessionId": "rec_123",
    "timestamp": "2024-01-15T10:36:00Z",
    "userId": "user_123",
    "userName": "John Doe",
    "userRole": "CFO",
    "action": "resolved",
    "metric": "Growth%"
  }
}
```

### API Endpoint: POST /api/reconciliation/export-pdf

Generates and returns PDF export of reconciliation report.

**Request:**
```json
{
  "sessionId": "rec_123",
  "includeDetails": true,
  "includeHistory": true
}
```

**Response:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="reconciliation-report-2024-01-15.pdf"

[Binary PDF data]
```

## Database Schema

### reconciliation_sessions

```sql
CREATE TABLE reconciliation_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id),
  status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, failed
  metrics JSONB NOT NULL,
  issues JSONB NOT NULL,
  rules JSONB,
  notes TEXT,
  checked_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  next_check_scheduled TIMESTAMP
);
```

### reconciliation_issues

```sql
CREATE TABLE reconciliation_issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES reconciliation_sessions(id),
  metric VARCHAR(100) NOT NULL,
  severity VARCHAR(20), -- critical, warning, info
  source1 VARCHAR(50),
  source2 VARCHAR(50),
  value1 TEXT,
  value2 TEXT,
  variance_percent DECIMAL(10, 2),
  impact TEXT,
  suggested_fix TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP,
  resolved_by UUID REFERENCES users(id)
);
```

### reconciliation_explanations

```sql
CREATE TABLE reconciliation_explanations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES reconciliation_sessions(id),
  metric VARCHAR(100) NOT NULL,
  explanation TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_approved BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP
);
```

### reconciliation_change_log

```sql
CREATE TABLE reconciliation_change_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES reconciliation_sessions(id),
  metric VARCHAR(100) NOT NULL,
  action VARCHAR(50), -- updated, explained, resolved, reopened
  user_id UUID NOT NULL REFERENCES users(id),
  user_name VARCHAR(255),
  user_role VARCHAR(50),
  previous_value TEXT,
  new_value TEXT,
  explanation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Comparison Logic Implementation

```typescript
// lib/reconciliation-engine.ts

interface DataPoint {
  source: string
  value: string | number | null
  timestamp: Date
  confidence: number
}

export class ReconciliationEngine {
  /**
   * Compare metric values across sources
   */
  static compareMetrics(sources: Record<string, any>) {
    const metrics = [
      'Revenue',
      'Growth%',
      'Margins',
      'Headcount',
      'Runway',
      'Burn Rate',
      'Unit Economics',
      'Customer Count',
    ]

    return metrics.map(metric => {
      const values = {
        pace: sources.pace[metric],
        financials: sources.financials[metric],
        prospectus: sources.prospectus[metric],
        capTable: sources.capTable[metric],
      }

      const variance = this.calculateVariance(values)
      const status = this.determineStatus(variance, metric)

      return {
        metric,
        pace_value: values.pace,
        financial_value: values.financials,
        prospectus_value: values.prospectus,
        cap_table_value: values.capTable,
        variance_percent: variance,
        status,
      }
    })
  }

  /**
   * Calculate variance percentage between values
   */
  static calculateVariance(values: Record<string, any>): number {
    const validValues = Object.values(values)
      .filter(v => v !== null && v !== 'N/A')
      .map(v => this.parseNumericValue(v))
      .filter(v => !isNaN(v))

    if (validValues.length < 2) return 0

    const min = Math.min(...validValues)
    const max = Math.max(...validValues)
    const avg = validValues.reduce((a, b) => a + b) / validValues.length

    return ((max - min) / avg) * 100
  }

  /**
   * Parse numeric value from string/number
   */
  static parseNumericValue(value: string | number): number {
    if (typeof value === 'number') return value

    // Handle $X.XM, $X.XK, etc.
    const match = value.match(/([\d.]+)([MK])?/)
    if (!match) return NaN

    const num = parseFloat(match[1])
    const unit = match[2]

    if (unit === 'M') return num * 1_000_000
    if (unit === 'K') return num * 1_000
    return num
  }

  /**
   * Determine status based on variance
   */
  static determineStatus(variance: number, metric: string): 'aligned' | 'needs_review' | 'critical' {
    const thresholds: Record<string, { warning: number; critical: number }> = {
      Revenue: { warning: 5, critical: 10 },
      'Growth%': { warning: 2, critical: 5 },
      Headcount: { warning: 0, critical: 0 },
      'Burn Rate': { warning: 10, critical: 20 },
      Runway: { warning: 5, critical: 15 },
      'Unit Economics': { warning: 8, critical: 15 },
      Margins: { warning: 3, critical: 8 },
      'Customer Count': { warning: 2, critical: 5 },
    }

    const threshold = thresholds[metric] || { warning: 5, critical: 10 }

    if (variance <= threshold.warning) return 'aligned'
    if (variance <= threshold.critical) return 'needs_review'
    return 'critical'
  }
}
```

## Real-time Updates with WebSockets

```typescript
// For live reconciliation status updates
import { WebSocket } from 'ws'

export function setupReconciliationSocket(companyId: string) {
  const ws = new WebSocket(`wss://api.ipoready.com/reconciliation/${companyId}`)

  ws.onmessage = (event) => {
    const { type, data } = JSON.parse(event.data)

    if (type === 'metric_updated') {
      // Handle metric update
      updateMetric(data)
    } else if (type === 'issue_detected') {
      // Handle new issue
      addIssue(data)
    } else if (type === 'check_completed') {
      // Handle full check completion
      loadFullReconciliation()
    }
  }

  return ws
}
```

## Testing

### Unit Tests

```typescript
// __tests__/reconciliation-engine.test.ts
import { ReconciliationEngine } from '@/lib/reconciliation-engine'

describe('ReconciliationEngine', () => {
  test('calculates variance correctly', () => {
    const variance = ReconciliationEngine.calculateVariance({
      pace: 100,
      financials: 95,
      prospectus: 100,
      capTable: null,
    })
    expect(variance).toBeCloseTo(5.26, 1)
  })

  test('determines status based on variance', () => {
    expect(
      ReconciliationEngine.determineStatus(2, 'Revenue')
    ).toBe('aligned')
    expect(
      ReconciliationEngine.determineStatus(7, 'Revenue')
    ).toBe('needs_review')
    expect(
      ReconciliationEngine.determineStatus(15, 'Revenue')
    ).toBe('critical')
  })
})
```

### Component Tests

```typescript
// __tests__/reconciliation-dashboard.test.tsx
import { render, screen } from '@testing-library/react'
import { ReconciliationDashboard } from '@/components/reconciliation'

describe('ReconciliationDashboard', () => {
  test('renders with metrics', () => {
    render(
      <ReconciliationDashboard
        metrics={[
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
          },
        ]}
        issues={[]}
        rules={[]}
      />
    )

    expect(screen.getByText('RECONCILIATION CHECK')).toBeInTheDocument()
    expect(screen.getByText('Revenue')).toBeInTheDocument()
  })
})
```

## Troubleshooting

### "Cannot find module '@/components/reconciliation'"
- Ensure the reconciliation directory and files exist
- Check tsconfig.json paths configuration

### Chart not rendering
- Verify Recharts is installed: `npm list recharts`
- Check data prop structure matches expected format

### Modal not closing
- Verify onClose callback is passed correctly
- Check z-index of modal (default: z-50)

### Dark mode not working
- Ensure Tailwind dark mode is enabled in config
- Check for conflicting `dark:` classes

## Performance Optimization

1. **Memoization**: Wrap metric comparisons in `useMemo`
2. **Virtualization**: For large metric lists (>100), consider virtual scrolling
3. **Debouncing**: Debounce cell clicks to 250ms
4. **Lazy Loading**: Load change log on demand

## Security Considerations

1. **Data Sanitization**: Sanitize explanation text before saving
2. **RBAC**: Check user permissions before allowing updates
3. **Audit Logging**: Log all changes to reconciliation metrics
4. **API Rate Limiting**: Limit refresh endpoint to 10 req/min per user

## License

Part of IPOReady. Internal use only.
