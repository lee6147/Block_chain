# 04. Remix VM에서 로직 검증

Sepolia 배포는 가스·시간이 들기 때문에, 먼저 **Remix VM**(로컬 가상 환경)에서 전체 플로우가
잘 돌아가는지 검증한다. 이 단계에서는 `23_StakingContract_Fast_완성.sol`(초당 0.001 토큰)
버전을 써서 **10~20초 안에** 보상이 적립되는 걸 눈으로 확인한다.

> ⚠️ Remix VM에서 일어난 일은 **체인에 남지 않는다**. 최종 제출은 Sepolia여야 함을 잊지 말 것.

## 사전 준비

Remix 좌측 파일 트리에 세 파일을 업로드(또는 붙여넣기):

- `20_ExampleToken.sol`
- `23_StakingContract_Fast_완성.sol` (학생 템플릿이 완성되었다면 본인 파일 사용 OK)

컴파일러: **0.8.24**, EVM: default, Optimizer: **On / 200**.

## 시나리오

### Step 1 — Environment를 Remix VM으로

**Deploy & Run** 탭 → Environment: **Remix VM (Shanghai 이상)**.
기본 계정에 100 ETH가 있다. 계정 드롭다운에서 2개 계정을 번갈아 쓸 수 있으니,
첫 계정을 "owner", 두 번째를 "user"로 사용해 보자.

### Step 2 — `ExampleToken` 배포

- Contract: `ExampleToken`
- 생성자: `"MyStakeCoin","MSC", 1000000000000000000000000` (= 1,000,000 × 1e18)
- **Deploy**

### Step 3 — `StakingContract` 배포

- Contract: `StakingContract` (Fast 버전)
- 생성자 `token_`: 방금 배포한 ExampleToken 주소 (Remix의 **copy address** 아이콘 사용)
- **Deploy**

### Step 4 — 리워드 토큰을 스테이킹 컨트랙트에 사전 충전

학생들이 가장 많이 빠뜨리는 단계다. 스테이킹 컨트랙트가 **보상을 지급할 수 있으려면**
자기 주소로 토큰을 이미 보유하고 있어야 한다.

`ExampleToken`의 `transfer` 호출:
- `to`: StakingContract 주소
- `amount`: `100000000000000000000000` (= 100,000 × 1e18)

### Step 5 — `approve`

스테이킹 전 `approve`가 반드시 선행되어야 한다.
`ExampleToken.approve`:
- `spender`: StakingContract 주소
- `amount`: `1000000000000000000000` (= 1,000 × 1e18, 넉넉히)

### Step 6 — `stake(100 * 1e18)`

`StakingContract.stake`:
- `amount`: `100000000000000000000` (= 100 토큰)
- 실행 후 Remix **terminal** 에서 로그 확장 → `Staked(user, 100e18)` 이벤트 확인.

### Step 7 — 15초 대기 후 `pendingReward(user)` 조회

Fast 버전 기준: 100 토큰 × 0.001 × 15초 = **약 1.5 토큰** (1500000000000000000).

`pendingReward(user)`의 반환값이 0이 아니면 성공.

### Step 8 — `claimReward()`

호출 후 터미널에서 `RewardPaid(user, ≈1.5e18)` 이벤트 확인.
`ExampleToken.balanceOf(user)`로 잔액 증가 확인.

### Step 9 — `unstake(100 * 1e18)`

원금 회수. `Unstaked` 이벤트 + `balanceOf(user)`가 원래대로 복귀.

## 체크리스트

- [ ] `Staked` 이벤트 수신됨
- [ ] 15초 대기 후 `pendingReward > 0`
- [ ] `claimReward` 후 `RewardPaid` 이벤트 수신됨
- [ ] `balanceOf(user)` 증가
- [ ] `unstake` 후 원금 복귀

모두 통과하면 [05번 문서](./05_Sepolia_배포_검증.md)로 진행.

## 흔한 오류

| 증상 | 원인 | 해결 |
|---|---|---|
| `transferFrom failed` | approve 누락 / 금액 부족 | Step 5 다시 |
| `reward transfer failed` | 스테이킹 컨트랙트에 토큰 잔액 부족 | Step 4 다시 |
| `pendingReward` 가 항상 0 | `_updateReward` 미구현 | TODO(1) 다시 |
| `nothing to claim` | 시간이 너무 짧거나 amount=0 | 10초 이상 대기 |
