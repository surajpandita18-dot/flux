import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PartnerInviteForm from '@/components/partner/PartnerInviteForm'
import type { PartnerConnection } from '@/types/database'

export default async function PartnerPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data: connectionsData } = await supabase
    .from('partner_connections')
    .select('id, partner_email, is_active, invited_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const connections = (connectionsData ?? []) as Pick<
    PartnerConnection,
    'id' | 'partner_email' | 'is_active' | 'invited_at'
  >[]

  return (
    <main className="min-h-screen bg-surface dark:bg-surface-dark px-4">
      <div className="max-w-sm mx-auto pt-10 pb-12 space-y-8">

        <div>
          <Link
            href="/"
            className="text-xs text-gray-400 underline underline-offset-2"
          >
            Back to home
          </Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-4 mb-1">
            Partner access
          </h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            You control who sees your phase card. They see context and tips — never your raw cycle data.
          </p>
        </div>

        {connections.length > 0 && (
          <section className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Connected partners
            </p>
            <div className="space-y-2">
              {connections.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-2xl bg-gray-50 dark:bg-gray-900 px-4 py-3"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-200 truncate mr-3">
                    {c.partner_email}
                  </span>
                  <span
                    className={`text-xs font-medium shrink-0 ${
                      c.is_active
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-400'
                    }`}
                  >
                    {c.is_active ? 'Active' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Add a partner
          </p>
          <PartnerInviteForm ownerUserId={user.id} />
        </section>

      </div>
    </main>
  )
}
