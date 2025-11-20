---
description: Create a GitHub PR with proper branch naming, commit, and standardized PR description
---

# Create PR Workflow

This workflow handles version control and PR creation for completed implementations, following KISS principles with clean commits and standardized PR descriptions.

## Step 1: Commit Changes

**Security Check**: Ensure clean, atomic commits

```
Create structured commit:
  - Clear, descriptive commit message
  - Reference GitHub issue number (e.g., "Fix #123: Add habit creation feature")
  - Group related changes logically
  - Ensure no sensitive data is committed
```

## Step 2: Create Branch & Push

**Security Check**: Follow established naming conventions

```
Create branch using pattern: {username}/GH-{ISSUE_NUMBER}--short-description
  - Get current GitHub username dynamically (don't assume it's always "paulo")
  - Note: This is the developer's GitHub username (which may differ from the repository owner)
  - Extract issue number from GitHub issue
  - Create descriptive short description from issue title
  - Push branch to remote repository

Example: paulo/GH-123--add-habit-creation
```

## Step 3: Create GitHub PR

**Security Check**: Use standardized PR creation with MCP

```
Use mcp_github_create_pull_request to create PR:
  - owner: Get current GitHub username/owner dynamically (don't assume it's always "CalixtoTheBugHunter")
  - repo: habit-tracker
  - title: Clear, descriptive title referencing issue
  - head: Branch name created in previous step
  - base: main (or default branch)
  - body: Simple description with bullet points focusing on WHAT, not HOW:
    * GitHub issue: #[ISSUE_NUMBER]
    * ## Description
      - Bullet point 1 (user-facing value)
      - Bullet point 2 (user-facing value)
      - etc.

Keep PR description simple:
  - Focus on user-facing value, not technical implementation
  - Use descriptive bullet points about features/changes
  - Exclude files modified, test results, commit messages

Note: GitHub automatically links PRs when using "Fixes #123" or "Closes #123" in PR description
```

## Notes

- This workflow uses MCP GitHub operations instead of CLI commands
- Branch naming pattern: {username}/GH-{ISSUE_NUMBER}--short-description (username retrieved dynamically)
- PR descriptions focus on user-facing value, not technical details
- **Owner/Repository**: Always retrieve the current GitHub username/owner dynamically. Do not hardcode "CalixtoTheBugHunter" or assume a specific owner. The repository is always "habit-tracker" but the owner should be determined at runtime.

