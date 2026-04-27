# Agent Task: MD Writer Week5-6

## 담당 범위

- `05_week5_solidity_remix_faucet.md`
- `06_week6_erc20_staking_errors.md`

## 시작 전 읽을 파일

- `START_HERE.md`
- `00_HARNESS_CONTRACT.md`
- `01_SOURCE_MANIFEST.md`

## 읽을 자료

- `week/week5/**`
- `week/week6/**`
- `실습/04.07 강의자료.pdf`
- `실습/04.14 강의자료.pdf`
- `실습/04.21 강의자료.pdf`
- `피드백/survey_priority_summary.md`

## 작성 규칙

- require/revert를 "조건 실패"로 설명한다.
- ERC20의 `approve`, `allowance`, `transferFrom` 관계를 반드시 설명한다.
- staking 에러를 balance, allowance, reward pool, lock, nonce, gas, require 조건으로 나눠 설명한다.
- HTML 시뮬레이터 설계를 구체적으로 적는다.

## 금지사항

- 컴파일 오류, Faucet 수령 오류, 트랜잭션 실행 오류를 한데 섞지 않는다.
- 실제 송금 자동화 같은 위험한 기능을 권장하지 않는다.

## 완료 조건

- `node tools/verify_outputs.mjs --md-only`에서 week5~6 MD가 통과한다.
