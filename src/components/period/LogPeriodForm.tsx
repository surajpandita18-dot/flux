'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type FlowIntensity = 'light' | 'medium' | 'heavy'

const FLOW_OPTIONS: { value: FlowIntensity; label: string; dot: string; desc: string }[] = [
  { value: 'light',  label: 'Light',  dot: 'bg-[#F4A0B4]/40', desc: 'Spotting or light flow' },
  { value: 'medium', label: 'Medium', dot: 'bg-[#F4A0B4]',    desc: 'Normal flow' },
  { value: 'heavy',  label: 'Heavy',  dot: 'bg-[#E8627C]',    desc: 'Heavy flow' },
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
        <a href="/" className="text-[12px] text-[#A8A4A0] underline underline-offset-2 mb-6 inline-block">
          ← Back
        </a>

        {/* Header */}
        <div className="mb-8">
          <div className="text-3xl mb-3">🩸</div>
          <h1 className="text-[26px] font-extrabold tracking-tight text-[#1A1814] dark:text-[#F5F3F0] mb-2">
            My period started
          </h1>
          <p className="text-[14px] text-[#5C5754] dark:text-[#A8A4A0] leading-relaxed">
            We&apos;ll reset your cycle to Day 1 and recalculate your phase.
          </p>
        </div>

        {/* Flow selector */}
        <div className="space-y-3 mb-8">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#5C5754] dark:text-[#A8A4A0]">
            How&apos;s the flow today?
          </p>
          {FLOW_OPTIONS.map((opt) => {
            const selected = flow === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFlow(opt.value)}
                className={`w-full min-h-[60px] flex items-center gap-4 px-4 rounded-2xl border-2 transition-all text-left active:scale-[0.98] ${
                  selected
                    ? 'border-[#E8627C] bg-[#FCEEF1] dark:bg-[#4A1020]'
                    : 'border-[#F0EBE6] dark:border-white/10 bg-white dark:bg-[#1C1B1A]'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex-shrink-0 ${opt.dot}`} />
                <div>
                  <div className="text-sm font-semibold text-[#1A1814] dark:text-[#F5F3F0]">
                    {opt.label}
                  </div>
                  <div className="text-[12px] text-[#A8A4A0]">{opt.desc}</div>
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
          className="btn-rose disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving…' : 'Log Day 1'}
        </button>

        <p className="text-[12px] text-[#A8A4A0] text-center mt-4 leading-relaxed">
          This resets your cycle. If you started a few days ago, you can update the date in History.
        </p>

      </div>
    </main>
  )
}
