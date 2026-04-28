import type { Phase } from '@/lib/phaseEngine'

interface Props {
  phase: Phase
}

const stats: Record<Phase, [string, string, string, string, string, string]> = {
  //                  energyIcon  energyLabel   moveIcon  moveLabel    fertilityIcon  fertilityLabel
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
          className={`${cls} rounded-2xl p-3 flex flex-col items-center gap-1 text-center`}
        >
          <span className="text-xl leading-none">{icon}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">{sub}</span>
          <span className="text-[11px] font-semibold leading-tight">{label}</span>
        </div>
      ))}
    </div>
  )
}
