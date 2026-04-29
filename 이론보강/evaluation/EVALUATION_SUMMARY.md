# 이론보강 HTML 전문가 심사 요약

## 최종 판정

**CONDITIONAL**

기본 하네스와 HTML 구조 검증은 통과했지만, 수업 전 수정이 필요한 P1 항목이 남아 있다. 치명적인 블록체인 오개념(P0)은 발견하지 못했다. 다만 Week3의 시뮬레이터 설명 프레이밍이 다른 주차보다 약하고, 각 주차 HTML에서 전체 커리큘럼으로 돌아가는 내비게이션이 부족하다.

## 현재 검증 증거

| 항목 | 결과 |
| --- | --- |
| `node .\tools\verify_outputs.mjs --harness-only` | PASS |
| `node .\tools\verify_outputs.mjs --md-only` | PASS |
| `node .\tools\verify_outputs.mjs --html-only` | PASS |
| 평가 대상 HTML | 7개 (`index.html`, Week1~6) |
| console/layout JSON | 21개 |
| console error 파일 | 0개 |
| 최대 horizontal overflow delta | 0 |
| evidence 기준 최소 컨트롤 수 | 6 |
| 실제 지갑/RPC 호출 코드 | 발견 없음 |

## 주의 사항

1. **단계적으로 차근차근 진행한다.**  
   이 심사는 기준 고정, 자동 검증, 주차별 전문가 심사, 구조/UX 심사, 통합 판정, 필요 시 수정 루프 순서로만 진행한다. P0/P1/P2/P3를 먼저 나누고, 한 번에 모든 것을 고치려 하지 않는다.

2. **수업 전 필수 수정과 개선 권고를 분리한다.**  
   P0/P1은 수업 전에 반드시 처리해야 하고, P2/P3는 시간 대비 효과를 보고 반영한다. 현재 판정은 P1이 있으므로 `CONDITIONAL`이다.

3. **Ralph는 평가 이후 수정/재검증 루프에 쓴다.**  
   Ralph의 역할은 주차별 심사 결과를 통합하고, P1 수정 후 `html 검증 -> evidence 확인 -> 재심사`를 반복해 fresh evidence와 최종 sign-off가 있을 때만 멈추는 것이다.

## 점수

| 영역 | 배점 | 점수 | 판정 |
| --- | ---: | ---: | --- |
| 블록체인 정확성 | 30 | 28 | PASS |
| 초보자 이해도 | 25 | 20 | CONDITIONAL |
| 오개념 방지 | 20 | 18 | PASS |
| HTML 구조/UX | 15 | 12 | CONDITIONAL |
| 검증/evidence 신뢰도 | 10 | 10 | PASS |
| **총점** | **100** | **88** | **CONDITIONAL** |

총점만 보면 PASS 범위지만, P1 항목이 있어 최종 판정은 CONDITIONAL이다.

## P1: 수업 전 수정 필요

| 위치 | 문제 | 이유 | 권고 |
| --- | --- | --- | --- |
| `03_week3_testnet_gas_nonce_signature.html` | 시뮬레이터 앞 프레이밍이 다른 주차보다 약함 | 다른 주차는 `왜 해보는가`와 실습 연결이 반복되는데 Week3은 `수업 목표` 중심이라 초보자에게 목적이 덜 선명하다. | 각 시뮬레이터 앞에 `왜 해보는가`, `예측 -> 실행 -> 상태 변화 -> 해석`, 뒤에 `실제 실습에서 어디에 해당하는가`를 같은 형식으로 추가한다. |
| 전체 주차 HTML | 주차 간 이동 내비게이션 부족 | 직접 Week 파일을 열면 `목차`, `이전 주차`, `다음 주차` 이동이 보이지 않아 학습 흐름이 끊긴다. | 모든 Week 페이지 상단 nav에 `목차`, `이전`, `다음` 링크를 추가한다. |

## P2: 개선 권고

| 위치 | 문제 | 권고 |
| --- | --- | --- |
| Week4~6 | 모바일에서 표와 컨트롤이 정보량이 많다. | 표 앞에 `핵심만 보기` 요약 카드 또는 접이식 요약을 둔다. |
| `index.html` | `신규 보강 / 기존 자료 활용` 필터는 제작자 관점에 가깝다. | 초보자 관점의 `처음부터`, `지갑/트랜잭션`, `오류 해결`, `ERC20/Staking` 필터를 고려한다. |
| 전체 HTML | Week1~3과 Week4~6의 시각 시스템이 조금 다르다. | 폰트, nav 모양, simulator card 스타일을 통일한다. |
| Week6 | 컨트롤 수가 많아 첫 진입 경로가 부담될 수 있다. | `처음 누를 순서` 안내를 상단에 추가한다. |

## 보존할 강점

- Week1은 toy hash와 실제 네트워크 합의를 구분해 합의 오개념을 방지한다.
- Week2는 지갑, Provider, Signer, RPC 역할을 분리한다.
- Week3은 Faucet 문제와 트랜잭션 실행 문제를 분리한다.
- Week4는 peg를 보장이 아니라 목표 구조로 설명하고 depeg/issuer/freeze/bridge/settlement 리스크를 다룬다.
- Week5는 Remix read/write, require/revert, Faucet 잔액, CEI 흐름을 연결한다.
- Week6은 approve/allowance/transferFrom/stake/reward/claim/withdraw 오류 원인 분리가 좋다.

## Ralph 운영 메모

이번 실행에서는 Codex App 표면에서 prompt-side Ralph 상태를 사용했다. 실제 OMX `ralph` CLI/tmux 런타임은 실행하지 않았고, Ralph 원칙을 다음처럼 적용했다.

1. 컨텍스트 스냅샷 작성
2. fresh verification evidence 수집
3. native subagents 병렬 심사
4. P0/P1/P2/P3 분류
5. 평가 보고서 작성
6. 재검증 및 architect-style 확인

다음 수정 단계로 넘어간다면 Ralph 루프는 `P1 수정 -> html 검증 -> evidence 확인 -> 재심사` 순서로 진행한다.
