import { NextResponse }              from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies }                   from 'next/headers'
import { sendPushNotification, type PushSubscriptionRow } from '@/lib/webPush'

// POST /api/push/send — sends today's reminder to all subscribed users who haven't logged
// Intended to be triggered by a cron (e.g., Vercel Cron, GitHub Actions) at 21:00 local.
// Protect with CRON_SECRET env var to prevent public triggering.
export async function POST(request: Request) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET ?? ''}`) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string)                         { return cookieStore.get(name)?.value },
        set(name: string, value: string, opts: CookieOptions) { cookieStore.set({ name, value, ...opts }) },
        remove(name: string, opts: CookieOptions) { cookieStore.set({ name, value: '', ...opts }) },
      },
    },
  )

  const todayIso = new Date().toISOString().split('T')[0] ?? ''

  // Find users who have a push subscription but haven't logged today
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth, user_id')

  if (!subs || subs.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  const { data: todayLogs } = await supabase
    .from('daily_logs')
    .select('user_id')
    .eq('log_date', todayIso)

  const loggedUserIds = new Set((todayLogs ?? []).map((l: { user_id: string }) => l.user_id))

  const pending = (subs as (PushSubscriptionRow & { user_id: string })[]).filter(
    (s) => !loggedUserIds.has(s.user_id),
  )

  let sent = 0
  for (const sub of pending) {
    try {
      await sendPushNotification(sub, {
        title: 'How are you feeling today?',
        body:  'Take 10 seconds to log your energy and mood.',
        url:   '/log',
      })
      sent++
    } catch {
      // Subscription may have expired — remove it
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', sub.endpoint)
    }
  }

  return NextResponse.json({ sent })
}
