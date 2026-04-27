# Project state

## Current sprint: Sprint 1 — Core loop
## Sprint goal: Full core loop working — auth → onboarding → home phase card

## Completed tasks:

### Sprint 0 ✅
- [x] OS files + ORACLE improvements
- [x] phases.json (SAGE)
- [x] Next.js 14.2.35 initialized (FORGE)
- [x] 001_initial_schema.sql — 5 tables, 20 RLS policies (SEED)
- [x] phaseEngine.ts — LENS PASS (FORGE)

### Sprint 1 Wave A ✅
- [x] FORGE: src/lib/supabase/client.ts — browser Supabase client
- [x] FORGE: src/lib/supabase/server.ts — server Supabase client (SSR)
- [x] FORGE: src/middleware.ts — auth session refresh + route protection
- [x] FORGE: src/types/database.ts — typed DB row interfaces
- [x] FORGE: src/lib/phases.ts — typed phases.json wrapper
- [x] FORGE: src/app/auth/page.tsx — magic link sign-in form
- [x] FORGE: src/app/auth/callback/route.ts — Supabase auth callback handler
- [x] FORGE: src/app/onboarding/page.tsx — profile setup (server + redirect logic)
- [x] FORGE: src/components/onboarding/OnboardingForm.tsx — onboarding form (client)
- [x] FORGE: src/app/page.tsx — home screen with phase card (server component)
- [x] FORGE: src/components/phase/PhaseCard.tsx — phase card UI (4 tip sections)
- [x] TypeScript: 0 errors. No console.log. 'use client' correctly placed.

### Sprint 1 Wave B ✅ — LENS PASS
- [x] src/components/daily/DailyLogForm.tsx — 3-tap energy/mood/symptoms (client)
- [x] src/app/log/page.tsx — daily log page (form or today's summary)
- [x] src/app/page.tsx — "Log how you feel" / "Logged today ✓" CTA added
- [x] TypeScript: 0 errors. No console.log. 'use client' on all client components.

## In progress:
- [ ] Suraj: Create Supabase project + run migration SQL (blocker for all Sprint 2 features)

## Completed since last update:
- [x] ARIA/FORGE: 5 code bugs fixed (2026-04-27)
  - darkMode "class" → "media" (dark: classes were dead code with no toggle)
  - Inter font loaded via next/font/google + applied via font-sans
  - Metadata Viewport deprecated fields moved to separate Viewport export
  - calculatePhase wrapped in try/catch on home page (RangeError crash path)
  - Phase card soft backgrounds now have dark mode variants
- [x] ARIA/FORGE: Empathy design pass (2026-04-27)
  - Mood picker expanded from 3 generic options to 8 resonant emotional words (tender, grounded, clear, expansive, scattered, anxious, frustrated, withdrawn) — stored as raw text in DB (no constraint on mood column)
  - Post-log success moment added — phase-aware one-liner shown for 2 seconds before redirect home
  - V2 pattern teaser added to home page — appears after 7 logs, disappears after 84 (approx 3 cycles)
- [x] ARIA/FORGE: Sprint 2 — Partner + anomaly detection (2026-04-27)
  - src/lib/anomalyDetection.ts — detects short_cycle, long_cycle, high_variance from period start date history
  - src/app/actions/dismissAnomaly.ts — server action to dismiss flags (updates dismissed_at via RLS-protected UPDATE)
  - src/components/anomaly/AnomalyBanner.tsx — amber dismissible banner, optimistic UI, gentle non-diagnostic copy
  - src/app/page.tsx — runs anomaly detection on every home load; inserts new flags; passes undismissed flags to banner
  - src/app/api/partner/invite/route.ts — POST endpoint creates partner_connections row (is_active: true, woman-controlled)
  - src/components/partner/PartnerInviteForm.tsx — email input + WhatsApp share link generation (uses window.location.origin)
  - src/app/partner/page.tsx — woman's partner management page; lists connections; shows invite form
  - src/components/partner/PartnerPhaseCard.tsx — partner-only phase view (phase name, do/avoid/date_idea — no raw cycle data)
  - src/app/partner/view/[ownerId]/page.tsx — partner's authenticated view; calls get_partner_phase_card RPC; shows PartnerPhaseCard

## Blockers:
- Supabase project not yet created. User needs to: create project at supabase.com → copy .env.local.example → fill NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY → run migration SQL in Supabase SQL editor.

## Decisions log:
See /docs/DECISIONS.md

## ORACLE triggers:
- ORACLE Run 1: ✅ Complete (Sprint 0)
- Next ORACLE run: after Sprint 3
