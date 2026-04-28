import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LogPeriodForm from '@/components/period/LogPeriodForm'
import type { UserProfile } from '@/types/database'

export default async function PeriodPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  const { data } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!(data as Pick<UserProfile, 'id'> | null)) redirect('/onboarding')

  const todayIso = new Date().toISOString().split('T')[0] ?? ''

  return <LogPeriodForm userId={user.id} todayIso={todayIso} />
}
