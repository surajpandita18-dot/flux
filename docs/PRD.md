# Flux — Product Requirements Document v1.0

## Core thesis
"Flux doesn't just track your cycle — it behaves with you through it."

## Target user (MVP)
Primary: Women 22-35, urban, health-aware, smartphone-first, frustrated that period apps are "just calendars."
Secondary: Partners/loved ones who receive curated phase summaries (opt-in only, women-controlled).

## The 4 phases

### Menstrual (Days 1-5) — Rest Mode
- Nutrition: iron-rich foods (lentils, spinach, beets), warm foods, avoid caffeine
- Exercise: yoga, walking, Pilates. No HIIT.
- Mood: low energy is normal, need warmth and comfort
- Partner card: "She's in rest phase. Low-key plans, extra warmth."

### Follicular (Days 6-13) — Build Mode
- Nutrition: fresh fruits, fermented foods (kimchi, sauerkraut), pumpkin seeds, flax seeds
- Exercise: strength training, light cardio, hiking
- Mood: rising energy, creative, social
- Partner card: "Great week for making plans together."

### Ovulation (Days 14-17) — Peak Mode
- Nutrition: cruciferous veg (broccoli, cauliflower, cabbage), anti-inflammatory foods
- Exercise: HIIT ok, peak performance window
- Mood: highest energy, social drive, confidence peak
- Partner card: "Her best week — perfect for an adventure date."
- Pregnancy: fertile window — alert if trying to conceive

### Luteal (Days 18-28) — Protect Mode
- Nutrition: magnesium-rich (dark chocolate, pumpkin seeds, bananas), complex carbs (oats, quinoa)
- Exercise: enjoyable movement only — walks, yoga, what she likes
- Mood: PMS watch, emotional sensitivity, energy dip
- Partner card: "Avoid big confrontational conversations. More patience this week."

## MVP features (build first)
1. Cycle logging: start date, cycle length, flow intensity
2. Phase calculation engine: determines current phase from last period + cycle length
3. Daily phase card: phase name, day number, one nutrition tip, one exercise tip, mood note
4. 3-tap daily log: energy (low/medium/high), mood (3 options), symptoms (optional)
5. Anomaly detection: flag if cycle <21 days, >35 days, or varies >7 days for 3+ cycles
6. Partner portal: opt-in, woman sends WhatsApp invite link, partner sees phase card only

## V2 features (do not build in MVP)
- Pregnancy planning mode
- Calendar integration
- Pattern insights ("You always crash on Day 22")
- Cycle-synced life planner

## Non-negotiable constraints
- Privacy: on-device or Supabase with RLS. No selling data. GDPR compliant.
- Partner feature: 100% opt-in. Woman controls what is shared. Always.
- Health alerts: never diagnose. Always "consider speaking with a doctor."
- Budget: zero. Free tiers only. Claude API: use claude-sonnet-4-20250514, max_tokens 500.

## Success metrics (beta, first 20 users)
- 7-day retention > 60%
- Daily card opens > 70% of active users
- Partner feature activation > 30% of users
