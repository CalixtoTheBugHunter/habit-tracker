---
description: Comprehensive QA testing workflow for GitHub issues using browser testing and accessibility checks
---

# Test Issue Workflow

This workflow provides comprehensive QA testing for GitHub issue implementations using browser testing, accessibility checks, and known QA techniques. Outputs either approval or a detailed plan to address found issues.

## Phase 1: Issue Retrieval & Analysis

### Step 1: Get GitHub Issue Details

**Input Required**: GitHub issue number or owner/repo/issue_number

```
If issue number provided:
  - Use mcp_github_get_issue with repo: habit-tracker, issue_number: ISSUE_NUMBER
  - Extract and document:
    * Title
    * Description
    * Acceptance criteria (from body, checklists, or comments)
    * Labels
    * Related PRs (if any)
    * Comments with additional context

If search needed:
  - Use mcp_github_list_issues with repo: habit-tracker
  - Present list of matching issues
  - Ask user to select specific issue
```

### Step 2: Extract Acceptance Criteria

**Critical**: Parse acceptance criteria from issue body

```
Identify acceptance criteria from:
  - Markdown checklists (- [ ] or - [x])
  - Numbered lists
  - "Acceptance Criteria:" section
  - "Given/When/Then" scenarios
  - "As a... I want... So that..." format

Create structured list:
  - Each criterion as a testable requirement
  - Priority/importance if indicated
  - Dependencies between criteria
```

### Step 3: Identify Related Code

**Security Check**: Understand implementation scope

```
Use codebase_search to find:
  - Files mentioned in issue or PR
  - Related components/services
  - Test files for reference
  - Type definitions
  - Similar features for pattern comparison

Review related PRs (if any):
  - Get PR details using mcp_github_get_pull_request
  - Review changed files
  - Check PR comments for context
```

## Phase 2: Test Environment Setup

### Step 4: Verify Dev Server

**Prerequisite**: Ensure application is running

```
Check if dev server is running:
  - Attempt to navigate to http://localhost:5173
  - If not accessible:
    * Run `npm run dev` in background
    * Wait for server to start (check for "Local: http://localhost:5173")
    * Verify server is responsive

If server fails to start:
  - Check for port conflicts
  - Verify dependencies are installed
  - Report error and request user intervention
```

### Step 5: Initial Browser State

**Baseline**: Establish clean testing state

```
Navigate to http://localhost:5173
Take initial snapshot to verify:
  - Page loads without errors
  - No console errors (check browser_console_messages)
  - Application is in expected initial state
  - Check network requests for failed resources

If errors found:
  - Document errors
  - Determine if they block testing
  - Report to user if critical
```

## Phase 3: Acceptance Criteria Testing

### Step 6: Test Each Acceptance Criterion

**Systematic**: Test every requirement methodically

```
For each acceptance criterion:

1. Identify test scenario:
   - What user action is required?
   - What is the expected outcome?
   - What data/state is needed?

2. Execute test:
   - Navigate to relevant page/section
   - Perform required actions using browser tools:
     * browser_click for buttons/links
     * browser_type for form inputs
     * browser_select_option for dropdowns
     * browser_hover for hover states
   - Wait for expected changes (browser_wait_for)
   - Take snapshot to verify state

3. Verify result:
   - Check if expected behavior occurred
   - Verify UI updates correctly
   - Check console for errors
   - Verify data persistence (if applicable)

4. Document result:
   - ✅ PASS: Criterion met
   - ❌ FAIL: Criterion not met (document issue)
   - ⚠️ PARTIAL: Partially met (document gaps)
   - ⏭️ SKIP: Cannot test (document reason)
```

### Step 7: Edge Case Testing

**Comprehensive**: Test scenarios not explicitly covered

```
Test common edge cases:

1. Input Validation:
   - Empty inputs
   - Extremely long inputs
   - Special characters
   - Whitespace-only inputs
   - Invalid data types
   - Boundary values (min/max)

2. State Management:
   - Rapid repeated actions
   - Actions during loading states
   - Actions with no data
   - Actions with maximum data
   - Concurrent actions

3. Error Handling:
   - Network failures (simulate if possible)
   - Invalid operations
   - Missing required data
   - Conflicting states

4. Browser Behavior:
   - Page refresh during operations
   - Browser back/forward navigation
   - Multiple tabs (if applicable)
   - Browser resize

5. Data Persistence:
   - Clear browser storage and test
   - Test with existing data
   - Test data migration (if applicable)

6. Integration Points:
   - Interactions with other features
   - Shared state/context
   - Component lifecycle

Document all edge case results
```

## Phase 4: Accessibility Testing

### Step 8: WCAG Compliance Checks

**Standard**: Follow WCAG 2.1 Level AA guidelines

```
Test accessibility using browser snapshots:

1. Keyboard Navigation:
   - Tab through all interactive elements
   - Verify focus indicators are visible
   - Test Enter/Space activation
   - Verify logical tab order
   - Test Escape key for modals/dialogs

2. Screen Reader Compatibility:
   - Check for proper ARIA labels
   - Verify heading hierarchy (h1, h2, etc.)
   - Check for alt text on images
   - Verify form labels are associated
   - Check for ARIA roles where needed

3. Visual Accessibility:
   - Check color contrast (if visible in snapshot)
   - Verify text is readable
   - Check for text alternatives for images
   - Verify focus indicators are visible
   - Test with browser zoom (100%, 150%, 200%)

4. Semantic HTML:
   - Verify proper use of HTML5 semantic elements
   - Check form elements are properly labeled
   - Verify buttons vs links are used correctly
   - Check for proper heading structure

5. ARIA Attributes:
   - Check for aria-label where needed
   - Verify aria-describedby for help text
   - Check aria-live regions for dynamic content
   - Verify aria-expanded for collapsible content
   - Check aria-required for form fields

Document all accessibility findings
```

### Step 9: Responsive Design Testing

**Cross-device**: Verify mobile/tablet/desktop compatibility

```
Test responsive behavior:

1. Resize browser window:
   - Desktop (1920x1080, 1280x720)
   - Tablet (768x1024)
   - Mobile (375x667, 414x896)

2. For each size:
   - Take snapshot
   - Verify content is readable
   - Check for horizontal scrolling
   - Verify interactive elements are accessible
   - Check layout doesn't break

Document responsive issues
```

## Phase 5: Performance Observations

### Step 10: Performance Observations

**Monitoring**: Check for obvious performance issues

```
Monitor during testing:

1. Load Times:
   - Initial page load
   - Component rendering
   - Data fetching operations

2. Network Requests:
   - Check browser_network_requests
   - Verify no unnecessary requests
   - Check for failed requests
   - Verify request efficiency

3. Console Warnings:
   - Check browser_console_messages
   - Document warnings/errors
   - Check for React warnings
   - Verify no memory leaks (if observable)

4. User Experience:
   - Verify smooth interactions
   - Check for loading states
   - Verify error states are handled gracefully

Document performance observations
```

## Phase 6: Test Results & Reporting

### Step 11: Compile Test Results

**Comprehensive**: Create detailed test report

```
Create test report with:

1. Executive Summary:
   - Overall status (APPROVED / ISSUES FOUND)
   - Total criteria tested
   - Pass/fail/partial counts
   - Critical issues count

2. Acceptance Criteria Results:
   - For each criterion:
     * Status (PASS/FAIL/PARTIAL/SKIP)
     * Test steps performed
     * Actual vs expected results
     * Screenshots/evidence (if applicable)

3. Edge Case Results:
   - List of edge cases tested
   - Results for each
   - Issues found

4. Accessibility Results:
   - WCAG compliance status
   - Issues found by category
   - Severity of issues

5. Performance Observations:
   - Any performance concerns
   - Network request issues
   - Console errors/warnings
```

### Step 12: Create Action Plan (if issues found)

**Detailed**: Provide actionable remediation plan

```
If issues found, create plan with:

1. Critical Issues (Blocking):
   - Description
   - Steps to reproduce
   - Expected vs actual behavior
   - Suggested fix approach
   - Priority: HIGH

2. Major Issues (Important):
   - Description
   - Impact assessment
   - Suggested fix approach
   - Priority: MEDIUM

3. Minor Issues (Nice to have):
   - Description
   - Suggested improvements
   - Priority: LOW

4. Accessibility Issues:
   - WCAG violation
   - Impact on users
   - Suggested fix
   - Priority based on severity

For each issue:
  - Provide specific file/component reference
  - Suggest code changes (but DO NOT implement)
  - Estimate complexity
  - Link to related acceptance criteria (if applicable)

WAIT FOR USER APPROVAL before implementing any fixes
```

### Step 13: Final Decision

**Output**: Approval or Action Plan

```
If all criteria pass and no critical issues:
  ✅ APPROVED
  - Issue implementation meets all requirements
  - No blocking issues found
  - Ready for merge (pending user review)

If issues found:
  📋 ACTION PLAN CREATED
  - Present detailed plan
  - Wait for user approval
  - After approval, implement fixes following TDD
  - Re-test after fixes
```

## QA Techniques Applied

1. **Equivalence Partitioning**: Test representative values from each partition
2. **Boundary Value Analysis**: Test min, max, and boundary values
3. **Error Guessing**: Use experience to identify likely failure points
4. **Exploratory Testing**: Explore beyond explicit requirements
5. **Regression Testing**: Verify existing functionality still works
6. **Usability Testing**: Verify intuitive user experience
7. **Accessibility Testing**: WCAG 2.1 Level AA compliance
8. **Cross-browser Compatibility**: Test in different viewport sizes
9. **Performance Testing**: Monitor load times and resource usage
10. **Security Testing**: Verify input validation and error handling

## Security Measures

- **No Code Changes Without Approval**: All fixes require user approval
- **Read-Only Testing**: Browser testing is non-destructive
- **Data Safety**: Use test data, avoid production data
- **Rollback Capability**: Document all findings for traceability

## Error Handling

- If dev server fails: Report error, request user intervention
- If browser navigation fails: Retry, document error
- If MCP calls fail: Provide clear error, retry options
- If critical issues found: Stop testing, create action plan
- If unclear requirements: Ask user for clarification

## Notes

- **Owner/Repository**: Always retrieve the current GitHub username/owner dynamically. Do not hardcode "CalixtoTheBugHunter" or assume a specific owner. The repository is always "habit-tracker" but the owner should be determined at runtime.
- All browser testing is non-destructive
- Screenshots/snapshots are taken for evidence
- Test results are comprehensive and traceable
- User approval required for all code changes
- Follow TDD when implementing fixes
- Re-test after fixes are implemented

