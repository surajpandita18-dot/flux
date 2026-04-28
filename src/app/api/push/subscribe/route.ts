import { NextResponse }    from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies }          from 'next/headers'
import { getVapidPublicKey } from '@/lib/webPush'

// GET /api/push/subscribe — returns VAPID public key so frontend can subscribe
export async function GET() {
  return NextResponse.json({ publicKey: getVapidPublicKey() })
}

// POST /api/push/subscribe — stores a PushSubscription for the current user
export async function POST(request: Request) {
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

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as {
    endpoint: string
    keys: { p256dh: string; auth: string }
  }

  if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
  }

  // Upsert on endpoint so re-subscribing is idempotent
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      {
        user_id:  user.id,
        endpoint: body.endpoint,
        p256dh:   body.keys.p256dh,
        auth:     body.keys.auth,
      },
      { onConflict: 'endpoint' },
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
