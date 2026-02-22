import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { WifiOff, FileText } from 'lucide-react'

interface OfflineFallbackProps {
  onRetry?: () => void
  onUseFormFallback?: () => void
  className?: string
}

export function OfflineFallback({
  onRetry,
  onUseFormFallback,
  className,
}: OfflineFallbackProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center animate-in',
        className
      )}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <WifiOff className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg">Connection unavailable</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        We&apos;re having trouble connecting. You can try again or use our basic form
        to submit your information.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {onRetry && (
          <Button onClick={onRetry} className="transition-all duration-200 hover:scale-[1.02]">
            Try again
          </Button>
        )}
        {onUseFormFallback && (
          <Button
            variant="outline"
            onClick={onUseFormFallback}
            className="transition-all duration-200 hover:scale-[1.02]"
          >
            <FileText className="mr-2 h-4 w-4" />
            Use basic form
          </Button>
        )}
      </div>
    </div>
  )
}
