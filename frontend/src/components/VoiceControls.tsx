import { Button } from './Button'

interface Props {
  micSupported: boolean
  ttsSupported: boolean
  listening: boolean
  speaking: boolean
  muted: boolean
  canReplay: boolean
  busy: boolean
  onStartListening: () => void
  onStopListening: () => void
  onStopSpeaking: () => void
  onReplay: () => void
  onToggleMute: () => void
}

export function VoiceControls(p: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Voice controls">
      {p.micSupported ? (
        p.listening ? (
          <Button variant="danger" onClick={p.onStopListening} aria-pressed="true">
            Stop listening
          </Button>
        ) : (
          <Button variant="secondary" onClick={p.onStartListening} disabled={p.busy} aria-label="Ask by voice">
            <span aria-hidden="true">🎙</span> Ask by voice
          </Button>
        )
      ) : (
        <span className="text-xs text-ink-soft">Voice input isn’t available in this browser; typing works everywhere.</span>
      )}
      {p.ttsSupported ? (
        <>
          {p.speaking ? (
            <Button variant="secondary" onClick={p.onStopSpeaking}>
              Stop audio
            </Button>
          ) : (
            <Button variant="ghost" onClick={p.onReplay} disabled={!p.canReplay || p.muted}>
              Replay answer
            </Button>
          )}
          <Button variant="ghost" onClick={p.onToggleMute} aria-pressed={p.muted}>
            {p.muted ? 'Unmute voice' : 'Mute voice'}
          </Button>
        </>
      ) : null}
    </div>
  )
}
