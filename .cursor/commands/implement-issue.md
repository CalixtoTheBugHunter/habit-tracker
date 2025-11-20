---
description: Complete workflow to implement a GitHub issue from analysis to PR creation
---

# Implement GitHub Issue Workflow

This workflow guides you through implementing a GitHub issue using MCP servers for GitHub integration, following KISS principles with comprehensive testing and security measures.

## Phase 1: Issue Selection & Validation

### Step 1: Verify GitHub Access

**Security Check**: Verify MCP server connection and repository access

```
Verify connection to GitHub MCP server
- Get current GitHub username/owner dynamically (don't assume it's always "CalixtoTheBugHunter")
- Confirm access to {owner}/habit-tracker repository
```

### Step 2: Select GitHub Issue

**User Input Required**: Ask user to provide GitHub issue number or search criteria

```
If issue number provided:
  - Get current GitHub username/owner dynamically (don't assume it's always "CalixtoTheBugHunter")
  - Use mcp_github_get_issue with owner: {owner}, repo: habit-tracker, issue_number: ISSUE_NUMBER
  - Display: title, body, labels, assignee, state
  - Ask user to confirm this is the correct issue

If search needed:
  - Get current GitHub username/owner dynamically (don't assume it's always "CalixtoTheBugHunter")
  - Use mcp_github_list_issues with owner: {owner}, repo: habit-tracker, state: open
  - Present list of matching issues
  - Ask user to select specific issue
```

### Step 3: Issue Analysis & Clarification

**Security Check**: Ensure issue has sufficient detail for implementation

```
Analyze issue for:
  - Clear requirements and acceptance criteria
  - Technical specifications
  - Dependencies or related issues
  - Labels and priority indicators
  - Match INVEST pattern

If information is unclear or missing:
  - Ask user for clarification on specific points
  - Get current GitHub username/owner dynamically (don't assume it's always "CalixtoTheBugHunter")
  - Use mcp_github_add_issue_comment with owner: {owner}, repo: habit-tracker to request clarification from reporter/assignee
  - STOP workflow until clarification is provided
```

## Phase 2: Project Analysis & Pattern Study

### Step 4: Analyze Related Code Patterns

**Security Check**: Understand existing architecture before making changes

```
Based on issue requirements, identify:
  - Similar existing features or components
  - Relevant file patterns and directory structure
  - Used libraries and dependencies
  - Existing test patterns and coverage

Use codebase_search to find:
  - Similar implementations
  - Test files for reference
  - Type definitions and interfaces
  - API patterns and data flow
```

### Step 5: Study Test Strategies

**Security Check**: Ensure comprehensive test coverage plan

```
Analyze existing test patterns:
  - Unit test structure and naming conventions
  - Integration test approaches
  - Edge case handling patterns
  - Mock data and fixture patterns
  - Test utilities and helpers

Create test plan covering:
  - Happy path scenarios
  - Edge cases and error handling
  - Integration points
  - TypeScript type safety (if applicable)
```

## Phase 3: Implementation Planning

### Step 6: Create Implementation Plan

**Security Check**: Validate approach follows KISS principles

```
Based on analysis, create plan including:
  - Files to be created/modified
  - Implementation approach (following existing patterns)
  - Test strategy and coverage
  - Potential breaking changes or dependencies
  - Rollback plan if needed

Present plan to user for approval before proceeding
```

## Phase 4: Implementation

### Step 7: Implement Core Functionality

**Security Check**: Follow established patterns and maintain code quality

```
Implement following KISS principles:
  - Use existing patterns and utilities
  - Keep functions small and focused
  - Follow TypeScript/JavaScript best practices
  - Maintain consistent naming conventions
  - Add proper error handling
  - Include comprehensive JSDoc comments for complex functions only
  - Don't create redundant comments, code needs to be self documented when possible
```

### Step 8: Create Comprehensive Tests

**Security Check**: Ensure all code paths are tested

```
Create tests covering:
  - Unit tests for all functions/components
  - Integration tests for data flow
  - Edge cases and error scenarios
  - TypeScript type validation (if applicable)
  - Mock data following fixture patterns
  - No dumb tests
  - No redundant tests

Run tests to ensure:
  - All new tests pass
  - No existing tests are broken
  - Coverage meets project standards

ONLY PASS TO NEXT STEP WHEN ALL TESTS ARE PASSING
```

### Step 9: Fix TypeScript & Lint Issues

**Security Check**: Maintain code quality standards

```
Run and fix:
  - TypeScript compilation errors (if applicable)
  - ESLint warnings and errors
  - Prettier formatting issues
  - Import organization
  - Unused variables/imports

Ensure all checks pass before proceeding
```

## Phase 5: Testing & Validation

### Step 10: Request Manual Testing

**User Interaction Required**: Get user validation

```
Verify the app runs locally:
  - Run `npm run dev` to start the development server
  - Verify the app loads without errors
  - NEVER run `npm run build` in this workflow - use `npm run dev` instead

Provide user with:
  - Summary of implemented changes
  - Instructions for manual testing
  - Expected behavior and outcomes
  - Edge cases to verify

Wait for user confirmation that manual testing is complete and successful

Note: Browser-based testing with Cursor Browser navigation will be added when local dev server is available
```

## Phase 6: Version Control & PR Creation

### Step 11: Create PR

**Security Check**: Use standardized PR creation workflow

```
Use the /create-pr command to handle:
  - Committing changes with proper messages
  - Creating branch with correct naming pattern
  - Creating GitHub PR with standardized description

The /create-pr workflow will handle all version control and PR creation steps.
```

## Security Measures Summary

- **Authentication Verification**: Confirm MCP server access at start
- **Input Validation**: Verify issue details and user inputs
- **Code Quality Gates**: TypeScript, linting, and test coverage
- **Pattern Compliance**: Follow established architecture patterns
- **Manual Validation**: User testing before PR creation
- **Atomic Changes**: Clean commits with proper documentation
- **Traceability**: Link all changes back to GitHub issue

## Error Handling

- If any MCP server call fails, provide clear error message and retry options
- If tests fail, stop workflow and request fixes
- If user input is unclear, ask for clarification before proceeding
- If manual testing fails, return to implementation phase
- Maintain rollback capability at each phase

## Notes

- This workflow uses MCP GitHub operations instead of CLI commands
- Each phase has clear security checkpoints
- User approval is required at critical decision points
- All changes are traceable back to the original GitHub issue
- Follows established project patterns and conventions
- Branch naming pattern: {username}/GH-{ISSUE_NUMBER}--short-description (username retrieved dynamically)
- PR creation is handled by the /create-pr command
- **Owner/Repository**: Always retrieve the current GitHub username/owner dynamically. Do not hardcode "CalixtoTheBugHunter" or assume a specific owner. The repository is always "habit-tracker" but the owner should be determined at runtime.

