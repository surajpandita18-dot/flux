// Phase boundaries per PRD.md — never change without updating PRD first
export const PHASE_BOUNDARIES = {
  menstrual:  { start: 1,  end: 5  },
  follicular: { start: 6,  end: 13 },
  ovulation:  { start: 14, end: 17 },
  luteal:     { start: 18, end: Infinity },
} as const;

// Anomaly thresholds per PRD.md MVP feature 5
export const ANOMALY_THRESHOLDS = {
  minCycleDays: 21,
  maxCycleDays: 35,
  maxVarianceDays: 7,
} as const;

// DB schema allows 15–60 (see 001_initial_schema.sql)
const VALID_CYCLE_RANGE = { min: 15, max: 60 } as const;

export type Phase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
export type CycleAnomalyType = 'short_cycle' | 'long_cycle';

export interface PhaseResult {
  phase: Phase;
  /** 1-indexed day within the current cycle (Day 1 = first day of period) */
  dayNumber: number;
  /** cycleLengthAvg passed in — total days in this cycle */
  totalDays: number;
  /** Estimated date this cycle started (accounts for rolled-over cycles) */
  cycleStartDate: Date;
  /** How many days remain until the next expected period */
  daysUntilNextPeriod: number;
}

export interface CycleAnomalyCheck {
  isAnomaly: boolean;
  anomalyType: CycleAnomalyType | null;
}

// UTC-safe day difference — avoids DST edge cases
function daysBetween(from: Date, to: Date): number {
  const MS_PER_DAY = 1_000 * 60 * 60 * 24;
  const utcFrom = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const utcTo   = Date.UTC(to.getFullYear(),   to.getMonth(),   to.getDate());
  return Math.floor((utcTo - utcFrom) / MS_PER_DAY);
}

function resolvePhase(dayInCycle: number): Phase {
  if (dayInCycle <= PHASE_BOUNDARIES.menstrual.end)  return 'menstrual';
  if (dayInCycle <= PHASE_BOUNDARIES.follicular.end) return 'follicular';
  if (dayInCycle <= PHASE_BOUNDARIES.ovulation.end)  return 'ovulation';
  return 'luteal';
}

/**
 * Core phase calculation engine.
 *
 * Uses modulo arithmetic so cycles that have rolled over (user hasn't logged
 * new period yet) still resolve correctly rather than throwing.
 *
 * @param lastPeriodDate  Date the most recent period started (Day 1)
 * @param cycleLengthAvg  User's average cycle length in days (15–60)
 * @param today           Defaults to now; pass a fixed date for testing
 */
export function calculatePhase(
  lastPeriodDate: Date,
  cycleLengthAvg: number,
  today: Date = new Date(),
): PhaseResult {
  if (
    !Number.isInteger(cycleLengthAvg) ||
    cycleLengthAvg < VALID_CYCLE_RANGE.min ||
    cycleLengthAvg > VALID_CYCLE_RANGE.max
  ) {
    throw new RangeError(
      `cycleLengthAvg must be an integer between ${VALID_CYCLE_RANGE.min} and ${VALID_CYCLE_RANGE.max}. Got: ${cycleLengthAvg}`,
    );
  }

  const totalElapsedDays = daysBetween(lastPeriodDate, today);

  if (totalElapsedDays < 0) {
    throw new RangeError('lastPeriodDate cannot be in the future');
  }

  // Modulo rolls over automatically if user hasn't logged the next period
  const dayInCycle = (totalElapsedDays % cycleLengthAvg) + 1;

  // Reconstruct the start of the current (possibly rolled-over) cycle
  const completedCycles = Math.floor(totalElapsedDays / cycleLengthAvg);
  const cycleStartDate  = new Date(lastPeriodDate);
  cycleStartDate.setDate(cycleStartDate.getDate() + completedCycles * cycleLengthAvg);

  const daysUntilNextPeriod = cycleLengthAvg - dayInCycle;

  return {
    phase: resolvePhase(dayInCycle),
    dayNumber: dayInCycle,
    totalDays: cycleLengthAvg,
    cycleStartDate,
    daysUntilNextPeriod,
  };
}

/**
 * Checks whether a cycle length falls outside the normal range per PRD anomaly rules.
 * Does NOT check 3-cycle variance — that requires historical data from the DB.
 */
export function checkCycleLengthAnomaly(cycleLengthDays: number): CycleAnomalyCheck {
  if (cycleLengthDays < ANOMALY_THRESHOLDS.minCycleDays) {
    return { isAnomaly: true, anomalyType: 'short_cycle' };
  }
  if (cycleLengthDays > ANOMALY_THRESHOLDS.maxCycleDays) {
    return { isAnomaly: true, anomalyType: 'long_cycle' };
  }
  return { isAnomaly: false, anomalyType: null };
}

/** Human-readable display name per phases.json / PRD.md */
export function getPhaseDisplayName(phase: Phase): string {
  const names: Record<Phase, string> = {
    menstrual:  'Rest Mode',
    follicular: 'Build Mode',
    ovulation:  'Peak Mode',
    luteal:     'Protect Mode',
  };
  return names[phase];
}
