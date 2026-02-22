import { useParams } from 'react-router-dom'
import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import {
  AssistantAvatarHeader,
  ChatWindow,
  ConsentPrivacyCheckbox,
  ErrorValidationFeedback,
  InputArea,
  OfflineFallback,
  ProgressIndicator,
  SendButtonSmartPrompts,
  SessionStatePanel,
} from '@/components/agent-public-chat-visitor-view'
import { useAgentConfig } from '@/hooks/use-agent-public-chat'
import { Skeleton } from '@/components/ui/skeleton'
import { invokeChatOrchestrator } from '@/lib/api'
import type { ChatMessage, FieldConfig, SessionState } from '@/types/agent-public-chat'

function buildSessionState(
  collected: Record<string, string | number | File | null>,
  fields: FieldConfig[]
): SessionState {
  const remaining = fields
    .filter((f) => !collected[f.key] || collected[f.key] === '')
    .map((f) => f.label)
  const total = fields.length
  const completed = total - remaining.length
  const progress = total > 0 ? (completed / total) * 100 : 0
  return {
    collectedFields: collected,
    remainingFields: remaining,
    progress,
  }
}

export function AgentPublicChatVisitorViewPage() {
  const { agentId } = useParams<{ agentId: string }>()
  const id = agentId ?? 'demo'
  const { data: agentConfig, isLoading, isError, error, refetch } = useAgentConfig(id)

  const agent = agentConfig

  const [consentChecked, setConsentChecked] = useState(false)
  const [consentAccepted, setConsentAccepted] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isOffline, setIsOffline] = useState(false)
  const [collectedFields, setCollectedFields] = useState<Record<string, string | number | File | null>>({})
  const [useFormFallback, setUseFormFallback] = useState(false)

  const fields = agent?.requiredFields ?? []
  const currentField = fields.find((f) => !collectedFields[f.key])
  const sessionState = buildSessionState(collectedFields, fields)
  const needsConsent = agent?.consentRequired && !consentAccepted

  const handleSend = useCallback(
    async (text: string, file?: File) => {
      if (!agent) return

      setValidationError(null)

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: file ? `[File: ${file.name}]` : text,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, userMsg])

      setIsTyping(true)
      try {
        const supabaseConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)
        if (supabaseConfigured) {
          const fieldsToSend: Record<string, string | number | null> = {}
          for (const [k, v] of Object.entries(collectedFields)) {
            if (v !== null && typeof v !== 'object') fieldsToSend[k] = v
          }
          if (!file && currentField) fieldsToSend[currentField.key] = text
          const res = await invokeChatOrchestrator({
            action: 'send_message',
            agentId: agent.id,
            message: text,
            collectedFields: fieldsToSend,
          })
          if (res.error) throw new Error(res.error)
          const assistantContent = res.assistantMessage ?? 'Thanks for your message. How can I help?'
          const assistantMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: assistantContent,
            timestamp: new Date().toISOString(),
          }
          setMessages((prev) => [...prev, assistantMsg])
          if (res.updatedFields) {
            setCollectedFields((prev) => ({ ...prev, ...res.updatedFields }))
          } else if (currentField && !file) {
            setCollectedFields((prev) => ({ ...prev, [currentField.key]: text }))
          }
        } else {
          await new Promise((r) => setTimeout(r, 600))
          const nextField = fields.find((f) => !collectedFields[f.key] && f.key !== currentField?.key)
          const assistantContent = currentField
            ? nextField
              ? `Thanks! I've noted your ${currentField.label.toLowerCase()}. What's your ${nextField.label.toLowerCase()}?`
              : `Thanks for sharing your ${currentField.label.toLowerCase()}! Is there anything else you'd like to add?`
            : `Thanks for sharing! I've noted "${text}". ${fields[0] ? `What's your ${fields[0].label.toLowerCase()}?` : 'How can I help further?'}`
          const assistantMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: assistantContent,
            timestamp: new Date().toISOString(),
          }
          setMessages((prev) => [...prev, assistantMsg])
          if (currentField && !file) {
            setCollectedFields((prev) => ({ ...prev, [currentField.key]: text }))
          }
        }
      } catch (err) {
        const isNetworkError =
          err instanceof TypeError ||
          (err instanceof Error && (err.message.includes('fetch') || err.message.includes('network') || err.message.includes('Failed')))
        if (isNetworkError) {
          setIsOffline(true)
        } else {
          setValidationError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
        }
      } finally {
        setIsTyping(false)
      }
    },
    [agent, collectedFields, currentField, fields]
  )

  const handleRetry = useCallback(() => {
    setIsOffline(false)
    setValidationError(null)
    refetch()
  }, [refetch])

  if (isLoading && !agent) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-gray-50">
        <Skeleton className="h-16 w-full bg-gray-200 rounded-lg" />
        <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
          <div className="flex-1 p-4 space-y-4">
            <Skeleton className="h-6 w-3/4 bg-gray-200 rounded-lg" />
            <Skeleton className="h-6 w-1/2 bg-gray-200 rounded-lg" />
            <Skeleton className="h-6 max-w-md bg-gray-200 rounded-lg" />
          </div>
          <Skeleton className="hidden md:block w-64 min-h-0 flex-1 bg-gray-200 rounded-none" />
        </div>
      </div>
    )
  }

  if (isError && !agent) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-gray-50 items-center justify-center p-4">
        <div className="max-w-md text-center">
          <h2 className="font-semibold text-xl text-gray-600">Could not load agent</h2>
          <p className="mt-2 text-sm text-gray-500">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition ease-in-out duration-150"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-gray-50 items-center justify-center p-4">
        <h2 className="font-semibold text-xl text-gray-600">Agent not found</h2>
        <p className="mt-2 text-sm text-gray-500">This agent may have been removed.</p>
      </div>
    )
  }

  const handleFormFallbackSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      toast.success('Form submitted successfully. Thank you!')
      e.currentTarget.reset()
    },
    []
  )

  if (useFormFallback) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-gray-50">
        <div className="container mx-auto flex max-w-xl flex-1 flex-col gap-6 p-4 py-8">
          <h1 className="font-bold text-2xl text-gray-600">Basic form</h1>
          <p className="text-sm text-gray-500">
            Chat is unavailable. Please fill out the form below.
          </p>
          <form onSubmit={handleFormFallbackSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-card">
            {fields.map((f) => (
              <div key={f.id} className="space-y-2">
                <label htmlFor={f.key} className="text-sm font-medium">
                  {f.label} {f.required && '*'}
                </label>
                {f.type === 'select' ? (
                  <select
                    id={f.key}
                    name={f.key}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select...</option>
                    {f.options?.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={f.key}
                    name={f.key}
                    type={f.type}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                    required={f.required}
                  />
                )}
              </div>
            ))}
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all duration-200 hover:scale-[1.02] hover:bg-primary/90"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (needsConsent) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-gray-50">
        <div className="container mx-auto flex max-w-xl flex-1 flex-col items-center justify-center p-4">
          <ConsentPrivacyCheckbox
            consentText={agent.consentText ?? 'By continuing, you agree to our privacy policy.'}
            checked={consentChecked}
            onCheckedChange={setConsentChecked}
            onAccept={() => setConsentAccepted(true)}
          />
        </div>
      </div>
    )
  }

  const quickReplies = currentField?.type === 'select' ? currentField.options ?? [] : []
  const smartPrompts = currentField
    ? [{ id: '1', text: `I'd like to share my ${currentField.label.toLowerCase()}` }]
    : []

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="flex flex-col flex-1 overflow-hidden">
        <AssistantAvatarHeader agent={agent} />

        <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
          <div className="flex flex-1 flex-col overflow-hidden min-w-0">
            {isOffline ? (
              <div className="flex-1 flex items-center justify-center p-4 bg-white">
                <OfflineFallback
                  onRetry={handleRetry}
                  onUseFormFallback={() => setUseFormFallback(true)}
                />
              </div>
            ) : (
              <>
                <ChatWindow
                  messages={messages}
                  isTyping={isTyping}
                  agentName={agent.name}
                  agentAvatar={agent.avatar}
                  welcomeMessage={
                    agent.productHint
                      ? `Hi! I'm ${agent.name}. ${agent.productHint} Let's get started.`
                      : `Hi! I'm ${agent.name}. How can I help you today?`
                  }
                />

                <div className="flex flex-col bg-gray-100 border-t">
                  {validationError && (
                    <div className="p-2">
                      <ErrorValidationFeedback
                        message={validationError}
                        onRetry={handleRetry}
                      />
                    </div>
                  )}
                  {fields.length > 0 && (
                    <div className="px-4 py-2">
                      <ProgressIndicator
                        progress={sessionState.progress}
                        totalSteps={fields.length}
                        completedSteps={fields.length - sessionState.remainingFields.length}
                      />
                    </div>
                  )}
                  <SendButtonSmartPrompts
                    smartPrompts={smartPrompts}
                    onSelectPrompt={(t) => handleSend(t)}
                    disabled={isTyping}
                  />
                  <InputArea
                    onSend={handleSend}
                    quickReplies={quickReplies}
                    supportsFileUpload={currentField?.type === 'file'}
                    supportsVoice
                    disabled={isTyping}
                    placeholder={
                      currentField
                        ? `Enter your ${currentField.label.toLowerCase()}...`
                        : 'Type your message...'
                    }
                  />
                </div>
              </>
            )}
          </div>

          <SessionStatePanel sessionState={sessionState} fields={fields} />
        </div>

        <footer className="flex justify-center items-center p-2 bg-gray-100">
          <span className="text-xs text-gray-500">Conversational Agent</span>
        </footer>
      </div>
    </div>
  )
}

export default AgentPublicChatVisitorViewPage
