import { Link } from 'react-router-dom'
import { MessageSquare, Zap, Share2, BarChart3 } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header variant="landing" />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="container mx-auto px-4 py-24 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="animate-in-up text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Replace static forms with{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                conversational agents
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Create AI-powered conversational forms that collect structured data through natural
              dialogue. Higher conversion, better engagement, seamless integrations.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/signup">
                <Button size="lg" className="min-w-[180px]">
                  Start building free
                </Button>
              </Link>
              <Link to="/agent-public-chat-visitor-view/demo">
                <Button variant="outline" size="lg" className="min-w-[180px]">
                  Try live demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Bento Grid */}
      <section className="container mx-auto px-4 py-24">
        <h2 className="mb-12 text-center text-3xl font-bold">Why conversational forms?</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="animate-in-up transition-all duration-300 hover:scale-[1.02] hover:shadow-card-hover [animation-delay:0ms]">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold text-lg">Natural dialogue</h3>
              <p className="text-sm text-muted-foreground">
                Visitors converse naturally instead of filling fields. Higher completion rates.
              </p>
            </CardContent>
          </Card>
          <Card className="animate-in-up transition-all duration-300 hover:scale-[1.02] hover:shadow-card-hover [animation-delay:100ms]">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mb-2 font-semibold text-lg">AI-powered extraction</h3>
              <p className="text-sm text-muted-foreground">
                LLM parses answers into structured fields with validation and confidence scores.
              </p>
            </CardContent>
          </Card>
          <Card className="animate-in-up transition-all duration-300 hover:scale-[1.02] hover:shadow-card-hover [animation-delay:200ms]">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Share2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold text-lg">Shareable links</h3>
              <p className="text-sm text-muted-foreground">
                Publish agents to unique URLs. No embedding required. Share in campaigns.
              </p>
            </CardContent>
          </Card>
          <Card className="animate-in-up transition-all duration-300 hover:scale-[1.02] hover:shadow-card-hover [animation-delay:300ms]">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <BarChart3 className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mb-2 font-semibold text-lg">CRM integrations</h3>
              <p className="text-sm text-muted-foreground">
                Webhooks, Zapier, HubSpot, Salesforce. Export CSV/JSON. Automate workflows.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-muted/30 py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">Ready to boost your conversions?</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Join product marketers and growth teams using conversational agents.
          </p>
          <Link to="/signup" className="mt-8 inline-block">
            <Button size="lg">Get started free</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Agent Builder. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">
              About
            </Link>
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
