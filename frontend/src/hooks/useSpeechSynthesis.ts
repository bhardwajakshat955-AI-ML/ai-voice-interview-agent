import { useCallback, useEffect, useRef, useState } from 'react'

export function useSpeechSynthesis() {
  const [supported] = useState(() => typeof window !== 'undefined' && 'speechSynthesis' in window)
  const [speaking, setSpeaking] = useState(false)
  const [muted, setMuted] = useState(false)
  const mutedRef = useRef(muted)
  useEffect(() => {
    mutedRef.current = muted
  }, [muted])
  const lastTextRef = useRef<string>('')

  const cancel = useCallback(() => {
    if (supported) window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [supported])

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      lastTextRef.current = text
      if (!supported || mutedRef.current) {
        onEnd?.()
        return
      }
      window.speechSynthesis.cancel()
      const utt = new SpeechSynthesisUtterance(text)
      utt.lang = 'en-US'
      utt.rate = 1
      utt.onstart = () => setSpeaking(true)
      utt.onend = () => {
        setSpeaking(false)
        onEnd?.()
      }
      utt.onerror = () => {
        setSpeaking(false)
        onEnd?.()
      }
      window.speechSynthesis.speak(utt)
    },
    [supported],
  )

  const replay = useCallback(() => {
    if (lastTextRef.current) speak(lastTextRef.current)
  }, [speak])

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      if (!m) cancel()
      return !m
    })
  }, [cancel])

  useEffect(() => () => cancel(), [cancel])

  return { supported, speaking, muted, speak, cancel, replay, toggleMute, hasLast: () => lastTextRef.current !== '' }
}
