// Example: How to add Material Contracts Network to dashboard navigation
// Add this to the dashboard navigation menu/sidebar

import Link from 'next/link'
import { FileNetwork, AlertCircle } from 'lucide-react'

export function ContractsMapNavItem() {
  // In real implementation, fetch document status from API
  const requiredMissing = 2 // Example
  const submitted = 3
  const total = 7

  const completionPercent = Math.round((submitted / total) * 100)

  return (
    <Link
      href="/dashboard/documents/contracts-map"
      className="group relative px-4 py-3 rounded-lg hover:bg-blue-50 transition flex items-center gap-3 text-gray-700 hover:text-blue-600"
    >
      {/* Icon with badge */}
      <div className="relative">
        <FileNetwork className="w-5 h-5" />
        {requiredMissing > 0 && (
          <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {requiredMissing}
          </span>
        )}
      </div>

      {/* Label and progress */}
      <div className="flex-1">
        <p className="font-medium text-sm">Contracts Network</p>
        <div className="mt-1 flex items-center gap-2">
          <div className="h-1.5 flex-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <span className="text-xs text-gray-600 whitespace-nowrap">
            {completionPercent}%
          </span>
        </div>
      </div>

      {/* Alert indicator if missing required */}
      {requiredMissing > 0 && (
        <div className="flex-shrink-0">
          <AlertCircle className="w-4 h-4 text-red-500 animate-pulse" />
        </div>
      )}
    </Link>
  )
}

// Example dashboard sidebar integration:
export function DashboardSidebar() {
  return (
    <nav className="space-y-1 px-3 py-4">
      {/* ... other nav items ... */}

      {/* Section: Documents & Compliance */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Documents
        </p>
        <div className="mt-3 space-y-1">
          <ContractsMapNavItem />

          {/* Other document links */}
          <Link
            href="/dashboard/documents/prospectus"
            className="px-4 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
          >
            Prospectus Builder
          </Link>

          <Link
            href="/dashboard/documents/checklist"
            className="px-4 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
          >
            Filing Checklist
          </Link>
        </div>
      </div>

      {/* ... rest of sidebar ... */}
    </nav>
  )
}

// Dashboard header breadcrumb example:
export function DashboardBreadcrumb() {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <Link href="/dashboard" className="hover:text-gray-900">
        Dashboard
      </Link>
      <span>/</span>
      <Link href="/dashboard/documents" className="hover:text-gray-900">
        Documents
      </Link>
      <span>/</span>
      <span className="text-gray-900 font-medium">Contracts Network</span>
    </div>
  )
}

// Quick stats card for dashboard homepage
export function ContractsStatusCard() {
  const requiredMissing = 2
  const recommended = 2
  const submitted = 3

  return (
    <Link href="/dashboard/documents/contracts-map">
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition cursor-pointer">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Material Contracts
          </h3>
          <FileNetwork className="w-6 h-6 text-blue-600" />
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Prospectus document relationships and readiness
        </p>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {requiredMissing}
            </div>
            <div className="text-xs text-gray-600">Required Missing</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">
              {recommended}
            </div>
            <div className="text-xs text-gray-600">Recommended</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {submitted}
            </div>
            <div className="text-xs text-gray-600">Submitted</div>
          </div>
        </div>

        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-green-500" />
        </div>

        <p className="mt-3 text-sm text-gray-600">
          {requiredMissing > 0 && (
            <>
              <AlertCircle className="w-4 h-4 inline mr-1 text-red-600" />
              Action required: {requiredMissing} documents missing
            </>
          )}
          {requiredMissing === 0 && '✓ All required documents submitted'}
        </p>
      </div>
    </Link>
  )
}
