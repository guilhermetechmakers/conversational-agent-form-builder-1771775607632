import { Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Shield,
  Activity,
  FileText,
  Settings,
  ChevronRight,
  UserCog,
  Ban,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  useAdminPlatformMetrics,
  useAdminUsers,
  useAdminFlaggedSessions,
  useAdminAuditLogs,
  useAdminSystemHealth,
} from '@/hooks/use-admin-dashboard'
import { cn } from '@/lib/utils'

const adminNavItems = [
  { to: '/dashboard/admin', icon: LayoutDashboard, label: 'Overview' },
  { to: '/dashboard/admin', icon: Users, label: 'Users' },
  { to: '/dashboard/admin', icon: Shield, label: 'Agent Oversight' },
  { to: '/dashboard/admin', icon: FileText, label: 'Audit Logs' },
  { to: '/dashboard/admin', icon: Activity, label: 'System Health' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

function formatTimestamp(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return d.toLocaleDateString()
}

function AdminSidebar() {
  return (
    <aside className="flex w-full flex-col bg-gray-800 text-white md:w-1/5">
      <div className="flex h-16 items-center justify-center bg-gray-900">
        <span className="font-semibold">Admin Console</span>
      </div>
      <nav className="flex-1">
        {adminNavItems.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className="block py-3 px-4 transition-colors hover:bg-gray-700"
          >
            <span className="flex items-center gap-2">
              <item.icon className="h-5 w-5" />
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}

function PlatformMetricsSkeleton() {
  return (
    <ul className="grid grid-cols-2 gap-4 md:grid-cols-5">
      {[1, 2, 3, 4, 5].map((i) => (
        <li key={i} className="flex flex-col items-center justify-center rounded-lg bg-white p-4 shadow">
          <Skeleton className="mb-2 h-8 w-16 rounded" />
          <Skeleton className="h-4 w-20 rounded" />
        </li>
      ))}
    </ul>
  )
}

function EmptyState({
  icon: Icon,
  heading,
  description,
  ctaLabel,
  onCta,
}: {
  icon: React.ElementType
  heading: string
  description: string
  ctaLabel: string
  onCta?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="mb-4 text-gray-400">
        <Icon className="h-12 w-12" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700">{heading}</h3>
      <p className="text-center text-sm text-gray-500">{description}</p>
      {onCta && (
        <Button
          className="mt-4 rounded bg-blue-600 px-4 py-2 transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={onCta}
        >
          {ctaLabel}
        </Button>
      )}
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center py-6">
      <p className="text-sm text-red-600">{message}</p>
      <Button
        className="mt-2 rounded bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={onRetry}
      >
        Retry
      </Button>
    </div>
  )
}

export function AdminDashboardPage() {
  const metrics = useAdminPlatformMetrics()
  const users = useAdminUsers()
  const flagged = useAdminFlaggedSessions()
  const auditLogs = useAdminAuditLogs()
  const systemHealth = useAdminSystemHealth()

  const handleRetry = () => {
    metrics.refetch()
    users.refetch()
    flagged.refetch()
    auditLogs.refetch()
    systemHealth.refetch()
  }

  const hasError =
    metrics.isError || users.isError || flagged.isError || auditLogs.isError || systemHealth.isError

  return (
    <div className="-m-6 flex min-h-screen flex-col bg-gray-50 md:flex-row">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
          <div className="flex space-x-4">
            <Button
              variant="outline"
              size="sm"
              className="focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={handleRetry}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {hasError && (
          <ErrorState
            message="Failed to load admin data. Please try again."
            onRetry={handleRetry}
          />
        )}

        {!hasError && (
          <>
            {/* Platform Metrics */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-800">
                  Platform Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {metrics.isLoading ? (
                  <PlatformMetricsSkeleton />
                ) : (
                  <ul className="grid grid-cols-2 gap-4 md:grid-cols-5">
                    {metrics.data.map((m) => (
                      <li
                        key={m.label}
                        className="flex flex-col items-center justify-center rounded-lg bg-white p-4 shadow"
                      >
                        <span className="text-2xl font-bold text-blue-600">{m.value}</span>
                        <span className="text-sm text-gray-600">{m.label}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* User Management */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-800">
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                {users.isLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-8 rounded bg-gray-300" />
                    <div className="h-8 rounded bg-gray-300" />
                    <div className="h-8 rounded bg-gray-300" />
                  </div>
                ) : users.data && users.data.length > 0 ? (
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="bg-gray-100">
                        <TableHead className="px-4 py-2">Email</TableHead>
                        <TableHead className="px-4 py-2">Role</TableHead>
                        <TableHead className="px-4 py-2">Status</TableHead>
                        <TableHead className="px-4 py-2">Last Active</TableHead>
                        <TableHead className="px-4 py-2">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.data.map((u) => (
                        <TableRow
                          key={u.id}
                          className="transition-colors hover:bg-gray-50"
                        >
                          <TableCell className="px-4 py-2">{u.email}</TableCell>
                          <TableCell className="px-4 py-2">
                            <Badge variant="secondary">{u.role}</Badge>
                          </TableCell>
                          <TableCell className="px-4 py-2">{u.status}</TableCell>
                          <TableCell className="px-4 py-2">
                            {formatTimestamp(u.lastActive)}
                          </TableCell>
                          <TableCell className="px-4 py-2">
                            <Button variant="ghost" size="sm" aria-label="Impersonate">
                              <UserCog className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <EmptyState
                    icon={Users}
                    heading="No users yet"
                    description="User management data will appear here."
                    ctaLabel="Refresh"
                    onCta={() => users.refetch()}
                  />
                )}
              </CardContent>
            </Card>

            {/* Agent Oversight */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-800">
                  Agent Oversight
                </CardTitle>
              </CardHeader>
              <CardContent>
                {flagged.isLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-16 rounded bg-gray-300" />
                    <div className="h-16 rounded bg-gray-300" />
                  </div>
                ) : flagged.data && flagged.data.length > 0 ? (
                  <ul className="space-y-2">
                    {flagged.data.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center justify-between rounded-lg bg-white p-4 shadow"
                      >
                        <div>
                          <p className="font-medium">{s.agentTitle}</p>
                          <p className="text-sm text-gray-600">{s.reason}</p>
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(s.reportedAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              s.status === 'pending' ? 'destructive' : 'secondary'
                            }
                          >
                            {s.status}
                          </Badge>
                          <Button variant="ghost" size="sm" aria-label="Review">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" aria-label="Disable agent">
                            <Ban className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState
                    icon={Shield}
                    heading="No flagged sessions"
                    description="Flagged content will appear here for review."
                    ctaLabel="Refresh"
                    onCta={() => flagged.refetch()}
                  />
                )}
              </CardContent>
            </Card>

            {/* Audit Logs */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-800">
                  Audit Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {auditLogs.isLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-16 rounded bg-gray-300" />
                    <div className="h-16 rounded bg-gray-300" />
                    <div className="h-16 rounded bg-gray-300" />
                  </div>
                ) : auditLogs.data && auditLogs.data.length > 0 ? (
                  <ul className="space-y-2">
                    {auditLogs.data.map((log) => (
                      <li
                        key={log.id}
                        className="rounded-lg bg-white p-4 shadow"
                      >
                        <p className="font-medium">{log.action}</p>
                        <p className="text-sm text-gray-600">
                          {log.userEmail} · {formatTimestamp(log.timestamp)}
                        </p>
                        {log.details && (
                          <p className="text-xs text-gray-500">{log.details}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState
                    icon={FileText}
                    heading="No audit logs"
                    description="Audit log entries will appear here."
                    ctaLabel="Refresh"
                    onCta={() => auditLogs.refetch()}
                  />
                )}
              </CardContent>
            </Card>

            {/* System Health */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-800">
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                {systemHealth.isLoading ? (
                  <div className="grid animate-pulse grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="h-24 rounded bg-gray-300" />
                    <div className="h-24 rounded bg-gray-300" />
                    <div className="h-24 rounded bg-gray-300" />
                  </div>
                ) : systemHealth.data && systemHealth.data.length > 0 ? (
                  <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {systemHealth.data.map((h) => (
                      <li
                        key={h.label}
                        className={cn(
                          'flex flex-col items-center justify-center rounded-lg bg-white p-4 shadow',
                          h.status === 'error' && 'border border-red-200',
                          h.status === 'warning' && 'border border-amber-200'
                        )}
                      >
                        <span
                          className={cn(
                            'text-2xl font-bold',
                            h.status === 'healthy' && 'text-blue-600',
                            h.status === 'warning' && 'text-amber-600',
                            h.status === 'error' && 'text-red-600'
                          )}
                        >
                          {h.value}
                        </span>
                        <span className="text-sm text-gray-600">{h.label}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState
                    icon={Activity}
                    heading="No health data"
                    description="System health metrics will appear here."
                    ctaLabel="Refresh"
                    onCta={() => systemHealth.refetch()}
                  />
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}

export default AdminDashboardPage
