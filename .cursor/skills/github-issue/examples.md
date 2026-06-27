# GitHub Issue 예시

## Feature — AI 모델 DB 관리

**Title:** `🤖 [Feature] AI 모델 종류 DB 관리`

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
