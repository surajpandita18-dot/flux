import type { PhaseResult } from '@/lib/phaseEngine'
import type { PhaseData } from '@/lib/phases'

const phaseStyles = {
  menstrual:  { dot: 'bg-menstrual',  label: 'text-menstrual',  card: 'bg-menstrual-soft  dark:bg-menstrual-soft-dark'  },
  follicular: { dot: 'bg-follicular', label: 'text-follicular', card: 'bg-follicular-soft dark:bg-follicular-soft-dark' },
  ovulation:  { dot: 'bg-ovulation',  label: 'text-ovulation',  card: 'bg-ovulation-soft  dark:bg-ovulation-soft-dark'  },
  luteal:     { dot: 'bg-luteal',     label: 'text-luteal',     card: 'bg-luteal-soft     dark:bg-luteal-soft-dark'     },
} as const

interface Props {
  displayName: string
  phaseResult: PhaseResult
  phaseData: PhaseData
}

export default function PhaseCard({ displayName, phaseResult, phaseData }: Props) {
  const styles = phaseStyles[phaseResult.phase]
  const firstName = displayName.split(' ')[0] ?? displayName

  const periodNote =
    phaseResult.daysUntilNextPeriod === 0
      ? 'Period expected today'
      : phaseResult.daysUntilNextPeriod <= 3
        ? `Period in ${phaseResult.daysUntilNextPeriod} ${phaseResult.daysUntilNextPeriod === 1 ? 'day' : 'days'}`
        : null

  return (
    <div className="max-w-sm mx-auto w-full space-y-3 pt-6 pb-8">

      <p className="text-sm text-gray-400 dark:text-gray-500 px-1">
        Hey, {firstName}
      </p>

      {/* Main phase card */}
      <div className={`phase-card ${styles.card}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${styles.dot}`} />
            <span className={`text-xs font-bold uppercase tracking-widest ${styles.label}`}>
              {phaseData.name}
            </span>
          </div>
          <span className="text-xs text-gray-400">
            Day {phaseResult.dayNumber} / {phaseResult.totalDays}
          </span>
        </div>

        <p className="text-gray-800 dark:text-gray-100 text-[15px] leading-relaxed">
          {phaseData.one_liner}
        </p>

        {periodNote && (
          <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
            {periodNote}
          </p>
        )}
      </div>

      {/* Nutrition tip */}
      <div className={`phase-card ${styles.card}`}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
          Nutrition today
        </p>
        <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed">
          {phaseData.nutrition.tip_card}
        </p>
      </div>

      {/* Movement tip */}
      <div className={`phase-card ${styles.card}`}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
          Movement
        </p>
        <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed">
          {phaseData.exercise.tip_card}
        </p>
      </div>

      {/* Mood note */}
      <div className={`phase-card ${styles.card}`}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
          What to expect
        </p>
        <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed">
          {phaseData.mood.tip_card}
        </p>
      </div>

    </div>
  )
}
