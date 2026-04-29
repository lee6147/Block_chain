# Week6 ERC20, Staking, Error Diagnosis 이론 보강

## 학습 목표

- ERC20의 `balanceOf`, `approve`, `allowance`, `transferFrom` 관계를 설명한다.
- Staking이 `approve -> stake -> reward 증가 -> claim/withdraw` 흐름으로 진행된다는 점을 이해한다.
- `require`/`revert`를 "조건 실패"로 보고, balance, allowance, reward pool, lock, nonce, gas, require 조건을 분리해 진단한다.
- 컴파일 오류, Faucet 수령 오류, 트랜잭션 실행 오류, staking 로직 오류를 한데 섞지 않는다.
- Week6 DApp과 Remix 실습에서 어떤 화면이 어떤 온체인 상태를 확인하는지 연결한다.

## 비유로 먼저 이해하기

ERC20의 `approve`는 자동이체 한도를 등록하는 일과 비슷하다. 내 통장에서 돈이 바로 빠져나가는 것은 아니다. 내가 "이 주소는 최대 100토큰까지 가져갈 수 있다"고 허용량을 등록하면, 나중에 그 주소가 `transferFrom`으로 실제 이체를 실행한다.

Staking은 헬스장 사물함에 토큰을 맡기고 이용 시간에 따라 포인트가 쌓이는 구조로 생각할 수 있다. 먼저 사물함 관리자에게 "내 토큰 100개까지 옮겨도 된다"고 허락한다. 그다음 `stake(100)`을 누르면 관리자가 허락된 한도 안에서 토큰을 사물함으로 옮긴다. 시간이 지나면 보상이 쌓이고, `claimReward()`로 보상만 받거나 `unstake()`로 원금까지 돌려받는다.

에러는 "문 하나가 잠겨 있다"는 신호다. 잔액 문, 승인 문, 보상 금고 문, 잠금 시간 문, gas 문, nonce 문 중 어느 문이 잠겼는지 찾아야 한다.

## 정석 개념 설명

ERC20은 이더리움 계열에서 fungible token을 다루기 위한 표준 인터페이스다. 핵심 함수는 다음과 같다.

| 함수 | 상태 변경 | 의미 |
| --- | --- | --- |
| `balanceOf(owner)` | 없음 | 특정 주소의 토큰 잔액 조회 |
| `transfer(to, amount)` | 있음 | 내 토큰을 직접 다른 주소로 보냄 |
| `approve(spender, amount)` | 있음 | `spender`가 내 토큰을 사용할 수 있는 한도를 기록 |
| `allowance(owner, spender)` | 없음 | `owner`가 `spender`에게 허용한 남은 한도 조회 |
| `transferFrom(from, to, amount)` | 있음 | `spender`가 허용량 안에서 `from`의 토큰을 `to`로 이동 |

`approve`는 송금이 아니라 권한 설정이다. `allowance[owner][spender] = amount`를 저장할 뿐이다. 실제 이동은 `spender`가 `transferFrom(owner, receiver, amount)`를 호출할 때 일어난다. Staking 컨트랙트가 사용자의 토큰을 가져가려면, 사용자가 먼저 `token.approve(stakingAddress, amount)`를 호출해야 한다.

실전에서는 `approve`가 보안 위험도 만든다. 잘못된 `spender` 주소에 승인하면 그 주소가 허용량 안에서 토큰을 가져갈 수 있다. 무제한 승인은 편하지만 피해 범위도 커진다. 따라서 수업에서는 테스트넷과 메인넷을 구분하고, `spender`가 정말 Staking 컨트랙트인지 확인하며, 필요 이상으로 큰 승인이나 오래 남은 승인은 revoke/approve(0)로 줄일 수 있음을 함께 안내한다.

또 하나의 안전난간은 오래된 ERC20의 approve race 문제다. 이미 `allowance=100`이 남아 있는데 곧바로 `approve(200)`으로 바꾸면, 일부 상황에서는 이전 승인과 새 승인이 겹쳐 해석될 위험을 설명하는 자료가 많다. 초보자에게는 복잡한 공격 과정보다 `현재 allowance 확인 -> approve(spender, 0)으로 revoke -> 새 수량 approve` 순서만 기억시킨다.

Week6 staking의 정석 흐름은 다음이다.

초보자에게는 버튼 순서를 고정해서 안내한다. `approve -> allowance 조회 -> stake -> pendingReward -> claimReward -> withdraw` 순서가 깨지면, 새 기능을 추가하기 전에 지금 어느 상태가 바뀌었는지부터 다시 본다.

1. ERC20 토큰 주소를 정한다.
2. Staking 컨트랙트를 ERC20 주소와 함께 배포한다.
3. Staking 컨트랙트에 보상으로 지급할 토큰을 미리 충전한다.
4. 사용자가 ERC20에서 `approve(stakingAddress, amount)`를 실행한다.
5. 사용자가 Staking에서 `stake(amount)`를 실행한다.
6. Staking 컨트랙트가 내부에서 `token.transferFrom(msg.sender, address(this), amount)`를 호출한다.
7. 시간이 지나면 `pendingReward(user)`가 증가한다.
8. `claimReward()`로 보상을 받거나 `unstake(amount)`/`withdraw` 계열 함수로 원금을 회수한다.

Staking 컨트랙트의 보상 원리는 `amount * rewardRatePerSecond * delta / 1e18`이다. 여기서 `delta`는 마지막 갱신 이후 지난 시간이다. 모든 사용자에게 매초 반복해서 보상을 쓰는 것이 아니라, `stake`, `claimReward`, `unstake` 같은 상태 변경 함수가 호출될 때 `_updateReward`로 그동안 쌓였을 보상을 한 번에 계산한다. 이것이 lazy update 패턴이다.

다중 stake에서는 새 수량을 더하기 전에 기존에 쌓인 reward를 먼저 정산해야 한다. 예를 들어 50개를 60초 맡긴 뒤 다시 30개를 stake하면, 60초 동안 50개가 만든 reward를 먼저 기록하고 그다음 staked amount를 80개로 바꾼다. 이 순서를 생략하면 과거 시간까지 80개를 맡긴 것처럼 계산되어 보상이 부풀 수 있다.

화면 표시 단위와 컨트랙트 내부 단위는 분리해야 한다. 예를 들어 18 decimals 토큰에서 화면의 `50 HNL`은 `parseUnits("50", 18)`처럼 `50 * 10^18` raw unit으로 변환되어 계산되고, 결과를 학생에게 보여줄 때는 `formatUnits(rawReward, 18)`처럼 다시 화면 단위로 바꾼다.

보상 정산 후에는 기준 시간이 갱신되어야 한다. `claimReward()`가 성공하면 지급된 pending reward는 0으로 돌아가고 `lastUpdate` 같은 기준값이 현재 시각으로 바뀐다. 그렇지 않으면 같은 경과 시간으로 보상을 반복 청구하는 잘못된 모델이 된다. 18 decimals 토큰에서는 화면의 1 HNL과 컨트랙트 내부의 `1e18` 단위를 구분해야 한다.

`require`와 `revert`는 아래처럼 해석한다.

| 실패 메시지 또는 현상 | 조건 실패 의미 |
| --- | --- |
| `amount=0` | 0토큰 staking은 허용하지 않는다 |
| `transferFrom failed` | 잔액이 부족하거나 approve/allowance가 부족하거나, approve를 다른 spender 주소에 주었다 |
| `nothing to claim` | 아직 보상이 0이거나 staking 수량/시간이 부족하다 |
| `reward transfer failed` | Staking 컨트랙트의 reward pool 잔액이 부족하다 |
| `execution reverted` | 컨트랙트의 require 조건 중 하나가 실패했다 |

## 개념 보강 블록

| 핵심 개념 | 비유 | 정석 정의 | 왜 중요한가 | 실습에서 어디에 보이나 | 자주 하는 오해 | 확인 질문 |
| --- | --- | --- | --- | --- | --- | --- |
| approve/allowance | 자동이체 한도 등록 | spender가 owner 토큰을 쓸 수 있는 허용량을 storage에 기록 | stake 전에 권한이 없으면 `transferFrom`이 실패한다 | ApproveForm, AllowanceChecker, Remix approve | approve는 즉시 송금이다 | approve 후 사용자 balance는 줄어드는가? |
| approve 보안 | 자동이체 권한을 누구에게 줄지 확인 | spender 주소와 승인 수량을 제한하고 필요 시 revoke하는 습관 | 잘못된 주소나 무제한 승인은 토큰 손실 위험을 키운다 | approve 수량, spender 주소, revoke/approve(0) | 테스트넷에서 해본 approve 감각을 메인넷에도 그대로 적용해도 된다 | 내가 승인한 spender는 누구이고, 얼마까지 가져갈 수 있는가? |
| transferFrom/stake | 허가받은 관리자가 실제 이동 | spender가 allowance 범위 안에서 owner 토큰을 이동 | staking은 approve 다음의 실제 상태 변경이다 | `stake(amount)`, staking balance 증가 | allowance만 충분하면 항상 stake 된다 | balance와 allowance 중 하나만 부족해도 어떻게 되는가? |
| reward lazy update | 출석할 때 몰아서 포인트 정산 | 상태 변경 함수 호출 시점에 지난 시간 보상을 계산 | 매초 모든 사용자 상태를 쓰지 않아 gas를 줄인다 | `_updateReward`, `pendingReward`, claim | 보상은 매초 storage에 자동 저장된다 | 시간이 지나도 함수 호출 전 storage는 왜 그대로일 수 있는가? |
| 다중 stake 전 정산 | 사물함에 물건을 더 넣기 전 기존 포인트를 계산 | stake 수량이 바뀌기 전 기존 기간의 reward를 먼저 저장 | 과거 보상을 새 stake 수량으로 과대 계산하지 않게 한다 | `_updateReward`가 `stake` 초반에 호출되는지 | 추가 stake를 하면 과거 시간도 새 수량으로 계산된다 | 새 stake 전에 기존 reward를 먼저 정산했는가? |
| 오류 진단 | 잠긴 문 찾기 | balance, allowance, pool, lock, gas, nonce, require 조건을 분리해 원인을 좁히는 과정 | 실행 실패를 DApp 고장으로 뭉뚱그리지 않는다 | classifier, MetaMask, Etherscan, Remix console | insufficient funds는 ERC20 부족이다 | gas용 ETH 부족과 ERC20 balance 부족은 어떻게 구분하는가? |

## 수업 실습과 연결

`week/week6/01_Faucet_수령_가이드.md`는 Sepolia ETH Faucet과 수업용 HNL Faucet을 분리한다. Sepolia ETH는 gas 지불용이고, HNL 같은 ERC20은 staking 실습용 토큰이다. 둘을 같은 "돈"으로 보면 오류 진단이 꼬인다.

`week/week6/03_Staking_컨트랙트_작성.md`는 `UserInfo`, `users`, `_updateReward`, `stake`, `claimReward`, `pendingReward`를 설명한다. 특히 `stake` 안의 `transferFrom`은 approve가 선행되어야만 통과한다.

`week/week6/04_Remix_VM_테스트.md`는 Remix VM에서 빠르게 전체 흐름을 검증한다. Step 5 `approve`, Step 6 `stake`, Step 7 `pendingReward`, Step 8 `claimReward`, Step 9 `unstake` 순서가 Week6의 핵심 실습 순서다.

`week/week6/05_Sepolia_배포_검증.md`는 실제 Sepolia 검증 단계다. 여기서는 gas, nonce, Etherscan, 소스 verify, 이벤트 로그까지 확인해야 한다. Remix VM에서 성공했더라도 Sepolia에서는 지갑 네트워크, Sepolia ETH, pending transaction, 컨트랙트 주소가 추가 변수다.

`week/week6/30_DApp.html`은 실행용 DApp이다. 이론 자료가 아니라 지갑 연결, Faucet 요청, approve/stake/claim 흐름을 눌러 보는 화면으로 연결한다. `erc20-app/erc20-tutorial.html`과 `src/components/token/ApproveForm.tsx`, `AllowanceChecker.tsx`는 approve와 allowance를 화면으로 확인하는 자료다.

04.21 강의자료는 ERC20 표준이 왜 필요한지, `approve`의 위험성과 권한 모델을 다룬다. 설문 요약에서도 approve/transferFrom, 트랜잭션, 오류 해결표가 기초 보강 요구로 잡혀 있다.

## 자주 헷갈리는 지점

| 헷갈리는 말 | 정확한 구분 |
| --- | --- |
| "`approve`를 했으니 토큰이 맡겨졌다" | 아니다. approve는 한도 설정이고, 실제 이동은 `stake` 내부의 `transferFrom`에서 일어난다. |
| "`allowance`가 충분하면 staking은 무조건 된다" | allowance뿐 아니라 사용자 balance, gas, staking amount, 컨트랙트 require, reward pool도 봐야 한다. |
| "Sepolia ETH가 많으면 ERC20도 많다" | Sepolia ETH는 gas용 native token이고, ERC20 잔액은 별도 컨트랙트 상태다. |
| "Faucet 실패와 staking 실패는 같다" | Faucet은 토큰/ETH 수령 문제이고, staking은 approve, balance, reward, lock, require 조건 문제다. |
| "`claimReward`가 실패했으니 staking이 안 된 것이다" | staking은 됐지만 시간이 짧거나 reward pool이 비어 있을 수 있다. `pendingReward`와 컨트랙트 잔액을 본다. |
| "`nonce too low`는 컨트랙트 버그다" | 지갑의 트랜잭션 순서 문제다. pending 트랜잭션, 계정 nonce, MetaMask 활동 기록을 확인한다. |
| "`insufficient funds`는 토큰 부족이다" | 보통 gas로 쓸 native ETH 부족이다. ERC20 잔액 부족과 분리한다. |

<details>
<summary>더 깊게 보기: reward accounting을 단순화할 때 생기는 위험</summary>

교육용 화면은 HNL 단위와 초 단위로 계산하지만 실제 컨트랙트는 `uint256` raw unit, decimals, rounding, reward reserve를 함께 다룬다. 그래서 HTML 결과는 개념 확인용이며, 실제 배포 전에는 `parseUnits`, `formatUnits`, `_updateReward`, `totalStaked`, reward pool 산식을 코드와 테스트로 확인해야 한다.

</details>

오류 분류표는 다음 순서로 사용한다.

| 분류 | 대표 증상 | 확인 항목 |
| --- | --- | --- |
| 컴파일 오류 | Remix에서 `ParserError`, import 실패, 타입 오류 | Solidity 버전, OpenZeppelin 버전, 파일명, 생성자 문법 |
| Faucet 수령 오류 | Sepolia ETH나 HNL을 못 받음 | Faucet 일일 제한, 로그인, Faucet 잔량, cooldown, 네트워크 |
| 트랜잭션 실행 오류 | MetaMask 승인 후 failed, `insufficient funds`, `nonce too low` | Sepolia ETH, gas limit, pending tx, nonce, 네트워크 선택 |
| staking 오류 | `transferFrom failed`, `nothing to claim`, `reward transfer failed` | balance, allowance, reward pool, lock/time, amount, require 조건 |

Staking 진단은 다음처럼 더 좁힌다.

| 조건 | 확인 방법 | 실패 시 조치 |
| --- | --- | --- |
| 사용자 토큰 balance | `balanceOf(user)` | Faucet 또는 transfer로 토큰 확보 |
| approve/allowance | `allowance(user, stakingAddress)` | ERC20에서 `approve(stakingAddress, amount)` 재실행 |
| staking amount | 입력값과 decimals 확인 | 18 decimals 기준 wei 단위 변환 확인 |
| reward pool | 구현별 reward reserve, 또는 같은 ERC20로 원금과 보상을 함께 보관한다면 `balanceOf(stakingAddress) - totalStaked` 같은 배포 가능 잔액 | 보상 지급용 토큰을 Staking 컨트랙트에 충전 |
| lock/time | `pendingReward`, last update, unlock 조건 | 충분히 대기하거나 Fast 버전으로 Remix VM 검증 |
| gas/nonce | MetaMask와 explorer 확인 | pending tx 정리, gas용 Sepolia ETH 확보 |
| require 조건 | revert 메시지와 코드 매칭 | 메시지가 가리키는 조건을 직접 확인 |

정상 작동 검토 기준은 다음 순서로 둔다. 이 순서가 깨지면 기능을 추가하기 전에 설명, 버튼 배치, 결과 문구를 먼저 고친다.

1. `approve(stakingAddress, amount)` 후 사용자 `balanceOf(user)`는 줄지 않고 `allowance(user, stakingAddress)`만 증가한다.
2. `allowance` 조회는 owner가 사용자 주소, spender가 Staking 컨트랙트 주소임을 보여준다.
3. `stake(amount)` 성공 후 사용자 balance와 allowance는 줄고, staked amount는 증가한다.
4. 시간이 지나도 storage가 매초 자동으로 쓰이는 것이 아니라, `pendingReward` 조회 또는 claim/withdraw 시점에 lazy update 계산을 해석한다.
5. `pendingReward > 0`이고 reward pool이 충분하면 `claimReward()`가 보상을 지급하고 staked amount는 유지된다.
6. `withdraw`는 원금 회수 단계이며, lock/time 조건과 보상 선청구 여부를 분리해 안내한다.
7. reset은 사용자 balance, allowance, staked amount, pending reward, lastUpdate, 판별기 선택값을 모두 초기 학습 상태로 되돌린다.
8. 오류 판별기는 선택한 단계와 대표 메시지가 맞지 않으면 "단계/메시지 불일치"를 먼저 보여줘야 한다.

## HTML 시뮬레이터 설계

짝이 되는 HTML 확장판은 "ERC20 권한과 staking 에러 판별기"를 구현하며, 다음 설계를 기준으로 검토한다.

- 화면 1: ERC20 권한 모델
  - 입력값: 사용자 balance, staking 컨트랙트 주소, approve 수량, stake 수량.
  - 버튼: `approve`, `allowance 조회`, `stake`, 초기화.
  - 시각화: approve 후에도 balance가 줄지 않고 allowance만 증가한다. stake 후에 balance와 allowance가 줄고 staking amount가 증가한다.
- 화면 2: 보상 증가 시뮬레이터
  - 입력값: staked amount, rewardRatePerSecond, 경과 시간, reward pool 잔액.
  - 버튼: 시간 증가, `pendingReward`, `claimReward`, `unstake`.
  - 시각화: lazy update로 `pendingReward`가 계산되고, claim 시 accrued가 0으로 돌아가며 사용자 balance가 증가한다.
- 화면 3: 오류 원인 판별
  - 에러 카드: `transferFrom failed`, `reward transfer failed`, `nothing to claim`, `insufficient funds`, `nonce too low`, `execution reverted`.
  - 사용자가 balance/allowance/reward pool/lock/nonce/gas/require 중 원인을 고르면 피드백한다.
- 화면 4: Week6 실습 연결
  - Remix VM 모드와 Sepolia 모드를 토글한다.
  - Remix VM에서는 gas/nonce/explorer 변수를 단순화하고, Sepolia에서는 MetaMask, Sepolia ETH, Etherscan tx hash를 추가로 보여준다.

시각화 핵심은 "`approve`는 허가, `transferFrom`은 실제 이동"과 "staking 실패는 토큰 잔액, 승인 한도, 보상 금고, 시간 조건, 지갑 트랜잭션 조건을 따로 봐야 한다"이다.

시뮬레이터 타당성 기준:

- approve와 stake를 한 버튼처럼 묶지 않는다. approve 성공만으로 토큰이 이동했다는 인상을 주면 부적합하다.
- allowance 조회는 stake 전후로 남은 한도가 바뀌는 증거를 보여줘야 한다.
- reward 계산은 `pendingReward -> claimReward -> withdraw` 순서로 실습하게 하되, claim과 withdraw의 역할을 섞지 않는다.
- 이 자료의 기본 시뮬레이터는 teaching mode로 `claimReward`를 먼저 눌러 보상과 원금 회수를 분리한다. 실제 컨트랙트는 withdraw가 보상을 자동 정산하거나 원금만 회수하도록 구현될 수 있으므로 구현별 문서와 코드를 확인하게 한다.
- `insufficient funds`, `nonce too low`, `transferFrom failed`, `nothing to claim`, `reward transfer failed`, `withdraw locked`는 서로 다른 원인으로 분류되어야 한다.
- Remix VM 모드와 Sepolia 모드는 같은 성공 기준으로 설명하지 않는다. Sepolia에서는 gas, nonce, tx hash, explorer 증거가 추가된다.

## 체크리스트

- [ ] Sepolia ETH와 ERC20 토큰 잔액을 구분했다.
- [ ] ERC20 `approve`가 즉시 송금이 아니라 allowance 기록임을 설명할 수 있다.
- [ ] `allowance(owner, spender)`에서 owner는 사용자, spender는 Staking 컨트랙트 주소임을 확인했다.
- [ ] `stake(amount)` 전에 `approve(stakingAddress, amount)`를 실행했다.
- [ ] `transferFrom failed`를 보면 사용자 balance와 allowance를 먼저 확인했다.
- [ ] `claimReward` 전에 `pendingReward(user) > 0`인지 확인했다.
- [ ] `reward transfer failed`를 보면 Staking 컨트랙트의 reward pool 잔액을 확인했다.
- [ ] `insufficient funds`는 gas용 Sepolia ETH 부족인지 먼저 봤다.
- [ ] `nonce too low`는 컨트랙트 로직이 아니라 계정 트랜잭션 순서 문제로 분리했다.
- [ ] Remix VM 성공과 Sepolia 성공을 같은 것으로 취급하지 않고, Sepolia에서는 Etherscan tx hash와 event log를 확인했다.

## 참고한 기존 자료

- `이론보강/START_HERE.md`
- `이론보강/00_HARNESS_CONTRACT.md`
- `이론보강/01_SOURCE_MANIFEST.md`
- `이론보강/03_EXISTING_HTML_REVIEW.md`
- `이론보강/tasks/agent-md-week5-6.md`
- `week/week6/01_Faucet_수령_가이드.md`
- `week/week6/02_ERC20_배포_복습.md`
- `week/week6/03_Staking_컨트랙트_작성.md`
- `week/week6/04_Remix_VM_테스트.md`
- `week/week6/05_Sepolia_배포_검증.md`
- `week/week6/30_DApp.html`
- `week/week6/erc20-app/erc20-tutorial.html`
- `week/week6/erc20-app/src/components/token/ApproveForm.tsx`
- `week/week6/erc20-app/src/components/token/AllowanceChecker.tsx`
- `week/week6/erc20-app/src/constants/tutorial-steps.ts`
- `실습/04.21 강의자료.pdf`
- `피드백/survey_priority_summary.md`
