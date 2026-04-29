# Week4~6 초보자 보강 작업 지시서

## Role

블록체인 교육자료 개선자. 기존 실습 자료를 실제 RPC/DApp처럼 확장하지 않고, 완전 초보자가 버튼 순서와 오류 원인을 따라갈 수 있도록 MD-first로 보강한다.

## Audience

- 블록체인, 지갑, gas, Solidity, ERC20, staking을 처음 배우는 학생
- 오류 메시지를 보면 "전부 고장"으로 느끼는 초보자
- 실습 버튼은 누를 수 있지만 어떤 상태가 바뀌는지 아직 모르는 학습자

## Target files

- Markdown 원본 보강
  - `04_week4_stablecoin_networks.md`
  - `05_week5_solidity_remix_faucet.md`
  - `06_week6_erc20_staking_errors.md`
- HTML 반영
  - `04_week4_stablecoin_networks.html`
  - `05_week5_solidity_remix_faucet.html`
  - `06_week6_erc20_staking_errors.html`

## Work order

1. 이 계획 문서를 먼저 작성한다.
2. Week4~6 Markdown을 먼저 보강한다.
3. Markdown에서 보강한 초보자 안전난간을 각 HTML에 반영한다.
4. HTML은 오프라인 정적 시뮬레이터로 유지한다.
5. `tools/verify_outputs.mjs`로 MD/HTML/full 검증을 실행하고 실패하면 수정한다.

## Beginner-first 원칙

- 기본: 비유, 한 문장 정의, 버튼 순서를 먼저 둔다.
- 보강: 자주 하는 오해와 실습에서 보이는 증거를 연결한다.
- 심화: 본문을 과적재하지 않고 `더 깊게 보기` 블록에 넣는다.
- 오개념 방지가 개념 추가보다 우선이다.

## Week별 보강 범위

### Week4

- 스테이블코인 자산 리스크와 네트워크 UX 리스크를 분리한다.
- 준비금, 상환, 발행자, 동결, depeg, bridge를 초보자용 질문으로 넣는다.
- `후원 수수료`는 `무료`가 아니라 `누군가 대신 지불하거나 정책상 보조되는 모델`임을 명시한다.

### Week5

- Compile 성공 전에는 Deploy가 성립하지 않는 흐름을 고정한다.
- Faucet 실패 원인을 cooldown, Faucet 잔액, 지갑 gas, 네트워크, require 조건으로 나눈다.
- `execution reverted` 다음에는 실패 단계와 require 조건을 먼저 묻게 한다.

### Week6

- approve → allowance → stake → pendingReward → claim → withdraw 버튼 순서를 고정한다.
- reward accounting은 교육용 근사 모델과 실제 컨트랙트 raw unit/lazy update 차이를 분리한다.
- 다중 stake 전 기존 reward 정산 개념을 추가한다.
- approve race와 `approve(0)` 흐름의 의미를 보강한다.

## Tools

- PowerShell: 파일 확인, 검증 명령 실행
- Python parser: UTF-8 파일 패치, HTML 구조 점검
- Node verifier: `node .\tools\verify_outputs.mjs --md-only|--html-only|--full`
- Playwright: `--full` 실행 시 브라우저/모바일 폭/콘솔 오류 증거 생성
- Native subagents: 독립 검토가 필요할 때 블록체인, Solidity, UX, verifier 역할로 제한 사용

## Ralph-style 실행 루프

현재 세션에서는 Ralph 프로토콜을 수동 적용한다.

1. 계획 MD 작성
2. MD 보강
3. HTML 반영
4. 검증
5. 지적 사항 반영
6. 재검증 후 완료 보고

실제 OMX tmux 환경에서 `omx ralph`가 가능하면 같은 단계를 지속 루프로 맡긴다.

## Acceptance criteria

- 초보자가 각 페이지의 "처음이면 이 순서로"를 따라 버튼을 누를 수 있다.
- 오류가 났을 때 `컴파일 전`, `배포 전`, `트랜잭션 실행 후`, `컨트랙트 require 실패`, `지갑 gas/nonce 문제`를 구분할 수 있다.
- Week4는 자산 리스크와 네트워크 UX 리스크를 섞지 않는다.
- Week5는 Compile → Deploy → Function Call → Faucet → 오류 분류 순서를 흐리지 않는다.
- Week6는 approve가 송금이 아니며 stake가 실제 transferFrom이라는 점을 반복 확인시킨다.
- HTML은 정적 교육 시뮬레이터이며 실제 wallet/RPC/chain 호출을 추가하지 않는다.

## Do-not-do

- 실제 RPC, wallet, explorer, chain 호출 기능을 추가하지 않는다.
- 기존 week 원본 자료를 수정하지 않는다.
- 초보자 본문에 고급 개념을 과적재하지 않는다.
- `후원 수수료`, `스테이블 gas`, `전용 네트워크`를 무료/무위험으로 표현하지 않는다.
- Remix VM 성공과 Sepolia 성공을 같은 것으로 취급하지 않는다.

## Verification commands

```powershell
node .\tools\verify_outputs.mjs --md-only
node .\tools\verify_outputs.mjs --html-only
node .\tools\verify_outputs.mjs --full
```
