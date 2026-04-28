'use client'

import { useState, useEffect } from 'react'
import type { Phase } from '@/lib/phaseEngine'

interface Props { phase: Phase }

const PHASE_ACCENT: Record<Phase, string> = {
  menstrual:  '#C76B4A',
  follicular: '#7A8F5C',
  ovulation:  '#D49A3D',
  luteal:     '#8B6F8C',
}
const PHASE_ACCENT_DEEP: Record<Phase, string> = {
  menstrual:  '#9B4F33',
  follicular: '#566B3F',
  ovulation:  '#9C6E1F',
  luteal:     '#604660',
}
const PHASE_SUPPORT: Record<Phase, string> = {
  menstrual:  '#D89BA8',
  follicular: '#D4B068',
  ovulation:  '#B4844F',
  luteal:     '#B47A8A',
}

const DATA = {
  menstrual: {
    sectionLabel: 'a soft pause',
    breathe: { title: 'box breathing', sub: 'four slow corners — to soothe the cramps' },
    food: {
      title: 'warm nourishment',
      sub: 'iron, warmth, comfort',
      items: [
        { name: 'Ginger tea',        hint: 'with jaggery, slow sips' },
        { name: 'Dal khichdi',       hint: 'soft, warm, restorative' },
        { name: 'Dark chocolate',    hint: 'a small square, no guilt' },
        { name: 'Beetroot · spinach',hint: 'iron, gently replenished' },
      ],
    },
    move: {
      title: 'gentle movement',
      sub: 'low effort, high tenderness',
      items: [
        { name: "Child's pose", time: '3 min' },
        { name: 'Supine twist',       time: '4 min' },
        { name: 'Legs up the wall',   time: '5 min' },
      ],
    },
  },
  follicular: {
    sectionLabel: 'a small spark',
    breathe: { title: 'four–seven breath', sub: 'inhale four, exhale seven — to clear the morning' },
    food: {
      title: 'fresh nourishment',
      sub: 'crisp, light, alive',
      items: [
        { name: 'Sprouted moong',  hint: 'protein for new energy' },
        { name: 'Citrus salad',    hint: 'orange, pomegranate, mint' },
        { name: 'Green smoothie',  hint: 'spinach, banana, ginger' },
        { name: 'Sesame ladoo',    hint: 'one piece, for spark' },
      ],
    },
    move: {
      title: 'light movement',
      sub: 'channel the rising energy',
      items: [
        { name: 'Sun salutations', time: '8 min' },
        { name: 'Brisk walk',      time: '20 min' },
        { name: 'Try a new class', time: 'today' },
      ],
    },
  },
  ovulation: {
    sectionLabel: 'a luminous day',
    breathe: { title: 'open breath', sub: 'inhale wide, exhale longer — to settle the brightness' },
    food: {
      title: 'bright nourishment',
      sub: 'colorful, festive, social',
      items: [
        { name: 'Coconut chutney', hint: 'with hot dosa' },
        { name: 'Mango lassi',     hint: 'cooling, celebratory' },
        { name: 'Salmon · paneer', hint: 'protein for the peak' },
        { name: 'Roasted nuts',    hint: 'a handful, for stamina' },
      ],
    },
    move: {
      title: 'joyful movement',
      sub: 'match the high — gently',
      items: [
        { name: 'Dance for a song',   time: '3 min' },
        { name: 'Vinyasa flow',       time: '15 min' },
        { name: 'Walk with a friend', time: '30 min' },
      ],
    },
  },
  luteal: {
    sectionLabel: 'turn inward',
    breathe: { title: 'cooling breath', sub: 'slow exhale — to soften the edges of late luteal' },
    food: {
      title: 'steadying nourishment',
      sub: 'grounding, slow-burning',
      items: [
        { name: 'Sweet potato',       hint: 'with ghee and salt' },
        { name: 'Banana · oats',      hint: 'magnesium for the mood' },
        { name: 'Pumpkin seeds',      hint: 'a small fistful' },
        { name: 'Dark leafy greens',  hint: 'palak, methi, sautéed' },
      ],
    },
    move: {
      title: 'restorative movement',
      sub: 'soft, slow, kind',
      items: [
        { name: 'Yin yoga',    time: '15 min' },
        { name: 'Gentle walk', time: '20 min' },
        { name: 'Savasana',    time: '10 min' },
      ],
    },
  },
} as const

export default function PhaseActions({ phase }: Props) {
  const d = DATA[phase]
  const accent     = PHASE_ACCENT[phase]
  const accentDeep = PHASE_ACCENT_DEEP[phase]
  const support    = PHASE_SUPPORT[phase]

  const seg = (i: number): React.CSSProperties => ({
    animation: `flux-stagger-rise 520ms cubic-bezier(0.22,1,0.36,1) ${300 + i * 80}ms both`,
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Section divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px 0', ...seg(0) }}>
        <span style={{ flex: 1, height: 1, background: 'var(--divider)' }} />
        <span className="serif-italic" style={{ fontSize: 12, color: accentDeep, letterSpacing: '0.08em', fontWeight: 500 }}>
          {d.sectionLabel}
        </span>
        <span style={{ flex: 1, height: 1, background: 'var(--divider)' }} />
      </div>

      <BreathingCard title={d.breathe.title} sub={d.breathe.sub} accent={accent} accentDeep={accentDeep} support={support} style={seg(1)} />
      <NourishCard food={d.food} accent={accent} accentDeep={accentDeep} support={support} style={seg(2)} />
      <MoveCard move={d.move} accent={accent} accentDeep={accentDeep} support={support} style={seg(3)} />
    </div>
  )
}

// ── Breathing widget ─────────────────────────────────────────────
interface CardProps { accent: string; accentDeep: string; support: string; style?: React.CSSProperties }

function BreathingCard({ title, sub, accent, accentDeep, support, style }: CardProps & { title: string; sub: string }) {
  const [running, setRunning] = useState(false)
  const [breathPhase, setBreathPhase] = useState(0) // 0 in, 1 hold, 2 out, 3 hold
  const labels = ['inhale', 'hold', 'exhale', 'hold']

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setBreathPhase(p => (p + 1) % 4), 4000)
    return () => clearInterval(id)
  }, [running])

  const filled = running
    ? (breathPhase === 0 || breathPhase === 1 ? 1 : 0.38)
    : 0.55

  return (
    <div className="card" style={{ padding: '18px', ...style }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <BreatheGlyph c={accent} />
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase' as const, color: accentDeep }}>breathe</span>
          </div>
          <p className="serif-italic" style={{ fontSize: 17, fontWeight: 500, color: 'var(--ink-h)', margin: '0 0 4px', letterSpacing: '-0.2px' }}>
            {title}
          </p>
          <p className="serif" style={{ fontSize: 13, color: 'var(--ink-b)', margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>
            {sub}
          </p>
          <button
            onClick={() => { setRunning(r => !r); setBreathPhase(0) }}
            style={{
              appearance: 'none' as const, border: `1px solid ${accent}`, cursor: 'pointer',
              background: running ? accent : 'transparent',
              color: running ? '#FBF6EE' : accentDeep,
              fontFamily: 'inherit', fontSize: 12, fontWeight: 600, letterSpacing: '0.06em',
              padding: '6px 14px', borderRadius: 999, marginTop: 10,
              transition: 'all 200ms ease',
            }}
          >
            {running ? `${labels[breathPhase]}…` : 'try one round'}
          </button>
        </div>

        {/* Animated square */}
        <div style={{ width: 76, height: 76, position: 'relative', flexShrink: 0, marginTop: 4 }}>
          <div style={{ position: 'absolute', inset: 0, border: '1.5px solid var(--divider)', borderRadius: 14 }} />
          <div style={{
            position: 'absolute', inset: 6, borderRadius: 10,
            background: `linear-gradient(135deg, ${accent} 0%, ${support} 100%)`,
            transformOrigin: 'center',
            transform: `scale(${filled})`,
            opacity: running ? 0.85 : 0.45,
            transition: 'transform 4s ease-in-out, opacity 600ms ease',
          }} />
        </div>
      </div>
    </div>
  )
}

// ── Nourishment card ────────────────────────────────────────────
type FoodItem = { name: string; hint: string }
interface NourishProps extends CardProps {
  food: { title: string; sub: string; items: readonly FoodItem[] }
}
function NourishCard({ food, accent, accentDeep, support, style }: NourishProps) {
  return (
    <div className="card" style={{ padding: '18px 0 16px', ...style }}>
      <div style={{ padding: '0 18px', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <BowlGlyph c={accent} />
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase' as const, color: accentDeep }}>nourish</span>
        </div>
        <p className="serif-italic" style={{ fontSize: 17, fontWeight: 500, color: 'var(--ink-h)', margin: '0 0 4px' }}>{food.title}</p>
        <p className="serif" style={{ fontSize: 13, color: 'var(--ink-b)', margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>{food.sub}</p>
      </div>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '4px 18px', WebkitOverflowScrolling: 'touch' }}>
        {food.items.map((it, i) => (
          <div key={i} style={{
            flexShrink: 0, width: 126,
            background: hexToRgba(support, 0.28),
            borderRadius: 16, padding: '12px 11px',
            border: `1px solid ${hexToRgba(support, 0.35)}`,
          }}>
            <FoodMark i={i} c={accentDeep} />
            <p className="serif-italic" style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ink-h)', margin: '6px 0 0', lineHeight: 1.25 }}>{it.name}</p>
            <p style={{ fontSize: 11, color: 'var(--ink-b)', margin: '4px 0 0', lineHeight: 1.4, fontWeight: 500 }}>{it.hint}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Movement card ───────────────────────────────────────────────
type MoveItem = { name: string; time: string }
interface MoveProps extends CardProps {
  move: { title: string; sub: string; items: readonly MoveItem[] }
}
function MoveCard({ move, accent, accentDeep, support, style }: MoveProps) {
  return (
    <div className="card" style={{ padding: '18px', ...style }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <MoveGlyph c={accent} />
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase' as const, color: accentDeep }}>move</span>
        </div>
        <p className="serif-italic" style={{ fontSize: 17, fontWeight: 500, color: 'var(--ink-h)', margin: '0 0 4px' }}>{move.title}</p>
        <p className="serif" style={{ fontSize: 13, color: 'var(--ink-b)', margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>{move.sub}</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {move.items.map((it, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '11px 0',
            borderBottom: i < move.items.length - 1 ? '1px solid var(--divider)' : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                width: 28, height: 28, borderRadius: 999,
                background: hexToRgba(support, 0.30),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <PlayGlyph c={accentDeep} />
              </span>
              <span className="serif" style={{ fontSize: 15, color: 'var(--ink-h)', fontWeight: 400 }}>{it.name}</span>
            </div>
            <span className="serif-italic" style={{ fontSize: 13, color: accentDeep, fontWeight: 500 }}>{it.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Mini glyphs ─────────────────────────────────────────────────
function BreatheGlyph({ c }: { c: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="5.5" stroke={c} strokeWidth="1.4" fill="none" opacity="0.4" />
      <circle cx="7" cy="7" r="3"   stroke={c} strokeWidth="1.4" fill="none" opacity="0.7" />
      <circle cx="7" cy="7" r="1.2" fill={c} />
    </svg>
  )
}
function BowlGlyph({ c }: { c: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M2 7 H12 a 0 0 0 0 1 -5 5 a 5 5 0 0 1 -5 -5 z" fill={c} opacity="0.85" />
      <path d="M5 4 Q 6 2.5, 7 4 Q 8 5.5, 9 4" stroke={c} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7" />
    </svg>
  )
}
function MoveGlyph({ c }: { c: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="7" cy="3" r="1.6" fill={c} />
      <path d="M5 7 L7 5 L9 7 L8 12 M7 5 L7 9 M5 9 L9 9" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}
function PlayGlyph({ c }: { c: string }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path d="M3 2 L8 5 L3 8 Z" fill={c} />
    </svg>
  )
}
function FoodMark({ i, c }: { i: number; c: string }) {
  const marks = [
    <path key="leaf" d="M6 13 V8 M6 9 C 3 9, 1.5 7.5, 1.5 5 C 4 5, 6 6.5, 6 9 M6 10 C 9 10, 10.5 8.5, 10.5 6 C 8 6, 6 7.5, 6 10" stroke={c} strokeWidth="1.2" strokeLinecap="round" fill="none" />,
    <path key="drop" d="M6 1 C 4 4, 3 6, 3 8 a 3 3 0 0 0 6 0 c 0 -2, -1 -4, -3 -7 z" fill={c} opacity="0.85" />,
    <g key="bowl"><path d="M2 8 H10 a 0 0 0 0 1 -4 4 a 4 4 0 0 1 -4 -4 z" fill={c} opacity="0.85" /><path d="M4 5 Q 5 3.5, 6 5 Q 7 6.5, 8 5" stroke={c} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.6" /></g>,
    <g key="sprout"><path d="M6 13 V7" stroke={c} strokeWidth="1.2" strokeLinecap="round" /><path d="M6 8 C 3 8, 1.5 6, 1.5 3 C 4 3, 6 5, 6 8 Z" fill={c} opacity="0.85" /><path d="M6 10 C 9 10, 10.5 8, 10.5 5 C 8 5, 6 7, 6 10 Z" fill={c} opacity="0.85" /></g>,
  ]
  return (
    <svg width="20" height="20" viewBox="0 0 14 14" fill="none" aria-hidden>
      {marks[i % marks.length]}
    </svg>
  )
}

function hexToRgba(hex: string, a: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${a})`
}
