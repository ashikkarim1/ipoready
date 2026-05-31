// Service Worker for Web Push Notifications
const NOTIFICATION_TAG = 'ipoready-notification'
const CACHE_NAME = 'ipoready-v1'

// Handle push events
self.addEventListener('push', (event) => {
  if (!event.data) {
    console.log('Push event received but no data provided')
    return
  }

  let notificationData = {
    title: 'IPOReady Notification',
    body: 'You have a new notification',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: NOTIFICATION_TAG,
    requireInteraction: false,
  }

  try {
    const data = event.data.json()
    notificationData = { ...notificationData, ...data }
  } catch (e) {
    notificationData.body = event.data.text()
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: {
        url: notificationData.url || '/dashboard',
        action: notificationData.action,
      },
      actions: [
        {
          action: 'open',
          title: 'Open',
        },
        {
          action: 'close',
          title: 'Close',
        },
      ],
    })
  )
})

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/dashboard'

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    }).then((clientList) => {
      // Check if IPOReady tab is already open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url === urlToOpen || client.url.includes('localhost:3800') || client.url.includes('ipoready')) {
          return client.focus()
        }
      }
      // If not open, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  // Track user dismissal if needed
  const dismissData = {
    notificationId: event.notification.tag,
    dismissedAt: new Date().toISOString(),
  }
  // Can be used for analytics
  console.log('Notification dismissed:', dismissData)
})

// Handle service worker activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Optional: Handle background sync for offline notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-notifications') {
    event.waitUntil(
      // Sync logic here if needed
      Promise.resolve()
    )
  }
})
