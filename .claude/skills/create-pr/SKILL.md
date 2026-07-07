---
name: create-pr
description: Create a GitHub PR with proper branch naming, a Conventional Commits commit, and a standardized user-facing PR description. Use when the user asks to open/create a pull request for completed work, or when another workflow hands off PR creation.
---

# Create PR Workflow

This skill handles version control and PR creation for completed implementations, following KISS principles with clean commits and standardized PR descriptions. It uses the `gh` CLI (not an MCP server) for all GitHub operations.

> **GitHub auth**: this repo requires the `CalixtoTheBugHunter` account for authenticated `gh` calls — see `CLAUDE.md` (GitHub CLI authentication). Run `gh auth switch -u CalixtoTheBugHunter` before the `gh` commands below if multiple accounts are logged in.

## Step 1: Commit Changes

Create a one-line commit using the Conventional Commits pattern (enforced by commitlint):

- Format: `<type>(<scope>): <subject> (#ISSUE_NUMBER)`
- Types: `fix`, `feat`, `docs`, `style`, `refactor`, `test`, `chore`, etc.
- Scope: optional, describes the area of change
- Subject: brief description in imperative mood
- Reference the GitHub issue number at the end: `(#ISSUE_NUMBER)`
- Keep to one line, max ~72 characters
- Group related changes logically
- Ensure no sensitive data is committed

Commit with `git commit -m "type(scope): desc (#N)"` directly — **do not** use `npm run commit` (commitizen needs a TTY and will hang in this environment).

Examples:
- `fix(setup): initialize Vite + React project with plain CSS (#1)`
- `feat(habits): add habit creation feature (#123)`
- `docs: update README with installation instructions (#45)`

## Step 2: Create Branch & Push

Create a branch using the pattern: `{username}/GH-{ISSUE_NUMBER}--short-description`

- Get the GitHub username from Claude memory (`MEMORY.md` / the memory directory):
  * If the username is **not** saved: ask the user ONCE for their name, then save it as a `user` memory (and add a pointer in `MEMORY.md`).
  * If the username **is** saved: use it (do not ask again, do not check via terminal).
- Extract the issue number from the GitHub issue.
- Create a descriptive short description from the issue title.
- Push the branch to the remote.

Example branch: `paulo/GH-123--add-habit-creation`

If you are currently on `main`, create the branch first before committing.

## Step 3: Create GitHub PR

Create the PR with `gh pr create`:

```bash
gh pr create \
  --repo <owner>/habit-tracker \
  --base main \
  --head <branch-name> \
  --title "<clear title referencing the issue>" \
  --body "$(cat <<'EOF'
GitHub issue: #<ISSUE_NUMBER>

## Description
- Bullet point 1 (user-facing value)
- Bullet point 2 (user-facing value)
EOF
)"
```

- `<owner>`: determine dynamically (e.g. `gh repo view --json owner -q .owner.login`, or from the git remote). Do not hardcode an owner.
- Keep the PR description simple: focus on **user-facing value, not technical implementation**.
- Use descriptive bullet points about features/changes.
- Exclude files modified, test results, and commit messages.
- GitHub automatically links the PR to an issue when the body contains `Fixes #123` or `Closes #123`.

## Notes

- All GitHub operations use the `gh` CLI (no GitHub MCP is configured in this environment).
- Branch naming pattern: `{username}/GH-{ISSUE_NUMBER}--short-description`.
- **GitHub username**: ask ONCE, save in Claude memory, reuse the saved value afterward. Never resolve it via terminal commands.
- PR descriptions focus on user-facing value, not technical details.
