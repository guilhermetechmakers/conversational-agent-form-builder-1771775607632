import { createBrowserRouter, Navigate } from 'react-router-dom'
import { PublicLayout } from '@/components/layout/public-layout'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

// Lazy load pages for code splitting
import { LandingPage, LandingErrorState } from '@/pages/landing'
import { LoginPage } from '@/pages/auth/login'
import { SignupPage } from '@/pages/auth/signup'
import { PasswordResetPage } from '@/pages/auth/password-reset'
import { EmailVerificationPage } from '@/pages/auth/email-verification'
import { DashboardPage } from '@/pages/dashboard'
import { AgentsPage } from '@/pages/dashboard/agents'
import { AgentBuilderPage } from '@/pages/dashboard/agent-builder'
import { SessionsPage } from '@/pages/dashboard/sessions'
import { SessionDetailsPage } from '@/pages/dashboard/session-details'
import { IntegrationsPage } from '@/pages/dashboard/integrations'
import { ContentPage } from '@/pages/dashboard/content'
import { SettingsPage } from '@/pages/dashboard/settings'
import { ProfilePage } from '@/pages/dashboard/profile'
import { UserProfilePage } from '@/pages/UserProfile'
import { PublicChatPage } from '@/pages/chat'
import { AgentPublicChatVisitorViewPage } from '@/pages/AgentPublicChatVisitorView'
import { PricingPage } from '@/pages/pricing'
import { AboutPage } from '@/pages/about'
import { NotFoundPage } from '@/pages/not-found'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
        errorElement: <LandingErrorState onRetry={() => window.location.reload()} />,
      },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      { path: 'password-reset', element: <PasswordResetPage /> },
      { path: 'verify-email', element: <EmailVerificationPage /> },
      { path: 'pricing', element: <PricingPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'chat/:agentId', element: <PublicChatPage /> },
      { path: 'agent-public-chat-visitor-view', element: <AgentPublicChatVisitorViewPage /> },
      { path: 'agent-public-chat-visitor-view/:agentId', element: <AgentPublicChatVisitorViewPage /> },
      { path: 'agent-public-chat-(visitor-view)', element: <AgentPublicChatVisitorViewPage /> },
      { path: 'agent-public-chat-(visitor-view)/:agentId', element: <AgentPublicChatVisitorViewPage /> },
    ],
  },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'agents', element: <AgentsPage /> },
      { path: 'agents/new', element: <AgentBuilderPage /> },
      { path: 'agents/:agentId', element: <AgentBuilderPage /> },
      { path: 'sessions', element: <SessionsPage /> },
      { path: 'sessions/:sessionId', element: <SessionDetailsPage /> },
      { path: 'integrations', element: <IntegrationsPage /> },
      { path: 'content', element: <ContentPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'user-profile', element: <UserProfilePage /> },
    ],
  },
  { path: '/404', element: <NotFoundPage /> },
  { path: '*', element: <Navigate to="/404" replace /> },
])
