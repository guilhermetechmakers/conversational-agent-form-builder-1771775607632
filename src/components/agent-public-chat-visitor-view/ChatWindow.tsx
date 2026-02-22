import { useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/types/agent-public-chat'
import { Bot, User } from 'lucide-react'

interface ChatWindowProps {
  messages: ChatMessage[]
  isTyping?: boolean
  className?: string
}

function formatTimestamp(iso: string) {
  const date = new Date(iso)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function ChatWindow({ messages, isTyping, className }: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  return (
    <ScrollArea className={cn('flex-1', className)}>
      <div className="flex flex-col gap-4 p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex animate-in gap-3',
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              )}
            >
              {msg.role === 'user' ? (
                <User className="h-4 w-4" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
            </div>
            <div
              className={cn(
                'flex max-w-[80%] flex-col gap-1 rounded-xl px-4 py-2 shadow-card transition-all duration-200',
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              )}
            >
              <p className="text-sm leading-relaxed">{msg.content}</p>
              <span
                className={cn(
                  'text-xs',
                  msg.role === 'user' ? 'text-primary-foreground/80' : 'text-muted-foreground'
                )}
              >
                {formatTimestamp(msg.timestamp)}
              </span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex animate-in gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1 rounded-xl bg-muted px-4 py-3">
              <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground" />
              <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground [animation-delay:150ms]" />
              <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>
    </ScrollArea>
  )
}
