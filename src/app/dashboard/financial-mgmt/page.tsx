'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function FinancialMgmtPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to cost-calculator by default
    router.replace('/financial/cost-calculator')
  }, [router])

  return null
}
