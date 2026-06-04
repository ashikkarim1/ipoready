import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { TrueCostDashboard } from '@/components/TrueCostDashboard'

export const metadata: Metadata = {
  title: 'True Cost of Going Public',
  description: 'Financial dashboard showing ongoing costs of being a public company after listing',
}

export default async function TrueCostPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen py-8 px-4 md:px-8" style={{ background: '#F7F6F4' }}>
      <TrueCostDashboard />
    </main>
  )
}
