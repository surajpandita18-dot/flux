import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CycleHistoryList from '@/components/history/CycleHistoryList'
import type { CycleLog } from '@/types/database'

export default async function HistoryPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data } = await supabase
    .from('cycle_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('period_start_date', { ascending: false })
    .limit(12)

  const cycles = (data ?? []) as CycleLog[]

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 px-4">
      <div className="max-w-sm mx-auto pt-6 pb-10">

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Cycle history
          </h1>
          <Link href="/" className="text-sm text-gray-400 underline underline-offset-2">
            Home
          </Link>
        </div>

        {cycles.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <p className="text-gray-400 text-sm">No cycles logged yet.</p>
            <p className="text-gray-300 dark:text-gray-600 text-xs">
              Log your first period to start tracking history.
            </p>
          </div>
        ) : (
          <CycleHistoryList cycles={cycles} />
        )}

      </div>
    </main>
  )
}
