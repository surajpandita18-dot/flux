'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Phase } from '@/lib/phaseEngine'

const ENERGY_OPTIONS = [
  { value: 'low',    label: 'Low',    emoji: '🪫' },
  { value: 'medium', label: 'Okay',   emoji: '🔋' },
  { value: 'high',   label: 'Great',  emoji: '⚡' },
] as const

const MOOD_OPTIONS = [
  { value: 'tender',     emoji: '💗' },
  { value: 'grounded',   emoji: '🌿' },
  { value: 'clear',      emoji: '✨' },
  { value: 'expansive',  emoji: '🌊' },
  { value: 'scattered',  emoji: '💭' },
  { value: 'anxious',    emoji: '😬' },
  { value: 'frustrated', emoji: '😤' },
  { value: 'withdrawn',  emoji: '🌙' },
] as const

const SYMPTOM_CHIPS = [
  'Cramps', 'Bloating', 'Headache', 'Fatigue',
  'Mood swings', 'Cravings', 'Backache', 'Tender breasts',
  'Nausea', 'Insomnia', 'Brain fog', 'Spotting',
]

const POST_LOG_MESSAGES: Record<Phase, string> = {
  menstrual:  'Logged. Rest is productive too.',
  follicular: 'Logged. You\'re building momentum.',
  ovulation:  'Logged. You\'re in your element right now.',
  luteal:     'Logged. You showed up for yourself today.',
}

const phaseAccent: Record<Phase, string> = {
  menstrual:  'bg-menstrual text-white',
  follicular: 'bg-follicular text-white',
  ovulation:  'bg-ovulation text-white',
  luteal:     'bg-luteal text-white',
}

const phaseRing: Record<Phase, string> = {
  menstrual:  'ring-menstrual',
  follicular: 'ring-follicular',
  ovulation:  'ring-ovulation',
  luteal:     'ring-luteal',
}

const phaseSoft: Record<Phase, string> = {
  menstrual:  'bg-menstrual-soft dark:bg-menstrual-soft-dark',
  follicular: 'bg-follicular-soft dark:bg-follicular-soft-dark',
  ovulation:  'bg-ovulation-soft dark:bg-ovulation-soft-dark',
  luteal:     'bg-luteal-soft dark:bg-luteal-soft-dark',
}

const phaseLabel: Record<Phase, string> = {
  menstrual:  'text-menstrual',
  follicular: 'text-follicular',
  ovulation:  'text-ovulation',
  luteal:     'text-luteal',
}

interface Props {
  userId: string
  phase: Phase
  todayIso: string
}

type EnergyValue = 'low' | 'medium' | 'high'
type MoodValue   = 'tender' | 'grounded' | 'clear' | 'expansive' | 'scattered' | 'anxious' | 'frustrated' | 'withdrawn'

export default function DailyLogForm({ userId, phase, todayIso }: Props) {
  const router = useRouter()
  const [energy,   setEnergy]   = useState<EnergyValue | null>(null)
  const [mood,     setMood]     = useState<MoodValue | null>(null)
  const [symptoms, setSymptoms] = useState<Set<string>>(new Set())
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [saved,    setSaved]    = useState(false)

  const accent = phaseAccent[phase]
  const ring   = phaseRing[phase]

  function toggleSymptom(s: string) {
    setSymptoms((prev) => {
      const next = new Set(prev)
      next.has(s) ? next.delete(s) : next.add(s)
      return next
    })
  }

  async function handleSubmit() {
    if (!energy || !mood) return
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: dbError } = await supabase.from('daily_logs').insert({
      user_id:      userId,
      log_date:     todayIso,
      energy_level: energy,
      mood,
      symptoms:     symptoms.size > 0 ? Array.from(symptoms) : null,
    })

    setLoading(false)

    if (dbError) {
      setError('Could not save your log. Please try again.')
      return
    }

    setSaved(true)
    setTimeout(() => {
      router.push('/')
      router.refresh()
    }, 2000)
  }

  const canSubmit = energy !== null && mood !== null && !loading

  if (saved) {
    return (
      <div className="max-w-sm mx-auto w-full pt-16 pb-10 px-4 flex flex-col items-center gap-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${phaseSoft[phase]}`}>
          <span className="text-2xl">✓</span>
        </div>
        <p className={`text-base font-semibold text-center ${phaseLabel[phase]}`}>
          {POST_LOG_MESSAGES[phase]}
        </p>
        <p className="text-xs text-gray-400 text-center">Taking you home…</p>
      </div>
    )
  }

  return (
    <div className="max-w-sm mx-auto w-full pt-6 pb-10 px-4 space-y-8">

      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          How are you today?
        </h1>
        <p className="text-sm text-gray-400">Tap to log — takes 10 seconds.</p>
      </div>

      {/* Energy */}
      <section className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
          Energy
        </p>
        <div className="grid grid-cols-3 gap-2">
          {ENERGY_OPTIONS.map((opt) => {
            const selected = energy === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setEnergy(opt.value)}
                className={`min-h-[64px] flex flex-col items-center justify-center gap-1 rounded-2xl border-2 transition-all ${
                  selected
                    ? `${accent} border-transparent ring-2 ${ring}`
                    : 'border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900'
                }`}
              >
                <span className="text-xl">{opt.emoji}</span>
                <span className="text-xs font-semibold">{opt.label}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Mood */}
      <section className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
          Mood
        </p>
        <div className="grid grid-cols-4 gap-2">
          {MOOD_OPTIONS.map((opt) => {
            const selected = mood === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMood(opt.value)}
                className={`min-h-[64px] flex flex-col items-center justify-center gap-1 rounded-2xl border-2 transition-all ${
                  selected
                    ? `${accent} border-transparent ring-2 ${ring}`
                    : 'border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900'
                }`}
              >
                <span className="text-lg">{opt.emoji}</span>
                <span className="text-[10px] font-semibold capitalize">{opt.value}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Symptoms — optional */}
      <section className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
          Symptoms <span className="normal-case font-normal">(optional)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {SYMPTOM_CHIPS.map((s) => {
            const selected = symptoms.has(s)
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleSymptom(s)}
                className={`min-h-[36px] px-3 py-1.5 rounded-full text-sm border transition-all ${
                  selected
                    ? `${accent} border-transparent`
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900'
                }`}
              >
                {s}
              </button>
            )
          })}
        </div>
      </section>

      {error && (
        <p className="text-red-600 dark:text-red-400 text-sm" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full min-h-[52px] bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-2xl px-4 py-3 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
      >
        {loading ? 'Saving...' : 'Save today\'s log'}
      </button>

    </div>
  )
}
