import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Bot,
  MessageSquare,
  Settings,
  Webhook,
  FileText,
  User,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/agents', icon: Bot, label: 'Agents' },
  { to: '/dashboard/sessions', icon: MessageSquare, label: 'Sessions' },
  { to: '/dashboard/integrations', icon: Webhook, label: 'Integrations' },
  { to: '/dashboard/content', icon: FileText, label: 'Content' },
  { to: '/dashboard/admin', icon: Shield, label: 'Admin' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

interface AppSidebarProps {
  mobileOpen?: boolean
  setMobileOpen?: (open: boolean) => void
}

export function AppSidebar({ mobileOpen = false, setMobileOpen = () => {} }: AppSidebarProps) {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const SidebarContent = () => (
    <>
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!collapsed && (
          <Link to="/dashboard" className="font-semibold text-lg text-foreground">
            Agent Builder
          </Link>
        )}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden md:flex"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen?.(false)}
            aria-label="Close menu"
            className="md:hidden"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen?.(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-border p-2">
        <Link
          to="/dashboard/user-profile"
          onClick={() => setMobileOpen(false)}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            location.pathname === '/dashboard/user-profile'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <User className="h-5 w-5 shrink-0" />
          <span>Account</span>
        </Link>
      </div>
    </>
  )

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          'flex flex-col border-r border-border bg-card transition-all duration-300',
          'fixed left-0 top-0 z-40 h-full md:relative',
          collapsed ? 'w-[72px]' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <SidebarContent />
      </aside>
    </>
  )
}
