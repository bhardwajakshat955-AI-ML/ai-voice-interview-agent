import { Button } from '../components/Button'
import { APP_NAME, CANDIDATE_HEADLINE, CANDIDATE_NAME, SUGGESTED_QUESTIONS } from '../config/app'

export function LandingPage({ onStart }: { onStart: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-10 sm:px-10">
      <header className="flex items-center justify-between">
        <span className="text-sm font-medium text-pine">{APP_NAME}</span>
        <span className="text-xs text-ink-soft">100x recruitment assessment</span>
      </header>

      <section className="flex flex-1 flex-col justify-center py-16">
        <p className="text-sm text-ink-soft">Interview an AI twin of</p>
        <h1 className="mt-2 font-display text-5xl leading-[1.05] text-ink sm:text-7xl">{CANDIDATE_NAME}</h1>
        <p className="mt-4 text-lg text-ink-soft">{CANDIDATE_HEADLINE}</p>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-ink">
          Ask interview questions out loud or by typing. Answers come in my own voice, grounded only in my verified CV: my
          work at CARD91 and Dronagarden, my churn-prediction and credit-risk projects, and my M.Tech at IIT Patna. If I
          don’t know something, I’ll say so rather than make it up.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button size="lg" onClick={onStart} autoFocus>
            Start interview
          </Button>
          <span className="text-sm text-ink-soft">No login. No install. Works best in Chrome or Edge for voice.</span>
        </div>
      </section>

      <section aria-labelledby="starters" className="border-t border-line pt-8">
        <h2 id="starters" className="text-sm font-medium text-ink">
          Questions you can start with
        </h2>
        <ul className="mt-4 grid gap-x-8 gap-y-2 text-sm text-ink-soft sm:grid-cols-2">
          {SUGGESTED_QUESTIONS.slice(0, 6).map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>
      </section>

      <footer className="mt-10 text-xs text-ink-soft">
        Speech recognition and playback happen in your browser. Your questions are sent to this app’s backend to generate
        answers and are not stored.
      </footer>
    </main>
  )
}
