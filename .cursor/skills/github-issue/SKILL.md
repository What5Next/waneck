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

**이슈만 초안이 필요하면** 제목 + 본문 마크다운을 출력한다.  
**GitHub에 등록까지 필요하면** `gh` 명령을 실행한다.

---

## 제목 형식

```
{emoji} [{Type}] {간결한 한글 제목}
```

| Type | Emoji | 용도 |
|------|-------|------|
| Feature | 💬 | 신규 기능·UX 개선 |
| Bug | 🐛 | 버그 수정 |
| Chore | 🔧 | 설정·의존성·CI 등 |
| Refactor | ♻️ | 동작 변경 없는 구조 개선 |
| Docs | 📝 | 문서만 변경 |
| Post-MVP | 🗓️ | MVP 이후 작업 (선택) |

예: `💬 [Feature] 캐릭터 신고·공유 기능`

---

## 본문 템플릿

아래 구조를 **순서·헤딩 레벨 그대로** 따른다.

```markdown
### Background

{현재 상태와 문제. 관련 컴포넌트·API·파일명을 백틱으로 명시. 왜 지금 해야 하는지 2~4문장}

---

### Goals

- {사용자/비즈니스 관점 달성 목표}
- {달성 목표 2}

---

### Tasks

#### 1. {작업 그룹명 — 보통 DB·API·UI 순}

- [ ] {구체적 작업}
- [ ] {구체적 작업}

```sql
-- DB 변경이 있으면 스키마·인덱스·RLS 포함
```

```ts
// API·타입·요청 body 등 핵심 스니펫
```

#### 2. {다음 작업 그룹}

- [ ] {기존 패턴 재사용 시 파일·함수명 명시}
- [ ] ...

#### N. (Post-MVP) {후속 작업 그룹}

- [ ] ...

---

### Acceptance Criteria

- [ ] {플랫폼·화면별로 검증 가능한 완료 조건}
- [ ] {에지 케이스·권한·중복 방지 등 QA 문장}

---

### Notes

- {범위 제외·정책 미결·클라이언트 전용 vs API 필요 구분}
- {기존 코드 패턴 통일·i18n·어드민 후속 등}

---

**Labels:** `{label1}`, `{label2}`
**Milestone:** {MVP | Post-MVP | 없음}
```

### 작성 규칙

- **Background**: 현재 구현 상태(미연결 UI, 없는 API 등)와 MVP 필요성을 함께 쓴다. 관련 컴포넌트·훅·API 경로는 백틱으로 명시.
- **Goals**: 사용자 가치·비즈니스 목표만. 구현 상세·파일 목록은 Tasks로.
- **Tasks**:
  - 번호·체크박스 필수.
  - 레이어 순서 권장: **DB → API → UI(공통 훅/유틸) → 화면별 UI → (Post-MVP)**.
  - DB/API 변경은 SQL·TS 코드 블록으로 구체화 (테이블·제약·enum·엔드포인트·요청 body).
  - 기존 패턴 재사용 시 함수·파일명 명시 (예: `requireAuthenticatedUser`, `selfLikeForbiddenResponse`).
  - 클라이언트만으로 가능한 작업은 Tasks에도 명시하고 Notes에서 API 불필요함을 반복해도 됨.
  - Post-MVP는 그룹 제목에 `(Post-MVP)` 접두.
- **Acceptance Criteria**:
  - PC·모바일 등 **노출 surface별**로 나눠 쓴다.
  - 인증·권한·중복·에러 응답 등 엣지 케이스를 QA 문장으로.
  - Goals와 중복 금지.
- **Notes**:
  - 범위 밖 항목(별도 이슈로 분리할 것) 명시.
  - 정책 미결 사항(409 vs idempotent 200 등) 기록.
  - 공통 유틸 추출·i18n·어드민 후속 언급.
- 본문 **첫 줄에 제목 헤딩(`## 💬 [Feature] ...`)은 넣지 않는다** — GitHub 제목과 중복. 초안 출력 시에는 제목을 별도 줄로만 표기.

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

풀스택 기능은 `area: frontend` + `area: backend` (+ DB 변경 시 `area: db`)를 함께 지정.

### 마일스톤

- `MVP` — 출시 전 필수
- `Post-MVP` — 이후 스프린트
- 미정이면 Milestone 줄 생략

---

## GitHub 이슈 생성

사용자가 생성을 요청했을 때만 실행한다.

```bash
gh issue create \
  --title "💬 [Feature] 캐릭터 신고·공유 기능" \
  --label "feature" \
  --label "area: frontend" \
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
- [ ] Background에 현재 상태·관련 코드 참조
- [ ] Goals / Tasks(DB→API→UI) / AC(surface·엣지케이스) / Notes(범위 제외) 작성
- [ ] Tasks에 체크박스·번호 그룹
- [ ] DB·API 변경 시 코드 블록 포함
- [ ] Labels·Milestone 지정
- [ ] (요청 시) gh issue create 실행
```

---

## 추가 예시

전체 샘플 이슈는 [examples.md](examples.md) 참고.

- 풀스택 UX 기능: 캐릭터 신고·공유
- DB·API 중심: AI 모델 DB 관리
