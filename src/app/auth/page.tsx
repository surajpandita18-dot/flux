'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })

    setLoading(false)

    if (authError) { setError(authError.message); return }
    setSent(true)
  }

  if (sent) {
    return (
      <main className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
        <div className="phase-header-landing h-40 rounded-b-[2rem]" />
        <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-8">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-card p-8 max-w-sm w-full text-center space-y-3">
            <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto">
              <span className="text-2xl">✉️</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Check your inbox
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              We sent a sign-in link to{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-200">{email}</span>.
              Tap it to continue — no password needed.
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Header strip */}
      <div className="phase-header-landing px-6 pt-16 pb-16 rounded-b-[2rem]">
        <h1 className="text-white text-[40px] font-black tracking-[-1.5px] leading-none">Flux</h1>
        <p className="text-white/70 text-sm mt-2 font-medium">Sign in to continue</p>
      </div>

      {/* Form card */}
      <div className="flex-1 px-5 -mt-6">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-card p-6 max-w-sm mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="section-label block">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
              />
            </div>

            {error && (
              <p className="text-red-600 dark:text-red-400 text-sm" role="alert">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-1"
            >
              {loading ? 'Sending…' : 'Send sign-in link'}
            </button>
          </form>

          <p className="text-xs text-gray-400 mt-5 text-center leading-relaxed">
            One-tap link to your inbox. No password, no spam.
          </p>
        </div>
      </div>
    </main>
  )
}
