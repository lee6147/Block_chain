# Agent Task: HTML Builder Week1-3

## 담당 범위

- `01_week1_blockchain_basics.html`
- `02_week2_wallet_transaction.html`
- `03_week3_testnet_gas_nonce_signature.html`

## 시작 전 읽을 파일

- `START_HERE.md`
- `00_HARNESS_CONTRACT.md`

## 읽을 자료

- 같은 번호의 MD 원본
- 재사용 후보 기존 HTML

## 구현 규칙

- MD 원본이 통과한 뒤 HTML을 만든다.
- HTML은 정적 단일 파일로 만든다.
- 각 HTML에 최소 2개 이상의 인터랙티브 요소를 넣는다.
- 시뮬레이터 앞뒤에 설명을 넣는다.
- 모바일 폭에서 버튼과 텍스트가 겹치지 않게 한다.

## 금지사항

- 실제 지갑 연결, 실제 RPC 호출, 실제 송금 기능을 넣지 않는다.
- 기존 HTML을 통째로 복사하지 않는다.

## 완료 조건

- `node tools/verify_outputs.mjs --html-only`에서 week1~3 HTML이 통과한다.
