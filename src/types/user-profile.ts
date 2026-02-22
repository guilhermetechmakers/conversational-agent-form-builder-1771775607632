export interface UserProfile {
  id: string
  user_id: string
  title: string
  description?: string
  status: string
  created_at: string
  updated_at: string
}

export interface UserProfileExtended {
  id: string
  user_id: string
  name: string
  email: string
  avatar_url?: string
  timezone: string
  language: string
  title?: string
  description?: string
  status: string
  created_at: string
  updated_at: string
}

export interface ApiKey {
  id: string
  name: string
  prefix: string
  scopes: string[]
  last_used_at?: string
  created_at: string
}

export interface TeamMember {
  id: string
  email: string
  name?: string
  role: 'admin' | 'member' | 'viewer'
  status: 'active' | 'pending'
  invited_at: string
}

export interface ActiveSession {
  id: string
  device: string
  location?: string
  last_active: string
  current: boolean
}

export interface BillingPlan {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  features: string[]
  current?: boolean
}
