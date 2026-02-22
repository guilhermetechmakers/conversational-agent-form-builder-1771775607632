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
    <div
      className={cn(
        'flex flex-col items-stretch bg-gray-100 p-2 border-t transition ease-in-out duration-150',
        className
      )}
    >
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-150"
        />
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
              className="ml-2"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </>
        )}
        {supportsVoice && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            aria-label="Voice input"
            className="ml-2"
          >
            <Mic className="h-4 w-4" />
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          disabled={disabled || !text.trim()}
          className="ml-2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition ease-in-out duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
      {quickReplies.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {quickReplies.map((reply) => (
            <Button
              key={reply}
              type="button"
              variant="ghost"
              size="sm"
              className="bg-gray-200 p-2 rounded-lg hover:bg-gray-300 transition ease-in-out duration-150"
              onClick={() => handleQuickReply(reply)}
              disabled={disabled}
            >
              {reply}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
