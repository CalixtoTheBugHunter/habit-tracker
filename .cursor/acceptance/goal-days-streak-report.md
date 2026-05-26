# AI Acceptance Test Report — goal-days streak

**Date:** 2026-05-26  
**Environment:** `npm run dev` → http://localhost:5173/  
**Browser:** Cursor IDE Browser MCP, tab `a5201e`, **`position: "side"`** (visible side panel)  
**Seed:** `await window.seedGoalDaysStreakAcceptance()` (data already present from prior seed)

## How this was verified (visible to you)

The agent used the **side Browser pane**, not headless automation:

1. `browser_navigate({ url: "http://localhost:5173/", position: "side", newTab: true })`
2. `browser_lock` → `browser_snapshot`
3. `browser_highlight` on **PR Review**, **PR Review (Fri missed)**, **Daily Habit** (home)
4. `browser_click` menu → **Estatísticas** → `browser_highlight` on **PR Review** stats card
5. `browser_take_screenshot` (attached in agent chat, not repo files)
6. `browser_unlock`

## Results

| AC | Result | Evidence (observed in Browser pane) |
|----|--------|-------------------------------------|
| AC1 | **Pass** | `PR Review` shows **Dias de sequência: 3**; description AC1; weekend not required |
| AC2 | **Pass** | `PR Review (Fri missed)` has **no** streak badge on home; Statistics: **Sequência atual 0 dias**, Maior 2 |
| AC3 | **Pass** | Statistics `PR Review`: **Sequência atual 3 dias**, **Maior sequência 3 dias** (card highlighted) |
| AC4 | **Pass** | `Daily Habit`: **Dias de sequência: 2** |

**Verdict:** All acceptance criteria satisfied.

## If your Browser pane is empty

1. Ask the agent to run tests **in the visible browser** (`position: "side"` or `"active"`).
2. Ensure `npm run dev` is running.
3. Run `await window.seedGoalDaysStreakAcceptance()` in the Browser devtools console, then refresh.

## Re-run locally

```bash
npm run dev
```

In Cursor Browser console:

```js
await window.seedGoalDaysStreakAcceptance()
```

Refresh and check the three seeded habits on home and under Estatísticas.
