'use client'
import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'
import { PushPermissionPrompt } from '@/components/PushPermissionPrompt'
import { NotificationConsumer } from '@/components/NotificationConsumer'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <NotificationConsumer />
      <PushPermissionPrompt showDelay={5000} minDismissals={2} />
      {children}
    </SessionProvider>
  )
}
