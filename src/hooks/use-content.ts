import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ContentSource } from '@/types/content'
import type { ContentSourcesRow } from '@/types/supabase'
import { toast } from 'sonner'

const CONTENT_SOURCES_TABLE = 'content_sources'

export function useContentSources(agentId?: string | null) {
  return useQuery({
    queryKey: ['content-sources', agentId],
    queryFn: async (): Promise<ContentSource[]> => {
      if (!supabase) return []
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      try {
        let query = supabase
          .from(CONTENT_SOURCES_TABLE)
          .select('*')
          .eq('user_id', user.id)
          .order('last_updated', { ascending: false })

        if (agentId) {
          query = query.or(`agent_id.eq.${agentId},agent_id.is.null`)
        }

        const { data, error } = await query
        if (error) throw error
        return (data ?? []) as ContentSource[]
      } catch {
        return []
      }
    },
  })
}

export function useAddContentSource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: {
      agent_id?: string | null
      name: string
      type: 'url' | 'file' | 'text'
      url?: string | null
      file_path?: string | null
    }) => {
      if (!supabase) throw new Error('Supabase not configured')
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const insert: Omit<ContentSourcesRow, 'id' | 'last_updated' | 'created_at'> & {
        id?: string
        last_updated?: string
        created_at?: string
      } = {
        user_id: user.id,
        agent_id: payload.agent_id ?? null,
        name: payload.name,
        type: payload.type,
        status: 'pending',
        url: payload.url ?? null,
        file_path: payload.file_path ?? null,
        metadata: null,
      }

      const { data, error } = await supabase
        .from(CONTENT_SOURCES_TABLE)
        .insert(insert as never)
        .select()
        .single()

      if (error) throw error
      return data as ContentSource
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-sources'] })
      toast.success('Document added')
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to add document')
    },
  })
}

export function useRemoveContentSource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error('Supabase not configured')
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from(CONTENT_SOURCES_TABLE)
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-sources'] })
      toast.success('Document removed')
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to remove document')
    },
  })
}

export function useUpdateContentSource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { id: string; status?: string; metadata?: Record<string, unknown> }) => {
      if (!supabase) throw new Error('Supabase not configured')
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from(CONTENT_SOURCES_TABLE)
        .update({
          ...(payload.status && { status: payload.status }),
          ...(payload.metadata && { metadata: payload.metadata }),
          last_updated: new Date().toISOString(),
        } as never)
        .eq('id', payload.id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      return data as ContentSource
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-sources'] })
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to update document')
    },
  })
}
