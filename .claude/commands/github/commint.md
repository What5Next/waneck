---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*), Bash(git log:*)
description: Create a git commit
---

## Context

- Current git status: !`git status`
- Current git diff (staged and unstaged changes): !`git diff HEAD`
- Current branch: !`git branch --show-current`
- Recent commits: !`git log --oneline -10`

## Your task

Based on the above changes, create a single git commit by following these steps:

### Steps:
1. **Stage files**: If $ARGUMENTS is provided, run `git add $ARGUMENTS` to stage specified files. If $ARGUMENTS is empty, only commit already staged files.
2. **Analyze changes**: Review the git status and diff output to understand what changes will be committed.
3. **Create commit message**: Draft a commit message following the Conventional Commit rules below.
4. **Execute commit**: Run `git commit` with the crafted message using HEREDOC format for proper formatting.
5. **Verify commit**: Run `git status` to confirm the commit succeeded.
6. **Display result**: Run `git log -n 1` to show the created commit details to the user.

### Commit message rules

- **MUST** follow [Conventional Commit](https://www.conventionalcommits.org/en/v1.0.0/#specification) rules
- Project uses commitlint with commit-msg hook that enforces these rules
- Use lowercase for the first letter of the description
- Be concise but informative about what the change accomplishes
- Scope is optional unless necessary for clarity
- Multi-line commit messages are allowed for additional details
- Commit message title should be less than 100 characters

### Commit message examples:
```
feat: add stripe webhook event validation
refactor: reorganize server handlers to match new route structure
fix(webhook): handle missing signature header gracefully
```

### Display result template:

After successfully creating the commit, display the result using this format:

```
✅ Commit created successfully!

📋 Commit Details:
- Hash: [first 7 chars of commit hash]
- Files changed: [number] file(s)
- Insertions: +[number], Deletions: -[number]

📝 Full commit message:
[complete commit message including body if present]
```

Example output:
```
✅ Commit created successfully!

📋 Commit Details:
- Hash: 651fe87
- Files changed: 2 file(s)
- Insertions: +11, Deletions: -10

📝 Full commit message:
feat: enhance claude commit command and remove commitlint body length limit

- Add git log command to allowed tools in commit.md
- Improve commit workflow with detailed steps and examples
- Remove body-max-line-length restriction from commitlint config
- Allow unlimited commit message body length for better context

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```