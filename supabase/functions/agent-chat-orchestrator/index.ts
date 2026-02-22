// Supabase Edge Function: Agent Chat Orchestrator
// Handles LLM requests, validation, and session state updates.
// Client invokes via: supabase.functions.invoke('agent-chat-orchestrator', { body: {...} })

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { action, agentId, sessionId, message, collectedFields } = body ?? {}

    // Validate request
    if (!agentId) {
      return new Response(
        JSON.stringify({ error: 'agentId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    switch (action) {
      case 'get_config':
        // Fetch agent config from DB
        return new Response(
          JSON.stringify({ config: {} }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      case 'send_message':
        // Process user message, call LLM, return assistant response
        return new Response(
          JSON.stringify({
            assistantMessage: 'Thanks for your message. How can I help?',
            updatedFields: {},
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
