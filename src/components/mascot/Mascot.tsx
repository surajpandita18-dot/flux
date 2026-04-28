import type { Phase } from '@/lib/phaseEngine'

interface Props {
  phase: Phase
  className?: string
}

const config: Record<Phase, {
  body: string
  ear: string
  accent: string
  eyes: 'sleepy' | 'open' | 'sparkle' | 'gentle'
  mouth: 'flat' | 'small' | 'wide' | 'soft'
}> = {
  menstrual:  { body: '#FECDD3', ear: '#F4A0B4', accent: '#E8627C', eyes: 'sleepy',  mouth: 'flat'  },
  follicular: { body: '#BBF7D0', ear: '#8CCBA8', accent: '#3D9E6E', eyes: 'open',    mouth: 'small' },
  ovulation:  { body: '#FEF9C3', ear: '#F5D07A', accent: '#C8960A', eyes: 'sparkle', mouth: 'wide'  },
  luteal:     { body: '#DDD6FE', ear: '#A8C4E8', accent: '#4A80C8', eyes: 'gentle',  mouth: 'soft'  },
}

function Eyes({ type, accent }: { type: typeof config[Phase]['eyes']; accent: string }) {
  if (type === 'sleepy') return (
    <>
      <path d="M 25 36 Q 29 32 33 36" stroke={accent} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 47 36 Q 51 32 55 36" stroke={accent} strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </>
  )
  if (type === 'open') return (
    <>
      <circle cx="29" cy="35" r="4.5" fill={accent} />
      <circle cx="51" cy="35" r="4.5" fill={accent} />
      <circle cx="30.5" cy="33.5" r="1.5" fill="white" />
      <circle cx="52.5" cy="33.5" r="1.5" fill="white" />
    </>
  )
  if (type === 'sparkle') return (
    <>
      <circle cx="29" cy="35" r="5.5" fill={accent} />
      <circle cx="51" cy="35" r="5.5" fill={accent} />
      <circle cx="31" cy="33" r="2"   fill="white" />
      <circle cx="53" cy="33" r="2"   fill="white" />
      {/* tiny sparkle star */}
      <text x="60" y="22" fontSize="8" fill={accent} opacity="0.8">✦</text>
      <text x="16" y="20" fontSize="6" fill={accent} opacity="0.6">✦</text>
    </>
  )
  // gentle (luteal)
  return (
    <>
      <path d="M 25 33 Q 29 38 33 33" fill={accent} stroke={accent} strokeWidth="0.5" />
      <path d="M 47 33 Q 51 38 55 33" fill={accent} stroke={accent} strokeWidth="0.5" />
      <circle cx="29" cy="33" r="1" fill="white" />
      <circle cx="51" cy="33" r="1" fill="white" />
    </>
  )
}

function Mouth({ type, accent }: { type: typeof config[Phase]['mouth']; accent: string }) {
  if (type === 'flat')  return <path d="M 34 46 L 46 46" stroke={accent} strokeWidth="2" strokeLinecap="round" />
  if (type === 'small') return <path d="M 33 45 Q 40 50 47 45" stroke={accent} strokeWidth="2" fill="none" strokeLinecap="round" />
  if (type === 'wide')  return <path d="M 30 44 Q 40 52 50 44" stroke={accent} strokeWidth="2.5" fill="none" strokeLinecap="round" />
  // soft
  return <path d="M 35 46 Q 40 49 45 46" stroke={accent} strokeWidth="2" fill="none" strokeLinecap="round" />
}

export default function Mascot({ phase, className = 'w-16 h-16' }: Props) {
  const c = config[phase]
  return (
    <svg
      viewBox="0 0 80 80"
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left ear */}
      <ellipse cx="22" cy="20" rx="10" ry="12" fill={c.ear} />
      {/* Right ear */}
      <ellipse cx="58" cy="20" rx="10" ry="12" fill={c.ear} />
      {/* Inner ear left */}
      <ellipse cx="22" cy="21" rx="5.5" ry="7" fill={c.body} opacity="0.7" />
      {/* Inner ear right */}
      <ellipse cx="58" cy="21" rx="5.5" ry="7" fill={c.body} opacity="0.7" />
      {/* Main body */}
      <circle cx="40" cy="46" r="28" fill={c.body} />
      {/* Cheek blush left */}
      <ellipse cx="20" cy="46" rx="7" ry="4" fill={c.accent} opacity="0.18" />
      {/* Cheek blush right */}
      <ellipse cx="60" cy="46" rx="7" ry="4" fill={c.accent} opacity="0.18" />
      {/* Eyes */}
      <Eyes type={c.eyes} accent={c.accent} />
      {/* Mouth */}
      <Mouth type={c.mouth} accent={c.accent} />
    </svg>
  )
}
