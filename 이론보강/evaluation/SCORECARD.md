# Scorecard

## 최종 점수표

| 영역 | 배점 | 점수 | 근거 |
| --- | ---: | ---: | --- |
| 블록체인 정확성 | 30 | 28 | 핵심 개념은 전반적으로 정확하다. 합의, EIP-1559, peg 리스크, approve/allowance/reward 설명이 보강되어 있다. |
| 초보자 이해도 | 25 | 20 | 대부분 주차는 비유와 정석 설명을 병행하지만, Week3 시뮬레이터 설명 패턴이 다른 주차보다 덜 친절하다. |
| 오개념 방지 | 20 | 18 | 주요 오개념 방어가 좋다. 단, Week3은 오류 메시지와 확인 위치를 초보자 문장으로 한 번 더 고정하면 더 안전하다. |
| HTML 구조/UX | 15 | 12 | 각 페이지의 기본 구조와 인터랙션은 충분하다. 그러나 전체 커리큘럼 이동 nav와 모바일 정보량 개선이 필요하다. |
| 검증/evidence 신뢰도 | 10 | 10 | 하네스/MD/HTML 검증 통과, console error 0, overflow delta 0, evidence 21개가 확인되었다. |
| **합계** | **100** | **88** | P1 항목 때문에 최종 판정은 CONDITIONAL. |

## 판정 규칙

| 판정 | 조건 |
| --- | --- |
| PASS | 85점 이상, P0/P1 없음 |
| CONDITIONAL | 70~84점 또는 P1 있음 |
| FAIL | 70점 미만 또는 P0 있음 |

## 심사단별 판정

| 심사단 | 판정 | 점수 | 핵심 이유 |
| --- | --- | ---: | --- |
| 블록체인 정확성 | PASS | 28/30 | 치명적 오개념은 없음. 주제별 안전난간이 충분하다. |
| 초보자/구조 UX | CONDITIONAL | 33/40 | Week3 프레이밍과 전체 주차 이동 nav가 P1. |
| QA/evidence | PASS | 10/10 | 자동 검증과 evidence 메타데이터가 일관된다. |

## HTML별 구조 메트릭

| 파일 | H2 수 | 컨트롤 수 | `왜 해보는가` 수 | 실습 연결 수 | Reset |
| --- | ---: | ---: | ---: | ---: | --- |
| `01_week1_blockchain_basics.html` | 5 | 10 | 3 | 3 | Yes |
| `02_week2_wallet_transaction.html` | 4 | 24 | 3 | 3 | Yes |
| `03_week3_testnet_gas_nonce_signature.html` | 4 | 25 | 0 | 1 | Yes |
| `04_week4_stablecoin_networks.html` | 6 | 16 | 2 | 2 | Yes |
| `05_week5_solidity_remix_faucet.html` | 6 | 20 | 3 | 3 | Yes |
| `06_week6_erc20_staking_errors.html` | 6 | 25 | 3 | 3 | Yes |
| `index.html` | 2 | 6 | 2 | 2 | Yes |

Week3의 `왜 해보는가` 수가 0인 것은 자동 계약 실패는 아니지만, 과정 전체의 설명 틀 일관성에서는 가장 먼저 보강할 지점이다.
