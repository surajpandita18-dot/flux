'use client'

import { useState, useEffect } from 'react'

type PermissionState = 'default' | 'granted' | 'denied' | 'unsupported'

export default function NotificationToggle() {
  const [state, setState] = useState<PermissionState>('default')

  useEffect(() => {
    if (!('Notification' in window)) {
      setState('unsupported')
      return
    }
    setState(Notification.permission as PermissionState)
  }, [])

  async function requestPermission() {
    if (!('Notification' in window)) return
    const result = await Notification.requestPermission()
    setState(result as PermissionState)
  }

  if (state === 'unsupported') {
    return (
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
        <p className="text-sm text-gray-400">
          Notifications not supported on this device.
        </p>
      </div>
    )
  }

  if (state === 'denied') {
    return (
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
        <p className="text-sm text-gray-400 leading-relaxed">
          Notifications blocked. To enable: open your browser settings → find Flux → allow notifications.
        </p>
      </div>
    )
  }

  if (state === 'granted') {
    return (
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 flex items-center justify-between">
        <span className="text-sm text-gray-700 dark:text-gray-200">
          Daily reminders on
        </span>
        <span className="text-xs text-green-500 font-semibold">Enabled ✓</span>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={requestPermission}
      className="w-full min-h-[44px] rounded-2xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 px-4"
    >
      Enable daily reminders
    </button>
  )
}
