import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useSpeechRecognition } from '../src/hooks/useSpeechRecognition'

class FakeRecognition {
  static instances: FakeRecognition[] = []
  lang = ''
  interimResults = false
  continuous = false
  maxAlternatives = 1
  onresult: ((e: unknown) => void) | null = null
  onerror: ((e: { error: string }) => void) | null = null
  onend: (() => void) | null = null
  start = vi.fn()
  stop = vi.fn(() => this.onend?.())
  abort = vi.fn()
  constructor() {
    FakeRecognition.instances.push(this)
  }
}

describe('useSpeechRecognition', () => {
  it('reports unsupported without the API', () => {
    const { result } = renderHook(() => useSpeechRecognition(() => {}))
    expect(result.current.supported).toBe(false)
  })

  it('delivers the final transcript and marks permission granted', () => {
    ;(window as unknown as { SpeechRecognition: unknown }).SpeechRecognition = FakeRecognition
    const onFinal = vi.fn()
    const { result } = renderHook(() => useSpeechRecognition(onFinal))
    expect(result.current.supported).toBe(true)
    act(() => result.current.start())
    const rec = FakeRecognition.instances.at(-1)!
    expect(result.current.listening).toBe(true)
    act(() => {
      rec.onresult?.({ resultIndex: 0, results: [{ 0: { transcript: 'tell me your story' }, isFinal: true }] })
      rec.onend?.()
    })
    expect(onFinal).toHaveBeenCalledWith('tell me your story')
    expect(result.current.permission).toBe('granted')
    delete (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition
  })

  it('surfaces a helpful error when the microphone is denied', () => {
    ;(window as unknown as { SpeechRecognition: unknown }).SpeechRecognition = FakeRecognition
    const { result } = renderHook(() => useSpeechRecognition(() => {}))
    act(() => result.current.start())
    act(() => FakeRecognition.instances.at(-1)!.onerror?.({ error: 'not-allowed' }))
    expect(result.current.permission).toBe('denied')
    expect(result.current.error).toMatch(/Microphone access was blocked/)
    expect(result.current.listening).toBe(false)
    delete (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition
  })
})
