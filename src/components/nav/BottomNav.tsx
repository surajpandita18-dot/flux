'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Phase } from '@/lib/phaseEngine'

const PHASE_ACTIVE: Record<Phase, string> = {
  menstrual:  '#C76B4A',
  follicular: '#7A8F5C',
  ovulation:  '#D49A3D',
  luteal:     '#8B6F8C',
}

const DEFAULT_ACTIVE = '#1F4E4A'

interface Props {
  phase?: Phase
}

const TABS = [
  {
    href: '/',
    label: 'Home',
    icon: (active: boolean, color: string) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? color : 'none'} stroke={active ? color : '#8FA09E'} strokeWidth={active ? 0 : 1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
        <path d="M9 21V12h6v9" strokeWidth="1.75" fill="none" stroke={active ? color : '#8FA09E'} />
      </svg>
    ),
    center: false,
  },
  {
    href: '/history',
    label: 'History',
    icon: (active: boolean, color: string) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? color : '#8FA09E'} strokeWidth={active ? 2.25 : 1.75} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
    ),
    center: false,
  },
  {
    href: '/log',
    label: 'Log',
    icon: (_active: boolean, color: string) => (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
        <circle cx="13" cy="13" r="12" fill={color} />
        <path d="M13 8v10M8 13h10" stroke="#FBF6EE" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    center: true,
  },
  {
    href: '/partner',
    label: 'Partner',
    icon: (active: boolean, color: string) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? color : 'none'} stroke={active ? color : '#8FA09E'} strokeWidth={active ? 0 : 1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
    center: false,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: (active: boolean, color: string) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? color : '#8FA09E'} strokeWidth={active ? 2.25 : 1.75} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
    center: false,
  },
] as const

export default function BottomNav({ phase }: Props) {
  const pathname  = usePathname()
  const activeClr = phase ? PHASE_ACTIVE[phase] : DEFAULT_ACTIVE

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 pb-safe"
      style={{
        background: 'rgba(251,246,238,0.96)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(31,78,74,0.08)',
      }}
    >
      <div className="flex items-stretch max-w-sm mx-auto">
        {TABS.map(({ href, label, icon, center }) => {
          const active = pathname === href
          if (center) {
            return (
              <Link
                key={href}
                href={href}
                className="flex-1 flex flex-col items-center justify-center gap-1 py-2 min-h-[60px] transition-colors"
                aria-label={label}
              >
                {icon(true, activeClr)}
                <span className="text-[10px] font-semibold tracking-wide" style={{ color: activeClr }}>
                  {label}
                </span>
              </Link>
            )
          }
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2 min-h-[60px] transition-colors"
            >
              {icon(active, activeClr)}
              <span
                className="text-[10px] font-semibold tracking-wide"
                style={{ color: active ? activeClr : '#8FA09E' }}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
