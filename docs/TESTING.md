# Testing

## Prerequisites
- Backend: virtual environment with `pip install -r requirements-dev.txt`.
- Frontend: `npm install`.
- No API keys needed. All automated tests run in demo mode or with mocked providers.

## Commands

Backend (from `backend/` with the venv active):
```bash
python -m pytest -q          # tests
ruff check . && ruff format --check .   # lint + formatting
```

Frontend (from `frontend/`):
```bash
npm test            # Vitest + Testing Library (jsdom)
npm run lint        # oxlint
npm run typecheck   # tsc -b --noEmit
npm run build       # production build
```

## Coverage

### Backend (`backend/tests`, 23 tests)
| Area | Test |
|---|---|
| Health endpoint | demo mode; gemini without key → demo; placeholder key → demo |
| Public profile | no email/phone leaked; assistant name |
| Input validation | empty, blank, missing message → 422; 1001 chars → 422; invalid history role → 422 |
| Demo mode | all five assessment questions contain the expected CV facts |
| Technical follow-up | churn project answer includes ROC-AUC 0.842 and Logistic Regression |
| Unknown personal question | salary → honest "not covered" |
| Unknown metric | UPI transaction volume → no invented figure, only "2 clients" |
| Invented employer | "Did you work at Google?" → not claimed |
| Provider contract | fake provider receives system prompt with candidate facts; history trimmed to `MAX_HISTORY_MESSAGES` |
| Provider failure | `ProviderError` → 200 with demo fallback |
| Provider timeout | `httpx.ReadTimeout` → 200 with demo fallback |
| Rate limiting | 4th request in a 3-request window → 429 |
| CORS | preflight from allowed origin returns the matching header |
| Consistency | same turnaround figure appears across two related answers |

### Frontend (`frontend/tests`, 11 tests)
| Area | Test |
|---|---|
| Rendering | landing page heading, start interview, empty state, demo badge from health |
| Voice fallback | no `SpeechRecognition` → notice shown, voice button hidden |
| Typed submission | question appears, answer rendered, demo label, request body shape |
| Suggested questions | chip click sends and renders answer |
| Error state | 429 → alert with message; Retry recovers and clears alert |
| Backend down | health 503 → banner |
| Reset | confirmation dialog, conversation cleared |
| Keyboard | Enter on focused Start button; Enter in textarea sends |
| Speech hook | unsupported detection; final transcript delivered; `not-allowed` → denied + message |

## AI-provider mocking
Backend tests use `FakeProvider` (`tests/conftest.py`), which records calls and can be told to fail. The timeout test monkeypatches `httpx.AsyncClient`. Frontend tests mock `globalThis.fetch`. **No test contacts Gemini or OpenAI.**

## What is not automated
- Real speech recognition and synthesis (jsdom has neither). Verified manually in Chromium; CI only checks the fallback and the hook's event handling with a fake recognizer.
- Live provider answers: quality of Gemini/OpenAI responses must be checked manually once a key is configured (`AI_PROVIDER=gemini`, then ask the five questions).
- Deployment: see [DEPLOYMENT.md](DEPLOYMENT.md) for the manual verification checklist.

## Results at hand-off (Oct 28, 2026, Linux container)
- `python -m pytest -q` → **23 passed**
- `ruff check .` → All checks passed
- `npm run lint` → 0 warnings, 0 errors
- `npm run typecheck` → clean
- `npm test` → **11 passed**
- `npm run build` → built (≈236 kB JS, 17 kB CSS)
- Manual: backend started with uvicorn; `/api/health` and `/api/chat` answered; headless Chromium loaded the production build at desktop (1280×800) and mobile (390×844) sizes, submitted a typed question and rendered the demo answer with the Demo mode badge.
