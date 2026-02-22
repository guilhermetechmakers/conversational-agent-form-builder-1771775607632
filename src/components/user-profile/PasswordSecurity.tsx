import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Shield, Smartphone, Monitor, LogOut } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { ActiveSession } from '@/types/user-profile'

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ChangePasswordForm = z.infer<typeof changePasswordSchema>

interface PasswordSecurityProps {
  sessions?: ActiveSession[]
  twoFactorEnabled?: boolean
  on2FAToggle?: (enabled: boolean) => Promise<void>
  onChangePassword?: (data: ChangePasswordForm) => Promise<void>
  onRevokeSession?: (sessionId: string) => Promise<void>
}

export function PasswordSecurity({
  sessions = [],
  twoFactorEnabled = false,
  on2FAToggle,
  onChangePassword,
  onRevokeSession,
}: PasswordSecurityProps) {
  const [twoFactorType, setTwoFactorType] = useState<'sms' | 'authenticator'>('authenticator')
  const [is2FALoading, setIs2FALoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const handle2FAToggle = async (checked: boolean) => {
    setIs2FALoading(true)
    try {
      await on2FAToggle?.(checked)
    } finally {
      setIs2FALoading(false)
    }
  }

  const onSubmit = async (data: ChangePasswordForm) => {
    await onChangePassword?.(data)
    reset()
  }

  const getSessionIcon = (device: string) => {
    if (device.toLowerCase().includes('mobile') || device.toLowerCase().includes('phone')) {
      return Smartphone
    }
    return Monitor
  }

  return (
    <Card className="transition-all duration-300 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Password & Security
        </CardTitle>
        <CardDescription>
          Change your password, manage two-factor authentication, and active sessions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="password">
          <TabsList className="mb-6">
            <TabsTrigger value="password">Change password</TabsTrigger>
            <TabsTrigger value="2fa">Two-factor auth</TabsTrigger>
            <TabsTrigger value="sessions">Active sessions</TabsTrigger>
          </TabsList>

          <TabsContent value="password">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  {...register('currentPassword')}
                  className={cn(errors.currentPassword && 'border-destructive')}
                />
                {errors.currentPassword && (
                  <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...register('newPassword')}
                  className={cn(errors.newPassword && 'border-destructive')}
                />
                {errors.newPassword && (
                  <p className="text-sm text-destructive">{errors.newPassword.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword')}
                  className={cn(errors.confirmPassword && 'border-destructive')}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update password'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="2fa">
            <div className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="font-medium">Two-factor authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={handle2FAToggle}
                  disabled={is2FALoading}
                />
              </div>
              {twoFactorEnabled && (
                <div className="space-y-2">
                  <Label>2FA method</Label>
                  <div className="flex gap-4">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="2fa-type"
                        checked={twoFactorType === 'authenticator'}
                        onChange={() => setTwoFactorType('authenticator')}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">Authenticator app</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="2fa-type"
                        checked={twoFactorType === 'sms'}
                        onChange={() => setTwoFactorType('sms')}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">SMS</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sessions">
            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
                <Monitor className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 font-semibold">No active sessions</h3>
                <p className="mb-4 max-w-sm text-center text-sm text-muted-foreground">
                  When you sign in on a new device, it will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => {
                  const Icon = getSessionIcon(session.device)
                  return (
                    <div
                      key={session.id}
                      className="flex items-center justify-between rounded-lg border border-border p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{session.device}</p>
                          <p className="text-sm text-muted-foreground">
                            {session.location ?? 'Unknown location'} · Last active{' '}
                            {new Date(session.last_active).toLocaleDateString()}
                          </p>
                        </div>
                        {session.current && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            Current
                          </span>
                        )}
                      </div>
                      {!session.current && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRevokeSession?.(session.id)}
                          aria-label="Revoke session"
                        >
                          <LogOut className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
