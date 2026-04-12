# 05. Sepolia 배포 & Etherscan 검증

Remix VM에서 플로우가 통과했으면 이제 **Sepolia 테스트넷**에 배포하고 소스코드를 공개 검증한다.
조교는 Etherscan 상에서 이벤트 로그를 읽어 채점하므로, **verify가 안 되면 감점**이다.

## 사전 준비

- Sepolia ETH ≥ 0.05 (Faucet에서 수령)
- MetaMask가 **Sepolia** 선택되어 있음
- 제출용으로 **`24_StakingContract_Daily_완성.sol`** (하루 1 토큰 이자 버전) 사용

## Step 1 — Injected Provider로 배포

1. Remix → **Deploy & Run** 탭
2. Environment: **Injected Provider - MetaMask** → 지갑 주소·Sepolia 잔액 확인
3. Contract: `StakingContract`
4. 생성자 `token_`: 본인이 배포한 ERC20 주소 (또는 조교 HNL 주소)
5. **Deploy** → MetaMask 서명 → Tx confirm 대기.
6. 주소 복사 → 별도 메모장에 **STAKING_ADDRESS** 저장.

## Step 2 — 리워드 토큰 사전 충전

Sepolia에서도 리워드 지급을 위해 컨트랙트에 토큰이 있어야 한다.
본인 토큰이면 직접 `transfer`, HNL이면 Faucet으로 받은 뒤 전송.

```
ExampleToken.transfer(STAKING_ADDRESS, 10000000000000000000000)   // 10,000 토큰 예시
```

## Step 3 — approve → stake → claim

04번 문서의 Step 5~8을 Sepolia 버전으로 반복. 차이점:

- **Daily 상수** 기준 `pendingReward`는 하루 당 약 1 토큰.
- 바로 보상을 보고 싶으면 일단 1시간 뒤 `claimReward` → 약 `1/24 ≈ 0.041` 토큰.
- 수업 시연용이라면 시간을 길게 기다릴 수 없으므로 Fast 버전을 배포해 검증해도 된다
  (제출은 Daily 권장).

## Step 4 — Etherscan 소스 Verify (필수)

Remix는 OpenZeppelin import가 섞여 있어 Etherscan의 Single-file Verify에는
**flattened 파일이 필요**하다.

### Flatten

1. Remix 좌측 **Plugin Manager** → "Flattener" 또는 "Solidity Flattener" 활성화
   (기본 내장 플러그인으로 "Flatten" 우클릭 메뉴가 있다면 그걸 사용).
2. `24_StakingContract_Daily_완성.sol` 우클릭 → **Flatten** → `_flattened.sol` 생성.
3. 생성된 파일 상단의 중복 `SPDX-License-Identifier` 라인을 **하나만 남기고 삭제**
   (verify 실패 흔한 원인).

### Etherscan

1. `https://sepolia.etherscan.io/address/<STAKING_ADDRESS>` 방문
2. **Contract** 탭 → **Verify and Publish**
3. 입력:
   - Compiler Type: **Solidity (Single file)**
   - Compiler Version: Remix에서 쓴 것과 **정확히 동일**(예: `v0.8.24+commit.e11b9ed9`)
   - Open Source License: MIT
4. Next → 소스 붙여넣기, Optimizer: **Yes / 200**, EVM Version: default
5. Submit → 몇 초 뒤 ✅ "Verified" 뱃지

## Step 5 — 이벤트 로그 확인

Etherscan 컨트랙트 페이지 → **Events** 탭:

- `Staked(address,uint256)` — stake Tx로부터
- `RewardPaid(address,uint256)` — claim Tx로부터

이 두 이벤트가 각각 하나 이상 존재해야 통과.

## Step 6 — Tx 해시 수집

제출 양식에 기록해야 할 해시:

- `STAKE_TX_HASH` — `stake` 호출의 Tx 해시
- `CLAIM_TX_HASH` — `claimReward` 호출의 Tx 해시

각각 `https://sepolia.etherscan.io/tx/<hash>` 링크로 붙여넣기.

## 트러블슈팅

| 증상 | 해결 |
|---|---|
| Verify "Source code already verified" | 이미 누군가 같은 바이트코드를 verify함 — 그냥 진행 |
| Verify 컴파일러 mismatch | Remix 컴파일러 버전 전체 문자열 복사 |
| `ParserError` on verify | SPDX 라인 중복 / 주석 잘림 확인 |
| `reward transfer failed` on Sepolia | Step 2 리워드 사전 충전 누락 |
