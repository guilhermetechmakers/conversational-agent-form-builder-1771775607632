import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const resetConfirmSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase, and number'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ResetConfirmForm = z.infer<typeof resetConfirmSchema>

const inputClasses =
  'w-full mt-4 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out'
const buttonClasses =
  'w-full mt-4 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-150 ease-in-out'

function ResetFormSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full rounded-md bg-gray-200 mt-4" />
      <Skeleton className="h-10 w-full rounded-md bg-gray-200 mt-4" />
      <Skeleton className="h-10 w-full rounded-md bg-gray-200 mt-4" />
      <Skeleton className="h-10 w-full rounded-md bg-gray-200 mt-4" />
    </div>
  )
}

function ResetEmptyState() {
  return (
    <div className="flex flex-col items-center py-8">
      <AlertCircle className="text-gray-300 w-16 h-16" aria-hidden />
      <div className="mt-4 text-xl font-semibold text-gray-700">
        Invalid or expired link
      </div>
      <div className="mt-2 text-center text-gray-500 max-w-sm">
        This password reset link is invalid or has expired. Please request a new
        one.
      </div>
      <Link to="/password-reset" className="mt-4">
        <Button className="bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-150 ease-in-out">
          Request new reset link
        </Button>
      </Link>
    </div>
  )
}

function ResetErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="mt-6 text-center text-red-600">{message}</div>
      <Button
        className="mt-4 bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition duration-150 ease-in-out"
        onClick={onRetry}
      >
        Try again
      </Button>
    </div>
  )
}

export function PasswordResetConfirmPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [hasRecoverySession, setHasRecoverySession] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ResetConfirmForm>({
    resolver: zodResolver(resetConfirmSchema),
  })

  const newPassword = watch('newPassword', '')
  const supabaseReady = isSupabaseConfigured()

  useEffect(() => {
    async function checkRecoverySession() {
      if (!supabaseReady || !supabase) {
        setIsCheckingSession(false)
        return
      }

      const hashParams = new URLSearchParams(
        window.location.hash?.replace('#', '') || ''
      )
      const type = hashParams.get('type')

      if (type !== 'recovery') {
        setHasRecoverySession(false)
        setIsCheckingSession(false)
        return
      }

      try {
        let { data } = await supabase.auth.getSession()
        if (!data.session) {
          await new Promise((r) => setTimeout(r, 300))
          const result = await supabase.auth.getSession()
          data = result.data
        }
        setHasRecoverySession(!!data.session)
      } catch {
        setHasRecoverySession(false)
      } finally {
        setIsCheckingSession(false)
      }
    }

    checkRecoverySession()
  }, [supabaseReady])

  const onSubmit = async (data: ResetConfirmForm) => {
    setHasError(false)
    setIsLoading(true)

    if (!supabaseReady || !supabase) {
      setErrorMessage('Password reset is not configured. Please contact support.')
      setHasError(true)
      toast.error('Password reset is not configured')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      })

      if (error) {
        setErrorMessage(error.message)
        setHasError(true)
        toast.error(error.message)
        return
      }

      setSuccess(true)
      toast.success('Password updated successfully')

      const hashParams = new URLSearchParams(
        window.location.hash?.replace('#', '') || ''
      )
      if (hashParams.toString()) {
        window.history.replaceState(null, '', window.location.pathname)
      }
    } catch {
      setErrorMessage('Failed to update password')
      setHasError(true)
      toast.error('Failed to update password')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-100 px-4 py-8">
        <Card className="w-full max-w-md p-6 bg-white shadow-md rounded-lg">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-2xl font-semibold text-foreground">
              Password reset complete
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="mt-6 text-center text-green-600">
              Your password has been updated successfully. You can now sign in
              with your new password.
            </div>
            <Button
              className={cn(buttonClasses, 'mt-6')}
              onClick={() => navigate('/login', { replace: true })}
            >
              Sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isCheckingSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-100 px-4 py-8">
        <Card className="w-full max-w-md p-6 bg-white shadow-md rounded-lg">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-2xl font-semibold text-foreground">
              Set new password
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ResetFormSkeleton />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!hasRecoverySession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-100 px-4 py-8">
        <Card className="w-full max-w-md p-6 bg-white shadow-md rounded-lg">
          <CardContent className="p-0">
            <ResetEmptyState />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-100 px-4 py-8">
      <Card className="w-full max-w-md p-6 bg-white shadow-md rounded-lg">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-2xl font-semibold text-foreground">
            Set new password
          </CardTitle>
          <p className="mt-2 text-sm text-gray-600">
            Enter your new password below. Use at least 8 characters with
            uppercase, lowercase, and a number.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {hasError ? (
            <ResetErrorState
              message={errorMessage}
              onRetry={() => setHasError(false)}
            />
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4 md:grid md:grid-cols-1 md:gap-6"
            >
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="New password"
                    className={cn(
                      inputClasses,
                      'pl-10',
                      errors.newPassword && 'border-red-500'
                    )}
                    autoComplete="new-password"
                    {...register('newPassword')}
                  />
                </div>
                <PasswordStrengthMeter password={newPassword} className="mt-1" />
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    className={cn(
                      inputClasses,
                      'pl-10',
                      errors.confirmPassword && 'border-red-500'
                    )}
                    autoComplete="new-password"
                    {...register('confirmPassword')}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className={buttonClasses}
                disabled={isSubmitting || isLoading}
              >
                {(isSubmitting || isLoading) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting || isLoading
                  ? 'Updating...'
                  : 'Update password'}
              </Button>
            </form>
          )}
          <div className="mt-6 text-center text-gray-600">
            <Link
              to="/password-reset"
              className="text-blue-500 hover:underline"
            >
              Request a new reset link
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
