import { useCallback, useEffect, useState } from 'react'
import { Button } from '../components/Button'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { MessageList } from '../components/MessageList'
import { PrivacyNotice } from '../components/PrivacyNotice'
import { QuestionInput } from '../components/QuestionInput'
import { StatusIndicator } from '../components/StatusIndicator'
import { SuggestedQuestions } from '../components/SuggestedQuestions'
import { VoiceControls } from '../components/VoiceControls'
import { APP_NAME, CANDIDATE_NAME } from '../config/app'
import { useInterview } from '../hooks/useInterview'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import { fetchHealth } from '../services/api'

export function InterviewPage({ onExit }: { onExit: () => void }) {
  const tts = useSpeechSynthesis()
  const [confirmReset, setConfirmReset] = useState(false)
  const [demoMode, setDemoMode] = useState<boolean | null>(null)
  const [backendDown, setBackendDown] = useState(false)

  const interview = useInterview((answer, setStatusAfterAnswer) => {
    setStatusAfterAnswer('speaking')
    tts.speak(answer, () => setStatusAfterAnswer('idle'))
  })
  const { ask, status, setStatus } = interview

  const onVoiceFinal = useCallback((text: string) => void ask(text), [ask])
  const mic = useSpeechRecognition(onVoiceFinal)

  useEffect(() => {
    const c = new AbortController()
    fetchHealth(c.signal)
      .then((h) => {
        setDemoMode(h.demo_mode)
        setBackendDown(false)
      })
      .catch((e: Error) => {
        if (e.name !== 'AbortError') setBackendDown(true)
      })
    return () => c.abort()
  }, [])

  useEffect(() => {
    if (mic.listening) setStatus('listening')
    else if (status === 'listening') setStatus('idle')
  }, [mic.listening, status, setStatus])

  const busy = status === 'processing' || mic.listening
  const stopSpeaking = () => {
    tts.cancel()
    if (status === 'speaking') setStatus('idle')
  }
  const startListening = () => {
    stopSpeaking()
    mic.clearError()
    mic.start()
  }
  const doReset = () => {
    stopSpeaking()
    mic.stop()
    interview.reset()
    setConfirmReset(false)
  }

  return (
    <div className="mx-auto flex h-screen w-full max-w-3xl flex-col">
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-6">
        <div>
          <p className="text-sm font-medium text-pine">{APP_NAME}</p>
          <p className="text-xs text-ink-soft">Interviewing {CANDIDATE_NAME}</p>
        </div>
        <div className="flex items-center gap-2">
          {demoMode ? (
            <span className="whitespace-nowrap rounded-full bg-amber-wash px-2.5 py-1 text-xs font-medium text-amber" title="Answers are prepared from the CV; no live AI model is configured.">
              Demo mode
            </span>
          ) : null}
          <Button variant="ghost" size="sm" onClick={() => setConfirmReset(true)} disabled={interview.messages.length === 0}>
            Reset
          </Button>
          <Button variant="ghost" size="sm" onClick={onExit}>
            Exit
          </Button>
        </div>
      </header>

      {backendDown ? (
        <div role="alert" className="border-b border-rose/30 bg-rose-wash px-4 py-2 text-sm text-rose sm:px-6">
          The interview service is unreachable. Start the backend and reload this page.
        </div>
      ) : null}

      <MessageList messages={interview.messages} busy={status === 'processing'} />

      {mic.listening ? (
        <p className="px-4 pb-2 text-sm text-ink-soft sm:px-6" aria-live="polite">
          {mic.interim ? `“${mic.interim}”` : 'Listening… speak your question.'}
        </p>
      ) : null}

      {(interview.error || mic.error) && (
        <div role="alert" className="mx-4 mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-rose/30 bg-rose-wash px-4 py-3 text-sm text-rose sm:mx-6">
          <span>{interview.error ?? mic.error}</span>
          {interview.error ? (
            <Button variant="danger" size="sm" onClick={interview.retry}>
              Retry
            </Button>
          ) : (
            <Button variant="danger" size="sm" onClick={mic.clearError}>
              Dismiss
            </Button>
          )}
        </div>
      )}

      <SuggestedQuestions onPick={(q) => void ask(q)} disabled={busy} />

      <div className="border-t border-line bg-paper px-4 py-4 sm:px-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <StatusIndicator status={status} />
          <VoiceControls
            micSupported={mic.supported}
            ttsSupported={tts.supported}
            listening={mic.listening}
            speaking={tts.speaking}
            muted={tts.muted}
            canReplay={tts.hasLast()}
            busy={status === 'processing'}
            onStartListening={startListening}
            onStopListening={mic.stop}
            onStopSpeaking={stopSpeaking}
            onReplay={() => {
              setStatus('speaking')
              tts.replay()
            }}
            onToggleMute={tts.toggleMute}
          />
        </div>
        <QuestionInput onSubmit={(q) => void ask(q)} disabled={busy} />
        <div className="mt-3">
          <PrivacyNotice demoMode={demoMode} />
        </div>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Reset this conversation?"
        body="The current questions and answers will be cleared. Nothing is saved anywhere."
        confirmLabel="Reset conversation"
        onConfirm={doReset}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  )
}
