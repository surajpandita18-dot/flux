'use client'

import { useState, useEffect } from 'react'
import type { Phase, PhaseResult } from '@/lib/phaseEngine'

const PHASE_ACCENT: Record<Phase, string> = {
  menstrual:  '#C76B4A',
  follicular: '#7A8F5C',
  ovulation:  '#D49A3D',
  luteal:     '#8B6F8C',
}

const PHASE_SOFT: Record<Phase, string> = {
  menstrual:  '#F8DFD3',
  follicular: '#E4E8D6',
  ovulation:  '#F5E6C2',
  luteal:     '#E5DCE5',
}

const PHASE_ORDER: Phase[] = ['menstrual', 'follicular', 'ovulation', 'luteal']

interface ArcProps {
  d: string
  color: string
  strokeW: number
  arcLen: number
  dur: number
  delay: number
  animKey: number
}

function FluxArc({ d, color, strokeW, arcLen, dur, delay, animKey }: ArcProps) {
  const [drawn, setDrawn] = useState(false)

  useEffect(() => {
    setDrawn(false)
    const t = setTimeout(() => setDrawn(true), 30 + delay)
    return () => clearTimeout(t)
  }, [animKey, delay])

  return (
    <path
      d={d}
      stroke={color}
      strokeWidth={strokeW}
      strokeLinecap="round"
      fill="none"
      style={{
        strokeDasharray: arcLen,
        strokeDashoffset: drawn ? 0 : arcLen,
        transition: `stroke-dashoffset ${dur}ms cubic-bezier(0.22, 1, 0.36, 1)`,
      }}
    />
  )
}

interface Props {
  phaseResult: PhaseResult
  size?: number
  animKey?: number
}

export default function PhaseRing({ phaseResult, size = 200, animKey = 0 }: Props) {
  const { phase, dayNumber, totalDays } = phaseResult

  const center  = size / 2
  const radius  = size * 0.36
  const strokeW = size * 0.08
  const innerR  = size * 0.27
  const gap     = 4
  const arcSpan = 90 - gap

  const currentAccent  = PHASE_ACCENT[phase]
  const phaseSoft      = PHASE_SOFT[phase]
  const inactiveStroke = 'rgba(60,40,25,0.10)'

  const arcs = PHASE_ORDER.map((k, i) => {
    const startAng = -90 + i * 90 + gap / 2
    const endAng   = startAng + arcSpan
    return { key: k, startAng, endAng }
  })

  function polar(angDeg: number) {
    const a = (angDeg * Math.PI) / 180
    return { x: center + radius * Math.cos(a), y: center + radius * Math.sin(a) }
  }

  function arcPath(startAng: number, endAng: number) {
    const s = polar(startAng)
    const e = polar(endAng)
    const large = endAng - startAng > 180 ? 1 : 0
    return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${radius} ${radius} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`
  }

  const arcLen = (Math.PI * radius * arcSpan) / 180

  const drawOrder = PHASE_ORDER
    .map((k, i) => ({ k, i, isCurrent: k === phase }))
    .sort((a, b) => (a.isCurrent ? 1 : 0) - (b.isCurrent ? 1 : 0))

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ display: 'block' }}
        aria-hidden
      >
        <circle cx={center} cy={center} r={innerR} fill={phaseSoft} />
        {drawOrder.map(({ k, isCurrent }, drawIx) => {
          const arc   = arcs.find(a => a.key === k)!
          const color = isCurrent ? currentAccent : inactiveStroke
          const delay = drawIx * 80
          const dur   = isCurrent ? 720 : 420
          return (
            <FluxArc
              key={k + '-' + animKey}
              d={arcPath(arc.startAng, arc.endAng)}
              color={color}
              strokeW={strokeW}
              arcLen={arcLen}
              dur={dur}
              delay={delay}
              animKey={animKey}
            />
          )
        })}
      </svg>

      {/* Day number centered */}
      <div
        aria-label={`Day ${dayNumber} of ${totalDays}`}
        style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.32em', textTransform: 'uppercase', color: '#8FA09E', margin: 0 }}>
          day
        </p>
        <p className="serif-italic" style={{ fontSize: size * 0.32, fontWeight: 500, lineHeight: 0.9, color: '#1F4E4A', margin: 0, letterSpacing: '-2px' }}>
          {dayNumber}
        </p>
        <p style={{ fontSize: 9, color: '#8FA09E', margin: '4px 0 0', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase' }}>
          of {totalDays}
        </p>
      </div>
    </div>
  )
}
