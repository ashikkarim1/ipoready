import { ReactNode } from 'react'
import { AppShell } from '@/components/layout/AppShell'

export const metadata = {
  title: 'Learning & Compliance | IPOReady',
  description: 'Guided frameworks for IPO preparation and compliance',
}

export default function LearningComplianceLayout({
  children,
}: {
  children: ReactNode
}) {
  return <AppShell>{children}</AppShell>
}
