import { useState } from 'react'
import {
  Webhook,
  Zap,
  Building2,
  Cloud,
  Link2,
  Plus,
  AlertCircle,
  RefreshCw,
  Play,
  ChevronRight,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { useIntegrations, useSaveWebhook, useTestWebhook } from '@/hooks/use-integrations'
import { cn } from '@/lib/utils'
import type { IntegrationType, WebhookConfig } from '@/types/integrations'
import { toast } from 'sonner'

const INTEGRATION_ITEMS: { id: IntegrationType; label: string; icon: typeof Webhook }[] = [
  { id: 'webhook', label: 'Webhooks', icon: Webhook },
  { id: 'zapier', label: 'Zapier', icon: Zap },
  { id: 'hubspot', label: 'HubSpot', icon: Building2 },
  { id: 'salesforce', label: 'Salesforce', icon: Cloud },
  { id: 'generic', label: 'Generic REST', icon: Link2 },
]

function IntegrationsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-4">
        <Skeleton className="h-4 w-3/4 rounded-md bg-gray-200" />
        <Skeleton className="h-10 w-full rounded-md bg-gray-200" />
        <Skeleton className="h-4 w-1/2 rounded-md bg-gray-200" />
        <Skeleton className="h-10 w-full rounded-md bg-gray-200" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-4 w-3/4 rounded-md bg-gray-200" />
        <Skeleton className="h-32 w-full rounded-md bg-gray-200" />
      </div>
    </div>
  )
}

function IntegrationsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-100 p-6">
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full text-gray-400">
          <AlertCircle className="h-6 w-6 text-red-700" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Failed to load integrations</h3>
          <p className="mt-1 text-sm text-gray-600">Something went wrong. Please try again.</p>
        </div>
        <Button
          onClick={onRetry}
          className="bg-red-500 text-white rounded px-4 py-2 hover:bg-red-600 transition duration-150"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    </div>
  )
}

function EmptyState({
  icon: Icon,
  heading,
  description,
  ctaLabel,
  onCta,
}: {
  icon: React.ElementType
  heading: string
  description: string
  ctaLabel: string
  onCta: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
      <div className="flex justify-center items-center text-gray-400 mb-4">
        <Icon className="h-12 w-12" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{heading}</h3>
      <p className="text-gray-600 mb-4 max-w-sm text-center">{description}</p>
      <Button
        onClick={onCta}
        className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600 transition duration-150"
      >
        {ctaLabel}
      </Button>
    </div>
  )
}

export function IntegrationsPage() {
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationType>('webhook')
  const [selectedWebhookId, setSelectedWebhookId] = useState<string | null>(null)
  const [webhookForm, setWebhookForm] = useState<Partial<WebhookConfig>>({
    name: '',
    url: '',
    method: 'POST',
    retries: 3,
    retryPolicy: 'exponential',
    hmacEnabled: true,
  })
  const [testLog, setTestLog] = useState<string | null>(null)

  const { data, isLoading, isError, refetch } = useIntegrations()
  const saveWebhook = useSaveWebhook()
  const testWebhook = useTestWebhook()

  const webhooks = data?.webhooks ?? []
  const templates = data?.templates ?? []
  const deliveryLogs = data?.deliveryLogs ?? []

  const handleSelectWebhook = (id: string) => {
    setSelectedWebhookId(id)
    const w = data?.webhooks.find((x) => x.id === id)
    if (w) setWebhookForm(w)
  }

  const handleAddWebhook = () => {
    setSelectedWebhookId(null)
    setWebhookForm({
      name: '',
      url: '',
      method: 'POST',
      retries: 3,
      retryPolicy: 'exponential',
      hmacEnabled: true,
    })
  }

  const handleSaveWebhook = () => {
    if (!webhookForm.url?.trim()) {
      toast.error('Please enter a webhook URL')
      return
    }
    saveWebhook.mutate(
      {
        ...webhookForm,
        id: selectedWebhookId ?? undefined,
      },
      {
        onSuccess: (saved) => {
          setSelectedWebhookId(saved.id)
          toast.success('Webhook saved')
          refetch()
        },
        onError: () => toast.error('Failed to save webhook'),
      }
    )
  }

  const handleTestDelivery = () => {
    const id = selectedWebhookId ?? webhooks[0]?.id
    if (!id) {
      toast.error('Add and save a webhook first')
      return
    }
    testWebhook.mutate(id, {
      onSuccess: (result) => {
        setTestLog(
          JSON.stringify(
            {
              statusCode: result.statusCode,
              responseTime: result.responseTime,
              payload: result.payload,
            },
            null,
            2
          )
        )
        toast.success('Test delivery completed')
      },
      onError: () => toast.error('Test delivery failed'),
    })
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 bg-gray-50 min-h-screen -m-6">
      {/* Sidebar */}
      <aside className="w-full md:w-1/4 bg-white shadow-lg rounded-lg p-4 shrink-0">
        <Card className="bg-white shadow p-4 rounded-lg border-0 shadow-none">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Integrations</h2>
          <Table className="w-full text-left">
            <TableHeader>
              <TableRow className="hover:bg-transparent border-0">
                <TableHead className="p-2 text-gray-600 font-medium">Type</TableHead>
                <TableHead className="p-2 w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {INTEGRATION_ITEMS.map((item) => (
                <TableRow
                  key={item.id}
                  className={cn(
                    'hover:bg-gray-100 cursor-pointer transition duration-150',
                    selectedIntegration === item.id && 'bg-gray-100'
                  )}
                  onClick={() => setSelectedIntegration(item.id)}
                >
                  <TableCell className="p-2 text-gray-600">
                    <span className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </span>
                  </TableCell>
                  <TableCell className="p-2">
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {selectedIntegration === 'webhook' && (
          <Card className="bg-white shadow p-4 rounded-lg border-0 shadow-none mt-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Webhooks</h2>
            {webhooks.length === 0 ? (
              <div className="text-sm text-gray-600 mb-2">No webhooks configured</div>
            ) : (
              <Table className="w-full text-left">
                <TableBody>
                  {webhooks.map((w) => (
                    <TableRow
                      key={w.id}
                      className={cn(
                        'hover:bg-gray-100 cursor-pointer transition duration-150',
                        selectedWebhookId === w.id && 'bg-gray-100'
                      )}
                      onClick={() => handleSelectWebhook(w.id)}
                    >
                      <TableCell className="p-2 text-gray-600">{w.name || w.url}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              onClick={handleAddWebhook}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add webhook
            </Button>
          </Card>
        )}
      </aside>

      {/* Main Content */}
      <main className="w-full md:w-3/4 flex flex-col gap-6">
        {isError ? (
          <IntegrationsError onRetry={() => refetch()} />
        ) : (
          <>
            {/* Webhook Editor */}
            <Card className="bg-white shadow p-6 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Webhook Editor</h2>
              {isLoading ? (
                <IntegrationsSkeleton />
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="webhook-name" className="text-gray-800">
                      Name
                    </Label>
                    <Input
                      id="webhook-name"
                      value={webhookForm.name ?? ''}
                      onChange={(e) => setWebhookForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="My webhook"
                      className="border border-gray-300 rounded p-2 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="webhook-url" className="text-gray-800">
                      URL
                    </Label>
                    <Input
                      id="webhook-url"
                      value={webhookForm.url ?? ''}
                      onChange={(e) => setWebhookForm((p) => ({ ...p, url: e.target.value }))}
                      placeholder="https://api.example.com/webhooks"
                      className="border border-gray-300 rounded p-2 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="webhook-method" className="text-gray-800">
                      Method
                    </Label>
                    <Select
                      value={webhookForm.method ?? 'POST'}
                      onValueChange={(v: 'POST' | 'PUT' | 'PATCH') =>
                        setWebhookForm((p) => ({ ...p, method: v }))
                      }
                    >
                      <SelectTrigger className="border border-gray-300 rounded p-2 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="PATCH">PATCH</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="webhook-retries" className="text-gray-800">
                      Retries
                    </Label>
                    <Select
                      value={String(webhookForm.retries ?? 3)}
                      onValueChange={(v) =>
                        setWebhookForm((p) => ({ ...p, retries: parseInt(v, 10) }))
                      }
                    >
                      <SelectTrigger className="border border-gray-300 rounded p-2 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleSaveWebhook}
                    disabled={saveWebhook.isPending}
                    className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600 transition duration-150"
                  >
                    {saveWebhook.isPending ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </Card>

            {/* Integration Templates */}
            <Card className="bg-white shadow p-6 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Integration Templates</h2>
              {isLoading ? (
                <IntegrationsSkeleton />
              ) : templates.length === 0 ? (
                <EmptyState
                  icon={Link2}
                  heading="No templates"
                  description="Prebuilt connectors will appear here for HubSpot, Salesforce, Zapier and generic REST."
                  ctaLabel="Add template"
                  onCta={() => {}}
                />
              ) : (
                <ul className="space-y-0">
                  {templates.map((t) => (
                    <li
                      key={t.id}
                      className="flex justify-between items-center p-2 hover:bg-gray-100 cursor-pointer transition duration-150 rounded"
                    >
                      <span className="text-gray-700">{t.name}</span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* Test Delivery UI */}
            <Card className="bg-white shadow p-6 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Test Delivery</h2>
              <Button
                onClick={handleTestDelivery}
                disabled={testWebhook.isPending || webhooks.length === 0}
                className="bg-green-500 text-white rounded px-4 py-2 hover:bg-green-600 transition duration-150 mb-4"
              >
                <Play className="mr-2 h-4 w-4" />
                {testWebhook.isPending ? 'Testing...' : 'Send test payload'}
              </Button>
              {testLog && (
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm text-gray-700">
                  {testLog}
                </pre>
              )}
              {!testLog && webhooks.length > 0 && (
                <p className="text-sm text-gray-600">Click the button to send a test payload.</p>
              )}
            </Card>

            {/* Status & Logs */}
            <Card className="bg-white shadow p-6 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Status & Logs</h2>
              {isLoading ? (
                <IntegrationsSkeleton />
              ) : deliveryLogs.length === 0 ? (
                <EmptyState
                  icon={Webhook}
                  heading="No delivery logs yet"
                  description="Delivery logs will appear here when webhooks are triggered."
                  ctaLabel="Send test"
                  onCta={handleTestDelivery}
                />
              ) : (
                <Table className="w-full text-left">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="p-2 text-gray-600 font-medium">Time</TableHead>
                      <TableHead className="p-2 text-gray-600 font-medium">Webhook</TableHead>
                      <TableHead className="p-2 text-gray-600 font-medium">Status</TableHead>
                      <TableHead className="p-2 text-gray-600 font-medium">Response (ms)</TableHead>
                      <TableHead className="p-2 text-gray-600 font-medium">Retries</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deliveryLogs.map((log) => (
                      <TableRow
                        key={log.id}
                        className="hover:bg-gray-100 cursor-pointer transition duration-150"
                      >
                        <TableCell className="p-2 text-gray-600">
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell className="p-2 text-gray-600">{log.webhookName}</TableCell>
                        <TableCell className="p-2 text-gray-600">
                          <span
                            className={cn(
                              'font-medium',
                              log.success ? 'text-green-600' : 'text-red-600'
                            )}
                          >
                            {log.statusCode}
                          </span>
                        </TableCell>
                        <TableCell className="p-2 text-gray-600">{log.responseTime}</TableCell>
                        <TableCell className="p-2 text-gray-600">{log.retryCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </>
        )}
      </main>
    </div>
  )
}
