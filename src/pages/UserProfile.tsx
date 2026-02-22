import { useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Settings,
  User,
  Shield,
  CreditCard,
  Key,
  Users,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProfileInfo } from '@/components/user-profile/ProfileInfo'
import { PasswordSecurity } from '@/components/user-profile/PasswordSecurity'
import { BillingSection } from '@/components/user-profile/BillingSection'
import { APIKeysManagement } from '@/components/user-profile/APIKeysManagement'
import { TeamRoles } from '@/components/user-profile/TeamRoles'
import { DeleteAccount } from '@/components/user-profile/DeleteAccount'
import {
  useUserProfile,
  useUpdateProfile,
  useApiKeys,
  useCreateApiKey,
  useRevokeApiKey,
  useTeamMembers,
  useActiveSessions,
  useBillingPlan,
  useInviteTeamMember,
  useUpdateTeamRole,
  useRemoveTeamMember,
  useChangePassword,
  use2FAToggle,
  useRevokeSession,
} from '@/hooks/use-user-profile'
import { cn } from '@/lib/utils'

const FALLBACK_SESSIONS = [
  {
    id: '1',
    device: 'Chrome on macOS',
    location: 'New York, US',
    last_active: new Date().toISOString(),
    current: true,
  },
]

const SECTIONS: Array<{
  id: string
  label: string
  icon: typeof User
  danger?: boolean
}> = [
  { id: 'profile-info', label: 'Profile Info', icon: User },
  { id: 'password-security', label: 'Password & Security', icon: Shield },
  { id: 'billing', label: 'Billing Section', icon: CreditCard },
  { id: 'api-keys', label: 'API Keys Management', icon: Key },
  { id: 'team-roles', label: 'Team & Roles', icon: Users },
  { id: 'delete-account', label: 'Delete Account', icon: AlertTriangle, danger: true },
]

export function UserProfilePage() {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState<string>(SECTIONS[0].id)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const { data: profile, isLoading: profileLoading, error: profileError } = useUserProfile()
  const { data: apiKeys, isLoading: apiKeysLoading } = useApiKeys()
  const { data: teamMembers, isLoading: teamLoading } = useTeamMembers()
  const { data: sessions } = useActiveSessions()
  const { data: billing } = useBillingPlan()

  const updateProfile = useUpdateProfile()
  const createApiKey = useCreateApiKey()
  const revokeApiKey = useRevokeApiKey()
  const inviteTeamMember = useInviteTeamMember()
  const updateTeamRole = useUpdateTeamRole()
  const removeTeamMember = useRemoveTeamMember()
  const changePassword = useChangePassword()
  const toggle2FA = use2FAToggle()
  const revokeSession = useRevokeSession()

  const displayProfile = profile
  const displaySessions = (sessions?.length ?? 0) > 0 ? sessions! : FALLBACK_SESSIONS

  const scrollToSection = useCallback((sectionId: string) => {
    setActiveSection(sectionId)
    const el = sectionRefs.current[sectionId]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  const setSectionRef = useCallback((id: string) => (el: HTMLDivElement | null) => {
    sectionRefs.current[id] = el
  }, [])

  const handleSaveProfile = async (data: {
    name: string
    email: string
    timezone: string
    language: string
  }) => {
    try {
      await updateProfile.mutateAsync(data)
      toast.success('Profile updated successfully')
    } catch {
      toast.error('Failed to update profile')
    }
  }

  const handleAvatarUpload = async (file: File) => {
    try {
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        updateProfile.mutate({ avatar_url: dataUrl })
        toast.success('Avatar updated')
      }
      reader.readAsDataURL(file)
    } catch {
      toast.error('Failed to upload avatar')
    }
  }

  const handleCreateApiKey = async (name: string, scopes: string[]) => {
    try {
      const result = await createApiKey.mutateAsync({ name, scopes })
      toast.success('API key created')
      return result
    } catch {
      toast.error('Failed to create API key')
      return undefined
    }
  }

  const handleRevokeApiKey = async (keyId: string) => {
    try {
      await revokeApiKey.mutateAsync(keyId)
      toast.success('API key revoked')
    } catch {
      toast.error('Failed to revoke API key')
    }
  }

  const handleInviteTeamMember = async (
    email: string,
    role: 'admin' | 'member' | 'viewer'
  ) => {
    try {
      await inviteTeamMember.mutateAsync({ email, role })
      toast.success('Invitation sent')
    } catch {
      toast.error('Failed to send invitation')
    }
  }

  const handleUpdateTeamRole = async (
    memberId: string,
    role: 'admin' | 'member' | 'viewer'
  ) => {
    try {
      await updateTeamRole.mutateAsync({ memberId, role })
      toast.success('Role updated')
    } catch {
      toast.error('Failed to update role')
    }
  }

  const handleRemoveTeamMember = async (memberId: string) => {
    try {
      await removeTeamMember.mutateAsync(memberId)
      toast.success('Team member removed')
    } catch {
      toast.error('Failed to remove team member')
    }
  }

  const handleChangePassword = async (data: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }) => {
    try {
      await changePassword.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      toast.success('Password updated')
    } catch {
      toast.error('Failed to update password')
    }
  }

  const handle2FAToggle = async (enabled: boolean) => {
    try {
      await toggle2FA.mutateAsync(enabled)
      toast.success(
        enabled ? 'Two-factor authentication enabled' : 'Two-factor authentication disabled'
      )
    } catch {
      toast.error('Failed to update 2FA settings')
    }
  }

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSession.mutateAsync(sessionId)
      toast.success('Session revoked')
    } catch {
      toast.error('Failed to revoke session')
    }
  }

  const handleUpgradePlan = (_planId: string) => {
    navigate('/pricing')
    toast.info('Redirecting to pricing...')
  }

  if (profileError && !profile) {
    return (
      <div className="w-full">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Account settings</h1>
            <p className="text-muted-foreground">Manage your profile, billing, and team</p>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
            <Settings className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 font-semibold">Unable to load profile</h3>
            <p className="mb-4 max-w-sm text-center text-sm text-muted-foreground">
              There was an error loading your account settings. Please try again.
            </p>
            <div className="bg-red-100 p-4 rounded text-red-700 mb-4">
              {profileError instanceof Error ? profileError.message : 'An error occurred'}
            </div>
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Account settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your profile, billing, API keys, and team members
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Sidebar */}
        <aside className="col-span-1 rounded-lg bg-muted/50 p-4 shadow-md">
          <ul className="space-y-4">
            {SECTIONS.map(({ id, label, icon: Icon, danger }) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => scrollToSection(id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors duration-200',
                    activeSection === id
                      ? danger
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-primary text-primary-foreground'
                      : danger
                        ? 'text-destructive hover:bg-destructive/5 hover:text-destructive/90'
                        : 'text-muted-foreground hover:bg-muted hover:text-primary'
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Content Area */}
        <div className="col-span-2 space-y-6 rounded-lg bg-card p-6 shadow-lg">
          <section
            id="profile-info"
            ref={setSectionRef('profile-info')}
            className="animate-in-up"
          >
            <ProfileInfo
              profile={displayProfile}
              isLoading={profileLoading}
              onSave={handleSaveProfile}
              onAvatarUpload={handleAvatarUpload}
            />
          </section>

          <section
            id="password-security"
            ref={setSectionRef('password-security')}
            className="animate-in-up"
            style={{ animationDelay: '50ms' }}
          >
            <PasswordSecurity
              sessions={displaySessions}
              twoFactorEnabled={false}
              onChangePassword={handleChangePassword}
              on2FAToggle={handle2FAToggle}
              onRevokeSession={handleRevokeSession}
            />
          </section>

          <section
            id="billing"
            ref={setSectionRef('billing')}
            className="animate-in-up"
            style={{ animationDelay: '100ms' }}
          >
            <BillingSection
              currentPlan={billing?.plan}
              plans={billing?.plans}
              onUpgrade={handleUpgradePlan}
              onManagePayment={() => {
                navigate('/pricing')
                toast.info('Redirecting to payment settings...')
              }}
            />
          </section>

          <section
            id="api-keys"
            ref={setSectionRef('api-keys')}
            className="animate-in-up"
            style={{ animationDelay: '150ms' }}
          >
            <APIKeysManagement
              apiKeys={apiKeys}
              isLoading={apiKeysLoading}
              onCreateKey={handleCreateApiKey}
              onRevokeKey={handleRevokeApiKey}
            />
          </section>

          <section
            id="team-roles"
            ref={setSectionRef('team-roles')}
            className="animate-in-up"
            style={{ animationDelay: '200ms' }}
          >
            <TeamRoles
              members={teamMembers}
              isLoading={teamLoading}
              onInvite={handleInviteTeamMember}
              onUpdateRole={handleUpdateTeamRole}
              onRemove={handleRemoveTeamMember}
            />
          </section>

          <section
            id="delete-account"
            ref={setSectionRef('delete-account')}
            className="animate-in-up"
            style={{ animationDelay: '250ms' }}
          >
            <DeleteAccount
              onDelete={async (confirmation: string) => {
                if (confirmation === 'delete my account') {
                  toast.success('Account deletion requested')
                }
              }}
            />
          </section>
        </div>
      </div>
    </div>
  )
}

export default UserProfilePage
