# ORACLE system updates

## Run 0 — Project start
- All agents initialized
- No patterns yet — first run after Sprint 3

---

## Run 1 — 2026-04-27 (end of Sprint 0)

### Top patterns found:

1. **FORGE had no fallback for environment setup failure**
   - Evidence: create-next-app failed with "directory contains files that could conflict." FORGE had to manually scaffold. No instruction covered this case.
   - Root cause: FORGE CLAUDE.md said "initialize Next.js 14 project" with no contingency for non-empty directory.

2. **SAGE produced placeholder string in array field**
   - Evidence: phases.json ovulation.exercise.avoid = `["nothing — this is your strongest week, listen to what feels exciting"]` instead of `[]`. Caught by FORGE in Notes for LENS, not by LENS (which hadn't run yet).
   - Root cause: SAGE CLAUDE.md had no rule about empty arrays. LENS checklist had no JSON content validation item.

3. **DECISIONS.md not updated for non-trivial decisions**
   - Evidence: Next.js security vulnerability acceptance and manual setup workaround both happened but weren't logged. If this project is revisited in 3 months, the "why" would be missing.
   - Root cause: ARIA CLAUDE.md only required PROJECT_STATE.md updates — no mention of DECISIONS.md for risk acceptances and deviations.

### Proposed agent updates applied:

| Agent | What changed | Why |
|-------|-------------|-----|
| FORGE | Added ENVIRONMENT SETUP RULE — fallback scaffold instructions + mandatory npm audit logging | Prevents silent setup failures |
| SAGE | Added JSON RULES section — empty arrays must be [], no placeholder strings | Prevents content format bugs |
| LENS | Added checklist items 11 (JSON validation) and 12 ('use client' directive) | Catches SAGE format bugs + Next.js RSC common mistake |
| ARIA | Added DECISIONS.md update rule for non-trivial decisions | Preserves rationale for future sessions |

### Research insights applied:
- Next.js App Router: Server Components are default. Components using useState/useEffect need 'use client'. Added to LENS checklist item 12 — will catch this before FORGE ships broken components in Sprint 1.
- Supabase RLS: All 5 tables have RLS enabled with explicit policies. Secure RPC function used for partner access (not raw table read). Pattern is solid — no changes needed to SEED.

### Evaluation improvement suggestions:
- LENS should be run on SAGE outputs (phases.json) as well as FORGE outputs. Currently LENS instructions only mention reviewing "everything FORGE builds." Recommend: add "SAGE content files (phases.json) should be reviewed by LENS after first write."

### Next ORACLE run: After Sprint 3
