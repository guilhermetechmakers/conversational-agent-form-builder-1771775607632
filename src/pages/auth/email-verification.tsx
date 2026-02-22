import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function EmailVerificationPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const verified = Boolean(token)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <Card className="w-full max-w-md animate-in-up">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
              <CheckCircle className="h-10 w-10 text-accent" />
            </div>
            <CardTitle className="text-center text-2xl">
              {verified ? 'Email verified' : 'Verify your email'}
            </CardTitle>
            <CardDescription className="text-center">
              {verified
                ? 'Your email has been verified. You can now access all features.'
                : 'Check your inbox for the verification link.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {verified ? (
              <Link to="/dashboard" className="block">
                <Button className="w-full">Go to Dashboard</Button>
              </Link>
            ) : (
              <Button variant="outline" className="w-full" disabled>
                Resend verification email
              </Button>
            )}
            <Link to="/login" className="block">
              <Button variant="ghost" className="w-full">
                Back to log in
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
