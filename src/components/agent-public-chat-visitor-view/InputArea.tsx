import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Send, Mic, Paperclip } from 'lucide-react'

interface InputAreaProps {
  onSend: (text: string, file?: File) => void
  quickReplies?: string[]
  supportsFileUpload?: boolean
  supportsVoice?: boolean
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function InputArea({
  onSend,
  quickReplies = [],
  supportsFileUpload = false,
  supportsVoice = false,
  disabled = false,
  placeholder = 'Type your message...',
  className,
}: InputAreaProps) {
  const [text, setText] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setText('')
  }

  const handleQuickReply = (reply: string) => {
    if (disabled) return
    onSend(reply)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onSend('', file)
    e.target.value = ''
  }

  return (
    <div className={cn('border-t border-border bg-card p-4', className)}>
      {quickReplies.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {quickReplies.map((reply) => (
            <Button
              key={reply}
              type="button"
              variant="outline"
              size="sm"
              className="transition-all duration-200 hover:scale-[1.02]"
              onClick={() => handleQuickReply(reply)}
              disabled={disabled}
            >
              {reply}
            </Button>
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2">
        {supportsFileUpload && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              aria-label="Upload file"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </>
        )}
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 transition-colors focus-visible:ring-2"
        />
        {supportsVoice && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            aria-label="Voice input"
          >
            <Mic className="h-4 w-4" />
          </Button>
        )}
        <Button
          type="submit"
          size="icon"
          disabled={disabled || !text.trim()}
          className="transition-all duration-200 hover:scale-[1.02] hover:shadow-elevated"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
