export interface DashboardAgent {
  id: string
  user_id: string
  title: string
  description?: string
  status: string
  created_at: string
  updated_at: string
}

export interface DashboardSession {
  id: string
  agent_id: string
  status: 'active' | 'completed' | 'abandoned'
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  agentsCount: number
  sessionsCount: number
  llmUsage: number
}

export interface UsageDataPoint {
  date: string
  sessions: number
  agents: number
}
