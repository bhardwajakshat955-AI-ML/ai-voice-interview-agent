import { SUGGESTED_QUESTIONS } from '../config/app'

export function SuggestedQuestions({ onPick, disabled }: { onPick: (q: string) => void; disabled: boolean }) {
  return (
    <nav aria-label="Suggested questions" className="px-4 pb-3 sm:px-6">
      <ul className="flex gap-2 overflow-x-auto pb-1">
        {SUGGESTED_QUESTIONS.map((q) => (
          <li key={q} className="shrink-0">
            <button
              type="button"
              disabled={disabled}
              onClick={() => onPick(q)}
              className="rounded-full border border-line bg-panel px-3 py-1.5 text-xs text-ink-soft transition-colors hover:border-pine hover:text-ink disabled:opacity-50"
            >
              {q}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
