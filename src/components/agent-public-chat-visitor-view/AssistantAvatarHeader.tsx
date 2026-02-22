import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { AgentConfig } from '@/types/agent-public-chat'

interface AssistantAvatarHeaderProps {
  agent: AgentConfig
  className?: string
}

export function AssistantAvatarHeader({ agent, className }: AssistantAvatarHeaderProps) {
  return (
    <header
      className={cn(
        'flex items-center justify-between bg-blue-600 text-white p-4 shadow-md transition ease-in-out duration-150',
        className
      )}
    >
      <div className="flex items-center min-w-0">
        <Avatar className="h-10 w-10 shrink-0 mr-2 border-2 border-white/30">
          <AvatarImage src={agent.avatar} alt={agent.name} />
          <AvatarFallback className="bg-blue-500 text-white text-sm font-semibold">
            {agent.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h1 className="font-semibold text-lg truncate">{agent.name}</h1>
          {agent.productHint && (
            <p className="text-sm text-gray-200 truncate">{agent.productHint}</p>
          )}
        </div>
      </div>
    </header>
  )
}
