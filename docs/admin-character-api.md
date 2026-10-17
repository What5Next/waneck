# Admin 캐릭터 생성 API

- BASE_URL:
- API_KEY:
- USER_ID:

모든 요청에 헤더 `Authorization: Bearer <API_KEY>`를 붙인다.

## 1. 프로필 이미지 업로드 (선택)

`POST <BASE_URL>/api/admin/upload` — `multipart/form-data`, 필드 `file`

응답: `{ "publicUrl": "https://..." }` → 생성 요청의 `profile_image_url`에 사용

## 2. 캐릭터 생성

`POST <BASE_URL>/api/admin/characters` — `Content-Type: application/json`

```json
{
  "name": "Luna Ashveil",
  "system_prompt": "You are Luna Ashveil, ... Never break character.",
  "short_intro": "A moonlit witch who trades secrets for starlight.",
  "description": "...",
  "tag": "witch",
  "mood": "mysterious",
  "genres": ["판타지", "로맨스"],
  "suggestions": ["What do you sell here?", "Can you read my fortune?"],
  "introTurns": [{ "role": "model", "text": "*The bell chimes as you step in.* Back again?" }],
  "profile_image_url": "https://...",
  "created_by": "<USER_ID>"
}
```

- 필수: `name`, `system_prompt`. 나머지는 선택.
- `genres`: `로맨스`, `판타지`, `시뮬레이션`, `GL`, `BL` 중에서만 고른다. 다른 값은 무시된다.
- `introTurns[].role`: `model`(캐릭터) 또는 `user`.
- `created_by`: 작성자 유저 id(uuid). 생략하면 작성자 없이 생성된다.
- 생성 즉시 공개된다.
- `system_prompt`는 캐릭터의 이름만 바꾼 범용 문장이 아니라 [AI 캐릭터 시트 생성 기준](./character-sheet-generation.md)에 따른 장문 시트로 작성한다. 성격의 원인, 상황별 행동, 말투, `{{user}}`와의 관계 변화 조건, 세계의 제약, 대화 예시를 포함한다.
- `short_intro`, `description`, `suggestions`, `introTurns`는 같은 시작 상황과 캐릭터 설정을 가리키게 한다. `introTurns`는 첫 장면이며, 시트의 예시 대화를 이미 일어난 사건으로 간주하지 않는다.
- 이 API는 받은 `system_prompt`를 저장한다. Drive나 저장소의 MD 파일을 수정해도 기존 DB 캐릭터의 프롬프트가 자동 갱신되지는 않는다.

응답: `201` + 생성된 캐릭터 객체(`id` 포함)

## 에러

응답 형식: `{ "error": "<메시지>" }`

- `400`: 필수 값 누락, 잘못되었거나 존재하지 않는 `created_by`, 파일 누락 → 요청을 고쳐서 다시 보낸다.
- `401`: 키 누락 또는 불일치 → 재시도하지 않는다.
- `500`: 캐릭터가 이미 생성됐을 수 있다 → 자동 재시도하지 않는다.
