import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const resetSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type ResetForm = z.infer<typeof resetSchema>

export function PasswordResetPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  })

  const supabaseReady = isSupabaseConfigured()

  const onSubmit = async (data: ResetForm) => {
    setIsLoading(true)

    if (!supabaseReady || !supabase) {
      toast.error('Password reset is not configured')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/password-reset/confirm`,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      setSent(true)
      toast.success('Check your email for the reset link')
    } catch {
      toast.error('Failed to send reset email')
    } finally {
      setIsLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-muted/50 px-4 py-8">
        <Card className="w-full max-w-md p-6 shadow-md">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-2xl font-semibold text-foreground">
              Check your email
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-sm text-muted-foreground">
              We&apos;ve sent a password reset link to your email address.
            </p>
            <Link to="/login" className="mt-4 block">
              <Button variant="outline" className="w-full">
                Back to log in
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-muted/50 px-4 py-8">
      <Card className="w-full max-w-md p-6 shadow-md transition-all duration-300 hover:shadow-lg">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-2xl font-semibold text-foreground">
            Reset password
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
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
            <Button
              type="submit"
              className="w-full bg-primary py-2 transition-colors duration-200 hover:bg-primary/90"
              disabled={isSubmitting || isLoading}
            >
              {(isSubmitting || isLoading) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting || isLoading ? 'Sending...' : 'Send reset link'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline">
              Back to log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
