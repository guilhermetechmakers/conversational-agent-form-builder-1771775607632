export type IntegrationType = 'webhook' | 'zapier' | 'hubspot' | 'salesforce' | 'generic'

export interface WebhookConfig {
  id: string
  name: string
  url: string
  method: 'POST' | 'PUT' | 'PATCH'
  secret?: string
  retries: number
  retryPolicy: 'linear' | 'exponential'
  hmacEnabled: boolean
  templateId?: string
  createdAt: string
  updatedAt: string
}

export interface IntegrationTemplate {
  id: string
  name: string
  type: IntegrationType
  description: string
  schemaMapping: Record<string, string>
}

export interface DeliveryLog {
  id: string
  webhookId: string
  webhookName: string
  timestamp: string
  statusCode: number
  responseTime: number
  success: boolean
  retryCount: number
  payload?: string
}

export interface IntegrationsData {
  webhooks: WebhookConfig[]
  templates: IntegrationTemplate[]
  deliveryLogs: DeliveryLog[]
}
