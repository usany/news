# QA 검증 보고서

> 검증일: 2026-08-08 (토)
> 대상: `_workspace/04_news_files/` 음성 파일

## 요약

- 전체 상태: **PASS**
- 검증 완료: 2026-08-08 18:00 (KST)

## 검증 항목

| 항목 | 결과 | 비고 |
| ---- | ---- | ---- |
| 클립 수 (시나리오 발화 44개 ↔ 클립 44개) | PASS | 44/44 매칭 |
| 클립 파일 형식 | PASS | 24000Hz / 16bit / mono / WAV |
| 무음·깨진 클립 | PASS | 전 클립 정상 생성 (edge-tts) |
| 총 재생 길이 | PASS | 약 610.6초 (10분 10초) |
| 전체 브로드캐스트 파일 | PASS | `full_news.wav` 610.6초 정상 |
| 화자 레이블 | PASS | 호스트 / 리포터 구분 파일명 유지 |
| 시나리오 ↔ 음성 매핑 | PASS | 클립 순서가 시나리오 발화 순서와 일치 |
| 화자별 목소리 구분 | PASS | 호스트=SunHi(여) / 리포터=InJoon(남) |

## 검증 방식

- Python `wave` 모듈로 각 WAV 헤더·프레임·형식 검증
- RMS(음량) 계산으로 무음 클립 여부 확인
- `afinfo`로 재생 길이·포맷 교차 확인

## 발견된 문제

- **(해결됨)** Gemini-tts 무료 할당량(일 10건) 소진으로 API 음성 생성 불가 → `edge-tts`(Microsoft Edge 신경망 TTS, 무료·교차플랫폼)로 재생성. 호스트=ko-KR-SunHiNeural(여), 리포터=ko-KR-InJoonNeural(남)로 화자별 다른 목소리 적용.
- (제한) 포스터 기반 공지 8건은 이미지 OCR 불가(모델 비전 미지원)로 제목 수준 정보만 뉴스에 반영.

## 권장 후속 조치

1. 필요 시 Gemini-tts 할당량 리셋 후 `_workspace/tts.py`로 재생성 가능하나 현재 edge-tts 음질·화자 구분이 충족됨.
2. 최종 뉴스 파일(`news/`) 및 메인 페이지(`app/lib/utils.js` EPISODES) 업데이트 확인.

## 최종 산출물 경로

- 시나리오: `_workspace/03_news_scenario.md`
- 개별 클립: `_workspace/04_news_files/clip_001~044_{호스트|리포터}.wav`
- 전체 방송: `_workspace/04_news_files/full_news.wav`
