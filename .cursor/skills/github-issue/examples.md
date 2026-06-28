# GitHub Issue 예시

## Feature — 캐릭터 신고·공유 (풀스택 UX)

**Title:** `💬 [Feature] 캐릭터 신고·공유 기능`

**Labels:** `feature`, `area: frontend`, `area: backend`, `area: db`  
**Milestone:** MVP

---

### Background

캐릭터 상세 UI(`CharacterDetailModal`)에 `MoreVertical` 버튼이 있지만 동작이 연결되어 있지 않다. 모바일 상세(`CharacterDetailMobile`)에는 공유·신고 진입점이 없다. 프로필 페이지는 `navigator.share` / 클립보드 복사 패턴이 있고, 채팅 헤더는 링크 복사만 지원한다. UGC 서비스에서 캐릭터 페이지 URL 공유와 부적절 콘텐츠 신고는 MVP에 필요한 기본 안전·확산 기능이다.

---

### Goals

- 캐릭터 상세(모달·모바일)에서 캐릭터 페이지 URL을 공유할 수 있다.
- 로그인 사용자가 부적절한 캐릭터를 사유와 함께 신고할 수 있다.
- 동일 사용자의 중복 신고를 방지하고, 신고 데이터를 운영·후속 조치에 활용할 수 있다.

---

### Tasks

#### 1. DB 스키마 — 캐릭터 신고

- [ ] `character_reports` 테이블 생성
- [ ] `(character_id, user_id)` 유니크 제약으로 중복 신고 방지
- [ ] RLS: 본인 신고 insert만 허용, 조회는 서버(service role) 전용

```sql
CREATE TABLE character_reports (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id uuid NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason       text NOT NULL,
  detail       text,
  status       text NOT NULL DEFAULT 'pending',
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (character_id, user_id)
);

CREATE INDEX character_reports_character_id_idx ON character_reports (character_id);
CREATE INDEX character_reports_status_idx ON character_reports (status);
```

#### 2. API — 캐릭터 신고

- [ ] `POST /api/characters/[id]/reports` — 신고 접수
- [ ] 인증 필수 (`requireAuthenticatedUser`)
- [ ] 본인 캐릭터 신고 차단 (`selfLikeForbiddenResponse` 패턴 재사용)
- [ ] 사유 enum 검증, `other`일 때 `detail` 필수
- [ ] 중복 신고 시 `409 Conflict` 또는 idempotent `200` (팀 정책 결정)
- [ ] `lib/database.types.ts` 갱신

```ts
type CharacterReportBody = {
  reason: 'spam' | 'inappropriate' | 'copyright' | 'other';
  detail?: string;
};
```

#### 3. 공유 UI — 캐릭터 상세

- [ ] `useCharacterShare(characterId)` 훅 또는 공유 유틸 추출 (프로필 `handleShare` 패턴 참고)
- [ ] 공유 URL: `${origin}/characters/${characterId}`
- [ ] `navigator.share` 지원 시 네이티브 공유, 미지원 시 클립보드 복사 + toast
- [ ] PC 모달 `MoreVertical` → `PopoverMenu`에 "공유" 항목 연결
- [ ] 모바일 상세 헤더/액션 영역에 공유 버튼 또는 메뉴 추가

#### 4. 신고 UI — 캐릭터 상세

- [ ] `MoreVertical` 메뉴에 "신고하기" 항목 추가 (모바일 동일)
- [ ] 신고 다이얼로그: 사유 선택(라디오) + 기타 시 텍스트 입력
- [ ] 미로그인 시 로그인 유도
- [ ] 제출 성공 toast, 실패 시 에러 메시지 표시
- [ ] `useReportCharacterMutation` 훅 + `query-keys` 추가

#### 5. (Post-MVP) 어드민 신고 목록·처리

- [ ] 신고 목록 조회·상태 변경 UI (`area: admin`)
- [ ] 신고 누적 시 캐릭터 비공개/삭제 워크플로

---

### Acceptance Criteria

- [ ] PC 캐릭터 상세 모달 `MoreVertical` 메뉴에서 공유·신고가 동작한다.
- [ ] 모바일 캐릭터 상세에서도 공유·신고에 접근할 수 있다.
- [ ] 공유 시 `/characters/{id}` URL이 복사되거나 OS 공유 시트가 열린다.
- [ ] 로그인 사용자가 사유를 선택해 신고하면 DB에 `pending` 상태로 저장된다.
- [ ] 동일 사용자가 같은 캐릭터를 재신고할 수 없다.
- [ ] 본인이 만든 캐릭터는 신고할 수 없다.
- [ ] 미로그인 사용자는 신고 시 로그인이 요구된다.

---

### Notes

- 공유는 클라이언트만으로 구현 가능 (API 불필요). 프로필·채팅 헤더 패턴을 통일해 `lib/share.ts` 등으로 추출 검토.
- 신고 사유 라벨은 UI 상수로 관리, i18n은 후속.
- 댓글 신고는 본 이슈 범위 밖 (별도 이슈).
- 어드민 처리 UI는 Post-MVP — MVP에서는 DB 적재만으로 운영팀이 Supabase에서 확인 가능.

---

## Feature — AI 모델 DB 관리 (DB·API 중심)

**Title:** `💬 [Feature] AI 모델 종류 DB 관리`

**Labels:** `feature`, `area: backend`, `area: db`  
**Milestone:** MVP

---

### Background

현재 사용할 AI 모델(예: `gemini-2.0-flash`)이 코드에 하드코딩되어 있습니다.
모델별로 성능·비용이 다르고, 향후 모델 추가·변경·가격 정책 조정이 필요할 때마다 코드 배포 없이 DB에서 관리할 수 있어야 합니다.
또한 모델별로 차감 토큰 수를 다르게 설정해 고성능 모델에 더 많은 토큰을 부과하는 정책을 유연하게 운영할 수 있습니다.

---

### Goals

- AI 모델 목록을 DB에서 관리 (추가·수정·비활성화)
- 모델별 서비스 토큰 차감량 설정
- 코드 배포 없이 어드민에서 모델 정책 변경 가능

---

### Tasks

#### 1. DB 스키마 추가

- [ ] `ai_models` 테이블 신규 생성

```sql
CREATE TABLE ai_models (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name      text NOT NULL UNIQUE,
  display_name    text NOT NULL,
  description     text,
  token_cost      int  NOT NULL DEFAULT 1,
  is_active       bool NOT NULL DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

INSERT INTO ai_models (model_name, display_name, description, token_cost) VALUES
  ('gemini-2.0-flash', 'Gemini Flash', '빠르고 가벼운 기본 모델', 1),
  ('gemini-2.0-pro',   'Gemini Pro',  '높은 품질의 고성능 모델', 3);
```

#### 2. 모델 조회 및 적용

- [ ] 채팅 API(`/api/chat`)에서 하드코딩된 모델명을 DB 조회로 교체
- [ ] `characters` 또는 요청 파라미터에서 모델 지정 방식 결정
- [ ] `is_active = false` 모델 요청 시 `400` 에러 반환

```ts
const { data: model } = await supabase
  .from('ai_models')
  .select('model_name, token_cost')
  .eq('id', modelId)
  .eq('is_active', true)
  .single();

if (!model) {
  return Response.json({ error: '사용할 수 없는 모델입니다.' }, { status: 400 });
}

await supabase.rpc('consume_token', {
  p_user_id: userId,
  p_amount: model.token_cost,
  p_description: `캐릭터 채팅 (${model.display_name})`,
});
```

#### 3. 캐릭터-모델 연동 (선택)

- [ ] `characters` 테이블에 `ai_model_id (FK → ai_models)` 추가 검토
- [ ] 캐릭터별 전용 모델 지정 가능하도록 설계

#### 4. (Post-MVP) 어드민 모델 관리 UI

- [ ] 모델 목록 조회·추가·수정·비활성화 어드민 페이지
- [ ] `token_cost` 변경 시 히스토리 로깅

---

### Acceptance Criteria

- [ ] `ai_models` 테이블에서 모델 목록과 차감 토큰 수를 관리할 수 있음
- [ ] 채팅 API가 DB의 `model_name`을 참조해 Gemini API를 호출함
- [ ] 모델별 `token_cost`에 따라 서비스 토큰이 정확히 차감됨
- [ ] `is_active = false` 모델로 요청 시 `400` 에러가 반환됨

---

### Notes

- 모델명(`model_name`)은 Gemini API에 실제로 전달되는 값이므로 오탈자 주의
- `token_cost` 변경은 이후 신규 요청부터 적용 (기존 트랜잭션 소급 없음)
- 초기에는 캐릭터별 모델 고정 없이 서비스 기본 모델 하나로 운영 후 확장 권장

---

## Bug — 짧은 예시

**Title:** `🐛 [Bug] 비활성 모델 선택 시 500 대신 400 반환`

**Labels:** `bug`, `area: backend`  
**Milestone:** MVP

---

### Background

`/api/chat`에서 `is_active = false` 모델 ID로 요청 시 Gemini 호출 전 예외가 처리되지 않아 500이 반환됩니다.

---

### Goals

- 비활성·존재하지 않는 모델 요청을 400으로 일관 처리

---

### Tasks

#### 1. API 에러 처리

- [ ] 모델 조회 실패 시 `400` + `{ error: '사용할 수 없는 모델입니다.' }` 반환
- [ ] 관련 통합 테스트 추가

---

### Acceptance Criteria

- [ ] 비활성 모델 요청 시 HTTP 400
- [ ] 존재하지 않는 model ID 요청 시 HTTP 400

---

### Notes

- 프론트 모델 선택 UI는 별도 이슈
