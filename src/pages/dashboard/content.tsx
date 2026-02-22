import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  Upload,
  Link as LinkIcon,
  AlertCircle,
  Play,
  Trash2,
  RefreshCw,
  PlusCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
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
import { useContentSources, useAddContentSource, useRemoveContentSource } from '@/hooks/use-content'
import { useDashboardAgents } from '@/hooks/use-dashboard'
import { cn } from '@/lib/utils'
import type { ContentSource } from '@/types/content'

function ContentSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-12 w-full rounded-lg bg-muted animate-pulse" />
      <Skeleton className="h-64 w-full rounded-lg bg-muted animate-pulse" />
      <Skeleton className="h-12 w-full rounded-lg bg-muted animate-pulse" />
    </div>
  )
}

function ContentError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <h2 className="mt-4 text-lg font-semibold text-foreground">Failed to load documents</h2>
      <p className="mt-2 text-sm text-muted-foreground">Please try again.</p>
      <Button
        className="mt-4 bg-destructive text-destructive-foreground hover:bg-destructive/90"
        onClick={onRetry}
      >
        Retry
      </Button>
    </div>
  )
}

function ContentEmpty({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-8">
      <FileText className="h-12 w-12 text-muted-foreground" />
      <h2 className="mt-4 text-lg font-semibold text-foreground">No Documents Uploaded</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Upload or link documents to enhance your agent&apos;s knowledge.
      </p>
      <Button className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90" onClick={onUpload}>
        Upload Document
      </Button>
    </div>
  )
}

function StatusBadge({ status }: { status: ContentSource['status'] }) {
  const styles: Record<ContentSource['status'], string> = {
    pending: 'bg-muted text-muted-foreground',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    ready: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    error: 'bg-destructive/10 text-destructive',
  }
  return (
    <span className={cn('inline-flex rounded-md px-2 py-0.5 text-xs font-medium', styles[status])}>
      {status}
    </span>
  )
}

export function ContentPage() {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [pasteText, setPasteText] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [testQuery, setTestQuery] = useState('')
  const [parsingProgress, setParsingProgress] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: agents = [] } = useDashboardAgents()
  const { data: sources = [], isLoading, isError, refetch } = useContentSources(selectedAgentId)
  const addMutation = useAddContentSource()
  const removeMutation = useRemoveContentSource()

  const filteredSources = searchQuery.trim()
    ? sources.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.url?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      )
    : sources

  const handlePasteSubmit = () => {
    if (!pasteText.trim()) return
    addMutation.mutate({
      name: `Pasted text ${new Date().toLocaleTimeString()}`,
      type: 'text',
      agent_id: selectedAgentId,
    })
    setPasteText('')
    setParsingProgress(0)
    setTimeout(() => setParsingProgress(100), 1500)
  }

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return
    addMutation.mutate({
      name: urlInput.trim(),
      type: 'url',
      url: urlInput.trim(),
      agent_id: selectedAgentId,
    })
    setUrlInput('')
    setParsingProgress(0)
    setTimeout(() => setParsingProgress(100), 1200)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    addMutation.mutate({
      name: file.name,
      type: 'file',
      file_path: file.name,
      agent_id: selectedAgentId,
    })
    setParsingProgress(0)
    setTimeout(() => setParsingProgress(100), 2000)
    e.target.value = ''
  }

  const handleRemove = (id: string) => {
    removeMutation.mutate(id)
  }

  if (isError) {
    return (
      <div className="flex flex-col md:grid md:grid-cols-3 gap-4 p-6 bg-gray-50 dark:bg-gray-50 dark:bg-muted/30 min-h-[calc(100vh-8rem)]">
        <ContentError onRetry={() => refetch()} />
      </div>
    )
  }

  return (
    <div className="flex flex-col md:grid md:grid-cols-3 gap-4 p-6 bg-gray-50 dark:bg-muted/30 min-h-[calc(100vh-8rem)]">
      {/* Sidebar - Agent Builder */}
      <aside className="col-span-1 bg-card shadow-md p-4 rounded-lg border border-border">
        <Card className="border-0 shadow-none bg-transparent p-0">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base font-semibold">Agent Builder</CardTitle>
            <CardDescription className="text-sm">
              Select an agent to attach documents to
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="agent-select">Agent</Label>
              <Select
                value={selectedAgentId ?? 'all'}
                onValueChange={(v) => setSelectedAgentId(v === 'all' ? null : v)}
              >
                <SelectTrigger id="agent-select" className="focus:ring-2 focus:ring-primary">
                  <SelectValue placeholder="Select agent" />
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
            </div>
            <Link to="/dashboard/agents/new">
              <Button variant="outline" className="w-full hover:bg-muted">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Agent
              </Button>
            </Link>
          </CardContent>
        </Card>
      </aside>

      {/* Main Content */}
      <main className="col-span-2 flex flex-col gap-4">
        {isLoading ? (
          <ContentSkeleton />
        ) : (
          <>
            {/* Upload/Editor Section */}
            <Card id="upload-section" className="bg-card p-6 rounded-lg shadow-md">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-base">Upload or Add Content</CardTitle>
                <CardDescription>Paste text, upload files, or add URLs</CardDescription>
              </CardHeader>
              {sources.length === 0 && (
                <CardContent className="p-0 pb-4">
                  <ContentEmpty onUpload={() => fileInputRef.current?.click()} />
                </CardContent>
              )}
              <CardContent className="p-0 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="paste-text">Paste text</Label>
                  <Textarea
                    id="paste-text"
                    placeholder="Paste FAQ or document content here..."
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    className="min-h-[100px] focus:ring-2 focus:ring-primary"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePasteSubmit}
                    disabled={!pasteText.trim() || addMutation.isPending}
                    className="hover:bg-muted"
                  >
                    Add from paste
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url-input">Add from URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="url-input"
                      type="url"
                      placeholder="https://example.com/docs"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className="focus:ring-2 focus:ring-primary"
                    />
                    <Button
                      variant="outline"
                      onClick={handleUrlSubmit}
                      disabled={!urlInput.trim() || addMutation.isPending}
                      className="hover:bg-muted"
                    >
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Upload file</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.md,.html,.txt"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={addMutation.isPending}
                    className="hover:bg-muted"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    PDF / Markdown / HTML
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Document Parsing Section - only when we have sources */}
            {(parsingProgress !== null || sources.some((s) => s.status === 'processing')) && (
              <Card className="bg-card p-6 rounded-lg shadow-md transition-all duration-300">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-base">Document Parsing</CardTitle>
                  <CardDescription>Processing your documents</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-2">
                    <Progress value={parsingProgress ?? 50} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      {parsingProgress === 100 ? 'Complete' : 'Parsing and embedding...'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Source List Section */}
            <Card className="bg-card p-6 rounded-lg shadow-md">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-base">Sources</CardTitle>
                <CardDescription>Documents attached to your agent</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last updated</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSources.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          {searchQuery ? 'No matching sources' : 'No sources yet'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSources.map((s) => (
                      <TableRow key={s.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell>{s.type}</TableCell>
                        <TableCell>
                          <StatusBadge status={s.status} />
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(s.last_updated).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemove(s.id)}
                            disabled={removeMutation.isPending}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            aria-label="Remove"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Manual QA Section */}
            <Card className="bg-card p-6 rounded-lg shadow-md">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-base">Manual QA</CardTitle>
                <CardDescription>Search and test relevance of your sources</CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="search-sources">Search within sources</Label>
                  <Input
                    id="search-sources"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="test-query">Test sample query</Label>
                  <div className="flex gap-2">
                    <Input
                      id="test-query"
                      placeholder="Enter a test question..."
                      value={testQuery}
                      onChange={(e) => setTestQuery(e.target.value)}
                      className="focus:ring-2 focus:ring-primary"
                    />
                    <Button variant="outline" className="hover:bg-muted" disabled={!testQuery.trim()}>
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Version & Removal Controls Section */}
            <Card className="bg-card p-6 rounded-lg shadow-md">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-base">Version & Removal</CardTitle>
                <CardDescription>Update or detach sources from your agent</CardDescription>
              </CardHeader>
              <CardContent className="p-0 flex flex-wrap gap-2">
                <Button variant="outline" className="hover:bg-muted">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Update sources
                </Button>
                <p className="text-sm text-muted-foreground self-center">
                  Use the remove button in the table above to detach a source.
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}
