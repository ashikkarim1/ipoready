import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DocuSignIntegrationDashboard } from '@/components/DocuSignIntegrationDashboard'

export const metadata: Metadata = {
  title: 'DocuSign Integration',
  description: 'Manage document signing workflows, templates, and signature tracking',
}

export default async function DocuSignPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen py-12" style={{ background: '#F7F6F4' }}>
      <DocuSignIntegrationDashboard />
    </main>
  )
}
