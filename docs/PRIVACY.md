# Privacy

## What is processed
- The recruiter's question text (typed, or transcribed from speech by the browser).
- Up to the last 10 messages of the current session, sent with each request for context.
- The client IP address, kept in memory briefly for rate limiting.

## What goes to the AI provider
When `AI_PROVIDER` is `gemini` or `openai`, the backend sends the question, the trimmed history and a system prompt containing the candidate profile (CV facts, no contact details) to that provider over HTTPS. The provider's own privacy terms apply to that data. In demo mode nothing leaves the backend.

## Audio
Speech recognition uses the browser's Web Speech API. In Chrome this may use Google's speech service as part of the browser; the application itself never receives or uploads audio, only the resulting text. Speech synthesis runs locally.

## Storage and retention
- Frontend: conversation lives in React state; it is gone on reload, Reset, Exit or tab close. No cookies, localStorage or analytics.
- Backend: no database, no file writes. Standard request logs (method, path, status) may be kept by the hosting provider.

## Browser permissions
Only the microphone, and only when **Ask by voice** is pressed. Denying it leaves text input fully functional.

## Candidate data
The profile is derived from Akshat Bhardwaj's CV. Phone number and email are intentionally excluded from the code and the system prompt.

## Disabling the AI provider
Set `AI_PROVIDER=demo` (or remove the key) and restart the backend. The UI shows a Demo mode badge and no data is sent to third parties.
