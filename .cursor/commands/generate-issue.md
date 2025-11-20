---
description: Generate GitHub issues using INVEST technique with MCP server integration
---

# Generate GitHub Issue Workflow

This workflow creates well-structured, actionable GitHub issues using the INVEST technique (Independent, Negotiable, Valuable, Estimable, Small, Testable) with MCP server integration for feature requests, tasks, and other issue types.

## Phase 1: Information Analysis and Validation

### Step 1: Analyze Input Requirements

- Review the provided input (feature request, user story, technical requirement)
- Identify the core need or problem being addressed
- Extract key stakeholders, business value, and technical considerations
- Note any referenced issues, documentation, or existing systems

### Step 2: Search for Existing Issues

```
Use MCP GitHub server to search for duplicate or related issues:
- Get current GitHub username/owner dynamically (don't assume it's always "CalixtoTheBugHunter")
- Use mcp_github_list_issues with owner: {owner}, repo: habit-tracker, state: open
- Search by keywords from the requirement description
- Check for similar features or user stories
- Look for related issues or parent issues
- Identify dependencies or blocking issues
```

### Step 3: Retrieve Referenced Documentation

```
Use MCP tools to gather context from referenced sources:
- Get current GitHub username/owner dynamically (don't assume it's always "CalixtoTheBugHunter")
- Retrieve mentioned GitHub issues for additional context using mcp_github_get_issue with owner: {owner}, repo: habit-tracker
- Review README or project documentation
- Check for related technical or business documentation in repository
- Gather requirements from linked sources
```

## Phase 2: INVEST Criteria Evaluation

### Step 4: Evaluate Against INVEST Criteria

Assess the issue against each INVEST criterion:

**Independent**:

- Can this be developed without dependencies on incomplete work?
- Are there any blocking issues or external dependencies?

**Negotiable**:

- Are the details flexible enough for team discussion?
- Is there room for implementation approach decisions?

**Valuable**:

- Does this deliver clear value to users or the business?
- Is the business impact clearly defined?

**Estimable**:

- Is there enough information for the team to estimate effort?
- Are technical requirements sufficiently detailed?

**Small**:

- Is the scope appropriate for a single iteration?
- Should this be broken into smaller issues?

**Testable**:

- Can clear acceptance criteria be defined?
- Are success metrics identifiable?

### Step 5: Identify Information Gaps

Create list of clarification questions for any INVEST criteria not met:

- Missing business value or user impact
- Unclear technical requirements or constraints
- Undefined acceptance criteria or success metrics
- Scope too large or dependencies unclear
- Insufficient detail for estimation

## Phase 3: Issue Structure Creation

### Step 6: Determine Appropriate Issue Type

Based on the requirement, select appropriate labels:

- **feature**: User-facing feature or functionality
- **enhancement**: Improvement to existing functionality
- **task**: Technical work or internal improvement
- **bug**: Defect or issue (consider using a separate bug workflow)
- **documentation**: Documentation updates

### Step 7: Structure the Issue Content

Create comprehensive issue with sections when applicable:

**DESCRIPTION**:

- Clear explanation of what needs to be done
- Business context and rationale
- User impact or business value

**USER STORY** (for features):

- As a [user type]
- I want [functionality]
- So that [benefit/value]

**ACCEPTANCE CRITERIA**:

- Clear, testable criteria using Given/When/Then format
- Specific success metrics where applicable
- Definition of done
- NOTE: To create checklists use [] syntax instead of - [ ]

**TECHNICAL REQUIREMENTS** (if applicable):

- Technical constraints or considerations
- Integration requirements
- Performance or security requirements

**REFERENCES**: Links to relevant documentation or related issues

NOTE: Use GitHub issue fields to apply following information INSTEAD of adding into description:
**TITLE**: Concise, action-oriented title
**LABELS**: Appropriate categorization tags (feature, enhancement, task, etc.)
**ASSIGNEE**: Should be the person running this workflow (if applicable)
**MILESTONE**: Relevant milestone if applicable
**PROJECT**: Add to appropriate project board if needed
**RELATED ISSUES**: References to existing GitHub issues using #issue-number
**DEPENDENCIES**: Any blocking or related work

### Step 8: Validate Issue Completeness

Review for INVEST compliance:

- [ ] **Independent**: No unresolved dependencies
- [ ] **Negotiable**: Implementation details flexible
- [ ] **Valuable**: Clear business or user value
- [ ] **Estimable**: Sufficient detail for estimation
- [ ] **Small**: Appropriate scope for single iteration
- [ ] **Testable**: Clear acceptance criteria defined

Additional validation:

- [ ] All required sections completed
- [ ] Technical accuracy verified
- [ ] Clear acceptance criteria
- [ ] No sensitive information included
- [ ] Related issues and documentation referenced

## Phase 4: GitHub Issue Creation

### Step 9: Verify GitHub Access

```
Verify MCP GitHub server connection:
- Get current GitHub username/owner dynamically (don't assume it's always "CalixtoTheBugHunter")
- Confirm access to {owner}/habit-tracker repository
- Validate repository permissions for issue creation
```

### Step 10: Create GitHub Issue

```
Use mcp_github_create_issue with:
- owner: Get current GitHub username/owner dynamically (don't assume it's always "CalixtoTheBugHunter")
- repo: habit-tracker
- title: Issue title
- body: Complete issue content in Markdown
- labels: Appropriate labels (feature, enhancement, task, etc.)
- assignees: Current user (if applicable)
- milestone: Relevant milestone if applicable
```

## Phase 5: Validation and Follow-up

### Step 12: Verify Issue Creation

- Confirm issue was created successfully
- Note the issue number and URL
- Validate all information transferred correctly
- Verify INVEST criteria are still met in final issue

### Step 13: Provide Final Summary

Output final result with:

- Created issue number and URL
- Summary of issue content and type
- INVEST criteria validation results
- Any follow-up actions needed
- References to related issues or documentation
- **Copy GitHub issue link to clipboard**

## Error Handling

### MCP Server Failures

- If GitHub MCP fails, provide structured issue content for manual creation
- Include all formatted sections for copy-paste into GitHub
- Note any missing MCP-dependent information
- Provide fallback instructions for manual issue creation

### INVEST Criteria Not Met

- Create **CLARIFICATION NEEDED** section
- List specific INVEST criteria that need attention
- Provide specific questions and required information sources
- Suggest stakeholders or documentation to consult
- Recommend breaking large issues into smaller ones
- Pause workflow until clarification received

### Duplicate Detection

- If similar issue found, reference existing issue
- Determine if new issue needed or if existing should be updated
- Suggest linking issues or adding comments to existing issue
- Consider if this should be part of a larger epic or project

## Security Guidelines

### Data Protection

- Never include user IDs, employee names, or PII in issue descriptions
- Sanitize system credentials or sensitive configuration details
- Use generic terms for personal references
- Protect customer data and internal system details

### Access Control

- Verify proper GitHub repository permissions before creation
- Ensure issue visibility aligns with security requirements
- Confirm appropriate assignee and label selection
- Validate repository-specific requirements

## Quality Checklist

Before finalizing:

- [ ] Issue meets all INVEST criteria
- [ ] Business value clearly articulated
- [ ] Acceptance criteria are specific and testable
- [ ] Technical requirements sufficiently detailed
- [ ] All sensitive information sanitized
- [ ] Related issues and documentation referenced
- [ ] Appropriate labels selected
- [ ] Scope is appropriate for single iteration
- [ ] Dependencies identified and documented
- [ ] MCP tools used for creation and validation

## INVEST Technique Reference

**Independent**: The issue can be developed and delivered independently of other issues, with minimal dependencies.

**Negotiable**: The issue contains enough detail to be clear but leaves room for discussion about implementation approach.

**Valuable**: The issue delivers clear value to users, customers, or the business that justifies the development effort.

**Estimable**: The issue contains sufficient information for the development team to estimate the effort required.

**Small**: The issue is small enough to be completed within a single iteration (typically 1-3 days of work).

**Testable**: The issue has clear acceptance criteria that allow the team to determine when it is complete and working correctly.

## Important Notes

- **Owner/Repository**: Always retrieve the current GitHub username/owner dynamically. Do not hardcode "CalixtoTheBugHunter" or assume a specific owner. The repository is always "habit-tracker" but the owner should be determined at runtime.

