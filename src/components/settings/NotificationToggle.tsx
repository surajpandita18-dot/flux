'use client'

import { useState, useEffect } from 'react'

type UIState = 'loading' | 'unsupported' | 'denied' | 'subscribed' | 'idle' | 'subscribing' | 'error'

async function registerAndSubscribe(): Promise<void> {
  const reg = await navigator.serviceWorker.register('/sw.js')
  await navigator.serviceWorker.ready

  // Get VAPID public key from server
  const res = await fetch('/api/push/subscribe')
  const { publicKey } = await res.json() as { publicKey: string }
  if (!publicKey) throw new Error('VAPID public key not configured')

  // Convert base64url to Uint8Array for the browser Push API
  const padding    = '='.repeat((4 - (publicKey.length % 4)) % 4)
  const base64     = (publicKey + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData    = atob(base64)
  const outputKey  = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) outputKey[i] = rawData.charCodeAt(i)

  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly:     true,
    applicationServerKey: outputKey,
  })

  const json = subscription.toJSON()
  const keys = json.keys as { p256dh: string; auth: string }

  // Store subscription server-side
  const saveRes = await fetch('/api/push/subscribe', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      endpoint: json.endpoint,
      keys:     { p256dh: keys.p256dh, auth: keys.auth },
    }),
  })

  if (!saveRes.ok) throw new Error('Failed to save subscription')
}

async function checkSubscribed(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false
  try {
    const reg = await navigator.serviceWorker.getRegistration('/sw.js')
    if (!reg) return false
    const sub = await reg.pushManager.getSubscription()
    return sub !== null
  } catch {
    return false
  }
}

export default function NotificationToggle() {
  const [state, setState] = useState<UIState>('loading')

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported')
      return
    }
    if (Notification.permission === 'denied') {
      setState('denied')
      return
    }
    checkSubscribed().then((isSubscribed) => {
      setState(isSubscribed ? 'subscribed' : 'idle')
    })
  }, [])

  async function handleEnable() {
    setState('subscribing')
    try {
      const permission = await Notification.requestPermission()
      if (permission === 'denied') { setState('denied'); return }
      await registerAndSubscribe()
      setState('subscribed')
    } catch {
      setState('error')
    }
  }

  if (state === 'loading') return null

  if (state === 'unsupported') {
    return (
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
        <p className="text-sm text-gray-400">Notifications not supported on this device.</p>
      </div>
    )
  }

  if (state === 'denied') {
    return (
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
        <p className="text-sm text-gray-400 leading-relaxed">
          Notifications blocked. Open your browser settings → find Flux → allow notifications.
        </p>
      </div>
    )
  }

  if (state === 'subscribed') {
    return (
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 flex items-center justify-between">
        <span className="text-sm text-gray-700 dark:text-gray-200">Daily reminders on</span>
        <span className="text-xs text-green-500 font-semibold">Enabled ✓</span>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="rounded-2xl border border-red-100 dark:border-red-900 p-4">
        <p className="text-sm text-red-500 leading-relaxed">
          Could not enable reminders. Please try again.
        </p>
        <button
          type="button"
          onClick={handleEnable}
          className="mt-2 text-xs underline text-red-400"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={handleEnable}
      disabled={state === 'subscribing'}
      className="w-full min-h-[44px] rounded-2xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 px-4 disabled:opacity-50"
    >
      {state === 'subscribing' ? 'Enabling…' : 'Enable daily reminders'}
    </button>
  )
}
