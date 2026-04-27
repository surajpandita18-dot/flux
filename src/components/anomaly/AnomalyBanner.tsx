'use client'

import { useState } from 'react'
import { dismissAnomaly } from '@/app/actions/dismissAnomaly'

const ANOMALY_COPY = {
  short_cycle: {
    headline: 'Your cycle was shorter than usual',
    body: 'One of your recent cycles was under 21 days. Bodies shift sometimes — it might be worth a gentle check-in with your doctor, just to be sure.',
  },
  long_cycle: {
    headline: 'Your cycle was longer than usual',
    body: 'One of your recent cycles was over 35 days. This is often nothing to worry about, but it\'s worth mentioning to your doctor at your next visit.',
  },
  high_variance: {
    headline: 'Your cycle lengths have been varying',
    body: 'Your recent cycles have varied by more than 7 days. This can be normal, but if it continues, a gentle check-in with your doctor is a good idea.',
  },
} as const

export interface AnomalyFlag {
  id: string
  flag_type: 'short_cycle' | 'long_cycle' | 'high_variance'
}

interface Props {
  flags: AnomalyFlag[]
}

export default function AnomalyBanner({ flags }: Props) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  function handleDismiss(flagId: string) {
    setDismissed((prev) => new Set(Array.from(prev).concat(flagId)))
    dismissAnomaly(flagId)
  }

  const visible = flags.filter((f) => !dismissed.has(f.id))
  if (visible.length === 0) return null

  return (
    <div className="max-w-sm mx-auto px-4 pt-2 space-y-2">
      {visible.map((flag) => {
        const copy = ANOMALY_COPY[flag.flag_type]
        return (
          <div
            key={flag.id}
            className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4"
          >
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
              {copy.headline}
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
              {copy.body}
            </p>
            <button
              type="button"
              onClick={() => handleDismiss(flag.id)}
              className="mt-3 text-xs text-amber-600 dark:text-amber-500 underline underline-offset-2"
            >
              Got it, dismiss
            </button>
          </div>
        )
      })}
    </div>
  )
}
