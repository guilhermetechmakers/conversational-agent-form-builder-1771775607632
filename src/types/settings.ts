export interface AccountSettings {
  companyName: string
  timezone: string
  brandingDefaults: string
}

export interface BillingPlan {
  name: string
  usage: UsageRow[]
  invoices: InvoiceRow[]
}

export interface UsageRow {
  id: string
  metric: string
  used: string
  limit: string
  period: string
}

export interface InvoiceRow {
  id: string
  date: string
  amount: string
  status: string
}

export interface WebhookSettings {
  globalEndpoints: string
  retryPolicy: string
}

export interface ApiKeyRow {
  id: string
  name: string
  lastUsed: string
  scopes: string
}

export interface SecuritySettings {
  apiKeys: ApiKeyRow[]
  ssoMetadata: string
  sessionTimeout: string
  twoFactorEnabled: boolean
}

export interface LLMSettings {
  modelDefaults: string
  usageCaps: string
  costAlerts: string
}

export interface PrivacySettings {
  retentionPolicy: string
}

export interface AppSettings {
  account: AccountSettings
  billing: BillingPlan
  webhook: WebhookSettings
  security: SecuritySettings
  llm: LLMSettings
  privacy: PrivacySettings
}
