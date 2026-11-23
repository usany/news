# Radio News

경희대 주간 라디오 뉴스 플레이어. Vite + React 프론트엔드, NestJS 카탈로그 서버, 뉴스 자동 제작 파이프라인으로 구성됩니다.

## 구성

- `src/` — React SPA (`/` 플레이어, `/tts` 멀티 스피커 TTS 데모)
- `server/` — NestJS 서버 (에피소드 목록 `/route`, 스토리지 프록시)
- `scripts/` — 공지 크롤링 → 시나리오 → TTS 파이프라인

## 시작하기

```bash
pnpm install
pnpm dev        # Vite(3000) + NestJS 서버 동시 실행
```

`http://localhost:3000` 을 엽니다. 프론트엔드는 `VITE_API_BASE`(기본 `http://localhost:4000`)로 서버에 요청합니다.

## 스크립트

| 명령 | 설명 |
| ---- | ---- |
| `pnpm dev` | 프론트엔드 + 서버 개발 모드 |
| `pnpm build` | 정적 빌드 (`dist/`) |
| `pnpm start` | 빌드 결과 미리보기 (`vite preview`) |
| `pnpm pipeline` | 공지 수집 → 시나리오 → 음성 전체 파이프라인 |

## 배포

`dist/`는 정적 파일입니다. `/tts` 같은 경로를 새로고침해도 동작하려면 호스팅에서 모든 경로를 `index.html`로 rewrite 해야 합니다.
