// IPOReady Service Worker — Push Notifications

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()))

self.addEventListener('push', event => {
  let data = {}
  try { data = event.data?.json() ?? {} } catch {}

  const title = data.title || 'IPOReady'
  const options = {
    body: data.body || 'You have a new update.',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: data.tag || 'ipoready-notification',
    renotify: true,
    data: { url: data.url || '/dashboard' },
    actions: data.actions || [],
    vibrate: [200, 100, 200],
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const url = event.notification.data?.url || '/dashboard'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      const existing = clients.find(c => c.url.includes(url))
      if (existing) return existing.focus()
      return self.clients.openWindow(url)
    })
  )
})
