# Goal-days streak — Cursor Browser acceptance

Proof is the **live Browser pane in Cursor** (side panel), not files saved under `/tmp`. The agent must use MCP tools so you can watch highlights and clicks.

## Prerequisites

1. `npm run dev` → http://localhost:5173/
2. In the **Browser** pane (open via Cursor’s browser / agent tools), run in DevTools console:

```js
await window.seedGoalDaysStreakAcceptance()
```

Then refresh. Seeder: [`src/utils/dev/seedMockHabits.ts`](../../src/utils/dev/seedMockHabits.ts) (`seedGoalDaysStreakAcceptance`).

## Visible browser protocol (required)

Per `cursor-ide-browser` MCP (`INSTRUCTIONS.md` + tool schemas):

| Step | Tool | Parameters |
|------|------|------------|
| 1 | `browser_tabs` | `action: "new"`, **`position: "side"`** (or `"active"`) — opens the pane you can see |
| 2 | `browser_navigate` | `url`, **`position: "side"`**, `newTab: true` if needed |
| 3 | `browser_lock` | `action: "lock"` |
| 4 | Verify | `browser_snapshot` → **`browser_highlight`** on each habit → **`browser_click`** for navigation (not CDP-only) |
| 5 | Optional seed | `browser_cdp` `Runtime.evaluate` only for `seedGoalDaysStreakAcceptance` if console isn’t used |
| 6 | Done | `browser_lock` `action: "unlock"` |

**Do not** rely on `browser_take_screenshot` filenames under `/var/folders/.../cursor/screenshots/` as acceptance proof.

**Do** omit `position` only for background automation (user will not see the pane).

## Acceptance criteria

| # | Criterion | Pass condition |
|---|-----------|----------------|
| AC1 | Weekend does not reset streak | `PR Review` → **`Dias de sequência: 3`** (Wed–Fri done, no weekend marks) |
| AC2 | Missed goal day breaks streak | `PR Review (Fri missed)` → **no** 3-day badge (current 0 or 2 in Statistics) |
| AC3 | Statistics longest streak | **Estatísticas** → `PR Review`: **Sequência atual 3**, **Maior sequência 3** |
| AC4 | Daily habit unchanged | `Daily Habit` → **`Dias de sequência: 2`** |

## Latest report

See [goal-days-streak-report.md](./goal-days-streak-report.md).
