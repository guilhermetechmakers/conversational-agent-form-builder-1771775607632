import { useState } from 'react'
import { Key, Plus, Trash2, Copy, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import type { ApiKey } from '@/types/user-profile'

interface APIKeysManagementProps {
  apiKeys?: ApiKey[]
  isLoading?: boolean
  onCreateKey?: (name: string, scopes: string[]) => Promise<{ key: string } | undefined>
  onRevokeKey?: (keyId: string) => Promise<void>
}

const SCOPE_OPTIONS = [
  { id: 'read', label: 'Read' },
  { id: 'write', label: 'Write' },
  { id: 'admin', label: 'Admin' },
]

const DEFAULT_KEYS: ApiKey[] = [
  {
    id: '1',
    name: 'Production API',
    prefix: 'sk_live_••••••••••••',
    scopes: ['read', 'write'],
    last_used_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Development',
    prefix: 'sk_test_••••••••••••',
    scopes: ['read'],
    created_at: new Date().toISOString(),
  },
]

export function APIKeysManagement({
  apiKeys = DEFAULT_KEYS,
  isLoading,
  onCreateKey,
  onRevokeKey,
}: APIKeysManagementProps) {
  const [newKeyName, setNewKeyName] = useState('')
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['read'])
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [revokeKeyId, setRevokeKeyId] = useState<string | null>(null)

  const keys = apiKeys.length > 0 ? apiKeys : DEFAULT_KEYS

  const toggleScope = (scopeId: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scopeId) ? prev.filter((s) => s !== scopeId) : [...prev, scopeId]
    )
  }

  const handleCreate = async () => {
    if (!newKeyName.trim()) return
    const result = await onCreateKey?.(newKeyName, selectedScopes)
    if (result?.key) {
      setCreatedKey(result.key)
    } else {
      setIsCreateOpen(false)
    }
  }

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    toast.success('API key copied to clipboard')
  }

  const handleRevoke = async () => {
    if (revokeKeyId) {
      await onRevokeKey?.(revokeKeyId)
      setRevokeKeyId(null)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-10 w-36" />
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="transition-all duration-300 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Keys
        </CardTitle>
        <CardDescription>
          Create and manage API keys for programmatic access. Keys include scopes and usage statistics.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Create API key
            </Button>
          </DialogTrigger>
          <DialogContent showClose={!createdKey}>
            <DialogHeader>
              <DialogTitle>{createdKey ? 'API key created' : 'Create new API key'}</DialogTitle>
              <DialogDescription>
                {createdKey
                  ? 'Copy your key now. You won\'t be able to see it again.'
                  : 'Give your key a name and select the scopes it should have.'}
              </DialogDescription>
            </DialogHeader>
            {createdKey ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input value={createdKey} readOnly className="font-mono text-sm" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyKey(createdKey)}
                    aria-label="Copy key"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    setCreatedKey(null)
                    setNewKeyName('')
                    setSelectedScopes(['read'])
                    setIsCreateOpen(false)
                  }}
                >
                  Done
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="key-name">Key name</Label>
                  <Input
                    id="key-name"
                    placeholder="e.g. Production API"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Scopes</Label>
                  <div className="flex flex-wrap gap-2">
                    {SCOPE_OPTIONS.map((scope) => (
                      <Badge
                        key={scope.id}
                        variant={selectedScopes.includes(scope.id) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleScope(scope.id)}
                      >
                        {scope.label}
                      </Badge>
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={!newKeyName.trim()}>
                    Create key
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {keys.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
            <Key className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 font-semibold">No API keys yet</h3>
            <p className="mb-4 max-w-sm text-center text-sm text-muted-foreground">
              Create an API key to access the API programmatically with scopes and usage tracking.
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Create your first key
            </Button>
          </div>
        ) : (
          <>
            {/* Mobile: cards */}
            <div className="mt-4 space-y-4 md:hidden">
              {keys.map((apiKey) => (
                <div
                  key={apiKey.id}
                  className="flex flex-col gap-3 rounded-lg border border-border p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{apiKey.name}</p>
                      <p className="mt-1 font-mono text-sm text-muted-foreground">
                        {apiKey.prefix}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                      onClick={() => setRevokeKeyId(apiKey.id)}
                      aria-label="Revoke key"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {apiKey.scopes.map((scope) => (
                      <Badge key={scope} variant="secondary" className="text-xs">
                        {scope}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BarChart3 className="h-4 w-4" />
                    {apiKey.last_used_at
                      ? `Last used ${new Date(apiKey.last_used_at).toLocaleDateString()}`
                      : 'Never used'}
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop: table */}
            <div className="mt-4 hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Scopes</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keys.map((apiKey) => (
                    <TableRow key={apiKey.id}>
                      <TableCell className="font-medium">{apiKey.name}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {apiKey.prefix}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {apiKey.scopes.map((scope) => (
                            <Badge key={scope} variant="secondary" className="text-xs">
                              {scope}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          {apiKey.last_used_at
                            ? `Last used ${new Date(apiKey.last_used_at).toLocaleDateString()}`
                            : 'Never used'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setRevokeKeyId(apiKey.id)}
                          aria-label="Revoke key"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        <AlertDialog open={!!revokeKeyId} onOpenChange={() => setRevokeKeyId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Revoke API key?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Any applications using this key will stop working
                immediately.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRevoke}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                Revoke key
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
