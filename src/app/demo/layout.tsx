import { AppShell } from '@/components/layout/AppShell'

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}
