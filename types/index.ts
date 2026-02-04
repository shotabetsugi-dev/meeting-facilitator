// Database Types
export interface Meeting {
  id: string
  meeting_date: string
  start_time?: string
  end_time?: string
  participants?: string[]
  status: 'draft' | 'in_progress' | 'completed'
  created_at: string
  updated_at: string
}

export interface Agenda {
  id: string
  meeting_id: string
  agenda_number: number
  title: string
  detail?: string
  content?: string
  action_items?: string
  sort_order?: number
  created_at: string
  updated_at: string
}

export interface SalesChannel {
  id: string
  name: string
  color: string
  metrics_type: 'leads' | 'attack'
  is_active: boolean
  sort_order?: number
}

export interface SalesMetric {
  id: string
  meeting_id: string
  channel_id: string
  year_month: string
  leads_count: number
  appointments_count: number
  contracts_count: number
  created_at: string
  updated_at: string
  sales_channels?: SalesChannel
}

export interface SalesStatus {
  id: string
  meeting_id: string
  company_name: string
  status_text?: string
  next_action?: string
  next_action_date?: string
  sort_order?: number
  created_at: string
  updated_at: string
}

export interface DevProject {
  id: string
  meeting_id: string
  project_type: 'client' | 'internal'
  project_name: string
  signal: 'インシデント' | '順調' | '要調整'
  temperature: '普通' | '良好'
  status_text?: string
  sort_order?: number
  created_at: string
  updated_at: string
}

export interface Announcement {
  id: string
  meeting_id: string
  content?: string
  created_at: string
  updated_at: string
}

export interface FreeTopic {
  id: string
  meeting_id: string
  content?: string
  sort_order?: number
  created_at: string
  updated_at: string
}

export interface TimerState {
  status: 'stopped' | 'running' | 'paused'
  remaining: number
  totalDuration?: number
  startedAt?: string
}

export interface Debate {
  id: string
  meeting_id: string
  theme?: string
  pro_side?: string
  con_side?: string
  duration_minutes: number
  memo?: string
  timer_state: TimerState
  created_at: string
  updated_at: string
}

export interface DebateThemeHistory {
  id: string
  theme: string
  category?: string
  used_at: string
}

export interface Presence {
  id: string
  meeting_id: string
  user_id: string
  user_name: string
  current_section?: string
  current_field?: string
  last_seen: string
}

export interface Report {
  id: string
  meeting_id: string
  content?: string
  generated_at: string
}

// UI Types
export interface UserPresence {
  id: string
  name: string
  section: string
  field?: string
  color: string
}

export interface AIInsight {
  summary?: string
  keyPoints?: string[]
  suggestions?: string[]
  highlights?: string[]
  concerns?: string[]
  recommendations?: string[]
  alerts?: string[]
  healthy?: string
}
