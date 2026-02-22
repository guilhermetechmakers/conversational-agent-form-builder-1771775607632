import { Webhook, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function IntegrationsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground">Webhooks and external integrations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Webhooks</CardTitle>
          <CardDescription>Configure webhook endpoints for session events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
            <Webhook className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 font-semibold">No webhooks configured</h3>
            <p className="mb-4 text-center text-sm text-muted-foreground">
              Add webhooks to send completed sessions to your CRM or tools.
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add webhook
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
