---
name: github-issue
description: >-
  waneck 프로젝트 GitHub 이슈를 팀 컨벤션(Background, Goals, Tasks, Acceptance
  Criteria, Labels, Milestone)에 맞게 작성·생성한다. 사용자가 이슈 만들기, 이슈
  템플릿, GitHub issue, feature 요청 문서화를 요청할 때 사용한다.
---

# GitHub Issue 컨벤션 (waneck)

## 빠른 시작

1. 이슈 유형·제목·라벨·마일스톤을 정한다.
2. 아래 템플릿으로 본문을 작성한다.
3. 사용자 확인 후 `gh issue create`로 생성한다.

**이슈만 초안이 필요하면** 본문 마크다운만 출력한다.  
**GitHub에 등록까지 필요하면** `gh` 명령을 실행한다.

---

## 제목 형식

```
{emoji} [{Type}] {간결한 한글 제목}
```

| Type | Emoji | 용도 |
|------|-------|------|
| Feature | 🤖 | 신규 기능 |
| Bug | 🐛 | 버그 수정 |
| Chore | 🔧 | 설정·의존성·CI 등 |
| Refactor | ♻️ | 동작 변경 없는 구조 개선 |
| Docs | 📝 | 문서만 변경 |
| Post-MVP | 🗓️ | MVP 이후 작업 (선택) |

예: `🤖 [Feature] AI 모델 종류 DB 관리`

---

## 본문 템플릿

아래 구조를 **순서·헤딩 레벨 그대로** 따른다.

```markdown
### Background

{현재 상태와 문제. 왜 지금 해야 하는지 2~4문장}

---

### Goals

- {달성 목표 1}
- {달성 목표 2}

---

### Tasks

#### 1. {작업 그룹명}

- [ ] {구체적 작업}
- [ ] {구체적 작업}

```sql
-- DB 변경이 있으면 스키마·시드 포함
```

```ts
// API·로직 변경이 있으면 핵심 코드 스니펫 포함
```

#### 2. {다음 작업 그룹}

- [ ] ...

---

### Acceptance Criteria

- [ ] {검증 가능한 완료 조건}
- [ ] {검증 가능한 완료 조건}

---

### Notes

- {주의사항·범위 제외·정책 결정}
- {Post-MVP 항목은 Tasks에 `(Post-MVP)` 접두 또는 별도 섹션}

---

**Labels:** `{label1}`, `{label2}`
**Milestone:** {MVP | Post-MVP | 없음}
```

### 작성 규칙

- **Background**: "현재 ~하드코딩", "향후 ~필요"처럼 맥락·동기 중심.
- **Goals**: 사용자/비즈니스 가치. 구현 상세는 Tasks로.
- **Tasks**: 번호·체크박스 필수. DB/API 변경은 SQL·코드 블록으로 구체화.
- **Acceptance Criteria**: 테스트·QA로 확인 가능한 문장만. Goals와 중복 금지.
- **Notes**: 오탈자 주의, 소급 적용 여부, MVP 범위 밖 항목.
- 본문 **첫 줄에 제목 헤딩(`## 🤖 [Feature] ...`)은 넣지 않는다** — GitHub 제목과 중복.

---

## 라벨·마일스톤

### Type 라벨 (1개 필수)

| 라벨 | 용도 |
|------|------|
| `feature` | 신규 기능 |
| `bug` | 버그 |
| `chore` | 유지보수 |
| `refactor` | 리팩터링 |
| `docs` | 문서 |

### Area 라벨 (1개 이상)

| 라벨 | 용도 |
|------|------|
| `area: backend` | API, 서버 로직 |
| `area: db` | 스키마, 마이그레이션, RPC |
| `area: frontend` | UI, 클라이언트 |
| `area: infra` | 배포, CI, 환경설정 |
| `area: admin` | 어드민 |

### 마일스톤

- `MVP` — 출시 전 필수
- `Post-MVP` — 이후 스프린트
- 미정이면 Milestone 줄 생략

---

## GitHub 이슈 생성

사용자가 생성을 요청했을 때만 실행한다.

```bash
gh issue create \
  --title "🤖 [Feature] AI 모델 종류 DB 관리" \
  --label "feature" \
  --label "area: backend" \
  --label "area: db" \
  --milestone "MVP" \
  --body "$(cat <<'EOF'
### Background
...
EOF
)"
```

- 라벨이 없으면 `gh label create` 전에 사용자에게 확인한다.
- 마일스톤이 없으면 `--milestone` 생략.
- 생성 후 이슈 URL을 응답에 포함한다.

---

## 워크플로우 체크리스트

```
- [ ] Type·emoji·제목 확정
- [ ] Background / Goals / Tasks / AC / Notes 작성
- [ ] Tasks에 체크박스·번호 그룹
- [ ] DB·API 변경 시 코드 블록 포함
- [ ] Labels·Milestone 지정
- [ ] (요청 시) gh issue create 실행
```

---

## 추가 예시

전체 샘플 이슈는 [examples.md](examples.md) 참고.
