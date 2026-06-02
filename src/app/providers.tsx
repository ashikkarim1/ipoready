'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'
import { NotificationConsumer } from '@/components/NotificationConsumer'
import { AuthenticatedPushPrompt } from '@/components/AuthenticatedPushPrompt'
import { CookieConsent } from '@/components/CookieConsent'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <NotificationConsumer />
      <AuthenticatedPushPrompt />
      <CookieConsent />
      {children}
    </SessionProvider>
  )
}
