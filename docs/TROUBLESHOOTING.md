# Troubleshooting

## Python / Node versions
- `SyntaxError` or `TypeError: unsupported operand type(s) for |` on backend start → Python < 3.10. Install 3.12 and recreate the venv.
- `npm ERR! engine` or Vite refuses to start → Node < 20. Install Node 22 LTS.

## Dependency installation
- `pip install` fails building wheels → upgrade pip (`python -m pip install --upgrade pip`) and ensure you're inside the venv.
- `npm install` network/permission errors → delete `node_modules` and `package-lock.json`? No: keep the lockfile; run `npm ci` instead.

## Virtual environment activation
- PowerShell: "running scripts is disabled" → `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process` then activate again.
- `.venv\Scripts\activate.bat` not found → the venv wasn't created; run `py -m venv .venv` from `backend/`.
- Prompt doesn't show `(.venv)` → activation didn't run in this terminal.

## Port conflicts
- Backend: `--port 8001`; frontend: `npm run dev -- --port 5174`. Update `VITE_API_BASE_URL` / `CORS_ORIGINS` to match.

## CORS errors
Browser console says "blocked by CORS policy": the frontend origin is not in `CORS_ORIGINS`. Match scheme + host + port exactly, no trailing slash, restart the backend.

## Missing or invalid API key
- Badge shows Demo mode although you set a key → the key starts with `your-` (placeholder), is empty, or `AI_PROVIDER` is still `demo`. Restart the backend after editing `.env`.
- Answers flip to demo with a live key → the provider returned an error (bad key, wrong model name, quota). Check backend logs for `provider failed`.

## Provider rate limits and timeouts
The backend falls back to a demo answer and logs a warning. Lower traffic, raise `PROVIDER_TIMEOUT_SECONDS` (within host limits), or switch model.

## Microphone
- Button missing → browser has no speech recognition (Firefox) or the page is not on HTTPS/localhost.
- "Microphone access was blocked" → site-info (padlock) → Microphone → Allow → reload.
- "No speech detected" → speak sooner after pressing the button; check input device.

## Speech recognition incompatibility
Supported: Chrome, Edge, Safari (desktop and iOS 14.5+). Not supported: Firefox. Typing works everywhere.

## Deployment / environment variables
- Vite variables must start with `VITE_` and are baked in at build time: redeploy after changing them.
- Render sleeps on the free tier; first request is slow.
- Health OK but chat 500 → check backend logs; the error body never contains details by design.
