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
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setLoading(false)

    if (authError) {
      setError(authError.message)
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-950">
        <div className="max-w-sm w-full text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <span className="text-xl">✉️</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Check your email
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
            We sent a magic link to{' '}
            <span className="font-medium text-gray-700 dark:text-gray-200">{email}</span>.
            Click it to sign in — no password needed.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col justify-center p-6 bg-white dark:bg-gray-950">
      <div className="max-w-sm mx-auto w-full">

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
          Flux
        </h1>
        <p className="text-gray-400 text-sm mb-10">
          Your cycle, understood.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
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
              className="w-full min-h-[44px] px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white text-[16px]"
            />
          </div>

          {error && (
            <p className="text-red-600 dark:text-red-400 text-sm" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[44px] bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send magic link'}
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-6 text-center leading-relaxed">
          We&apos;ll email you a one-click sign-in link.
          No password. No spam.
        </p>

      </div>
    </main>
  )
}
