'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'

export function FeaturesMegaMenu() {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-nav hover:bg-gray-100 transition-colors"
      >
        Features
        <ChevronDown className="w-4 h-4" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-3 z-50"
          onMouseLeave={() => setOpen(false)}
        >
          <Link href="/#features" className="block px-4 py-2.5 hover:bg-gray-50 text-sm text-nav font-medium">
            All Features
          </Link>
          <Link href="/cap-table" className="block px-4 py-2.5 hover:bg-gray-50 text-sm text-nav">
            Cap Table
          </Link>
          <Link href="/checklist" className="block px-4 py-2.5 hover:bg-gray-50 text-sm text-nav">
            IPO Checklist
          </Link>
          <Link href="/documents" className="block px-4 py-2.5 hover:bg-gray-50 text-sm text-nav">
            Document Workspace
          </Link>
          <Link href="/marketplace" className="block px-4 py-2.5 hover:bg-gray-50 text-sm text-nav">
            Expert Network
          </Link>
          <div className="border-t border-gray-200 my-2" />
          <Link href="/pricing" className="block px-4 py-2.5 hover:bg-gray-50 text-sm text-nav">
            Pricing
          </Link>
        </div>
      )}
    </div>
  )
}
