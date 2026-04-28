import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { calculatePhase } from '@/lib/phaseEngine'
import { getPhaseData } from '@/lib/phases'
import { detectCycleAnomalies } from '@/lib/anomalyDetection'
import type { Phase } from '@/lib/phaseEngine'
import PhaseCard from '@/components/phase/PhaseCard'
import AnomalyBanner from '@/components/anomaly/AnomalyBanner'
import CycleCalendar from '@/components/calendar/CycleCalendar'
import Mascot from '@/components/mascot/Mascot'
import BottomNav from '@/components/nav/BottomNav'
import StartButton from '@/components/StartButton'
import type { AnomalyFlag } from '@/components/anomaly/AnomalyBanner'
import type { UserProfile, DailyLog } from '@/types/database'

const phaseHeaderClass: Record<Phase, string> = {
  menstrual:  'phase-header-menstrual',
  follicular: 'phase-header-follicular',
  ovulation:  'phase-header-ovulation',
  luteal:     'phase-header-luteal',
}

const phaseColorClass: Record<Phase, string> = {
  menstrual:  'text-menstrual',
  follicular: 'text-follicular',
  ovulation:  'text-ovulation',
  luteal:     'text-luteal',
}

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
    supabase
      .from('daily_logs')
      .select('id')
      .eq('user_id', user.id)
      .eq('log_date', todayIso)
      .maybeSingle(),
    supabase
      .from('daily_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase
      .from('cycle_logs')
      .select('period_start_date')
      .eq('user_id', user.id)
      .order('period_start_date', { ascending: true }),
  ])

  const loggedToday = (logData as Pick<DailyLog, 'id'> | null) !== null

  const periodDates  = (cycleLogsData ?? []).map(
    (r: { period_start_date: string }) => r.period_start_date,
  )
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
  const dow        = new Date().toLocaleDateString('en-US', { weekday: 'long' })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ── Gradient header ──────────────────────── */}
      <div className={`${phaseHeaderClass[phaseResult.phase]} relative`}>
        <div className="max-w-sm mx-auto px-5 pt-14 pb-24">

          {/* Greeting */}
          <p className="text-white/60 text-[13px] font-semibold">
            {dow} · Hey, {firstName}
          </p>

          {/* Phase name — hero moment */}
          <h1 className="text-white text-[44px] font-black tracking-[-1.5px] leading-none mt-2">
            {phaseData.name}
          </h1>

          <p className="text-white/65 text-[13px] font-medium mt-2">
            Day {phaseResult.dayNumber} of {phaseResult.totalDays}
          </p>

          {/* Mascot — absolute right */}
          <div className="absolute right-5 bottom-5">
            <Mascot phase={phaseResult.phase} className="w-28 h-28" />
          </div>
        </div>
      </div>

      {/* ── Content sheet ─────────────────────────── */}
      <div className="relative -mt-10 rounded-t-[2rem] bg-gray-50 dark:bg-gray-950 min-h-[60vh] pb-36">
        <div className="max-w-sm mx-auto px-4 pt-5 space-y-3">

          {/* Anomaly banner */}
          <AnomalyBanner flags={anomalyFlags} />

          {/* Phase card (stats + tips) */}
          <PhaseCard phaseResult={phaseResult} phaseData={phaseData} />

          {/* Calendar */}
          <CycleCalendar
            lastPeriodDate={new Date(lastPeriodDateStr)}
            cycleLengthAvg={profile.cycle_length_avg}
            phase={phaseResult.phase}
          />

          {/* Pattern teaser */}
          {(logCount ?? 0) >= 7 && (logCount ?? 0) < 84 && (
            <p className="text-center text-xs text-gray-400 dark:text-gray-600 py-1">
              Keep logging — patterns appear after 3 cycles.
            </p>
          )}

          {/* CTAs */}
          <div className="space-y-2 pt-1">
            <Link
              href="/log"
              className={`flex items-center justify-center w-full min-h-[54px] rounded-2xl font-bold text-[15px] transition-all active:scale-[0.98] ${
                loggedToday
                  ? 'bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-500 shadow-soft'
                  : 'bg-gray-950 dark:bg-white text-white dark:text-gray-900 shadow-lift'
              }`}
            >
              {loggedToday ? 'Checked in today ✓' : 'Check in now'}
            </Link>

            <Link
              href="/period"
              className={`flex items-center justify-center gap-2 w-full min-h-[48px] rounded-2xl font-semibold text-[14px] border-2 transition-all active:scale-[0.98] ${phaseColorClass.menstrual} border-menstrual/30 bg-menstrual-soft dark:bg-menstrual-soft-dark`}
            >
              <span className="text-base">🩸</span>
              <span>Period started today</span>
            </Link>
          </div>

        </div>
      </div>

      <BottomNav />
    </div>
  )
}
