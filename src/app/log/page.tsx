import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { calculatePhase } from '@/lib/phaseEngine'
import DailyLogForm from '@/components/daily/DailyLogForm'
import type { UserProfile, DailyLog } from '@/types/database'

export default async function LogPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data: profileData } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  const profile = profileData as UserProfile | null

  if (!profile) redirect('/onboarding')

  const lastPeriodDateStr = profile.last_period_date
  if (!lastPeriodDateStr) redirect('/onboarding')

  const todayIso = new Date().toISOString().split('T')[0] ?? ''

  const { data: existingLogData } = await supabase
    .from('daily_logs')
    .select('id, energy_level, mood, symptoms')
    .eq('user_id', user.id)
    .eq('log_date', todayIso)
    .maybeSingle()

  const existingLog = existingLogData as Pick<
    DailyLog,
    'id' | 'energy_level' | 'mood' | 'symptoms'
  > | null

  const phaseResult = calculatePhase(
    new Date(lastPeriodDateStr),
    profile.cycle_length_avg,
  )

  // Already logged today — show summary
  if (existingLog) {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-950 px-4">
        <div className="max-w-sm mx-auto pt-10 space-y-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Today&apos;s log ✓
          </h1>
          <div className="rounded-2xl bg-gray-50 dark:bg-gray-900 p-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Energy</span>
              <span className="font-medium text-gray-800 dark:text-gray-100 capitalize">
                {existingLog.energy_level}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Mood</span>
              <span className="font-medium text-gray-800 dark:text-gray-100 capitalize">
                {existingLog.mood}
              </span>
            </div>
            {existingLog.symptoms && existingLog.symptoms.length > 0 && (
              <div className="text-sm">
                <span className="text-gray-400 block mb-1">Symptoms</span>
                <span className="text-gray-700 dark:text-gray-200">
                  {existingLog.symptoms.join(', ')}
                </span>
              </div>
            )}
          </div>
          <a
            href="/"
            className="block text-center text-sm text-gray-400 underline underline-offset-2 mt-4"
          >
            Back to home
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <DailyLogForm
        userId={user.id}
        phase={phaseResult.phase}
        todayIso={todayIso}
      />
    </main>
  )
}
