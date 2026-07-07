---
name: test-issue
description: Comprehensive QA testing for a GitHub issue's implementation using Chrome DevTools MCP browser testing, accessibility checks, edge cases, and performance observations. Outputs either an approval or a detailed remediation plan (no code changes without user approval). Use when the user wants to QA/verify an implemented issue against its acceptance criteria.
---

# Test Issue Workflow

This skill provides comprehensive QA testing for GitHub issue implementations using browser testing (via the **Chrome DevTools MCP**), accessibility checks, and known QA techniques. It outputs either an approval or a detailed plan to address found issues. GitHub operations use the `gh` CLI.

> **GitHub auth**: run `gh auth switch -u CalixtoTheBugHunter` before authenticated `gh` calls if needed (see `CLAUDE.md`). Determine the repo **owner** dynamically; the repo is always `habit-tracker`.
>
> **Browser tooling**: this workflow uses the **Chrome DevTools MCP** (`navigate_page`, `new_page`, `take_snapshot`, `click`, `fill`, `fill_form`, `hover`, `wait_for`, `list_console_messages`, `list_network_requests`, `take_screenshot`, `resize_page`, `handle_dialog`, `evaluate_script`, …). Read the MCP tool schemas before invoking them. If no browser MCP is configured, fall back to guided manual testing and document it.

## Phase 1: Issue Retrieval & Analysis

### Step 1: Get GitHub Issue Details

```
If an issue number is provided:
  - gh issue view <ISSUE_NUMBER> --repo <owner>/habit-tracker --json number,title,body,labels,comments
  - Extract: title, description, acceptance criteria (body/checklists/comments), labels, related PRs, comments with context

If a search is needed:
  - gh issue list --repo <owner>/habit-tracker --search "<criteria>"
  - Present matching issues; ask the user to select one
```

### Step 2: Extract Acceptance Criteria

Parse acceptance criteria from: Markdown checklists (`- [ ]` / `- [x]`), numbered lists, an "Acceptance Criteria:" section, Given/When/Then scenarios, and "As a… I want… So that…" format. Create a structured list of testable requirements with priority and dependencies noted.

### Step 3: Identify Related Code

Use Grep/Glob/Read (or the Explore agent) to find files mentioned in the issue/PR, related components/services, test files, and type definitions. Review related PRs with `gh pr view <n> --repo <owner>/habit-tracker` and `gh pr diff <n>`.

## Phase 2: Test Environment Setup

### Step 4: Verify Dev Server

```
Check if the dev server is running:
  - navigate_page to http://localhost:5173
  - If not accessible:
    * Run `npm run dev` in the background
    * Wait for "Local: http://localhost:5173"
    * Verify the server is responsive
If the server fails to start: check port conflicts, verify dependencies installed, report and request user intervention.
```

### Step 5: Initial Browser State

```
navigate_page to http://localhost:5173, then take_snapshot to verify:
  - Page loads without errors
  - No console errors (list_console_messages)
  - Application is in the expected initial state
  - Check network requests for failed resources (list_network_requests)
If errors are found: document them, decide if they block testing, report to the user if critical.
```

## Phase 3: Acceptance Criteria Testing

### Step 6: Test Each Acceptance Criterion

For each criterion:

1. **Identify the test scenario**: required user action, expected outcome, needed data/state.
2. **Execute the test**: `navigate_page` to the relevant route → `take_snapshot` → interact using element uids from the snapshot (`click`, `fill`/`fill_form`, `hover`), then `wait_for` expected changes and `take_snapshot` to verify.
3. **Verify the result**: expected behavior occurred, UI updated correctly, no console errors (`list_console_messages`), data persisted if applicable.
4. **Document the result**: ✅ PASS / ❌ FAIL (document issue) / ⚠️ PARTIAL (document gaps) / ⏭️ SKIP (document reason).

### Step 7: Edge Case Testing

Test common edge cases and document all results:

1. **Input Validation**: empty, extremely long, special characters, whitespace-only, invalid types, boundary values (min/max).
2. **State Management**: rapid repeated actions, actions during loading, with no data, with maximum data, concurrent actions.
3. **Error Handling**: network failures (use `emulate_network` if available), invalid operations, missing required data, conflicting states.
4. **Browser Behavior**: page refresh during operations, back/forward navigation, multiple tabs, resize (`resize_page`).
5. **Data Persistence**: clear storage and test, test with existing data, test migration.
6. **Integration Points**: interactions with other features, shared state/context, component lifecycle.

## Phase 4: Accessibility Testing

### Step 8: WCAG Compliance Checks (WCAG 2.1 Level AA)

Using `take_snapshot` (the accessibility tree):

1. **Keyboard Navigation**: tab through interactive elements, visible focus indicators, Enter/Space activation, logical tab order, Escape for modals.
2. **Screen Reader Compatibility**: ARIA labels, heading hierarchy, image alt text, associated form labels, ARIA roles.
3. **Visual Accessibility**: color contrast, readable text, text alternatives, focus indicators, browser zoom (100/150/200%).
4. **Semantic HTML**: proper HTML5 elements, labeled form elements, buttons vs links, heading structure.
5. **ARIA Attributes**: aria-label, aria-describedby, aria-live, aria-expanded, aria-required.

Document all accessibility findings.

### Step 9: Responsive Design Testing

Use `resize_page` to test Desktop (1920×1080, 1280×720), Tablet (768×1024), Mobile (375×667, 414×896). For each: `take_snapshot`, verify readable content, no horizontal scrolling, accessible interactive elements, and unbroken layout. Document responsive issues.

## Phase 5: Performance Observations

### Step 10: Performance Observations

Monitor during testing: load times (initial load, component rendering, data fetching), network requests (`list_network_requests` — no unnecessary/failed requests, efficiency), console warnings (`list_console_messages` — React warnings, potential leaks), and user experience (smooth interactions, loading states, graceful error states). Document observations.

## Phase 6: Test Results & Reporting

### Step 11: Compile Test Results

Create a report with: an executive summary (overall status APPROVED / ISSUES FOUND, total criteria, pass/fail/partial counts, critical issues), acceptance criteria results (per criterion: status, steps performed, actual vs expected, evidence), edge case results, accessibility results (WCAG status, issues by category, severity), and performance observations.

### Step 12: Create Action Plan (if issues found)

If issues found, create a plan with Critical (blocking, HIGH), Major (important, MEDIUM), Minor (nice-to-have, LOW), and Accessibility issues (WCAG violation, user impact, fix, severity-based priority). For each: specific file/component reference, suggested code changes (**do NOT implement**), complexity estimate, and link to the related acceptance criterion.

**WAIT FOR USER APPROVAL before implementing any fixes.**

### Step 13: Final Decision

```
If all criteria pass and no critical issues:
  ✅ APPROVED — meets all requirements, no blocking issues, ready for merge (pending user review)

If issues found:
  📋 ACTION PLAN CREATED — present the plan, wait for approval, then implement fixes following TDD and re-test
```

## QA Techniques Applied

Equivalence Partitioning, Boundary Value Analysis, Error Guessing, Exploratory Testing, Regression Testing, Usability Testing, Accessibility Testing (WCAG 2.1 AA), Cross-viewport Compatibility, Performance Testing, and Security Testing (input validation, error handling).

## Security Measures

- **No code changes without approval** — all fixes require user approval.
- **Read-only testing** — browser testing is non-destructive.
- **Data safety** — use test data, avoid production data; never paste secrets/tokens into chat or evidence.

## Error Handling

- Dev server fails → report and request user intervention.
- Browser navigation fails → retry, document the error.
- Chrome DevTools MCP calls fail → clear error, retry options; document as Blocked, never fake Pass.
- Critical issues found → stop testing, create action plan.
- Unclear requirements → ask the user for clarification.

## Notes

- **Owner/Repository**: retrieve the owner dynamically; repo is always `habit-tracker`.
- All browser testing is non-destructive; snapshots/screenshots serve as evidence.
- User approval is required for all code changes; follow TDD when implementing fixes and re-test afterward.
