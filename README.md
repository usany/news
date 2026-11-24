# Radio News

경희대 주간 라디오 뉴스 플레이어 (React + Vite) 와 뉴스 자동 제작 파이프라인.

- `src/` — React SPA (Vite). 에피소드 목록은 NestJS 서버(`server/`)에서 가져온다.
- `server/` — NestJS API (기본 포트 4000).
- `scripts/` — 공지 크롤링 → 시나리오 → Gemini TTS 파이프라인.

## Getting Started

```bash
pnpm install
pnpm dev          # Vite(http://localhost:5173) + NestJS 서버 동시 실행
```

API 주소는 `VITE_API_BASE` 환경변수로 바꿀 수 있다 (기본 `http://localhost:4000`).

## Scripts

- `pnpm dev` — 프론트엔드 + 서버 개발 실행
- `pnpm build` — `dist/` 에 정적 빌드 생성
- `pnpm start` — 빌드 결과 미리보기 (`vite preview`)
- `pnpm pipeline` — 주간 뉴스 제작 파이프라인 실행
