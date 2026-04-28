import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { calculatePhase } from '@/lib/phaseEngine'
import DailyLogForm from '@/components/daily/DailyLogForm'
import BottomNav from '@/components/nav/BottomNav'
import type { UserProfile, DailyLog } from '@/types/database'


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
      <main className="min-h-screen px-4 pb-28 page-enter" style={{ backgroundColor: '#F7F1E9' }}>
        <div className="max-w-sm mx-auto pt-12 pb-10 space-y-5">

          <div className="flex items-center justify-between">
            <h1 className="text-[24px] font-semibold serif-italic" style={{ color: '#1F4E4A' }}>
              Today&apos;s check-in
            </h1>
            <Link href="/" className="text-[12px] underline underline-offset-2" style={{ color: '#8FA09E' }}>
              Home
            </Link>
          </div>

          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="section-label">Energy</span>
              <span className="text-[14px] font-semibold capitalize" style={{ color: '#3F5A57' }}>
                {existingLog.energy_level}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="section-label">Mood</span>
              <span className="text-[14px] font-semibold capitalize" style={{ color: '#3F5A57' }}>
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
                      className="px-2.5 py-1 rounded-full text-[12px] font-medium"
                      style={{ background: '#F2E8D9', color: '#3F5A57' }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <p className="text-center text-[12px]" style={{ color: '#8FA09E' }}>
            Already logged for today. See you tomorrow.
          </p>

        </div>
        <BottomNav />
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
