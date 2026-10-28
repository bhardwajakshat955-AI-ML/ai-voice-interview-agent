# Git workflow

All commands are safe for beginners: none rewrite history or delete work.

## See what changed
```bash
git status          # modified / untracked files
git diff            # unstaged changes
git diff --cached   # staged changes (what the next commit will contain)
git log --oneline   # history
```

## Start a feature branch
```bash
git switch main
git pull
git switch -c feat/short-description
```

## Stage specific files and commit
```bash
git add frontend/src/components/Button.tsx backend/app/api/routes.py
git diff --cached              # review before committing
git commit -m "feat: add replay control to voice bar"
```
Use prefixes: `feat:`, `fix:`, `docs:`, `test:`, `chore:`, `ci:`.

## Push and open a pull request
```bash
git push -u origin feat/short-description
```
Then open the link GitHub prints, or go to the repository → Pull requests → New. Describe the change and how you tested it; wait for CI.

## Keep your branch current
```bash
git switch main && git pull
git switch feat/short-description
git merge main
```
If a conflict appears, Git marks the files. Open each, keep the correct lines, remove the `<<<<<<<`, `=======`, `>>>>>>>` markers, then:
```bash
git add <fixed-file>
git commit
```
To back out of a merge that went wrong: `git merge --abort`.

## Avoid committing secrets
- `.env` files are ignored by `.gitignore`; keep keys only there.
- Before each commit run `git diff --cached` and look for keys.
- If a secret slipped in: remove it, commit, **rotate the key** at the provider. Rewriting history is not enough once pushed.
- Never add `-f` / `--force` to `git push`.

## Publishing this repository to GitHub (first time)
```bash
# On github.com: create an empty repository (no README/licence), then:
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```
Or with the GitHub CLI: `gh repo create <repo> --private --source=. --push`.
