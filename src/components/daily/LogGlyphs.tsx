/* Custom SVG glyphs for the log screen — no emoji */

interface GlyphProps { size?: number; color?: string; glow?: boolean }

export function GlyphEnergyLow({ size = 30, color = '#8B6F5C', glow }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      {glow && <circle cx="16" cy="16" r="13" fill={color} opacity="0.10" />}
      <path d="M22 16 a8 8 0 1 1 -8 -8 a6 6 0 0 0 8 8 z" fill={color} opacity={glow ? 0.95 : 0.85} />
      <circle cx="11" cy="13" r="0.9" fill={color} opacity="0.5" />
    </svg>
  )
}

export function GlyphEnergyOkay({ size = 30, color = '#8B6F5C', glow }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      {glow && <circle cx="16" cy="16" r="13" fill={color} opacity="0.10" />}
      <path d="M16 24 V12" stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
      <path d="M16 14 C 10 12, 8 8, 10 5 C 14 6, 17 9, 16 14 z" fill={color} opacity="0.85" />
      <path d="M16 17 C 22 15, 24 11, 22 8 C 18 9, 15 12, 16 17 z" fill={color} opacity={glow ? 0.95 : 0.7} />
    </svg>
  )
}

export function GlyphEnergyHigh({ size = 30, color = '#8B6F5C', glow }: GlyphProps) {
  const rays = [0, 45, 90, 135, 180, 225, 270, 315]
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      {glow && <circle cx="16" cy="16" r="13" fill={color} opacity="0.10" />}
      <circle cx="16" cy="16" r="5.5" fill={color} opacity={glow ? 0.95 : 0.85} />
      {rays.map(a => (
        <line
          key={a}
          x1="16" y1="16"
          x2={16 + Math.cos(a * Math.PI / 180) * 11}
          y2={16 + Math.sin(a * Math.PI / 180) * 11}
          stroke={color} strokeWidth="1.7" strokeLinecap="round"
          opacity={glow ? 0.85 : 0.55}
        />
      ))}
    </svg>
  )
}

type MoodKind = 'tender' | 'grounded' | 'clear' | 'expansive' | 'scattered' | 'anxious' | 'frustrated' | 'withdrawn'
interface MoodGlyphProps { kind: MoodKind; size?: number; color?: string; glow?: boolean }

export function GlyphMood({ kind, size = 26, color = '#8B6F5C', glow }: MoodGlyphProps) {
  const op = glow ? 0.95 : 0.72
  const w = 1.6
  const props = { width: size, height: size, viewBox: '0 0 28 28', fill: 'none' as const, 'aria-hidden': true }
  const halo = glow && <circle cx="14" cy="14" r="12" fill={color} opacity="0.10" />

  switch (kind) {
    case 'tender':
      return (
        <svg {...props}>{halo}
          <path d="M14 20 C 7 16, 5 11, 8 8 C 10.5 6, 13 7.5, 14 10 C 15 7.5, 17.5 6, 20 8 C 23 11, 21 16, 14 20 z" fill={color} opacity={op} />
        </svg>
      )
    case 'grounded':
      return (
        <svg {...props}>{halo}
          <path d="M4 21 H24" stroke={color} strokeWidth={w} strokeLinecap="round" opacity={op * 0.7} />
          <path d="M5 21 L11 11 L14 15 L18 9 L23 21" stroke={color} strokeWidth={w} strokeLinejoin="round" strokeLinecap="round" opacity={op} />
        </svg>
      )
    case 'clear':
      return (
        <svg {...props}>{halo}
          <path d="M14 5 L15.5 12.5 L23 14 L15.5 15.5 L14 23 L12.5 15.5 L5 14 L12.5 12.5 z" fill={color} opacity={op} />
        </svg>
      )
    case 'expansive':
      return (
        <svg {...props}>{halo}
          <path d="M5 17 Q 9 13 14 17 T 23 17" stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" opacity={op} />
          <path d="M5 13 Q 9 9 14 13 T 23 13"  stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" opacity={op * 0.7} />
          <path d="M5 21 Q 9 17 14 21 T 23 21" stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" opacity={op * 0.5} />
        </svg>
      )
    case 'scattered':
      return (
        <svg {...props}>{halo}
          {([[8,10],[13,7],[19,9],[10,15],[16,14],[21,16],[9,21],[15,20],[20,22]] as [number,number][]).map(([x,y],i) => (
            <circle key={i} cx={x} cy={y} r={1.4 + (i % 3) * 0.3} fill={color} opacity={op * (0.5 + (i % 3) * 0.2)} />
          ))}
        </svg>
      )
    case 'anxious':
      return (
        <svg {...props}>{halo}
          <path d="M14 14 m -1 0 a 1 1 0 1 1 2 0 a 2.5 2.5 0 1 1 -5 0 a 4.5 4.5 0 1 1 9 0 a 6.5 6.5 0 1 1 -13 0"
            stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" opacity={op} />
        </svg>
      )
    case 'frustrated':
      return (
        <svg {...props}>{halo}
          <path d="M16 4 L9 16 L13 16 L11 24 L19 12 L15 12 L18 4 z" fill={color} opacity={op} />
        </svg>
      )
    case 'withdrawn':
      return (
        <svg {...props}>{halo}
          <path d="M20 14 a6 6 0 1 1 -6 -6 a4.5 4.5 0 0 0 6 6 z" fill={color} opacity={op} />
          <circle cx="11" cy="12" r="0.9" fill={color} opacity={op * 0.5} />
          <circle cx="13" cy="9"  r="0.7" fill={color} opacity={op * 0.4} />
        </svg>
      )
  }
}
