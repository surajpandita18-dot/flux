'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { PartnerConnection } from '@/types/database'

interface Props {
  connections: PartnerConnection[]
}

export default function PartnerAccessManager({ connections }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function toggleAccess(id: string, current: boolean) {
    setLoading(id)
    const supabase = createClient()
    await supabase
      .from('partner_connections')
      .update({ is_active: !current })
      .eq('id', id)
    setLoading(null)
    router.refresh()
  }

  async function revoke(id: string) {
    setLoading(id)
    const supabase = createClient()
    await supabase
      .from('partner_connections')
      .delete()
      .eq('id', id)
    setLoading(null)
    router.refresh()
  }

  return (
    <div className="space-y-2">
      {connections.map((c) => (
        <div
          key={c.id}
          className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                {c.partner_email}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {c.is_active ? 'Active — sees phase card' : 'Paused'}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                disabled={loading === c.id}
                onClick={() => toggleAccess(c.id, c.is_active)}
                className={`min-h-[36px] px-3 text-xs font-semibold rounded-xl transition-colors disabled:opacity-40 ${
                  c.is_active
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                    : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                }`}
              >
                {c.is_active ? 'Pause' : 'Resume'}
              </button>

              <button
                type="button"
                disabled={loading === c.id}
                onClick={() => revoke(c.id)}
                className="min-h-[36px] px-3 text-xs font-semibold rounded-xl text-red-500 bg-red-50 dark:bg-red-950 dark:text-red-400 disabled:opacity-40"
              >
                Revoke
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
