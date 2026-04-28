import { NextResponse }              from 'next/server'
import { createClient }              from '@supabase/supabase-js'
import { sendPushNotification, type PushSubscriptionRow } from '@/lib/webPush'

// POST /api/push/send — sends today's reminder to subscribed users who haven't logged.
// Triggered by a cron at 21:00 local. Requires Authorization: Bearer <CRON_SECRET>.
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }

  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Service role key bypasses RLS — required to read all users' subscriptions
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { persistSession: false } },
  )

  const todayIso = new Date().toISOString().split('T')[0] ?? ''

  // Fetch subscriptions + today's logs in parallel
  const [{ data: subs }, { data: todayLogs }] = await Promise.all([
    supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth, user_id'),
    supabase
      .from('daily_logs')
      .select('user_id')
      .eq('log_date', todayIso),
  ])

  if (!subs || subs.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  const loggedUserIds = new Set((todayLogs ?? []).map((l: { user_id: string }) => l.user_id))
  const pending = (subs as (PushSubscriptionRow & { user_id: string })[]).filter(
    (s) => !loggedUserIds.has(s.user_id),
  )

  // Send all notifications in parallel; remove expired subscriptions
  const results = await Promise.allSettled(
    pending.map((sub) =>
      sendPushNotification(sub, {
        title: 'How are you feeling today?',
        body:  'Take 10 seconds to log your energy and mood.',
        url:   '/log',
      }),
    ),
  )

  // Remove subscriptions that failed (expired/unsubscribed)
  const expiredEndpoints = pending
    .filter((_, i) => results[i]?.status === 'rejected')
    .map((s) => s.endpoint)

  if (expiredEndpoints.length > 0) {
    await supabase
      .from('push_subscriptions')
      .delete()
      .in('endpoint', expiredEndpoints)
  }

  const sent = results.filter((r) => r.status === 'fulfilled').length
  return NextResponse.json({ sent, expired: expiredEndpoints.length })
}
