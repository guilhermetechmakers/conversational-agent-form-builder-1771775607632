import * as React from 'react'
import { cn } from '@/lib/utils'

export interface DatePickerProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  value?: string
  onChange?: (value: string) => void
}

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, value, onChange, ...props }, ref) => {
    return (
      <input
        type="date"
        ref={ref}
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(
          'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    )
  }
)
DatePicker.displayName = 'DatePicker'

export interface DateRangePickerProps {
  from?: string
  to?: string
  onFromChange?: (value: string) => void
  onToChange?: (value: string) => void
  className?: string
}

function DateRangePicker({
  from,
  to,
  onFromChange,
  onToChange,
  className,
}: DateRangePickerProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">From</label>
        <DatePicker value={from} onChange={onFromChange} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">To</label>
        <DatePicker value={to} onChange={onToChange} />
      </div>
    </div>
  )
}

export { DatePicker, DateRangePicker }
