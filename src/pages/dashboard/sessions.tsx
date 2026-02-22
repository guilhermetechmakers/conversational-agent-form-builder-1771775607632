import { Link } from 'react-router-dom'
import { MessageSquare, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useDashboardSessions } from '@/hooks/use-dashboard'

export function SessionsPage() {
  const { data: sessions, isLoading } = useDashboardSessions(100)
  const hasSessions = sessions && sessions.length > 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Sessions</h1>
        <p className="text-muted-foreground">View and manage conversation sessions</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All sessions</CardTitle>
              <CardDescription>Filter, search, and export session data</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search sessions..." className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-8 w-32 animate-pulse rounded bg-muted mb-4" />
              <div className="h-4 w-48 animate-pulse rounded bg-muted" />
            </div>
          ) : hasSessions ? (
            <div className="space-y-2">
              {sessions.map((s) => (
                <Link
                  key={s.id}
                  to={`/dashboard/sessions/${s.id}`}
                  className="block rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{s.agent_title ?? 'Unknown Agent'}</p>
                      <p className="text-sm text-muted-foreground">
                        {s.status} · {new Date(s.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      View details →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
              <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 font-semibold">No sessions yet</h3>
              <p className="mb-4 text-center text-sm text-muted-foreground">
                Sessions will appear here when visitors complete conversations with your agents.
              </p>
              <Link to="/dashboard/agents">
                <Button variant="outline">Create an agent</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
