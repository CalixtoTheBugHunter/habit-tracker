---
name: generate-issue
description: Generate a well-structured GitHub issue using the INVEST technique (Independent, Negotiable, Valuable, Estimable, Small, Testable). Use when the user wants to turn a feature request, user story, or technical requirement into a GitHub issue.
---

# Generate GitHub Issue Workflow

This skill creates well-structured, actionable GitHub issues using the INVEST technique for feature requests, tasks, and other issue types. All GitHub operations use the `gh` CLI.

> **GitHub auth**: run `gh auth switch -u CalixtoTheBugHunter` before authenticated `gh` calls if multiple accounts are logged in (see `CLAUDE.md`). Determine the repo **owner** dynamically (`gh repo view --json owner -q .owner.login`) — never hardcode it. The repo is always `habit-tracker`.

## Phase 1: Information Analysis and Validation

### Step 1: Analyze Input Requirements

- Review the provided input (feature request, user story, technical requirement).
- Identify the core need or problem being addressed.
- Extract key stakeholders, business value, and technical considerations.
- Note any referenced issues, documentation, or existing systems.

### Step 2: Search for Existing Issues

Search for duplicate or related issues:

```bash
gh issue list --repo <owner>/habit-tracker --state open --search "<keywords>"
```

- Search by keywords from the requirement description.
- Check for similar features or user stories.
- Look for related or parent issues.
- Identify dependencies or blocking issues.

### Step 3: Retrieve Referenced Documentation

Gather context from referenced sources:

- Retrieve mentioned GitHub issues for additional context: `gh issue view <n> --repo <owner>/habit-tracker`.
- Review README or project documentation (use Read/Grep/Glob).
- Check for related technical or business documentation in the repository.

## Phase 2: INVEST Criteria Evaluation

### Step 4: Evaluate Against INVEST Criteria

- **Independent**: Can this be developed without dependencies on incomplete work? Any blocking issues?
- **Negotiable**: Are the details flexible enough for team discussion? Room for implementation decisions?
- **Valuable**: Does this deliver clear value to users or the business? Is the impact defined?
- **Estimable**: Is there enough information to estimate effort? Are technical requirements detailed?
- **Small**: Is the scope appropriate for a single iteration? Should it be split?
- **Testable**: Can clear acceptance criteria be defined? Are success metrics identifiable?

### Step 5: Identify Information Gaps

Create a list of clarification questions for any INVEST criteria not met (missing business value, unclear technical requirements, undefined acceptance criteria, scope too large, insufficient detail for estimation).

## Phase 3: Issue Structure Creation

### Step 6: Determine Appropriate Issue Type

Select appropriate labels: **feature**, **enhancement**, **task**, **bug**, **documentation**.

### Step 7: Structure the Issue Content

Create comprehensive issue content with sections when applicable:

**DESCRIPTION**: What needs to be done, business context/rationale, user impact/value.

**USER STORY** (for features): As a [user type] / I want [functionality] / So that [benefit].

**ACCEPTANCE CRITERIA**: Clear, testable criteria using Given/When/Then; specific success metrics; definition of done. NOTE: use `[]` checklist syntax.

**TECHNICAL REQUIREMENTS** (if applicable): constraints, integration requirements, performance/security requirements.

**REFERENCES**: Links to relevant documentation or related issues.

Use `gh issue create` fields (NOT the description body) for:
- **TITLE**: `--title` — concise, action-oriented
- **LABELS**: `--label` — feature, enhancement, task, etc.
- **ASSIGNEE**: `--assignee` — the person running this workflow (if applicable)
- **MILESTONE**: `--milestone` — if applicable
- **PROJECT**: `--project` — if needed
- **RELATED ISSUES**: reference with `#issue-number` in the body
- **DEPENDENCIES**: note blocking or related work

### Step 8: Validate Issue Completeness

- [ ] **Independent**: No unresolved dependencies
- [ ] **Negotiable**: Implementation details flexible
- [ ] **Valuable**: Clear business or user value
- [ ] **Estimable**: Sufficient detail for estimation
- [ ] **Small**: Appropriate scope for single iteration
- [ ] **Testable**: Clear acceptance criteria defined
- [ ] All required sections completed
- [ ] Technical accuracy verified
- [ ] No sensitive information included
- [ ] Related issues and documentation referenced

## Phase 4: GitHub Issue Creation

### Step 9: Verify GitHub Access

Confirm access to `<owner>/habit-tracker` and permissions: `gh repo view <owner>/habit-tracker`.

### Step 10: Create GitHub Issue

```bash
gh issue create \
  --repo <owner>/habit-tracker \
  --title "<issue title>" \
  --body "<complete issue content in Markdown>" \
  --label "<feature|enhancement|task|...>" \
  --assignee "<current user, if applicable>" \
  --milestone "<milestone, if applicable>"
```

## Phase 5: Validation and Follow-up

### Step 11: Verify Issue Creation

- Confirm the issue was created; note the issue number and URL.
- Validate all information transferred correctly and INVEST criteria are met.

### Step 12: Provide Final Summary

- Created issue number and URL
- Summary of issue content and type
- INVEST criteria validation results
- Any follow-up actions needed
- References to related issues/documentation
- Copy the GitHub issue link so it's easy to share

## Error Handling

- **`gh` failures**: provide structured issue content for manual creation (all formatted sections for copy-paste); note missing information.
- **INVEST criteria not met**: create a **CLARIFICATION NEEDED** section listing the specific criteria, provide targeted questions, suggest breaking large issues down, and pause until clarified.
- **Duplicate detection**: reference the existing issue; decide whether a new issue is needed or the existing one should be updated/linked.

## Security Guidelines

- Never include user IDs, employee names, or PII in issue descriptions.
- Sanitize credentials or sensitive configuration details; use generic terms for personal references.
- Verify repository permissions before creation; ensure appropriate labels/assignees.

## INVEST Technique Reference

- **Independent**: developable and deliverable independently, minimal dependencies.
- **Negotiable**: enough detail to be clear but leaves room for implementation discussion.
- **Valuable**: delivers clear value that justifies the effort.
- **Estimable**: enough information to estimate effort.
- **Small**: completable within a single iteration (typically 1–3 days).
- **Testable**: clear acceptance criteria to determine completion.

## Notes

- All GitHub operations use the `gh` CLI (no GitHub MCP is configured).
- **Owner/Repository**: retrieve the owner dynamically; repo is always `habit-tracker`.
