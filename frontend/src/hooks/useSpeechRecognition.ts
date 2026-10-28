import { useCallback, useEffect, useRef, useState } from 'react'

/* Minimal typings for the Web Speech API (not in lib.dom for all targets). */
interface SpeechRecognitionResultLike { 0: { transcript: string }; isFinal: boolean }
interface SpeechRecognitionEventLike { resultIndex: number; results: ArrayLike<SpeechRecognitionResultLike> }
interface SpeechRecognitionErrorLike { error: string }
interface SpeechRecognitionLike {
  lang: string
  interimResults: boolean
  continuous: boolean
  maxAlternatives: number
  onresult: ((e: SpeechRecognitionEventLike) => void) | null
  onerror: ((e: SpeechRecognitionErrorLike) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
  abort(): void
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike

function getCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export type MicPermission = 'unknown' | 'granted' | 'denied'

export function useSpeechRecognition(onFinal: (text: string) => void) {
  const [supported] = useState(() => getCtor() !== null)
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [permission, setPermission] = useState<MicPermission>('unknown')
  const recRef = useRef<SpeechRecognitionLike | null>(null)
  const onFinalRef = useRef(onFinal)
  useEffect(() => {
    onFinalRef.current = onFinal
  }, [onFinal])

  const stop = useCallback(() => {
    recRef.current?.stop()
    setListening(false)
    setInterim('')
  }, [])

  const start = useCallback(() => {
    const Ctor = getCtor()
    if (!Ctor) {
      setError('Voice input is not supported in this browser. Please type your question instead.')
      return
    }
    setError(null)
    const rec = new Ctor()
    rec.lang = 'en-US'
    rec.interimResults = true
    rec.continuous = false
    rec.maxAlternatives = 1
    let finalText = ''
    rec.onresult = (e) => {
      let interimText = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        if (r.isFinal) finalText += r[0].transcript
        else interimText += r[0].transcript
      }
      setInterim(interimText)
    }
    rec.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setPermission('denied')
        setError('Microphone access was blocked. Allow the microphone in your browser settings, or type your question.')
      } else if (e.error === 'no-speech') {
        setError('No speech detected. Try again and speak clearly.')
      } else if (e.error !== 'aborted') {
        setError('Voice input failed. You can retry or type your question.')
      }
      setListening(false)
    }
    rec.onend = () => {
      setListening(false)
      setInterim('')
      const text = finalText.trim()
      if (text) {
        setPermission('granted')
        onFinalRef.current(text)
      }
    }
    recRef.current = rec
    try {
      rec.start()
      setListening(true)
    } catch {
      setError('Could not start the microphone. Please retry.')
    }
  }, [])

  useEffect(() => () => recRef.current?.abort(), [])

  return { supported, listening, interim, error, permission, start, stop, clearError: () => setError(null) }
}
