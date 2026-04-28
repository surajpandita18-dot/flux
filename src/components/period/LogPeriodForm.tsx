'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type FlowIntensity = 'light' | 'medium' | 'heavy'

const FLOW_OPTIONS: { value: FlowIntensity; label: string; dot: string; desc: string }[] = [
  { value: 'light',  label: 'Light',  dot: 'bg-red-200',  desc: 'Spotting or light flow' },
  { value: 'medium', label: 'Medium', dot: 'bg-menstrual/60', desc: 'Normal flow' },
  { value: 'heavy',  label: 'Heavy',  dot: 'bg-menstrual', desc: 'Heavy flow' },
]

interface Props {
  userId: string
  todayIso: string
}

export default function LogPeriodForm({ userId, todayIso }: Props) {
  const router = useRouter()
  const [flow,    setFlow]    = useState<FlowIntensity | null>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  async function handleSubmit() {
    if (!flow) return
    setLoading(true)
    setError(null)

    const supabase = createClient()

    // Insert cycle log
    const { error: logErr } = await supabase.from('cycle_logs').insert({
      user_id:           userId,
      period_start_date: todayIso,
      flow_intensity:    flow,
    })

    if (logErr) {
      setLoading(false)
      setError('Could not save. Please try again.')
      return
    }

    // Update last_period_date on the profile
    const { error: profileErr } = await supabase
      .from('user_profiles')
      .update({ last_period_date: todayIso })
      .eq('user_id', userId)

    setLoading(false)

    if (profileErr) {
      setError('Cycle log saved but profile update failed. Please try again.')
      return
    }

    window.location.href = '/'
  }

  return (
    <main className="min-h-screen bg-surface dark:bg-surface-dark flex flex-col justify-center px-5">
      <div className="max-w-sm mx-auto w-full">

        {/* Back */}
        <a href="/" className="text-xs text-gray-400 underline underline-offset-2 mb-6 inline-block">
          ← Back
        </a>

        {/* Header */}
        <div className="mb-8">
          <div className="text-3xl mb-3">🩸</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            My period started
          </h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            We'll reset your cycle to Day 1 and recalculate your phase card.
          </p>
        </div>

        {/* Flow selector */}
        <div className="space-y-3 mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
            How's the flow today?
          </p>
          {FLOW_OPTIONS.map((opt) => {
            const selected = flow === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFlow(opt.value)}
                className={`w-full min-h-[60px] flex items-center gap-4 px-4 rounded-2xl border-2 transition-all text-left ${
                  selected
                    ? 'border-menstrual bg-menstrual-soft dark:bg-menstrual-soft-dark'
                    : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex-shrink-0 ${opt.dot}`} />
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {opt.label}
                  </div>
                  <div className="text-xs text-gray-400">{opt.desc}</div>
                </div>
              </button>
            )
          })}
        </div>

        {error && (
          <p className="text-red-600 dark:text-red-400 text-sm mb-4" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!flow || loading}
          className="w-full min-h-[52px] bg-menstrual text-white font-semibold rounded-2xl px-4 py-3 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          {loading ? 'Saving…' : 'Log Day 1'}
        </button>

        <p className="text-xs text-gray-400 text-center mt-4 leading-relaxed">
          This resets your cycle. If you started a few days ago, you can update the date in History.
        </p>

      </div>
    </main>
  )
}
