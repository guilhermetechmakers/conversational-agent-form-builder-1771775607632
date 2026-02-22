import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { DashboardAgent, DashboardSession, UsageDataPoint } from '@/types/dashboard'

const AGENTS_TABLE = 'agent_public_chat_visitor_view'

export function useDashboardAgents(searchQuery = '') {
  return useQuery({
    queryKey: ['dashboard-agents', searchQuery],
    queryFn: async (): Promise<DashboardAgent[]> => {
      if (!supabase) return []
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      let query = supabase
        .from(AGENTS_TABLE)
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return (data ?? []) as DashboardAgent[]
    },
  })
}

export function useDashboardSessions(limit = 10) {
  return useQuery({
    queryKey: ['dashboard-sessions', limit],
    queryFn: async (): Promise<(DashboardSession & { agent_title?: string })[]> => {
      if (!supabase) return []
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data: agents } = await supabase
        .from(AGENTS_TABLE)
        .select('id, title')
        .eq('user_id', user.id)

      const agentsList = (agents ?? []) as { id: string; title: string }[]
      const agentIds = agentsList.map((a) => a.id)
      if (agentIds.length === 0) return []

      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .in('agent_id', agentIds)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      const agentMap = new Map(agentsList.map((a) => [a.id, a.title]))
      const sessionsList = (data ?? []) as (DashboardSession & { agent_id: string })[]
      return sessionsList.map((s) => ({
        ...s,
        agent_title: agentMap.get(s.agent_id),
      }))
    },
  })
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      if (!supabase) {
        return { agentsCount: 0, sessionsCount: 0, llmUsage: 0 }
      }
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { agentsCount: 0, sessionsCount: 0, llmUsage: 0 }
      }

      const agentsRes = await supabase.from(AGENTS_TABLE).select('id').eq('user_id', user.id)
      const agentIds = ((agentsRes.data ?? []) as { id: string }[]).map((a) => a.id)
      const agentsCount = agentIds.length

      let sessionsCount = 0
      if (agentIds.length > 0) {
        const { count } = await supabase.from('sessions').select('id', { count: 'exact', head: true }).in('agent_id', agentIds)
        sessionsCount = count ?? 0
      }

      return {
        agentsCount,
        sessionsCount,
        llmUsage: sessionsCount,
      }
    },
  })
}

export function useDashboardUsageGraph(days = 7) {
  return useQuery({
    queryKey: ['dashboard-usage', days],
    queryFn: async (): Promise<UsageDataPoint[]> => {
      if (!supabase) return []
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const agentIdsRes = await supabase.from(AGENTS_TABLE).select('id').eq('user_id', user.id)
      const agentIds = ((agentIdsRes.data ?? []) as { id: string }[]).map((a) => a.id)
      if (agentIds.length === 0) {
        const points: UsageDataPoint[] = []
        for (let i = days - 1; i >= 0; i--) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          points.push({ date: d.toISOString().slice(0, 10), sessions: 0, agents: 0 })
        }
        return points
      }

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data: sessions } = await supabase
        .from('sessions')
        .select('created_at')
        .in('agent_id', agentIds)
        .gte('created_at', startDate.toISOString())

      const byDate: Record<string, { sessions: number; agents: Set<string> }> = {}
      for (let i = 0; i < days; i++) {
        const d = new Date()
        d.setDate(d.getDate() - (days - 1 - i))
        const key = d.toISOString().slice(0, 10)
        byDate[key] = { sessions: 0, agents: new Set() }
      }

      const sessionsList = (sessions ?? []) as { created_at: string }[]
      for (const s of sessionsList) {
        const key = s.created_at.slice(0, 10)
        if (byDate[key]) {
          byDate[key].sessions += 1
        }
      }

      return Object.entries(byDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, { sessions: count }]) => ({
          date,
          sessions: count,
          agents: agentIds.length,
        }))
    },
  })
}
