'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  userId: string
}

export default function OnboardingForm({ userId }: Props) {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [lastPeriodDate, setLastPeriodDate] = useState('')
  const [cycleLength, setCycleLength] = useState(28)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0] ?? ''

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: dbError } = await supabase.from('user_profiles').insert({
      user_id: userId,
      display_name: displayName.trim(),
      last_period_date: lastPeriodDate || null,
      cycle_length_avg: cycleLength,
    })

    setLoading(false)

    if (dbError) {
      setError('Something went wrong saving your profile. Please try again.')
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 flex flex-col justify-center p-6">
      <div className="max-w-sm mx-auto w-full">

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Let's set up Flux
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          Takes 30 seconds. Just the basics.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name */}
          <div className="space-y-1">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              What should we call you?
            </label>
            <input
              id="name"
              type="text"
              required
              autoComplete="given-name"
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full min-h-[44px] px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white text-[16px]"
            />
          </div>

          {/* Last period date */}
          <div className="space-y-1">
            <label
              htmlFor="period-date"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              When did your last period start?
            </label>
            <input
              id="period-date"
              type="date"
              required
              max={today}
              value={lastPeriodDate}
              onChange={(e) => setLastPeriodDate(e.target.value)}
              className="w-full min-h-[44px] px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white text-[16px]"
            />
          </div>

          {/* Cycle length */}
          <div className="space-y-1">
            <label
              htmlFor="cycle-length"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              How long is your usual cycle?
            </label>
            <div className="flex items-center gap-3">
              <input
                id="cycle-length"
                type="number"
                min={15}
                max={60}
                required
                value={cycleLength}
                onChange={(e) => setCycleLength(Number(e.target.value))}
                className="w-24 min-h-[44px] px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white text-[16px] text-center"
              />
              <span className="text-sm text-gray-400">days (most people: 26–32)</span>
            </div>
          </div>

          {error && (
            <p className="text-red-600 dark:text-red-400 text-sm" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[44px] bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Saving...' : 'Start tracking'}
          </button>

        </form>
      </div>
    </main>
  )
}
