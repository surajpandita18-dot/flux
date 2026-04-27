import phasesData from '../../content/phases.json'
import type { Phase } from '@/lib/phaseEngine'

export interface PhaseNutrition {
  focus: string
  foods: string[]
  avoid: string[]
  tip_card: string
}

export interface PhaseExercise {
  recommended: string[]
  avoid: string[]
  tip_card: string
}

export interface PhaseMood {
  expect: string
  tip_card: string
}

export interface PhasePartner {
  phase_summary: string
  do: string[]
  avoid: string[]
  date_idea: string
}

export interface PhaseEducation {
  headline: string
  body: string
}

export interface PhaseData {
  name: string
  days: string
  emoji_color: string
  one_liner: string
  nutrition: PhaseNutrition
  exercise: PhaseExercise
  mood: PhaseMood
  partner: PhasePartner
  education: PhaseEducation
}

type PhasesJson = { phases: Record<Phase, PhaseData> }

const typed = phasesData as PhasesJson

export function getPhaseData(phase: Phase): PhaseData {
  return typed.phases[phase]
}
