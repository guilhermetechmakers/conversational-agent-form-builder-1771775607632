import { Link } from 'react-router-dom'
import { Bot, MessageSquare, Zap, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const stats = [
  { label: 'Agents', value: '0', icon: Bot, href: '/dashboard/agents' },
  { label: 'Sessions', value: '0', icon: MessageSquare, href: '/dashboard/sessions' },
  { label: 'LLM usage', value: '0', icon: Zap, href: '/dashboard/settings' },
]

export function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your conversational agents</p>
        </div>
        <Link to="/dashboard/agents/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Agent
          </Button>
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.href}>
            <Card className="transition-all duration-300 hover:scale-[1.02] hover:shadow-card-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Agents list */}
      <Card>
        <CardHeader>
          <CardTitle>Your agents</CardTitle>
          <CardDescription>Create and manage conversational form agents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
            <Bot className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 font-semibold">No agents yet</h3>
            <p className="mb-4 text-center text-sm text-muted-foreground">
              Create your first conversational agent to start collecting leads.
            </p>
            <Link to="/dashboard/agents/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Agent
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
