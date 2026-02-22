export interface PlatformMetric {
  label: string
  value: string | number
}

export interface AdminUser {
  id: string
  email: string
  role: 'admin' | 'member' | 'viewer'
  status: string
  lastActive: string
}

export interface FlaggedSession {
  id: string
  agentId: string
  agentTitle: string
  reason: string
  reportedAt: string
  status: 'pending' | 'reviewed' | 'resolved'
}

export interface AuditLogEntry {
  id: string
  action: string
  userId: string
  userEmail: string
  timestamp: string
  details?: string
}

export interface SystemHealthMetric {
  label: string
  value: string | number
  status: 'healthy' | 'warning' | 'error'
}
