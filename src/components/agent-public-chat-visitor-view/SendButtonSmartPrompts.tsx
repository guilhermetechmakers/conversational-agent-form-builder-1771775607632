import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'

interface SmartPrompt {
  id: string
  text: string
}

interface SendButtonSmartPromptsProps {
  smartPrompts: SmartPrompt[]
  onSelectPrompt: (text: string) => void
  disabled?: boolean
  className?: string
}

export function SendButtonSmartPrompts({
  smartPrompts,
  onSelectPrompt,
  disabled = false,
  className,
}: SendButtonSmartPromptsProps) {
  if (smartPrompts.length === 0) return null

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5" />
        <span>Suggested replies</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {smartPrompts.map((prompt) => (
          <Button
            key={prompt.id}
            type="button"
            variant="outline"
            size="sm"
            className="transition-all duration-200 hover:scale-[1.02]"
            onClick={() => onSelectPrompt(prompt.text)}
            disabled={disabled}
          >
            {prompt.text}
          </Button>
        ))}
      </div>
    </div>
  )
}
