import { useParams } from 'react-router-dom'
import { useState, useCallback } from 'react'
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
        await new Promise((r) => setTimeout(r, 800))
        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Thanks for sharing! I've noted "${text}". What's your email address?`,
          timestamp: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, assistantMsg])
        setCollectedFields((prev) => ({ ...prev, name: text }))
      } catch {
        setValidationError('Something went wrong. Please try again.')
      } finally {
        setIsTyping(false)
      }
    },
    [agent]
  )

  const handleRetry = useCallback(() => {
    setIsOffline(false)
    setValidationError(null)
    refetch()
  }, [refetch])

  if (isLoading && !agent) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Skeleton className="h-16 w-full" />
        <div className="container mx-auto flex max-w-2xl flex-1 flex-col gap-4 p-4">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (isError && !agent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="max-w-md text-center">
          <h2 className="font-semibold text-xl">Could not load agent</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 text-sm font-medium text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <h2 className="font-semibold text-xl">Agent not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">This agent may have been removed.</p>
      </div>
    )
  }

  if (useFormFallback) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="container mx-auto flex max-w-xl flex-1 flex-col gap-6 p-4 py-8">
          <h1 className="font-bold text-2xl">Basic form</h1>
          <p className="text-muted-foreground">
            Chat is unavailable. Please fill out the form below.
          </p>
          <form className="space-y-4 rounded-xl border border-border bg-card p-6">
            {fields.map((f) => (
              <div key={f.id} className="space-y-2">
                <label htmlFor={f.key} className="text-sm font-medium">
                  {f.label} {f.required && '*'}
                </label>
                {f.type === 'select' ? (
                  <select
                    id={f.key}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select...</option>
                    {f.options?.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={f.key}
                    type={f.type}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    required={f.required}
                  />
                )}
              </div>
            ))}
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
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
      <div className="flex min-h-screen flex-col bg-background">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
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

  const currentField = fields.find((f) => !collectedFields[f.key])
  const quickReplies = currentField?.type === 'select' ? currentField.options ?? [] : []
  const smartPrompts = currentField
    ? [{ id: '1', text: `I'd like to share my ${currentField.label.toLowerCase()}` }]
    : []

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div className="container mx-auto flex max-w-2xl flex-1 flex-col gap-4 p-4">
        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300">
          <AssistantAvatarHeader agent={agent} />

          <div className="flex flex-1 flex-col overflow-hidden">
            {isOffline ? (
              <div className="flex-1 p-4">
                <OfflineFallback
                  onRetry={handleRetry}
                  onUseFormFallback={() => setUseFormFallback(true)}
                />
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-hidden">
                  <ChatWindow
                    messages={messages}
                    isTyping={isTyping}
                  />
                </div>

                <div className="space-y-2 border-t border-border p-4">
                  {validationError && (
                    <ErrorValidationFeedback
                      message={validationError}
                      onRetry={handleRetry}
                    />
                  )}
                  {fields.length > 0 && (
                    <ProgressIndicator
                      progress={sessionState.progress}
                      totalSteps={fields.length}
                      completedSteps={fields.length - sessionState.remainingFields.length}
                    />
                  )}
                  <SessionStatePanel sessionState={sessionState} />
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
        </div>
      </div>
    </div>
  )
}
