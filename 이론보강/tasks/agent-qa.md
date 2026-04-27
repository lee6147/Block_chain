# Agent Task: QA Verifier

## 담당 범위

- 하네스 구조, MD 계약, HTML 계약, 브라우저 렌더링 검증

## 시작 전 읽을 파일

- `START_HERE.md`
- `00_HARNESS_CONTRACT.md`

## 읽을 자료

- 모든 산출 MD/HTML
- `tools/verify_outputs.mjs`

## 만들 산출물

- `99_QA_REPORT.md`
- `evidence/screenshots/*`
- `evidence/console/*`

## 검증 항목

- 필수 파일 존재
- MD 필수 섹션 존재
- HTML 필수 구조와 인터랙션 존재
- 375px, 768px, 1440px 렌더링
- 콘솔 에러 0개
- 버튼 클릭 후 DOM 상태 변화
- 텍스트 겹침과 가로 스크롤 없음

## 금지사항

- 검증 실패를 성공처럼 보고하지 않는다.
- 실패 원인 없이 "수동 확인 필요"로 끝내지 않는다.

## 완료 조건

- `node tools/verify_outputs.mjs --full` 통과 결과 또는 실패 원인과 수정 지시가 `99_QA_REPORT.md`에 기록되어 있다.
