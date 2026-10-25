---
name: skill-creator
description: "새로운 스킬(SKILL.md + 지원 파일)을 설계·작성·검증하는 스킬 제작자. 사용자가 '스킬 만들어줘', 'skill 만들기', 'skill creator', 또는 어떤 반복 작업을 재사용 가능한 스킬로 만들고 싶다고 하면 이 스킬을 사용한다. Agent Skills 표준(agentskills.io/specification)과 호환되는 frontmatter, 명명 규칙, 디렉토리 구조를 생성하고 검증한다."
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# Skill Creator — 재사용 가능한 스킬 제작

사용자가 요청한 작업을 **재사용 가능한 스킬**로 패키징한다. 스킬은 on-demand 로딩되는
자기완결형 능력 패키지로, `SKILL.md`(frontmatter + 지침)와 선택적 지원 파일(스크립트,
레퍼런스, 애셋)로 구성된다.

## 작동 방식

스킬은 `SKILL.md` 1개만 필수다. 나머지는 자유 형식:

```
my-skill/
├── SKILL.md              # 필수: frontmatter + 지침
├── scripts/              # 헬퍼 스크립트
│   └── process.sh
├── references/           # 상세 문서(온디맨드 로딩)
│   └── api-reference.md
└── assets/
    └── template.json
```

## 워크플로우

### Phase 1: 요구사항 파악

1. 사용자가 원하는 작업/워크플로우를 명확히 질문한다:
   - 무엇을 자동화/표준화하는가?
   - 언제(트리거/사용 시점) 이 스킬을 불러와야 하는가?
   - 입력·출력 산출물은 무엇인가?
   - 지원 스크립트(코드 실행)가 필요한가, 아니면 순수 지침(프롬프트)만으로 충분한가?
2. 단일 목적인지 확인한다. 서로 다른 관심사를 하나의 스킬에 몰아넣지 말고 분리한다.

### Phase 2: 스킬 설계

1. **이름 결정** — 1-64자, 소문자(a-z)·숫자(0-9)·하이픈(-)만. 선행/후행 하이픈 불가,
   연속 하이픈 불가. 유효: `pdf-processing`, `data-analysis`. 무효: `PDF-Processing`,
   `-pdf`, `pdf--processing`. (pi는 이름이 부모 디렉토리와 일치할 필요는 없음.)
2. **description 작성** — 최대 1024자. 이 스킬이 **무엇을 하고 언제 사용하는지**를 특정하게.
   description이 곧 에이전트가 스킬을 로딩할지 결정하는 기준이므로 모호하면 안 된다.
   후속 요청 키워드도 반영되어야 한다.
3. **frontmatter 필드 결정** — `name`(필수), `description`(필수), 선택: `license`,
   `compatibility`, `metadata`, `allowed-tools`, `disable-model-invocation`.
4. **지침 본문 설계** — Setup(1회 설정), Usage(사용법), 워크플로우(단계), 데이터 흐름,
   에러 핸들링, 체크포인트 등을 필요에 따라 구성. 상대 경로로 지원 파일을 참조한다.

### Phase 3: 작성

1. `SKILL.md` 생성. frontmatter는 YAML `---` 블록, 본문은 해당 작업의 명확한 단계별 지침.
2. 필요한 지원 파일(스크립트/레퍼런스/애셋) 생성.
3. 경로는 스킬 디렉토리 기준 **상대 경로**로 참조:
   ```markdown
   See [the reference guide](references/REFERENCE.md) for details.
   ```

### Phase 4: 검증

1. frontmatter 필수 필드(`name`, `description`) 존재 + 비어있지 않은지 확인.
2. 이름 규칙(소문자/하이픈, 길이) 준수 확인.
3. description 길이(≤ 1024자) · 이름 길이(≤ 64자) 확인.
4. 스킬이 배치된 위치가 적절한지 확인:
   - 전역: `~/.pi/agent/skills/`, `~/.agents/skills/`
   - 프로젝트: `.pi/skills/`, `.agents/skills/` (cwd 및 상위, git 루트 또는 FS 루트까지)
   - 이 프로젝트는 Claude-style: `.claude/skills/`
5. 실행 가능한 스크립트가 포함된다면 실행 권한/의존성 안내가 있는지 확인.

## frontmatter 레퍼런스

| 필드 | 필수 | 설명 |
|------|------|------|
| `name` | 예 | 최대 64자. 소문자 a-z, 0-9, 하이픈. |
| `description` | 예 | 최대 1024자. 무엇을 하고 언제 사용하는지. |
| `license` | 아니오 | 라이선스 이름 또는 번들 파일 참조. |
| `compatibility` | 아니오 | 최대 500자. 환경 요구사항. |
| `metadata` | 아니오 | 임의 key-value 매핑. |
| `allowed-tools` | 아니오 | 사전 승인 도구의 space-delimited 목록(실험적). |
| `disable-model-invocation` | 아니오 | `true`면 시스템 프롬프트에서 숨김. `/skill:name`으로만 실행. |

## description 작성 모범 사례

좋음:
```yaml
description: Extracts text and tables from PDF files, fills PDF forms, and merges multiple PDFs. Use when working with PDF documents.
```

나쁨:
```yaml
description: Helps with PDFs.
```

## SKILL.md 스켈레톤

````markdown
---
name: my-skill
description: What this skill does and when to use it. Be specific.
---

# My Skill

## Setup

Run once before first use:
```bash
cd /path/to/skill && npm install
```

## Usage

```bash
./scripts/process.sh <input>
```
````

## 체크리스트 (완료 전 확인)

- [ ] `SKILL.md` 존재, `name`/`description` 필수 필드 비어있지 않음
- [ ] 이름이 소문자·숫자·하이픈 규칙 준수, ≤ 64자
- [ ] description ≤ 1024자, "무엇+언제"가 구체적
- [ ] 지원 파일은 상대 경로로 참조
- [ ] 스킬 위치가 프로젝트/전역 discovery 경로에 해당
