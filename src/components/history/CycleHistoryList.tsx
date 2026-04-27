import type { CycleLog } from '@/types/database'

interface Props {
  cycles: CycleLog[]
}

const flowLabel: Record<string, string> = {
  light:  'Light',
  medium: 'Medium',
  heavy:  'Heavy',
}

const flowDot: Record<string, string> = {
  light:  'bg-pink-200',
  medium: 'bg-pink-400',
  heavy:  'bg-pink-600',
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

        return (
          <div
            key={cycle.id}
            className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatDate(cycle.period_start_date)}
              </span>
              <span className="text-xs text-gray-400">{length}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${flowDot[cycle.flow_intensity] ?? 'bg-gray-300'}`} />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {flowLabel[cycle.flow_intensity] ?? cycle.flow_intensity} flow
              </span>
              {cycle.period_end_date && (
                <span className="text-xs text-gray-400 ml-auto">
                  ended {formatDate(cycle.period_end_date)}
                </span>
              )}
            </div>

            {cycle.notes && (
              <p className="text-xs text-gray-400 italic line-clamp-2">{cycle.notes}</p>
            )}
          </div>
        )
      })}

      {cycles.length === 12 && (
        <p className="text-center text-xs text-gray-300 dark:text-gray-600 pt-2">
          Showing last 12 cycles
        </p>
      )}
    </div>
  )
}
