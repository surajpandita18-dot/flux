import type { PhaseResult } from '@/lib/phaseEngine'
import type { PhaseData } from '@/lib/phases'
import QuickStats from './QuickStats'
import TipAccordion from './TipAccordion'
import EducationAccordion from './EducationAccordion'

const phaseStyles = {
  menstrual:  { dot: 'bg-menstrual',  label: 'text-menstrual',  card: 'bg-menstrual-soft  dark:bg-menstrual-soft-dark'  },
  follicular: { dot: 'bg-follicular', label: 'text-follicular', card: 'bg-follicular-soft dark:bg-follicular-soft-dark' },
  ovulation:  { dot: 'bg-ovulation',  label: 'text-ovulation',  card: 'bg-ovulation-soft  dark:bg-ovulation-soft-dark'  },
  luteal:     { dot: 'bg-luteal',     label: 'text-luteal',     card: 'bg-luteal-soft     dark:bg-luteal-soft-dark'     },
} as const

interface Props {
  phaseResult: PhaseResult
  phaseData: PhaseData
  displayName?: string
}

export default function PhaseCard({ phaseResult, phaseData }: Props) {
  const styles = phaseStyles[phaseResult.phase]

  const periodNote =
    phaseResult.daysUntilNextPeriod === 0
      ? 'Period expected today'
      : phaseResult.daysUntilNextPeriod <= 3
        ? `Period in ${phaseResult.daysUntilNextPeriod} ${phaseResult.daysUntilNextPeriod === 1 ? 'day' : 'days'}`
        : null

  return (
    <div className="space-y-2.5">

      {/* One-liner + period note */}
      <div className={`${styles.card} rounded-3xl px-5 py-4`}>
        <div className="flex items-center gap-2 mb-3">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${styles.dot}`} />
          <span className={`text-[10px] font-bold uppercase tracking-[0.14em] ${styles.label}`}>
            {phaseData.name}
          </span>
          <span className="ml-auto text-[11px] text-gray-400">
            Day {phaseResult.dayNumber} of {phaseResult.totalDays}
          </span>
        </div>

        <p className="text-gray-800 dark:text-gray-100 text-[15px] leading-[1.6] font-medium">
          {phaseData.one_liner}
        </p>

        {periodNote && (
          <p className={`mt-3 text-xs font-semibold ${styles.label} opacity-80`}>
            {periodNote}
          </p>
        )}
      </div>

      {/* Quick stats */}
      <QuickStats phase={phaseResult.phase} />

      {/* Tips */}
      <TipAccordion
        label="Nutrition today"
        content={phaseData.nutrition.tip_card}
        cardClass={styles.card}
        defaultOpen
      />

      <TipAccordion
        label="Movement"
        content={phaseData.exercise.tip_card}
        cardClass={styles.card}
      />

      <TipAccordion
        label="What to expect"
        content={phaseData.mood.tip_card}
        cardClass={styles.card}
      />

      <EducationAccordion
        headline={phaseData.education.headline}
        body={phaseData.education.body}
        cardClass={styles.card}
      />

    </div>
  )
}
