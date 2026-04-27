import { checkCycleLengthAnomaly, ANOMALY_THRESHOLDS } from '@/lib/phaseEngine'

export type AnomalyFlagType = 'short_cycle' | 'long_cycle' | 'high_variance'

/**
 * Derives anomaly types from an ordered list of period start dates (ISO strings).
 * Requires at least 2 dates to compute any cycle lengths.
 * Requires at least 4 dates (3 cycle lengths) to check high_variance per PRD.
 */
export function detectCycleAnomalies(periodStartDates: string[]): AnomalyFlagType[] {
  if (periodStartDates.length < 2) return []

  const lengths: number[] = []
  for (let i = 1; i < periodStartDates.length; i++) {
    const prevDate = periodStartDates[i - 1]
    const currDate = periodStartDates[i]
    if (!prevDate || !currDate) continue
    const prev = new Date(prevDate)
    const curr = new Date(currDate)
    const days = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24))
    lengths.push(days)
  }

  const detected = new Set<AnomalyFlagType>()

  for (const length of lengths) {
    const { anomalyType } = checkCycleLengthAnomaly(length)
    if (anomalyType) detected.add(anomalyType)
  }

  if (lengths.length >= 3) {
    const max = Math.max(...lengths)
    const min = Math.min(...lengths)
    if (max - min > ANOMALY_THRESHOLDS.maxVarianceDays) {
      detected.add('high_variance')
    }
  }

  return Array.from(detected)
}
