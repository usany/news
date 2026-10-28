# Radio News 프로젝트
## Auto-commit on git changes

Whenever you make changes that result in tracked git changes, commit them automatically
without waiting to be asked. Follow these rules:

- Use Conventional Commits format: `<type>(<scope>): <description>` where type is one of
  `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `build`, `chore`, `style`.
- Commit at every coherent checkpoint: a fix that typechecks, a finished feature
  increment, a config/dependency change, or before a risky refactor.
- Read the diff before committing (`git diff` / `git status --porcelain`).
- Stage with `git add -A` (respects `.gitignore`).
- One logical change per commit — split unrelated changes into separate commits.
- Never commit a broken state (failing tests or builds).
- Refuse to commit likely secrets: `.env`, `.env.*`, `*.pem`, `*.key`, `id_rsa*`,
  `credentials*`, `secrets*`, `*.p12`, `.npmrc`, `.netrc`, or any API keys/tokens/private
  key blocks.
- Do not force-push, do not amend already-pushed commits, do not use `--no-verify` to
  bypass failing hooks.
- Push only if the user explicitly asked to push.

## 하네스: Radio News 자동 제작

**목표:** Scraping this week's KHU notice board using playwright → Read texts from image files using easyocr (if needed) → Make news scenario from notice contents → Radio news generation using gemini-tts.

**트리거:** need news 요청이 들어오면 `news-orchestrator` 스킬을 사용하라. 단순 질문(예: "이 폴더에 뭐가 있어?") 은 직접 응답.

**에이전트:** `.claude/agents/` — collector, ocr-director, scenarist, news-builder, qa-reviewer
**스킬:** `.claude/skills/` — news-orchestrator (오케스트레이터), scraping, ocr-processing, scenario-direction, news-building, reviewing

**모노레포 구조 (pnpm workspaces):**
- 단일 패키지 (루트 `package.json`) — Next.js 라디오 플레이어 UI(`app/`, `public/`) + 공유 뉴스 파이프라인(`scripts/`)이 함께 구성.
- 산출물: `_workspace/` (중간), `store/` (오디오) — git 무시 대상.
- 루트 `package.json` 스크립트: dev, build, start, pipeline, news:crawl, news:scenario, news:build, build:scripts

**Speech 생성:** Gemini-tts 생성 기능을 사용합니다.

**collector + ocr-director 자동화 스크립트:**

`scripts/khu_crawler.ts` (playwright, TypeScript) + `scripts/easyocr_helper.py` (easyocr, Python) 로 게시판 크롤링과 이미지 OCR 전 단계를 한 명령으로 자동 실행할 수 있다.

- 실행: `node scripts/khu_crawler.ts [--week=YYYY-MM-DD] [--no-ocr]`
- 산출: `_workspace/01_scraping_report.md`, `01_notice.md`, `01_notice_images/`, `02_ocr_results.md`
- `--week` 미지정 시 오늘 날짜의 해당 주차(월~금) 수집. 5개 카테고리(일반/학사/장학/근로/행사)를 페이지 넘기며 대상 주 밖 공지가 나오면 중단. 이미지가 있는 공지는 easyocr(ko, en)로 텍스트 추출.

**news-builder + scenarist 자동화 스크립트:**

- `scripts/scenarist.ts` — 이번 주 공지(`_workspace/01_notice.md`)를 요약해 호스트/리포터 2인 라디오 뉴스 시나리오(`_workspace/03_news_scenario.md`) 작성 (opencode SDK).
- `scripts/news_builder.ts` — `_workspace/03_news_scenario.md`의 호스트/리포터 대사를 Gemini **Multi-speaker TTS**(```gemini-3.1-flash-tts-preview```, GEMINI_API_KEY)로 합성해 단일 음성 파일(`_workspace/04_news_files/{week}_full_news.wav`)을 생성. 시나리오를 화자 라벨(호스트/리포터)이 붙은 대화로 보내고 `multiSpeakerVoiceConfig`로 화자별 다른 목소리를 매핑해 **단일 요청**으로 두 화자 음성이 담긴 오디오를 생성(무료쿼터 절약).

  실행: `node scripts/news_builder.ts [--input=...] [--output=...] [--model=...] [--host-voice=...] [--reporter-voice=...]`

**변경 이력:**

| 날짜 | 변경 내용 | 대상 | 사유 |
| ---- | --------- | ---- | ---- |
| 2026-08-12 | cron 진입점을 **node-cron 기반 TypeScript 데몬**으로 전환: 기존 `cron_wrapper.sh`/`install_cron.sh`(bash) 폐기 → `cron_wrapper.ts`(node-cron으로 주 1회 스케줄을 프로세스 내에서 처리, `noOverlap`/`timezone`/로그 지원) + `install_cron.ts`(launchd LaunchAgent `com.casts.radio-news` 등록·로딩으로 데몬 상주·재부팅 유지, `--uninstall`/`--status` 지원). crontab 항목 제거, package.json의 `news:install`(`tsx scripts/install_cron.ts`) 유지 | scripts/cron_wrapper.ts, scripts/install_cron.ts, crontab, ~/Library/LaunchAgents/com.casts.radio-news.plist | cron → node-cron 데몬 + launchd 전환 |
| 2026-08-11 | cron 진입점을 **bash로 복원**: `cron_wrapper.ts`/`install_cron.ts`(TS 버전 실행 중 `Command aborted` 문제) 폐기하고 `scripts/cron_wrapper.sh` + `scripts/install_cron.sh`(bash) 복원. cron은 `cron_wrapper.sh`가 PATH 복원 후 `node scripts/run_pipeline.ts` 실행. crontab 재등록 완료 (매주 금 22:00) | scripts/cron_wrapper.sh, scripts/install_cron.sh, crontab | cron 진입점 bash 복원 |
| 2026-08-11 | 파이프라인을 **TypeScript**(`scripts/run_pipeline.ts`)로 재작성: 스크립트 3개(khu_crawler→scenarist→news_builder)를 순차 실행 + 각 단계 산출물 검증(`requireFile`), 어느 단계가 실패하면 전체 파이프라인 비정상 종료(0이 아닌 exit code). cron 자동화: `scripts/install_cron.sh`로 `0 22 * * 5`(매주 금 22:00) 등록. `package.json`의 `news:pipeline`도 TS로 변경 | scripts/run_pipeline.ts, scripts/install_cron.sh, package.json, crontab | 스크립트 전 과정 파이프라이닝 + cron 예약 (TS 버전) |
| 2026-08-11 | 세 스크립트(khu_crawler→scenarist→news_builder)를 실패 시 전체 중단되는 파이프라인으로 묶기(Bash 오케스트레이터 → 이후 TS로 대체되어 제거됨) | scripts/run_pipeline.ts | 스크립트 전 과정 파이프라이닝 |
| 2026-08-11 | `scripts/news_builder.mts` Gemini **Multi-speaker TTS** 로 재작성: 기존 줄 단위 합성/단일모드 토글 대신 `multiSpeakerVoiceConfig`로 호스트/리포터 두 화자를 한 번의 요청에 매핑해 단일 full news 파일 생성(```gemini-3.1-flash-tts-preview```, 호스트=`Kore`, 리포터=`Puck`). 화자 구분됨 + 쿼터 절약. `tsc --noEmit` 검증 완료 | scripts/news_builder.mts | Gemini 原生 Multi-speaker TTS 사용 |
| 2026-08-11 | `scripts/news_builder.mts` 기본 모드를 **단일 요청/단일 목소리 full news 생성**으로 변경(`--multi`/`--two-voices` 플래그로 기존 화자 구분 모드 선택). 무료쿼터(일 10회) 안에서 한 번에 full news 생성하는 것을 기본값으로 | scripts/news_builder.mts | 기본 동작을 쿼터 절약형 단일 모드로 |
| 2026-08-11 | `scripts/news_builder.mts`에 `--single` (단일 요청/단일 목소리 full news 생성) 모드와 줄 단위 클립 캐시(resume) 추가, API RetryInfo 지연 존중, mimeType 기반 오디오 판별로 MP3 오판 버그 수정. Gemini TTS 무료쿼터(일 10회) 초과 시 pause 후 재실행으로 이어받음 | scripts/news_builder.mts | 무료쿼터 대응 + 단일 full news 생성 |
| 2026-08-11 | `scripts/news_builder.mts` 두 화자(Host/Reporter) 서로 다른 목소리 지원으로 개선: 호스트=`puck`, 리포터=`charon` 기본값, `--host-voice`/`--reporter-voice`로 오버라이드. Gemini TTS는 요청당 단일 voice만 지원하므로 각 대사줄을 화자별 voice로 합성 후 순서대로 이어붙여 단일 wav 생성. `tsc --noEmit` 검증 완료 | scripts/news_builder.mts | 두 사람 방송(호스트+리포터) 화자 구분 |
| 2026-08-11 | Gemini-TTS 기반 news-builder 자동화 스크립트 `scripts/news_builder.mts` 추가: 시나리오(`03_news_scenario.md`)의 호스트/리포터 대사 파싱 → 전체 합성 1회 → 단일 `_workspace/04_news_files/{week}_full_news.wav` 생성 (gemini-2.5-flash-preview-tts, voice puck, GEMINI_API_KEY). 기존 파이썬 `tts_gemini_full.py`를 TS로 포팅. `tsc --noEmit` 검증 완료 | scripts/news_builder.mts | news-builder 에이전트 스크립트화 |
| 2026-08-11 | playwright(TS) 기반 자동 크롤링 스크립트 `scripts/khu_crawler.ts` + easyocr 헬퍼 `scripts/easyocr_helper.py` 추가. collector+ocr-director가 하던 게시판 크롤링·이미지 다운로드·easyocr OCR을 한 명령으로 대체. pnpm devDeps에 playwright/tsx 추가. 이번 주(2026-08-10~14) 수집 17건/이미지 12장 OCR 검증 완료 | scripts/, _workspace/, package.json | collector+ocr-director 수동 흐름 스크립트화 |
| ---- | --------- | ---- | ---- |
| 2026-08-09 | 2026-08-03~07 주차 KHU 공지 34건 스크래핑 → 라디오 뉴스 시나리오(44줄) → TTS 음성 클립 44개 + full_news.wav(8:40) 생성. Gemini TTS 무료 쿼터 초과로 macOS `say`(Yuna) 폴백. 최종 산출물을 news/2026_08_w1/ 및 public/news/2026-08-08-week1.wav로 복사하고 앱 EPISODES에 연결 | _workspace/, news/, public/news/, app/lib/utils.js | 이번 주 라디오 뉴스 자동 제작 |
| 2026-08-09 | `say` 폴백 음성(Yuna, 단일 화자)을 `edge-tts`로 교체 재생성: 호스트=ko-KR-SunHiNeural(여), 리포터=ko-KR-InJoonNeural(남) 화자 구분. full_news.wav 610.6초(10:10)로 재생성, QA 보고서·EPISODES 갱신. `_workspace/tts_edge.py` 추가 | _workspace/tts_edge.py, _workspace/04_news_files/, news/2026_08_w1/, public/news/, app/lib/utils.js | 교차플랫폼 TTS + 화자별 목소리 구분 |
| 2026-08-09 | 2026-07-20~24 주차 KHU 공지 19건 스크래핑 → 라디오 뉴스 시나리오(35줄, 뉴스 7개 섹션) → edge-tts 음성 클립 35개 + full_news.wav(521.9초/8:41) 생성, QA PASS. 최종 산출물을 news/2026_07_w3/ 및 public/news/2026-07-27-week3.wav로 복사, 앱 EPISODES에 연결. 기존 8월 1주차 산출물은 _workspace_20260809_165656/, news_20260809_165656/로 보관 | _workspace/, news/, public/news/, app/lib/utils.js | 이전(7월 3주차) 라디오 뉴스 자동 제작 |
| 2026-08-09 | full_news 파일명을 주차 접두어 형식(`{week}_full_news.wav`)으로 일괄 변경. `_workspace/tts_edge.py`가 시나리오 제목에서 주차를 자동 추출하도록 수정 | _workspace/, news/, 보관본 전부 | 파일명 규칙 통일 |
| 2026-08-09 | Gemini TTS 쿼터 절약을 위해 단일 호출로 full news만 재생성: `tts_gemini_full.py` 추가, 35개 클립 대신 전체 시나리오 1회 합성. 음성 이름 변경(KoreaLive 미지원 → `puck`), 응답이 raw PCM(L16/24000Hz)이어서 wave 헤더로 WAV 저장. 368.8초(6:08) 생성, news/·public/news/ 배포 및 EPISODES·QA 보고서 갱신 | _workspace/tts_gemini_full.py, _workspace/04_news_files/, news/2026_07_w3/, public/news/, app/lib/utils.js | Gemini TTS 재생성(단일 full news 파일) |
