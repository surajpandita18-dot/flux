import type { Phase } from '@/lib/phaseEngine'

interface Props {
  lastPeriodDate: Date
  cycleLengthAvg: number
  phase: Phase
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

function utcDay(d: Date): number {
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
}

function addDays(d: Date, n: number): Date {
  const result = new Date(d)
  result.setDate(result.getDate() + n)
  return result
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth()    === b.getMonth()
    && a.getDate()     === b.getDate()
}

type DayStatus = 'period' | 'ovulation' | 'predicted' | 'today' | 'today-period' | 'today-ovulation' | null

function getStatus(
  date: Date,
  cycleStart: Date,
  nextPeriodStart: Date,
  today: Date,
): DayStatus {
  const ms        = utcDay(date)
  const periodEnd = utcDay(addDays(cycleStart, 4))
  const ovulStart = utcDay(addDays(cycleStart, 12))
  const ovulEnd   = utcDay(addDays(cycleStart, 16))
  const nextStart = utcDay(nextPeriodStart)
  const nextEnd   = utcDay(addDays(nextPeriodStart, 4))
  const csMs      = utcDay(cycleStart)

  const isPeriod    = ms >= csMs      && ms <= periodEnd
  const isOvulation = ms >= ovulStart && ms <= ovulEnd
  const isPredicted = ms >= nextStart && ms <= nextEnd
  const isToday     = isSameDay(date, today)

  if (isPeriod    && isToday) return 'today-period'
  if (isOvulation && isToday) return 'today-ovulation'
  if (isPeriod)               return 'period'
  if (isOvulation)            return 'ovulation'
  if (isToday)                return 'today'
  if (isPredicted)            return 'predicted'
  return null
}

const phaseAccent: Record<Phase, string> = {
  menstrual:  'bg-menstrual  dark:bg-menstrual-soft-dark',
  follicular: 'bg-follicular dark:bg-follicular-soft-dark',
  ovulation:  'bg-ovulation  dark:bg-ovulation-soft-dark',
  luteal:     'bg-luteal     dark:bg-luteal-soft-dark',
}

export default function CycleCalendar({ lastPeriodDate, cycleLengthAvg, phase }: Props) {
  const today    = new Date()
  const year     = today.getFullYear()
  const month    = today.getMonth()
  const monthName = MONTH_NAMES[month] ?? ''

  // Determine current cycle start using rollover logic (mirrors phaseEngine)
  const msPerDay       = 1000 * 60 * 60 * 24
  const utcLast        = Date.UTC(lastPeriodDate.getFullYear(), lastPeriodDate.getMonth(), lastPeriodDate.getDate())
  const utcToday       = Date.UTC(year, month, today.getDate())
  const totalElapsed   = Math.floor((utcToday - utcLast) / msPerDay)
  const completed      = Math.max(0, Math.floor(totalElapsed / cycleLengthAvg))
  const cycleStart     = addDays(lastPeriodDate, completed * cycleLengthAvg)
  const nextPeriodStart = addDays(cycleStart, cycleLengthAvg)

  // Build calendar grid (Monday-first)
  const firstOfMonth  = new Date(year, month, 1)
  const daysInMonth   = new Date(year, month + 1, 0).getDate()
  const rawDow        = firstOfMonth.getDay() // 0=Sun
  const startOffset   = rawDow === 0 ? 6 : rawDow - 1 // Mon=0 … Sun=6

  // Cells: nulls for padding + 1-based day numbers
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null)

  function cellStyle(day: number | null): string {
    if (!day) return ''
    const date   = new Date(year, month, day)
    const status = getStatus(date, cycleStart, nextPeriodStart, today)
    switch (status) {
      case 'period':
        return 'bg-menstrual/80 text-white rounded-full font-semibold'
      case 'today-period':
        return 'bg-menstrual text-white rounded-full font-bold ring-2 ring-offset-1 ring-menstrual'
      case 'ovulation':
        return 'bg-ovulation/70 text-white rounded-full font-semibold'
      case 'today-ovulation':
        return 'bg-ovulation text-white rounded-full font-bold ring-2 ring-offset-1 ring-ovulation'
      case 'today':
        return `${phaseAccent[phase]} text-gray-900 dark:text-white rounded-full font-bold ring-2 ring-offset-1`
      case 'predicted':
        return 'bg-menstrual/25 text-menstrual rounded-full font-medium'
      default:
        return 'text-gray-700 dark:text-gray-300'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
      {/* Header: month + legend */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-gray-900 dark:text-white">
          {monthName} {year}
        </span>
        <div className="flex items-center gap-3 text-[10px] text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-menstrual inline-block" />
            Period
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-ovulation inline-block" />
            Ovulation
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-menstrual/30 inline-block" />
            Predicted
          </span>
        </div>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((d, i) => (
          <div
            key={i}
            className="text-center text-[10px] font-bold uppercase tracking-wider text-gray-300 dark:text-gray-600 py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => (
          <div key={i} className="flex items-center justify-center h-8">
            {day !== null && (
              <span
                className={`w-8 h-8 flex items-center justify-center text-[13px] transition-colors ${cellStyle(day)}`}
              >
                {day}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Days until next period */}
      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
        <span>Next period in <strong className="text-gray-600 dark:text-gray-300">{Math.max(0, Math.round((utcDay(nextPeriodStart) - utcToday) / msPerDay))} days</strong></span>
        <span>{nextPeriodStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
      </div>
    </div>
  )
}
