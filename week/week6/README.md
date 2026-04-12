# Week 6 — ERC20 담보 스테이킹 실습

> ⚠️ **중요**: Remix VM은 체인에 기록이 남지 않아 조교가 확인할 수 없다.
> 반드시 **Sepolia 테스트넷**에 배포한 컨트랙트 주소를 제출해야 채점된다.
> 매일 **Sepolia Faucet**에서 테스트 ETH를 미리 받아둘 것.

## 과제 개요

여러분이 만든 ERC20 토큰을 담보로 **스테이킹 컨트랙트**를 구현·배포한다.
사용자가 토큰을 예치하면 시간에 비례해 보상을 적립하고, 청구(`claimReward`) 또는 인출(`unstake`)할 수 있다.

## 실습 흐름

1. **Faucet 수령** — 조교가 배포한 Faucet에서 실습용 토큰(HNL)을 받는다 (ETH는 공용 Faucet).
2. **본인 ERC20 배포** — Week 5 복습. (선택: 조교 토큰만 사용해도 됨)
3. **StakingContract 작성** — `22_StakingContract_템플릿.sol`의 `// TODO` 네 군데를 채운다.
4. **Remix VM 테스트** — `23_StakingContract_Fast_완성.sol` (초당 0.001 토큰) 기준으로 로직 검증.
5. **Sepolia 배포** — `24_StakingContract_Daily_완성.sol` (하루 1 토큰 이자)을 배포하고 Etherscan에 소스 verify.
6. **제출** — `06_제출양식.md`를 채워 제출.

## 학생용 문서 (순서대로)

| 번호 | 파일 | 내용 |
|---|---|---|
| 01 | [01_Faucet_수령_가이드.md](./01_Faucet_수령_가이드.md) | MetaMask + ETH Faucet + HNL Faucet |
| 02 | [02_ERC20_배포_복습.md](./02_ERC20_배포_복습.md) | Week5 복습, ExampleToken 배포 |
| 03 | [03_Staking_컨트랙트_작성.md](./03_Staking_컨트랙트_작성.md) | 템플릿 TODO 해설·보상 수식 |
| 04 | [04_Remix_VM_테스트.md](./04_Remix_VM_테스트.md) | 로컬 VM에서 전체 플로우 검증 |
| 05 | [05_Sepolia_배포_검증.md](./05_Sepolia_배포_검증.md) | 배포·flatten·Etherscan Verify |
| 06 | [06_제출양식.md](./06_제출양식.md) | 최종 제출 양식 |

## 조교용 문서

| 번호 | 파일 | 내용 |
|---|---|---|
| 10 | [10_조교_배포_절차.md](./10_조교_배포_절차.md) | Faucet/HNL 선제 배포 순서 |
| 11 | [11_조교_검증_체크리스트.md](./11_조교_검증_체크리스트.md) | 학생 제출물 채점 기준 |

## 컨트랙트 파일 (Remix에 붙여넣기)

| 번호 | 파일 | 용도 |
|---|---|---|
| 20 | `20_ExampleToken.sol` | 예제 ERC20 (HNL 호환) |
| 21 | `21_Faucet.sol` | 조교 배포용 Faucet |
| 22 | `22_StakingContract_템플릿.sol` | 학생 과제 템플릿 (TODO 4곳) |
| 23 | `23_StakingContract_Fast_완성.sol` | Remix 데모용 (초당 0.001 토큰) |
| 24 | `24_StakingContract_Daily_완성.sol` | Sepolia 제출용 (하루 1 토큰) |

## 부속

| 번호 | 파일 | 용도 |
|---|---|---|
| 30 | `30_DApp.html` | MetaMask 연동 UI (선택) |

## 평가 기준

| 항목 | 비중 |
|---|---|
| `StakingContract` Sepolia 배포 및 소스 verify 완료 | 30% |
| `Staked` 이벤트 성공적 발생 (stake Tx 존재) | 25% |
| `RewardPaid` 이벤트 성공적 발생 (claimReward Tx 존재) | 25% |
| 제출 양식 완전 작성 (설명·소감 포함) | 20% |

## DApp 실행 (선택)

```bash
# 이 폴더에서
python -m http.server 8000
# 브라우저: http://localhost:8000/30_DApp.html
```

## 질문 / 막힘

- Remix에서 OpenZeppelin import가 안 되면 컴파일러 자동 resolver 확인.
- Sepolia 가스 부족 시 공용 Faucet 여러 개 번갈아 시도 (01번 문서 참고).
- 조교가 배포한 Faucet/HNL 주소는 **수업 공지**에서 확인.
