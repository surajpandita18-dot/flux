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

export default function PhaseCard({ phaseResult, phaseData, displayName }: Props) {
  const styles = phaseStyles[phaseResult.phase]

  const periodNote =
    phaseResult.daysUntilNextPeriod === 0
      ? 'Period expected today'
      : phaseResult.daysUntilNextPeriod <= 3
        ? `Period in ${phaseResult.daysUntilNextPeriod} ${phaseResult.daysUntilNextPeriod === 1 ? 'day' : 'days'}`
        : null

  return (
    <div className="space-y-2">

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

      {/* Quick stats */}
      <QuickStats phase={phaseResult.phase} />

      {/* Expandable tip sections */}
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
