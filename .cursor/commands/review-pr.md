---
description: Review PR focusing on security, performance, accessibility, code smells, and unnecessary comments
---

# Review PR Workflow

This workflow performs a focused code review of a GitHub PR, analyzing security risks, performance issues, accessibility concerns, code smells, and unnecessary comments using MCP GitHub operations and codebase analysis.

## Phase 1: PR Information Gathering

### Step 1: Get PR Details

**Security Check**: Verify access to PR and gather metadata

```
Get current GitHub username/owner dynamically (don't assume it's always "CalixtoTheBugHunter")
Use mcp_github_get_pull_request to get:
  - owner: {owner}
  - repo: habit-tracker
  - pull_number: PR_NUMBER (from user input or current branch)

Extract and display:
  - PR title, description, author
  - Files changed (additions, deletions)
  - Base and head branches
  - Labels and status
```

### Step 2: Get Changed Files

```
Use mcp_github_get_pull_request_files to get:
  - owner: {owner}
  - repo: habit-tracker
  - pull_number: PR_NUMBER

List all changed files with:
  - File paths
  - Additions and deletions per file
  - Status (added, modified, removed, renamed)
```

### Step 3: Get PR Comments and Reviews

```
Use mcp_github_get_pull_request_comments and mcp_github_get_pull_request_reviews to:
  - Gather existing review comments
  - Check for previous security or performance concerns
  - Identify areas already flagged for review
```

## Phase 2: Security Review

### Step 4: Security Risk Analysis

**Security Check**: Identify vulnerabilities and security concerns

```
For each changed file, analyze:

1. **Authentication & Authorization**:
   - Verify proper access controls
   - Check for hardcoded credentials or tokens
   - Validate permission checks before sensitive operations

2. **Input Validation**:
   - Check for SQL injection risks
   - Validate XSS prevention measures
   - Review input sanitization

3. **Data Exposure**:
   - Identify PII (Personally Identifiable Information) handling
   - Check for sensitive data in logs, errors, or responses
   - Verify encryption for sensitive data at rest and in transit

4. **Dependencies**:
   - Check for known vulnerable packages
   - Review new dependencies for security track record
   - Verify dependency versions are up to date

5. **API Security**:
   - Validate rate limiting
   - Check CORS configuration
   - Review authentication headers and tokens

Use codebase_search to find:
  - Similar security patterns in existing code
  - Security utilities and validation functions
  - Previous security implementations
```

### Step 5: PII and Privacy Concerns

**Security Check**: Identify personal data handling issues

```
Analyze code for:
  - User data collection and storage
  - Data retention policies
  - GDPR/privacy compliance concerns
  - Unnecessary data collection
  - Proper data anonymization where needed
  - Secure data deletion mechanisms

Flag any:
  - Email addresses, phone numbers, SSNs, or other PII in code
  - User data in error messages or logs
  - Unencrypted personal data storage
  - Missing consent mechanisms for data collection
```

## Phase 3: Performance Review

### Step 6: Performance Analysis

**Performance Check**: Identify bottlenecks and optimization opportunities

```
For each changed file, analyze:

1. **Database Queries**:
   - Check for N+1 query problems
   - Verify proper indexing usage
   - Review query optimization opportunities
   - Check for missing pagination on large datasets

2. **API Calls**:
   - Identify unnecessary or redundant API calls
   - Check for missing request batching
   - Review timeout configurations
   - Verify proper error handling for failed requests

3. **Rendering & UI**:
   - Check for unnecessary re-renders
   - Verify proper memoization usage
   - Review large list rendering (virtualization)
   - Check image optimization and lazy loading

4. **Bundle Size**:
   - Identify large dependencies
   - Check for tree-shaking opportunities
   - Review code splitting strategies

5. **Memory Leaks**:
   - Check for unclosed event listeners
   - Verify proper cleanup in useEffect/componentWillUnmount
   - Review memory-intensive operations

Use codebase_search to:
  - Find performance utilities and patterns
  - Check documentation for libraries/frameworks used
  - Verify best practices for specific versions of tools
  - Compare with existing performance optimizations
```

### Step 7: Check Best Practices for Tools Used

**Performance Check**: Verify library/framework usage follows best practices

```
For each library/framework used in changed files:
1. Identify the library and version from package.json or imports
2. Search for official documentation for that specific version
3. Compare implementation against:
   - Official best practices
   - Performance recommendations
   - Version-specific optimizations
   - Deprecated patterns to avoid

Use web_search if needed to find:
  - Official documentation for specific versions
  - Performance guides and best practices
  - Known performance issues and solutions
  - Migration guides for performance improvements
```

## Phase 4: Accessibility Review

### Step 8: Accessibility Analysis

**Accessibility Check**: Ensure WCAG compliance and accessibility best practices

```
For UI components and changes, analyze:

1. **Semantic HTML**:
   - Proper use of HTML5 semantic elements
   - Correct heading hierarchy (h1-h6)
   - Appropriate ARIA labels and roles
   - Form labels and associations

2. **Keyboard Navigation**:
   - All interactive elements keyboard accessible
   - Proper tab order
   - Focus indicators visible
   - Skip links for navigation

3. **Screen Reader Support**:
   - Alt text for images
   - ARIA live regions for dynamic content
   - Proper form error announcements
   - Descriptive link text

4. **Visual Accessibility**:
   - Color contrast ratios (WCAG AA minimum)
   - Text resizing support
   - Focus indicators
   - Responsive design for various screen sizes

5. **Interactive Elements**:
   - Clickable areas meet minimum size (44x44px)
   - Error messages are clear and accessible
   - Form validation is accessible
   - Loading states are announced

Use codebase_search to:
  - Find existing accessibility patterns
  - Check for accessibility utilities or components
  - Review WCAG compliance in similar features
```

### Step 9: Reference Accessibility Best Practices

**Accessibility Check**: Verify against established standards

```
Reference and verify against:
  - WCAG 2.1 Level AA standards
  - WAI-ARIA Authoring Practices Guide
  - WebAIM accessibility guidelines
  - Framework-specific accessibility documentation (React, Vue, etc.)

Use web_search if needed to find:
  - Current accessibility best practices
  - Framework-specific accessibility patterns
  - Common accessibility mistakes to avoid
  - Testing tools and techniques
```

## Phase 5: Code Quality Review

### Step 10: Code Smell Detection

**Code Quality Check**: Identify code smells and anti-patterns

```
Analyze code for common code smells:

1. **Long Methods/Functions**:
   - Functions exceeding reasonable length
   - Multiple responsibilities in single function
   - Suggest breaking into smaller, focused functions

2. **Code Duplication**:
   - Repeated code blocks
   - Similar logic in multiple places
   - Suggest extraction to shared utilities

3. **Complex Conditionals**:
   - Nested if statements
   - Complex boolean logic
   - Suggest simplification or extraction

4. **Magic Numbers/Strings**:
   - Hardcoded values without constants
   - Suggest using named constants or configuration

5. **Poor Naming**:
   - Unclear variable/function names
   - Abbreviations that aren't clear
   - Suggest more descriptive names

6. **Tight Coupling**:
   - High dependency between modules
   - Suggest dependency injection or abstraction

7. **Dead Code**:
   - Unused imports
   - Commented-out code
   - Unreachable code paths

Use codebase_search to:
  - Find similar patterns that might indicate systemic issues
  - Check for existing utilities that could be reused
  - Verify consistency with codebase patterns
```

### Step 11: Remove Unnecessary Comments

**Code Quality Check**: Clean up redundant or outdated comments

```
Review all comments in changed files:

1. **Remove Unnecessary Comments**:
   - Comments that just restate what code does
   - Obvious comments (e.g., "// increment counter")
   - Outdated comments that don't match current code
   - TODO comments without context or tracking

2. **Keep Valuable Comments**:
   - Complex algorithm explanations
   - Business logic rationale
   - Workarounds for known issues with context
   - API documentation (JSDoc for public APIs)

3. **Improve Comments**:
   - Add context to "why" not "what"
   - Update outdated comments
   - Add missing documentation for complex logic

Use codebase_search to:
  - Check comment patterns in similar files
  - Verify documentation standards in the project
```

## Phase 6: Review Summary and Recommendations

### Step 12: Generate Review Report

**Security Check**: Compile comprehensive review findings

```
Create structured review report with:

1. **Security Findings**:
   - Critical security issues (must fix)
   - High-risk vulnerabilities
   - PII/privacy concerns
   - Recommendations with priority levels

2. **Performance Findings**:
   - Performance bottlenecks identified
   - Optimization opportunities
   - Best practice violations
   - Specific recommendations with expected impact

3. **Accessibility Findings**:
   - WCAG compliance issues
   - Keyboard navigation problems
   - Screen reader barriers
   - Visual accessibility concerns
   - Priority fixes needed

4. **Code Quality Findings**:
   - Code smells identified
   - Refactoring recommendations
   - Unnecessary comments to remove
   - Code duplication opportunities

5. **Overall Assessment**:
   - Summary of critical issues
   - Priority ranking
   - Estimated effort for fixes
   - Approval recommendation
```

### Step 13: Create Review Comments

**Security Check**: Add actionable review comments to PR

```
For critical issues found:
- Use mcp_github_create_pull_request_review to add:
  - Specific file and line references
  - Clear explanation of the issue
  - Suggested fix or improvement
  - Priority level (critical, high, medium, low)

Structure comments as:
  - **Issue**: Clear description
  - **Location**: File and line number
  - **Impact**: Why this matters
  - **Recommendation**: How to fix
  - **Priority**: Critical/High/Medium/Low
```

## Error Handling

- If MCP GitHub calls fail, provide fallback instructions for manual review
- If codebase_search doesn't find patterns, note that new patterns may be needed
- If web_search is needed for documentation, clearly indicate when external research is required
- If PR is too large, suggest breaking into smaller PRs for thorough review

## Security Guidelines

- Never expose sensitive information in review comments
- Sanitize any examples or code snippets in comments
- Flag security issues immediately, even if they seem minor
- Prioritize security findings over other concerns

## Quality Checklist

Before completing review:

- [ ] All security risks identified and documented
- [ ] Performance issues analyzed with best practice references
- [ ] Accessibility concerns checked against WCAG standards
- [ ] Code smells identified with refactoring suggestions
- [ ] Unnecessary comments flagged for removal
- [ ] Review comments added to PR for critical issues
- [ ] Overall assessment provided with approval recommendation

## Notes

- This workflow uses MCP GitHub operations instead of CLI commands
- Focus areas: Security, Performance, Accessibility, Code Quality, Comments
- Always reference official documentation for best practices
- Prioritize critical security and accessibility issues
- **Owner/Repository**: Always retrieve the current GitHub username/owner dynamically. Do not hardcode "CalixtoTheBugHunter" or assume a specific owner. The repository is always "habit-tracker" but the owner should be determined at runtime.

