export type Role = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: Role
  content: string
  demoMode?: boolean
}

export interface ChatResponse {
  answer: string
  provider: 'demo' | 'gemini' | 'openai'
  demo_mode: boolean
}

export interface HealthResponse {
  status: 'ok'
  app: string
  provider: 'demo' | 'gemini' | 'openai'
  demo_mode: boolean
  version: string
}

export type InterviewStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'error'
