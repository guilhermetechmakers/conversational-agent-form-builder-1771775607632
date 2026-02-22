import { useParams } from 'react-router-dom'
import { Bot, Send } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function PublicChatPage() {
  const { agentId } = useParams()
  const [message, setMessage] = useState('')
  const [messages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    setMessage('')
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="container mx-auto flex max-w-3xl flex-1 flex-col p-4">
        <Card className="flex flex-1 flex-col overflow-hidden">
          <CardHeader className="border-b border-border">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="font-semibold">Conversational Agent</h1>
                <p className="text-sm text-muted-foreground">
                  {agentId === 'demo' ? 'Demo agent' : `Agent ${agentId}`}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
            <div className="flex-1 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Bot className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Hi! I&apos;m your conversational assistant. How can I help you today?
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex',
                        m.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div
                        className={cn(
                          'max-w-[80%] rounded-lg px-4 py-2',
                          m.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                      >
                        {m.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <form
              onSubmit={handleSubmit}
              className="flex gap-2 border-t border-border p-4"
            >
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
