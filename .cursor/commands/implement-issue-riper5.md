---
description: Complete workflow to implement a GitHub issue using RIPER-5 protocol with mandatory human approval at each mode transition
rules:
  - riper-5
---

# Implement GitHub Issue Workflow (RIPER-5 Protocol)

This workflow guides you through implementing a GitHub issue using MCP servers for GitHub integration, following RIPER-5 protocol with mandatory human approval at each mode transition. All phases must be reviewed and approved by the user, ensuring user accountability throughout the process.

**CRITICAL**: You MUST begin every single response with your current mode in brackets: [MODE: MODE_NAME]. Failure to declare your mode is a critical violation of protocol.

## MODE 1: RESEARCH

**Purpose**: Information gathering and understanding ONLY

**Permitted**: Reading files, asking clarifying questions, understanding code structure, gathering information
**Forbidden**: Suggestions, implementations, planning, or any hint of action
**Requirement**: You may ONLY seek to understand what exists, not what could be

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

### RESEARCH Mode Transition Checkpoint

**User Approval Required**: Before proceeding to INNOVATE mode

```
Present summary of research findings:
  - Issue requirements and acceptance criteria identified
  - Related code patterns and architecture understood
  - Test strategies and patterns documented
  - Any clarifications needed or obtained

Request explicit user approval:
  - User must signal "ENTER INNOVATE MODE" to proceed
  - User may request additional research or clarification
  - User may provide feedback on research findings

DO NOT proceed to INNOVATE mode without explicit user signal.
```

## MODE 2: INNOVATE

**Purpose**: Brainstorming potential approaches

**Permitted**: Discussing ideas, advantages/disadvantages, seeking feedback
**Forbidden**: Concrete planning, implementation details, or any code writing
**Requirement**: All ideas must be presented as possibilities, not decisions

### Solution Brainstorming

```
Based on research findings, brainstorm potential solutions:
  - Present multiple approach possibilities
  - Discuss advantages and disadvantages of each approach
  - Consider different implementation strategies
  - Explore alternative solutions
  - Evaluate trade-offs and considerations

Present all ideas as possibilities, not decisions:
  - Use language like "One possibility is..." or "Another approach could be..."
  - Avoid definitive statements about what will be implemented
  - Seek user feedback on preferred direction
  - Allow user to suggest alternatives or modifications
```

### INNOVATE Mode Transition Checkpoint

**User Approval Required**: Before proceeding to PLAN mode

```
Present brainstormed solutions:
  - List all approach possibilities discussed
  - Highlight advantages/disadvantages of each
  - Indicate any user preferences expressed

Request explicit user approval:
  - User must signal "ENTER PLAN MODE" to proceed
  - User may request more innovation or alternative approaches
  - User may provide feedback on brainstormed solutions

DO NOT proceed to PLAN mode without explicit user signal.
```

## MODE 3: PLAN

**Purpose**: Creating exhaustive technical specification

**Permitted**: Detailed plans with exact file paths, function names, and changes
**Forbidden**: Any implementation or code writing, even "example code"
**Requirement**: Plan must be comprehensive enough that no creative decisions are needed during implementation

### Step 6: Create Implementation Plan

**Security Check**: Validate approach follows KISS principles

```
Based on research and innovation phases, create plan including:
  - Files to be created/modified (with exact paths)
  - Implementation approach (following existing patterns)
  - Exact function names, component names, and structure
  - Test strategy and coverage (specific test cases)
  - Potential breaking changes or dependencies
  - Rollback plan if needed

Present plan to user for approval before proceeding
```

### Mandatory Checklist Conversion

**Required Final Step**: Convert entire plan into numbered, sequential checklist

```
Convert the complete implementation plan into a numbered, sequential checklist:
  - Each atomic action as a separate item
  - Specific enough that no creative decisions are needed
  - Include exact file paths, function names, and changes
  - Order actions in logical sequence

Format:
IMPLEMENTATION CHECKLIST:
1. [Specific action 1]
2. [Specific action 2]
...
n. [Final action]
```

### PLAN Mode Transition Checkpoint

**User Approval Required**: Before proceeding to EXECUTE mode

```
Present complete implementation plan:
  - Detailed technical specification
  - Numbered, sequential implementation checklist
  - All file paths, function names, and changes specified

Request explicit user approval:
  - User must signal "ENTER EXECUTE MODE" to proceed
  - User may request plan modifications or clarifications
  - User may provide feedback on the plan

DO NOT proceed to EXECUTE mode without explicit user signal.
```

## MODE 4: EXECUTE

**Purpose**: Implementing EXACTLY what was planned in Mode 3

**Permitted**: ONLY implementing what was explicitly detailed in the approved plan
**Forbidden**: Any deviation, improvement, or creative addition not in the plan
**Entry Requirement**: ONLY enter after explicit "ENTER EXECUTE MODE" command from user
**Deviation Handling**: If ANY issue is found requiring deviation, IMMEDIATELY return to PLAN mode

### Step 7: Implement Core Functionality

**Security Check**: Follow established patterns and maintain code quality

```
Implement following the approved plan EXACTLY:
  - Use existing patterns and utilities
  - Keep functions small and focused
  - Follow TypeScript/JavaScript best practices
  - Maintain consistent naming conventions
  - Add proper error handling
  - Include comprehensive JSDoc comments for complex functions only
  - Don't create redundant comments, code needs to be self documented when possible

If any deviation from plan is needed:
  - IMMEDIATELY stop execution
  - Return to PLAN mode
  - Request user approval for plan modification
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

### EXECUTE Mode Transition Checkpoint

**User Approval Required**: Before proceeding to REVIEW mode

```
Present summary of execution:
  - All implemented changes completed
  - All tests passing
  - All TypeScript and linting checks passing
  - Confirmation that implementation matches plan exactly

Request explicit user approval:
  - User must signal "ENTER REVIEW MODE" to proceed
  - User may request fixes or modifications
  - User may provide feedback on implementation

DO NOT proceed to REVIEW mode without explicit user signal.
```

## MODE 5: REVIEW

**Purpose**: Ruthlessly validate implementation against the plan

**Permitted**: Line-by-line comparison between plan and implementation
**Required**: EXPLICITLY FLAG ANY DEVIATION, no matter how minor
**Deviation Format**: ":warning: DEVIATION DETECTED: [description of exact deviation]"

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

### Step 11: Validate Implementation Against Plan

```
Perform line-by-line comparison:
  - Compare each implemented item against the approved plan
  - Verify all checklist items were completed
  - Check that file paths, function names, and changes match exactly
  - Identify any deviations, no matter how minor

For each deviation found:
  - Flag with format: ":warning: DEVIATION DETECTED: [description]"
  - Document the exact deviation
  - Note whether deviation requires plan modification or can be accepted

Report final verdict:
  - ":white_check_mark: IMPLEMENTATION MATCHES PLAN EXACTLY" OR
  - ":cross_mark: IMPLEMENTATION DEVIATES FROM PLAN"
```

### Step 12: Create PR

**Security Check**: Use standardized PR creation workflow

```
Use the /create-pr command to handle:
  - Committing changes with proper messages
  - Creating branch with correct naming pattern
  - Creating GitHub PR with standardized description

The /create-pr workflow will handle all version control and PR creation steps.
```

### REVIEW Mode Completion

```
Present final review findings:
  - Implementation validation results
  - Manual testing confirmation
  - PR creation status
  - Final verdict on plan compliance

Workflow complete.
```

## Security Measures Summary

- **Authentication Verification**: Confirm MCP server access at start
- **Input Validation**: Verify issue details and user inputs
- **Code Quality Gates**: TypeScript, linting, and test coverage
- **Pattern Compliance**: Follow established architecture patterns
- **Manual Validation**: User testing before PR creation
- **Atomic Changes**: Clean commits with proper documentation
- **Traceability**: Link all changes back to GitHub issue
- **Mode Transition Security**: Mandatory user approval at each mode transition

## Error Handling

- If any MCP server call fails, provide clear error message and retry options
- If tests fail, stop workflow and request fixes
- If user input is unclear, ask for clarification before proceeding
- If manual testing fails, return to EXECUTE mode (or PLAN mode if plan modification needed)
- If deviation detected in EXECUTE mode, IMMEDIATELY return to PLAN mode
- Maintain rollback capability at each mode
- If user requests mode repetition, return to appropriate mode

## Notes

- This workflow uses MCP GitHub operations instead of CLI commands
- Each mode has clear security checkpoints and user approval requirements
- User approval is required at EVERY mode transition
- All changes are traceable back to the original GitHub issue
- Follows established project patterns and conventions
- Branch naming pattern: {username}/GH-{ISSUE_NUMBER}--short-description (username retrieved dynamically)
- PR creation is handled by the /create-pr command
- **Owner/Repository**: Always retrieve the current GitHub username/owner dynamically. Do not hardcode "CalixtoTheBugHunter" or assume a specific owner. The repository is always "habit-tracker" but the owner should be determined at runtime.
- **RIPER-5 Protocol**: This command enforces RIPER-5 protocol with mandatory mode declarations and user approval at each transition. The user is always accountable for AI actions and decisions.

