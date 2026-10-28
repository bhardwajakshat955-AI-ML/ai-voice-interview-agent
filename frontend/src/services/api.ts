import { API_BASE_URL, MAX_HISTORY_SENT } from '../config/app'
import type { ChatMessage, ChatResponse, HealthResponse } from '../types/chat'

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function parseError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { detail?: string }
    if (typeof body.detail === 'string') return body.detail
  } catch {
    /* ignore */
  }
  if (res.status === 429) return 'Too many requests. Please wait a moment and try again.'
  return `Request failed (${res.status}).`
}

export async function fetchHealth(signal?: AbortSignal): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/health`, { signal })
  if (!res.ok) throw new ApiError(await parseError(res), res.status)
  return (await res.json()) as HealthResponse
}

export async function sendChat(message: string, history: ChatMessage[], signal?: AbortSignal): Promise<ChatResponse> {
  const trimmed = history.slice(-MAX_HISTORY_SENT).map((m) => ({ role: m.role, content: m.content }))
  const res = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history: trimmed }),
    signal,
  })
  if (!res.ok) throw new ApiError(await parseError(res), res.status)
  return (await res.json()) as ChatResponse
}
