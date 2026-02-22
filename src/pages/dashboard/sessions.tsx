import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  MessageSquare,
  Search,
  Eye,
  Download,
  Send,
  CheckSquare,
  Tag,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { DateRangePicker } from '@/components/ui/date-picker'
import { Pagination } from '@/components/ui/pagination'
import { useSessions, useBulkExportSessions, useBulkResendWebhooks } from '@/hooks/use-sessions'
import { useDashboardAgents } from '@/hooks/use-dashboard'
import type { SessionsListFilters, SessionListItem } from '@/types/sessions-list'
import { cn } from '@/lib/utils'

const DEFAULT_FILTERS: SessionsListFilters = {
  agentId: 'all',
  status: 'all',
  dateFrom: '',
  dateTo: '',
  conversionStatus: 'all',
  utmSource: 'all',
  search: '',
}

const PAGE_SIZE = 10

function formatTimestamp(ts: string): string {
  try {
    return new Date(ts).toLocaleString(undefined, {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  } catch {
    return ts
  }
}

function getSessionPreview(metadata: SessionListItem['metadata']): string {
  const messages = metadata?.messages
  if (!messages || messages.length === 0) return '—'
  const last = messages[messages.length - 1]
  const content = last.content ?? ''
  return content.length > 60 ? `${content.slice(0, 60)}…` : content
}

function getExtractedPreview(metadata: SessionListItem['metadata']): string {
  const fields = metadata?.extractedFields
  if (!fields || typeof fields !== 'object') return '—'
  const entries = Object.entries(fields).slice(0, 2)
  return entries
    .map(([k, v]) => {
      const val = v && typeof v === 'object' && 'value' in v ? (v as { value: unknown }).value : ''
      return `${k}: ${String(val)}`
    })
    .join(' · ') || '—'
}

function SessionsFilters({
  filters,
  onFiltersChange,
  agents,
}: {
  filters: SessionsListFilters
  onFiltersChange: (f: SessionsListFilters) => void
  agents: { id: string; title: string }[]
}) {
  const update = useCallback(
    (patch: Partial<SessionsListFilters>) => {
      onFiltersChange({ ...filters, ...patch })
    },
    [filters, onFiltersChange]
  )

  return (
    <div className="col-span-1 rounded-md bg-gray-100 p-4 shadow-md">
      <Select value={filters.agentId} onValueChange={(v) => update({ agentId: v })}>
        <SelectTrigger className="mb-4">
          <SelectValue placeholder="All agents" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All agents</SelectItem>
          {agents.map((a) => (
            <SelectItem key={a.id} value={a.id}>
              {a.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.status} onValueChange={(v) => update({ status: v as SessionsListFilters['status'] })}>
        <SelectTrigger className="mb-4">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="abandoned">Abandoned</SelectItem>
        </SelectContent>
      </Select>

      <div className="mb-4">
        <DateRangePicker
          from={filters.dateFrom}
          to={filters.dateTo}
          onFromChange={(v) => update({ dateFrom: v })}
          onToChange={(v) => update({ dateTo: v })}
        />
      </div>

      <Select value={filters.conversionStatus} onValueChange={(v) => update({ conversionStatus: v as SessionsListFilters['conversionStatus'] })}>
        <SelectTrigger className="mb-4">
          <SelectValue placeholder="Conversion" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="converted">Converted</SelectItem>
          <SelectItem value="not_converted">Not converted</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.utmSource} onValueChange={(v) => update({ utmSource: v })}>
        <SelectTrigger className="mb-4">
          <SelectValue placeholder="UTM / Source" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All sources</SelectItem>
          <SelectItem value="google">Google</SelectItem>
          <SelectItem value="facebook">Facebook</SelectItem>
          <SelectItem value="direct">Direct</SelectItem>
          <SelectItem value="organic">Organic</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

function SessionsTableSkeleton() {
  return (
    <div className="col-span-3 space-y-4 rounded-md bg-white p-4 shadow-md">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <Skeleton key={i} className="h-10 w-full rounded-md bg-gray-200" />
      ))}
    </div>
  )
}

function SessionsEmptyState() {
  return (
    <div className="col-span-3 flex h-64 flex-col items-center justify-center rounded-md bg-gray-100">
      <MessageSquare className="mb-2 h-12 w-12 text-gray-400" />
      <h2 className="text-lg font-semibold text-gray-700">No sessions yet</h2>
      <p className="text-gray-500">
        Sessions will appear here when visitors complete conversations with your agents.
      </p>
      <Link to="/dashboard/agents">
        <Button
          className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create an agent
        </Button>
      </Link>
    </div>
  )
}

function SessionsErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="col-span-3 flex h-64 flex-col items-center justify-center rounded-md bg-red-100">
      <AlertCircle className="mb-2 h-12 w-12 text-red-400" />
      <p className="text-red-700">Failed to load sessions. Please try again.</p>
      <Button
        onClick={onRetry}
        className="mt-4 rounded-md bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        Retry
      </Button>
    </div>
  )
}

export function SessionsPage() {
  const [filters, setFilters] = useState<SessionsListFilters>(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const params = {
    page,
    limit: PAGE_SIZE,
    filters,
  }

  const { data, isLoading, error, refetch } = useSessions(params)
  const { data: agents = [] } = useDashboardAgents()
  const bulkExport = useBulkExportSessions()
  const bulkResend = useBulkResendWebhooks()

  const sessions = data?.sessions ?? []
  const totalPages = data?.totalPages ?? 1
  const hasSelection = selectedIds.size > 0

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === sessions.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(sessions.map((s) => s.id)))
    }
  }

  const doExport = async (ids: string[]) => {
    if (ids.length === 0) return
    try {
      const data = await bulkExport.mutateAsync(ids)
      if (data && data.length > 0) {
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json',
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `sessions-export-${new Date().toISOString().slice(0, 10)}.json`
        a.click()
        URL.revokeObjectURL(url)
        toast.success(`Exported ${data.length} session(s)`)
        setSelectedIds(new Set())
      }
    } catch {
      toast.error('Failed to export sessions')
    }
  }

  const handleExportSelected = () => doExport(Array.from(selectedIds))

  const handleResendWebhooks = async () => {
    if (selectedIds.size === 0) return
    try {
      await bulkResend.mutateAsync(Array.from(selectedIds))
      toast.success('Webhook resend initiated')
      setSelectedIds(new Set())
    } catch {
      toast.error('Failed to resend webhooks')
    }
  }

  const handleExportAll = () => doExport(sessions.map((s) => s.id))

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Sessions</h1>
        <p className="text-muted-foreground">
          Paginated list of all sessions across agents. Manage leads at scale.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <SessionsFilters
          filters={filters}
          onFiltersChange={(f) => {
            setFilters(f)
            setPage(1)
          }}
          agents={agents.map((a) => ({ id: a.id, title: a.title }))}
        />

        <div className="col-span-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search sessions..."
              value={filters.search}
              onChange={(e) => {
                setFilters((f) => ({ ...f, search: e.target.value }))
                setPage(1)
              }}
              className="w-full rounded-md border border-gray-300 p-2 pl-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {isLoading ? (
          <SessionsTableSkeleton />
        ) : error ? (
          <SessionsErrorState onRetry={() => refetch()} />
        ) : sessions.length === 0 ? (
          <SessionsEmptyState />
        ) : (
          <>
            <div className="col-span-3 rounded-md bg-white shadow-md">
              <Table className="w-full text-left">
                <TableHeader>
                  <TableRow className="bg-gray-200">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={sessions.length > 0 && selectedIds.size === sessions.length}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead className="text-gray-700">Session preview</TableHead>
                    <TableHead className="text-gray-700">Extracted fields</TableHead>
                    <TableHead className="text-gray-700">Status</TableHead>
                    <TableHead className="text-gray-700">Timestamp</TableHead>
                    <TableHead className="text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((s) => (
                    <TableRow
                      key={s.id}
                      className={cn(
                        'transition-colors hover:bg-gray-100',
                        selectedIds.has(s.id) && 'bg-muted/50'
                      )}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(s.id)}
                          onCheckedChange={() => toggleSelect(s.id)}
                          aria-label={`Select session ${s.id}`}
                        />
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-gray-700">
                        {getSessionPreview(s.metadata)}
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate text-gray-700">
                        {getExtractedPreview(s.metadata)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'rounded px-2 py-0.5 text-xs font-medium',
                            s.status === 'completed' && 'bg-green-100 text-green-800',
                            s.status === 'active' && 'bg-blue-100 text-blue-800',
                            s.status === 'abandoned' && 'bg-gray-100 text-gray-700'
                          )}
                        >
                          {s.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {formatTimestamp(s.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link to={`/dashboard/sessions/${s.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              aria-label="View session"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label="Export"
                            onClick={() => doExport([s.id])}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label="Resend webhook"
                            onClick={() => {
                              bulkResend.mutate([s.id])
                              toast.success('Webhook resend initiated')
                            }}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="col-span-3 mt-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleExportSelected}
                  disabled={!hasSelection || bulkExport.isPending}
                  className="rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
                >
                  Export selected
                </Button>
                <Button
                  onClick={handleResendWebhooks}
                  disabled={!hasSelection || bulkResend.isPending}
                  variant="outline"
                  className="rounded-md px-4 py-2 transition-colors"
                >
                  Resend webhooks
                </Button>
                <Button
                  variant="outline"
                  disabled={!hasSelection}
                  className="rounded-md px-4 py-2 transition-colors"
                >
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Mark reviewed
                </Button>
                <Button
                  variant="outline"
                  disabled={!hasSelection}
                  className="rounded-md px-4 py-2 transition-colors"
                >
                  <Tag className="mr-2 h-4 w-4" />
                  Tag sessions
                </Button>
              </div>
            </div>

            <div className="col-span-3 mt-6 flex flex-wrap items-center justify-between gap-4">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                className="flex space-x-2"
              />
              <Button
                onClick={handleExportAll}
                disabled={sessions.length === 0}
                className="rounded-md bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600 disabled:opacity-50"
              >
                Export all
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
