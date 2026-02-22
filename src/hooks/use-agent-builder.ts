import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { AgentBuilderData, AgentConfig } from '@/types/agent-builder'
import type { AgentPublicChatVisitorViewRow } from '@/types/supabase'
import { toast } from 'sonner'

const AGENTS_TABLE = 'agent_public_chat_visitor_view'

type AgentInsert = Omit<AgentPublicChatVisitorViewRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export function useAgent(agentId: string | undefined) {
  return useQuery({
    queryKey: ['agent', agentId],
    queryFn: async (): Promise<AgentBuilderData | null> => {
      if (!supabase || !agentId) return null
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from(AGENTS_TABLE)
        .select('*')
        .eq('id', agentId)
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      return data as AgentBuilderData
    },
    enabled: !!agentId,
  })
}

export function useCreateAgent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { title: string; description?: string; slug?: string; config?: AgentConfig }) => {
      if (!supabase) throw new Error('Supabase not configured')
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const insert: AgentInsert = {
        user_id: user.id,
        title: payload.title,
        description: payload.description ?? null,
        slug: payload.slug ?? null,
        status: 'draft',
        config: (payload.config ?? {}) as Record<string, unknown> | null,
      }
      const { data, error } = await supabase
        .from(AGENTS_TABLE)
        .insert(insert as never)
        .select()
        .single()

      if (error) throw error
      return data as AgentBuilderData
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-agents'] })
      toast.success('Agent created')
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to create agent')
    },
  })
}

export function useUpdateAgent(agentId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Partial<{
      title: string
      description: string | null
      slug: string | null
      status: string
      config: AgentConfig
      agentId?: string
    }>) => {
      const id = payload.agentId ?? agentId
      if (!supabase || !id) throw new Error('Invalid state')
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { agentId: _aid, ...rest } = payload
      const updatePayload = {
        ...rest,
        updated_at: new Date().toISOString(),
      }
      const { data, error } = await supabase
        .from(AGENTS_TABLE)
        .update(updatePayload as never)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      return data as AgentBuilderData
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent', agentId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-agents'] })
      toast.success('Agent saved')
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to save agent')
    },
  })
}
