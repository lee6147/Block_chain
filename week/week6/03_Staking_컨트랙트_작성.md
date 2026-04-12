# 03. Staking 컨트랙트 작성

이번 과제의 핵심. `22_StakingContract_템플릿.sol`의 `// TODO` 네 군데를 직접 채운다.

## 설계 개요

사용자가 토큰을 예치(stake)하면 시간에 비례해 보상이 누적되고,
언제든 `claimReward`로 청구하거나 `unstake`로 원금을 빼면서 함께 청구할 수 있다.

### 상태

```solidity
struct UserInfo {
    uint256 amount;      // 현재 스테이킹된 토큰량
    uint256 lastUpdate;  // 마지막으로 accrued를 갱신한 block.timestamp
    uint256 accrued;     // 아직 청구하지 않은 누적 보상
}
mapping(address => UserInfo) public users;

uint256 public immutable rewardRatePerSecond; // 1e18 스케일
```

### 보상 수식 (중요)

시간 구간 Δt 동안, 스테이킹 수량이 `amount`일 때 추가되는 보상은:

```
Δaccrued = amount × rewardRatePerSecond × Δt / 1e18
```

스케일링에 `1e18`로 나누는 이유는 `rewardRatePerSecond`가 **"staked 1 토큰당 1초에 지급할 토큰량"**을
1e18 고정소수 단위로 표현했기 때문이다. 예:

- `rewardRatePerSecond = 1e15` → 1초당 0.001 토큰 (Fast)
- `rewardRatePerSecond = 1e18 / 86400 ≈ 11574074074074` → 하루 ≈ 1 토큰 (Daily)

### 게으른 갱신 패턴

모든 상태 변경 함수(`stake`, `unstake`, `claimReward`) 맨 앞에서 `_updateReward(msg.sender)`를 호출한다.
이 함수는 "직전까지 쌓였을 보상"을 `accrued`에 흡수시키고 `lastUpdate`를 현재 시각으로 옮긴다.
이렇게 하면 **각 사용자마다 timestamp만 저장**하면 되고, 전체 루프가 없어 가스 효율적이다.

## TODO 해설

### TODO(1) `_updateReward`

```solidity
function _updateReward(address user) internal {
    UserInfo storage u = users[user];
    if (u.amount > 0) {
        uint256 delta = block.timestamp - u.lastUpdate;
        u.accrued += (u.amount * rewardRatePerSecond * delta) / 1e18;
    }
    u.lastUpdate = block.timestamp;
}
```

- `u.amount == 0`이면 구간 보상은 0이다. 굳이 덧셈할 필요 없지만 `lastUpdate`는 **항상** 갱신해야
  다음 stake 때 기준시각이 맞다.
- `/ 1e18`은 마지막에. 중간에 나누면 반올림 손실.

### TODO(2) `stake`

CEI(Checks-Effects-Interactions) 순서.

```solidity
function stake(uint256 amount) external nonReentrant {
    require(amount > 0, "amount=0");
    _updateReward(msg.sender);          // Effects(1)

    users[msg.sender].amount += amount; // Effects(2)
    totalStaked += amount;              // Effects(3)
    require(
        token.transferFrom(msg.sender, address(this), amount),
        "transferFrom failed"
    );                                  // Interactions

    emit Staked(msg.sender, amount);
}
```

- `transferFrom` 호출 전에 `msg.sender`가 `token.approve(stakingAddress, amount)`를 **이미** 해둬야 한다.
- Effects를 먼저 쓰고 외부 호출을 나중에 하는 이유는 재진입 공격 방어.

### TODO(3) `claimReward`

```solidity
function claimReward() external nonReentrant {
    _updateReward(msg.sender);
    uint256 reward = users[msg.sender].accrued;
    require(reward > 0, "nothing to claim");
    users[msg.sender].accrued = 0;                        // Effects
    require(token.transfer(msg.sender, reward), "reward transfer failed"); // Interactions
    emit RewardPaid(msg.sender, reward);
}
```

- **Effects 먼저** (`accrued = 0`) 그다음 **transfer** — 재진입 방어의 표준 패턴.
- `nonReentrant` 도 같이 붙여 이중 안전.

### TODO(4) `pendingReward`

```solidity
function pendingReward(address user) external view returns (uint256) {
    UserInfo memory u = users[user];
    uint256 pending = u.accrued;
    if (u.amount > 0) {
        uint256 delta = block.timestamp - u.lastUpdate;
        pending += (u.amount * rewardRatePerSecond * delta) / 1e18;
    }
    return pending;
}
```

- view 함수이므로 상태를 바꾸면 안 된다. `memory` 복사본을 사용.
- DApp에서 이 값을 5초 주기로 폴링해 실시간 표시.

## 이벤트 설계

```solidity
event Staked(address indexed user, uint256 amount);
event Unstaked(address indexed user, uint256 amount);
event RewardPaid(address indexed user, uint256 amount);
```

- 조교가 Etherscan에서 **이벤트 로그**로 채점 근거를 확인한다. 이름과 시그니처를 바꾸지 말 것.

## 보안 체크리스트

- [x] `ReentrancyGuard` 상속 및 외부 상태변경 함수에 `nonReentrant`
- [x] CEI 순서 (Effects 먼저, Interactions 나중)
- [x] `transfer`/`transferFrom` 반환값을 `require`로 확인 (ERC20 호환성)
- [x] `block.timestamp` 사용은 초 단위 보상에 적절 (마이닝 가능한 수초 차이는 허용 오차)
- [x] 리워드 예치 부족 시 `transfer`가 실패하므로 배포 직후 owner가 리워드 토큰을 사전 transfer 해두어야 함
- [x] `rescueRewardReserve`는 스테이커 원금을 건드리지 않도록 `balance - totalStaked` 체크

## 완성본 참고

막히면 `23_StakingContract_Fast_완성.sol` 또는 `24_StakingContract_Daily_완성.sol`을 참고하라.
둘은 **로직이 완전히 동일**하고, `rewardRatePerSecond` 상수만 다르다.
"파라미터 하나로 경제 모델이 완전히 달라진다" 는 점을 실감해 보라.
