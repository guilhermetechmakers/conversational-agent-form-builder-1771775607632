import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { AgentField, FieldType } from '@/types/agent-builder'

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'number', label: 'Number' },
  { value: 'select', label: 'Select' },
  { value: 'multiselect', label: 'Multi-select' },
  { value: 'date', label: 'Date' },
  { value: 'phone', label: 'Phone' },
  { value: 'textarea', label: 'Textarea' },
]

interface FieldEditorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  field?: AgentField | null
  onSave: (field: AgentField) => void
}

export function FieldEditorDialog({
  open,
  onOpenChange,
  field,
  onSave,
}: FieldEditorDialogProps) {
  const [key, setKey] = useState('')
  const [label, setLabel] = useState('')
  const [type, setType] = useState<FieldType>('text')
  const [placeholder, setPlaceholder] = useState('')
  const [required, setRequired] = useState(false)
  const [optionsStr, setOptionsStr] = useState('')

  useEffect(() => {
    if (field) {
      setKey(field.key)
      setLabel(field.label)
      setType(field.type)
      setPlaceholder(field.placeholder ?? '')
      setRequired(field.validation?.required ?? false)
      setOptionsStr(field.validation?.options?.join(', ') ?? '')
    } else {
      setKey('')
      setLabel('')
      setType('text')
      setPlaceholder('')
      setRequired(false)
      setOptionsStr('')
    }
  }, [field, open])

  const handleSave = () => {
    const trimmedKey = key.trim().toLowerCase().replace(/\s+/g, '_')
    const trimmedLabel = label.trim()
    if (!trimmedKey || !trimmedLabel) return

    const options = optionsStr
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean)

    onSave({
      id: field?.id ?? crypto.randomUUID(),
      key: trimmedKey,
      label: trimmedLabel,
      type,
      placeholder: placeholder || undefined,
      validation: {
        required,
        ...(options.length > 0 && { options }),
      },
    })
    onOpenChange(false)
  }

  const showOptions = type === 'select' || type === 'multiselect'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{field ? 'Edit Field' : 'Add Field'}</DialogTitle>
          <DialogDescription>
            Define the field configuration for your form collection.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="key">Key (internal)</Label>
            <Input
              id="key"
              placeholder="e.g. email_address"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              placeholder="e.g. Email Address"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as FieldType)}>
              <SelectTrigger id="type" className="focus:ring-2 focus:ring-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FIELD_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="placeholder">Placeholder</Label>
            <Input
              id="placeholder"
              placeholder="Optional placeholder text"
              value={placeholder}
              onChange={(e) => setPlaceholder(e.target.value)}
              className="focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="required"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
              className="h-4 w-4 rounded border-input accent-primary focus:ring-2 focus:ring-blue-500"
            />
            <Label htmlFor="required" className="cursor-pointer">
              Required
            </Label>
          </div>
          {showOptions && (
            <div className="space-y-2">
              <Label htmlFor="options">Options (comma-separated)</Label>
              <Input
                id="options"
                placeholder="Option 1, Option 2, Option 3"
                value={optionsStr}
                onChange={(e) => setOptionsStr(e.target.value)}
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-blue-500 text-white transition-colors hover:bg-blue-600"
            onClick={handleSave}
          >
            {field ? 'Save' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
