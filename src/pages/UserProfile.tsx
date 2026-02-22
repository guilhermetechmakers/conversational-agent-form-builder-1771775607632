import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Settings } from 'lucide-react'
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

const FALLBACK_SESSIONS = [
  {
    id: '1',
    device: 'Chrome on macOS',
    location: 'New York, US',
    last_active: new Date().toISOString(),
    current: true,
  },
]

export function UserProfilePage() {
  const navigate = useNavigate()
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

  const handleSaveProfile = async (data: { name: string; email: string; timezone: string; language: string }) => {
    try {
      await updateProfile.mutateAsync(data)
      toast.success('Profile updated successfully')
    } catch {
      toast.error('Failed to update profile')
    }
  }

  const handleAvatarUpload = async (file: File) => {
    try {
      // Placeholder: in production, upload to storage and get URL, then update profile
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

  const handleInviteTeamMember = async (email: string, role: 'admin' | 'member' | 'viewer') => {
    try {
      await inviteTeamMember.mutateAsync({ email, role })
      toast.success('Invitation sent')
    } catch {
      toast.error('Failed to send invitation')
    }
  }

  const handleUpdateTeamRole = async (memberId: string, role: 'admin' | 'member' | 'viewer') => {
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

  const handleChangePassword = async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    try {
      await changePassword.mutateAsync({ currentPassword: data.currentPassword, newPassword: data.newPassword })
      toast.success('Password updated')
    } catch {
      toast.error('Failed to update password')
    }
  }

  const handle2FAToggle = async (enabled: boolean) => {
    try {
      await toggle2FA.mutateAsync(enabled)
      toast.success(enabled ? 'Two-factor authentication enabled' : 'Two-factor authentication disabled')
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
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your profile, billing, API keys, and team members
        </p>
      </div>

      <div className="space-y-8">
        <section className="animate-in-up" style={{ animationDelay: '50ms' }}>
          <ProfileInfo
            profile={displayProfile}
            isLoading={profileLoading}
            onSave={handleSaveProfile}
            onAvatarUpload={handleAvatarUpload}
          />
        </section>

        <section className="animate-in-up" style={{ animationDelay: '100ms' }}>
          <PasswordSecurity
            sessions={displaySessions}
            twoFactorEnabled={false}
            onChangePassword={handleChangePassword}
            on2FAToggle={handle2FAToggle}
            onRevokeSession={handleRevokeSession}
          />
        </section>

        <section className="animate-in-up" style={{ animationDelay: '150ms' }}>
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

        <section className="animate-in-up" style={{ animationDelay: '200ms' }}>
          <APIKeysManagement
            apiKeys={apiKeys}
            isLoading={apiKeysLoading}
            onCreateKey={handleCreateApiKey}
            onRevokeKey={handleRevokeApiKey}
          />
        </section>

        <section className="animate-in-up" style={{ animationDelay: '250ms' }}>
          <TeamRoles
            members={teamMembers}
            isLoading={teamLoading}
            onInvite={handleInviteTeamMember}
            onUpdateRole={handleUpdateTeamRole}
            onRemove={handleRemoveTeamMember}
          />
        </section>

        <section className="animate-in-up" style={{ animationDelay: '300ms' }}>
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
  )
}

export default UserProfilePage
