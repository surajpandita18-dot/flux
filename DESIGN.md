# Design System — Flux

## Visual Reference

Soft, warm, approachable. Women's health with warmth — not clinical dashboards, not girlboss pink. The tone is "trusted knowledgeable friend". Inspired by the pastel-ring cycle tracker reference provided by Suraj (Apr 28 2026).

## Color Strategy: Committed

One rose-pink primary accent carries interactive states across all phases. Phase colors are soft/pastel — used for rings, history bars, and soft backgrounds only. They never appear on CTA buttons.

---

## Palette

### Surface
| Token              | Light          | Dark       | Usage                        |
|--------------------|----------------|------------|------------------------------|
| `surface`          | `#FBF8F5`      | `#111110`  | App background (warm cream)  |
| `surface-card`     | `#FFFFFF`      | `#1C1B1A`  | Card background              |
| `surface-card-2`   | `#F7F4F1`      | `#252320`  | Secondary card / input bg    |

### Primary accent (CTA, interactive states, today dot)
| Token         | Value     | Usage                           |
|---------------|-----------|---------------------------------|
| `rose`        | `#E8627C` | All CTAs, "Log Period" button, today indicator, active tabs |
| `rose-soft`   | `#FCEEF1` | Chip selection background |

### Phase colors (ring segments, history pills, soft phase backgrounds)
| Phase      | Ring/Pill color | Soft bg    | Dark soft bg |
|------------|-----------------|------------|--------------|
| Menstrual  | `#F4A0B4`       | `#FDF2F5`  | `#3D1020`    |
| Follicular | `#8CCBA8`       | `#EFF7F3`  | `#0E2D1E`    |
| Ovulation  | `#F5D07A`       | `#FBF6E6`  | `#3D2D08`    |
| Luteal     | `#A8C4E8`       | `#EEF3FB`  | `#0E2040`    |

### Neutral text
| Token | Light     | Dark      |
|-------|-----------|-----------|
| H1    | `#1A1814` | `#F5F3F0` |
| Body  | `#5C5754` | `#A8A4A0` |
| Muted | `#A8A4A0` | `#5C5754` |

---

## Typography

System font stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`

| Role        | Size  | Weight | Tracking |
|-------------|-------|--------|----------|
| H1 (name)   | 28px  | 800    | -0.5px   |
| Phase name  | 20px  | 700    | -0.3px   |
| Day number  | 40px  | 800    | -1px     |
| Body        | 15px  | 400    | 0        |
| Label       | 11px  | 700    | +0.12em  |
| Caption     | 12px  | 400    | 0        |

---

## Spacing & Radius

- Screen padding: 16px horizontal
- Card radius: 24px (rounded-3xl)
- Chip/pill radius: 999px (rounded-full)
- Card gap: 12px
- Section gap: 24px

---

## Key Components

### Phase Ring (hero element on home screen)
- SVG donut chart, radius 70, stroke-width 18
- 4 arc segments: menstrual (18%), follicular (25%), ovulation (18%), luteal (39%)
- Current phase arc is full opacity; others at 40% opacity
- Mascot SVG centered inside the ring
- Day number above mascot, phase name below
- Card background: soft version of current phase color

### History pills
- Horizontal row of pill-shaped day indicators
- Height: 10px, width: 12px, gap: 2px, border-radius: full
- Color per day based on phase that day fell in

### Week strip (above phase ring)
- 7 columns: Sun–Sat
- Today column has rose-pink circle background
- Period days have menstrual-soft background
- Ovulation window has ovulation-soft background

### Bottom tab bar
- 5 tabs: Home, Insights, Log, History, Settings
- Active tab: rose-pink icon + label
- Inactive: muted gray

### CTA button
- Full width, 54px min-height, rounded-2xl
- Background: `#1A1814` (not rose — rose is for secondary/period CTAs)
- Primary log: dark. Period log: rose.

---

## Gradients (log screen phase headers)

Soft pastel gradients — NOT vivid/saturated:

```
menstrual:  #FECDD3 → #FB7185 → #E8627C   (soft rose, not alarm red)
follicular: #BBF7D0 → #4ADE80 → #16A34A   (sage, not neon)
ovulation:  #FEF9C3 → #FDE047 → #CA8A04   (warm gold)
luteal:     #DDD6FE → #A78BFA → #7C3AED   (soft mauve)
```

---

## Anti-patterns

- No pure `#000` or `#fff` — always tinted
- No saturated red/orange/purple as large fills — pastel only for phase areas
- No clinical gray backgrounds
- No gradient on the main app background — flat warm cream only
- Never use phase colors on primary CTA buttons — rose pink or near-black only
