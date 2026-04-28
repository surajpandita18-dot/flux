import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { calculatePhase } from '@/lib/phaseEngine'
import DailyLogForm from '@/components/daily/DailyLogForm'
import type { UserProfile, DailyLog } from '@/types/database'

const ENERGY_EMOJI: Record<string, string> = {
  low: '🪫', medium: '🔋', high: '⚡',
}

export default async function LogPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const todayIso = new Date().toISOString().split('T')[0] ?? ''

  // Parallel: profile and today's log only need user.id
  const [{ data: profileData }, { data: existingLogData }] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('daily_logs')
      .select('id, energy_level, mood, symptoms')
      .eq('user_id', user.id)
      .eq('log_date', todayIso)
      .maybeSingle(),
  ])

  const profile    = profileData as UserProfile | null
  const existingLog = existingLogData as Pick<DailyLog, 'id' | 'energy_level' | 'mood' | 'symptoms'> | null

  if (!profile) redirect('/onboarding')

  const lastPeriodDateStr = profile.last_period_date
  if (!lastPeriodDateStr) redirect('/onboarding')

  const phaseResult = calculatePhase(new Date(lastPeriodDateStr), profile.cycle_length_avg)

  if (existingLog) {
    return (
      <main className="min-h-screen bg-surface dark:bg-surface-dark px-4">
        <div className="max-w-sm mx-auto pt-12 pb-10 space-y-5">

          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Today&apos;s check-in
            </h1>
            <Link href="/" className="text-sm text-gray-400 underline underline-offset-2">
              Home
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-soft p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="section-label">Energy</span>
              <span className="text-lg">
                {ENERGY_EMOJI[existingLog.energy_level] ?? ''}{' '}
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 capitalize ml-1">
                  {existingLog.energy_level}
                </span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="section-label">Mood</span>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 capitalize">
                {existingLog.mood}
              </span>
            </div>

            {existingLog.symptoms && existingLog.symptoms.length > 0 && (
              <div className="space-y-2">
                <span className="section-label block">Symptoms</span>
                <div className="flex flex-wrap gap-1.5">
                  {existingLog.symptoms.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-gray-400">
            Already logged for today. See you tomorrow.
          </p>

        </div>
      </main>
    )
  }

  return (
    <DailyLogForm
      userId={user.id}
      phase={phaseResult.phase}
      todayIso={todayIso}
    />
  )
}
