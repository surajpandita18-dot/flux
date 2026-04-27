import type { PhaseData } from '@/lib/phases'
import type { PhaseResult } from '@/lib/phaseEngine'

const phaseStyles = {
  menstrual:  { dot: 'bg-menstrual',  label: 'text-menstrual',  card: 'bg-menstrual-soft  dark:bg-menstrual-soft-dark'  },
  follicular: { dot: 'bg-follicular', label: 'text-follicular', card: 'bg-follicular-soft dark:bg-follicular-soft-dark' },
  ovulation:  { dot: 'bg-ovulation',  label: 'text-ovulation',  card: 'bg-ovulation-soft  dark:bg-ovulation-soft-dark'  },
  luteal:     { dot: 'bg-luteal',     label: 'text-luteal',     card: 'bg-luteal-soft     dark:bg-luteal-soft-dark'     },
} as const

interface Props {
  ownerName: string
  phaseResult: PhaseResult
  phaseData: PhaseData
}

export default function PartnerPhaseCard({ ownerName, phaseResult, phaseData }: Props) {
  const styles = phaseStyles[phaseResult.phase]
  const firstName = ownerName.split(' ')[0] ?? ownerName
  const partner = phaseData.partner

  return (
    <div className="max-w-sm mx-auto w-full space-y-3 pt-6 pb-10">

      <p className="text-sm text-gray-400 dark:text-gray-500 px-1">
        {firstName}&apos;s week
      </p>

      {/* Phase identity */}
      <div className={`phase-card ${styles.card}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className={`w-2 h-2 rounded-full ${styles.dot}`} />
          <span className={`text-xs font-bold uppercase tracking-widest ${styles.label}`}>
            {phaseData.name}
          </span>
        </div>
        <p className="text-gray-800 dark:text-gray-100 text-[15px] leading-relaxed">
          {partner.phase_summary}
        </p>
      </div>

      {/* How to show up */}
      <div className={`phase-card ${styles.card}`}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
          How to show up
        </p>
        <ul className="space-y-2">
          {partner.do.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
              <span className="mt-1 w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Give space on */}
      <div className={`phase-card ${styles.card}`}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
          Give space on
        </p>
        <ul className="space-y-2">
          {partner.avoid.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
              <span className="mt-1 w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Date idea */}
      <div className={`phase-card ${styles.card}`}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
          Date idea this week
        </p>
        <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed">
          {partner.date_idea}
        </p>
      </div>

    </div>
  )
}
