import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PartnerAccessManager from '@/components/settings/PartnerAccessManager'
import NotificationToggle from '@/components/settings/NotificationToggle'
import type { PartnerConnection } from '@/types/database'

export default async function SettingsPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data } = await supabase
    .from('partner_connections')
    .select('*')
    .eq('user_id', user.id)
    .order('invited_at', { ascending: false })

  const connections = (data ?? []) as PartnerConnection[]

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 px-4">
      <div className="max-w-sm mx-auto pt-6 pb-12 space-y-8">

        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <Link href="/" className="text-sm text-gray-400 underline underline-offset-2">
            Home
          </Link>
        </div>

        {/* Partner access */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Partner access
            </p>
            <Link
              href="/partner"
              className="text-xs text-gray-500 underline underline-offset-2"
            >
              + Invite
            </Link>
          </div>

          {connections.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
              <p className="text-sm text-gray-400">
                No partners added yet.{' '}
                <Link href="/partner" className="underline underline-offset-2">
                  Invite someone
                </Link>
              </p>
            </div>
          ) : (
            <PartnerAccessManager connections={connections} />
          )}

          <p className="text-xs text-gray-300 dark:text-gray-600 leading-relaxed">
            Partners only see your current phase card — never your raw logs or dates.
            You can revoke access anytime.
          </p>
        </section>

        {/* Notifications */}
        <section className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Reminders
          </p>
          <NotificationToggle />
          <p className="text-xs text-gray-300 dark:text-gray-600 leading-relaxed">
            Daily reminder to log how you feel. Only fires if you haven&apos;t logged today.
          </p>
        </section>

        {/* Account */}
        <section className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Account
          </p>
          <div className="text-sm text-gray-400">
            Signed in as{' '}
            <span className="text-gray-600 dark:text-gray-300 font-medium">
              {user.email}
            </span>
          </div>
        </section>

      </div>
    </main>
  )
}
