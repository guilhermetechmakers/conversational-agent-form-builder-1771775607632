import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { CheckCircle2 } from 'lucide-react'

interface ProgressIndicatorProps {
  progress: number
  totalSteps: number
  completedSteps: number
  variant?: 'bar' | 'steps'
  className?: string
}

export function ProgressIndicator({
  progress,
  totalSteps,
  completedSteps,
  variant = 'bar',
  className,
}: ProgressIndicatorProps) {
  if (totalSteps === 0) return null

  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-muted/30 px-4 py-3 transition-all duration-300',
        className
      )}
    >
      {variant === 'bar' ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-muted-foreground">
              Progress
            </span>
            <span className="font-semibold">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex flex-1 gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-2 flex-1 rounded-full transition-all duration-300',
                  i < completedSteps
                    ? 'bg-primary'
                    : 'bg-muted'
                )}
              />
            ))}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-accent" />
            <span>{completedSteps}/{totalSteps}</span>
          </div>
        </div>
      )}
    </div>
  )
}
