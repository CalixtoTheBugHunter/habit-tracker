---
description: Address comments on a pull request, one at a time with validation
---

# Address PR Comments Workflow

This workflow helps address review comments on a GitHub PR systematically, one comment at a time, with validation before making changes. It uses MCP GitHub operations to fetch comments and ensures careful, thoughtful responses to each review comment.

## Phase 1: PR Setup and Comment Retrieval

### Step 1: Get PR Information

**Security Check**: Verify access to PR and identify the branch

```
Get current GitHub username/owner dynamically (don't assume it's always "CalixtoTheBugHunter")
Use mcp_github_get_pull_request to get:
  - owner: {owner}
  - repo: habit-tracker
  - pull_number: PR_NUMBER (from user input or current branch)

Extract:
  - PR title and description
  - Head branch name (the branch with changes)
  - Base branch name
  - PR status and mergeability
```

### Step 2: Checkout PR Branch

```
Ensure you're on the correct branch:
  - If not already on the PR branch, checkout the head branch
  - Verify you're working with the latest changes
  - Confirm branch is up to date with remote
```

### Step 3: Get All PR Comments

**Security Check**: Retrieve all review comments and discussion

```
Use MCP GitHub operations to get all comments:

1. Get review comments:
   - Use mcp_github_get_pull_request_comments with owner: {owner}, repo: habit-tracker, pull_number: PR_NUMBER
   - These are comments on specific lines of code

2. Get review comments (general reviews):
   - Use mcp_github_get_pull_request_reviews with owner: {owner}, repo: habit-tracker, pull_number: PR_NUMBER
   - These are general review comments

3. Get issue comments (PR discussion):
   - Use mcp_github_list_issues to get PR as issue, then get comments
   - These are general discussion comments on the PR

For each comment, extract:
  - Comment author
  - Comment body/text
  - File path (if line-specific)
  - Line number(s) (if line-specific)
  - Created timestamp
  - Whether it's a reply to another comment
  - Review state (if from a review)
```

## Phase 2: Process Comments One at a Time

### Step 4: Organize Comments for Processing

```
Organize comments by:
  - File path (group line-specific comments by file)
  - Chronological order (oldest first, to maintain context)
  - Comment thread (group replies with their parent comments)

Create a numbered list of all comments to address
```

### Step 5: Process Each Comment Individually

**IMPORTANT**: Address ONE comment at a time. Do not move to the next comment until the current one is fully addressed.

For EACH comment, follow these steps:

#### 5a. Display Comment Information

```
Print/display the comment in this format:
  "(index). From [user] on [file]:[line] — [body]"
  
Include:
  - Comment index number
  - Author username
  - File path (if applicable)
  - Line number(s) (if applicable)
  - Full comment body
  - Timestamp
  - Whether it's part of a review (approved, changes requested, etc.)
```

#### 5b. Analyze the Context

```
Read and analyze the relevant code:
  - Read the file mentioned in the comment
  - Focus on the specific line(s) referenced
  - Understand the surrounding context (read 10-20 lines before and after)
  - Check related files if the comment suggests broader changes
  - Review the original PR description to understand intent
```

#### 5c. Validate the Comment

**CRITICAL STEP**: Before implementing any change, validate the comment:

```
Assess the comment against these criteria:

1. **Does it improve code quality?**
   - Will it make the code more maintainable?
   - Does it follow best practices?
   - Does it align with project patterns?

2. **Does it improve performance?**
   - Will it make the code faster or more efficient?
   - Does it reduce unnecessary operations?
   - Is the performance gain meaningful?

3. **Does it improve security?**
   - Does it address a security concern?
   - Does it prevent vulnerabilities?
   - Does it follow security best practices?

4. **Does it improve user experience?**
   - Will it make the feature better for users?
   - Does it fix a usability issue?
   - Does it improve accessibility?

5. **Would it introduce regressions?**
   - Could the change break existing functionality?
   - Are there edge cases that might be affected?
   - Would it conflict with other parts of the codebase?

6. **Is the current implementation already correct?**
   - Is the reviewer misunderstanding the code?
   - Is there a valid reason for the current approach?
   - Could the comment be based on outdated information?

7. **Is the suggestion clear and actionable?**
   - Do you understand what the reviewer wants?
   - Is the suggestion specific enough to implement?
   - Are there multiple ways to interpret the comment?
```

#### 5d. Decision Point: Proceed or Ask for Clarification

**If the comment doesn't make sense or would cause regressions:**

```
DO NOT make the change. Instead:
  - Explain your analysis clearly
  - State why you think the current implementation is correct
  - Explain potential issues with the suggested change
  - Ask the USER for clarification before proceeding
  - Wait for user confirmation before moving to next comment
```

**If you don't understand the comment:**

```
DO NOT make a change. Instead:
  - Clearly state what you don't understand
  - Ask the USER for clarification
  - Request specific guidance on what change is expected
  - Wait for clarification before proceeding
```

**If the comment makes sense and would be beneficial:**

```
Proceed to implement the change:
  - Make the specific change requested
  - Ensure the change addresses the comment fully
  - Verify the change doesn't break existing functionality
  - Test the change if possible (run tests, check linting)
  - Only then move to the next comment
```

#### 5e. Implement the Change (if validated)

```
When implementing the change:

1. **Make the specific change**:
   - Address exactly what the comment asks for
   - Don't over-engineer or add unrelated improvements
   - Keep changes focused and minimal

2. **Verify the change**:
   - Check that the code still compiles
   - Run linters to ensure code quality
   - Run tests if available to ensure nothing broke
   - Verify the change addresses the comment

3. **Document if needed**:
   - Add comments only if the change introduces complexity
   - Update documentation if the change affects behavior
   - Keep comments focused on "why" not "what"

4. **Confirm completion**:
   - Mark this comment as addressed
   - Note what change was made
   - Move to the next comment
```

## Phase 3: Summary and Follow-up

### Step 6: Summarize Changes Made

```
After processing all comments, provide a summary:

1. **Comments Addressed**:
   - List each comment that was successfully addressed
   - Note the specific change made for each
   - Include file paths and line numbers

2. **Comments Requiring User Attention**:
   - List comments that need clarification
   - Explain why each needs user input
   - Note any concerns or questions raised

3. **Comments That Couldn't Be Addressed**:
   - List comments that couldn't be implemented
   - Explain the reason (regression risk, unclear, etc.)
   - Suggest next steps

4. **Overall Status**:
   - Total comments processed
   - Number successfully addressed
   - Number requiring user input
   - Recommended next actions
```

### Step 7: Verify All Changes

```
Before completing, verify:
  - All addressed comments have corresponding code changes
  - No syntax errors introduced
  - Tests still pass (if applicable)
  - Linting passes
  - Changes are committed and ready for push
```

## Error Handling

- **If MCP calls fail**: Provide fallback instructions for manual comment retrieval
- **If file doesn't exist**: Check if file was renamed or moved, verify with user
- **If line numbers don't match**: The code may have changed, ask user to verify current state
- **If comment is unclear**: Always ask for clarification rather than guessing
- **If change would break tests**: Flag this and ask user how to proceed

## Best Practices

1. **One at a time**: Never batch process comments. Address each individually.
2. **Validate first**: Always validate before implementing.
3. **Ask when unsure**: It's better to ask than to make incorrect changes.
4. **Test changes**: Verify changes don't break existing functionality.
5. **Keep focused**: Address only what the comment asks for.
6. **Document decisions**: Note why certain comments weren't addressed.

## Notes

- This workflow uses MCP GitHub operations instead of CLI commands
- Comments are processed sequentially, not in parallel
- Validation is critical - don't implement changes that could cause regressions
- When in doubt, ask the user for clarification
- **Owner/Repository**: Always retrieve the current GitHub username/owner dynamically. Do not hardcode "CalixtoTheBugHunter" or assume a specific owner. The repository is always "habit-tracker" but the owner should be determined at runtime.

