---
name: execute-vibe-coding
description: Experimental, unsupervised PoC workflow — build a proof-of-concept on a local test branch, iterate freely (edit files, add deps, run tests, drive the UI) until it works, and never push. Use when the user says "execute-vibe-coding" or asks for vibe coding on a PoC/issue.
---

# Execute Vibe Coding

This is an **experimentation-only** workflow: no code is ever pushed. Follow this protocol when the user invokes vibe coding on a PoC.

## 1. Input

- **Option A**: The user shares PoC details directly in chat.
- **Option B**: The user shares a GitHub issue — fetch it with `gh issue view <n> --repo <owner>/habit-tracker --json title,body` and use its title/body as the PoC spec.

If anything is unclear, ask one short round of questions, then proceed.

## 2. Branch and safety

- Create a **test branch** (e.g. `vibe-poc/<short-name>` or `test/<issue-number>-poc`) from the current default branch.
- **Never push.** No `git push`, no remote updates. All work stays local.

## 3. Execution (unsupervised)

You are **allowed to do everything unsupervised** in this mode:

- Edit any files, add dependencies, refactor as needed for the PoC.
- Run the test suite (`npm test`, etc.) and fix failures until tests pass.
- Run the app (`npm run dev`) and use the **Chrome DevTools MCP** to drive the UI and verify behavior:
  - Navigate, click, fill forms, take snapshots, and assert visible state.
  - Repeat until the PoC behavior is confirmed working.
- Iterate: implement → run tests → run app → browser check → adjust until the PoC works.

## 4. Definition of done (for the agent)

- Tests relevant to the PoC are green.
- Browser-based checks show the PoC working as specified (by user or issue).
- You briefly report what was built and how to run/try it.

## 5. Handoff to user

- Summarize: what the PoC does, which branch it's on, how to run tests and the app.
- **User decides**: experimentation is finished, or more details/iterations are needed. Do not push; do not merge unless the user explicitly asks outside this workflow.

## Quick reference

| Do | Don't |
|----|--------|
| Create a test branch | Push to remote |
| Run tests and fix until green | Merge to main/default |
| Use Chrome DevTools MCP to verify UI | Assume done without browser check |
| Iterate until PoC works | Stop while tests are red or PoC is broken |
| Work unsupervised | Ask for permission for each small step |

## Notes

- GitHub operations use the `gh` CLI (no GitHub MCP configured). Determine the repo owner dynamically; repo is always `habit-tracker`.
- Browser verification uses the **Chrome DevTools MCP** (replacing the former `cursor-ide-browser` MCP).
