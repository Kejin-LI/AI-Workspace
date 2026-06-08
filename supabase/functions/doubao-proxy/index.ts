import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const API_KEY = Deno.env.get('DOUBAO_API_KEY')
  const ENDPOINT_ID = Deno.env.get('DOUBAO_ENDPOINT_ID')
  if (!API_KEY || !ENDPOINT_ID) {
    return new Response(
      JSON.stringify({ error: 'Server misconfigured: missing DOUBAO_API_KEY or DOUBAO_ENDPOINT_ID' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }

  let body: { input?: unknown; stream?: boolean; tools?: unknown; reasoning?: unknown }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const useStream = body.stream !== false

  const upstream = await fetch('https://ark.cn-beijing.volces.com/api/v3/responses', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'ark-beta-doubao-app': 'true',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: ENDPOINT_ID,
      input: body.input,
      stream: useStream,
      ...(Array.isArray(body.tools) && body.tools.length > 0 ? { tools: body.tools } : {}),
      ...(body.reasoning && typeof body.reasoning === 'object' ? { reasoning: body.reasoning } : {}),
    }),
  })

  if (!useStream) {
    const text = await upstream.text()
    return new Response(text, {
      status: upstream.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
})
