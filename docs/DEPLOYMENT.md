# Deployment

## Architecture
- **Frontend** → Vercel (static Vite build). Any static host works (Netlify, GitHub Pages, Cloudflare Pages).
- **Backend** → Render (Python web service). Railway, Fly.io or any host that runs `uvicorn` also works.
- Browser ↔ Vercel (static files); browser ↔ Render (`/api/*` over HTTPS). Voice runs in the browser; HTTPS is required for microphone access.

No deployment has been performed from this repository yet; there is no live URL to report. Follow the steps and verify before announcing one.

## Backend on Render
1. New → Web Service → connect the GitHub repository.
2. Settings:
   - Root directory: `backend`
   - Runtime: Python 3.12
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Health check path: `/api/health`
3. Environment variables (Render dashboard, never in code):
   - `AI_PROVIDER=gemini` (or `openai`, or `demo`)
   - `GEMINI_API_KEY=...` (or `OPENAI_API_KEY=...`)
   - `CORS_ORIGINS=https://<your-vercel-app>.vercel.app` (add custom domains comma-separated; no trailing slash)
   - `ENABLE_DOCS=false` (optional for production)
4. Deploy and note the service URL, e.g. `https://personal-ai-assistant-api.onrender.com`.

Free Render instances sleep after inactivity; the first request may take ~30–60 s. The frontend shows the "unreachable" banner only if the health request fails outright, so consider a paid instance or an uptime pinger for interviews.

## Frontend on Vercel
1. New Project → import the repository.
2. Settings:
   - Root directory: `frontend`
   - Framework preset: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
3. Environment variable: `VITE_API_BASE_URL=https://<your-render-service>.onrender.com`
4. Deploy. Then go back to Render and make sure `CORS_ORIGINS` contains the exact Vercel URL; redeploy the backend if you changed it.

## Live verification checklist
1. `curl https://<backend>/api/health` → `status: ok`, expected `provider`.
2. Open the Vercel URL in Chrome; press Start interview; the Demo mode badge should be absent if a provider key is set.
3. Type "What's your number one superpower?" → answer returned and spoken.
4. Press Ask by voice, allow the microphone, ask a question → transcript appears and is answered.
5. Open DevTools → Network: `/api/chat` returns 200 with no CORS error.
6. Try a 429 by sending many requests quickly (optional) and confirm a friendly message.
7. Test on a phone over HTTPS.

## Troubleshooting
- **CORS error in console** → `CORS_ORIGINS` on the backend does not exactly match the frontend origin (scheme, host, no trailing slash).
- **Health works but chat always demo** → key is a placeholder or missing; check `AI_PROVIDER` and the key variable; restart the service.
- **502 / timeout on Render** → check logs; `PROVIDER_TIMEOUT_SECONDS` must be under the host's request timeout.
- **Build fails on Vercel** → ensure Node 20+ (set `engines` is present in `package.json`; set Node version in project settings if needed).
- **Microphone button missing in production** → site is not HTTPS, or browser lacks speech recognition.
