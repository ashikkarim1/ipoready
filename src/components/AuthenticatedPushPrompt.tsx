'use client'

import { useSession } from 'next-auth/react'
import { PushPermissionPrompt } from './PushPermissionPrompt'

/**
 * AuthenticatedPushPrompt
 * Only shows the push notification prompt to authenticated users
 * Public/unauthenticated users won't see the notification request
 */
export function AuthenticatedPushPrompt() {
  const { data: session } = useSession()

  // Only show prompt if user is authenticated
  if (!session?.user) {
    return null
  }

  return <PushPermissionPrompt showDelay={5000} minDismissals={2} />
}
