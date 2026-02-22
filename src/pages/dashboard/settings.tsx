import { useState, useRef, useCallback } from 'react'
import {
  Building2,
  CreditCard,
  Webhook,
  Shield,
  Cpu,
  Lock,
  Settings,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { useSettings } from '@/hooks/use-settings'
import { cn } from '@/lib/utils'

const SECTIONS = [
  { id: 'account', label: 'Account Settings', icon: Building2 },
  { id: 'billing', label: 'Billing & Plan', icon: CreditCard },
  { id: 'webhook', label: 'Webhook Settings', icon: Webhook },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'llm', label: 'LLM & Usage Controls', icon: Cpu },
  { id: 'privacy', label: 'Privacy & Data Retention', icon: Lock },
] as const

type SectionId = (typeof SECTIONS)[number]['id']

function SettingsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-4">
        <Skeleton className="h-6 w-3/4 rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-6 w-1/2 rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-3/4 rounded-md" />
        <Skeleton className="h-32 w-full rounded-md" />
      </div>
    </div>
  )
}

function SettingsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-700">Failed to load settings</h3>
          <p className="mt-1 text-sm text-gray-500">
            Something went wrong. Please try again.
          </p>
        </div>
        <Button
          onClick={onRetry}
          className="bg-red-500 text-white rounded-md p-2 hover:bg-red-600 transition-all duration-200"
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
      <div className="flex h-12 w-12 items-center justify-center text-muted-foreground">
        <Icon className="h-12 w-12" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-700">{heading}</h3>
      <p className="mt-2 max-w-sm text-center text-gray-500">{description}</p>
      <Button
        onClick={onCta}
        className="mt-4 bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600 transition-all duration-200"
      >
        {ctaLabel}
      </Button>
    </div>
  )
}

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SectionId>('account')
  const sectionRefs = useRef<Partial<Record<SectionId, HTMLDivElement | null>>>({})

  const { data: settings, isLoading, isError, refetch } = useSettings()

  const scrollToSection = useCallback((id: SectionId) => {
    setActiveSection(id)
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const setRef = useCallback((id: SectionId) => (el: HTMLDivElement | null) => {
    sectionRefs.current[id] = el
  }, [])

  if (isError) {
    return (
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-8rem)] bg-gray-50 dark:bg-muted/30">
        <aside className="w-full md:w-1/4 bg-card shadow-md shrink-0">
          <nav className="p-4">
            <ul className="space-y-4">
              {SECTIONS.map((s) => (
                <li
                  key={s.id}
                  className={cn(
                    'flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer',
                    activeSection === s.id && 'text-primary font-medium'
                  )}
                  onClick={() => scrollToSection(s.id)}
                >
                  <s.icon className="h-4 w-4" />
                  <span>{s.label}</span>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <main className="flex-1 p-6 md:p-8">
          <SettingsError onRetry={() => refetch()} />
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-8rem)] bg-gray-50 dark:bg-muted/30">
      <aside className="w-full md:w-1/4 bg-card shadow-md shrink-0">
        <nav className="p-4">
          <div className="mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Settings</h2>
          </div>
          <ul className="space-y-4">
            {SECTIONS.map((s) => (
              <li
                key={s.id}
                className={cn(
                  'flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer hover:bg-muted/50 rounded-lg px-3 py-2 -mx-3',
                  activeSection === s.id && 'text-primary font-medium bg-muted/50'
                )}
                onClick={() => scrollToSection(s.id)}
              >
                <s.icon className="h-4 w-4 shrink-0" />
                <span>{s.label}</span>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="space-y-8 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
          {/* Account Settings */}
          <section ref={setRef('account')}>
            <Card className="bg-card shadow rounded-lg mb-6">
              <CardHeader>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Account Settings
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <SettingsSkeleton />
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name</Label>
                      <Input
                        id="company"
                        defaultValue={settings?.account.companyName}
                        className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Your company"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select defaultValue={settings?.account.timezone ?? 'UTC'}>
                        <SelectTrigger className="border rounded-md p-2 w-full">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/New_York">Eastern</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific</SelectItem>
                          <SelectItem value="Europe/London">London</SelectItem>
                          <SelectItem value="Europe/Paris">Paris</SelectItem>
                          <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="branding">Branding Defaults</Label>
                      <Input
                        id="branding"
                        defaultValue={settings?.account.brandingDefaults}
                        className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Logo URL, colors, etc."
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Billing & Plan */}
          <section ref={setRef('billing')}>
            <Card className="bg-card shadow rounded-lg mb-6">
              <CardHeader>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Billing & Plan
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <SettingsSkeleton />
                ) : (
                  <>
                    <div className="text-muted-foreground">
                      Current Plan: <span className="font-medium text-foreground">{settings?.billing.name}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-2">Usage</h3>
                      <Table className="w-full border-collapse">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Metric</TableHead>
                            <TableHead>Used</TableHead>
                            <TableHead>Limit</TableHead>
                            <TableHead>Period</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(settings?.billing.usage ?? []).map((row) => (
                            <TableRow key={row.id}>
                              <TableCell>{row.metric}</TableCell>
                              <TableCell>{row.used}</TableCell>
                              <TableCell>{row.limit}</TableCell>
                              <TableCell>{row.period}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-2">Invoices</h3>
                      {!settings?.billing.invoices?.length ? (
                        <EmptyState
                          icon={CreditCard}
                          heading="No invoices yet"
                          description="Your invoices will appear here once you have billing activity."
                          ctaLabel="Upgrade plan"
                          onCta={() => {}}
                        />
                      ) : (
                        <Table className="w-full border-collapse">
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {settings?.billing.invoices.map((inv) => (
                              <TableRow key={inv.id}>
                                <TableCell>{inv.date}</TableCell>
                                <TableCell>{inv.amount}</TableCell>
                                <TableCell>{inv.status}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                    <Button className="bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600 transition-all duration-200">
                      Upgrade / Downgrade
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Webhook Settings */}
          <section ref={setRef('webhook')}>
            <Card className="bg-card shadow rounded-lg mb-6">
              <CardHeader>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Webhook Settings
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <SettingsSkeleton />
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="endpoints">Global Endpoints</Label>
                      <Input
                        id="endpoints"
                        defaultValue={settings?.webhook.globalEndpoints}
                        className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="https://api.example.com/webhooks"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="retry">Retry Policy</Label>
                      <Select defaultValue={settings?.webhook.retryPolicy ?? '3'}>
                        <SelectTrigger className="border rounded-md p-2 w-full">
                          <SelectValue placeholder="Select retries" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 retry</SelectItem>
                          <SelectItem value="3">3 retries</SelectItem>
                          <SelectItem value="5">5 retries</SelectItem>
                          <SelectItem value="10">10 retries</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Security */}
          <section ref={setRef('security')}>
            <Card className="bg-card shadow rounded-lg mb-6">
              <CardHeader>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Security
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <SettingsSkeleton />
                ) : (
                  <>
                    <div>
                      <h3 className="text-sm font-medium mb-2">API Keys</h3>
                      {!settings?.security.apiKeys?.length ? (
                        <EmptyState
                          icon={Shield}
                          heading="No API keys"
                          description="Create an API key to integrate with external services."
                          ctaLabel="Create API key"
                          onCta={() => {}}
                        />
                      ) : (
                        <Table className="w-full border-collapse">
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Last Used</TableHead>
                              <TableHead>Scopes</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {settings.security.apiKeys.map((key) => (
                              <TableRow key={key.id}>
                                <TableCell>{key.name}</TableCell>
                                <TableCell>{key.lastUsed}</TableCell>
                                <TableCell>{key.scopes}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sso">SSO Metadata</Label>
                      <Textarea
                        id="sso"
                        defaultValue={settings?.security.ssoMetadata}
                        className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                        placeholder="Paste SSO metadata XML here"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="session">Session Timeout</Label>
                      <Select defaultValue={settings?.security.sessionTimeout ?? '24'}>
                        <SelectTrigger className="border rounded-md p-2 w-full">
                          <SelectValue placeholder="Select timeout" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 hour</SelectItem>
                          <SelectItem value="8">8 hours</SelectItem>
                          <SelectItem value="24">24 hours</SelectItem>
                          <SelectItem value="168">7 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <Label htmlFor="2fa" className="text-base font-medium">Two-factor authentication</Label>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                      </div>
                      <Switch
                        id="2fa"
                        defaultChecked={settings?.security.twoFactorEnabled}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </section>

          {/* LLM & Usage Controls */}
          <section ref={setRef('llm')}>
            <Card className="bg-card shadow rounded-lg mb-6">
              <CardHeader>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  LLM & Usage Controls
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <SettingsSkeleton />
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="model">Model Defaults</Label>
                      <Select defaultValue={settings?.llm.modelDefaults ?? 'gpt-4'}>
                        <SelectTrigger className="border rounded-md p-2 w-full">
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt-4">GPT-4</SelectItem>
                          <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                          <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                          <SelectItem value="claude-3">Claude 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="caps">Usage Caps</Label>
                      <Input
                        id="caps"
                        defaultValue={settings?.llm.usageCaps}
                        type="number"
                        className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Monthly limit (e.g. 1000)"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="alerts">Cost Alerts</Label>
                      <Input
                        id="alerts"
                        defaultValue={settings?.llm.costAlerts}
                        type="number"
                        className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Alert when cost exceeds ($)"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Privacy & Data Retention */}
          <section ref={setRef('privacy')}>
            <Card className="bg-card shadow rounded-lg mb-6">
              <CardHeader>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Privacy & Data Retention
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <SettingsSkeleton />
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="retention">Retention Policy</Label>
                    <Textarea
                      id="retention"
                      defaultValue={settings?.privacy.retentionPolicy}
                      className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                      placeholder="Describe your data retention policy..."
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  )
}
