import type { Phase } from '@/lib/phaseEngine'

interface Props {
  phase: Phase
}

const stats: Record<Phase, [string, string, string, string, string, string]> = {
  menstrual:  ['🪫', 'Low',          '🧘', 'Gentle',   '🌙', 'Low fertility'],
  follicular: ['🔋', 'Rising',       '🏃', 'Building', '🌱', 'Low fertility'],
  ovulation:  ['⚡', 'Peak',         '💪', 'Intense',  '🌸', 'Fertile window'],
  luteal:     ['🌅', 'Winding down', '🚶', 'Gentle',   '🌙', 'Low fertility'],
}

const accent: Record<Phase, string> = {
  menstrual:  'bg-menstrual-soft  dark:bg-menstrual-soft-dark  text-menstrual',
  follicular: 'bg-follicular-soft dark:bg-follicular-soft-dark text-follicular',
  ovulation:  'bg-ovulation-soft  dark:bg-ovulation-soft-dark  text-ovulation',
  luteal:     'bg-luteal-soft     dark:bg-luteal-soft-dark     text-luteal',
}

export default function QuickStats({ phase }: Props) {
  const [ei, el, mi, ml, fi, fl] = stats[phase]
  const cls = accent[phase]

  return (
    <div className="grid grid-cols-3 gap-2">
      {[
        { icon: ei, label: el, sub: 'Energy'    },
        { icon: mi, label: ml, sub: 'Movement'  },
        { icon: fi, label: fl, sub: 'Fertility' },
      ].map(({ icon, label, sub }) => (
        <div
          key={sub}
          className={`${cls} rounded-2xl p-3.5 flex flex-col items-center gap-1 text-center`}
        >
          <span className="text-2xl leading-none">{icon}</span>
          <span className="text-[13px] font-bold leading-tight text-[#1A1814] dark:text-[#F5F3F0]">{label}</span>
          <span className="text-[11px] font-medium text-[#5C5754] dark:text-[#A8A4A0]">{sub}</span>
        </div>
      ))}
    </div>
  )
}
