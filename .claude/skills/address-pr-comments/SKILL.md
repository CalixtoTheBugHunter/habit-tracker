---
name: address-pr-comments
description: Address review comments on a GitHub PR systematically — one comment at a time, validating each before changing code. Use when the user wants to work through PR review feedback carefully.
---

# Address PR Comments Workflow

This skill addresses review comments on a GitHub PR systematically, one comment at a time, validating before making changes. GitHub operations use the `gh` CLI.

> **GitHub auth**: run `gh auth switch -u CalixtoTheBugHunter` before authenticated `gh` calls if needed (see `CLAUDE.md`). Determine the repo **owner** dynamically; the repo is always `habit-tracker`.

## Phase 1: PR Setup and Comment Retrieval

### Step 1: Get PR Information

```bash
gh pr view <PR_NUMBER> --repo <owner>/habit-tracker \
  --json number,title,body,headRefName,baseRefName,state,mergeable
```

Extract: PR title and description, head branch (with changes), base branch, status and mergeability. If no PR number is given, derive it from the current branch (`gh pr view --json ...`).

### Step 2: Checkout PR Branch

Ensure you are on the correct branch — checkout the head branch if not already on it, and confirm it is up to date with the remote.

### Step 3: Get All PR Comments

Retrieve all comments and reviews:

```bash
# Line-specific review comments
gh api repos/<owner>/habit-tracker/pulls/<PR_NUMBER>/comments

# Reviews (general review bodies + states)
gh pr view <PR_NUMBER> --repo <owner>/habit-tracker --json reviews

# General PR discussion comments
gh pr view <PR_NUMBER> --repo <owner>/habit-tracker --json comments
```

For each comment, extract: author, body/text, file path (if line-specific), line number(s), created timestamp, whether it's a reply, and review state.

## Phase 2: Process Comments One at a Time

### Step 4: Organize Comments for Processing

Organize by file path (group line-specific comments), chronological order (oldest first), and comment thread (group replies with parents). Create a numbered list of all comments to address.

### Step 5: Process Each Comment Individually

**IMPORTANT**: Address ONE comment at a time. Do not move on until the current one is fully addressed.

#### 5a. Display Comment Information

Display in the format: `(index). From [user] on [file]:[line] — [body]`, including index, author, file/line (if applicable), full body, timestamp, and review state.

#### 5b. Analyze the Context

Read the relevant file, focus on the referenced line(s), understand the surrounding context (10–20 lines before/after), check related files, and review the PR description for intent.

#### 5c. Validate the Comment

Before implementing any change, assess it against these criteria:

1. **Does it improve code quality?** (maintainability, best practices, aligns with project patterns)
2. **Does it improve performance?** (faster/more efficient, fewer operations, meaningful gain)
3. **Does it improve security?** (addresses a concern, prevents vulnerabilities)
4. **Does it improve user experience?** (better feature, usability, accessibility)
5. **Would it introduce regressions?** (break existing functionality, edge cases, conflicts)
6. **Is the current implementation already correct?** (reviewer misunderstanding, valid current approach, outdated info)
7. **Is the suggestion clear and actionable?** (understood, specific, single interpretation)

#### 5d. Decision Point: Proceed or Ask for Clarification

**If the comment doesn't make sense or would cause regressions**: do NOT make the change. Explain your analysis, state why the current implementation is correct, explain issues with the suggestion, ask the USER for clarification, and wait for confirmation before moving on.

**If you don't understand the comment**: do NOT make a change. State what you don't understand, ask the USER, request specific guidance, and wait.

**If the comment makes sense and is beneficial**: proceed to implement — make the specific change, ensure it fully addresses the comment, verify it doesn't break existing functionality, test it (run tests, check linting), then move on.

#### 5e. Implement the Change (if validated)

1. **Make the specific change**: address exactly what's asked; don't over-engineer or add unrelated improvements; keep it focused and minimal.
2. **Verify**: code compiles, linters pass, tests pass, the change addresses the comment.
3. **Document if needed**: comments only if the change adds complexity; focus on "why" not "what".
4. **Confirm completion**: mark the comment addressed, note the change, move to the next.

## Phase 3: Summary and Follow-up

### Step 6: Summarize Changes Made

Provide a summary: comments addressed (with the change and file/line), comments requiring user attention (with why), comments that couldn't be addressed (with reason and next steps), and overall status (totals: processed, addressed, needing input, recommended actions).

### Step 7: Verify All Changes

Confirm all addressed comments have code changes, no syntax errors were introduced, tests still pass, linting passes, and changes are committed and ready to push.

## Error Handling

- **`gh` calls fail**: provide fallback instructions for manual comment retrieval.
- **File doesn't exist**: check if it was renamed/moved; verify with the user.
- **Line numbers don't match**: the code may have changed; ask the user to verify current state.
- **Comment unclear**: always ask for clarification rather than guessing.
- **Change would break tests**: flag it and ask how to proceed.

## Best Practices

1. **One at a time** — never batch process comments.
2. **Validate first** — always validate before implementing.
3. **Ask when unsure** — better to ask than make incorrect changes.
4. **Test changes** — verify nothing breaks.
5. **Keep focused** — address only what the comment asks.
6. **Document decisions** — note why certain comments weren't addressed.

## Notes

- GitHub operations use the `gh` CLI (no GitHub MCP configured).
- Comments are processed sequentially, not in parallel.
- **Owner/Repository**: retrieve the owner dynamically; repo is always `habit-tracker`.
