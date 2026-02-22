import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const signupSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type SignupForm = z.infer<typeof signupSchema>

function SignupErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">{message}</p>
      </div>
      <Button
        variant="destructive"
        className="w-full"
        onClick={onRetry}
      >
        Try again
      </Button>
    </div>
  )
}

export function SignupPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { agreeToTerms: false },
  })

  const password = watch('password')
  const agreeToTerms = watch('agreeToTerms')
  const supabaseReady = isSupabaseConfigured()

  const onSubmit = async (data: SignupForm) => {
    setHasError(false)
    setIsLoading(true)

    if (!supabaseReady || !supabase) {
      setErrorMessage('Authentication is not configured. Please contact support.')
      setHasError(true)
      setIsLoading(false)
      return
    }

    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`,
        },
      })

      if (error) {
        setErrorMessage(error.message ?? 'Sign up failed')
        setHasError(true)
        toast.error(error.message)
        return
      }

      if (authData.user) {
        if (authData.session) {
          toast.success('Account created! Welcome.')
          navigate('/dashboard', { replace: true })
        } else {
          toast.success('Check your email to verify your account')
          sessionStorage.setItem('verify-email-pending', data.email)
          navigate('/verify-email', { replace: true, state: { email: data.email } })
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setErrorMessage(msg)
      setHasError(true)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSsoSignup = async (provider: 'google' | 'azure') => {
    if (!supabaseReady || !supabase) {
      toast.error('SSO is not configured')
      return
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider === 'azure' ? 'azure' : 'google',
      })
      if (error) toast.error(error.message)
    } catch {
      toast.error('SSO sign-up failed')
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-muted/50 px-4 py-8">
      <Card className="w-full max-w-md p-6 shadow-md transition-all duration-300 hover:shadow-lg">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-2xl font-semibold text-foreground">
            Create an account
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {hasError ? (
            <SignupErrorState
              message={errorMessage}
              onRetry={() => setHasError(false)}
            />
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    className={cn(
                      'w-full border-input pl-10 focus:ring-2 focus:ring-primary',
                      errors.email && 'border-destructive'
                    )}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Password"
                    className={cn(
                      'w-full border-input pl-10 focus:ring-2 focus:ring-primary',
                      errors.password && 'border-destructive'
                    )}
                    {...register('password')}
                  />
                </div>
                <PasswordStrengthMeter password={password ?? ''} className="mt-1" />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    className={cn(
                      'w-full border-input pl-10 focus:ring-2 focus:ring-primary',
                      errors.confirmPassword && 'border-destructive'
                    )}
                    {...register('confirmPassword')}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="agreeToTerms"
                  checked={agreeToTerms ?? false}
                  onCheckedChange={(checked) =>
                    setValue('agreeToTerms', checked === true)
                  }
                  className="mt-0.5"
                />
                <Label
                  htmlFor="agreeToTerms"
                  className="cursor-pointer text-sm text-muted-foreground"
                >
                  I agree to the{' '}
                  <Link to="/about" className="text-primary hover:underline">
                    terms and conditions
                  </Link>
                </Label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-sm text-destructive">
                  {errors.agreeToTerms.message}
                </p>
              )}

              <Button
                type="submit"
                className="w-full bg-primary py-2 transition-colors duration-200 hover:bg-primary/90"
                disabled={isSubmitting || isLoading}
              >
                {(isSubmitting || isLoading) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting || isLoading ? 'Creating account...' : 'Sign up'}
              </Button>
            </form>
          )}

          {!hasError && supabaseReady && (
            <>
              <div className="mt-4 flex flex-col space-y-2 md:grid md:grid-cols-2 md:gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
                  onClick={() => handleSsoSignup('google')}
                >
                  Sign up with Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                  onClick={() => handleSsoSignup('azure')}
                >
                  Sign up with Microsoft
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                className="mt-2 w-full border-muted bg-muted/50 hover:bg-muted"
                disabled
              >
                Enterprise SSO (coming soon)
              </Button>
            </>
          )}

          {!hasError && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
