import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const emailVal =
    body !== null && typeof body === 'object' && 'email' in body
      ? (body as { email: unknown }).email
      : null
  const email = typeof emailVal === 'string' ? emailVal.trim().toLowerCase() : ''

  if (!email || !email.includes('@') || !email.includes('.')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  const { error } = await supabase.from('partner_connections').insert({
    user_id: user.id,
    partner_email: email,
    is_active: true,
  })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'This partner is already connected.' },
        { status: 409 },
      )
    }
    return NextResponse.json({ error: 'Could not save connection.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
