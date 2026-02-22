import { useState, useCallback, useMemo, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  PlusCircle,
  GripVertical,
  Trash2,
  Pencil,
  Upload,
  Link as LinkIcon,
  Play,
  Send,
  History,
  Bot,
  Settings2,
  Palette,
  FileText,
  Zap,
  Eye,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { FieldEditorDialog } from '@/components/agent-builder/FieldEditorDialog'
import { useAgent, useCreateAgent, useUpdateAgent } from '@/hooks/use-agent-builder'
import type {
  AgentField,
  AgentConfig,
  PersonaConfig,
  AppearanceConfig,
  LLMConfig,
  ToneSetting,
} from '@/types/agent-builder'
import { cn } from '@/lib/utils'

const SIDEBAR_SECTIONS = [
  { id: 'metadata', label: 'Agent Metadata', icon: Bot },
  { id: 'fields', label: 'Fields Editor', icon: FileText },
  { id: 'flow', label: 'Flow Configuration', icon: GripVertical },
  { id: 'persona', label: 'Persona & Tone', icon: Settings2 },
  { id: 'context', label: 'Context Attachments', icon: FileText },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'llm', label: 'LLM Settings', icon: Zap },
  { id: 'preview', label: 'Preview Mode', icon: Eye },
  { id: 'publish', label: 'Publish Controls', icon: Send },
  { id: 'versioning', label: 'Save & Versioning', icon: History },
] as const

const TONE_OPTIONS: { value: ToneSetting; label: string }[] = [
  { value: 'friendly', label: 'Friendly' },
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'formal', label: 'Formal' },
  { value: 'empathetic', label: 'Empathetic' },
]

const LLM_MODELS = [
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet' },
]

const defaultConfig: AgentConfig = {
  fields: [],
  fieldOrder: [],
  persona: { name: '', systemInstructions: '', tone: 'friendly' },
  appearance: { primaryColor: '#0B5FFF', layout: 'full' },
  llm: { model: 'gpt-4o-mini', temperature: 0.7, maxTokens: 1024 },
  contextAttachments: [],
}

export function AgentBuilderPage() {
  const { agentId } = useParams()
  const navigate = useNavigate()
  const isNew = !agentId

  const { data: agent, isLoading, isError, refetch } = useAgent(agentId)
  const createMutation = useCreateAgent()
  const updateMutation = useUpdateAgent(agentId)

  const [activeSection, setActiveSection] = useState<string>('metadata')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [slug, setSlug] = useState('')
  const [status, setStatus] = useState('draft')
  const [config, setConfig] = useState<AgentConfig>(defaultConfig)
  const [fieldDialogOpen, setFieldDialogOpen] = useState(false)
  const [editingField, setEditingField] = useState<AgentField | null>(null)
  const [contextUrl, setContextUrl] = useState('')

  const mergedConfig = useMemo(
    () => ({ ...defaultConfig, ...agent?.config } as AgentConfig),
    [agent?.config]
  )

  const fields = config.fields ?? mergedConfig.fields ?? []
  const fieldOrder = config.fieldOrder ?? mergedConfig.fieldOrder ?? fields.map((f) => f.id)
  const orderedFields = useMemo(() => {
    const map = new Map(fields.map((f) => [f.id, f]))
    return fieldOrder.map((id) => map.get(id)).filter(Boolean) as AgentField[]
  }, [fields, fieldOrder])

  const persona = config.persona ?? mergedConfig.persona ?? defaultConfig.persona!
  const appearance = config.appearance ?? mergedConfig.appearance ?? defaultConfig.appearance!
  const llm = config.llm ?? mergedConfig.llm ?? defaultConfig.llm!

  const updateConfig = useCallback(
    (patch: Partial<AgentConfig>) => {
      setConfig((c) => ({ ...c, ...patch }))
    },
    []
  )

  const updatePersona = useCallback(
    (patch: Partial<PersonaConfig>) => {
      updateConfig({ persona: { ...persona, ...patch } })
    },
    [persona, updateConfig]
  )

  const updateAppearance = useCallback(
    (patch: Partial<AppearanceConfig>) => {
      updateConfig({ appearance: { ...appearance, ...patch } })
    },
    [appearance, updateConfig]
  )

  const updateLLM = useCallback(
    (patch: Partial<LLMConfig>) => {
      updateConfig({ llm: { ...llm, ...patch } })
    },
    [llm, updateConfig]
  )

  const handleAddField = () => {
    setEditingField(null)
    setFieldDialogOpen(true)
  }

  const handleEditField = (field: AgentField) => {
    setEditingField(field)
    setFieldDialogOpen(true)
  }

  const handleSaveField = (field: AgentField) => {
    const existing = fields.find((f) => f.id === field.id)
    let nextFields: AgentField[]
    let nextOrder: string[]

    if (existing) {
      nextFields = fields.map((f) => (f.id === field.id ? field : f))
      nextOrder = fieldOrder
    } else {
      nextFields = [...fields, field]
      nextOrder = [...fieldOrder, field.id]
    }

    updateConfig({ fields: nextFields, fieldOrder: nextOrder })
  }

  const handleRemoveField = (id: string) => {
    const nextFields = fields.filter((f) => f.id !== id)
    const nextOrder = fieldOrder.filter((o) => o !== id)
    updateConfig({ fields: nextFields, fieldOrder: nextOrder })
  }

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    const f = orderedFields[index]
    if (!f) return
    const newOrder = [...fieldOrder]
    const i = newOrder.indexOf(f.id)
    if (i < 0) return
    const swap = direction === 'up' ? i - 1 : i + 1
    if (swap < 0 || swap >= newOrder.length) return
    ;[newOrder[i], newOrder[swap]] = [newOrder[swap], newOrder[i]]
    updateConfig({ fieldOrder: newOrder })
  }

  const handleAddContextUrl = () => {
    if (!contextUrl.trim()) return
    const attachment = {
      id: crypto.randomUUID(),
      type: 'url' as const,
      name: contextUrl.trim(),
      url: contextUrl.trim(),
      addedAt: new Date().toISOString(),
    }
    const attachments = config.contextAttachments ?? mergedConfig.contextAttachments ?? []
    updateConfig({ contextAttachments: [...attachments, attachment] })
    setContextUrl('')
  }

  const handleRemoveContext = (id: string) => {
    const attachments = (config.contextAttachments ?? []).filter((a) => a.id !== id)
    updateConfig({ contextAttachments: attachments })
  }

  const handleSave = async (): Promise<{ id: string } | void> => {
    const payload = {
      title: title || 'Untitled Agent',
      description: description || undefined,
      slug: slug || undefined,
      status,
      config,
    }

    if (isNew) {
      const result = await createMutation.mutateAsync(payload)
      if (result?.id) {
        navigate(`/dashboard/agents/${result.id}`)
        return { id: result.id }
      }
    } else {
      await updateMutation.mutateAsync(payload)
      if (agent?.id) return { id: agent.id }
    }
  }

  const handlePublish = async () => {
    const result = await handleSave()
    const id = result?.id ?? agent?.id
    if (id) {
      await updateMutation.mutateAsync({ status: 'active', agentId: id })
    }
  }

  const handlePreview = () => {
    if (agent?.id) {
      window.open(`/agent-public-chat-visitor-view/${agent.id}`, '_blank')
    }
  }

  // Sync from server when editing
  useEffect(() => {
    if (agent) {
      setTitle(agent.title)
      setDescription(agent.description ?? '')
      setSlug(agent.slug ?? '')
      setStatus(agent.status)
      if (agent.config) setConfig({ ...defaultConfig, ...agent.config } as AgentConfig)
    } else if (isNew) {
      setTitle('')
      setDescription('')
      setSlug('')
      setStatus('draft')
      setConfig(defaultConfig)
    }
  }, [agent, isNew])

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg bg-red-100 p-6 text-red-700">
        <p className="mb-4">Failed to load agent. Please try again.</p>
        <Button
          className="bg-red-500 text-white transition-colors hover:bg-red-600"
          onClick={() => refetch()}
        >
          Retry
        </Button>
      </div>
    )
  }

  if (!isNew && isLoading) {
    return (
      <div className="flex flex-col md:flex-row h-screen bg-gray-50">
        <div className="w-full md:w-1/4 bg-white shadow-lg p-4">
          <Skeleton className="h-10 w-full mb-2" />
          <Skeleton className="h-10 w-full mb-2" />
          <Skeleton className="h-10 w-full mb-2" />
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <Skeleton className="h-64 w-full mb-6" />
          <Skeleton className="h-48 w-full mb-6" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-8rem)] bg-gray-50">
      {/* Sidebar */}
      <aside className="w-full md:w-1/4 bg-white shadow-lg p-4 shrink-0">
        <div className="mb-4 flex items-center gap-2">
          <Link to="/dashboard/agents">
            <Button variant="ghost" size="icon" aria-label="Back to agents">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="font-semibold text-gray-900">
            {isNew ? 'Create Agent' : 'Edit Agent'}
          </h2>
        </div>
        <nav className="space-y-2">
          {SIDEBAR_SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveSection(s.id)}
              className={cn(
                'flex w-full items-center gap-2 rounded-md p-2 text-left text-sm transition-colors',
                activeSection === s.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-gray-100 text-gray-900'
              )}
            >
              <s.icon className="h-4 w-4 shrink-0" />
              <span>{s.label}</span>
              <ChevronRight className="ml-auto h-4 w-4 opacity-70" />
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {/* Agent Metadata */}
        {activeSection === 'metadata' && (
          <Card className="mb-6 bg-white p-4 shadow-md">
            <CardHeader>
              <CardTitle>Agent Metadata</CardTitle>
              <CardDescription>Basic agent information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Lead Capture Agent"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Brief description of this agent"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  placeholder="e.g. lead-capture"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status" className="focus:ring-2 focus:ring-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fields Editor */}
        {activeSection === 'fields' && (
          <Card className="mb-6 bg-white p-4 shadow-md">
            <CardHeader>
              <CardTitle>Fields Editor</CardTitle>
              <CardDescription>Define the structured data to collect</CardDescription>
            </CardHeader>
            <CardContent>
              {fields.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
                  <PlusCircle className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 font-semibold">No fields yet</h3>
                  <p className="mb-4 text-center text-sm text-muted-foreground">
                    Add fields (text, email, number, select, etc.) to collect structured data.
                  </p>
                  <Button
                    className="bg-blue-500 text-white transition-colors hover:bg-blue-600"
                    onClick={handleAddField}
                  >
                    Add field
                  </Button>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Key</TableHead>
                        <TableHead>Label</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Required</TableHead>
                        <TableHead className="w-24">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((f) => (
                        <TableRow key={f.id} className="transition-colors hover:bg-gray-100">
                          <TableCell className="font-medium">{f.key}</TableCell>
                          <TableCell>{f.label}</TableCell>
                          <TableCell>{f.type}</TableCell>
                          <TableCell>{f.validation?.required ? 'Yes' : 'No'}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditField(f)}
                                aria-label="Edit field"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveField(f.id)}
                                aria-label="Remove field"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Button
                    className="mt-4 bg-blue-500 text-white transition-colors hover:bg-blue-600"
                    onClick={handleAddField}
                  >
                    Add field
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Flow Configuration */}
        {activeSection === 'flow' && (
          <Card className="mb-6 bg-white p-4 shadow-md">
            <CardHeader>
              <CardTitle>Flow Configuration</CardTitle>
              <CardDescription>Reorder fields for conversation flow</CardDescription>
            </CardHeader>
            <CardContent>
              {orderedFields.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
                  <GripVertical className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Add fields in the Fields Editor first, then reorder them here.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {orderedFields.map((f, i) => (
                    <li
                      key={f.id}
                      className="flex items-center gap-2 rounded-md border border-border bg-muted/30 p-2 transition-colors hover:bg-muted/50"
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 font-medium">{f.label}</span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMoveField(i, 'up')}
                          disabled={i === 0}
                          aria-label="Move up"
                        >
                          ↑
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMoveField(i, 'down')}
                          disabled={i === orderedFields.length - 1}
                          aria-label="Move down"
                        >
                          ↓
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}

        {/* Persona & Tone */}
        {activeSection === 'persona' && (
          <Card className="mb-6 bg-white p-4 shadow-md">
            <CardHeader>
              <CardTitle>Persona & Tone</CardTitle>
              <CardDescription>System prompt and tone for the assistant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={persona?.avatarUrl} alt={persona?.name} />
                  <AvatarFallback>
                    <Bot className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="persona-name">Persona name</Label>
                  <Input
                    id="persona-name"
                    placeholder="e.g. Support Bot"
                    value={persona?.name ?? ''}
                    onChange={(e) => updatePersona({ name: e.target.value })}
                    className="focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="system-instructions">System instructions</Label>
                <Textarea
                  id="system-instructions"
                  placeholder="You are a friendly assistant that..."
                  value={persona?.systemInstructions ?? ''}
                  onChange={(e) => updatePersona({ systemInstructions: e.target.value })}
                  className="min-h-[120px] focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tone">Tone</Label>
                <Select
                  value={persona?.tone ?? 'friendly'}
                  onValueChange={(v) => updatePersona({ tone: v as ToneSetting })}
                >
                  <SelectTrigger id="tone" className="focus:ring-2 focus:ring-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TONE_OPTIONS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Context Attachments */}
        {activeSection === 'context' && (
          <Card className="mb-6 bg-white p-4 shadow-md">
            <CardHeader>
              <CardTitle>Context Attachments</CardTitle>
              <CardDescription>Upload or link documents to augment agent answers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Paste URL to fetch context"
                  value={contextUrl}
                  onChange={(e) => setContextUrl(e.target.value)}
                  className="flex-1 focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  variant="outline"
                  onClick={handleAddContextUrl}
                  disabled={!contextUrl.trim()}
                >
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Add URL
                </Button>
              </div>
              <div className="rounded-lg border border-dashed border-border p-4">
                <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drag and drop files or click to upload (PDF, Markdown, HTML)
                </p>
              </div>
              {(config.contextAttachments ?? []).length > 0 && (
                <ul className="space-y-2">
                  {(config.contextAttachments ?? []).map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center justify-between rounded-md border border-border p-2"
                    >
                      <span className="truncate text-sm">{a.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveContext(a.id)}
                        className="text-destructive"
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}

        {/* Appearance Settings */}
        {activeSection === 'appearance' && (
          <Card className="mb-6 bg-white p-4 shadow-md">
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Theme colors and layout</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primary-color">Primary color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="primary-color"
                    value={appearance?.primaryColor ?? '#0B5FFF'}
                    onChange={(e) => updateAppearance({ primaryColor: e.target.value })}
                    className="h-10 w-16 cursor-pointer rounded border border-input"
                  />
                  <Input
                    value={appearance?.primaryColor ?? '#0B5FFF'}
                    onChange={(e) => updateAppearance({ primaryColor: e.target.value })}
                    className="flex-1 font-mono text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="layout">Layout</Label>
                  <p className="text-sm text-muted-foreground">Compact or full chat layout</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Compact</span>
                  <Switch
                    id="layout"
                    checked={appearance?.layout === 'full'}
                    onCheckedChange={(checked) =>
                      updateAppearance({ layout: checked ? 'full' : 'compact' })
                    }
                  />
                  <span className="text-sm text-muted-foreground">Full</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* LLM Settings */}
        {activeSection === 'llm' && (
          <Card className="mb-6 bg-white p-4 shadow-md">
            <CardHeader>
              <CardTitle>LLM Settings</CardTitle>
              <CardDescription>Model selection and parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Select
                  value={llm?.model ?? 'gpt-4o-mini'}
                  onValueChange={(v) => updateLLM({ model: v })}
                >
                  <SelectTrigger id="model" className="focus:ring-2 focus:ring-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LLM_MODELS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Temperature: {llm?.temperature ?? 0.7}</Label>
                <Slider
                  min={0}
                  max={1}
                  step={0.1}
                  value={llm?.temperature ?? 0.7}
                  onValueChange={(v) => updateLLM({ temperature: v })}
                />
              </div>
              <div className="space-y-2">
                <Label>Max tokens: {llm?.maxTokens ?? 1024}</Label>
                <Slider
                  min={256}
                  max={4096}
                  step={256}
                  value={llm?.maxTokens ?? 1024}
                  onValueChange={(v) => updateLLM({ maxTokens: v })}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preview Mode */}
        {activeSection === 'preview' && (
          <Card className="mb-6 bg-white p-4 shadow-md">
            <CardHeader>
              <CardTitle>Preview Mode</CardTitle>
              <CardDescription>Test your agent in a simulated session</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="bg-green-500 text-white transition-colors hover:bg-green-600"
                onClick={handlePreview}
                disabled={!agent?.id && !title}
              >
                <Play className="mr-2 h-4 w-4" />
                Start simulation
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Publish Controls */}
        {activeSection === 'publish' && (
          <Card className="mb-6 bg-white p-4 shadow-md">
            <CardHeader>
              <CardTitle>Publish Controls</CardTitle>
              <CardDescription>Make your agent live or unpublish</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="bg-purple-500 text-white transition-colors hover:bg-purple-600"
                onClick={handlePublish}
              >
                <Send className="mr-2 h-4 w-4" />
                {status === 'active' || status === 'published' ? 'Update' : 'Publish'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Save & Versioning */}
        {activeSection === 'versioning' && (
          <Card className="mb-6 bg-white p-4 shadow-md">
            <CardHeader>
              <CardTitle>Save & Versioning</CardTitle>
              <CardDescription>Save changes and view version history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="bg-gray-500 text-white transition-colors hover:bg-gray-600"
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
              <div>
                <Label>Version history</Label>
                <p className="mt-2 text-sm text-muted-foreground">
                  Version history will appear here after saving.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <FieldEditorDialog
        open={fieldDialogOpen}
        onOpenChange={setFieldDialogOpen}
        field={editingField}
        onSave={handleSaveField}
      />
    </div>
  )
}
