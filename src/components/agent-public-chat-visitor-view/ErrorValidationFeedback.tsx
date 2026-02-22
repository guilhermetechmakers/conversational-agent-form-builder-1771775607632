import { cn } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorValidationFeedbackProps {
  message: string
  retryLabel?: string
  onRetry?: () => void
  className?: string
}

export function ErrorValidationFeedback({
  message,
  retryLabel = 'Try again',
  onRetry,
  className,
}: ErrorValidationFeedbackProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 animate-in',
        className
      )}
    >
      <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-destructive">{message}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Please check your input and try again.
        </p>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            className="mt-3 border-destructive/50 text-destructive hover:bg-destructive/10"
            onClick={onRetry}
          >
            {retryLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
