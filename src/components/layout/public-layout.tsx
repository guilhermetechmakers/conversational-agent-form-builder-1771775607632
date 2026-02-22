import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './header'

const AUTH_PATHS = ['/login', '/signup', '/password-reset', '/verify-email']

export function PublicLayout() {
  const location = useLocation()
  const isAuthPage = AUTH_PATHS.some((p) => location.pathname.startsWith(p))

  return (
    <div className="min-h-screen bg-background">
      <Header variant={isAuthPage ? 'auth' : 'landing'} />
      <Outlet />
    </div>
  )
}
