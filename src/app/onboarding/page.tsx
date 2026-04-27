import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OnboardingForm from '@/components/onboarding/OnboardingForm'
import type { UserProfile } from '@/types/database'

export default async function OnboardingPage() {
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

  const profile = data as Pick<UserProfile, 'id'> | null

  // Already onboarded — send home
  if (profile) redirect('/')

  return <OnboardingForm userId={user.id} />
}
