import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { AgentConfig } from '@/types/agent-public-chat'

interface AssistantAvatarHeaderProps {
  agent: AgentConfig
  className?: string
}

export function AssistantAvatarHeader({ agent, className }: AssistantAvatarHeaderProps) {
  const primaryColor = agent.brandColors?.primary ?? 'rgb(var(--primary))'
  const accentColor = agent.brandColors?.accent ?? 'rgb(var(--accent))'

  return (
    <header
      className={cn(
        'flex items-center gap-4 border-b border-l-4 border-border bg-card px-4 py-4 shadow-sm transition-all duration-300',
        className
      )}
      style={{
        borderLeftColor: primaryColor,
      }}
    >
      <Avatar className="h-12 w-12 border-2 border-border shadow-elevated">
        <AvatarImage src={agent.avatar} alt={agent.name} />
        <AvatarFallback
          className="text-lg font-semibold"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
            color: 'white',
          }}
        >
          {agent.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <h1 className="font-semibold text-lg truncate">{agent.name}</h1>
        {agent.productHint && (
          <p className="text-sm text-muted-foreground truncate">{agent.productHint}</p>
        )}
      </div>
    </header>
  )
}
