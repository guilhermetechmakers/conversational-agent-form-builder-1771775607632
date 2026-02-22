import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

const PENDING_EMAIL_KEY = 'verify-email-pending'

function VerificationSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-3/4 rounded bg-gray-200 mt-2" />
      <Skeleton className="h-4 w-full rounded bg-gray-200 mt-2" />
      <Skeleton className="h-10 w-full rounded bg-gray-300 mt-4" />
    </div>
  )
}

function VerificationEmptyState({
  onResend,
  isResending,
  pendingEmail,
}: {
  onResend: (email: string) => void
  isResending: boolean
  pendingEmail: string | null
}) {
  const [email, setEmail] = useState(pendingEmail ?? '')

  useEffect(() => {
    if (pendingEmail && !email) setEmail(pendingEmail)
  }, [pendingEmail])

  const emailToUse = (pendingEmail ?? email).trim()
  const canResend = emailToUse.length > 0

  return (
    <div className="space-y-4">
      <div className="text-center">
        <Mail className="w-12 h-12 text-blue-500 mx-auto" aria-hidden />
        <h3 className="text-lg font-medium text-gray-700 mt-2">Verify Your Email</h3>
        <p className="text-sm text-gray-600 mt-1">
          Click the link in the email we sent to confirm your address.
        </p>
      </div>
      {!pendingEmail && (
        <div className="space-y-2">
          <Label htmlFor="resend-email">Email address</Label>
          <Input
            id="resend-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
          />
        </div>
      )}
      <Button
        type="button"
        onClick={() => onResend(emailToUse)}
        disabled={isResending || !canResend}
        className="w-full bg-blue-500 text-white font-medium py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
      >
        {isResending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          'Resend Verification Link'
        )}
      </Button>
    </div>
  )
}

function VerificationSuccessState({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto" aria-hidden />
        <h3 className="text-lg font-medium text-gray-700 mt-2">Email Verified</h3>
        <p className="text-sm text-gray-600 mt-1">
          Your email has been confirmed. You can now access all features.
        </p>
      </div>
      <Button
        type="button"
        onClick={onContinue}
        className="w-full bg-green-500 text-white font-medium py-2 px-4 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
      >
        Go to Dashboard
      </Button>
    </div>
  )
}

function VerificationErrorState({
  onRetry,
  isRetrying,
  pendingEmail,
}: {
  onRetry: (email: string) => void
  isRetrying: boolean
  pendingEmail: string | null
}) {
  const [email, setEmail] = useState(pendingEmail ?? '')

  useEffect(() => {
    if (pendingEmail && !email) setEmail(pendingEmail)
  }, [pendingEmail])

  const emailToUse = (pendingEmail ?? email).trim()
  const canRetry = emailToUse.length > 0

  return (
    <div className="space-y-4">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" aria-hidden />
        <h3 className="text-lg font-medium text-gray-700 mt-2">Verification Failed</h3>
        <p className="text-sm text-gray-600 mt-1">
          The token is expired or invalid. Please request a new verification link.
        </p>
      </div>
      {!pendingEmail && (
        <div className="space-y-2">
          <Label htmlFor="retry-email">Email address</Label>
          <Input
            id="retry-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
          />
        </div>
      )}
      <Button
        type="button"
        onClick={() => onRetry(emailToUse)}
        disabled={isRetrying || !canRetry}
        className="w-full bg-red-500 text-white font-medium py-2 px-4 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
      >
        {isRetrying ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          'Resend Verification Link'
        )}
      </Button>
    </div>
  )
}

export function EmailVerificationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [status, setStatus] = useState<'loading' | 'pending' | 'success' | 'error'>('loading')
  const [isResending, setIsResending] = useState(false)

  const pendingEmail =
    (location.state as { email?: string } | null)?.email ??
    sessionStorage.getItem(PENDING_EMAIL_KEY)

  const supabaseReady = isSupabaseConfigured()

  useEffect(() => {
    async function checkVerification() {
      if (!supabaseReady || !supabase) {
        setStatus('pending')
        return
      }

      const hash = window.location.hash?.replace('#', '') || ''
      const hasHash = hash.length > 0

      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          setStatus(hasHash ? 'error' : 'pending')
          return
        }

        if (data.session?.user?.email_confirmed_at) {
          setStatus('success')
          sessionStorage.removeItem(PENDING_EMAIL_KEY)
          if (hash) {
            window.history.replaceState(null, '', window.location.pathname)
          }
          return
        }

        if (hasHash) {
          setStatus('error')
        } else {
          setStatus('pending')
        }
      } catch {
        setStatus(hasHash ? 'error' : 'pending')
      }
    }

    checkVerification()
  }, [supabaseReady])

  const handleResend = async (emailToUse: string) => {
    if (!supabaseReady || !supabase) {
      toast.error('Authentication is not configured. Please contact support.')
      return
    }

    if (!emailToUse.trim()) {
      toast.error('Please enter your email address.')
      return
    }

    setIsResending(true)

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailToUse.trim(),
        options: { emailRedirectTo: `${window.location.origin}/verify-email` },
      })

      if (error) {
        toast.error(error.message ?? 'Failed to resend verification email')
        return
      }

      toast.success('Verification email sent. Check your inbox.')
      sessionStorage.setItem(PENDING_EMAIL_KEY, emailToUse.trim())
      setStatus('pending')
    } catch {
      toast.error('Failed to resend verification email')
    } finally {
      setIsResending(false)
    }
  }

  const handleRetry = (emailToUse: string) => {
    setStatus('pending')
    handleResend(emailToUse)
  }

  const handleContinue = () => {
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="bg-white shadow-md rounded-lg w-full max-w-md p-6 md:shadow-lg md:max-w-lg md:p-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Email Verification</h2>
        <Card className="border-0 shadow-none p-0">
          <CardContent className="p-0 space-y-4">
            {status === 'loading' && <VerificationSkeleton />}
            {status === 'pending' && (
              <VerificationEmptyState
                onResend={handleResend}
                isResending={isResending}
                pendingEmail={pendingEmail}
              />
            )}
            {status === 'success' && <VerificationSuccessState onContinue={handleContinue} />}
            {status === 'error' && (
              <VerificationErrorState
                onRetry={handleRetry}
                isRetrying={isResending}
                pendingEmail={pendingEmail}
              />
            )}
          </CardContent>
        </Card>
        {status !== 'loading' && (
          <div className="mt-4">
            <Link
              to="/login"
              className="text-sm text-gray-600 hover:text-gray-800 hover:underline"
            >
              Back to log in
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
