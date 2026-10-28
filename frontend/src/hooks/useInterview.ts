import { useCallback, useRef, useState } from 'react'
import { ApiError, sendChat } from '../services/api'
import type { ChatMessage, InterviewStatus } from '../types/chat'
import { MAX_MESSAGE_CHARS } from '../config/app'

const uid = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now() + Math.random()))

type SetStatus = (s: InterviewStatus) => void

export function useInterview(onAnswer?: (text: string, setStatus: SetStatus) => void) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [status, setStatus] = useState<InterviewStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [lastQuestion, setLastQuestion] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const ask = useCallback(
    async (raw: string) => {
      const question = raw.trim().slice(0, MAX_MESSAGE_CHARS)
      if (!question) return
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      setError(null)
      setLastQuestion(question)
      setStatus('processing')
      const userMsg: ChatMessage = { id: uid(), role: 'user', content: question }
      const historyBefore = messages
      setMessages((prev) => [...prev, userMsg])
      try {
        const res = await sendChat(question, historyBefore, controller.signal)
        const reply: ChatMessage = { id: uid(), role: 'assistant', content: res.answer, demoMode: res.demo_mode }
        setMessages((prev) => [...prev, reply])
        setStatus('idle')
        onAnswer?.(res.answer, setStatus)
      } catch (e) {
        if ((e as Error).name === 'AbortError') return
        const msg = e instanceof ApiError ? e.message : 'Could not reach the interview service. Check that the backend is running and try again.'
        setError(msg)
        setStatus('error')
      }
    },
    [messages, onAnswer],
  )

  const retry = useCallback(() => {
    if (!lastQuestion) return
    // Remove the dangling user message from the failed attempt before retrying.
    setMessages((prev) => (prev.length && prev[prev.length - 1].role === 'user' ? prev.slice(0, -1) : prev))
    void ask(lastQuestion)
  }, [ask, lastQuestion])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setMessages([])
    setError(null)
    setStatus('idle')
    setLastQuestion(null)
  }, [])

  return { messages, status, setStatus, error, ask, retry, reset }
}
