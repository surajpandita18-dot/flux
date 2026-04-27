'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function dismissAnomaly(flagId: string): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('anomaly_flags')
    .update({ dismissed_at: new Date().toISOString() })
    .eq('id', flagId)
    .eq('user_id', user.id)

  revalidatePath('/')
}
