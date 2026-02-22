import { Link } from 'react-router-dom'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'

export function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header variant="landing" />
      <div className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold">About</h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Conversational Agent Form Builder helps product marketers, growth teams, and
            developers replace static forms with engaging AI-powered conversations. Collect
            structured data through natural dialogue, reduce friction, and increase conversion.
          </p>
          <div className="mt-12 space-y-4">
            <h2 className="text-xl font-semibold">Getting started</h2>
            <p className="text-muted-foreground">
              Sign up, create your first agent, define fields and persona, then publish to get
              a shareable link. Visitors converse with your agent; you get validated, structured
              data.
            </p>
            <Link to="/signup">
              <Button>Get started</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
