import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { Button } from './Button'
import { MAX_MESSAGE_CHARS } from '../config/app'

export function QuestionInput({ onSubmit, disabled }: { onSubmit: (q: string) => void; disabled: boolean }) {
  const [value, setValue] = useState('')
  const submit = (e?: FormEvent) => {
    e?.preventDefault()
    const q = value.trim()
    if (!q || disabled) return
    onSubmit(q)
    setValue('')
  }
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }
  return (
    <form onSubmit={submit} className="flex items-end gap-2">
      <label htmlFor="question" className="sr-only">
        Type your question
      </label>
      <textarea
        id="question"
        value={value}
        onChange={(e) => setValue(e.target.value.slice(0, MAX_MESSAGE_CHARS))}
        onKeyDown={onKey}
        rows={1}
        placeholder="Type a question, then press Enter"
        maxLength={MAX_MESSAGE_CHARS}
        className="min-h-[44px] flex-1 resize-none rounded-2xl border border-line bg-panel px-4 py-2.5 text-[15px] text-ink placeholder:text-ink-soft/70 focus:border-pine"
      />
      <Button type="submit" disabled={disabled || !value.trim()} aria-label="Send question">
        Send
      </Button>
    </form>
  )
}
