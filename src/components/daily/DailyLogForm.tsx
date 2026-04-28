'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Phase } from '@/lib/phaseEngine'
import affirmations from '../../../content/affirmations.json'
import {
  GlyphEnergyLow,
  GlyphEnergyOkay,
  GlyphEnergyHigh,
  GlyphMood,
} from './LogGlyphs'

const PHASE_ACCENT: Record<Phase, string> = {
  menstrual:  '#C76B4A',
  follicular: '#7A8F5C',
  ovulation:  '#D49A3D',
  luteal:     '#8B6F8C',
}

const PHASE_SOFT: Record<Phase, string> = {
  menstrual:  '#FDF0EC',
  follicular: '#EFF5EC',
  ovulation:  '#FBF4E6',
  luteal:     '#F0ECF5',
}

const PHASE_LABEL: Record<Phase, string> = {
  menstrual:  'Rest phase',
  follicular: 'Build phase',
  ovulation:  'Peak phase',
  luteal:     'Protect phase',
}

const POST_LOG_MESSAGES: Record<Phase, string> = {
  menstrual:  'Rest is productive too.',
  follicular: 'You\'re building momentum.',
  ovulation:  'You\'re in your element right now.',
  luteal:     'You showed up for yourself today.',
}

const SYMPTOM_CHIPS = [
  'Cramps', 'Bloating', 'Headache', 'Fatigue',
  'Mood swings', 'Cravings', 'Backache', 'Tender breasts',
  'Nausea', 'Insomnia', 'Brain fog', 'Spotting',
]

interface Props {
  userId: string
  phase: Phase
  todayIso: string
}

type EnergyValue = 'low' | 'medium' | 'high'
type MoodValue   = 'tender' | 'grounded' | 'clear' | 'expansive' | 'scattered' | 'anxious' | 'frustrated' | 'withdrawn'

const ENERGY_OPTIONS: { value: EnergyValue; label: string; desc: string }[] = [
  { value: 'low',    label: 'Low',  desc: 'Running on empty' },
  { value: 'medium', label: 'Okay', desc: 'Getting by'       },
  { value: 'high',   label: 'Good', desc: 'Feeling it'       },
]

const MOOD_OPTIONS: { value: MoodValue; label: string }[] = [
  { value: 'tender',     label: 'Tender'     },
  { value: 'grounded',   label: 'Grounded'   },
  { value: 'clear',      label: 'Clear'       },
  { value: 'expansive',  label: 'Expansive'  },
  { value: 'scattered',  label: 'Scattered'  },
  { value: 'anxious',    label: 'Anxious'    },
  { value: 'frustrated', label: 'Frustrated' },
  { value: 'withdrawn',  label: 'Withdrawn'  },
]

function EnergyGlyph({ value, size, color, glow }: { value: EnergyValue; size?: number; color?: string; glow?: boolean }) {
  if (value === 'low')    return <GlyphEnergyLow  size={size} color={color} glow={glow} />
  if (value === 'medium') return <GlyphEnergyOkay size={size} color={color} glow={glow} />
  return                         <GlyphEnergyHigh  size={size} color={color} glow={glow} />
}

export default function DailyLogForm({ userId, phase, todayIso }: Props) {
  const router = useRouter()
  const [energy,      setEnergy]      = useState<EnergyValue | null>(null)
  const [mood,        setMood]        = useState<MoodValue | null>(null)
  const [symptoms,    setSymptoms]    = useState<Set<string>>(new Set())
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [saved,       setSaved]       = useState(false)
  const [affirmation, setAffirmation] = useState('')

  const accent = PHASE_ACCENT[phase]
  const softBg = PHASE_SOFT[phase]

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
    setTimeout(() => { router.push('/'); router.refresh() }, 2800)
  }

  if (saved) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#F7F1E9' }}>
        <div className="max-w-sm w-full text-center space-y-6" style={{ animation: 'flux-fade 0.5s ease-out both' }}>
          {/* Check circle */}
          <div className="flex justify-center">
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden>
              <circle cx="36" cy="36" r="32"
                stroke={accent} strokeWidth="3"
                strokeDasharray="201" strokeDashoffset="201"
                strokeLinecap="round"
                style={{ animation: 'flux-check-circle-draw 0.7s ease-out 0.1s forwards' }}
              />
              <path d="M22 36 L32 46 L50 28"
                stroke={accent} strokeWidth="3.5"
                strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray="90" strokeDashoffset="90"
                style={{ animation: 'flux-check-draw 0.4s ease-out 0.7s forwards' }}
              />
            </svg>
          </div>
          <div className="space-y-2">
            <p className="text-[22px] leading-snug font-medium serif-italic" style={{ color: '#1F4E4A' }}>
              {affirmation}
            </p>
            <p className="text-[13px]" style={{ color: '#8FA09E' }}>
              {POST_LOG_MESSAGES[phase]}
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col pb-28" style={{ background: '#F7F1E9' }}>

      {/* Editorial header — matches prototype */}
      <div
        className="px-6 pt-16 pb-8 relative"
        style={{
          background: `radial-gradient(120% 80% at 50% 0%, ${softBg} 0%, #F7F1E9 75%)`,
        }}
      >
        {/* Decorative ornament */}
        <div className="flex items-center justify-center gap-2.5 mb-4">
          <span style={{ width: 28, height: 1, background: accent, opacity: 0.45 }} />
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
            <circle cx="5" cy="5" r="2" fill={accent} opacity="0.7" />
          </svg>
          <span style={{ width: 28, height: 1, background: accent, opacity: 0.45 }} />
        </div>

        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-center mb-3" style={{ color: accent }}>
          A moment with yourself
        </p>
        <h1 className="text-[38px] font-medium leading-[1.04] tracking-tight text-center serif" style={{ color: '#1F4E4A' }}>
          How are you<br /><span className="serif-italic" style={{ color: accent }}>arriving?</span>
        </h1>
        <p className="serif-italic text-[14px] leading-relaxed text-center mt-3.5 mx-auto" style={{ color: '#3F5A57', maxWidth: 240 }}>
          there are no wrong answers — only what&apos;s true now
        </p>
      </div>

      <div className="max-w-sm mx-auto w-full px-4 pt-5 space-y-4">

        {/* Energy */}
        <section
          className="card p-5 space-y-3"
          style={{ animationDelay: '60ms' }}
        >
          <p className="section-label">Your energy</p>
          <div className="grid grid-cols-3 gap-2.5">
            {ENERGY_OPTIONS.map((opt) => {
              const selected = energy === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setEnergy(opt.value)}
                  className="min-h-[88px] flex flex-col items-center justify-center gap-2 rounded-2xl transition-all active:scale-[0.97]"
                  style={{
                    background: selected ? softBg : '#F2E8D9',
                    border: `2px solid ${selected ? accent : 'transparent'}`,
                    boxShadow: selected ? `0 0 0 1px ${accent}22` : 'none',
                  }}
                  aria-pressed={selected}
                >
                  <EnergyGlyph
                    value={opt.value}
                    size={28}
                    color={selected ? accent : '#8B6F5C'}
                    glow={selected}
                  />
                  <div className="text-center">
                    <p className="text-[12px] font-semibold" style={{ color: selected ? accent : '#3F5A57' }}>
                      {opt.label}
                    </p>
                    <p className="text-[9px]" style={{ color: '#8FA09E' }}>{opt.desc}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* Mood */}
        <section
          className="card p-5 space-y-3"
          style={{ animationDelay: '120ms' }}
        >
          <p className="section-label">Your weather inside</p>
          <div className="grid grid-cols-4 gap-2">
            {MOOD_OPTIONS.map((opt) => {
              const selected = mood === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMood(opt.value)}
                  className="min-h-[72px] flex flex-col items-center justify-center gap-1.5 rounded-2xl transition-all active:scale-[0.97]"
                  style={{
                    background: selected ? softBg : '#F2E8D9',
                    border: `2px solid ${selected ? accent : 'transparent'}`,
                  }}
                  aria-pressed={selected}
                >
                  <GlyphMood
                    kind={opt.value}
                    size={24}
                    color={selected ? accent : '#8B6F5C'}
                    glow={selected}
                  />
                  <p className="text-[9px] font-semibold capitalize" style={{ color: selected ? accent : '#5A6E6C' }}>
                    {opt.label}
                  </p>
                </button>
              )
            })}
          </div>
        </section>

        {/* Symptoms */}
        <section
          className="card p-5 space-y-3"
          style={{ animationDelay: '180ms' }}
        >
          <div className="flex items-baseline gap-2">
            <p className="section-label">What&apos;s asking to be noticed</p>
            <span className="text-[10px]" style={{ color: '#C4B8AC' }}>optional</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SYMPTOM_CHIPS.map((s) => {
              const selected = symptoms.has(s)
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSymptom(s)}
                  className="min-h-[36px] px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all active:scale-[0.97]"
                  style={{
                    background: selected ? accent : '#F2E8D9',
                    color: selected ? '#FBF6EE' : '#3F5A57',
                  }}
                  aria-pressed={selected}
                >
                  {s}
                </button>
              )
            })}
          </div>
        </section>

        {error && (
          <p className="text-[13px] px-1" style={{ color: '#C76B4A' }} role="alert">{error}</p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!energy || !mood || loading}
          className="w-full min-h-[56px] rounded-[18px] font-medium text-[15px] transition-all active:scale-[0.98] disabled:opacity-40"
          style={{
            background: loading ? accent : `linear-gradient(180deg, ${accent} 0%, #8B5A3C 100%)`,
            color: '#FBF6EE',
            boxShadow: `0 8px 20px rgba(139,90,60,0.20)`,
            letterSpacing: '-0.05px',
          }}
        >
          {loading ? 'Saving…' : (
            <><span className="serif-italic font-medium mr-1.5">Hold</span><span>this in the day</span></>
          )}
        </button>

        <p className="serif-italic text-[12px] text-center mt-1.5" style={{ color: '#8FA09E' }}>
          a small offering, kept softly
        </p>

      </div>
    </main>
  )
}
