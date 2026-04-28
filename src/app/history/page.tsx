import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CycleHistoryList from '@/components/history/CycleHistoryList'
import BottomNav from '@/components/nav/BottomNav'
import type { CycleLog } from '@/types/database'

export default async function HistoryPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data } = await supabase
    .from('cycle_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('period_start_date', { ascending: false })
    .limit(12)

  const cycles = (data ?? []) as CycleLog[]

  return (
    <main className="min-h-screen bg-surface dark:bg-surface-dark pb-24">
      <div className="max-w-sm mx-auto px-4">

        <div className="pt-14 pb-6">
          <p className="section-label mb-1">Flux</p>
          <h1 className="text-[32px] font-black tracking-tight text-gray-900 dark:text-white">
            Cycle history
          </h1>
        </div>

        {cycles.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-soft p-8 text-center space-y-2">
            <p className="text-3xl">📅</p>
            <p className="font-semibold text-gray-700 dark:text-gray-200">No cycles yet</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Log your first period to start building your history.
            </p>
          </div>
        ) : (
          <CycleHistoryList cycles={cycles} />
        )}

      </div>
      <BottomNav />
    </main>
  )
}
