import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPut, apiPost, apiDelete } from '@/lib/api'
import type {
  UserProfileExtended,
  ApiKey,
  TeamMember,
  ActiveSession,
  BillingPlan,
} from '@/types/user-profile'

const QUERY_KEYS = {
  profile: ['user-profile'] as const,
  apiKeys: ['api-keys'] as const,
  teamMembers: ['team-members'] as const,
  sessions: ['active-sessions'] as const,
}

const MOCK_PROFILE: UserProfileExtended = {
  id: '1',
  user_id: 'user-1',
  name: 'John Doe',
  email: 'john@example.com',
  timezone: 'America/New_York',
  language: 'en',
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export function useUserProfile() {
  return useQuery({
    queryKey: QUERY_KEYS.profile,
    queryFn: async () => {
      try {
        return await apiGet<UserProfileExtended>('/user/profile')
      } catch {
        return MOCK_PROFILE
      }
    },
    retry: false,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<UserProfileExtended>) => {
      return apiPut<UserProfileExtended>('/user/profile', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile })
    },
  })
}

export function useApiKeys() {
  return useQuery({
    queryKey: QUERY_KEYS.apiKeys,
    queryFn: async () => {
      try {
        return await apiGet<ApiKey[]>('/user/api-keys')
      } catch {
        return []
      }
    },
  })
}

export function useCreateApiKey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { name: string; scopes: string[] }) => {
      return apiPost<{ key: string }>('/user/api-keys', payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.apiKeys })
    },
  })
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (keyId: string) => {
      return apiDelete(`/user/api-keys/${keyId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.apiKeys })
    },
  })
}

export function useTeamMembers() {
  return useQuery({
    queryKey: QUERY_KEYS.teamMembers,
    queryFn: async () => {
      try {
        return await apiGet<TeamMember[]>('/user/team')
      } catch {
        return []
      }
    },
  })
}

export function useActiveSessions() {
  return useQuery({
    queryKey: QUERY_KEYS.sessions,
    queryFn: async () => {
      try {
        return await apiGet<ActiveSession[]>('/user/sessions')
      } catch {
        return []
      }
    },
  })
}

export function useBillingPlan() {
  return useQuery({
    queryKey: ['billing-plan'],
    queryFn: async () => {
      try {
        return await apiGet<{ plan: BillingPlan; plans: BillingPlan[] }>('/user/billing')
      } catch {
        return undefined
      }
    },
  })
}

export function useInviteTeamMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { email: string; role: 'admin' | 'member' | 'viewer' }) => {
      return apiPost<TeamMember>('/user/team/invite', payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teamMembers })
    },
  })
}

export function useUpdateTeamRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: 'admin' | 'member' | 'viewer' }) => {
      return apiPut<TeamMember>(`/user/team/${memberId}/role`, { role })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teamMembers })
    },
  })
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (memberId: string) => {
      return apiDelete(`/user/team/${memberId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teamMembers })
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      return apiPost('/user/password', data)
    },
  })
}

export function use2FAToggle() {
  return useMutation({
    mutationFn: async (enabled: boolean) => {
      return apiPost('/user/2fa', { enabled })
    },
  })
}

export function useRevokeSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (sessionId: string) => {
      return apiDelete(`/user/sessions/${sessionId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sessions })
    },
  })
}
