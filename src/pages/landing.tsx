import { Link } from 'react-router-dom'
import {
  MessageSquare,
  Zap,
  Share2,
  BarChart3,
  ExternalLink,
  Inbox,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
const FEATURES = [
  {
    icon: MessageSquare,
    title: 'Natural dialogue',
    description:
      'Visitors converse naturally instead of filling fields. Higher completion rates and better engagement.',
  },
  {
    icon: Zap,
    title: 'AI-powered extraction',
    description:
      'LLM parses answers into structured fields with validation and confidence scores.',
  },
  {
    icon: Share2,
    title: 'Shareable links',
    description:
      'Publish agents to unique URLs. No embedding required. Share in campaigns.',
  },
  {
    icon: BarChart3,
    title: 'CRM integrations',
    description:
      'Webhooks, Zapier, HubSpot, Salesforce. Export CSV/JSON. Automate workflows.',
  },
]

const TESTIMONIALS = [
  {
    quote:
      'Conversational agents increased our form completion rate by 40%. Game changer for lead gen.',
    author: 'Sarah M.',
    role: 'Growth Lead',
  },
  {
    quote:
      'Setup took minutes. The AI extraction is surprisingly accurate. Highly recommend.',
    author: 'James K.',
    role: 'Product Manager',
  },
]

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header variant="landing" />

      <main className="flex flex-col md:grid md:grid-cols-12 md:gap-8">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-16 px-8 md:px-24 flex flex-col md:grid md:col-span-12">
          <div className="flex flex-col md:grid md:grid-cols-12 md:gap-8">
            <div className="md:col-span-6 flex flex-col justify-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Replace static forms with conversational agents
              </h1>
              <p className="text-lg md:text-xl mb-8">
                Create AI-powered conversational forms that collect structured
                data through natural dialogue. Higher conversion, better
                engagement, seamless integrations.
              </p>
              <Link to="/signup">
                <Button
                  className="bg-white text-blue-600 hover:bg-gray-100 transition-colors duration-300 ease-in-out px-6 py-3 rounded-full font-semibold mb-4"
                  size="lg"
                >
                  Start building free
                </Button>
              </Link>
            </div>
            <div className="flex justify-center items-center md:col-span-6 mt-8 md:mt-0">
              <div className="w-full h-auto md:w-1/2 flex justify-center items-center">
                <div className="relative w-full aspect-video max-w-md rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                  <MessageSquare className="w-24 h-24 text-white/40" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Highlights */}
        <section className="py-12 bg-gray-100 flex flex-col md:grid md:grid-cols-12 md:gap-8 md:col-span-12">
          <div className="container mx-auto px-4 md:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              Why conversational forms?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURES.map((feature) => (
                <Card
                  key={feature.title}
                  className="bg-white shadow-md p-6 rounded-lg mb-6 md:mb-0 hover:shadow-lg transition-shadow duration-300 ease-in-out"
                >
                  <CardContent className="p-0">
                    <feature.icon className="w-12 h-12 text-blue-500 mb-4" />
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-gray-700">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Live Demo CTA */}
        <section className="bg-white text-center py-8 flex flex-col md:grid md:col-span-12">
          <div className="container mx-auto px-4">
            <p className="text-gray-700 mb-4">
              See it in action. Try our interactive demo.
            </p>
            <a
              href="/agent-public-chat-visitor-view/demo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 font-semibold underline hover:text-blue-800 transition-colors duration-300 ease-in-out inline-flex items-center gap-2"
            >
              Open live demo
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </section>

        {/* Pricing Teaser */}
        <section className="bg-gradient-to-r from-green-400 to-teal-500 text-white py-12 px-8 md:px-24 flex flex-col md:grid md:col-span-12">
          <div className="container mx-auto text-center">
            <div className="text-lg font-medium mb-4">
              Start free. Scale as you grow. No credit card required.
            </div>
            <p className="mb-6 opacity-90">
              Free tier includes 100 conversations/month. Upgrade anytime.
            </p>
            <Link to="/pricing">
              <Button
                className="bg-white text-green-600 hover:bg-gray-100 transition-colors duration-300 ease-in-out px-6 py-3 rounded-full font-semibold"
                size="lg"
              >
                View pricing
              </Button>
            </Link>
          </div>
        </section>

        {/* Customer Logos / Testimonials */}
        <section className="bg-gray-50 py-12 flex flex-col md:grid md:col-span-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              Trusted by product teams
            </h2>
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-12 w-24 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs font-medium"
                  aria-hidden
                >
                  Logo {i}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {TESTIMONIALS.map((t) => (
                <Card
                  key={t.author}
                  className="bg-white shadow-md p-6 rounded-lg hover:shadow-lg transition-shadow duration-300 ease-in-out"
                >
                  <CardContent className="p-0">
                    <p className="text-gray-700 mb-4 italic">&ldquo;{t.quote}&rdquo;</p>
                    <p className="font-semibold text-gray-900">{t.author}</p>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-800 text-gray-300 py-8 flex flex-col md:grid md:col-span-12">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">
              © {new Date().getFullYear()} Agent Builder. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link
                to="/about"
                className="text-gray-400 hover:text-white transition-colors duration-300 ease-in-out px-4"
              >
                About
              </Link>
              <Link
                to="/pricing"
                className="text-gray-400 hover:text-white transition-colors duration-300 ease-in-out px-4"
              >
                Pricing
              </Link>
              <a
                href="/agent-public-chat-visitor-view/demo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-300 ease-in-out px-4"
              >
                Demo
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

/** Loading skeleton matching the landing page layout structure */
export function LandingPageSkeleton() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="h-16 border-b border-border bg-background" />
      <main className="flex flex-col md:grid md:grid-cols-12 md:gap-8 animate-pulse space-y-4">
        {/* Hero skeleton */}
        <section className="bg-gray-200 py-16 px-8 md:px-24 md:col-span-12">
          <div className="space-y-4 max-w-2xl">
            <div className="bg-gray-300 h-12 w-3/4 rounded" />
            <div className="bg-gray-200 h-6 w-full rounded" />
            <div className="bg-gray-200 h-6 w-2/3 rounded" />
            <div className="bg-gray-300 h-12 w-48 rounded-full" />
          </div>
        </section>
        {/* Features skeleton */}
        <section className="py-12 bg-gray-100 md:col-span-12">
          <div className="container mx-auto px-4 space-y-6">
            <div className="bg-gray-300 h-8 w-1/3 mx-auto rounded" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-md space-y-4">
                  <div className="bg-gray-200 h-12 w-12 rounded" />
                  <div className="bg-gray-300 h-6 w-3/4 rounded" />
                  <div className="bg-gray-200 h-4 w-full rounded" />
                  <div className="bg-gray-200 h-4 w-1/2 rounded" />
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* Pricing skeleton */}
        <section className="py-12 bg-gray-200 md:col-span-12">
          <div className="container mx-auto text-center space-y-4">
            <div className="bg-gray-300 h-6 w-1/2 mx-auto rounded" />
            <div className="bg-gray-300 h-12 w-40 mx-auto rounded-full" />
          </div>
        </section>
        {/* Footer skeleton */}
        <footer className="bg-gray-800 py-8 md:col-span-12">
          <div className="container mx-auto px-4 flex justify-between">
            <div className="bg-gray-600 h-4 w-48 rounded" />
            <div className="bg-gray-600 h-4 w-32 rounded" />
          </div>
        </footer>
      </main>
    </div>
  )
}

/** Error state with retry - use with error boundaries or route errorElement */
export function LandingErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <p className="text-red-500 mb-4 text-center">
          Something went wrong. Please try again.
        </p>
        <Button
          onClick={() => (onRetry ? onRetry() : window.location.reload())}
          className="bg-red-600 text-white hover:bg-red-700 transition-colors duration-300 ease-in-out px-6 py-3 rounded-full"
        >
          Retry
        </Button>
    </div>
  )
}

/** Empty state component for contextual use */
export function LandingEmptyState({
  onAction,
}: {
  onAction?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16 px-4">
      <Inbox className="w-16 h-16 text-gray-400 mb-4" />
      <h2 className="text-xl font-semibold mb-2 text-gray-900">
        No content to display
      </h2>
      <p className="text-gray-600 mb-4 text-center max-w-md">
        This section is empty. Check back later or get started to add content.
      </p>
      {onAction && (
        <Button
          onClick={onAction}
          className="bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300 ease-in-out px-6 py-3 rounded-full"
        >
          Get started
        </Button>
      )}
    </div>
  )
}
