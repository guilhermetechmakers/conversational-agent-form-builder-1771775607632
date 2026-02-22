import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Get started with conversational forms',
    features: ['3 agents', '100 sessions/month', 'Basic fields', 'Public share links'],
    cta: 'Get started',
    href: '/signup',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$29',
    description: 'For growing teams',
    features: ['Unlimited agents', '1,000 sessions/month', 'All field types', 'Webhooks', 'Context attachments'],
    cta: 'Start trial',
    href: '/signup',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations',
    features: ['Everything in Pro', 'Unlimited sessions', 'SSO', 'Dedicated support', 'SLA'],
    cta: 'Contact sales',
    href: '/signup',
    highlighted: false,
  },
]

export function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header variant="landing" />
      <div className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold">Pricing</h1>
          <p className="mt-4 text-muted-foreground">
            Simple, transparent pricing for teams of all sizes.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={
                plan.highlighted
                  ? 'border-primary shadow-elevated'
                  : ''
              }
            >
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4 text-3xl font-bold">{plan.price}</div>
                {plan.price !== 'Custom' && (
                  <span className="text-sm text-muted-foreground">/month</span>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to={plan.href} className="block">
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
