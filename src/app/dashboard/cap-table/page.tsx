'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CapTablePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard/cap-table/dilution-scenarios')
  }, [router])

  return null
}
