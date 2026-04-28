'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function StartButton() {
  const [loading, setLoading] = useState(false)

  async function handleStart() {
    setLoading(true)
    try {
      const supabase = createClient()
      await supabase.auth.signInAnonymously()
      window.location.href = '/onboarding'
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="phase-header-landing min-h-screen flex flex-col">

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-7 pt-safe">
        <div className="max-w-sm mx-auto w-full">

          {/* Wordmark */}
          <div className="mb-3">
            <h1 className="text-white text-[56px] font-black tracking-[-2px] leading-none">
              Flux
            </h1>
          </div>

          <p className="text-white/75 text-[18px] leading-relaxed font-medium max-w-[240px]">
            Know yourself.<br />Move with your cycle.
          </p>
        </div>
      </div>

      {/* Bottom sheet */}
      <div className="bg-surface dark:bg-surface-dark rounded-t-[2rem] px-6 pt-8 pb-10">
        <div className="max-w-sm mx-auto space-y-4">

          <button
            type="button"
            onClick={handleStart}
            disabled={loading}
            className="w-full min-h-[56px] bg-gray-950 dark:bg-white text-white dark:text-gray-900 font-bold text-[16px] rounded-2xl tracking-tight transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Starting…' : 'Get started'}
          </button>

          <p className="text-xs text-gray-400 text-center leading-relaxed">
            No email or password needed. Your data is private.
          </p>

        </div>
      </div>

    </div>
  )
}
