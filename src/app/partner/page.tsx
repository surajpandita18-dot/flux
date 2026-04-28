import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { calculatePhase } from '@/lib/phaseEngine'
import PartnerInviteForm from '@/components/partner/PartnerInviteForm'
import BottomNav from '@/components/nav/BottomNav'
import type { PartnerConnection, UserProfile } from '@/types/database'
import type { Phase } from '@/lib/phaseEngine'

const PHASE_ACCENT: Record<Phase, string> = {
  menstrual:  '#C76B4A',
  follicular: '#7A8F5C',
  ovulation:  '#D49A3D',
  luteal:     '#8B6F8C',
}
const PHASE_ACCENT_DEEP: Record<Phase, string> = {
  menstrual:  '#9B4F33',
  follicular: '#566B3F',
  ovulation:  '#9C6E1F',
  luteal:     '#604660',
}
const PHASE_SOFT: Record<Phase, string> = {
  menstrual:  '#F8DFD3',
  follicular: '#E4E8D6',
  ovulation:  '#F5E6C2',
  luteal:     '#E5DCE5',
}
const GUIDANCE: Record<Phase, { headline: string; kindnesses: string[] }> = {
  menstrual: {
    headline: 'today, she may want quiet.',
    kindnesses: [
      'Tea, a hot water bottle, no plans.',
      "Don't ask if she's okay — ask what she's watching.",
      "If she's quiet, it isn't about you.",
    ],
  },
  follicular: {
    headline: 'something in her is rising.',
    kindnesses: [
      'Make plans. She has the energy now.',
      'Ask about an idea — she wants to think out loud.',
      'A walk together would land beautifully.',
    ],
  },
  ovulation: {
    headline: 'she is luminous today.',
    kindnesses: [
      'Tell her she looks beautiful. Mean it.',
      'Make a date of it — she is most playful now.',
      'Match her energy. Not all weeks are like this.',
    ],
  },
  luteal: {
    headline: 'she is turning inward.',
    kindnesses: [
      'Take one thing off her plate without asking.',
      'Be patient. Her tolerance is thinner now.',
      'Soft food, early nights, no big decisions.',
    ],
  },
}

export default async function PartnerPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const [{ data: profileData }, { data: connectionsData }] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('user_id', user.id).maybeSingle(),
    supabase.from('partner_connections').select('id, partner_email, is_active, invited_at')
      .eq('user_id', user.id).order('created_at', { ascending: false }),
  ])

  const profile = profileData as UserProfile | null
  const connections = (connectionsData ?? []) as Pick<PartnerConnection, 'id' | 'partner_email' | 'is_active' | 'invited_at'>[]

  let phase: Phase = 'luteal'
  if (profile?.last_period_date) {
    try {
      const pr = calculatePhase(new Date(profile.last_period_date), profile.cycle_length_avg)
      phase = pr.phase
    } catch {}
  }

  const accent     = PHASE_ACCENT[phase]
  const accentDeep = PHASE_ACCENT_DEEP[phase]
  const soft       = PHASE_SOFT[phase]
  const guidance   = GUIDANCE[phase]

  return (
    <main className="min-h-screen pb-24 page-enter" style={{ backgroundColor: '#F7F1E9' }}>

      {/* Radial wash */}
      <div className="pointer-events-none fixed inset-0 z-0" style={{ background: `radial-gradient(120% 80% at 50% 0%, ${soft} 0%, #F7F1E9 70%)` }} aria-hidden />

      <div className="relative z-10 max-w-sm mx-auto px-4">

        {/* Header */}
        <div className="pt-14 pb-2 stagger-rise">
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: accentDeep, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M7 12 S1.8 8.5 1.8 5.5 a 2.4 2.4 0 0 1 5.2 -0.7 a 2.4 2.4 0 0 1 5.2 0.7 c0 3 -5.2 6.5 -5.2 6.5 z" fill={accentDeep} />
            </svg>
            For your partner, with love
          </p>
          <h1 className="serif" style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.6px', color: '#1F4E4A', margin: '8px 0 0', lineHeight: 1.05 }}>
            How to <span className="serif-italic">show up</span>
          </h1>
          <p className="serif-italic" style={{ fontSize: 15, color: '#3F5A57', margin: '10px 0 0', lineHeight: 1.55, fontWeight: 400 }}>
            A gentle map of what she&apos;s holding today.
          </p>
        </div>

        <div className="flex flex-col gap-3.5 mt-3">

          {/* Phase headline card */}
          <div className="card stagger-rise" style={{ borderRadius: 24, padding: '20px 18px', animationDelay: '60ms' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: 999, background: soft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
                  <path d="M11 19 S3.5 14.5 3.5 9.5 a 4 4 0 0 1 7.5 -1.2 a 4 4 0 0 1 7.5 1.2 c0 5 -7.5 9.5 -7.5 9.5 z" fill={accent} opacity="0.85" />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: accentDeep, margin: '0 0 6px' }}>
                  {phase} phase
                </p>
                <p className="serif-italic" style={{ fontSize: 19, fontWeight: 500, color: '#1F4E4A', margin: 0, letterSpacing: '-0.2px', lineHeight: 1.3 }}>
                  {guidance.headline}
                </p>
              </div>
            </div>
          </div>

          {/* Kindnesses */}
          <div className="card stagger-rise" style={{ borderRadius: 24, padding: '20px 18px 18px', animationDelay: '100ms' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M9 2 L10.2 7.8 L16 9 L10.2 10.2 L9 16 L7.8 10.2 L2 9 L7.8 7.8 Z" fill={accent} />
              </svg>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: accentDeep }}>small kindnesses</span>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {guidance.kindnesses.map((text, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span style={{ flexShrink: 0, marginTop: 3 }}>
                    {i === 0 && (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                        <path d="M7 12 V6" stroke={accent} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
                        <path d="M7 7 C 4 7, 2.5 5.5, 2.5 3 C 5 3, 7 4.5, 7 7 Z" fill={accent} />
                        <path d="M7 8 C 10 8, 11.5 6.5, 11.5 4 C 9 4, 7 5.5, 7 8 Z" fill={accent} opacity="0.7" />
                      </svg>
                    )}
                    {i === 1 && (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                        <path d="M7 1.5 C 4.5 5, 3.5 7, 3.5 9 a 3.5 3.5 0 0 0 7 0 c 0 -2, -1 -4, -3.5 -7.5 z" fill={accent} />
                      </svg>
                    )}
                    {i === 2 && (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                        <path d="M9 2 a 5 5 0 1 0 0 10 a 4 4 0 0 1 0 -10 z" fill={accent} />
                      </svg>
                    )}
                  </span>
                  <span className="serif" style={{ fontSize: 15, color: '#1F4E4A', lineHeight: 1.55, fontWeight: 400, letterSpacing: '-0.1px' }}>
                    {text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Invite form */}
          <div className="stagger-rise" style={{ animationDelay: '140ms' }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#1F4E4A', margin: '0 4px 10px' }}>
              share access
            </p>
            {connections.length > 0 && (
              <div className="card mb-3" style={{ borderRadius: 18, padding: '12px 16px' }}>
                {connections.map((c) => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#3F5A57' }}>{c.partner_email}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: c.is_active ? '#7A8F5C' : '#8FA09E' }}>
                      {c.is_active ? 'Active' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <PartnerInviteForm ownerUserId={user.id} />
          </div>

          {/* Privacy note */}
          <div style={{ background: '#F2E8D9', borderRadius: 18, padding: '14px 16px' }}>
            <p className="serif-italic" style={{ fontSize: 13, color: '#3F5A57', lineHeight: 1.6, margin: 0 }}>
              They see your phase, what you may be feeling, and how to help. Nothing more — no raw dates, no logs.
            </p>
          </div>

          {/* Sign-off */}
          <div style={{ textAlign: 'center', padding: '12px 0 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <span style={{ width: 20, height: 1, background: 'rgba(31,78,74,0.12)' }} />
            <span className="serif-italic" style={{ fontSize: 12, color: '#8FA09E', letterSpacing: '0.06em' }}>shared with care</span>
            <span style={{ width: 20, height: 1, background: 'rgba(31,78,74,0.12)' }} />
          </div>

        </div>
      </div>

      <BottomNav phase={phase} />
    </main>
  )
}
