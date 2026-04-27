'use client'

import { useState } from 'react'

interface Props {
  ownerUserId: string
}

export default function PartnerInviteForm({ ownerUserId }: Props) {
  const [email,    setEmail]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [addedEmail, setAddedEmail] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)

    const res = await fetch('/api/partner/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json() as { error?: string }
      setError(data.error ?? 'Something went wrong.')
      return
    }

    const baseUrl = window.location.origin
    const partnerViewUrl = `${baseUrl}/partner/view/${ownerUserId}`
    const message =
      `Hey! I'm sharing my cycle phase with you on Flux so you always know what kind of week it is for me.\n\nSee my phase here: ${partnerViewUrl}\n\nYou'll need to sign in with this email address.`

    setAddedEmail(email.trim())
    setShareUrl(`https://wa.me/?text=${encodeURIComponent(message)}`)
  }

  if (shareUrl) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-4 space-y-3">
          <p className="text-sm font-semibold text-green-800 dark:text-green-300">
            Partner added.
          </p>
          <p className="text-xs text-green-700 dark:text-green-400 leading-relaxed">
            Now send them the link on WhatsApp. They&apos;ll sign in with{' '}
            <span className="font-medium">{addedEmail}</span> to see your phase card.
          </p>
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full min-h-[48px] bg-green-600 hover:bg-green-700 text-white rounded-2xl text-sm font-semibold transition-colors"
          >
            Share on WhatsApp
          </a>
        </div>
        <button
          type="button"
          onClick={() => { setShareUrl(null); setEmail(''); setAddedEmail('') }}
          className="text-xs text-gray-400 underline underline-offset-2 block mx-auto"
        >
          Add another partner
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Partner's email address"
        required
        autoComplete="email"
        className="w-full min-h-[52px] px-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 placeholder-gray-400"
      />
      {error && (
        <p className="text-red-600 dark:text-red-400 text-xs" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading || !email.trim()}
        className="w-full min-h-[52px] bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-2xl text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
      >
        {loading ? 'Saving...' : 'Add partner'}
      </button>
    </form>
  )
}
