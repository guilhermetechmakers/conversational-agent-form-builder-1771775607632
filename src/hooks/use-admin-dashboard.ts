import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type {
  PlatformMetric,
  AdminUser,
  FlaggedSession,
  AuditLogEntry,
  SystemHealthMetric,
} from '@/types/admin-dashboard'

function getMockPlatformMetrics(
  agentsCount: number,
  sessionsCount: number
): PlatformMetric[] {
  return [
    { label: 'Total Users', value: agentsCount > 0 ? Math.max(agentsCount * 2, 12) : 0 },
    { label: 'Active Agents', value: agentsCount },
    { label: 'Sessions Today', value: sessionsCount },
    { label: 'LLM Latency (ms)', value: 142 },
    { label: 'Error Rate (%)', value: '0.2' },
  ]
}

function getMockUsers(): AdminUser[] {
  return [
    { id: '1', email: 'admin@example.com', role: 'admin', status: 'active', lastActive: new Date().toISOString() },
    { id: '2', email: 'user@example.com', role: 'member', status: 'active', lastActive: new Date(Date.now() - 3600000).toISOString() },
    { id: '3', email: 'viewer@example.com', role: 'viewer', status: 'active', lastActive: new Date(Date.now() - 86400000).toISOString() },
  ]
}

function getMockFlaggedSessions(): FlaggedSession[] {
  return [
    {
      id: '1',
      agentId: 'a1',
      agentTitle: 'Support Bot',
      reason: 'Inappropriate content',
      reportedAt: new Date(Date.now() - 7200000).toISOString(),
      status: 'pending',
    },
    {
      id: '2',
      agentId: 'a2',
      agentTitle: 'Sales Assistant',
      reason: 'Spam detection',
      reportedAt: new Date(Date.now() - 86400000).toISOString(),
      status: 'reviewed',
    },
  ]
}

function getMockAuditLogs(): AuditLogEntry[] {
  return [
    { id: '1', action: 'User login', userId: 'u1', userEmail: 'admin@example.com', timestamp: new Date().toISOString() },
    { id: '2', action: 'Agent disabled', userId: 'u1', userEmail: 'admin@example.com', timestamp: new Date(Date.now() - 3600000).toISOString(), details: 'Support Bot' },
    { id: '3', action: 'Impersonation started', userId: 'u1', userEmail: 'admin@example.com', timestamp: new Date(Date.now() - 7200000).toISOString() },
  ]
}

function getMockSystemHealth(): SystemHealthMetric[] {
  return [
    { label: 'LLM Latency', value: '142ms', status: 'healthy' },
    { label: 'Queue Length', value: 3, status: 'healthy' },
    { label: 'Error Rate', value: '0.2%', status: 'healthy' },
  ]
}

export function useAdminPlatformMetrics() {
  const agentsQuery = useQuery({
    queryKey: ['admin-agents-count'],
    queryFn: async () => {
      if (!supabase) return 0
      const { count } = await supabase
        .from('agent_public_chat_visitor_view')
        .select('id', { count: 'exact', head: true })
      return count ?? 0
    },
  })

  const sessionsQuery = useQuery({
    queryKey: ['admin-sessions-count'],
    queryFn: async () => {
      if (!supabase) return 0
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const { count } = await supabase
        .from('sessions')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())
      return count ?? 0
    },
  })

  const agentsCount = agentsQuery.data ?? 0
  const sessionsCount = sessionsQuery.data ?? 0

  return {
    data: getMockPlatformMetrics(agentsCount, sessionsCount),
    isLoading: agentsQuery.isLoading || sessionsQuery.isLoading,
    isError: agentsQuery.isError || sessionsQuery.isError,
    refetch: () => {
      agentsQuery.refetch()
      sessionsQuery.refetch()
    },
  }
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async (): Promise<AdminUser[]> => {
      if (!supabase) return getMockUsers()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []
      return getMockUsers().map((u, i) =>
        i === 0 ? { ...u, email: user.email ?? u.email } : u
      )
    },
  })
}

export function useAdminFlaggedSessions() {
  return useQuery({
    queryKey: ['admin-flagged-sessions'],
    queryFn: async (): Promise<FlaggedSession[]> => getMockFlaggedSessions(),
  })
}

export function useAdminAuditLogs() {
  return useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: async (): Promise<AuditLogEntry[]> => getMockAuditLogs(),
  })
}

export function useAdminSystemHealth() {
  return useQuery({
    queryKey: ['admin-system-health'],
    queryFn: async (): Promise<SystemHealthMetric[]> => getMockSystemHealth(),
  })
}
