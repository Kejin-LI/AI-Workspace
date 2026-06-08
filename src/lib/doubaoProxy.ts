import { supabase } from './supabase'

interface DoubaoProxyOptions {
  input: any[]
  stream?: boolean
  tools?: Array<{ type: string }>
  reasoning?: { type?: 'enabled' | 'disabled', effort?: 'minimal' | 'low' | 'medium' | 'high' }
  signal?: AbortSignal
}

export async function callDoubaoProxy(opts: DoubaoProxyOptions): Promise<Response> {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!SUPABASE_URL) {
    throw new Error('VITE_SUPABASE_URL is not configured')
  }

  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token ?? SUPABASE_ANON_KEY

  return fetch(`${SUPABASE_URL}/functions/v1/doubao-proxy`, {
    method: 'POST',
    signal: opts.signal,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: opts.input,
      stream: opts.stream ?? true,
      tools: opts.tools,
      reasoning: opts.reasoning,
    }),
  })
}
