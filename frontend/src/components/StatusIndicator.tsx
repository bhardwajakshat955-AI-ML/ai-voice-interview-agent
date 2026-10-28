import type { InterviewStatus } from '../types/chat'

const copy: Record<InterviewStatus, string> = {
  idle: 'Ready for your question',
  listening: 'Listening…',
  processing: 'Thinking…',
  speaking: 'Speaking',
  error: 'Something went wrong',
}

export function StatusIndicator({ status }: { status: InterviewStatus }) {
  const tone =
    status === 'listening' ? 'text-rose' : status === 'speaking' ? 'text-amber' : status === 'error' ? 'text-rose' : 'text-pine'
  return (
    <div className="flex items-center gap-3" role="status" aria-live="polite">
      <span className={`relative inline-flex h-3 w-3 ${tone}`}>
        <span className={`absolute inset-0 rounded-full bg-current ${status === 'listening' ? 'ring' : ''}`} />
      </span>
      {status === 'speaking' ? (
        <span className={`bars ${tone}`} aria-hidden="true">
          <span /><span /><span /><span />
        </span>
      ) : null}
      <span className="text-sm text-ink-soft">{copy[status]}</span>
    </div>
  )
}
