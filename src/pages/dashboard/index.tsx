import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Bot,
  MessageSquare,
  Zap,
  Plus,
  ExternalLink,
  MoreHorizontal,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { toast } from 'sonner'
import { useDashboardAgents, useDashboardSessions, useDashboardStats, useDashboardUsageGraph } from '@/hooks/use-dashboard'
import { cn } from '@/lib/utils'

function getPublicLink(agentId: string) {
  const base = window.location.origin
  return `${base}/agent-public-chat-visitor-view/${agentId}`
}

function copyLinkToClipboard(agentId: string) {
  const link = getPublicLink(agentId)
  navigator.clipboard.writeText(link).then(
    () => toast.success('Link copied to clipboard'),
    () => toast.error('Failed to copy link')
  )
}

export function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const { data: agents = [], isLoading: agentsLoading, isError: agentsError, refetch: refetchAgents } = useDashboardAgents(searchQuery)
  const { data: sessions = [], isLoading: sessionsLoading, isError: sessionsError, refetch: refetchSessions } = useDashboardSessions(10)
  const { data: stats, isLoading: statsLoading, isError: statsError, refetch: refetchStats } = useDashboardStats()
  const { data: usageData = [], isLoading: usageLoading } = useDashboardUsageGraph(7)

  const isError = agentsError || sessionsError || statsError

  const handleRetry = () => {
    refetchAgents()
    refetchSessions()
    refetchStats()
  }

  const summaryCards = useMemo(() => {
    const agentsCount = stats?.agentsCount ?? 0
    const sessionsCount = stats?.sessionsCount ?? 0
    const llmUsage = stats?.llmUsage ?? 0
    return [
      { label: 'Agents', value: String(agentsCount), icon: Bot, href: '/dashboard/agents' },
      { label: 'Sessions', value: String(sessionsCount), icon: MessageSquare, href: '/dashboard/sessions' },
      { label: 'LLM usage', value: String(llmUsage), icon: Zap, href: '/dashboard/settings' },
    ]
  }, [stats])

  if (isError) {
    return (
      <div className="-m-6 flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
        <div className="flex flex-col items-center justify-center">
          <div className="mb-4 text-red-400">
            <AlertCircle className="h-12 w-12" />
          </div>
          <h2 className="text-xl font-semibold text-red-600">Something went wrong</h2>
          <p className="mb-6 text-gray-500">We couldn&apos;t load your dashboard. Please try again.</p>
          <Button
            className="rounded bg-red-600 p-2 text-white transition-colors hover:bg-red-700"
            onClick={handleRetry}
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="-m-6 flex min-h-screen flex-col bg-gray-50 p-6 md:grid md:grid-cols-12 md:gap-6">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:col-span-12 md:grid-cols-4">
        {statsLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-200" />
            ))}
          </>
        ) : (
          summaryCards.map((stat) => (
            <Link key={stat.label} to={stat.href}>
              <Card className="flex items-center bg-white p-4 shadow-md transition-colors hover:bg-gray-50">
                <div className={cn('text-blue-500')}>
                  <stat.icon className="h-8 w-8" />
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-muted-foreground">{stat.label}</h2>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>

      {/* Agents List */}
      <div className="col-span-12 rounded-lg bg-white p-6 shadow-md md:col-span-8">
        <Input
          type="search"
          placeholder="Search agents..."
          className="mb-4 w-full rounded border border-gray-300 p-2"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search agents"
        />
        {agentsLoading ? (
          <div className="h-64 animate-pulse rounded bg-gray-200" />
        ) : agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 text-gray-400">
              <Bot className="h-12 w-12" />
            </div>
            <h2 className="mb-2 text-xl font-semibold">No agents yet</h2>
            <p className="mb-6 text-center text-gray-500">
              Create your first conversational agent to start collecting leads.
            </p>
            <Link to="/dashboard/agents/new">
              <Button className="rounded bg-blue-600 p-2 transition-colors hover:bg-blue-700">
                Create Agent
              </Button>
            </Link>
          </div>
        ) : (
          <Table className="w-full text-left">
            <TableHeader>
              <TableRow className="border-b">
                <TableHead>Agent Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Public Link</TableHead>
                <TableHead>Stats</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow
                  key={agent.id}
                  className="border-b transition-colors hover:bg-gray-100"
                >
                  <TableCell className="font-medium">{agent.title}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        agent.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      )}
                    >
                      {agent.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-500 transition-colors hover:text-blue-700"
                      onClick={() => copyLinkToClipboard(agent.id)}
                    >
                      <ExternalLink className="mr-1 h-4 w-4" />
                      Copy link
                    </Button>
                  </TableCell>
                  <TableCell className="text-muted-foreground">—</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Actions">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/dashboard/agents/${agent.id}`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href={getPublicLink(agent.id)} target="_blank" rel="noopener noreferrer">
                            Open link
                          </a>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Recent Sessions Feed */}
      <div className="col-span-12 rounded-lg bg-white p-6 shadow-md md:col-span-4">
        <h2 className="mb-4 text-lg font-semibold">Recent Sessions</h2>
        {sessionsLoading ? (
          <div className="h-64 animate-pulse rounded bg-gray-200" />
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <MessageSquare className="mb-2 h-10 w-10 text-gray-400" />
            <p className="text-center text-sm text-gray-500">No sessions yet</p>
            <Link to="/dashboard/agents/new" className="mt-2">
              <Button variant="outline" size="sm">
                Create agent
              </Button>
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {sessions.map((session) => (
              <li
                key={session.id}
                className="flex items-center justify-between py-4"
              >
                <div className="flex-1">
                  <h3 className="text-sm font-medium">
                    {session.agent_title ?? 'Session'}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {session.status} · {new Date(session.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Link to={`/dashboard/sessions/${session.id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-500 transition-colors hover:text-blue-700"
                    >
                      View
                    </Button>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Usage Graphs */}
      <div className="col-span-12 rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-lg font-semibold">Usage</h2>
        {usageLoading ? (
          <div className="h-64 animate-pulse rounded bg-gray-200" />
        ) : usageData.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-gray-500">
            No usage data yet
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usageData}>
                <defs>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgb(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="rgb(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(v) => new Date(v).toLocaleDateString()}
                  formatter={(value: number | undefined) => [value ?? 0, 'Sessions']}
                />
                <Area
                  type="monotone"
                  dataKey="sessions"
                  stroke="rgb(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorSessions)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Create Agent CTA */}
      <Link
        to="/dashboard/agents/new"
        className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-blue-600 px-5 py-4 text-white shadow-lg transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Create Agent"
      >
        <Plus className="h-6 w-6" />
        <span>Create Agent</span>
      </Link>
    </div>
  )
}
