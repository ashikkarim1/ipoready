'use client'

import { useSession } from 'next-auth/react'
import { PushPermissionPrompt } from './PushPermissionPrompt'

/**
 * AuthenticatedPushPrompt
 * Only shows the push notification prompt to authenticated users
 * Public/unauthenticated users won't see the notification request
 */
export function AuthenticatedPushPrompt() {
  const { data: session, status } = useSession()

  // Only show prompt if user is authenticated and session is fully loaded
  // Don't show during loading state or for unauthenticated users
  if (status !== 'authenticated' || !session?.user) {
    return null
  }

  return <PushPermissionPrompt showDelay={5000} minDismissals={2} />
}
