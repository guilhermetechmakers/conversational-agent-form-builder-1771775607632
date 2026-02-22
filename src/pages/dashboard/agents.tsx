import { Link } from 'react-router-dom'
import { Bot, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function AgentsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agents</h1>
          <p className="text-muted-foreground">Manage your conversational form agents</p>
        </div>
        <Link to="/dashboard/agents/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Agent
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All agents</CardTitle>
          <CardDescription>Your published and draft agents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
            <Bot className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 font-semibold">No agents yet</h3>
            <p className="mb-4 text-center text-sm text-muted-foreground">
              Create your first agent to define fields, persona, and context.
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
