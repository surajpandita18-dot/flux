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
      user_id:          userId,
      display_name:     displayName.trim(),
      last_period_date: lastPeriodDate || null,
      cycle_length_avg: cycleLength,
    })

    setLoading(false)

    if (dbError) {
      setError('Something went wrong. Please try again.')
      return
    }

    window.location.href = '/'
  }

  return (
    <main className="min-h-screen bg-surface dark:bg-surface-dark flex flex-col">
      {/* Header */}
      <div className="phase-header-landing px-6 pt-16 pb-20 rounded-b-[2.5rem]">
        <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-2">
          Welcome to Flux
        </p>
        <h1 className="text-white text-[36px] font-extrabold tracking-tight leading-tight">
          Three questions<br />and you&apos;re in.
        </h1>
      </div>

      {/* Form card */}
      <div className="flex-1 px-5 -mt-8 pb-10">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-card p-6 max-w-sm mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="section-label block">
                What should we call you?
              </label>
              <input
                id="name"
                type="text"
                required
                autoComplete="given-name"
                placeholder="Your first name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input"
              />
            </div>

            {/* Last period */}
            <div className="space-y-2">
              <label htmlFor="period-date" className="section-label block">
                When did your last period start?
              </label>
              <input
                id="period-date"
                type="date"
                required
                max={today}
                value={lastPeriodDate}
                onChange={(e) => setLastPeriodDate(e.target.value)}
                className="input"
              />
              <p className="text-xs text-gray-400">
                Approximate is fine — you can update it any time.
              </p>
            </div>

            {/* Cycle length */}
            <div className="space-y-2">
              <label htmlFor="cycle-length" className="section-label block">
                How long are your cycles usually?
              </label>
              <div className="flex items-center gap-4">
                <input
                  id="cycle-length"
                  type="number"
                  min={15}
                  max={60}
                  required
                  value={cycleLength}
                  onChange={(e) => setCycleLength(Number(e.target.value))}
                  className="input w-24 text-center"
                />
                <span className="text-sm text-gray-400 leading-relaxed">
                  days<br />
                  <span className="text-xs">most people: 26–32</span>
                </span>
              </div>
            </div>

            {error && (
              <p className="text-red-600 dark:text-red-400 text-sm" role="alert">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !displayName.trim() || !lastPeriodDate}
              className="btn-primary"
            >
              {loading ? 'Setting up…' : 'Start tracking'}
            </button>

          </form>
        </div>

        <p className="text-xs text-gray-400 text-center mt-5 leading-relaxed px-4">
          Your data is private and stored securely. We never sell it.
        </p>
      </div>
    </main>
  )
}
