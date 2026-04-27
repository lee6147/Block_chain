# QA Report

## 요약

이론보강 하네스 기반 산출물 제작을 완료했다.

- 기존 자료 평가/커리큘럼: 완료
- 주차별 MD 6개: 완료
- 주차별 HTML 6개: 완료
- 인덱스 HTML: 완료
- 브라우저 evidence: 완료
- 최종 검증: 통과

## 생성 산출물

| 유형 | 파일 |
| --- | --- |
| 기존 HTML 평가 | `03_EXISTING_HTML_REVIEW.md` |
| Week1 | `01_week1_blockchain_basics.md`, `01_week1_blockchain_basics.html` |
| Week2 | `02_week2_wallet_transaction.md`, `02_week2_wallet_transaction.html` |
| Week3 | `03_week3_testnet_gas_nonce_signature.md`, `03_week3_testnet_gas_nonce_signature.html` |
| Week4 | `04_week4_stablecoin_networks.md`, `04_week4_stablecoin_networks.html` |
| Week5 | `05_week5_solidity_remix_faucet.md`, `05_week5_solidity_remix_faucet.html` |
| Week6 | `06_week6_erc20_staking_errors.md`, `06_week6_erc20_staking_errors.html` |
| 진입 페이지 | `index.html` |

## 실행한 검증 명령

```powershell
node .\tools\verify_outputs.mjs --harness-only
node .\tools\verify_outputs.mjs --md-only
node .\tools\verify_outputs.mjs --html-only
node .\tools\verify_outputs.mjs --full
```

## 검증 결과

| Gate | 결과 | 비고 |
| --- | --- | --- |
| Harness | 통과 | `START_HERE.md`, 계약, 매니페스트, task, evidence 구조 확인 |
| MD | 통과 | 6개 MD 모두 필수 8개 섹션 포함 |
| HTML | 통과 | 7개 HTML 모두 title/h1/nav/interactive/reset/simulator 조건 충족 |
| Browser full | 통과 | 375px, 768px, 1440px 렌더링 및 콘솔 확인 |

최종 full 검증 결과:

```text
OK --full: harness/output contract checks passed
```

## Evidence

| 항목 | 수량 | 위치 |
| --- | ---: | --- |
| 스크린샷 PNG | 21 | `evidence/screenshots/` |
| 콘솔/레이아웃 JSON | 21 | `evidence/console/` |
| Console error empty entries | 21 | 모든 JSON의 `consoleErrors`가 빈 배열 |

검증 대상 viewport:

- 375px
- 768px
- 1440px

## 인터랙션 확인

자동 검증에서 각 HTML의 interactive control 개수와 horizontal overflow를 확인했다.

- `01_week1_blockchain_basics.html`: controls 6
- `02_week2_wallet_transaction.html`: controls 18
- `03_week3_testnet_gas_nonce_signature.html`: controls 19
- `04_week4_stablecoin_networks.html`: interactive controls present
- `05_week5_solidity_remix_faucet.html`: interactive controls present
- `06_week6_erc20_staking_errors.html`: error-cause classifier 포함
- `index.html`: learning flow simulator와 자료 필터 포함

## 특이사항

- 첫 `--full` 실행은 Playwright browser executable 부재로 실패했다.
- `npx playwright install chromium`으로 브라우저 런타임을 설치했다.
- 이후 sandbox 내부에서는 browser launch가 `EPERM`으로 차단되어, 승인된 외부 실행으로 `node .\tools\verify_outputs.mjs --full`을 수행했다.
- 승인된 외부 실행에서 최종 full 검증은 통과했다.

## 2026-04-27 교육 보강 점검

이번 보강은 `START_HERE.md -> 00_HARNESS_CONTRACT.md -> 01_SOURCE_MANIFEST.md -> tasks/agent-*.md -> tools/verify_outputs.mjs` 순서로 하네스를 확인한 뒤 진행했다.

읽은 하네스 파일:

- `START_HERE.md`
- `00_HARNESS_CONTRACT.md`
- `01_SOURCE_MANIFEST.md`
- `03_EXISTING_HTML_REVIEW.md`
- `tasks/agent-md-week1-2.md`
- `tasks/agent-md-week3-4.md`
- `tasks/agent-md-week5-6.md`
- `tasks/agent-html-week1-3.md`
- `tasks/agent-html-week4-6.md`
- `tasks/agent-qa.md`
- `tools/verify_outputs.mjs`

보강 기준:

- MD는 HTML보다 먼저 보강한다.
- HTML은 같은 주차 MD의 개념 보강 내용을 확장한다.
- 실제 지갑 연결, 실제 RPC 호출, 실제 chain 조회는 넣지 않는다.
- 기존 `week`, `이론`, `실습`, `특강`, `피드백` 폴더는 수정하지 않는다.

| 주차 | MD 교육 보강 | HTML 시뮬레이터 보강 | 수동 판정 |
| --- | --- | --- | --- |
| Week1 | `개념 보강 블록` 추가: 블록, 해시, 체인, 합의/분산 검증, API 데이터와 체인 데이터 | `API 데이터 vs 블록체인 데이터 읽기 비교` 미니 시뮬레이터 추가, 합의 확인 질문 보강 | 통과 |
| Week2 | 지갑, 서명, RPC, Explorer를 비유/정의/오해/질문으로 재정리 | 트랜잭션, 역할 구분, 오류 분리에 `예측 -> 실행 -> 상태 변화 -> 해석` 안내 추가 | 통과 |
| Week3 | Faucet, nonce, gas, signature를 실패 진단 관점으로 재정리 | 판별기와 Explorer 필드에 예측/해석 안내 추가 | 통과 |
| Week4 | 스테이블코인, 전용 네트워크, L1/L2/Rollup, gas token, 준비물 판단 흐름 보강 | 네트워크 비교와 L1/L2 정산 비교에 해석 안내 추가, 보내는 자산/gas token/정산 위치 질문 보강 | 통과 |
| Week5 | 컨트랙트, Remix 단계, require/revert, cooldown/Faucet 잔액, event log 보강 | Remix, Faucet, 오류 분류 시뮬레이터에 해석 안내 추가, cooldown/Faucet 잔액/지갑 gas 분리 질문 보강 | 통과 |
| Week6 | approve/allowance, transferFrom/stake, reward lazy update, 오류 진단 보강 | approve/stake, reward, 오류 판별기에 해석 안내 추가 | 통과 |

교육 품질 점검 결과:

- 모든 MD가 필수 8개 섹션을 유지하면서 `비유`, `정석 정의`, `왜 중요한가`, `실습에서 어디에 보이나`, `자주 하는 오해`, `확인 질문`을 포함한다.
- 모든 HTML에 최소 하나 이상의 `예측 -> 실행 -> 상태 변화 -> 해석` 흐름이 추가되었다.
- Week1에는 기존에 텍스트로만 있던 API/RPC 데이터 연결을 조작 가능한 미니 시뮬레이터로 보강했다.
- Week4~6은 대형 재작성 없이 기존 시뮬레이터 앞에 결과 해석 캡션을 추가했다.

## 2026-04-27 병렬 에이전트 사후 검토

사용자 지적 후 읽기 전용 병렬 검토를 3개 갈래로 추가 수행했다.

| 검토 갈래 | 판정 | 반영 내용 |
| --- | --- | --- |
| MD 커리큘럼 검토 | PASS, 개선 권고 3건 | Week1 합의/분산 검증, Week4 준비물 판단 흐름, Week5 cooldown/Faucet 잔액 개념을 MD와 HTML에 추가 반영 |
| HTML/UX 검토 | PASS | 6개 HTML 모두 `예측 -> 실행 -> 상태 변화 -> 해석` 흐름과 실제 호출 금지 조건을 만족 |
| 하네스/QA 검증 | PASS | `--harness-only`, `--md-only`, `--html-only` 통과와 QA 기록 상태 확인 |

사후 보강 뒤 `node .\tools\verify_outputs.mjs --md-only`와 `node .\tools\verify_outputs.mjs --html-only`를 다시 실행했고 모두 통과했다.

## 2026-04-27 CTO 전문 검토 후 탄탄화

CTO/블록체인 전문 관점의 병렬 검토에서 `CONDITIONAL` 판정을 받았고, 학생 난이도를 크게 올리지 않는 선에서 오개념 방지와 시뮬레이터 정확도를 보강했다.

| 항목 | 반영 파일 | 반영 내용 |
| --- | --- | --- |
| Week1 합의 오개념 방지 | `01_week1_blockchain_basics.md`, `01_week1_blockchain_basics.html` | 로컬 해시 재계산과 네트워크 합의 인정을 분리하고, 단순 노드 수 과반이 실제 합의 모델이 아님을 명시 |
| Week2 순서 전제조건 | `02_week2_wallet_transaction.html` | 작성 전 서명, 서명 전 RPC 전송, 제출 전 블록 포함, 포함 전 Explorer 확인이 막히도록 상태 전이 강화 |
| Week3 EIP-1559 보충 | `03_week3_testnet_gas_nonce_signature.md`, `03_week3_testnet_gas_nonce_signature.html` | `gasUsed x gasPrice`는 초심자 공식임을 밝히고 base fee/priority fee/effective gas price, pending/replacement/dropped 흐름 추가 |
| Week4 스테이블코인 리스크 | `04_week4_stablecoin_networks.md`, `04_week4_stablecoin_networks.html` | 페깅은 보장이 아니라 목표 구조임을 첫 화면에 올리고 depeg, 발행자, 동결/검열, 브릿지, 정산 리스크를 별도 안전난간으로 추가 |
| Week6 approve/reward 정확도 | `06_week6_erc20_staking_errors.md`, `06_week6_erc20_staking_errors.html` | spender/무제한 승인/revoke 보안 박스 추가, reward 시뮬레이터에 `lastUpdate`, pending/accrued 표시, 1e18 decimals 주석, 반복 claim 방지 반영 |
| 인덱스 학습 흐름 | `index.html` | Week4를 상단 흐름에 포함하고 Week5/Week6을 분리해 전체 커리큘럼 누락감을 줄임 |

탄탄화 뒤 `node .\tools\verify_outputs.mjs --md-only`와 `node .\tools\verify_outputs.mjs --html-only`를 다시 실행했고 모두 통과했다. 실제 호출 정적 검색에서도 설명용 `fetch()`, `JsonRpcProvider`, `BrowserProvider` 문자열만 확인되었고 지갑/RPC/체인 호출 코드는 추가되지 않았다.

## 2026-04-27 HTML별 전문 에이전트 팀 구현

사용자 요청에 따라 6개 주차 HTML을 파일별 전문 블록체인 팀 단위로 다시 점검했다. 동시 실행 제한 때문에 Wave로 나누었고, 각 HTML마다 최소 2명 이상의 역할을 배정했다. 구현 agent가 시간 초과된 주차는 리더가 critic 결과를 통합해 직접 패치했다.

| 파일 | 팀 구성 | 핵심 반영 |
| --- | --- | --- |
| `01_week1_blockchain_basics.html` | 구현 1, 블록체인 critic 1 | 교육용 toy hash와 실제 SHA-256/Keccak 구분, 단순 과반 합의 오개념 완화, RPC/Explorer는 체인 데이터를 읽는 창구라는 안전난간 추가 |
| `02_week2_wallet_transaction.html` | 구현 1, 트랜잭션 critic 1 | 작성 -> 서명 -> RPC 접수 -> 멤풀 -> 블록 포함 -> receipt/Explorer 순서 강화, 단계별 전제조건과 진단 질문 보강 |
| `03_week3_testnet_gas_nonce_signature.html` | 구현 1, nonce/gas critic 2 | latest/confirmed nonce와 pending nonce 구분, EIP-1559 base fee/priority fee/effective gas price 및 priority fee clipping 설명 보강 |
| `04_week4_stablecoin_networks.html` | 구현 1, 네트워크/리스크 critic 1 | 자산, gas token, settlement 위치, 구조적 리스크 판단 순서 추가, issuer/freeze/bridge/settlement 리스크 선택지 추가 |
| `05_week5_solidity_remix_faucet.html` | 구현 1, Solidity/Faucet critic 1 | Remix read `eth_call`과 write transaction 구분, Faucet CEI 실행 추적, `call{value: amount}("")`와 reentrancy 안전난간 보강 |
| `06_week6_erc20_staking_errors.html` | 구현 1, 블록체인 critic 1, 시뮬레이터 QA 1 | spender mismatch, revoke/approve(0), raw unit/decimals, pendingReward view 계산, claim/withdraw 분리, 단계/메시지 불일치 classifier 방어, next evidence 출력 보강 |

이번 팀 구현 뒤 추가 수동 패치:

- Week5 MD/HTML에 CEI의 `Checks -> Effects -> Interactions -> Event` 실행 추적을 맞추고, event를 외부 전송과 분리했다.
- Week6 MD/HTML에 `parseUnits("50", 18)`/`formatUnits` 단위 예시, reward reserve 계산 주의, wrong spender 원인을 추가했다.
- Week6 `pendingReward()`는 stored reward와 `lastUpdate`를 바꾸지 않는 view 계산으로 수정했다.
- Week6 classifier는 단계와 메시지가 맞지 않으면 성공 판정을 하지 않도록 `validMessagesByStep` 검사를 추가했다.

팀 구현 뒤 재검증:

```text
OK --harness-only: harness/output contract checks passed
OK --md-only: harness/output contract checks passed
OK --html-only: harness/output contract checks passed
```

## 남은 위험

- 브라우저 자동 검증은 렌더링, 콘솔 에러, horizontal overflow, control 개수 중심이다. 교육 문장의 질은 사람이 최종 수업 전에 한 번 훑어보는 것이 좋다.
- HTML은 오프라인 교육용 시뮬레이터이며 실제 지갑/RPC/체인 호출을 하지 않는다. 실제 live demo 자료와 혼동하지 않도록 수업에서 명시해야 한다.
- 기존 week 자료는 수정하지 않았기 때문에, 학생에게 배포할 때는 `이론보강/index.html`을 새 진입점으로 안내해야 한다.
