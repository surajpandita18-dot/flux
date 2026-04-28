'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Phase } from '@/lib/phaseEngine'
import affirmations from '../../../content/affirmations.json'

const ENERGY_OPTIONS = [
  { value: 'low',    label: 'Low',   emoji: '🪫', desc: 'Running on empty' },
  { value: 'medium', label: 'Okay',  emoji: '🔋', desc: 'Getting by'       },
  { value: 'high',   label: 'Good',  emoji: '⚡', desc: 'Feeling it'       },
] as const

const MOOD_OPTIONS = [
  { value: 'tender',     emoji: '💗', label: 'Tender'     },
  { value: 'grounded',   emoji: '🌿', label: 'Grounded'   },
  { value: 'clear',      emoji: '✨', label: 'Clear'       },
  { value: 'expansive',  emoji: '🌊', label: 'Expansive'  },
  { value: 'scattered',  emoji: '💭', label: 'Scattered'  },
  { value: 'anxious',    emoji: '😬', label: 'Anxious'    },
  { value: 'frustrated', emoji: '😤', label: 'Frustrated' },
  { value: 'withdrawn',  emoji: '🌙', label: 'Withdrawn'  },
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
  menstrual:  'bg-menstrual  text-white',
  follicular: 'bg-follicular text-white',
  ovulation:  'bg-ovulation  text-white',
  luteal:     'bg-luteal     text-white',
}

const phaseSoft: Record<Phase, string> = {
  menstrual:  'bg-menstrual-soft  dark:bg-menstrual-soft-dark  text-menstrual',
  follicular: 'bg-follicular-soft dark:bg-follicular-soft-dark text-follicular',
  ovulation:  'bg-ovulation-soft  dark:bg-ovulation-soft-dark  text-ovulation',
  luteal:     'bg-luteal-soft     dark:bg-luteal-soft-dark     text-luteal',
}

const phaseHeaderClass: Record<Phase, string> = {
  menstrual:  'phase-header-menstrual',
  follicular: 'phase-header-follicular',
  ovulation:  'phase-header-ovulation',
  luteal:     'phase-header-luteal',
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
  const [energy,      setEnergy]      = useState<EnergyValue | null>(null)
  const [mood,        setMood]        = useState<MoodValue | null>(null)
  const [symptoms,    setSymptoms]    = useState<Set<string>>(new Set())
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [saved,       setSaved]       = useState(false)
  const [affirmation, setAffirmation] = useState('')

  const accent = phaseAccent[phase]
  const soft   = phaseSoft[phase]

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
      setError('Could not save your check-in. Please try again.')
      return
    }

    const pool = affirmations[phase]
    setAffirmation(pool[Math.floor(Math.random() * pool.length)] ?? '')
    setSaved(true)
    setTimeout(() => { router.push('/'); router.refresh() }, 2500)
  }

  if (saved) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-surface dark:bg-surface-dark">
        <div className="max-w-sm w-full text-center space-y-5 animate-fade-up">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto ${soft}`}>
            <span className="text-3xl">✓</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white leading-snug">
            {affirmation}
          </p>
          <p className="text-sm text-gray-500">
            {POST_LOG_MESSAGES[phase]}
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-surface dark:bg-surface-dark flex flex-col pb-8">

      {/* Phase header */}
      <div className={`${phaseHeaderClass[phase]} px-5 pt-14 pb-10 rounded-b-[2.5rem]`}>
        <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">
          Daily check-in
        </p>
        <h1 className="text-white text-[34px] font-extrabold tracking-tight leading-none">
          How are you<br />today?
        </h1>
      </div>

      <div className="max-w-sm mx-auto w-full px-4 -mt-4 space-y-4">

        {/* Energy */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-soft p-5 space-y-3">
          <p className="section-label">Energy</p>
          <div className="grid grid-cols-3 gap-2.5">
            {ENERGY_OPTIONS.map((opt) => {
              const selected = energy === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setEnergy(opt.value)}
                  className={`min-h-[80px] flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 transition-all active:scale-[0.97] ${
                    selected
                      ? `${accent} border-transparent shadow-soft`
                      : 'border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50'
                  }`}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <span className="text-xs font-bold">{opt.label}</span>
                  <span className={`text-[9px] font-medium ${selected ? 'text-white/70' : 'text-gray-400'}`}>
                    {opt.desc}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Mood */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-soft p-5 space-y-3">
          <p className="section-label">Mood</p>
          <div className="grid grid-cols-4 gap-2">
            {MOOD_OPTIONS.map((opt) => {
              const selected = mood === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMood(opt.value)}
                  className={`min-h-[68px] flex flex-col items-center justify-center gap-1 rounded-2xl border-2 transition-all active:scale-[0.97] ${
                    selected
                      ? `${accent} border-transparent shadow-soft`
                      : 'border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50'
                  }`}
                >
                  <span className="text-xl">{opt.emoji}</span>
                  <span className="text-[9px] font-bold capitalize">{opt.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Symptoms */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-soft p-5 space-y-3">
          <div className="flex items-baseline gap-2">
            <p className="section-label">Symptoms</p>
            <span className="text-[10px] text-gray-300 dark:text-gray-600">optional</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SYMPTOM_CHIPS.map((s) => {
              const selected = symptoms.has(s)
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSymptom(s)}
                  className={`min-h-[36px] px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition-all active:scale-[0.97] ${
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
        </div>

        {error && (
          <p className="text-red-600 dark:text-red-400 text-sm px-1" role="alert">{error}</p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!energy || !mood || loading}
          className="btn-primary"
        >
          {loading ? 'Saving…' : 'Save check-in'}
        </button>

      </div>
    </main>
  )
}
