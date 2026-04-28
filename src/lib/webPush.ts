import webpush from 'web-push'

// Generate keys once with: node -e "const wp=require('web-push'); const k=wp.generateVAPIDKeys(); console.log(k)"
// Then set VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY in .env.local

const SUBJECT       = process.env.VAPID_SUBJECT       ?? 'mailto:hello@flux.app'
const PUBLIC_KEY    = process.env.VAPID_PUBLIC_KEY     ?? ''
const PRIVATE_KEY   = process.env.VAPID_PRIVATE_KEY    ?? ''

if (PUBLIC_KEY && PRIVATE_KEY) {
  webpush.setVapidDetails(SUBJECT, PUBLIC_KEY, PRIVATE_KEY)
}

export type PushSubscriptionRow = {
  endpoint: string
  p256dh:   string
  auth:     string
}

export function getVapidPublicKey(): string {
  return PUBLIC_KEY
}

export async function sendPushNotification(
  sub: PushSubscriptionRow,
  payload: { title: string; body: string; url?: string },
): Promise<void> {
  if (!PUBLIC_KEY || !PRIVATE_KEY) return

  await webpush.sendNotification(
    {
      endpoint: sub.endpoint,
      keys: { p256dh: sub.p256dh, auth: sub.auth },
    },
    JSON.stringify(payload),
  )
}
