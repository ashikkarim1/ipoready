import { AppShell } from '@/components/layout/AppShell'

// Auth enforced at the Edge via middleware.ts — no server round-trip needed here.
export default function RaisingCapitalLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}
