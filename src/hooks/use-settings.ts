import { useQuery } from '@tanstack/react-query'
import type { AppSettings } from '@/types/settings'

const MOCK_SETTINGS: AppSettings = {
  account: {
    companyName: '',
    timezone: 'UTC',
    brandingDefaults: '',
  },
  billing: {
    name: 'Free',
    usage: [
      { id: '1', metric: 'Agents', used: '2', limit: '5', period: 'month' },
      { id: '2', metric: 'Sessions', used: '120', limit: '1000', period: 'month' },
    ],
    invoices: [],
  },
  webhook: {
    globalEndpoints: '',
    retryPolicy: '3',
  },
  security: {
    apiKeys: [],
    ssoMetadata: '',
    sessionTimeout: '24',
    twoFactorEnabled: false,
  },
  llm: {
    modelDefaults: 'gpt-4',
    usageCaps: '',
    costAlerts: '',
  },
  privacy: {
    retentionPolicy: '',
  },
}

async function fetchSettings(): Promise<AppSettings> {
  await new Promise((r) => setTimeout(r, 300))
  return MOCK_SETTINGS
}

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
  })
}
