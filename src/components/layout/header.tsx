import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  variant?: 'landing' | 'auth'
}

export function Header({ variant = 'landing' }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold text-xl">
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Agent Builder
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          {variant === 'landing' && (
            <>
              <Link
                to="/agent-public-chat-visitor-view/demo"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Try demo
              </Link>
              <Link
                to="/pricing"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Pricing
              </Link>
              <Link
                to="/about"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                About
              </Link>
              <Link to="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link to="/signup">
                <Button>Get started</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
