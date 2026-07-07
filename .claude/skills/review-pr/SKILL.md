---
name: review-pr
description: Focused code review of a GitHub PR — security, performance, accessibility, code smells, unnecessary comments, reusable-helper opportunities, and test quality — plus an AI acceptance test against the PR/issue acceptance criteria via the Chrome DevTools MCP. Use when the user asks to review a pull request.
---

# Review PR Workflow

This skill performs a focused code review of a GitHub PR, analyzing security, performance, accessibility, code smells, unnecessary comments, and test quality using the `gh` CLI and codebase analysis. When the app can run locally (`npm run dev`), it also uses the **Chrome DevTools MCP** to run an **AI acceptance test** against resolved acceptance criteria and to produce a **discovery report**.

> **GitHub auth**: run `gh auth switch -u CalixtoTheBugHunter` before authenticated `gh` calls if needed (see `CLAUDE.md`). Determine the repo **owner** dynamically (`gh repo view --json owner -q .owner.login`); the repo is always `habit-tracker`.
>
> **Browser tooling**: the AI acceptance pass uses the **Chrome DevTools MCP** (`navigate_page`, `take_snapshot`, `click`, `fill`, `wait_for`, `list_console_messages`, `list_network_requests`, `take_screenshot`, `resize_page`, …). Read the MCP tool schemas before invoking them.

## Phase 1: PR Information Gathering

### Step 1: Get PR Details

```bash
gh pr view <PR_NUMBER> --repo <owner>/habit-tracker \
  --json number,title,body,author,files,baseRefName,headRefName,labels,state
```

Extract and display: title, description, author; files changed (additions/deletions); base and head branches; labels and status. If no PR number is given, derive it from the current branch.

### Step 2: Get Changed Files

Use the `files` field above, or `gh pr diff <PR_NUMBER> --repo <owner>/habit-tracker`, to list all changed files with paths, additions/deletions, and status (added, modified, removed, renamed).

### Step 3: Get PR Comments and Reviews

```bash
gh pr view <PR_NUMBER> --repo <owner>/habit-tracker --json comments,reviews
gh api repos/<owner>/habit-tracker/pulls/<PR_NUMBER>/comments   # line-specific
```

Gather existing review comments, check for previous security/performance concerns, and identify areas already flagged.

### Step 4: Acceptance Criteria Resolution

Establish what to verify in the AI browser pass (Phase 7):

1. Parse the PR title/body for acceptance criteria (sections like "Acceptance criteria", "Definition of Done", checkbox/numbered lists).
2. Resolve linked issues from the PR body (`Fixes #n`, `Closes #n`, `Refs #n`): fetch each with `gh issue view <n> --repo <owner>/habit-tracker --json body`, and merge their acceptance criteria into one normalized list.
3. If no explicit criteria exist anywhere: state this explicitly in the final report and run browser verification as **exploratory** against the PR description and changed UI only — do not invent strict pass/fail.
4. Output: a numbered list of testable criteria with a source note (PR section vs issue #n).

## Phase 2: Security Review

### Step 5: Security Risk Analysis

For each changed file, analyze:

1. **Authentication & Authorization**: access controls, hardcoded credentials/tokens, permission checks before sensitive operations.
2. **Input Validation**: injection risks, XSS prevention, input sanitization.
3. **Data Exposure**: PII handling, sensitive data in logs/errors/responses, encryption at rest/in transit.
4. **Dependencies**: known-vulnerable packages, new-dependency track record, up-to-date versions.
5. **API Security**: rate limiting, CORS configuration, auth headers/tokens.

Use Grep/Glob/Read (or Explore) to find similar security patterns, validation utilities, and previous implementations.

### Step 6: PII and Privacy Concerns

Analyze for user data collection/storage, retention, GDPR/privacy concerns, unnecessary collection, anonymization, and secure deletion. Flag any PII in code (emails, phone numbers, SSNs), user data in errors/logs, unencrypted personal data, or missing consent mechanisms.

## Phase 3: Performance Review

### Step 7: Performance Analysis

For each changed file: database queries (N+1, indexing, optimization, pagination); API calls (redundant calls, batching, timeouts, error handling); rendering & UI (unnecessary re-renders, memoization, list virtualization, image optimization/lazy loading); bundle size (large deps, tree-shaking, code splitting); memory leaks (unclosed listeners, `useEffect` cleanup, memory-intensive operations). Use the **context7** MCP or `WebSearch` to check version-specific best practices.

### Step 8: Check Best Practices for Tools Used

For each library/framework in changed files: identify the library and version from `package.json`/imports, then compare the implementation against official best practices, performance recommendations, version-specific optimizations, and deprecated patterns. Use the **context7** MCP (preferred for library docs) or `WebSearch` for official documentation and known issues.

## Phase 4: Accessibility Review

### Step 9: Accessibility Analysis (WCAG 2.1 AA)

For UI components/changes: semantic HTML (HTML5 elements, heading hierarchy, ARIA labels/roles, form labels); keyboard navigation (all interactive elements reachable, tab order, focus indicators, skip links); screen reader support (alt text, ARIA live regions, form error announcements, descriptive links); visual accessibility (contrast ratios, text resizing, responsive design); interactive elements (min 44×44px targets, clear accessible errors, accessible validation, announced loading states). Use Grep/Read to find existing accessibility patterns.

### Step 10: Reference Accessibility Best Practices

Verify against WCAG 2.1 Level AA, the WAI-ARIA Authoring Practices Guide, WebAIM guidelines, and framework-specific accessibility docs. Use `WebSearch`/context7 for current best practices when needed.

## Phase 5: Code Quality Review

### Step 11: Code Smell Detection

Analyze for: long methods/functions (multiple responsibilities → split), code duplication (→ extract shared utilities), complex conditionals (nested ifs/boolean logic → simplify), magic numbers/strings (→ named constants), poor naming (→ descriptive names), tight coupling (→ dependency injection/abstraction), and dead code (unused imports, commented-out code, unreachable paths). Use Grep to find systemic patterns and existing reusable utilities.

### Step 12: Check for Reusable Helpers and Utilities

For each changed file:

1. **Existing helper/utility usage**: flag code that duplicates functionality already in `src/test/utils/`, `src/utils/`, `src/services/`, or other helper directories (e.g. `renderWithProviders`, validation functions, date/time utilities, error handling, mock factories).
2. **Opportunities for new helpers**: repeated patterns (3+ instances), duplicated complex logic, shareable test utilities, readability-improving helpers.
3. **Test helper reusability**: check test files use available utilities (rendering helpers, mock factories, setup/teardown, custom matchers); flag inline helpers that should be extracted.
4. **Utility organization**: verify new helpers land in the right directory, match naming conventions, and are properly exported/documented.

### Step 13: Remove Unnecessary Comments

Review comments in changed files: **remove** comments that restate code, obvious comments, outdated comments, and context-free TODOs; **keep** complex-algorithm explanations, business-logic rationale, workaround context, and public-API JSDoc; **improve** by adding "why" context and updating outdated comments.

## Phase 6: Test Quality Review

### Step 14: Test Validation and Quality Analysis

For each test file (`*.test.ts(x)`, `*.spec.ts(x)`) in the changes:

1. **Test substance**: tests assert meaningful behavior; flag "dumb tests" (only check it runs, no/trivial assertions, testing implementation details, always-pass); ensure error and edge cases are covered.
2. **Repetitive patterns**: tests differing only in input/output → suggest `test.each`/`it.each` or shared fixtures.
3. **Redundancy**: duplicate/overlapping/subset tests → consolidate.
4. **Mock complexity**: deeply nested mocks, whole-system recreation, over-mocking, intent-obscuring setup → simplify or use real objects.
5. **Mock data organization**: scattered/repeated mock data → shared factories/builders, `__mocks__`/fixtures/test-data, consistent patterns.
6. **Test utilities & helpers**: repeated setup/teardown, common assertions, custom matchers → extract; verify existing utilities are used.

### Step 15: Test Best Practices Verification

Verify: structure (AAA pattern, clear names, independence, proper setup/teardown); coverage (critical paths, error cases, edge/boundary conditions); maintainability (readable, self-documenting, resilient to unrelated changes, fast); mock best practices (appropriate use, realistic behavior, reset between tests, meaningful verification).

## Phase 7: AI Acceptance Testing (Chrome DevTools MCP)

Use the numbered criteria from Step 4 (or exploratory scope). Do **not** use `npm run build` for this path; run `npm run dev` and verify against the running app. Read the Chrome DevTools MCP tool schemas before invoking tools.

### Step 16: Execute browser verification against criteria

**Prerequisites**: dev server reachable (record BASE_URL from the `package.json` dev script, framework default, or user-provided); criteria list from Step 4 available (or explicit exploratory scope).

**Chrome DevTools MCP protocol**:

```
1. list_pages / new_page as needed
2. navigate_page to BASE_URL (or the route under test)
3. take_snapshot before interactions — use element uids from the snapshot for click, fill, fill_form, hover, and key/scroll interactions
4. Prefer short incremental checks: wait_for expected text/state, then take_snapshot between steps
5. Capture take_screenshot / list_console_messages / list_network_requests as evidence
```

Security: no secrets, tokens, or production credentials in chat or evidence; prefer local-only flows. Do not mark Pass without observable evidence. On MCP failure (no page, navigation error, timeout), record **Blocked** — optionally retry once after confirming the server — never fake Pass.

**Per criterion**: record Pass | Fail | Blocked with brief snapshot-based evidence (no raw secrets). Note automation blockers (login, feature flags, seed data).

### Step 17: AI Acceptance Test Report and discoveries

Produce a written **AI Acceptance Test Report** for Phase 8:

1. Criteria list with source (PR section vs issue #n), or a statement that criteria were absent and scope was exploratory.
2. Per item: Criterion → Result (Pass/Fail/Blocked) → Evidence → Notes.
3. **Discoveries**: regressions, UX gaps, unexpected behavior, accessibility observations (cross-reference Phase 4).
4. **Automation blockers** that prevented verification.
5. **Overall alignment**: do observed behaviors match documented criteria (or PR intent for exploratory runs)?

## Phase 8: Review Summary and Recommendations

### Step 18: Generate Review Report

Compile a structured report with: Security findings (critical/high, PII/privacy, prioritized recommendations); Performance findings (bottlenecks, opportunities, best-practice violations, expected impact); Accessibility findings (WCAG issues, keyboard/screen-reader/visual, priority fixes); Code Quality findings (smells, refactors, comments to remove, duplication); Test Quality findings (dumb/repetitive/redundant tests, over-complicated mocks, mock-data organization, missing utilities, maintainability); AI acceptance testing & criteria alignment (embed the Step 17 report; state whether criteria were present/absent; highlight mismatches); and an Overall Assessment (critical issues summary, priority ranking, estimated effort, approval recommendation).

### Step 19: Create Review Comments

For critical issues, add actionable review comments to the PR (e.g. `gh pr review <PR_NUMBER> --comment --body "..."`, or `gh api` for inline line comments) structured as:

- **Issue**: clear description
- **Location**: file and line number
- **Impact**: why this matters
- **Recommendation**: how to fix
- **Priority**: Critical / High / Medium / Low

## Error Handling

- If `gh` calls fail, provide fallback instructions for manual review.
- If code search doesn't find patterns, note that new patterns may be needed.
- If external research is needed, clearly indicate it (prefer context7 for library docs).
- If the PR is too large, suggest breaking it into smaller PRs.
- If Chrome DevTools MCP calls fail or the dev server is unavailable, document Phase 7 as **Blocked** — do not imply criteria passed without a successful run.

## Security Guidelines

- Never expose sensitive information in review comments; sanitize examples/snippets.
- Flag security issues immediately, even if minor; prioritize security findings over other concerns.

## Quality Checklist

- [ ] All security risks identified and documented
- [ ] Performance issues analyzed with best-practice references
- [ ] Accessibility concerns checked against WCAG standards
- [ ] Code smells identified with refactoring suggestions
- [ ] Reusable helpers/utils checked for opportunities
- [ ] Unnecessary comments flagged for removal
- [ ] Test quality analyzed (substance, redundancy, patterns, mocks, utilities)
- [ ] Acceptance criteria identified in Step 4 or explicitly marked absent
- [ ] Chrome DevTools MCP acceptance pass completed **or** documented as blocked
- [ ] AI discovery report (Step 17) included in the final output
- [ ] Review comments added to PR for critical issues
- [ ] Overall assessment provided with approval recommendation

## Notes

- GitHub operations use the `gh` CLI (no GitHub MCP configured).
- Focus areas: Security, Performance, Accessibility, Code Quality, Comments, Test Quality, AI browser acceptance vs criteria.
- **Owner/Repository**: retrieve the owner dynamically; repo is always `habit-tracker`.
