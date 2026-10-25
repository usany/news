---
name: design
description: "브랜드 디자인 시스템 스킬. KHU(경희대) 브랜드 아이덴티티 컬러 팔레트를 기준으로 UI, 웹, 문서, 발표자료 등 모든 디자인 산출물에 일관된 색상·타이포그래피·구성 원칙을 적용한다. 트리거: '디자인', '색상', '브랜드 컬러', '팔레트', 'UI 디자인', '스타일', 'CSS', '색상 적용', '디자인 시스템', '테마 색상' 등 색상/시각 스타일 관련 요청."
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# Design — 브랜드 컬러 디자인 시스템

모든 디자인 산출물에 **단일 브랜드 팔레트**를 일관되게 적용하기 위한 스킬. 색상을
하드코딩하는 것을 금지하고 아래 정의된 토큰(CSS 변수, Tailwind, 색상 상수)을 사용한다.

## 브랜드 컬러 팔레트

### Primary Colors

| 이름 | PANTONE | HEX | RGB | 용도 |
|------|---------|-----|-----|------|
| **Crimson Red** | — | `#A40F16` | `rgb(164, 15, 22)` | 브랜드 메인 컬러, 강조, CTA, 헤딩 |
| **Blue** | PANTONE 295 C | `#0D326F` | `rgb(13, 50, 111)` | 보조 메인, 링크, 신뢰/정보성 요소 |
| **Gold** | PANTONE 872 C | `#C0A353` | `rgb(192, 163, 83)` | 하이라이트, 포인트, 액센트, 수상/성취 |

### Sub Colors

| 이름 | PANTONE | HEX | RGB | 용도 |
|------|---------|-----|-----|------|
| **Cool Gray** | PANTONE Cool Gray 11C | `#717171` | `rgb(113, 113, 113)` | 본문 보조 텍스트, 캡션, 비활성 요소 |
| **Silver** | PANTONE 877 C | `#B5B5B5` | `rgb(181, 181, 181)` | 테두리, 구분선, 배경 그리드, 호버 |

## 색상 토큰 (재사용 표준)

### CSS Custom Properties

```css
:root {
  --color-primary:        #A40F16;  /* Crimson Red */
  --color-secondary:      #0D326F;  /* Blue (PANTONE 295 C) */
  --color-accent:         #C0A353;  /* Gold (PANTONE 872 C) */
  --color-muted:          #717171;  /* Cool Gray (PANTONE Cool Gray 11C) */
  --color-subtle:         #B5B5B5;  /* Silver (PANTONE 877 C) */

  /* Derived helpers (optional) */
  --color-on-primary:     #FFFFFF;
  --color-on-secondary:   #FFFFFF;
  --color-on-accent:      #FFFFFF;  /* or #0D326F for low-contrast needs */
}
```

### Tailwind Config

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary:   '#A40F16',
        secondary: '#0D326F',
        accent:    '#C0A353',
        muted:     '#717171',
        subtle:    '#B5B5B5',
      },
    },
  },
};
```

### TypeScript / JavaScript 상수

```ts
export const colors = {
  primary:   '#A40F16',  // Crimson Red
  secondary: '#0D326F',  // Blue (PANTONE 295 C)
  accent:    '#C0A353',  // Gold (PANTONE 872 C)
  muted:     '#717171',  // Cool Gray (PANTONE Cool Gray 11C)
  subtle:    '#B5B5B5',  // Silver (PANTONE 877 C)
} as const;
```

### RGB 값

```
Crimson Red   : rgb(164, 15, 22)
Blue          : rgb(13, 50, 111)
Gold          : rgb(192, 163, 83)
Cool Gray     : rgb(113, 113, 113)
Silver        : rgb(181, 181, 181)
```

## 색상 사용 규칙

1. **메인(primary)은 Crimson Red** — 강조, 주요 CTA, 핵심 헤딩에 사용. 남용 금지.
2. **보조(secondary)는 Blue** — 링크, 정보성/신뢰 요소, 대형 구조 영역.
3. **액센트(accent)는 Gold** — 포인트 하이라이트, 수상·성취·배지 등 소량 사용.
4. **Cool Gray(muted)** — 본문 이외 보조 텍스트, 캡션, 비활성 상태.
5. **Silver(subtle)** — 테두리(border), 구분선, 배경 그리드, 호버/placeholder.
6. 본문 텍스트 기본은 강한 대비를 위해 `#1A1A1A`(또는 Cool Gray 계열)를 권장하되,
   브랜드 팔레트 외 임의의 색을 섞지 않는다.
7. 접근성: 텍스트 대비는 WCAG AA(본문 4.5:1, 큰 텍스트 3:1)를 준수한다.

## 대비 참고 (흰 배경 기준, 대략)

| 색 | 흰 배경(#FFFFFF) | 검정 배경(#000000) |
|----|------|------|
| Crimson Red `#A40F16` | 대비 높음 (텍스트/배지 적합) | 낮음 — 흰 글자 위에 사용 |
| Blue `#0D326F` | 매우 높음 | 낮음 |
| Gold `#C0A353` | 보통 — 큰 제목/아이콘에 적합, 작은 본문 X | 보통 |
| Cool Gray `#717171` | 보통 — 보조 텍스트 가능, 본문은 가급적 X | 보통 |
| Silver `#B5B5B5` | 낮음 — 텍스트로 부적합, 테두리/구분 전용 | 낮음 |

## 워크플로우

1. **파레트 적용 대상 파악** — UI/웹, 문서, 발표자료, 이미지 중 무엇에 적용하는지 확인.
2. **토큰 정의** — 위 표준 토큰(CSS 변수/Tailwind/TS 상수)을 프로젝트에 선언. 하드코딩 금지.
3. **규칙대로 배분** — primary→strong, secondary→info, accent→highlight, muted/subtle→보조·비활성.
4. **접근성 점검** — 텍스트 대비 AA 충족 확인. Silver는 텍스트로 사용하지 않음.
5. **일관성 확인** — 동일한 의미는 동일한 토큰을 사용하는지 최종 확인.

## 체크리스트

- [ ] 팔레트 5색(`#A40F16`, `#0D326F`, `#C0A353`, `#717171`, `#B5B5B5`)만 사용했는가?
- [ ] 하드코딩 색상 대신 토큰(변수)을 사용했는가?
- [ ] primary/secondary/accent/sub 색의 용도 배분이 규칙을 따르는가?
- [ ] Silver(`#B5B5B5`)를 텍스트로 사용하지 않았는가?
- [ ] 텍스트 대비가 WCAG AA를 충족하는가?
