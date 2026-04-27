self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  const title = data.title ?? 'Flux'
  const body  = data.body  ?? 'How are you feeling today?'

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'daily-log',
      renotify: false,
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow('/log'),
  )
})
