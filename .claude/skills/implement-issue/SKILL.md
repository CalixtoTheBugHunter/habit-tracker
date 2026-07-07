---
name: implement-issue
description: Implement a GitHub issue end-to-end (analysis → plan → code → tests → lint → PR) following KISS principles with comprehensive testing. Use for the standard, non-RIPER-5 issue implementation flow. For strict mode-gated implementation with human approval at every step, use implement-issue-riper5 instead.
---

# Implement GitHub Issue Workflow

This skill guides implementing a GitHub issue following KISS principles with comprehensive testing and security measures. GitHub operations use the `gh` CLI; codebase exploration uses Grep/Glob/Read (or the Explore agent).

> **GitHub auth**: run `gh auth switch -u CalixtoTheBugHunter` before authenticated `gh` calls if needed (see `CLAUDE.md`). Determine the repo **owner** dynamically; the repo is always `habit-tracker`.

## Phase 1: Issue Selection & Validation

### Step 1: Verify GitHub Access

Confirm access to `<owner>/habit-tracker`: `gh repo view <owner>/habit-tracker`.

### Step 2: Select GitHub Issue

```
If an issue number is provided:
  - gh issue view <ISSUE_NUMBER> --repo <owner>/habit-tracker --json number,title,body,labels,assignees,state
  - Display: title, body, labels, assignee, state
  - Ask the user to confirm this is the correct issue

If a search is needed:
  - gh issue list --repo <owner>/habit-tracker --state open --search "<criteria>"
  - Present matching issues and ask the user to select one
```

### Step 3: Issue Analysis & Clarification

Analyze the issue for: clear requirements and acceptance criteria, technical specifications, dependencies/related issues, labels/priority, INVEST alignment.

If information is unclear or missing:
- Ask the user for clarification, and/or
- `gh issue comment <ISSUE_NUMBER> --repo <owner>/habit-tracker --body "<question>"` to request clarification from the reporter/assignee
- STOP the workflow until clarification is provided.

## Phase 2: Project Analysis & Pattern Study

### Step 4: Analyze Related Code Patterns

Identify similar existing features/components, relevant file patterns and directory structure, used libraries/dependencies, and existing test patterns. Use Grep/Glob/Read (or the Explore agent) to find similar implementations, test files, type definitions, and API/data-flow patterns. Use the **context7** MCP for up-to-date library documentation when relevant.

### Step 5: Study Test Strategies

Analyze existing test patterns (unit structure/naming, integration approaches, edge-case handling, mock/fixture patterns, test utilities/helpers). Create a test plan covering happy paths, edge cases/error handling, integration points, and TypeScript type safety.

## Phase 3: Implementation Planning

### Step 6: Create Implementation Plan

Create a plan including files to create/modify, implementation approach (following existing patterns), test strategy and coverage, potential breaking changes/dependencies, and a rollback plan. **Present the plan to the user for approval before proceeding.**

## Phase 4: Implementation

### Step 7: Implement Core Functionality

Follow KISS: use existing patterns/utilities, keep functions small and focused, follow TypeScript/JavaScript best practices, consistent naming, proper error handling. Add JSDoc only for complex functions; avoid redundant comments — code should be self-documenting where possible.

### Step 8: Create Comprehensive Tests

Create unit tests for all functions/components, integration tests for data flow, edge/error cases, TypeScript type validation, and mock data following fixture patterns. No dumb tests, no redundant tests.

Run tests to ensure all new tests pass, no existing tests break, and coverage meets project standards. **Only proceed when all tests pass.**

### Step 9: Fix TypeScript & Lint Issues

Run and fix TypeScript compilation errors, ESLint warnings/errors, Prettier formatting, import organization, and unused variables/imports. Ensure all checks pass before proceeding.

## Phase 5: Testing & Validation

### Step 10: Request Manual Testing

Verify the app runs locally:
- Run `npm run dev` to start the dev server; verify the app loads without errors.
- **Never** run `npm run build` in this workflow — use `npm run dev`.

Provide the user with a summary of changes, manual testing instructions, expected behavior/outcomes, and edge cases to verify. Wait for user confirmation that manual testing is complete and successful.

> For AI-driven acceptance testing against the running app, use the **Chrome DevTools MCP** (see the RIPER-5 skill's Step 10b for the protocol) if configured.

## Phase 6: Version Control & PR Creation

Feature PRs to `main` do **not** bump `package.json` or changelogs. Official production `v*` tags on `main` are created only via `.github/workflows/tag-version.yml` (see `README.md`, Production releases).

### Step 11: Create PR

Invoke the `create-pr` skill to handle committing (Conventional Commits), branch naming, and standardized PR creation.

## Security Measures Summary

- Confirm GitHub (`gh`) access at start; validate issue details and user inputs.
- Code quality gates: TypeScript, linting, and test coverage.
- Follow established architecture patterns; require manual validation before PR.
- Atomic commits with proper documentation; trace all changes back to the issue.

## Error Handling

- If a `gh` call fails, provide a clear error and retry options.
- If tests fail, stop and request fixes.
- If user input is unclear, ask before proceeding.
- If manual testing fails, return to the implementation phase.

## Notes

- GitHub operations use the `gh` CLI (no GitHub MCP configured).
- Branch naming pattern: `{username}/GH-{ISSUE_NUMBER}--short-description` (username from Claude memory).
- PR creation is handled by the `create-pr` skill.
- **Owner/Repository**: retrieve the owner dynamically; repo is always `habit-tracker`.
