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

응답: `201` + 생성된 캐릭터 객체(`id` 포함)

## 에러

응답 형식: `{ "error": "<메시지>" }`

- `400`: 필수 값 누락, 잘못되었거나 존재하지 않는 `created_by`, 파일 누락 → 요청을 고쳐서 다시 보낸다.
- `401`: 키 누락 또는 불일치 → 재시도하지 않는다.
- `500`: 캐릭터가 이미 생성됐을 수 있다 → 자동 재시도하지 않는다.
