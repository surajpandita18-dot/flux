import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CycleHistoryView from '@/components/history/CycleHistoryView'
import BottomNav from '@/components/nav/BottomNav'
import type { CycleLog, DailyLog } from '@/types/database'

export default async function HistoryPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const [{ data: cyclesData }, { data: logsData }] = await Promise.all([
    supabase
      .from('cycle_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('period_start_date', { ascending: false })
      .limit(12),
    supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('log_date', { ascending: false })
      .limit(14),
  ])

  const cycles     = (cyclesData ?? []) as CycleLog[]
  const recentLogs = (logsData   ?? []) as DailyLog[]

  return (
    <main className="min-h-screen pb-24 page-enter" style={{ backgroundColor: '#F7F1E9' }}>

      {/* Radial wash */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: 'radial-gradient(110% 70% at 20% 0%, #F8DFD3 0%, transparent 65%), radial-gradient(80% 60% at 100% 10%, rgba(232,163,61,0.14) 0%, transparent 60%)',
        }}
        aria-hidden
      />

      <div className="relative z-10 max-w-sm mx-auto px-4">

        {/* Header */}
        <div className="pt-14 pb-2 stagger-rise">
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.32em', textTransform: 'uppercase', color: '#1F4E4A', margin: 0 }}>
            your cycles
          </p>
          <h1 className="serif" style={{ fontSize: 30, fontWeight: 500, letterSpacing: '-0.6px', color: '#1F4E4A', margin: '8px 0 0', lineHeight: 1.05 }}>
            The shape of <span className="serif-italic" style={{ color: '#B97A1F' }}>recent months</span>.
          </h1>
          <p style={{ fontSize: 14, color: '#3F5A57', margin: '10px 0 14px', lineHeight: 1.55, fontWeight: 400 }}>
            Patterns matter more than days. Here&apos;s what we see.
          </p>
        </div>

        {cycles.length === 0 ? (
          <div className="card p-8 text-center space-y-2 stagger-rise" style={{ animationDelay: '60ms' }}>
            <p className="serif-italic" style={{ fontSize: 18, color: '#1F4E4A' }}>No cycles yet</p>
            <p style={{ fontSize: 13, color: '#8FA09E', lineHeight: 1.6 }}>
              Log your first period to start building your history.
            </p>
          </div>
        ) : (
          <CycleHistoryView cycles={cycles} recentLogs={recentLogs} />
        )}

      </div>

      <BottomNav />
    </main>
  )
}
