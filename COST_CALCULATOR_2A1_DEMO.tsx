/**
 * IPOReady Cost Calculator 2A.1 - Demo & Integration Guide
 * 
 * This file demonstrates how to integrate the CostCalculator2A1 component
 * into various parts of the IPOReady application.
 */

// ═══════════════════════════════════════════════════════════════════════
// EXAMPLE 1: Basic Page Integration
// ═══════════════════════════════════════════════════════════════════════

import { CostCalculator2A1 } from '@/components/CostCalculator2A1'

export function CostCalculatorPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <CostCalculator2A1 />
      </div>
    </main>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// EXAMPLE 2: Dashboard Widget Integration
// ═══════════════════════════════════════════════════════════════════════

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export function DashboardWithCostCalculator() {
  const [expandCostCalc, setExpandCostCalc] = useState(false)

  return (
    <div className="space-y-6 p-6">
      {/* Other dashboard widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Existing KPI cards */}
      </div>

      {/* Cost Calculator Widget */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setExpandCostCalc(!expandCostCalc)}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            IPO Cost Calculator
          </h2>
          {expandCostCalc ? (
            <ChevronUp className="h-5 w-5 text-slate-600" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-600" />
          )}
        </button>

        {expandCostCalc && (
          <div className="border-t border-slate-200 dark:border-slate-700 p-6">
            <CostCalculator2A1 />
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// EXAMPLE 3: Tab Navigation Integration
// ═══════════════════════════════════════════════════════════════════════

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function WorkflowTabs() {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="costs">Cost Calculator</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        {/* Overview content */}
      </TabsContent>

      <TabsContent value="costs" className="space-y-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6">
          <CostCalculator2A1 />
        </div>
      </TabsContent>

      <TabsContent value="timeline" className="space-y-4">
        {/* Timeline content */}
      </TabsContent>

      <TabsContent value="documents" className="space-y-4">
        {/* Documents content */}
      </TabsContent>
    </Tabs>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// EXAMPLE 4: Modal/Dialog Integration
// ═══════════════════════════════════════════════════════════════════════

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function CostCalculatorModal() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Open Cost Calculator
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>IPO Cost Calculator</DialogTitle>
            <DialogDescription>
              Track and manage your IPO costs across CAPEX and OPEX
            </DialogDescription>
          </DialogHeader>
          <CostCalculator2A1 />
        </DialogContent>
      </Dialog>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// EXAMPLE 5: Sidebar Navigation Integration
// ═══════════════════════════════════════════════════════════════════════

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function SidebarWithCostCalc() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-4">
        <nav className="space-y-2">
          <Link
            href="/dashboard"
            className={`block px-4 py-2 rounded ${
              pathname === '/dashboard'
                ? 'bg-blue-600'
                : 'hover:bg-slate-800'
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/cost-calculator"
            className={`block px-4 py-2 rounded ${
              pathname === '/cost-calculator'
                ? 'bg-blue-600'
                : 'hover:bg-slate-800'
            }`}
          >
            Cost Calculator
          </Link>
          <Link
            href="/timeline"
            className={`block px-4 py-2 rounded ${
              pathname === '/timeline'
                ? 'bg-blue-600'
                : 'hover:bg-slate-800'
            }`}
          >
            Timeline
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {pathname === '/cost-calculator' && <CostCalculator2A1 />}
      </main>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// EXAMPLE 6: Context Provider Pattern (for shared state)
// ═══════════════════════════════════════════════════════════════════════

import { createContext, useContext, ReactNode } from 'react'

interface CostContextType {
  totalCosts: number
  itemCount: number
  lastUpdated: Date
}

const CostContext = createContext<CostContextType | null>(null)

export function CostProvider({ children }: { children: ReactNode }) {
  // In a real app, this would come from an API
  const contextValue: CostContextType = {
    totalCosts: 30600000, // $30.6M from sample data
    itemCount: 20,
    lastUpdated: new Date(),
  }

  return (
    <CostContext.Provider value={contextValue}>
      {children}
    </CostContext.Provider>
  )
}

export function useCosts() {
  const context = useContext(CostContext)
  if (!context) {
    throw new Error('useCosts must be used within CostProvider')
  }
  return context
}

// Usage in component
export function CostSummaryWidget() {
  const { totalCosts, itemCount, lastUpdated } = useCosts()

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold mb-4">Cost Summary</h3>
      <div className="space-y-2">
        <p className="text-gray-600 dark:text-gray-400">
          Total Costs: <strong>${(totalCosts / 1000000).toFixed(1)}M</strong>
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          Line Items: <strong>{itemCount}</strong>
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Updated: {lastUpdated.toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// EXAMPLE 7: API Integration Pattern
// ═══════════════════════════════════════════════════════════════════════

// Simulated API calls for saving/loading costs
export async function saveCosts(costs: any[]) {
  try {
    const response = await fetch('/api/costs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ costs }),
    })
    return await response.json()
  } catch (error) {
    console.error('Failed to save costs:', error)
    throw error
  }
}

export async function loadCosts() {
  try {
    const response = await fetch('/api/costs')
    return await response.json()
  } catch (error) {
    console.error('Failed to load costs:', error)
    throw error
  }
}

// Integration with component using useEffect hook
export function CostCalculatorWithAPI() {
  const [costs, setCosts] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Load costs on mount
  useEffect(() => {
    const loadCostsOnMount = async () => {
      setIsLoading(true)
      try {
        const loadedCosts = await loadCosts()
        setCosts(loadedCosts)
      } catch (error) {
        console.error('Error loading costs:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCostsOnMount()
  }, [])

  // Save costs on change
  const handleSave = async () => {
    try {
      await saveCosts(costs)
      // Show success message
    } catch (error) {
      // Show error message
    }
  }

  if (isLoading) {
    return <div>Loading costs...</div>
  }

  return (
    <div>
      <CostCalculator2A1 />
      <button
        onClick={handleSave}
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg"
      >
        Save Changes
      </button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// EXAMPLE 8: Full Page App Route
// ═══════════════════════════════════════════════════════════════════════

// File: src/app/cost-calculator/page.tsx
'use client'

import { CostCalculator2A1 } from '@/components/CostCalculator2A1'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

export default function CostCalculatorPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto py-12 px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            IPO Cost Calculator
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage and track your IPO preparation costs
          </p>
        </div>

        <CostCalculator2A1 />

        {/* Help section */}
        <div className="mt-12 bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold mb-4">How to Use</h2>
          <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
            <li>Add cost items by clicking "Add New" and filling in the form</li>
            <li>Categorize costs as CAPEX or OPEX</li>
            <li>Assign costs to timeline phases (Pre-IPO, Pre-Launch, Post-Launch)</li>
            <li>View visualizations and breakdowns automatically</li>
            <li>Export your costs as CSV for further analysis</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// EXAMPLE 9: Customized Component Wrapper
// ═══════════════════════════════════════════════════════════════════════

export function CustomCostCalculator({
  title = 'IPO Cost Calculator',
  subtitle = 'Track your IPO expenses',
  showExport = true,
  showForm = true,
}: {
  title?: string
  subtitle?: string
  showExport?: boolean
  showForm?: boolean
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {title}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">{subtitle}</p>
      </div>

      <CostCalculator2A1 />

      <div className="grid grid-cols-2 gap-4">
        {showExport && (
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Download Report
          </button>
        )}
        {showForm && (
          <button className="px-6 py-3 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600">
            Request Adjustment
          </button>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// DEPLOYMENT CHECKLIST
// ═══════════════════════════════════════════════════════════════════════

/*
Integration Checklist:

[ ] 1. Copy CostCalculator2A1.tsx to src/components/
[ ] 2. Copy CostCalculator2A1.css to src/components/
[ ] 3. Import component where needed
[ ] 4. Test responsive design on mobile/tablet
[ ] 5. Test dark mode functionality
[ ] 6. Test CSV export
[ ] 7. Add cost items and verify calculations
[ ] 8. Delete items and verify totals update
[ ] 9. Check accessibility with screen reader
[ ] 10. Test in different browsers
[ ] 11. Verify animations and transitions
[ ] 12. Run Lighthouse audit
[ ] 13. Set up backend API routes (if needed)
[ ] 14. Test API integration
[ ] 15. Deploy to staging
[ ] 16. QA testing
[ ] 17. Deploy to production

API Routes to Create (if using backend):
- POST /api/costs - Save costs
- GET /api/costs - Load costs
- DELETE /api/costs/:id - Delete cost item
- PATCH /api/costs/:id - Update cost item

Next Steps:
1. Integrate with existing dashboard pages
2. Add database persistence
3. Create audit trail for cost changes
4. Add approvals workflow
5. Create cost forecasting model
6. Build comparative analysis views
*/
