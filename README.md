# Radio News

라디오 뉴스 자동 제작 하네스. Next.js 플레이어 + 뉴스 파이프라인이 하나의 패키지로 구성된 단일 저장소.

## 구조

```
news/
├── app/                    # Next.js 라디오 플레이어 UI
├── public/                 # 정적 파일 (오디오, 이미지)
├── scripts/                # 뉴스 파이프라인 (crawl → scenario → TTS)
│   ├── khu_crawler.ts      # 게시판 크롤링 + OCR
│   ├── scenarist.ts        # 뉴스 시나리오 작성
│   ├── news_builder.ts     # TTS 음성 생성
│   ├── run_pipeline.ts     # 파이프라인 오케스트레이터 (단계 정의 포함)
│   └── easyocr_helper.py   # 이미지 OCR (easyocr)
├── _workspace/             # 중간 산출물 (git 무시)
├── store/                  # 생성된 오디오 (git 무시)
├── .github/workflows/      # cron-pipeline.yml (GitHub Actions 스케줄러)
└── package.json            # 단일 패키지 (UI + 파이프라인 의존성)
```

## Getting Started

```bash
pnpm install          # 의존성 설치
pnpm dev              # 개발 서버 (Next.js)
pnpm build            # 프로덕션 빌드
pnpm start            # 프로덕션 서버
```

## 뉴스 파이프라인

```bash
# 파이프라인 실행 (crawl → scenario → TTS), 루트 .env 사용
pnpm pipeline

# 개별 단계
pnpm news:crawl       # 게시판 크롤링 + OCR
pnpm news:scenario    # 뉴스 시나리오 작성
pnpm news:build       # TTS 음성 생성
pnpm build:scripts    # 파이프라인 TS 컴파일
```

파이프라인 산출물은 `_workspace/` (중간) 와 `store/` (오디오) 에 생성된다.

## 환경 변수

루트 `.env` (git에 추적되지 않음):

- `GEMINI_API_KEY` — Gemini API 키 (TTS/시나리오)
- `S3_ENDPOINT` — 오디오 오브젝트 스토리지 엔드포인트

GitHub Actions는 시크릿(`GEMINI_API_KEY`, `S3_ENDPOINT`)을 통해 주입한다.
