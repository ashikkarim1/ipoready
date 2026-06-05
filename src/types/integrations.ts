/**
 * Integration types and interfaces for third-party OAuth providers
 */

export type IntegrationType = 'quickbooks' | 'xero' | 'docusign' | 'slack' | 'google_drive'
export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'syncing'
export type IntegrationAuditAction = 'connected' | 'disconnected' | 'sync_started' | 'sync_completed' | 'sync_failed' | 'refreshed_token'
export type IntegrationAuditStatus = 'success' | 'error'

export const INTEGRATION_TYPES: IntegrationType[] = [
  'quickbooks',
  'xero',
  'docusign',
  'slack',
  'google_drive',
]

export interface IntegrationCredential {
  id: string
  companyId: string
  integrationType: IntegrationType
  providerAccountId: string
  accessToken: string
  refreshToken?: string
  tokenExpiresAt?: Date
  connectedAt: Date
  lastSyncedAt?: Date
  isActive: boolean
  metadata?: Record<string, any>
}

export interface IntegrationAuditLog {
  id: string
  credentialId: string
  action: IntegrationAuditAction
  status: IntegrationAuditStatus
  errorMessage?: string
  syncedRecordsCount?: number
  createdAt: Date
}

export interface OAuthCallbackRequest {
  code?: string
  state?: string
  error?: string
  errorDescription?: string
}

export interface IntegrationStatusItem {
  integrationType: IntegrationType
  isConnected: boolean
  providerAccountId?: string
  connectedAt?: Date
  lastSyncedAt?: Date
  status: IntegrationStatus
}

export interface IntegrationStatusResponse {
  integrations: IntegrationStatusItem[]
}

export interface DisconnectIntegrationRequest {
  integrationType: IntegrationType
}

export interface SyncIntegrationRequest {
  integrationType: IntegrationType
}

export interface SyncIntegrationResponse {
  success: boolean
  message: string
  syncedRecordsCount?: number
}
