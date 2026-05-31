/**
 * Cross-Tab Notification Sync using BroadcastChannel API
 * Synchronizes notifications and notification counts across browser tabs
 */

export interface BroadcastNotification {
  id: string
  title: string
  body: string
  icon?: string
  url?: string
  timestamp: number
}

export interface BroadcastMessage {
  type: 'notification' | 'badge-update' | 'sync-request' | 'sync-response'
  data: any
  timestamp: number
}

type MessageHandler = (message: BroadcastMessage) => void

export class NotificationBroadcaster {
  private channel: BroadcastChannel | null = null
  private handlers: Set<MessageHandler> = new Set()
  private notificationCount: number = 0
  private isInitialized: boolean = false

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('ipoready-notifications')
        this.setupListeners()
        this.isInitialized = true
      } catch (error) {
        console.warn('BroadcastChannel is not available:', error)
      }
    }
  }

  private setupListeners(): void {
    if (!this.channel) return

    this.channel.addEventListener('message', (event: MessageEvent<BroadcastMessage>) => {
      const message = event.data
      this.handleMessage(message)

      // Notify all registered handlers
      this.handlers.forEach((handler) => {
        try {
          handler(message)
        } catch (error) {
          console.error('Error in broadcast message handler:', error)
        }
      })
    })
  }

  private handleMessage(message: BroadcastMessage): void {
    switch (message.type) {
      case 'notification':
        this.updateBadge(message.data?.count || 1)
        break
      case 'badge-update':
        this.updateBadge(message.data?.count || 0)
        break
      case 'sync-request':
        this.respondToSyncRequest()
        break
      case 'sync-response':
        this.updateBadge(message.data?.count || 0)
        break
    }
  }

  /**
   * Broadcast a new notification to all tabs
   */
  public broadcastNotification(notification: BroadcastNotification): void {
    if (!this.channel) return

    const message: BroadcastMessage = {
      type: 'notification',
      data: notification,
      timestamp: Date.now(),
    }

    this.channel.postMessage(message)
  }

  /**
   * Update badge count across all tabs
   */
  public updateBadgeCount(count: number): void {
    this.notificationCount = count

    if (!this.channel) {
      this.updateBadge(count)
      return
    }

    const message: BroadcastMessage = {
      type: 'badge-update',
      data: { count },
      timestamp: Date.now(),
    }

    this.channel.postMessage(message)
    this.updateBadge(count)
  }

  /**
   * Request sync from other tabs
   */
  public requestSync(): void {
    if (!this.channel) return

    const message: BroadcastMessage = {
      type: 'sync-request',
      data: {},
      timestamp: Date.now(),
    }

    this.channel.postMessage(message)
  }

  /**
   * Respond to sync request from another tab
   */
  private respondToSyncRequest(): void {
    if (!this.channel) return

    const message: BroadcastMessage = {
      type: 'sync-response',
      data: { count: this.notificationCount },
      timestamp: Date.now(),
    }

    this.channel.postMessage(message)
  }

  /**
   * Update browser notification badge
   */
  private updateBadge(count: number): void {
    if (typeof window !== 'undefined' && 'setAppBadge' in navigator) {
      const nav = navigator as any
      if (count > 0) {
        nav.setAppBadge(count)
      } else {
        nav.clearAppBadge?.()
      }
    }
  }

  /**
   * Register a message handler
   */
  public onMessage(handler: MessageHandler): () => void {
    this.handlers.add(handler)

    // Return unsubscribe function
    return () => {
      this.handlers.delete(handler)
    }
  }

  /**
   * Get current notification count
   */
  public getCount(): number {
    return this.notificationCount
  }

  /**
   * Check if broadcaster is initialized
   */
  public isReady(): boolean {
    return this.isInitialized
  }

  /**
   * Close the broadcast channel
   */
  public close(): void {
    if (this.channel) {
      this.channel.close()
      this.channel = null
    }
    this.handlers.clear()
  }
}

// Export singleton instance
export const notificationBroadcaster = new NotificationBroadcaster()
