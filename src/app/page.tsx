import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { calculatePhase } from '@/lib/phaseEngine'
import { getPhaseData } from '@/lib/phases'
import { detectCycleAnomalies } from '@/lib/anomalyDetection'
import PhaseCard from '@/components/phase/PhaseCard'
import AnomalyBanner from '@/components/anomaly/AnomalyBanner'
import StartButton from '@/components/StartButton'
import type { AnomalyFlag } from '@/components/anomaly/AnomalyBanner'
import type { UserProfile, DailyLog } from '@/types/database'

export default async function HomePage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

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

  // Fetch today's log status and total log count in parallel
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

  // Anomaly detection
  const periodDates = (cycleLogsData ?? []).map(
    (r: { period_start_date: string }) => r.period_start_date,
  )
  const detectedTypes = detectCycleAnomalies(periodDates)

  const { data: existingFlagsData } = await supabase
    .from('anomaly_flags')
    .select('id, flag_type')
    .eq('user_id', user.id)
    .is('dismissed_at', null)

  const existingFlags = (existingFlagsData ?? []) as AnomalyFlag[]
  const existingFlagTypes = new Set(existingFlags.map((f) => f.flag_type))

  const newFlagTypes = detectedTypes.filter((t) => !existingFlagTypes.has(t))
  let anomalyFlags = existingFlags

  if (newFlagTypes.length > 0) {
    const { data: inserted } = await supabase
      .from('anomaly_flags')
      .insert(newFlagTypes.map((flag_type) => ({ user_id: user.id, flag_type })))
      .select('id, flag_type')

    if (inserted) {
      anomalyFlags = [...existingFlags, ...(inserted as AnomalyFlag[])]
    }
  }

  let phaseResult
  try {
    phaseResult = calculatePhase(
      new Date(lastPeriodDateStr),
      profile.cycle_length_avg,
    )
  } catch {
    redirect('/onboarding')
  }

  const phaseData = getPhaseData(phaseResult.phase)

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 px-4">
      <PhaseCard
        displayName={profile.display_name}
        phaseResult={phaseResult}
        phaseData={phaseData}
      />

      <AnomalyBanner flags={anomalyFlags} />

      {/* Pattern teaser — shown after 7 days of logging, before 3 cycles worth */}
      {(logCount ?? 0) >= 7 && (logCount ?? 0) < 84 && (
        <div className="max-w-sm mx-auto px-1 pb-3">
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            Keep logging — after 3 cycles, Flux will show you your personal patterns.
          </p>
        </div>
      )}

      {/* Daily log CTA */}
      <div className="max-w-sm mx-auto pb-4">
        <Link
          href="/log"
          className={`flex items-center justify-center w-full min-h-[52px] rounded-2xl font-semibold text-sm transition-opacity ${
            loggedToday
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
              : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
          }`}
        >
          {loggedToday ? 'Logged today ✓' : 'Log how you feel'}
        </Link>
      </div>

      {/* Bottom nav links */}
      <div className="max-w-sm mx-auto pb-10 flex items-center justify-center gap-6">
        <Link href="/history"  className="text-xs text-gray-400 dark:text-gray-500 underline underline-offset-2">History</Link>
        <Link href="/partner"  className="text-xs text-gray-400 dark:text-gray-500 underline underline-offset-2">Partner</Link>
        <Link href="/settings" className="text-xs text-gray-400 dark:text-gray-500 underline underline-offset-2">Settings</Link>
      </div>
    </main>
  )
}
