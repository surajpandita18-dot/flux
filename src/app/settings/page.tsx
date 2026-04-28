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
    <main className="min-h-screen pb-24 page-enter" style={{ backgroundColor: '#F7F1E9' }}>
      <div className="max-w-sm mx-auto px-4">

        <div className="pt-14 pb-6">
          <p className="section-label mb-1">Flux</p>
          <h1 className="text-[30px] font-semibold tracking-tight serif-italic" style={{ color: '#1F4E4A' }}>
            Settings
          </h1>
        </div>

        <div className="space-y-3">

          {/* Partner access */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="section-label">Partner access</p>
              <Link
                href="/partner"
                className="text-[12px] font-semibold underline underline-offset-2"
                style={{ color: '#8FA09E' }}
              >
                + Invite
              </Link>
            </div>

            {connections.length === 0 ? (
              <p className="text-[13px] leading-relaxed" style={{ color: '#8FA09E' }}>
                No partners added.{' '}
                <Link href="/partner" className="underline underline-offset-2" style={{ color: '#3F5A57' }}>
                  Invite someone
                </Link>
              </p>
            ) : (
              <PartnerAccessManager connections={connections} />
            )}

            <p className="text-[12px] leading-relaxed" style={{ color: '#8FA09E' }}>
              Partners only see your current phase card — never your raw logs or dates.
              You can revoke access any time.
            </p>
          </div>

          {/* Reminders */}
          <div className="card p-5 space-y-3">
            <p className="section-label">Daily reminder</p>
            <NotificationToggle />
            <p className="text-[12px] leading-relaxed" style={{ color: '#8FA09E' }}>
              Fires once a day if you haven&apos;t checked in yet. No other notifications.
            </p>
          </div>

          {/* Account */}
          <div className="card p-5 space-y-2">
            <p className="section-label">Account</p>
            <p className="text-[13px]" style={{ color: '#8FA09E' }}>
              Signed in as{' '}
              <span className="font-semibold" style={{ color: '#3F5A57' }}>
                {user.email ?? 'anonymous'}
              </span>
            </p>
          </div>

          {/* About */}
          <div className="card p-5 space-y-1">
            <p className="section-label">About</p>
            <p className="text-[13px] leading-relaxed" style={{ color: '#8FA09E' }}>
              Flux — know yourself, move with your cycle.
            </p>
            <p className="text-[11px]" style={{ color: '#C4B8AC' }}>v0.1 · built with care</p>
          </div>

        </div>
      </div>
      <BottomNav />
    </main>
  )
}
