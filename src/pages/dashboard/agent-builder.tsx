import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function AgentBuilderPage() {
  const { agentId } = useParams()
  const isNew = !agentId

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/agents">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{isNew ? 'Create Agent' : 'Edit Agent'}</h1>
          <p className="text-muted-foreground">
            Define fields, persona, and appearance for your conversational form
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
            <CardDescription>Basic agent information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="e.g. Lead Capture Agent" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" placeholder="Brief description of this agent" />
            </div>
          </CardContent>
        </Card>

        {/* Persona */}
        <Card>
          <CardHeader>
            <CardTitle>Persona & Tone</CardTitle>
            <CardDescription>System prompt and tone for the assistant</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="persona">System prompt</Label>
              <textarea
                id="persona"
                className="flex min-h-[120px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="You are a friendly assistant that..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Fields */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Fields</CardTitle>
            <CardDescription>Define the structured data to collect</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
              <p className="text-sm text-muted-foreground">
                Add fields (text, email, number, select, etc.) to collect structured data.
              </p>
              <Button variant="outline" className="mt-4">
                Add field
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
