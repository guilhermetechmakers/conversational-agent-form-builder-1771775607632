import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp, ClipboardList } from 'lucide-react'
import type { FieldConfig, SessionState } from '@/types/agent-public-chat'

interface SessionStatePanelProps {
  sessionState: SessionState
  fields?: FieldConfig[]
  className?: string
}

function formatValue(value: string | number | File | null): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'object' && value instanceof File) return value.name
  return String(value)
}

function getFieldLabel(key: string, fields: FieldConfig[]): string {
  const field = fields.find((f) => f.key === key)
  return field?.label ?? key
}

export function SessionStatePanel({ sessionState, fields = [], className }: SessionStatePanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { collectedFields, remainingFields } = sessionState
  const hasCollected = Object.keys(collectedFields).length > 0
  const hasRemaining = remainingFields.length > 0

  if (!hasCollected && !hasRemaining) return null

  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-muted/30 transition-all duration-300 hover:bg-muted/50',
        className
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/50"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">Session progress</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {isOpen && (
        <div className="animate-in border-t border-border px-4 py-3 space-y-3">
          {hasCollected && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Collected
              </p>
              <ul className="space-y-1 text-sm">
                {Object.entries(collectedFields).map(([key, value]) => (
                  <li key={key} className="flex justify-between gap-4">
                    <span className="text-muted-foreground">{getFieldLabel(key, fields)}</span>
                    <span className="truncate font-medium">{formatValue(value)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {hasRemaining && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Remaining
              </p>
              <ul className="space-y-1 text-sm">
                {remainingFields.map((field) => (
                  <li key={field} className="text-muted-foreground">
                    {field}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
