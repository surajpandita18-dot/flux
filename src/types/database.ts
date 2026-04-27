export interface UserProfile {
  id: string
  user_id: string
  display_name: string
  cycle_length_avg: number
  last_period_date: string | null
  created_at: string
  updated_at: string
}

export interface CycleLog {
  id: string
  user_id: string
  period_start_date: string
  period_end_date: string | null
  flow_intensity: 'light' | 'medium' | 'heavy'
  notes: string | null
  created_at: string
}

export interface DailyLog {
  id: string
  user_id: string
  log_date: string
  energy_level: 'low' | 'medium' | 'high'
  mood: string
  symptoms: string[] | null
  created_at: string
}

export interface PartnerConnection {
  id: string
  user_id: string
  partner_email: string
  access_level: 'phase_card_only'
  is_active: boolean
  invited_at: string
  accepted_at: string | null
  created_at: string
}

export interface AnomalyFlag {
  id: string
  user_id: string
  flag_type: 'short_cycle' | 'long_cycle' | 'high_variance'
  detected_at: string
  dismissed_at: string | null
  created_at: string
}
