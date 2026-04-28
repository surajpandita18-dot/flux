import type { Phase } from '@/lib/phaseEngine'

interface Props { phase: Phase; className?: string; size?: number }

const PAL: Record<Phase, { body: string; ear: string; accent: string; cheek: string }> = {
  menstrual:  { body: '#FECDD3', ear: '#FDA4AF', accent: '#F43F5E', cheek: '#F43F5E' },
  follicular: { body: '#FEF9C3', ear: '#FDE68A', accent: '#65A30D', cheek: '#84CC16' },
  ovulation:  { body: '#FFEDD5', ear: '#FED7AA', accent: '#F97316', cheek: '#F97316' },
  luteal:     { body: '#EDE9FE', ear: '#DDD6FE', accent: '#8B5CF6', cheek: '#8B5CF6' },
}

function Face({ phase, pal }: { phase: Phase; pal: typeof PAL[Phase] }) {
  const eyeY = 52
  const lX = 38, rX = 62

  if (phase === 'menstrual') return (
    <g stroke={pal.accent} strokeLinecap="round" fill="none">
      <g style={{ animation: 'flux-mascot-peek 6s ease-in-out infinite' }}>
        <path d={`M ${lX-5} ${eyeY-1} Q ${lX} ${eyeY+2} ${lX+5} ${eyeY-1}`} strokeWidth="2.4" />
        <path d={`M ${rX-5} ${eyeY-1} Q ${rX} ${eyeY+2} ${rX+5} ${eyeY-1}`} strokeWidth="2.4" />
      </g>
      <path d="M 46 64 Q 50 66 54 64" strokeWidth="1.8" />
      <ellipse cx="50" cy="86" rx="8" ry="2.5" fill={pal.accent} stroke="none" opacity="0.35" />
      <g fill={pal.accent} stroke="none" opacity="0.7">
        <text x="76" y="32" fontSize="10" fontFamily="var(--font-newsreader,serif)" fontStyle="italic"
          style={{ animation: 'flux-sparkle-rise 3.2s ease-in-out infinite' }}>z</text>
        <text x="80" y="22" fontSize="6" fontFamily="var(--font-newsreader,serif)" fontStyle="italic"
          style={{ animation: 'flux-sparkle-rise 3.2s ease-in-out infinite', animationDelay: '1.6s' }}>z</text>
      </g>
    </g>
  )

  if (phase === 'follicular') return (
    <g>
      <g style={{ animation: 'flux-mascot-blink 5s ease-in-out infinite', transformOrigin: `${lX}px ${eyeY}px` }}>
        <circle cx={lX} cy={eyeY} r="2.6" fill={pal.accent} />
        <circle cx={lX - 0.8} cy={eyeY - 0.8} r="0.8" fill="white" />
      </g>
      <g style={{ animation: 'flux-mascot-blink 5s ease-in-out infinite', transformOrigin: `${rX}px ${eyeY}px` }}>
        <circle cx={rX} cy={eyeY} r="2.6" fill={pal.accent} />
        <circle cx={rX - 0.8} cy={eyeY - 0.8} r="0.8" fill="white" />
      </g>
      <path d="M 44 63 Q 50 67 56 63" stroke={pal.accent} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M 50 22 Q 54 18 58 22 Q 54 26 50 22" fill={pal.accent} opacity="0.6"
        style={{ animation: 'flux-breathe 4s ease-in-out infinite', transformOrigin: '50px 24px' }} />
    </g>
  )

  if (phase === 'ovulation') return (
    <g>
      <g style={{ animation: 'flux-mascot-blink 4s ease-in-out infinite', transformOrigin: `${lX}px ${eyeY}px` }}>
        <circle cx={lX} cy={eyeY} r="3" fill={pal.accent} />
        <circle cx={lX - 1} cy={eyeY - 1} r="1" fill="white" />
      </g>
      <g style={{ animation: 'flux-mascot-blink 4s ease-in-out infinite', transformOrigin: `${rX}px ${eyeY}px` }}>
        <circle cx={rX} cy={eyeY} r="3" fill={pal.accent} />
        <circle cx={rX - 1} cy={eyeY - 1} r="1" fill="white" />
      </g>
      <g fill={pal.accent} style={{ animation: 'flux-sparkle 2.4s ease-in-out infinite' }}>
        <path d="M 20 42 l 1.5 -3 l 1.5 3 l 3 1.5 l -3 1.5 l -1.5 3 l -1.5 -3 l -3 -1.5 z" opacity="0.7" />
      </g>
      <g fill={pal.accent} style={{ animation: 'flux-sparkle 2.4s ease-in-out infinite', animationDelay: '0.8s' }}>
        <path d="M 82 44 l 1 -2 l 1 2 l 2 1 l -2 1 l -1 2 l -1 -2 l -2 -1 z" opacity="0.8" />
      </g>
      <path d="M 42 62 Q 50 72 58 62" stroke={pal.accent} strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </g>
  )

  // luteal
  return (
    <g>
      <ellipse cx={lX} cy={eyeY} rx="3" ry="2" fill={pal.accent} opacity="0.85" />
      <ellipse cx={rX} cy={eyeY} rx="3" ry="2" fill={pal.accent} opacity="0.85" />
      <path d="M 44 63 Q 50 66 56 63" stroke={pal.accent} strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </g>
  )
}

export default function Mascot({ phase, className = 'w-16 h-16', size }: Props) {
  const pal = PAL[phase]
  const sizeStyle = size ? { width: size, height: size } : {}

  return (
    <div className="mascot-breathe" style={sizeStyle}>
      <div className="mascot-sway">
        <svg
          viewBox="0 0 100 100"
          className={size ? '' : className}
          style={size ? { width: size, height: size, display: 'block', overflow: 'visible' } : { display: 'block', overflow: 'visible' }}
          aria-hidden
        >
          {/* Left ear */}
          <path d="M 22 36 Q 18 18 30 22 Q 34 28 32 36 Z" fill={pal.ear} />
          <path d="M 24 32 Q 24 26 28 26 Q 30 28 30 33 Z" fill={pal.body} opacity="0.7" />
          {/* Right ear (slightly asymmetric) */}
          <path d="M 78 36 Q 84 16 70 22 Q 66 28 68 38 Z" fill={pal.ear} />
          <path d="M 76 32 Q 76 26 72 26 Q 70 28 70 33 Z" fill={pal.body} opacity="0.7" />
          {/* Body — blobby, not perfect oval */}
          <path d="M 50 30 Q 78 30 80 56 Q 82 76 60 80 Q 50 82 40 80 Q 18 76 20 56 Q 22 30 50 30 Z" fill={pal.body} />
          {/* Cheek blush */}
          <ellipse cx="28" cy="60" rx="6" ry="4" fill={pal.cheek} opacity="0.18" />
          <ellipse cx="72" cy="60" rx="6" ry="4" fill={pal.cheek} opacity="0.18" />
          {/* Phase face */}
          <Face phase={phase} pal={pal} />
          {/* Whiskers */}
          <g stroke={pal.accent} strokeWidth="1" strokeLinecap="round" opacity="0.45">
            <line x1="14" y1="62" x2="22" y2="62" />
            <line x1="14" y1="66" x2="22" y2="65" />
            <line x1="78" y1="62" x2="86" y2="62" />
            <line x1="78" y1="65" x2="86" y2="66" />
          </g>
        </svg>
      </div>
    </div>
  )
}
