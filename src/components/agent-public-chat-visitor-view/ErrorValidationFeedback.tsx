import { cn } from '@/lib/utils'
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
        'bg-red-100 text-red-600 p-2 rounded-lg animate-in',
        className
      )}
    >
      <p className="text-sm font-medium">{message}</p>
      {onRetry && (
        <Button
          type="button"
          size="sm"
          className="mt-2 bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition ease-in-out duration-150"
          onClick={onRetry}
        >
          {retryLabel}
        </Button>
      )}
    </div>
  )
}
