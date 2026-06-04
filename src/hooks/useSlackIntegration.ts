'use client'

import { useState, useCallback, useEffect } from 'react'

interface SlackWorkspaceInfo {
  team_id: string
  team_name: string
  user_id: string
  connected_at?: string
}

interface UseSlackIntegrationResult {
  workspace: SlackWorkspaceInfo | null
  loading: boolean
  error: string | null
  isConnected: boolean
  initiateOAuth: () => Promise<void>
  handleCallback: (code: string) => Promise<void>
  disconnect: () => Promise<void>
  fetchWorkspaceInfo: () => Promise<void>
}

/**
 * Hook for managing Slack OAuth and integration state
 */
export function useSlackIntegration(): UseSlackIntegrationResult {
  const [workspace, setWorkspace] = useState<SlackWorkspaceInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch existing workspace info on mount
  useEffect(() => {
    fetchWorkspaceInfo()
  }, [])

  const fetchWorkspaceInfo = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/integrations', {
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Failed to fetch integration info')

      const data = await response.json()
      const slackIntegration = data.integrations?.find(
        (i: any) => i.integrationId === 'slack'
      )

      if (slackIntegration?.status === 'connected' && slackIntegration?.metadata) {
        setWorkspace(slackIntegration.metadata)
      } else {
        setWorkspace(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workspace info')
      setWorkspace(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const initiateOAuth = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/integrations/slack', {
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to initiate OAuth')
      }

      const data = await response.json()
      if (data.authUrl) {
        // Store state in session storage for callback validation
        sessionStorage.setItem('slack_oauth_state', data.state)

        // Open OAuth flow in new window or redirect
        const width = 500
        const height = 600
        const left = window.screenX + (window.outerWidth - width) / 2
        const top = window.screenY + (window.outerHeight - height) / 2

        window.open(
          data.authUrl,
          'slack_oauth',
          `width=${width},height=${height},left=${left},top=${top}`
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate OAuth')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleCallback = useCallback(async (code: string) => {
    try {
      setLoading(true)
      setError(null)

      // Verify state parameter
      const savedState = sessionStorage.getItem('slack_oauth_state')
      // In a real implementation, state would be passed from callback
      // This is simplified for example

      const response = await fetch('/api/integrations/slack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to complete OAuth')
      }

      const data = await response.json()

      // Clear stored state
      sessionStorage.removeItem('slack_oauth_state')

      // Update workspace info
      if (data.workspace) {
        setWorkspace({
          team_id: data.workspace.id,
          team_name: data.workspace.name,
          user_id: '',
          connected_at: new Date().toISOString(),
        })
      }

      // Refresh integration info from server
      await fetchWorkspaceInfo()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete OAuth')
    } finally {
      setLoading(false)
    }
  }, [fetchWorkspaceInfo])

  const disconnect = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/integrations/slack', {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to disconnect')
      }

      setWorkspace(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect')
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    workspace,
    loading,
    error,
    isConnected: workspace !== null,
    initiateOAuth,
    handleCallback,
    disconnect,
    fetchWorkspaceInfo,
  }
}
