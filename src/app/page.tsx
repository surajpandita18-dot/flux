import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { calculatePhase } from '@/lib/phaseEngine'
import { getPhaseData } from '@/lib/phases'
import { detectCycleAnomalies } from '@/lib/anomalyDetection'
import PhaseCard from '@/components/phase/PhaseCard'
import PhaseRing from '@/components/phase/PhaseRing'
import AnomalyBanner from '@/components/anomaly/AnomalyBanner'
import CycleCalendar from '@/components/calendar/CycleCalendar'
import BottomNav from '@/components/nav/BottomNav'
import StartButton from '@/components/StartButton'
import type { AnomalyFlag } from '@/components/anomaly/AnomalyBanner'
import type { UserProfile, DailyLog } from '@/types/database'

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
    <div className="min-h-screen pb-28" style={{ backgroundColor: '#FBF8F5' }}>
      <div className="max-w-sm mx-auto px-4 pt-12 space-y-3">

        {/* ── Greeting ─────────────────────────────── */}
        <div className="px-1 pb-1">
          <h1 className="text-[28px] font-extrabold tracking-tight" style={{ color: '#1A1814' }}>
            Hi, {firstName}
          </h1>
          <p className="text-[14px] mt-0.5" style={{ color: '#A8A4A0' }}>
            How do you feel today?
          </p>
        </div>

        {/* ── Anomaly banner ───────────────────────── */}
        <AnomalyBanner flags={anomalyFlags} />

        {/* ── Phase ring — hero ────────────────────── */}
        <PhaseRing phaseResult={phaseResult} />

        {/* ── CTAs ─────────────────────────────────── */}
        <div className="space-y-2">
          <Link
            href="/log"
            className={`flex items-center justify-center w-full min-h-[54px] rounded-2xl font-bold text-[15px] transition-all active:scale-[0.98] ${
              loggedToday
                ? 'shadow-soft'
                : 'shadow-card'
            }`}
            style={loggedToday
              ? { backgroundColor: '#FFFFFF', color: '#A8A4A0' }
              : { backgroundColor: '#1A1814', color: '#FFFFFF' }
            }
          >
            {loggedToday ? 'Checked in today ✓' : 'Check in now'}
          </Link>

          <Link
            href="/period"
            className="btn-rose"
          >
            <span>🩸</span>
            <span>My period started</span>
          </Link>
        </div>

        {/* ── Calendar ─────────────────────────────── */}
        <CycleCalendar
          lastPeriodDate={new Date(lastPeriodDateStr)}
          cycleLengthAvg={profile.cycle_length_avg}
          phase={phaseResult.phase}
        />

        {/* ── Tips (collapsible) ───────────────────── */}
        <PhaseCard phaseResult={phaseResult} phaseData={phaseData} />

        {/* ── Pattern teaser ───────────────────────── */}
        {(logCount ?? 0) >= 7 && (logCount ?? 0) < 84 && (
          <p className="text-center text-xs py-1" style={{ color: '#A8A4A0' }}>
            Keep logging — patterns appear after 3 cycles.
          </p>
        )}

      </div>

      <BottomNav />
    </div>
  )
}
