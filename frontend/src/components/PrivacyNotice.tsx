export function PrivacyNotice({ demoMode }: { demoMode: boolean | null }) {
  return (
    <p className="text-xs leading-relaxed text-ink-soft">
      Privacy: your questions are sent to this app’s own backend to generate an answer
      {demoMode === false ? ' and may be forwarded to a third-party AI provider' : ''}. Speech recognition and playback
      run in your browser; audio is never uploaded. Nothing is stored after you close this tab.
    </p>
  )
}
