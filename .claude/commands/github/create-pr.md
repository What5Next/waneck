---
allowed-tools: Bash(git status:*), Bash(git branch:*), Bash(git push:*), Bash(gh pr create:*), Bash(git log:*), Bash(git diff:*)
description: Push current branch to remote and create a pull request
---

## Context

- Current git status: !`git status`
- Current branch: !`git branch --show-current`
- Check if current branch tracks a remote: !`git branch -vv`
- Recent commits on current branch: !`git log --oneline -5`
- Diff from main branch: !`git diff main...HEAD --name-only`

## Your task

Push the current local branch to remote repository and create a new pull request.

1. **Target branch**: Use $ARGUMENTS as target branch. If $ARGUMENTS is empty, default to "main"
2. **Push branch**: Push current branch to remote (use `-u` flag if not tracking remote)
3. **Create PR**: Use GitHub CLI to create pull request

### PR Guidelines (from CLAUDE.md)

- **PR title MUST** follow [Conventional Commit](https://www.conventionalcommits.org/en/v1.0.0/#specification) rules
- Use lowercase for the first letter of the description
- Be concise but informative about the overall PR purpose
- Add scope when necessary for clarity. Use workspace name as scope in monorepo context
- Write PR title and commit messages in **English**
- Write PR body/description in **Korean**

### PR Title Examples:
```
feat: implement stripe webhook event processing
refactor: restructure payment provider architecture
fix(webhook): handle missing signature header gracefully
build(admin): create admin docker image and push to ecr
```

### PR Body Template (follow .github/PULL_REQUEST_TEMPLATE.md):
```
# 작업 내용
<!-- 변경사항에 대해 상세히 적어주세요 -->

# 관련 이슈  
<!-- Linear issue ID from branch name: extract pattern like "msh-111" from branch name -->
<!-- If branch name contains Linear issue ID (e.g., "feature/msh-111/new-api"), write "- related to msh-111" -->
<!-- If no Linear issue ID found, leave this section empty or with comment -->

# 체크 리스트
- [ ] 로컬에서 잘 작동했는지 확인 했나요?
- [ ] 제목과 본문은 변경사항을 명확히 설명하고 있나요?
- [ ] 팀원들에게 공유해야할 내용을 빠트리지 않았나요?
```

### Available Commit Types:
- **feat**: 새로운 기능 추가 및 수정
- **fix**: 버그 수정  
- **refactor**: 로직 변경 없는 리팩토링
- **chore**: 그외 자잘한 작업
- **perf**: 성능 개선
- **test**: 테스트 코드 추가 혹은 수정
- **style**: 코드 스타일링 변경(lint, format 등)
- **revert**: 변경사항 취소
- **docs**: 코드 문서화
- **ci**: CI 관련 작업
- **build**: 빌드 및 배포 관련 작업

### Linear Issue Detection:
- **Extract Linear issue ID** from current branch name (pattern: msh-XXX)
- **Examples**: 
  - Branch "feature/msh-111/new-api" → "- related to msh-111"
  - Branch "fix/msh-456/bug-fix" → "- related to msh-456"
  - Branch "main" or "develop" → leave section empty

### Steps:
1. Ensure current branch is pushed to remote
2. Extract Linear issue ID from branch name if present
3. Create PR using `gh pr create` with proper title and Korean body following template
4. Include Linear issue reference in "관련 이슈" section if found
5. **IMPORTANT**: Keep all checkboxes in "체크 리스트" section UNCHECKED (- [ ]) - do NOT check them automatically
6. Return the PR URL for user reference