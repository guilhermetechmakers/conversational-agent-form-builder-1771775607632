import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp } from 'lucide-react'
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
  const [isOpen, setIsOpen] = useState(true)
  const { collectedFields, remainingFields } = sessionState
  const hasCollected = Object.keys(collectedFields).length > 0
  const hasRemaining = remainingFields.length > 0

  return (
    <div
      className={cn(
        'hidden md:block w-64 bg-gray-200 p-4 border-l flex-shrink-0 overflow-y-auto',
        className
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left transition-colors hover:opacity-80"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-sm text-gray-700">Session State</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-600" />
        )}
      </button>
      {isOpen && (
        <div className="space-y-2 mt-3">
          {hasCollected && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Collected</p>
              <ul className="space-y-1">
                {Object.entries(collectedFields).map(([key, value]) => (
                  <li key={key} className="text-sm text-gray-700">
                    <span className="font-medium">{getFieldLabel(key, fields)}:</span>{' '}
                    {formatValue(value)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {hasRemaining && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Remaining Fields</p>
              <ul className="space-y-1">
                {remainingFields.map((field) => (
                  <li key={field} className="text-xs text-gray-500">
                    {field}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {!hasCollected && !hasRemaining && (
            <p className="text-sm text-gray-500">No data collected yet.</p>
          )}
        </div>
      )}
    </div>
  )
}
