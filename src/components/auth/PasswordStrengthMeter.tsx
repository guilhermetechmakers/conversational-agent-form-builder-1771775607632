import { useMemo } from 'react'
import { cn } from '@/lib/utils'

export type PasswordStrength = 0 | 1 | 2 | 3 | 4

function calculateStrength(password: string): PasswordStrength {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  return Math.min(4, score) as PasswordStrength
}

function getStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case 0:
      return 'bg-muted'
    case 1:
      return 'bg-destructive'
    case 2:
      return 'bg-amber-500'
    case 3:
      return 'bg-lime-500'
    case 4:
      return 'bg-accent'
    default:
      return 'bg-muted'
  }
}

function getStrengthWidth(strength: PasswordStrength): string {
  const widths = ['0%', '25%', '50%', '75%', '100%']
  return widths[strength]
}

interface PasswordStrengthMeterProps {
  password: string
  className?: string
}

export function PasswordStrengthMeter({ password, className }: PasswordStrengthMeterProps) {
  const strength = useMemo(() => calculateStrength(password), [password])

  return (
    <div
      className={cn(
        'h-2 w-full rounded-full overflow-hidden bg-muted transition-colors duration-300',
        className
      )}
      role="progressbar"
      aria-valuenow={strength * 25}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Password strength"
    >
      <div
        className={cn(
          'h-full transition-[width] duration-300',
          getStrengthColor(strength)
        )}
        style={{ width: getStrengthWidth(strength) }}
      />
    </div>
  )
}
