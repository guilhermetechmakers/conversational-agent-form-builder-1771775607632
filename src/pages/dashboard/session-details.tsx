import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function SessionDetailsPage() {
  const { sessionId } = useParams()

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/sessions">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Session {sessionId}</h1>
          <p className="text-muted-foreground">Transcript and extracted data</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Transcript</CardTitle>
            <CardDescription>Full conversation history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
              No messages in this session.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Structured data</CardTitle>
            <CardDescription>Extracted fields with confidence</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
              No extracted data.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
