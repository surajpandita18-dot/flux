import type { CycleLog } from '@/types/database'

interface Props {
  cycles: CycleLog[]
}

const flowDotColor: Record<string, string> = {
  light:  '#D89BA8',
  medium: '#C76B4A',
  heavy:  '#8B3030',
}

const flowLabel: Record<string, string> = {
  light:  'Light',
  medium: 'Medium',
  heavy:  'Heavy',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function cycleLengthBetween(current: string, next: string | undefined): string {
  if (!next) return '—'
  const days = Math.round(
    (new Date(current).getTime() - new Date(next).getTime()) / (1000 * 60 * 60 * 24),
  )
  return `${days}d cycle`
}

export default function CycleHistoryList({ cycles }: Props) {
  return (
    <div className="space-y-3">
      {cycles.map((cycle, i) => {
        const nextCycle = cycles[i + 1]
        const length = cycleLengthBetween(
          cycle.period_start_date,
          nextCycle?.period_start_date,
        )
        const dotColor = flowDotColor[cycle.flow_intensity] ?? '#C4B8AC'

        return (
          <div
            key={cycle.id}
            className="card p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-semibold" style={{ color: '#1F4E4A' }}>
                {formatDate(cycle.period_start_date)}
              </span>
              <span className="text-[12px]" style={{ color: '#8FA09E' }}>{length}</span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: dotColor }}
              />
              <span className="text-[12px]" style={{ color: '#8FA09E' }}>
                {flowLabel[cycle.flow_intensity] ?? cycle.flow_intensity} flow
              </span>
              {cycle.period_end_date && (
                <span className="text-[11px] ml-auto" style={{ color: '#C4B8AC' }}>
                  ended {formatDate(cycle.period_end_date)}
                </span>
              )}
            </div>

            {cycle.notes && (
              <p className="text-[12px] italic line-clamp-2" style={{ color: '#8FA09E' }}>
                {cycle.notes}
              </p>
            )}
          </div>
        )
      })}

      {cycles.length === 12 && (
        <p className="text-center text-[11px] pt-2" style={{ color: '#C4B8AC' }}>
          Showing last 12 cycles
        </p>
      )}
    </div>
  )
}
