# Radio News — Monorepo

라디오 뉴스 자동 제작 하네스. pnpm workspaces 기반 모노레포.

## 구조

```
news/
├── apps/
│   └── podcast-player/   # Next.js 라디오 플레이어 UI
├── packages/
│   └── pipeline/         # 공유 뉴스 파이프라인 (crawl → scenario → TTS)
├── .github/workflows/    # cron-pipeline.yml (GitHub Actions 스케줄러)
├── pnpm-workspace.yaml   # apps/*, packages/*
└── package.json          # 루트 orchestration 스크립트
```

## Getting Started

```bash
pnpm install          # 워크스페이스 의존성 설치
pnpm dev              # podcast-player 개발 서버 (Next.js)
pnpm build            # podcast-player 프로덕션 빌드
```

## 뉴스 파이프라인

```bash
# 파이프라인 실행 (crawl → scenario → TTS)
pnpm pipeline                          # 루트에서
pnpm --filter @radio-news/pipeline pipeline

# 개별 단계
pnpm crawl                             # 게시판 크롤링 + OCR
pnpm scenario                          # 뉴스 시나리오 작성
pnpm news:build                        # TTS 음성 생성
pnpm build:scripts                     # 파이프라인 TS 컴파일
```

파이프라인 산출물은 `packages/pipeline/_workspace/` (중간) 와 `packages/pipeline/store/` (오디오) 에 생성된다.

## 환경 변수

각 앱/패키지는 자체 `.env`를 가진다 (git에 추적되지 않음):

- `apps/podcast-player/.env` — `S3_ENDPOINT` (오디오 프록시)
- `packages/pipeline/.env` — `GEMINI_API_KEY`, `S3_ENDPOINT` (로컬 스크립트 실행 시)

GitHub Actions는 시크릿(`GEMINI_API_KEY`, `S3_ENDPOINT`)을 통해 주입한다.
