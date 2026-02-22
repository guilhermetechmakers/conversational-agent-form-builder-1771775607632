const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

export interface ApiError {
  message: string
  code?: string
  status?: number
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = {
      message: response.statusText,
      status: response.status,
    }
    try {
      const data = await response.json()
      error.message = data.message ?? data.error ?? response.statusText
      error.code = data.code
    } catch {
      // Use default error message
    }
    throw error
  }

  const contentType = response.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    return response.json() as Promise<T>
  }
  return response.text() as unknown as Promise<T>
}

export async function apiGet<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  return handleResponse<T>(response)
}

export async function apiPost<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  return handleResponse<T>(response)
}

export async function apiPut<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  return handleResponse<T>(response)
}

export async function apiDelete<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  return handleResponse<T>(response)
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export interface ChatOrchestratorRequest {
  action: 'get_config' | 'send_message'
  agentId: string
  sessionId?: string
  message?: string
  collectedFields?: Record<string, string | number | null>
}

export interface ChatOrchestratorResponse {
  config?: unknown
  assistantMessage?: string
  updatedFields?: Record<string, string | number | null>
  error?: string
}

export async function invokeChatOrchestrator(
  body: ChatOrchestratorRequest
): Promise<ChatOrchestratorResponse> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase not configured')
  }
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/agent-chat-orchestrator`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(body),
    }
  )
  return handleResponse<ChatOrchestratorResponse>(response)
}
