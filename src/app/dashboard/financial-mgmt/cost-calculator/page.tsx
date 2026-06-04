import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { CostCalculatorForm } from '@/components/CostCalculatorForm'

export const metadata: Metadata = {
  title: 'IPO Cost Calculator',
  description: 'Calculate and estimate your IPO costs based on company metrics and complexity',
}

export default async function CostCalculatorPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen py-12" style={{ background: '#F7F6F4' }}>
      <CostCalculatorForm />
    </main>
  )
}
