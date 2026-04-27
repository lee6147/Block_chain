# Agent Task: MD Writer Week3-4

## 담당 범위

- `03_week3_testnet_gas_nonce_signature.md`
- `04_week4_stablecoin_networks.md`

## 시작 전 읽을 파일

- `START_HERE.md`
- `00_HARNESS_CONTRACT.md`
- `01_SOURCE_MANIFEST.md`

## 읽을 자료

- `week/week3-sepolia-lab/**`
- `week/week4/**`
- `실습/03.31 강의자료.pdf`
- `실습/03.31 실습자료.pdf`
- `피드백/survey_priority_summary.md`

## 작성 규칙

- Faucet 오류와 트랜잭션 실행 오류를 분리한다.
- nonce, gas, signature는 실습 실패 원인과 연결한다.
- 스테이블코인은 "가격 안정 자산"과 "네트워크 UX"를 구분해 설명한다.
- HTML 시뮬레이터 설계를 구체적으로 적는다.

## 금지사항

- 테스트넷 ETH를 채굴한다고 표현하지 않는다.
- L1/L2나 Faucet 조건을 최신 사실처럼 단정하지 말고 기존 자료 기준으로 설명한다.

## 완료 조건

- `node tools/verify_outputs.mjs --md-only`에서 week3~4 MD가 통과한다.
