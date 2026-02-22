import { useEffect, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/types/agent-public-chat'
import { Bot } from 'lucide-react'

interface ChatWindowProps {
  messages: ChatMessage[]
  isTyping?: boolean
  agentName?: string
  agentAvatar?: string
  welcomeMessage?: string
  className?: string
}

function formatTimestamp(iso: string) {
  const date = new Date(iso)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function ChatWindow({
  messages,
  isTyping,
  agentName = 'Assistant',
  agentAvatar,
  welcomeMessage = "Hi! I'm here to help. How can I assist you today?",
  className,
}: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  return (
    <div
      className={cn(
        'flex flex-1 flex-col bg-white shadow-inner overflow-y-auto p-4',
        className
      )}
    >
      <div className="space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-in">
            <Bot className="h-12 w-12 text-gray-400 mb-4" aria-hidden />
            <h3 className="text-lg text-gray-600">{agentName}</h3>
            <p className="mt-2 max-w-sm text-sm text-gray-500 leading-relaxed">
              {welcomeMessage}
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex items-start gap-2 animate-in',
              msg.role === 'user' && 'flex-row-reverse items-end justify-end'
            )}
          >
            {msg.role === 'assistant' ? (
              <>
                <Avatar className="h-8 w-8 shrink-0 mr-2">
                  <AvatarImage src={agentAvatar} alt={agentName} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-semibold">
                    {agentName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Card className="bg-blue-100 p-3 rounded-lg max-w-[80%]">
                  <p className="text-sm leading-relaxed text-gray-900">{msg.content}</p>
                  <span className="text-xs text-gray-400">{formatTimestamp(msg.timestamp)}</span>
                </Card>
              </>
            ) : (
              <>
                <Card className="bg-green-100 p-3 rounded-lg max-w-[80%]">
                  <p className="text-sm leading-relaxed text-gray-900">{msg.content}</p>
                  <span className="text-xs text-gray-400">{formatTimestamp(msg.timestamp)}</span>
                </Card>
              </>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex items-start gap-2 animate-in">
            <Avatar className="h-8 w-8 shrink-0 mr-2">
              <AvatarImage src={agentAvatar} alt={agentName} />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-semibold">
                {agentName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm text-gray-500 italic">Typing...</div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>
    </div>
  )
}
