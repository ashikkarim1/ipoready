import { ReactNode } from 'react'

export const metadata = {
  title: 'Learning & Compliance | IPOReady',
  description: 'Guided frameworks for IPO preparation and compliance',
}

export default function LearningComplianceLayout({
  children,
}: {
  children: ReactNode
}) {
  return <>{children}</>
}
