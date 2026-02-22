import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/lib/api'
import type { AgentConfig } from '@/types/agent-public-chat'

const DEMO_CONFIG: AgentConfig = {
  id: 'demo',
  name: 'Demo Agent',
  productHint: 'Collect leads through natural conversation',
  requiredFields: [
    { id: '1', key: 'name', label: 'Name', type: 'text', required: true },
    { id: '2', key: 'email', label: 'Email', type: 'email', required: true },
    { id: '3', key: 'interest', label: 'Interest', type: 'select', options: ['Product A', 'Product B', 'Support'], required: true },
  ],
  consentRequired: true,
  consentText:
    'By continuing, you agree to share your information with us. We use it to follow up and improve our services. Your data is handled according to our privacy policy.',
}

export function useAgentConfig(agentId: string | undefined) {
  return useQuery({
    queryKey: ['agent-config', agentId],
    queryFn: async () => {
      if (!agentId) throw new Error('Agent ID required')
      if (agentId === 'demo') return DEMO_CONFIG
      try {
        return await apiGet<AgentConfig>(`/agents/${agentId}/config`)
      } catch {
        return DEMO_CONFIG
      }
    },
    enabled: !!agentId,
  })
}
