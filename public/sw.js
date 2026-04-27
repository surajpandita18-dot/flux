// Triggered by server at 9pm local — see /api/notify
self.addEventListener('push', (event) => {
  const title = 'How are you feeling today?'
  const body  = 'Take 10 seconds to log your energy and mood.'

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'daily-log',
      renotify: true,
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow('/log'),
  )
})
