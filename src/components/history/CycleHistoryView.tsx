'use client'

import { useState } from 'react'
import type { CycleLog, DailyLog } from '@/types/database'

interface CycleEntry {
  month: string
  length: number | null
  period: number | null
  ongoing: boolean
  startDate: string
}

interface CompareData {
  currentStart: string | null
  prevStart: string | null
  daysBetween: number | null
  currentPeriodLen: string
  prevPeriodLen: string | null
  avgCycleLen: number | null
  range: string | null
}

interface Insight {
  kind: 'pattern' | 'shift' | 'symptom'
  title: string
  detail: string
}

interface Props {
  cycles: CycleLog[]
  recentLogs: DailyLog[]
}

function buildCycleEntries(cycles: CycleLog[]): CycleEntry[] {
  const sorted = [...cycles].sort((a, b) => a.period_start_date.localeCompare(b.period_start_date))
  return sorted.map((c, i) => {
    const next = sorted[i + 1]
    const length = next
      ? Math.round((new Date(next.period_start_date).getTime() - new Date(c.period_start_date).getTime()) / 86400000)
      : null
    const periodLen = c.period_end_date
      ? Math.round((new Date(c.period_end_date).getTime() - new Date(c.period_start_date).getTime()) / 86400000) + 1
      : null
    const ongoing = !next
    const month = new Date(c.period_start_date).toLocaleDateString('en-US', { month: 'short' })
    return { month, length, period: periodLen, ongoing, startDate: c.period_start_date }
  }).reverse()
}

function buildCompare(cycles: CycleLog[]): CompareData {
  const sorted = [...cycles].sort((a, b) => b.period_start_date.localeCompare(a.period_start_date))
  const cur = sorted[0] ?? null
  const prev = sorted[1] ?? null

  const daysBetween = cur && prev
    ? Math.round((new Date(cur.period_start_date).getTime() - new Date(prev.period_start_date).getTime()) / 86400000)
    : null

  const currentPeriodLen = cur?.period_end_date
    ? String(Math.round((new Date(cur.period_end_date).getTime() - new Date(cur.period_start_date).getTime()) / 86400000) + 1) + ' days'
    : 'ongoing'

  const prevPeriodLen = prev?.period_end_date
    ? String(Math.round((new Date(prev.period_end_date).getTime() - new Date(prev.period_start_date).getTime()) / 86400000) + 1) + ' days'
    : null

  const lengths: number[] = []
  const asc = [...cycles].sort((a, b) => a.period_start_date.localeCompare(b.period_start_date))
  for (let i = 0; i < asc.length - 1; i++) {
    const l = Math.round((new Date(asc[i + 1]!.period_start_date).getTime() - new Date(asc[i]!.period_start_date).getTime()) / 86400000)
    if (l > 0) lengths.push(l)
  }
  const avgCycleLen = lengths.length ? Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length) : null
  const range = lengths.length >= 2 ? `${Math.min(...lengths)}–${Math.max(...lengths)}` : null

  return {
    currentStart: cur ? new Date(cur.period_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null,
    prevStart: prev ? new Date(prev.period_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null,
    daysBetween,
    currentPeriodLen,
    prevPeriodLen,
    avgCycleLen,
    range,
  }
}

function buildInsights(cycles: CycleLog[], recentLogs: DailyLog[]): Insight[] {
  const insights: Insight[] = []

  // Symptom pattern from daily logs
  const symptomCount: Record<string, number> = {}
  for (const log of recentLogs) {
    for (const s of log.symptoms ?? []) {
      symptomCount[s] = (symptomCount[s] ?? 0) + 1
    }
  }
  const topSymptom = Object.entries(symptomCount).sort((a, b) => b[1] - a[1])[0]
  if (topSymptom && topSymptom[1] >= 2) {
    insights.push({
      kind: 'symptom',
      title: `${topSymptom[0].toLowerCase()} appears in your logs`,
      detail: `You've noted ${topSymptom[0].toLowerCase()} ${topSymptom[1]} times across recent check-ins. Tracking patterns over time can reveal timing.`,
    })
  }

  // Cycle length variation
  const asc = [...cycles].sort((a, b) => a.period_start_date.localeCompare(b.period_start_date))
  const lengths: number[] = []
  for (let i = 0; i < asc.length - 1; i++) {
    const l = Math.round((new Date(asc[i + 1]!.period_start_date).getTime() - new Date(asc[i]!.period_start_date).getTime()) / 86400000)
    if (l > 0) lengths.push(l)
  }
  if (lengths.length >= 2) {
    const avg = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length)
    const variation = Math.max(...lengths) - Math.min(...lengths)
    if (variation <= 3) {
      insights.push({
        kind: 'pattern',
        title: `your cycle is remarkably regular`,
        detail: `Across the last ${lengths.length} cycles, your length varied by just ${variation} days. Staying in rhythm with your body.`,
      })
    } else {
      insights.push({
        kind: 'shift',
        title: `some variation in your cycle length`,
        detail: `Your recent cycles ranged ${Math.min(...lengths)}–${Math.max(...lengths)} days, averaging ${avg}. This is within the normal range.`,
      })
    }
  }

  // Energy pattern
  const energyMap: Record<string, number> = { low: 0, medium: 0, high: 0 }
  for (const log of recentLogs) energyMap[log.energy_level] = (energyMap[log.energy_level] ?? 0) + 1
  const mostCommonEnergy = Object.entries(energyMap).sort((a, b) => b[1] - a[1])[0]
  if (mostCommonEnergy && mostCommonEnergy[1] >= 3) {
    const label = mostCommonEnergy[0] === 'low' ? 'low' : mostCommonEnergy[0] === 'medium' ? 'okay' : 'good'
    insights.push({
      kind: 'pattern',
      title: `${label} energy shows up most often`,
      detail: `${mostCommonEnergy[1]} of your recent check-ins noted ${label} energy. Patterns across phases become clearer with more logs.`,
    })
  }

  return insights.slice(0, 3)
}

// ── Bar chart ─────────────────────────────────────────────────────
function CycleBars({ cycles, avgLen }: { cycles: CycleEntry[]; avgLen: number }) {
  const ordered = [...cycles].reverse().slice(0, 6)
  const minLen = 20, maxLen = 36, H = 120, barW = 26, gap = 10

  const avgY = H - ((avgLen - minLen) / (maxLen - minLen)) * H

  return (
    <div style={{ position: 'relative', overflowX: 'auto' }}>
      <svg
        width={ordered.length * (barW + gap)}
        height={H + 26}
        viewBox={`0 0 ${ordered.length * (barW + gap)} ${H + 26}`}
        style={{ display: 'block', minWidth: '100%' }}
        aria-hidden
      >
        {/* Average band */}
        <rect x="0" y={avgY - 6} width={ordered.length * (barW + gap)} height="12" fill="#1F4E4A" opacity="0.08" />
        <line x1="0" y1={avgY} x2={ordered.length * (barW + gap)} y2={avgY} stroke="#1F4E4A" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />

        {ordered.map((c, i) => {
          const x = i * (barW + gap) + 2
          const len = c.length ?? 28
          const period = c.period ?? 3
          const lenH = ((len - minLen) / (maxLen - minLen)) * H
          const periodH = (period / (maxLen - minLen)) * H

          return (
            <g key={i}>
              {/* Cycle bar — saffron */}
              <rect x={x} y={H - lenH} width={barW - 8} height={lenH}
                rx="4"
                fill={c.ongoing ? 'transparent' : '#E8A33D'}
                stroke={c.ongoing ? '#E8A33D' : 'none'}
                strokeWidth={c.ongoing ? 1.5 : 0}
                strokeDasharray={c.ongoing ? '3 3' : undefined}
                opacity={c.ongoing ? 0.7 : 0.85}
              />
              {/* Period overlay — earthy accent */}
              {!c.ongoing && (
                <rect x={x} y={H - periodH} width={barW - 8} height={periodH}
                  rx="3" fill="#C76B4A" opacity="0.9"
                />
              )}
              {/* Month label */}
              <text x={x + (barW - 8) / 2} y={H + 14}
                textAnchor="middle" fontSize="10" fill="#8FA09E" fontWeight="600" letterSpacing="0.5">
                {c.month.toUpperCase()}
              </text>
              {/* Length label */}
              {!c.ongoing && len > 0 && (
                <text x={x + (barW - 8) / 2} y={H - lenH - 4}
                  textAnchor="middle" fontSize="10" fill="#1F4E4A" fontWeight="600">
                  {len}
                </text>
              )}
              {c.ongoing && (
                <text x={x + (barW - 8) / 2} y={H - 8}
                  textAnchor="middle" fontSize="10" fill="#B97A1F" fontWeight="600" fontStyle="italic">
                  now
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ── Compare cell ──────────────────────────────────────────────────
function CompareCell({ label, now, prev, note, fullWidth }: {
  label: string; now: string; prev: string | null; note: string; fullWidth?: boolean
}) {
  return (
    <div style={{
      gridColumn: fullWidth ? '1 / -1' : 'auto',
      padding: '12px 14px',
      background: '#F2E8D9',
      borderRadius: 14,
      border: '1px solid rgba(31,78,74,0.08)',
    }}>
      <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#8FA09E', margin: 0 }}>
        {label}
      </p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 6 }}>
        <span className="serif" style={{ fontSize: 16, fontWeight: 600, color: '#1F4E4A' }}>{now}</span>
        {prev && <span style={{ fontSize: 11, color: '#8FA09E' }}>vs {prev}</span>}
      </div>
      <p className="serif-italic" style={{ fontSize: 11, color: '#3F5A57', margin: '4px 0 0' }}>{note}</p>
    </div>
  )
}

// ── Insight card ──────────────────────────────────────────────────
function InsightCard({ insight }: { insight: Insight }) {
  const tints = {
    pattern: { bg: '#D4E1DF', fg: '#1F4E4A' },
    shift:   { bg: '#FBE7C2', fg: '#B97A1F' },
    symptom: { bg: '#F8DFD3', fg: '#9B4F33' },
  }
  const t = tints[insight.kind]

  return (
    <div className="card" style={{ borderRadius: 18, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {insight.kind === 'pattern' && (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <circle cx="5" cy="5" r="2" fill={t.fg} />
            <circle cx="13" cy="5" r="1.4" fill={t.fg} opacity="0.7" />
            <circle cx="5" cy="13" r="1.4" fill={t.fg} opacity="0.7" />
            <circle cx="13" cy="13" r="2" fill={t.fg} />
            <path d="M5 5 L13 13 M13 5 L5 13" stroke={t.fg} strokeWidth="0.8" opacity="0.4" />
          </svg>
        )}
        {insight.kind === 'shift' && (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path d="M3 12 L7 8 L10 11 L15 5" stroke={t.fg} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="15" cy="5" r="1.6" fill={t.fg} />
          </svg>
        )}
        {insight.kind === 'symptom' && (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path d="M9 14 S3 10.5 3 7 a 2.8 2.8 0 0 1 6 -0.8 a 2.8 2.8 0 0 1 6 0.8 c0 3.5 -6 7 -6 7 z" fill={t.fg} opacity="0.85" />
          </svg>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: t.fg, margin: 0 }}>
          {insight.kind}
        </p>
        <p style={{ fontSize: 14, fontWeight: 500, color: '#1F4E4A', margin: '3px 0 0', lineHeight: 1.4, letterSpacing: '-0.1px' }}>
          {insight.title}
        </p>
        <p style={{ fontSize: 12, color: '#3F5A57', margin: '6px 0 0', lineHeight: 1.5 }}>
          {insight.detail}
        </p>
      </div>
    </div>
  )
}

// ── Recent logs list ──────────────────────────────────────────────
function RecentLogsList({ logs }: { logs: DailyLog[] }) {
  const energyBars = (level: string) => level === 'high' ? 3 : level === 'medium' ? 2 : 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {logs.map((log, i) => {
        const isLast = i === logs.length - 1
        const bars = energyBars(log.energy_level)
        const date = new Date(log.log_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        return (
          <div key={log.id} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
            borderBottom: isLast ? 'none' : '1px solid rgba(31,78,74,0.08)',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: 99, background: '#C76B4A', flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: '#1F4E4A', minWidth: 60 }}>{date}</span>
            <span className="serif-italic" style={{ fontSize: 12, color: '#8FA09E', minWidth: 60 }}>{log.mood}</span>
            <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 10 }}>
              {[1, 2, 3].map(n => (
                <span key={n} style={{
                  width: 2.5, borderRadius: 1.5,
                  height: n === 1 ? 4 : n === 2 ? 7 : 10,
                  background: n <= bars ? '#C76B4A' : 'rgba(31,78,74,0.10)',
                }} />
              ))}
            </div>
            <span style={{ flex: 1, minWidth: 0, fontSize: 12, color: '#8FA09E', fontStyle: 'italic', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {(log.symptoms ?? []).length === 0 ? '—' : (log.symptoms ?? []).join(', ').toLowerCase()}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ── Legend ────────────────────────────────────────────────────────
function Legend({ dot, line, label }: { dot?: string; line?: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#3F5A57' }}>
      {dot && <span style={{ width: 8, height: 8, borderRadius: 2, background: dot, flexShrink: 0 }} />}
      {line && <span style={{ width: 14, height: 1, background: line, borderTop: `1px dashed ${line}`, flexShrink: 0 }} />}
      {label}
    </span>
  )
}

// ── Main component ────────────────────────────────────────────────
export default function CycleHistoryView({ cycles, recentLogs }: Props) {
  const [logsOpen, setLogsOpen] = useState(false)

  const entries = buildCycleEntries(cycles)
  const compare = buildCompare(cycles)
  const insights = buildInsights(cycles, recentLogs)

  const lengths = entries.filter(e => !e.ongoing && e.length !== null).map(e => e.length!)
  const avgLen  = lengths.length ? Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length) : 28
  const rangeStr = lengths.length >= 2 ? `${Math.min(...lengths)}–${Math.max(...lengths)}` : null

  return (
    <div className="flex flex-col gap-4">

      {/* ── Cycle bar chart ── */}
      <div className="card stagger-rise" style={{ borderRadius: 24, padding: '20px 18px 18px', animationDelay: '60ms' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#1F4E4A', margin: 0 }}>
              cycle length
            </p>
            <p className="serif-italic" style={{ fontSize: 18, fontWeight: 500, color: '#1F4E4A', margin: '4px 0 0', letterSpacing: '-0.2px' }}>
              averaging <span style={{ color: '#B97A1F', fontWeight: 600 }}>{avgLen}</span> days
            </p>
            {rangeStr && (
              <p style={{ fontSize: 12, color: '#3F5A57', margin: '2px 0 0' }}>
                range {rangeStr} · last {lengths.length} cycles
              </p>
            )}
          </div>
          {lengths.length > 0 && (
            <div style={{ padding: '4px 10px', borderRadius: 99, background: '#D4E1DF', fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#1F4E4A' }}>
              {compare.range && (Number(compare.range.split('–')[1]) - Number(compare.range.split('–')[0])) <= 4 ? 'regular' : 'variable'}
            </div>
          )}
        </div>

        {entries.length >= 2 ? (
          <>
            <CycleBars cycles={entries} avgLen={avgLen} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(31,78,74,0.08)' }}>
              <Legend dot="#E8A33D" label="cycle length" />
              <Legend dot="#C76B4A" label="period days" />
              <Legend line="#1F4E4A" label="your average" />
            </div>
          </>
        ) : (
          <p style={{ fontSize: 13, color: '#8FA09E', fontStyle: 'italic' }}>Log 2+ periods to see your chart.</p>
        )}
      </div>

      {/* ── This vs last ── */}
      {compare.currentStart && (
        <div className="card stagger-rise" style={{ borderRadius: 24, padding: '18px', animationDelay: '100ms' }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#1F4E4A', margin: '0 0 14px' }}>
            this cycle vs last
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <CompareCell
              label="started"
              now={compare.currentStart}
              prev={compare.prevStart}
              note={compare.daysBetween ? `${compare.daysBetween} days apart` : 'first logged period'}
            />
            <CompareCell
              label="period length"
              now={compare.currentPeriodLen}
              prev={compare.prevPeriodLen}
              note={compare.currentPeriodLen === 'ongoing' ? 'still in progress' : 'days of bleeding'}
            />
            {compare.avgCycleLen && (
              <CompareCell
                label="cycle average"
                now={`${compare.avgCycleLen} days`}
                prev={compare.range ?? null}
                note={`last ${lengths.length} cycles`}
                fullWidth
              />
            )}
          </div>
        </div>
      )}

      {/* ── Insights ── */}
      {insights.length > 0 && (
        <div className="stagger-rise" style={{ animationDelay: '140ms' }}>
          <div style={{ padding: '0 4px 8px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#1F4E4A', margin: 0 }}>
              patterns we noticed
            </p>
            <p style={{ fontSize: 11, color: '#8FA09E', margin: 0 }}>from your logs</p>
          </div>
          <div className="flex flex-col gap-2.5">
            {insights.map((ins, i) => <InsightCard key={i} insight={ins} />)}
          </div>
        </div>
      )}

      {/* ── Collapsible recent check-ins ── */}
      {recentLogs.length > 0 && (
        <div className="card stagger-rise" style={{ borderRadius: 20, padding: '4px 0 0', overflow: 'hidden', animationDelay: '180ms' }}>
          <button
            onClick={() => setLogsOpen(o => !o)}
            className="w-full tap-scale"
            style={{
              appearance: 'none', border: 'none', cursor: 'pointer',
              width: '100%', padding: '16px 18px', background: 'transparent',
              fontFamily: 'inherit', textAlign: 'left',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}
          >
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#1F4E4A', margin: 0 }}>
                recent check-ins
              </p>
              <p style={{ fontSize: 14, color: '#3F5A57', margin: '4px 0 0' }}>
                {recentLogs.length} {recentLogs.length === 1 ? 'entry' : 'entries'} logged
              </p>
            </div>
            <span style={{
              width: 32, height: 32, borderRadius: 99, background: '#D4E1DF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'transform 240ms ease',
              transform: logsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="M3 4.5 L6 7.5 L9 4.5" stroke="#1F4E4A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
          {logsOpen && (
            <div style={{ padding: '0 18px 16px', animation: 'flux-fade 240ms ease-out both' }}>
              <RecentLogsList logs={recentLogs} />
            </div>
          )}
        </div>
      )}

      {/* Sign-off */}
      <div style={{ textAlign: 'center', padding: '12px 0 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <span style={{ width: 20, height: 1, background: 'rgba(31,78,74,0.12)' }} />
        <span className="serif-italic" style={{ fontSize: 12, color: '#8FA09E', letterSpacing: '0.06em' }}>six months of you · flux</span>
        <span style={{ width: 20, height: 1, background: 'rgba(31,78,74,0.12)' }} />
      </div>
    </div>
  )
}
