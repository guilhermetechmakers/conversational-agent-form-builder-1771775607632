import { useState } from 'react'
import { Users, UserPlus, MoreVertical, Crown, Eye, User } from 'lucide-react'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import type { TeamMember } from '@/types/user-profile'

type Role = 'admin' | 'member' | 'viewer'

interface TeamRolesProps {
  members?: TeamMember[]
  isLoading?: boolean
  onInvite?: (email: string, role: Role) => Promise<void>
  onUpdateRole?: (memberId: string, role: Role) => Promise<void>
  onRemove?: (memberId: string) => Promise<void>
}

const ROLE_OPTIONS: { value: Role; label: string; icon: typeof User }[] = [
  { value: 'admin', label: 'Admin', icon: Crown },
  { value: 'member', label: 'Member', icon: User },
  { value: 'viewer', label: 'Viewer', icon: Eye },
]

const DEFAULT_MEMBERS: TeamMember[] = [
  {
    id: '1',
    email: 'you@example.com',
    name: 'You',
    role: 'admin',
    status: 'active',
    invited_at: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'teammate@example.com',
    name: 'Jane Doe',
    role: 'member',
    status: 'active',
    invited_at: new Date().toISOString(),
  },
]

export function TeamRoles({
  members = DEFAULT_MEMBERS,
  isLoading,
  onInvite,
  onUpdateRole,
  onRemove,
}: TeamRolesProps) {
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<Role>('member')
  const [isInviteOpen, setIsInviteOpen] = useState(false)

  const teamMembers = members.length > 0 ? members : DEFAULT_MEMBERS

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return
    await onInvite?.(inviteEmail, inviteRole)
    setInviteEmail('')
    setInviteRole('member')
    setIsInviteOpen(false)
  }

  const getRoleIcon = (role: Role) => ROLE_OPTIONS.find((r) => r.value === role)?.icon ?? User

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-10 w-32" />
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="transition-all duration-300 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team & Roles
        </CardTitle>
        <CardDescription>
          Invite users and assign roles: Admin, Member, or Viewer
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4" />
              Invite user
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite team member</DialogTitle>
              <DialogDescription>
                Send an invitation to join your team. They will receive an email with a link to
                accept.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email address</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as Role)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleInvite} disabled={!inviteEmail.trim()}>
                Send invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {teamMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
            <Users className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 font-semibold">No team members yet</h3>
            <p className="mb-4 max-w-sm text-center text-sm text-muted-foreground">
              Invite users to collaborate. Assign Admin, Member, or Viewer roles.
            </p>
            <Button onClick={() => setIsInviteOpen(true)}>
              <UserPlus className="h-4 w-4" />
              Invite your first team member
            </Button>
          </div>
        ) : (
          <>
            {/* Mobile: cards */}
            <div className="mt-4 space-y-4 md:hidden">
              {teamMembers.map((member) => {
                const RoleIcon = getRoleIcon(member.role)
                return (
                  <div
                    key={member.id}
                    className="flex flex-col gap-3 rounded-lg border border-border p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                          <RoleIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{member.name ?? member.email}</p>
                            <Badge variant={member.status === 'pending' ? 'secondary' : 'default'}>
                              {member.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="More options">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {ROLE_OPTIONS.filter((r) => r.value !== member.role).map((opt) => (
                            <DropdownMenuItem
                              key={opt.value}
                              onClick={() => onUpdateRole?.(member.id, opt.value)}
                            >
                              Change to {opt.label}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => onRemove?.(member.id)}
                          >
                            Remove from team
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Badge variant="outline" className="w-fit capitalize">
                      {member.role}
                    </Badge>
                  </div>
                )
              })}
            </div>
            {/* Desktop: table */}
            <div className="mt-4 hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => {
                    const RoleIcon = getRoleIcon(member.role)
                    return (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                              <RoleIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <span className="font-medium">{member.name ?? member.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{member.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={member.status === 'pending' ? 'secondary' : 'default'}>
                            {member.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" aria-label="More options">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {ROLE_OPTIONS.filter((r) => r.value !== member.role).map((opt) => (
                                <DropdownMenuItem
                                  key={opt.value}
                                  onClick={() => onUpdateRole?.(member.id, opt.value)}
                                >
                                  Change to {opt.label}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => onRemove?.(member.id)}
                              >
                                Remove from team
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
