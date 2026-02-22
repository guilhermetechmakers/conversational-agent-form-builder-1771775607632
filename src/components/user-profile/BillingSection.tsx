import { CreditCard, Check } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { BillingPlan } from '@/types/user-profile'

interface BillingSectionProps {
  currentPlan?: BillingPlan
  plans?: BillingPlan[]
  onUpgrade?: (planId: string) => void
  onManagePayment?: () => void
}

const DEFAULT_PLANS: BillingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: ['Up to 3 agents', '100 conversations/month', 'Basic support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    interval: 'month',
    features: ['Unlimited agents', '10,000 conversations/month', 'Priority support', 'API access'],
    current: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    interval: 'month',
    features: ['Everything in Pro', 'Unlimited conversations', 'Dedicated support', 'Custom integrations'],
  },
]

export function BillingSection({
  currentPlan,
  plans = DEFAULT_PLANS,
  onUpgrade,
  onManagePayment,
}: BillingSectionProps) {
  const displayPlans = plans.length > 0 ? plans : DEFAULT_PLANS
  const current = currentPlan ?? displayPlans.find((p) => p.current) ?? displayPlans[1]

  return (
    <Card className="transition-all duration-300 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Billing
        </CardTitle>
        <CardDescription>
          Manage your subscription plan and payment methods
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <h4 className="mb-4 font-medium">Current plan</h4>
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{current.name}</p>
                <p className="text-sm text-muted-foreground">
                  ${current.price}/{current.interval}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="/pricing">Change plan</a>
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="mb-4 font-medium">Available plans</h4>
          <div className="grid gap-4 md:grid-cols-3">
            {displayPlans.map((plan) => {
              const isCurrent = plan.id === current.id
              return (
                <div
                  key={plan.id}
                  className={cn(
                    'relative rounded-xl border p-6 transition-all duration-300',
                    isCurrent
                      ? 'border-primary bg-primary/5 shadow-card'
                      : 'border-border hover:border-primary/50 hover:shadow-card-hover'
                  )}
                >
                  {isCurrent && (
                    <div className="absolute -top-3 left-4 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
                      Current
                    </div>
                  )}
                  <div className="mb-4 flex items-baseline gap-1">
                    <span className="text-2xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/{plan.interval}</span>
                  </div>
                  <h5 className="mb-4 font-semibold">{plan.name}</h5>
                  <ul className="mb-6 space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 shrink-0 text-accent" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {!isCurrent && (
                    <Button
                      className="w-full"
                      variant={plan.id === 'enterprise' ? 'default' : 'outline'}
                      onClick={() => onUpgrade?.(plan.id)}
                    >
                      {plan.price === 0 ? 'Downgrade' : 'Upgrade'}
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="mb-4 font-medium">Payment method</h4>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <CreditCard className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/25</p>
              </div>
            </div>
            <Button variant="outline" onClick={onManagePayment}>
              Update payment method
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
