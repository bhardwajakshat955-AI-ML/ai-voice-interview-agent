import { useEffect, useRef } from 'react'
import type { ChatMessage } from '../types/chat'
import { CANDIDATE_NAME } from '../config/app'

export function MessageList({ messages, busy }: { messages: ChatMessage[]; busy: boolean }) {
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length, busy])

  if (messages.length === 0 && !busy) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <p className="font-display text-2xl text-ink">Ask me anything about my work.</p>
        <p className="mt-2 max-w-md text-sm text-ink-soft">
          Use the microphone or type below. Try one of the starter questions to begin.
        </p>
      </div>
    )
  }

  return (
    <ol className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-6 sm:px-6" aria-label="Conversation">
      {messages.map((m) => (
        <li key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div
            className={`max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed sm:max-w-[75%] ${
              m.role === 'user' ? 'rounded-br-sm bg-pine text-white' : 'rounded-bl-sm border border-line bg-panel text-ink'
            }`}
          >
            <span className="sr-only">{m.role === 'user' ? 'You asked:' : `${CANDIDATE_NAME} answered:`}</span>
            <p className="whitespace-pre-wrap">{m.content}</p>
            {m.role === 'assistant' && m.demoMode ? (
              <p className="mt-2 text-xs text-ink-soft">Demo answer · prepared from the CV, no live AI model</p>
            ) : null}
          </div>
        </li>
      ))}
      {busy ? (
        <li className="flex justify-start" aria-hidden="true">
          <div className="rounded-2xl rounded-bl-sm border border-line bg-panel px-4 py-3 text-sm text-ink-soft">Thinking…</div>
        </li>
      ) : null}
      <div ref={endRef} />
    </ol>
  )
}
