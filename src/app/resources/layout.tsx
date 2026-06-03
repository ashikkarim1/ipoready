'use client'

import { useSession } from 'next-auth/react'
import { AppShell } from '@/components/layout/AppShell'

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()

  // Authenticated users: render with AppShell + sidebar
  if (session?.user) {
    return <AppShell>{children}</AppShell>
  }

  // Unauthenticated users: render as public page (minimal layout)
  return <>{children}</>
}
