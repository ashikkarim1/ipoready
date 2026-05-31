'use client'

import { useEffect } from 'react'

/**
 * Service Worker Registration Component
 * Registers the service worker on client load
 * This enables push notifications and background sync
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const registerServiceWorker = async () => {
      // Check if browser supports service workers
      if (!('serviceWorker' in navigator)) {
        console.log('Service Workers are not supported in this browser')
        return
      }

      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/',
        })

        console.log('Service Worker registered successfully:', registration)

        // Check for updates periodically
        setInterval(() => {
          registration.update()
        }, 60000) // Check every minute

        // Listen for controller change (new service worker activated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('Service Worker controller changed - new version activated')
        })
      } catch (error) {
        console.error('Failed to register Service Worker:', error)
      }
    }

    // Register service worker
    registerServiceWorker()

    // Cleanup
    return () => {
      // Service worker will remain registered until explicitly unregistered
    }
  }, [])

  // Listen for push notifications sent via service worker
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Handle messages from service worker
    navigator.serviceWorker?.addEventListener('message', (event) => {
      const { type, data } = event.data

      if (type === 'NOTIFICATION_CLICKED') {
        // Handle notification click if needed
        console.log('Notification clicked:', data)
      } else if (type === 'NOTIFICATION_CLOSED') {
        // Handle notification close if needed
        console.log('Notification closed:', data)
      }
    })
  }, [])

  return null // This component doesn't render anything
}
