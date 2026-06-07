# AI 캐릭터 챗 MVP

Gemini API + Next.js 14 App Router 기반 캐릭터 챗 서비스 MVP.

## 시작하기

### 1. 패키지 설치

```bash
npm install @google/genai
```

> Next.js 프로젝트가 없다면 먼저 생성:
> ```bash
> npx create-next-app@latest ai-character-chat --typescript --tailwind --app
> cd ai-character-chat
> npm install @google/genai
> ```

### 2. 환경 변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local`을 열고 Gemini API 키 입력:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

API 키 발급: https://aistudio.google.com/app/apikey

### 3. 파일 복사

아래 파일들을 프로젝트에 복사:

```
lib/characters.ts
app/page.tsx
app/api/chat/route.ts
app/chat/[characterId]/page.tsx
components/CharacterCard.tsx
components/ChatWindow.tsx
components/MessageBubble.tsx
components/TypingIndicator.tsx
components/ChatInput.tsx
```

### 4. 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

## 구조

```
app/
├── page.tsx                    # 캐릭터 선택 화면
├── chat/[characterId]/
│   └── page.tsx                # 채팅 화면
└── api/chat/
    └── route.ts                # Gemini API 프록시 (서버 사이드)
components/
├── CharacterCard.tsx
├── ChatWindow.tsx              # 채팅 메인 (클라이언트)
├── MessageBubble.tsx
├── TypingIndicator.tsx
└── ChatInput.tsx
lib/
└── characters.ts               # 캐릭터 데이터 + 타입 정의
```

## 캐릭터 추가

`lib/characters.ts`의 `CHARACTERS` 배열에 항목 추가:

```ts
{
  id: 'nova',
  name: '노바',
  emoji: '🌌',
  tag: '신비',
  mood: '우주를 관찰 중',
  desc: '신비로운 우주 탐험가.',
  suggestions: ['우주에 대해 알려줘', '별자리 얘기 해줘', '외계인이 있을까?'],
  system: `너의 이름은 노바야. 신비로운 우주 탐험가야. ...`,
}
```

## DB 타입 생성 (Supabase)

스키마 변경 시 TypeScript 타입을 재생성해야 한다.

### 1. Access Token 등록 (최초 1회)

`~/.zshrc`에 추가:

```bash
export SUPABASE_ACCESS_TOKEN=your_supabase_access_token
```

토큰 발급: Supabase 대시보드 > 우측 상단 프로필 > Account > Access Tokens

적용:

```bash
source ~/.zshrc
```

### 2. 타입 재생성

```bash
npm run gen:types
```

생성 결과는 `lib/database.types.ts`에 저장된다.

## 사용 모델

| 환경 | 모델 |
|---|---|
| 현재 | `gemini-2.0-flash` |
| 무료 한도 | 분당 15 요청, 하루 1500 요청 |
