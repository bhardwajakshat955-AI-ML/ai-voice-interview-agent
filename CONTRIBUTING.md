# Contributing

## Prerequisites
- Node.js 20+ (22 recommended) and npm
- Python 3.11+ (3.12 recommended)
- Git

## Development setup
Follow [docs/SETUP.md](docs/SETUP.md). In short: create `backend/.venv`, install `requirements-dev.txt`,
run `npm install` in `frontend/`, copy both `.env.example` files, and start the two servers.

## Branch naming
- `feat/<short-description>` for features
- `fix/<short-description>` for bug fixes
- `docs/<short-description>` for documentation

Branch from `main` and open a pull request back into `main`.

## Code style
- Frontend: TypeScript strict mode; `npm run lint` (oxlint) and `npm run typecheck` must pass.
- Backend: `ruff check .` and `ruff format .` must pass; type hints on public functions.
- Keep components small and accessible (labels, visible focus, keyboard support).

## Tests
- Frontend: `npm test` (Vitest + Testing Library). Mock `fetch`; never call a real AI provider in tests.
- Backend: `python -m pytest`. Use `FakeProvider` from `tests/conftest.py` instead of real API keys.
- Add or update tests for any behaviour you change.

## Pull requests
- Say what changed, why, and how you tested it.
- CI (`.github/workflows/ci.yml`) must be green.
- One concern per PR.

## Secrets
- Never commit `.env`, API keys, tokens, or personal documents (CVs, IDs).
- Only `.env.example` files with placeholder values are tracked.
- If a secret is committed by mistake, rotate it immediately.

## Candidate profile changes
All candidate facts live in `backend/app/knowledge/candidate_profile.py`. Only add facts verifiable from
the CV; never add metrics or experience that cannot be substantiated.
