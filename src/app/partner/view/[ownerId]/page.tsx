import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { calculatePhase } from '@/lib/phaseEngine'
import { getPhaseData } from '@/lib/phases'
import PartnerPhaseCard from '@/components/partner/PartnerPhaseCard'

interface Props {
  params: { ownerId: string }
}

interface PhaseCardRow {
  display_name: string
  last_period_date: string
  cycle_length_avg: number
}

export default async function PartnerViewPage({ params }: Props) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data, error } = await supabase.rpc('get_partner_phase_card', {
    owner_user_id: params.ownerId,
  })

  const rows = data as PhaseCardRow[] | null
  const row = rows?.[0]

  if (error || !row) {
    return (
      <main className="min-h-screen bg-surface dark:bg-surface-dark px-4 flex items-center justify-center">
        <div className="max-w-sm text-center space-y-3 px-4">
          <p className="text-gray-900 dark:text-white font-semibold">
            No access
          </p>
          <p className="text-sm text-gray-400 leading-relaxed">
            This link isn&apos;t connected to your account. Ask the person who shared it to check
            the email they used when adding you.
          </p>
        </div>
      </main>
    )
  }

  let phaseResult
  try {
    phaseResult = calculatePhase(
      new Date(row.last_period_date),
      row.cycle_length_avg,
    )
  } catch {
    return (
      <main className="min-h-screen bg-surface dark:bg-surface-dark px-4 flex items-center justify-center">
        <p className="text-sm text-gray-400">Phase data unavailable right now.</p>
      </main>
    )
  }

  const phaseData = getPhaseData(phaseResult.phase)

  return (
    <main className="min-h-screen bg-surface dark:bg-surface-dark px-4">
      <PartnerPhaseCard
        ownerName={row.display_name}
        phaseResult={phaseResult}
        phaseData={phaseData}
      />
    </main>
  )
}
