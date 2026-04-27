'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function StartButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleStart() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signInAnonymously()
    router.push('/onboarding')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center px-6">
      <div className="max-w-sm w-full space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Flux</h1>
          <p className="text-gray-400 text-base leading-relaxed">
            Your cycle, understood.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStart}
          disabled={loading}
          className="w-full min-h-[52px] bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-2xl px-4 disabled:opacity-50"
        >
          {loading ? 'Starting…' : 'Get started'}
        </button>

        <p className="text-xs text-gray-300 dark:text-gray-600">
          No account needed. Your data stays private.
        </p>
      </div>
    </div>
  )
}
