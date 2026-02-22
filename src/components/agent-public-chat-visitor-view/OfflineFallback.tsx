import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
    <Card
      className={cn(
        'bg-yellow-100 p-4 rounded-lg animate-in',
        className
      )}
    >
      <div className="flex flex-col items-center justify-center text-center">
        <WifiOff className="h-10 w-10 text-yellow-700 mb-3" aria-hidden />
        <h3 className="font-semibold text-lg text-yellow-700">Connection unavailable</h3>
        <p className="mt-2 max-w-sm text-sm text-yellow-700">
          We&apos;re having trouble connecting. You can try again or use our basic form
          to submit your information.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {onRetry && (
            <Button
              onClick={onRetry}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition ease-in-out duration-150"
            >
              Try again
            </Button>
          )}
          {onUseFormFallback && (
            <Button
              variant="outline"
              onClick={onUseFormFallback}
              className="border-yellow-600 text-yellow-700 hover:bg-yellow-200 transition ease-in-out duration-150"
            >
              <FileText className="mr-2 h-4 w-4" />
              Use basic form
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
