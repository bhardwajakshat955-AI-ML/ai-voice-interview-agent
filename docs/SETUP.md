# Setup

## Prerequisites

| Tool | Version | Check |
|---|---|---|
| Node.js | 20 or newer (22 recommended) | `node -v` |
| npm | 10+ (ships with Node) | `npm -v` |
| Python | 3.11 or newer (3.12 recommended) | `python --version` (Windows: `py --version`) |
| Git | any recent | `git --version` |

A Gemini or OpenAI API key is optional; without one the app runs in demo mode.

## 1. Clone

```bash
git clone <your-repository-url>
cd 100x-ai-voice-interview-agent
```

## 2. Backend

### Windows PowerShell
```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements-dev.txt
Copy-Item .env.example .env
python -m uvicorn app.main:app --reload
```
If PowerShell refuses to run `Activate.ps1` ("running scripts is disabled"), allow scripts for the current process only (no system-wide change):
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
.\.venv\Scripts\Activate.ps1
```
or use Command Prompt instead.

### Windows Command Prompt
```cmd
cd backend
py -m venv .venv
.venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements-dev.txt
copy .env.example .env
python -m uvicorn app.main:app --reload
```

### macOS / Linux
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements-dev.txt
cp .env.example .env
python -m uvicorn app.main:app --reload
```

Expected output:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process ...
INFO app: Starting Personal AI Assistant API v1.0.0 with provider=demo
INFO:     Application startup complete.
```

Verify: open http://127.0.0.1:8000/api/health → `{"status":"ok",...,"provider":"demo","demo_mode":true}`. API docs: http://127.0.0.1:8000/docs.

`requirements.txt` holds runtime dependencies only; `requirements-dev.txt` adds pytest and ruff.

## 3. Frontend (second terminal)

All platforms:
```bash
cd frontend
npm install
```
Create the env file:
- PowerShell: `Copy-Item .env.example .env.local`
- Command Prompt: `copy .env.example .env.local`
- macOS/Linux: `cp .env.example .env.local`

Then:
```bash
npm run dev
```
Expected output:
```
  VITE v8.x.x  ready in ... ms
  ➜  Local:   http://localhost:5173/
```
Open http://localhost:5173.

## Environment variables

### backend/.env
| Variable | Default | Meaning |
|---|---|---|
| `AI_PROVIDER` | `demo` | `demo`, `gemini` or `openai` |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | — / `gemini-2.0-flash` | Used when provider is `gemini` |
| `OPENAI_API_KEY` / `OPENAI_MODEL` | — / `gpt-4o-mini` | Used when provider is `openai` |
| `CORS_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | Comma-separated allowed origins |
| `MAX_MESSAGE_CHARS` | `1000` | Max question length |
| `MAX_HISTORY_MESSAGES` | `10` | Messages of history sent to the model |
| `PROVIDER_TIMEOUT_SECONDS` | `20` | Upstream timeout |
| `RATE_LIMIT_REQUESTS` / `RATE_LIMIT_WINDOW_SECONDS` | `30` / `60` | Per-IP rate limit |
| `ENABLE_DOCS` | `true` | Expose `/docs` |

A placeholder key (starting with `your-`) or an empty key automatically falls back to demo mode.

### frontend/.env.local
| Variable | Default | Meaning |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Backend URL, no trailing slash |

## Troubleshooting startup
- `ModuleNotFoundError: No module named 'app'` → run uvicorn from inside `backend/`.
- `Address already in use` → `python -m uvicorn app.main:app --reload --port 8001` and set `VITE_API_BASE_URL=http://localhost:8001`.
- Frontend shows "interview service is unreachable" → backend not running or `VITE_API_BASE_URL` wrong; restart `npm run dev` after editing `.env.local`.
- See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for more.
