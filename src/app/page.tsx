import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { calculatePhase } from '@/lib/phaseEngine'
import { getPhaseData } from '@/lib/phases'
import { detectCycleAnomalies } from '@/lib/anomalyDetection'
import PhaseRing from '@/components/phase/PhaseRing'
import PhaseActions from '@/components/phase/PhaseActions'
import AnomalyBanner from '@/components/anomaly/AnomalyBanner'
import CycleCalendar from '@/components/calendar/CycleCalendar'
import BottomNav from '@/components/nav/BottomNav'
import Mascot from '@/components/mascot/Mascot'
import PhaseCard from '@/components/phase/PhaseCard'
import StartButton from '@/components/StartButton'
import type { AnomalyFlag } from '@/components/anomaly/AnomalyBanner'
import type { UserProfile, DailyLog } from '@/types/database'
import type { Phase } from '@/lib/phaseEngine'

// ── Phase display constants (matches prototype FLUX_PHASES / FLUX_THEME) ──
const PHASE_NAME: Record<Phase, string> = {
  menstrual:  'rest mode',
  follicular: 'build mode',
  ovulation:  'peak mode',
  luteal:     'protect mode',
}

const PHASE_INVITATION: Record<Phase, string> = {
  menstrual:  'today asks for softness',
  follicular: 'a small spark is returning',
  ovulation:  'you are luminous today',
  luteal:     'turn inward, gently',
}

// FLUX_THEME accent colors
const PHASE_ACCENT: Record<Phase, string> = {
  menstrual:  '#C76B4A',
  follicular: '#7A8F5C',
  ovulation:  '#D49A3D',
  luteal:     '#8B6F8C',
}

const PHASE_ACCENT_DEEP: Record<Phase, string> = {
  menstrual:  '#9B4F33',
  follicular: '#566B3F',
  ovulation:  '#9C6E1F',
  luteal:     '#604660',
}

const PHASE_SUPPORT_DEEP: Record<Phase, string> = {
  menstrual:  '#A86E78',
  follicular: '#A07F3F',
  ovulation:  '#8C6238',
  luteal:     '#825460',
}

const PHASE_SOFT: Record<Phase, string> = {
  menstrual:  '#F8DFD3',
  follicular: '#E4E8D6',
  ovulation:  '#F5E6C2',
  luteal:     '#E5DCE5',
}

// Anticipation rail: next 3 phases
const PHASE_ORDER: Phase[] = ['menstrual', 'follicular', 'ovulation', 'luteal']
const PHASE_DAYS: Record<Phase, number> = { menstrual: 5, follicular: 9, ovulation: 5, luteal: 9 }

export default async function HomePage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <StartButton />

  const { data } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  const profile = data as UserProfile | null
  if (!profile) redirect('/onboarding')

  const lastPeriodDateStr = profile.last_period_date
  if (!lastPeriodDateStr) redirect('/onboarding')

  const todayIso = new Date().toISOString().split('T')[0] ?? ''

  const [{ data: logData }, { count: logCount }, { data: cycleLogsData }] = await Promise.all([
    supabase.from('daily_logs').select('id').eq('user_id', user.id).eq('log_date', todayIso).maybeSingle(),
    supabase.from('daily_logs').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('cycle_logs').select('period_start_date').eq('user_id', user.id).order('period_start_date', { ascending: true }),
  ])

  const loggedToday = (logData as Pick<DailyLog, 'id'> | null) !== null

  const periodDates  = (cycleLogsData ?? []).map((r: { period_start_date: string }) => r.period_start_date)
  const detectedTypes = detectCycleAnomalies(periodDates)

  const { data: existingFlagsData } = await supabase
    .from('anomaly_flags')
    .select('id, flag_type')
    .eq('user_id', user.id)
    .is('dismissed_at', null)

  const existingFlags     = (existingFlagsData ?? []) as AnomalyFlag[]
  const existingFlagTypes = new Set(existingFlags.map((f) => f.flag_type))
  const newFlagTypes      = detectedTypes.filter((t) => !existingFlagTypes.has(t))
  let   anomalyFlags      = existingFlags

  if (newFlagTypes.length > 0) {
    const { data: inserted } = await supabase
      .from('anomaly_flags')
      .insert(newFlagTypes.map((flag_type) => ({ user_id: user.id, flag_type })))
      .select('id, flag_type')
    if (inserted) anomalyFlags = [...existingFlags, ...(inserted as AnomalyFlag[])]
  }

  let phaseResult
  try {
    phaseResult = calculatePhase(new Date(lastPeriodDateStr), profile.cycle_length_avg)
  } catch {
    redirect('/onboarding')
  }
  if (!phaseResult) redirect('/onboarding')

  const phaseData  = getPhaseData(phaseResult.phase)
  const firstName  = profile.display_name.split(' ')[0] ?? profile.display_name
  const hour       = new Date().getHours()
  const greeting   = hour < 5 ? 'late evening' : hour < 12 ? 'good morning' : hour < 17 ? 'good afternoon' : hour < 21 ? 'good evening' : 'soft night'

  const phase      = phaseResult.phase
  const accent     = PHASE_ACCENT[phase]
  const accentDeep = PHASE_ACCENT_DEEP[phase]
  const supportDeep = PHASE_SUPPORT_DEEP[phase]
  const soft       = PHASE_SOFT[phase]

  const daysUntil = phaseResult.daysUntilNextPeriod

  // Build anticipation rail (current + 2 upcoming phases)
  const currentIdx = PHASE_ORDER.indexOf(phase)
  const upcoming   = [0, 1, 2].map(i => PHASE_ORDER[(currentIdx + i) % 4] as Phase)

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: '#F7F1E9' }}>

      {/* Two-tone radial wash */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `radial-gradient(140% 90% at 30% 0%, ${soft} 0%, #F7F1E9 70%), radial-gradient(140% 90% at 80% 10%, rgba(180,122,90,0.18) 0%, transparent 60%)`,
        }}
        aria-hidden
      />

      <div className="relative z-10 max-w-sm mx-auto px-4 pt-14 flex flex-col gap-4">

        {/* Tiny greeting overline */}
        <div
          className="flex items-baseline justify-between px-1 stagger-rise"
          style={{ animationDelay: '0ms' }}
        >
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.32em', textTransform: 'uppercase', color: '#8FA09E', margin: 0 }}>
            {greeting} · <span style={{ color: accentDeep }}>{firstName}</span>
          </p>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#8FA09E', margin: 0 }}>
            {new Date().toLocaleDateString('en-US', { month: 'long' })}
          </p>
        </div>

        {/* Anomaly banner */}
        <AnomalyBanner flags={anomalyFlags} />

        {/* ── 1. IDENTITY CARD — phase name + ring + body truth ── */}
        <div
          className="card stagger-rise"
          style={{
            borderRadius: 28, padding: '28px 16px 22px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            animationDelay: '60ms',
          }}
        >
          <p className="serif-italic" style={{ fontSize: 13, color: '#8FA09E', margin: '0 0 4px', fontWeight: 500, letterSpacing: '0.02em' }}>
            you are in your
          </p>
          {/* Phase name with gradient */}
          <p
            className="serif-italic"
            style={{
              fontSize: 34, margin: '0 0 20px', letterSpacing: '-0.6px', lineHeight: 1, fontWeight: 500,
              background: `linear-gradient(135deg, ${accentDeep} 0%, ${supportDeep} 100%)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}
          >
            {PHASE_NAME[phase]}
          </p>

          {/* Phase ring */}
          <PhaseRing phaseResult={phaseResult} size={200} />

          {/* Phase invitation — body truth */}
          <p className="serif-italic" style={{
            fontSize: 18, color: '#1F4E4A', margin: '20px 0 0', fontWeight: 400, lineHeight: 1.45,
            letterSpacing: '-0.15px', textAlign: 'center', maxWidth: 280,
          }}>
            {PHASE_INVITATION[phase]}.
          </p>
          <p className="serif" style={{
            fontSize: 14, color: '#3F5A57', margin: '8px 0 0', fontWeight: 400, lineHeight: 1.55,
            textAlign: 'center', maxWidth: 300,
          }}>
            {phaseData.one_liner}
          </p>
        </div>

        {/* ── 2. PHASE ACTIONS — breathe / nourish / move ── */}
        <div className="stagger-rise" style={{ animationDelay: '100ms' }}>
          <PhaseActions phase={phase} />
        </div>

        {/* ── 3. ANTICIPATION RAIL ── */}
        <div
          className="card stagger-rise"
          style={{ borderRadius: 22, padding: '16px 18px 14px', animationDelay: '140ms' }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
            <p className="serif-italic" style={{ fontSize: 15, fontWeight: 500, color: '#1F4E4A', margin: 0, letterSpacing: '-0.15px' }}>
              what&apos;s coming
            </p>
            <p style={{ fontSize: 11, color: accentDeep, fontWeight: 500, margin: 0 }}>
              <span className="serif-italic">{Math.max(0, phaseResult.totalDays - phaseResult.dayNumber + 1)}</span> days to next bleed
            </p>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'stretch' }}>
            {upcoming.map((ph, i) => {
              const isCurrent = i === 0
              const len = PHASE_DAYS[ph]
              const phAccent = PHASE_ACCENT[ph]
              const phSoft = PHASE_SOFT[ph]
              return (
                <div key={i} style={{ flex: len, position: 'relative' }}>
                  <div style={{
                    height: 6, borderRadius: 99,
                    background: isCurrent ? phAccent : phSoft,
                    marginBottom: 8,
                  }} />
                  <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: isCurrent ? PHASE_ACCENT_DEEP[ph] : '#8FA09E', margin: 0 }}>
                    {PHASE_NAME[ph]}
                  </p>
                  <p className="serif-italic" style={{ fontSize: 11, color: '#3F5A57', margin: '2px 0 0' }}>
                    {len} days
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── 4. CHECK-IN CTA — gradient button ── */}
        <Link
          href="/log"
          className="stagger-rise"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 22px', borderRadius: 20, animationDelay: '180ms',
            background: loggedToday
              ? '#F2E8D9'
              : `linear-gradient(135deg, ${accent} 0%, ${supportDeep} 100%)`,
            color: loggedToday ? '#8FA09E' : '#FBF6EE',
            textDecoration: 'none',
            boxShadow: loggedToday ? 'none' : `0 10px 24px rgba(${accent === '#C76B4A' ? '199,107,74' : '139,111,140'},0.28)`,
            transition: 'transform 100ms',
          }}
        >
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', margin: 0, opacity: 0.85 }}>
              today
            </p>
            <p className="serif" style={{ fontSize: 19, fontWeight: 500, margin: '2px 0 0', letterSpacing: '-0.2px' }}>
              {loggedToday ? 'Checked in ✓' : <>How are you <span className="serif-italic">feeling?</span></>}
            </p>
          </div>
          {!loggedToday && (
            <div style={{
              width: 42, height: 42, borderRadius: 999,
              background: 'rgba(251,246,238,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M5 9 H13 M9 5 V13" stroke="#FBF6EE" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
          )}
        </Link>

        {/* Period button — small quiet italic link */}
        <Link
          href="/period"
          className="stagger-rise"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '10px 0', background: 'transparent', color: accentDeep,
            fontSize: 13, fontWeight: 500, letterSpacing: '0.02em', textDecoration: 'none',
            animationDelay: '220ms',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M7 1 C 4 5, 3 7, 3 9 a 4 4 0 0 0 8 0 c 0 -2, -1 -4, -4 -8 z" fill={accentDeep} opacity="0.6" />
          </svg>
          <span className="serif-italic">My period has begun</span>
        </Link>

        {/* ── 5. MASCOT COMPANION CARD ── */}
        <div
          className="stagger-rise"
          style={{
            background: `linear-gradient(135deg, ${soft} 0%, rgba(180,122,90,0.20) 100%)`,
            borderRadius: 22, padding: '18px',
            display: 'flex', alignItems: 'center', gap: 14,
            animationDelay: '260ms',
          }}
        >
          <div style={{ width: 74, height: 74, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{
              position: 'absolute', inset: 2, borderRadius: 999,
              background: `radial-gradient(circle, rgba(180,122,90,0.20) 0%, transparent 70%)`,
              animation: 'flux-pulse-soft 4s ease-in-out infinite',
            }} aria-hidden />
            <Mascot phase={phase} size={68} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: accentDeep, margin: 0 }}>
              tended with care
            </p>
            <p className="serif-italic" style={{ fontSize: 15, color: '#1F4E4A', margin: '4px 0 0', lineHeight: 1.45, fontWeight: 400, letterSpacing: '-0.1px' }}>
              i am here, <span className="serif-italic">with you</span>, in this phase.
            </p>
          </div>
        </div>

        {/* ── 6. CALENDAR ── */}
        <div
          className="card stagger-rise"
          style={{ borderRadius: 24, padding: '18px 16px 14px', animationDelay: '300ms' }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <p className="serif-italic" style={{ fontSize: 16, fontWeight: 500, color: '#1F4E4A', margin: 0, letterSpacing: '-0.2px' }}>
              your cycle, gently
            </p>
            <span style={{ fontSize: 11, color: '#8FA09E', fontWeight: 500 }}>
              {new Date().toLocaleDateString('en-US', { month: 'long' })}
            </span>
          </div>
          <CycleCalendar
            lastPeriodDate={new Date(lastPeriodDateStr)}
            cycleLengthAvg={profile.cycle_length_avg}
          />
          {daysUntil > 0 && (
            <div style={{
              borderTop: '1px solid rgba(31,78,74,0.08)',
              marginTop: 12, paddingTop: 12,
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              fontSize: 12, color: '#8FA09E',
            }}>
              <span>next bleed in <span className="serif-italic" style={{ color: accentDeep, fontWeight: 500 }}>{daysUntil} days</span></span>
            </div>
          )}
        </div>

        {/* ── 7. PHASE TIPS ── */}
        <div className="stagger-rise" style={{ animationDelay: '340ms' }}>
          <PhaseCard phaseResult={phaseResult} phaseData={phaseData} />
        </div>

        {/* Pattern teaser */}
        {(logCount ?? 0) >= 7 && (logCount ?? 0) < 84 && (
          <p className="text-center text-[12px]" style={{ color: '#8FA09E' }}>
            Keep logging — patterns appear after 3 cycles.
          </p>
        )}

        {/* Sign-off */}
        <div style={{ textAlign: 'center', padding: '12px 0 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <span style={{ width: 20, height: 1, background: 'rgba(31,78,74,0.12)' }} />
          <span className="serif-italic" style={{ fontSize: 12, color: '#8FA09E', letterSpacing: '0.06em' }}>tended with care · flux</span>
          <span style={{ width: 20, height: 1, background: 'rgba(31,78,74,0.12)' }} />
        </div>

      </div>

      <BottomNav phase={phase} />
    </div>
  )
}
