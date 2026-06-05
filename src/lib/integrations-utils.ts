/**
 * Utility functions for integrations
 */

import type { IntegrationType, IntegrationStatusItem } from '@/types/integrations'
import {
  DollarSign,
  Zap,
  FileText,
  MessageSquare,
  HardDrive,
  type LucideIcon,
} from 'lucide-react'

/**
 * Map integration types to display labels
 */
export function getIntegrationLabel(type: IntegrationType): string {
  const labels: Record<IntegrationType, string> = {
    quickbooks: 'QuickBooks',
    xero: 'Xero',
    docusign: 'DocuSign',
    slack: 'Slack',
    google_drive: 'Google Drive',
  }
  return labels[type] || type
}

/**
 * Map integration types to lucide icons
 */
export function getIntegrationIcon(type: IntegrationType): LucideIcon {
  const icons: Record<IntegrationType, LucideIcon> = {
    quickbooks: DollarSign,
    xero: DollarSign,
    docusign: FileText,
    slack: MessageSquare,
    google_drive: HardDrive,
  }
  return icons[type] || HardDrive
}

/**
 * Check if an integration provider is active/enabled
 * Only google_drive is currently active
 */
const ACTIVE_INTEGRATIONS: Record<IntegrationType, boolean> = {
  quickbooks: false, // TODO(OAuth): Enable after implementing OAuth flow
  xero: false, // TODO(OAuth): Enable after implementing OAuth flow
  docusign: false, // TODO(OAuth): Enable after implementing OAuth flow
  slack: false, // TODO(OAuth): Enable after implementing OAuth flow
  google_drive: true, // Already connected
}

export function isIntegrationActive(type: IntegrationType): boolean {
  return ACTIVE_INTEGRATIONS[type] ?? false
}

/**
 * Format last sync time as relative time
 */
export function formatLastSyncTime(timestamp?: Date | null): string {
  if (!timestamp) return 'Never'

  const now = new Date()
  const diff = now.getTime() - new Date(timestamp).getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return new Date(timestamp).toLocaleDateString()
}

/**
 * TODO(OAuth): Implement real AES-256-GCM token encryption
 * For now, this is a pass-through. Production must encrypt sensitive tokens.
 * Use environment variable: INTEGRATION_ENCRYPTION_KEY (32-byte hex string)
 */
export function encryptToken(token: string): string {
  // TODO: Implement AES-256-GCM encryption
  // const key = process.env.INTEGRATION_ENCRYPTION_KEY
  // if (!key) throw new Error('INTEGRATION_ENCRYPTION_KEY not set')
  // return aes256gcm.encrypt(token, key)
  return token
}

/**
 * TODO(OAuth): Implement real AES-256-GCM token decryption
 */
export function decryptToken(encryptedToken: string): string {
  // TODO: Implement AES-256-GCM decryption
  // const key = process.env.INTEGRATION_ENCRYPTION_KEY
  // if (!key) throw new Error('INTEGRATION_ENCRYPTION_KEY not set')
  // return aes256gcm.decrypt(encryptedToken, key)
  return encryptedToken
}

/**
 * Get human-readable description for each integration
 */
export function getIntegrationDescription(type: IntegrationType): string {
  const descriptions: Record<IntegrationType, string> = {
    quickbooks: 'Pull financial summary data to auto-populate MD&A metrics and board report KPIs.',
    xero: 'Alternative to QuickBooks for financial data sync.',
    docusign: 'Digital signing workflow for engagement letters, board resolutions, and prospectus sign-offs.',
    slack: 'Push PACE™ alerts, task reminders, and critical deadline notifications to your Slack workspace.',
    google_drive: 'Sync documents to your IPOReady workspace.',
  }
  return descriptions[type] || ''
}

/**
 * Get status badge color for integration
 */
export function getStatusColor(isConnected: boolean): string {
  return isConnected ? '#2D7A5F' : '#999999' // Green if connected, gray if not
}
