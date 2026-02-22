import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  IntegrationsData,
  WebhookConfig,
  IntegrationTemplate,
  DeliveryLog,
} from '@/types/integrations'

const MOCK_TEMPLATES: IntegrationTemplate[] = [
  {
    id: '1',
    name: 'Generic REST',
    type: 'webhook',
    description: 'Map session fields to generic JSON payload',
    schemaMapping: { session_id: 'id', fields: 'extracted_data' },
  },
  {
    id: '2',
    name: 'HubSpot Contact',
    type: 'hubspot',
    description: 'Map to HubSpot contact properties',
    schemaMapping: { email: 'properties.email', name: 'properties.firstname' },
  },
  {
    id: '3',
    name: 'Salesforce Lead',
    type: 'salesforce',
    description: 'Map to Salesforce lead object',
    schemaMapping: { email: 'Email', company: 'Company' },
  },
  {
    id: '4',
    name: 'Zapier Webhooks',
    type: 'zapier',
    description: 'Zapier catch hook format',
    schemaMapping: { session_id: 'session_id', data: 'data' },
  },
]

async function fetchIntegrations(): Promise<IntegrationsData> {
  await new Promise((r) => setTimeout(r, 300))
  return {
    webhooks: [],
    templates: MOCK_TEMPLATES,
    deliveryLogs: [],
  }
}

export function useIntegrations() {
  return useQuery({
    queryKey: ['integrations'],
    queryFn: fetchIntegrations,
  })
}

export function useSaveWebhook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (webhook: Partial<WebhookConfig>) => {
      await new Promise((r) => setTimeout(r, 400))
      const id = webhook.id ?? crypto.randomUUID()
      const now = new Date().toISOString()
      return {
        ...webhook,
        id,
        createdAt: (webhook as WebhookConfig).createdAt ?? now,
        updatedAt: now,
      } as WebhookConfig
    },
    onSuccess: (saved) => {
      queryClient.setQueryData<IntegrationsData>(['integrations'], (prev) => {
        if (!prev) return prev
        const exists = prev.webhooks.some((w) => w.id === saved.id)
        const webhooks = exists
          ? prev.webhooks.map((w) => (w.id === saved.id ? (saved as WebhookConfig) : w))
          : [...prev.webhooks, saved as WebhookConfig]
        return { ...prev, webhooks }
      })
    },
  })
}

export function useTestWebhook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (_webhookId: string) => {
      await new Promise((r) => setTimeout(r, 800))
      return {
        statusCode: 200,
        responseTime: 120,
        payload: JSON.stringify({ session_id: 'test-123', test: true }, null, 2),
      }
    },
    onSuccess: (result, webhookId) => {
      queryClient.setQueryData<IntegrationsData>(['integrations'], (prev) => {
        if (!prev) return prev
        const webhook = prev.webhooks.find((w) => w.id === webhookId)
        const log: DeliveryLog = {
          id: crypto.randomUUID(),
          webhookId,
          webhookName: webhook?.name ?? 'Test',
          timestamp: new Date().toISOString(),
          statusCode: result.statusCode,
          responseTime: result.responseTime,
          success: result.statusCode >= 200 && result.statusCode < 300,
          retryCount: 0,
        }
        return {
          ...prev,
          deliveryLogs: [log, ...prev.deliveryLogs].slice(0, 50),
        }
      })
    },
  })
}
