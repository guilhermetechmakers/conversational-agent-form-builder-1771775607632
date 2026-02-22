import { cn } from '@/lib/utils'

interface ProgressIndicatorProps {
  progress: number
  totalSteps: number
  completedSteps?: number
  variant?: 'bar' | 'steps'
  className?: string
}

export function ProgressIndicator({
  progress,
  totalSteps,
  className,
}: ProgressIndicatorProps) {
  if (totalSteps === 0) return null

  return (
    <div className={cn('transition ease-in-out duration-150', className)}>
      <div className="h-2 bg-gray-300 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  )
}
