---
name: implement-issue-riper5
description: Implement a GitHub issue under the RIPER-5 protocol (Research → Innovate → Plan → Execute → Review) with a mandatory declared mode on every response and explicit human approval at each mode transition. Includes an AI acceptance test via the Chrome DevTools MCP. Use when the user wants strict, mode-gated, approval-driven implementation.
---

# Implement GitHub Issue Workflow (RIPER-5 Protocol)

This skill implements a GitHub issue using the RIPER-5 protocol with mandatory human approval at each mode transition. All phases must be reviewed and approved by the user. GitHub operations use the `gh` CLI; codebase exploration uses Grep/Glob/Read (or the Explore agent).

**CRITICAL**: You MUST begin every single response with your current mode in brackets: `[MODE: MODE_NAME]`. Failure to declare your mode is a critical violation of protocol.

> **RIPER-5 protocol**: the full protocol (mode definitions, guidelines, transition signals) is in [`references/riper-5-protocol.md`](references/riper-5-protocol.md). Read it before starting and follow it exactly. You CANNOT transition modes without the user's explicit "ENTER <MODE> MODE" signal.
>
> **GitHub auth**: run `gh auth switch -u CalixtoTheBugHunter` before authenticated `gh` calls if needed (see `CLAUDE.md`). Determine the repo **owner** dynamically; the repo is always `habit-tracker`.
>
> **Browser tooling**: the AI acceptance test (MODE 5) uses the **Chrome DevTools MCP** (`navigate_page`, `take_snapshot`, `click`, `fill`, `wait_for`, `list_console_messages`, `take_screenshot`, …). Read the MCP tool schemas before invoking them.

## MODE 1: RESEARCH

**Purpose**: Information gathering and understanding ONLY. **Permitted**: reading files, asking clarifying questions, understanding code. **Forbidden**: suggestions, implementations, planning.

### Step 1: Verify GitHub Access

Confirm access to `<owner>/habit-tracker`: `gh repo view <owner>/habit-tracker`.

### Step 2: Select GitHub Issue

```
If an issue number is provided:
  - gh issue view <ISSUE_NUMBER> --repo <owner>/habit-tracker --json number,title,body,labels,assignees,state
  - Display: title, body, labels, assignee, state; ask the user to confirm this is correct

If a search is needed:
  - gh issue list --repo <owner>/habit-tracker --state open --search "<criteria>"
  - Present matching issues; ask the user to select one
```

### Step 3: Issue Analysis & Clarification

Analyze for clear requirements/acceptance criteria, technical specifications, dependencies/related issues, labels/priority, and INVEST alignment. If unclear or missing: ask the user, and/or `gh issue comment <ISSUE_NUMBER> --repo <owner>/habit-tracker --body "<question>"` to request clarification; STOP until clarification is provided.

### Step 4: Analyze Related Code Patterns

Identify similar features/components, relevant file patterns and directory structure, used libraries/dependencies, and existing test patterns. Use Grep/Glob/Read (or Explore) to find similar implementations, test files, type definitions, and API/data-flow patterns.

### Step 5: Study Test Strategies

Analyze existing test patterns (unit structure/naming, integration approaches, edge cases, mock/fixture patterns, utilities). Create a test plan covering happy paths, edge cases/error handling, integration points, and TypeScript type safety.

### RESEARCH Mode Transition Checkpoint

Present a summary of research findings (requirements/criteria, code patterns/architecture, test strategies, clarifications). Request explicit approval — the user must signal **"ENTER INNOVATE MODE"** to proceed. Do NOT proceed without the signal.

## MODE 2: INNOVATE

**Purpose**: Brainstorming approaches. **Permitted**: discussing ideas, pros/cons, seeking feedback. **Forbidden**: concrete planning, implementation details, code.

### Solution Brainstorming

Present multiple approach possibilities with advantages/disadvantages and trade-offs. Use language like "One possibility is…" / "Another approach could be…". Avoid definitive statements about what will be implemented; seek the user's preferred direction.

### INNOVATE Mode Transition Checkpoint

Present the brainstormed solutions and any expressed preferences. Request explicit approval — the user must signal **"ENTER PLAN MODE"** to proceed. Do NOT proceed without the signal.

## MODE 3: PLAN

**Purpose**: Exhaustive technical specification. **Permitted**: detailed plans with exact file paths, function names, and changes. **Forbidden**: any implementation or "example code".

### Step 6: Create Implementation Plan

Create a plan including: files to create/modify (exact paths), implementation approach (following existing patterns), exact function/component names and structure, test strategy and coverage (specific test cases), potential breaking changes/dependencies, and a rollback plan.

### Mandatory Checklist Conversion

Convert the complete plan into a numbered, sequential checklist — each atomic action a separate item, specific enough that no creative decisions are needed, with exact file paths/function names/changes in logical order:

```
IMPLEMENTATION CHECKLIST:
1. [Specific action 1]
2. [Specific action 2]
...
n. [Final action]
```

### PLAN Mode Transition Checkpoint

Present the complete plan and numbered checklist. Request explicit approval — the user must signal **"ENTER EXECUTE MODE"** to proceed. Do NOT proceed without the signal.

## MODE 4: EXECUTE

**Purpose**: Implementing EXACTLY what was planned. **Permitted**: only what the approved plan details. **Forbidden**: any deviation/improvement not in the plan. **Entry**: only after explicit "ENTER EXECUTE MODE". **Deviation Handling**: if any deviation is needed, IMMEDIATELY return to PLAN mode.

### Step 7: Implement Core Functionality

Implement the approved plan EXACTLY: use existing patterns/utilities, keep functions small and focused, follow TypeScript/JavaScript best practices, consistent naming, proper error handling, JSDoc for complex functions only (avoid redundant comments — self-document where possible). If any deviation is needed: STOP, return to PLAN mode, request approval for a plan modification.

### Step 8: Create Comprehensive Tests

Create unit tests for all functions/components, integration tests for data flow, edge/error cases, TypeScript type validation, and mock data following fixture patterns. No dumb tests, no redundant tests. Run tests: all new tests pass, no existing tests break, coverage meets standards. **Only pass to the next step when all tests pass.**

### Step 9: Fix TypeScript & Lint Issues

Run and fix TypeScript compilation errors, ESLint warnings/errors, Prettier formatting, import organization, and unused variables/imports. Ensure all checks pass before proceeding.

### Step 10 (Execute): Version and changelog (maintainers only)

Feature PRs to `main` do **not** change `package.json` or prepend changelog release sections — version bumps and locale changelogs are applied by the **Tag version (production release)** workflow (`.github/workflows/tag-version.yml`) when a maintainer cuts a release. Use clear Conventional Commits messages so release notes group correctly. Official `v*` tags on `main` are created only via that workflow, not ad-hoc local `git tag`.

### EXECUTE Mode Transition Checkpoint

Present the execution summary (changes completed, all tests passing, TypeScript/lint passing, confirmation the implementation matches the plan exactly). Request explicit approval — the user must signal **"ENTER REVIEW MODE"** to proceed. Do NOT proceed without the signal.

## MODE 5: REVIEW

**Purpose**: Ruthlessly validate implementation against the plan. **Required**: EXPLICITLY FLAG ANY DEVIATION, no matter how minor, using "⚠️ DEVIATION DETECTED: [description]".

### Step 10: Manual Testing and AI Acceptance Test (Chrome DevTools MCP)

#### Step 10a: Manual / local run

Verify the app runs locally: run `npm run dev`, verify it loads without errors. **Never** run `npm run build` for acceptance verification — use `npm run dev`. Provide the user with a summary of changes, manual testing instructions, expected behavior, and edge cases; wait for confirmation that manual testing is complete and successful (when applicable).

#### Step 10b: AI acceptance test (Chrome DevTools MCP)

Use the **Chrome DevTools MCP** to exercise the running app and compare observable behavior to the issue's acceptance criteria (and UX-related items from the approved PLAN checklist).

**Prerequisites**: dev server reachable; record BASE_URL (package.json dev script default, framework docs, or user-provided); read the Chrome DevTools MCP tool schemas before invoking tools.

**Criteria source and normalization**: primary = acceptance criteria from the issue body (RESEARCH Step 2–3); secondary = PLAN checklist items describing user-visible behavior. Normalize into a numbered list of testable statements (Given/When/Then or clear bullets), each mapped to concrete navigation/interaction steps.

**Chrome DevTools MCP protocol**:

```
1. list_pages / new_page as needed
2. navigate_page to BASE_URL (or the route under test)
3. take_snapshot before any click/type/fill — use element uids from the snapshot for interactions
4. Exercise flows: click, fill, fill_form, hover, key/scroll interactions as needed
5. Prefer short incremental checks: wait_for expected state, then take_snapshot between steps
6. Capture take_screenshot / list_console_messages / list_network_requests as evidence
```

Security: do not paste secrets, tokens, or production credentials into chat or logs; prefer local-only flows and test accounts. Do not mark a criterion Pass on unverified assumptions.

**Per-criterion recording**: Result (Pass | Fail | Blocked) + brief evidence (no raw secrets); if Blocked, the reason (env, auth, missing data, MCP error, timeout). If the browser session fails, document as **Blocked** — do not fake Pass; optionally retry once after confirming the dev server and URL. Any Fail or material Blocked item is a REVIEW finding; use error handling to return to EXECUTE or PLAN as appropriate.

**AI Acceptance Test Report (required output)**: the numbered criteria with per-row result (Pass/Fail/Blocked + evidence), the overall verdict (all satisfied vs gaps), and any automation blockers.

### Step 11: Validate Implementation Against Plan

Include the AI Acceptance Test Report summary in the REVIEW narrative before the verdict. Perform a line-by-line comparison: each implemented item vs the approved plan, all checklist items completed, file paths/function names/changes matching exactly. For each deviation: flag "⚠️ DEVIATION DETECTED: [description]", document it, and note whether it requires a plan modification or can be accepted. Final verdict: "✅ IMPLEMENTATION MATCHES PLAN EXACTLY" or "❌ IMPLEMENTATION DEVIATES FROM PLAN".

### Step 12: Create PR

Invoke the `create-pr` skill to handle committing (Conventional Commits), branch naming, and standardized PR creation.

### REVIEW Mode Completion

Present final review findings: AI Acceptance Test Report summary, implementation validation results, manual testing confirmation, PR creation status, and the final verdict on plan compliance. Workflow complete.

## Security Measures Summary

- Confirm `gh` access at start; validate issue details and user inputs.
- Code quality gates: TypeScript, linting, test coverage; follow established patterns.
- Manual validation + automated browser verification (no secrets/tokens in chat or logs; local-only flows).
- Atomic commits; trace all changes back to the issue; mandatory user approval at each mode transition.

## Error Handling

- If a `gh` call fails, provide a clear error and retry options.
- If tests fail, stop and request fixes.
- If user input is unclear, ask before proceeding.
- If manual testing fails, return to EXECUTE (or PLAN if the plan must change).
- If AI acceptance testing fails (a criterion Fails) or the browser MCP is Blocked after retry, document results and return to EXECUTE or PLAN — do not proceed as if criteria passed.
- If a deviation is detected in EXECUTE mode, IMMEDIATELY return to PLAN mode.

## Notes

- GitHub operations use the `gh` CLI (no GitHub MCP configured).
- User approval is required at EVERY mode transition; the user is always accountable for AI actions and decisions.
- Branch naming pattern: `{username}/GH-{ISSUE_NUMBER}--short-description` (username from Claude memory).
- PR creation is handled by the `create-pr` skill.
- **Owner/Repository**: retrieve the owner dynamically; repo is always `habit-tracker`.
- **Browser MCP**: MODE 5 uses the **Chrome DevTools MCP** (replacing the former `cursor-ide-browser` MCP).
