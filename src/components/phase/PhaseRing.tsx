import type { Phase, PhaseResult } from '@/lib/phaseEngine'
import Mascot from '@/components/mascot/Mascot'

interface Props {
  phaseResult: PhaseResult
}

// Phase arc config — proportions of a 28-day cycle
const SEGMENTS: { phase: Phase; days: number; color: string }[] = [
  { phase: 'menstrual',  days: 5,  color: '#F4A0B4' },
  { phase: 'follicular', days: 7,  color: '#8CCBA8' },
  { phase: 'ovulation',  days: 4,  color: '#F5D07A' },
  { phase: 'luteal',     days: 12, color: '#A8C4E8' },
]

const PHASE_CENTER_BG: Record<Phase, string> = {
  menstrual:  '#FDF2F5',
  follicular: '#EFF7F3',
  ovulation:  '#FBF6E6',
  luteal:     '#EEF3FB',
}

const PHASE_DISPLAY: Record<Phase, string> = {
  menstrual:  'Menstrual Phase',
  follicular: 'Follicular Phase',
  ovulation:  'Ovulation Phase',
  luteal:     'Luteal Phase',
}

function describeArc(
  cx: number, cy: number, r: number,
  startAngle: number, endAngle: number,
): string {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const x1 = cx + r * Math.cos(toRad(startAngle))
  const y1 = cy + r * Math.sin(toRad(startAngle))
  const x2 = cx + r * Math.cos(toRad(endAngle))
  const y2 = cy + r * Math.sin(toRad(endAngle))
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`
}

export default function PhaseRing({ phaseResult }: Props) {
  const { phase, dayNumber, totalDays } = phaseResult

  const totalDaysInConfig = SEGMENTS.reduce((s, seg) => s + seg.days, 0)
  const cx = 100
  const cy = 100
  const r  = 72
  const strokeWidth = 16
  const gap = 3 // degrees gap between segments

  // Build arcs
  let cursor = -90 // start at top
  const arcs = SEGMENTS.map((seg) => {
    const sweep  = (seg.days / totalDaysInConfig) * 360
    const start  = cursor + gap / 2
    const end    = cursor + sweep - gap / 2
    cursor += sweep
    return { ...seg, start, end }
  })

  const centerBg = PHASE_CENTER_BG[phase]

  return (
    <div className="card p-5 flex flex-col items-center">
      {/* Phase ring + mascot */}
      <div className="relative w-52 h-52">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          aria-label={`Cycle ring — ${PHASE_DISPLAY[phase]}`}
        >
          {/* Center circle fill */}
          <circle cx={cx} cy={cy} r={r - strokeWidth / 2 - 2} fill={centerBg} />

          {/* Phase arc segments */}
          {arcs.map((arc) => (
            <path
              key={arc.phase}
              d={describeArc(cx, cy, r, arc.start, arc.end)}
              stroke={arc.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              fill="none"
              opacity={arc.phase === phase ? 1 : 0.35}
            />
          ))}
        </svg>

        {/* Mascot centered over SVG */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0">
          <p className="text-[36px] font-extrabold leading-none tracking-tight" style={{ color: '#1A1814' }}>
            {dayNumber}
          </p>
          <Mascot phase={phase} className="w-14 h-14" />
        </div>
      </div>

      {/* Phase label + cycle progress */}
      <div className="mt-2 text-center space-y-0.5">
        <p className="text-[13px] font-bold" style={{ color: '#5C5754' }}>
          {PHASE_DISPLAY[phase]}
        </p>
        <p className="text-[11px]" style={{ color: '#A8A4A0' }}>
          Day {dayNumber} of {totalDays}
        </p>
      </div>
    </div>
  )
}
