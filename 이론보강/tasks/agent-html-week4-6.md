# Agent Task: HTML Builder Week4-6

## 담당 범위

- `04_week4_stablecoin_networks.html`
- `05_week5_solidity_remix_faucet.html`
- `06_week6_erc20_staking_errors.html`

## 시작 전 읽을 파일

- `START_HERE.md`
- `00_HARNESS_CONTRACT.md`

## 읽을 자료

- 같은 번호의 MD 원본
- 재사용 후보 기존 HTML

## 구현 규칙

- MD 원본이 통과한 뒤 HTML을 만든다.
- HTML은 정적 단일 파일로 만든다.
- Week6에는 에러 원인 판별 인터랙션을 반드시 넣는다.
- 시각 효과는 개념 이해를 돕는 용도로만 사용한다.
- 모바일 폭에서 버튼과 텍스트가 겹치지 않게 한다.

## 금지사항

- 실제 chain/RPC 상태를 조회하지 않는다.
- staking을 투자 권유처럼 표현하지 않는다.
- 기존 HTML을 통째로 복사하지 않는다.

## 완료 조건

- `node tools/verify_outputs.mjs --html-only`에서 week4~6 HTML이 통과한다.
