import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PartnerAccessManager from '@/components/settings/PartnerAccessManager'
import NotificationToggle from '@/components/settings/NotificationToggle'
import BottomNav from '@/components/nav/BottomNav'
import type { PartnerConnection } from '@/types/database'

export default async function SettingsPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data } = await supabase
    .from('partner_connections')
    .select('*')
    .eq('user_id', user.id)
    .order('invited_at', { ascending: false })

  const connections = (data ?? []) as PartnerConnection[]

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      <div className="max-w-sm mx-auto px-4">

        <div className="pt-14 pb-6">
          <p className="section-label mb-1">Flux</p>
          <h1 className="text-[32px] font-black tracking-tight text-gray-900 dark:text-white">
            Settings
          </h1>
        </div>

        <div className="space-y-3">

          {/* Partner access */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-soft p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="section-label">Partner access</p>
              <Link
                href="/partner"
                className="text-xs font-semibold text-gray-500 dark:text-gray-400 underline underline-offset-2"
              >
                + Invite
              </Link>
            </div>

            {connections.length === 0 ? (
              <p className="text-sm text-gray-400 leading-relaxed">
                No partners added.{' '}
                <Link href="/partner" className="underline underline-offset-2 text-gray-600 dark:text-gray-300">
                  Invite someone
                </Link>
              </p>
            ) : (
              <PartnerAccessManager connections={connections} />
            )}

            <p className="text-xs text-gray-400 leading-relaxed">
              Partners only see your current phase card — never your raw logs or dates.
              You can revoke access any time.
            </p>
          </div>

          {/* Reminders */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-soft p-5 space-y-3">
            <p className="section-label">Daily reminder</p>
            <NotificationToggle />
            <p className="text-xs text-gray-400 leading-relaxed">
              Fires once a day if you haven&apos;t checked in yet. No other notifications.
            </p>
          </div>

          {/* Account */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-soft p-5 space-y-2">
            <p className="section-label">Account</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Signed in as{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {user.email ?? 'anonymous'}
              </span>
            </p>
          </div>

        </div>
      </div>
      <BottomNav />
    </main>
  )
}
