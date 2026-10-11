# 정책 문서 운영

서비스 이용약관은 `/policy`, 개인정보 처리방침은 `/privacy-policy`에서 제공한다. UI는 영어이며 본문은 DB에 등록된 Markdown을 사용한다. 최초 본문은 자동 등록하지 않는다.

## 배포

1. Supabase SQL Editor에서 `scripts/sql/legal-document-versions.sql`을 실행한다. 재실행 가능하며 기존 데이터를 덮어쓰지 않는다.
2. 프로젝트에 설정된 `pnpm gen:types`로 DB 타입을 재생성한다. 저장소에는 새 테이블의 타입을 미리 반영해 두었다.
3. 정책 페이지를 배포한다. 문서가 없으면 미등록 안내가 표시되며, 테이블 미적용이나 DB 연결 실패는 오류 화면으로 표시된다.

## 초안 등록 및 공개

Supabase Table Editor에서 `public.legal_document_versions`에 새 행을 추가한다.

| 필드 | 입력 내용 |
| --- | --- |
| `document_type` | 이용약관: `terms`, 개인정보 처리방침: `privacy` |
| `version` | 문서별 고유 버전명. 예: `1.0`, `2026-10-11` |
| `title` | `Terms of Service` 또는 `Privacy Policy` 등 영어 제목 |
| `content` | 승인된 Markdown 본문. 공백만 있는 값은 허용하지 않음 |
| `effective_at` | 시행 시각. 명시적 시간대 사용 권장: `2026-10-11T00:00:00+09:00` |
| `published_at` | 초안은 NULL. 공개 확정 시 공개 시각 입력 |

`id`, `created_at`, `updated_at`은 자동 생성된다. 초안은 수정·삭제할 수 있다. 본문과 시행일을 확정한 뒤 `published_at`을 설정한다. UTC를 기준으로 시행일을 표시하므로 한국 시간 자정은 페이지에서 전날 날짜로 표시될 수 있다.

**`published_at`을 설정한 행은 예약 공개를 포함해 수정·삭제하거나 초안으로 되돌릴 수 없다.** 일반적인 Table Editor 및 service-role 쓰기에도 DB 트리거가 적용된다. 수정이 필요하면 새 버전을 등록한다. DB 소유자는 트리거나 스키마 자체를 변경할 수 있으므로 이를 통상적인 문서 운영 방법으로 사용하지 않는다.

## 버전 선택과 접근 권한

- `published_at`과 `effective_at`이 모두 현재 시각 이하인 버전만 공개된다. 미래 시행 버전은 본문과 버전 목록에서 숨겨진다.
- 현행 버전은 공개 버전 중 `effective_at`이 가장 최신인 행이다. 버전명은 숫자 비교에 사용하지 않는다.
- 같은 문서 종류에서 버전명은 중복될 수 없고, 공개 지정된 버전의 시행 시각도 중복될 수 없다.
- 이전 공개 버전은 계속 보존된다. 선택 메뉴와 `?version=1.0` 형태의 URL로 열람하며, 각 문서에 고정 버전 링크가 표시된다.
- 본문 변경은 다음 요청에 반영된다. 앱 재배포나 캐시 삭제는 필요 없다.
- 익명·로그인 사용자는 RLS가 허용하는 공개 문서만 읽을 수 있고 쓰기 권한은 없다. 페이지 조회에는 service-role 키를 사용하지 않는다.
- 관리자 화면, 관리 API, 사용자 동의 이력 및 재동의 흐름은 제공하지 않는다.

## DB 검증

테이블 적용 후 `scripts/sql/tests/legal-document-versions.sql`을 SQL Editor에서 실행한다. 임시 데이터를 트랜잭션 안에서 등록하고 끝에서 롤백한다. 공개·시행 조건, 문서 종류 분리, 제약 조건, 초안 수정·삭제, 공개 문서 변경 방지 및 클라이언트 쓰기 차단을 검증한다.

페이지 조회 및 렌더링 테스트는 `node --test scripts/tests/legal-documents.test.mjs`로 실행한다. 테스트 프레임워크를 추가하지 않고 기존 TypeScript·React 의존성과 Node 내장 테스트 러너를 사용한다.
