import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ArrowLeft,
  MessageSquare,
  Download,
  Send,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useSessionDetails } from '@/hooks/use-session-details'
import type { SessionMessage, ExtractedFieldValue } from '@/types/session-details'

function formatTimestamp(ts: string): string {
  try {
    const d = new Date(ts)
    return d.toLocaleString(undefined, {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  } catch {
    return ts
  }
}

function TranscriptPanel({
  messages,
  searchQuery,
  onSearchChange,
}: {
  messages: SessionMessage[]
  searchQuery: string
  onSearchChange: (q: string) => void
}) {
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return messages
    const q = searchQuery.toLowerCase()
    return messages.filter(
      (m) =>
        m.content.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q)
    )
  }, [messages, searchQuery])

  if (messages.length === 0) {
    return (
      <Card className="shadow-md rounded-lg mb-4 bg-white">
        <CardHeader className="flex justify-between items-center mb-2">
          <CardTitle className="text-lg">Transcript</CardTitle>
        </CardHeader>
        <CardContent className="bg-white p-4">
          <div className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-center text-gray-700 font-semibold mb-2">
              No messages in this session
            </h3>
            <p className="text-center text-gray-500 text-sm">
              The conversation transcript will appear here when messages are exchanged.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-md rounded-lg mb-4 bg-white hover:shadow-lg transition-shadow duration-150">
      <CardHeader className="flex flex-row justify-between items-center mb-2 p-4 pb-2">
        <CardTitle className="text-lg">Transcript</CardTitle>
        <Input
          placeholder="Search transcript..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="border rounded-md px-2 py-1 w-48"
        />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-2 overflow-y-auto max-h-96">
          {filtered.map((msg) => (
            <div key={msg.id} className="flex items-start space-x-2">
              <span className="font-semibold shrink-0 text-sm">
                {msg.role === 'user' ? 'User' : 'Assistant'}:
              </span>
              <span className="text-gray-500 text-sm shrink-0">
                {formatTimestamp(msg.timestamp)}
              </span>
              <p className="text-gray-700 flex-1">{msg.content}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function StructuredDataPanel({
  extractedFields,
}: {
  extractedFields: Record<string, ExtractedFieldValue>
}) {
  const entries = Object.entries(extractedFields ?? {})

  if (entries.length === 0) {
    return (
      <Card className="shadow-md rounded-lg mb-4 bg-white">
        <CardHeader>
          <CardTitle className="text-lg mb-2">Structured Data</CardTitle>
        </CardHeader>
        <CardContent className="bg-white p-4">
          <div className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-center text-gray-700 font-semibold mb-2">
              No extracted data
            </h3>
            <p className="text-center text-gray-500 text-sm">
              Extracted field values will appear here when the agent collects data.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-md rounded-lg mb-4 bg-white hover:shadow-lg transition-shadow duration-150">
      <CardHeader>
        <CardTitle className="text-lg mb-2">Structured Data</CardTitle>
      </CardHeader>
      <CardContent className="bg-white p-4">
        <Table className="w-full border-collapse">
          <TableHeader>
            <TableRow>
              <TableHead>Field</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Confidence</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map(([key, field]) => (
              <TableRow key={key} className="odd:bg-gray-50 even:bg-white">
                <TableCell className="font-medium">{key}</TableCell>
                <TableCell>{String(field.value)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      field.status === 'valid'
                        ? 'default'
                        : field.status === 'invalid'
                          ? 'destructive'
                          : 'secondary'
                    }
                    className="text-xs font-medium"
                  >
                    {field.status ?? 'pending'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {field.confidence != null ? (
                    <Badge variant="outline" className="text-xs font-medium">
                      {Math.round(field.confidence * 100)}%
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function SessionMetadataCard({
  sessionId,
  status,
  agentTitle,
  createdAt,
  updatedAt,
  webhookDelivered,
}: {
  sessionId: string
  status: string
  agentTitle?: string
  createdAt: string
  updatedAt: string
  webhookDelivered?: boolean
}) {
  const items = [
    { key: 'Session ID', value: sessionId },
    { key: 'Status', value: status },
    { key: 'Agent', value: agentTitle ?? '—' },
    { key: 'Created', value: formatTimestamp(createdAt) },
    { key: 'Updated', value: formatTimestamp(updatedAt) },
    { key: 'Webhook', value: webhookDelivered ? 'Delivered' : 'Not sent' },
  ]

  return (
    <Card className="shadow-md rounded-lg mb-4 bg-white hover:shadow-lg transition-shadow duration-150">
      <CardHeader>
        <CardTitle className="text-lg mb-2">Session Metadata</CardTitle>
      </CardHeader>
      <CardContent className="bg-white p-4">
        <div className="space-y-1">
          {items.map(({ key, value }) => (
            <div key={key} className="flex justify-between">
              <span className="font-semibold">{key}</span>
              <span className="text-gray-600">{value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function SessionDetailsSkeleton() {
  return (
    <div className="flex flex-col md:flex-row h-full">
      <div className="w-full md:w-64 flex-shrink-0 p-4">
        <Skeleton className="h-8 w-32 mb-4 bg-muted animate-pulse" />
        <Skeleton className="h-4 w-full mb-2 bg-muted animate-pulse" />
        <Skeleton className="h-4 w-full mb-2 bg-muted animate-pulse" />
        <Skeleton className="h-4 w-3/4 bg-muted animate-pulse" />
      </div>
      <div className="flex-1 p-4 space-y-4">
        <Skeleton className="h-48 w-full rounded-lg bg-muted animate-pulse" />
        <Skeleton className="h-32 w-full rounded-lg bg-muted animate-pulse" />
        <Skeleton className="h-24 w-full rounded-lg bg-muted animate-pulse" />
      </div>
    </div>
  )
}

function SessionDetailsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="text-red-600 mb-4">Failed to load session details.</div>
      <Button
        onClick={onRetry}
        className="bg-red-600 hover:bg-red-700 text-white transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Retry
      </Button>
    </div>
  )
}

export function SessionDetailsPage() {
  const { sessionId } = useParams()
  const { data: session, isLoading, error, refetch } = useSessionDetails(sessionId)
  const [searchQuery, setSearchQuery] = useState('')
  const [replayIndex, setReplayIndex] = useState(-1)

  const messages = session?.metadata?.messages ?? []
  const extractedFields = session?.metadata?.extractedFields ?? {}
  const canReplayPrev = replayIndex > 0
  const canReplayNext = replayIndex < messages.length - 1 && messages.length > 0

  const handleExport = () => {
    if (!session) return
    const payload = {
      sessionId: session.id,
      agentId: session.agent_id,
      status: session.status,
      createdAt: session.created_at,
      messages,
      extractedFields,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `session-${session.id}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Session exported successfully')
  }

  const handleResendWebhook = () => {
    // Placeholder - would call Edge Function
  }

  if (isLoading) {
    return (
      <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] bg-muted/30">
        <SessionDetailsSkeleton />
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] bg-muted/30 p-4">
        <SessionDetailsError onRetry={() => refetch()} />
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] bg-muted/30">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-r border-border flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-border">
          <Link to="/dashboard/sessions">
            <Button
              variant="ghost"
              size="sm"
              className="transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sessions
            </Button>
          </Link>
        </div>
        <div className="p-4 flex-1">
          <p className="text-sm text-muted-foreground font-medium">Session</p>
          <p className="text-xs text-muted-foreground mt-1 truncate" title={session.id}>
            {session.id.slice(0, 8)}…
          </p>
          <p className="text-sm text-muted-foreground mt-4 font-medium">Agent</p>
          <p className="text-sm font-medium truncate" title={session.agent_title}>
            {session.agent_title ?? '—'}
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Session Details</h1>
            <p className="text-muted-foreground text-sm">
              Transcript and extracted data
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex space-x-2 mb-4">
          <Button
            onClick={handleExport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
          <Button
            onClick={handleResendWebhook}
            variant="outline"
            className="px-4 py-2 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Send className="h-4 w-4 mr-2" />
            Resend Webhook
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <TranscriptPanel
              messages={messages}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
            <Card className="shadow-md rounded-lg bg-white hover:shadow-lg transition-shadow duration-150">
              <CardHeader>
                <CardTitle className="text-lg mb-2">Conversation Replay</CardTitle>
              </CardHeader>
              <CardContent className="bg-white p-4">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setReplayIndex((i) => Math.max(-1, i - 1))}
                    disabled={!canReplayPrev}
                    className="bg-gray-200 hover:bg-gray-300 rounded-full transition-colors duration-150"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {replayIndex < 0
                      ? 'Start replay'
                      : `${replayIndex + 1} / ${messages.length}`}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setReplayIndex((i) =>
                        Math.min(messages.length - 1, i + 1)
                      )
                    }
                    disabled={!canReplayNext}
                    className="bg-gray-200 hover:bg-gray-300 rounded-full transition-colors duration-150"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                {replayIndex >= 0 && messages[replayIndex] && (
                  <div className="mt-4 p-3 rounded-lg bg-muted/50 text-sm">
                    <p className="font-semibold text-xs text-muted-foreground mb-1">
                      {messages[replayIndex].role}
                    </p>
                    <p className="text-foreground">{messages[replayIndex].content}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4">
            <StructuredDataPanel extractedFields={extractedFields} />
            <SessionMetadataCard
              sessionId={session.id}
              status={session.status}
              agentTitle={session.agent_title}
              createdAt={session.created_at}
              updatedAt={session.updated_at}
              webhookDelivered={session.metadata?.webhook_delivered}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
