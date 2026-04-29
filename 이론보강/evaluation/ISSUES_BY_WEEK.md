# Issues By Week

## Priority Legend

- **P0**: 치명적 오류. 수업 사용 불가.
- **P1**: 수업 전 수정 필요.
- **P2**: 개선 권고.
- **P3**: 표현 또는 polish.

## Global

| Priority | Issue | Evidence | Recommendation |
| --- | --- | --- | --- |
| P1 | 주차 간 이동 내비게이션 부족 | 각 Week HTML nav가 대체로 페이지 내부 섹션 중심이다. | 모든 Week 페이지에 `목차`, `이전 주차`, `다음 주차` 링크를 추가한다. |
| P2 | 시각 시스템이 Week1~3과 Week4~6에서 조금 갈린다. | Week1~3은 Arial/Noto 계열, Week4~6은 Segoe/Malgun/system 계열이다. | 교육 패키지로 배포 전 폰트와 nav/card 스타일을 통일한다. |

## Index

| Priority | Issue | Recommendation |
| --- | --- | --- |
| P2 | `신규 보강 / 기존 자료 활용` 필터는 제작자 관점이다. | `처음부터`, `지갑/트랜잭션`, `오류 해결`, `ERC20/Staking`처럼 학습자 의도 중심으로 바꾼다. |

## Week1

| Priority | Issue | Recommendation |
| --- | --- | --- |
| P3 | 강점이 분명하지만 내용량이 많다. | 첫 화면에 `오늘 반드시 이해할 3문장`을 두면 초보자 진입이 더 쉬워진다. |

## Week2

| Priority | Issue | Recommendation |
| --- | --- | --- |
| P3 | Provider/Signer/RPC 역할 설명은 좋지만 버튼 수가 많다. | `처음 누를 순서` 안내를 추가하면 실습 전 복습용으로 더 안정적이다. |

## Week3

| Priority | Issue | Evidence | Recommendation |
| --- | --- | --- | --- |
| P1 | 시뮬레이터 앞 설명 패턴이 다른 주차와 다르다. | `왜 해보는가` 문구가 0회이고, 첫 시뮬레이터는 `수업 목표` 중심이다. | 각 시뮬레이터 앞에 `왜 해보는가`와 `예측 -> 실행 -> 상태 변화 -> 해석`을 명시한다. |
| P1 | Explorer 필드 시뮬레이터의 전후 맥락이 약하다. | Simulator 2가 바로 필드 선택으로 들어간다. | 선택 전 목적과 선택 후 실습 연결 문장을 Week1/2처럼 맞춘다. |

## Week4

| Priority | Issue | Recommendation |
| --- | --- | --- |
| P2 | 네트워크/리스크 비교 정보량이 모바일에서 많다. | `핵심만 보기` 요약 카드를 표 또는 세부 시뮬레이터 앞에 둔다. |

## Week5

| Priority | Issue | Recommendation |
| --- | --- | --- |
| P2 | Remix read/write, Faucet, CEI가 모두 들어 있어 정보량이 높다. | 수업 직전에는 `read는 eth_call, write는 tx` 요약을 상단에 고정한다. |

## Week6

| Priority | Issue | Recommendation |
| --- | --- | --- |
| P2 | approve/stake/reward/classifier 컨트롤이 많다. | `추천 첫 경로: approve -> allowance 조회 -> stake -> pendingReward -> claim` 안내를 추가한다. |
| P2 | 모바일 표와 classifier 정보량이 많다. | 오류표 앞에 `gas/nonce/allowance/reward/lock` 5분류 요약 카드를 둔다. |

## P0 Summary

P0 없음.

## P1 Summary

1. Week3 시뮬레이터 설명 프레이밍 보강.
2. 모든 Week 페이지에 전체 커리큘럼 이동 nav 추가.
