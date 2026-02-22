import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Shield } from 'lucide-react'

interface ConsentPrivacyCheckboxProps {
  consentText: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  onAccept: () => void
  disabled?: boolean
  className?: string
}

export function ConsentPrivacyCheckbox({
  consentText,
  checked,
  onCheckedChange,
  onAccept,
  disabled = false,
  className,
}: ConsentPrivacyCheckboxProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-300',
        className
      )}
    >
      <div className="flex gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 space-y-4">
          <h3 className="font-semibold text-lg">Privacy & Consent</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {consentText}
          </p>
          <div className="flex items-start gap-3">
            <Checkbox
              id="consent"
              checked={checked}
              onCheckedChange={(v) => onCheckedChange(v === true)}
              disabled={disabled}
              className="mt-0.5"
            />
            <Label
              htmlFor="consent"
              className="cursor-pointer text-sm leading-relaxed"
            >
              I agree to the above and consent to the collection of my information.
            </Label>
          </div>
          <Button
            onClick={onAccept}
            disabled={!checked || disabled}
            className="transition-all duration-200 hover:scale-[1.02]"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
