# 이론보강 하네스 계약

이 폴더는 week1~6 이론 보강 자료를 안정적으로 생산하기 위한 실행 하네스다. 실제 콘텐츠 제작자는 이 계약을 먼저 읽고 따른다.

## 절대 규칙

1. MD를 먼저 작성한다.
2. HTML은 MD의 단순 변환물이 아니라 설명, 예시, 시뮬레이터, 애니메이션, 시각 효과를 더한 확장판이다.
3. 비유적 설명은 허용하지만, 반드시 정석적 정의와 원리 설명을 함께 쓴다.
4. 각 MD에는 HTML 시뮬레이터 설계를 포함한다.
5. 기존 `week`, `이론`, `실습`, `특강`, `피드백` 파일은 수정하지 않는다.
6. 기존 좋은 HTML은 새로 만들지 말고 참고, 연결, 축약, 보강 대상으로 쓴다.
7. 모든 최종 HTML은 오프라인 정적 파일로 열려야 한다.
8. 새 npm/pip 의존성은 추가하지 않는다.
9. OMX tmux team은 사용하지 않는다. 필요하면 Codex native subagents를 사용한다.

## 콘텐츠 품질 기준

- 초심자 기준으로 설명한다.
- 학생 설문에서 나온 이론 결핍을 직접 보강한다.
- 실습 화면이나 코드에서 해당 개념이 어디에 나타나는지 연결한다.
- Faucet 오류와 트랜잭션 실행 오류를 분리한다.
- `gas limit`, `insufficient funds`, `nonce too low`, `execution reverted`의 원인을 구분한다.
- 에러를 "도구 고장"으로 설명하지 말고 지갑, 잔고, 네트워크, nonce, contract require, allowance, lock 상태 중 어디 문제인지 좁히게 한다.

## MD 필수 섹션

각 주차 MD는 아래 섹션명을 그대로 포함해야 한다.

1. `## 학습 목표`
2. `## 비유로 먼저 이해하기`
3. `## 정석 개념 설명`
4. `## 수업 실습과 연결`
5. `## 자주 헷갈리는 지점`
6. `## HTML 시뮬레이터 설계`
7. `## 체크리스트`
8. `## 참고한 기존 자료`

## HTML 필수 조건

각 주차 HTML은 아래 조건을 만족해야 한다.

- `<title>`과 페이지 최상단 `h1`이 있다.
- 목차 또는 주차 내비게이션이 있다.
- MD 원본의 정석 설명을 누락하지 않는다.
- 최소 2개 이상의 인터랙티브 요소가 있다.
- 각 시뮬레이터 앞에는 "왜 해보는가" 설명이 있다.
- 각 시뮬레이터 뒤에는 "실제 실습에서 어디에 해당하는가" 설명이 있다.
- 초기화 버튼 또는 초기 상태 복구 동작이 있다.
- 모바일 폭에서도 텍스트, 버튼, 시뮬레이터가 겹치지 않는다.

## 작업 단계

1. 기존 자료를 평가한다.
2. 주차별 MD를 작성한다.
3. MD 계약을 검증한다.
4. HTML 확장판을 만든다.
5. HTML 계약과 브라우저 동작을 검증한다.
6. `99_QA_REPORT.md`에 결과를 기록한다.

## 산출물 계약

최종 산출물은 아래 이름을 사용한다.

| 유형 | 파일 |
| --- | --- |
| 기존 HTML 평가 | `03_EXISTING_HTML_REVIEW.md` |
| Week1 MD/HTML | `01_week1_blockchain_basics.md`, `01_week1_blockchain_basics.html` |
| Week2 MD/HTML | `02_week2_wallet_transaction.md`, `02_week2_wallet_transaction.html` |
| Week3 MD/HTML | `03_week3_testnet_gas_nonce_signature.md`, `03_week3_testnet_gas_nonce_signature.html` |
| Week4 MD/HTML | `04_week4_stablecoin_networks.md`, `04_week4_stablecoin_networks.html` |
| Week5 MD/HTML | `05_week5_solidity_remix_faucet.md`, `05_week5_solidity_remix_faucet.html` |
| Week6 MD/HTML | `06_week6_erc20_staking_errors.md`, `06_week6_erc20_staking_errors.html` |
| 전체 진입 페이지 | `index.html` |
| QA 보고서 | `99_QA_REPORT.md` |

주차별 필수 시뮬레이터는 아래와 같다.

| 주차 | 필수 시뮬레이터 |
| --- | --- |
| Week1 | 블록 데이터 수정, 해시 변경, 체인 깨짐 |
| Week2 | 서명, RPC 전송, 블록 포함, explorer 확인 |
| Week3 | 잔고/gas/nonce/pending 상태에 따른 성공/실패 판별 |
| Week4 | 일반 네트워크 vs 스테이블코인 전용 네트워크 비교 |
| Week5 | 함수 호출, require 통과/실패, 상태 변경, 이벤트 |
| Week6 | approve, stake, reward 증가, claim/withdraw, 에러 원인 판별 |

## 완료 조건

- `node tools/verify_outputs.mjs --harness-only`가 통과한다.
- 최종 제작 후 `node tools/verify_outputs.mjs --full`이 통과한다.
- `99_QA_REPORT.md`에 검증 결과와 남은 위험이 기록된다.
