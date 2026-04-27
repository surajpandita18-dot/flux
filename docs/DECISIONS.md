# Decisions log

## 2025 — Project start
- Stack chosen: Next.js 14, Tailwind, TypeScript, Supabase, Claude API
- Model chosen: claude-sonnet-4-20250514 (cost-efficient for MVP)
- Budget: zero — free tiers only
- Partner feature: opt-in, women-controlled. Decision made by PM (Suraj).
- Health alerts: "consider speaking with a doctor" framing — never diagnose. Non-negotiable.
- Privacy: Supabase with Row Level Security. No third-party data sharing.

## Sprint 0 — Setup

### Decision: Next.js manual scaffold (not create-next-app)
- Date: 2026-04-27
- Decision: Manually created package.json, tsconfig.json, next.config.ts, tailwind.config.ts, postcss.config.mjs, layout.tsx, page.tsx instead of using create-next-app
- Rationale: create-next-app refuses to initialize in non-empty directories. The Flux OS files (CLAUDE.md, docs/, db/, etc.) were already present.
- Made by: FORGE (ARIA approved)

### Decision: Accept Next.js 14.x security vulnerabilities for beta
- Date: 2026-04-27
- Decision: Proceeding with Next.js 14.2.35 despite known DoS vulnerabilities (GHSA-9g9p-9gw9-jx7f, GHSA-h25m-26qc-wcjf, GHSA-ggv3-7p47-pfv8, GHSA-3x4c-7xq6-9pq8, GHSA-q4gf-8mx6-v5v3)
- Rationale: Fix requires upgrading to Next.js 16 (breaking change). Beta audience is 5-10 invited users via WhatsApp — DoS risk negligible at this scale.
- Revisit: Before any public launch beyond closed beta.
- Made by: ARIA (PM Suraj informed)

### Decision: darkMode strategy changed from "class" to "media"
- Date: 2026-04-27
- Decision: Changed Tailwind `darkMode` from `"class"` to `"media"` so dark mode follows OS preference.
- Rationale: No theme toggle exists and none is in PRD scope. With "class" strategy, all `dark:` classes in the codebase were permanently inactive. "media" strategy activates them based on `prefers-color-scheme`.
- Made by: ARIA (bug fix)

### Decision: phaseEngine uses modulo for cycle rollover
- Date: 2026-04-27
- Decision: When totalElapsedDays > cycleLengthAvg (user hasn't logged new period), use modulo arithmetic to roll over gracefully instead of throwing an error.
- Rationale: Users may forget to log. App should degrade gracefully, not crash.
- Made by: FORGE
