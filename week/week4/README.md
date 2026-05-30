# Week 4 — Stablecoin-Specific Networks

스테이블코인 전용 네트워크가 왜 필요한지, 기존 범용 블록체인과 무엇이 다른지 비교하며 학습하는 4주차 자료입니다. 핵심 주제는 **가스비 예측 가능성**, **스테이블코인 기반 결제/송금 UX**, **L1/L2 구조**, 그리고 **StableNet 같은 한국형 스테이블코인 네트워크 사례**입니다.

## 학습 목표

- 스테이블코인 전용 블록체인이 등장한 배경을 설명한다.
- ETH 같은 변동성 토큰으로 가스비를 내는 구조의 UX 한계를 이해한다.
- L1, L2, Rollup, Gas Token 개념을 스테이블코인 네트워크 관점에서 정리한다.
- Plasma, Stable, Arc, Tempo, Maroo, StableNet의 설계 차이를 비교한다.
- StableNet의 BaseCoin 가스 모델이 결제/송금 서비스에 주는 장점을 설명한다.

## 핵심 질문

1. USDT/USDC를 보내는데 왜 ETH 같은 별도 가스 토큰이 필요한가?
2. 가스비가 스테이블코인으로 고정되면 사용자 경험은 어떻게 달라지는가?
3. 결제/송금 전용 네트워크는 범용 dApp 네트워크와 어떤 점에서 다른가?
4. L1 스테이블코인 네트워크와 L2 Rollup 기반 확장 솔루션은 어떻게 구분되는가?
5. 원화 기반 StableNet/BaseCoin 모델은 국내 결제 서비스에 어떤 의미가 있는가?

## 자료 구성

| 파일 | 용도 |
|---|---|
| [week4_study_guide.md](./week4_study_guide.md) | 4주차 메인 학습 가이드. 스테이블코인 전용 네트워크의 필요성과 주요 사례를 정리합니다. |
| [stablecoin_networks.html](./stablecoin_networks.html) | 브라우저에서 볼 수 있는 Stablecoin-Specific Networks 학습 페이지입니다. |
| [stablenet_explorer.html](./stablenet_explorer.html) | StableNet 탐색과 BaseCoin 가스 모델을 설명하는 HTML 학습 자료입니다. |
| [Blockchain Lab #4.pdf](./Blockchain%20Lab%20%234.pdf) | 4주차 강의 PDF 자료입니다. |

## 권장 학습 순서

1. [week4_study_guide.md](./week4_study_guide.md)의 1~2장을 읽고 스테이블코인 전용 네트워크의 문제의식을 정리합니다.
2. L1/L2, Gas Fee, Gas Token, Rollup 개념을 표 중심으로 복습합니다.
3. Plasma, Stable, Arc, Tempo, Maroo, StableNet의 비교표를 읽고 각 네트워크의 차별점을 메모합니다.
4. [stablecoin_networks.html](./stablecoin_networks.html)을 브라우저에서 열어 시각 자료로 전체 흐름을 복습합니다.
5. [stablenet_explorer.html](./stablenet_explorer.html)을 열어 StableNet과 BaseCoin 사례를 따로 확인합니다.
6. 수업 발표나 과제 준비 시 [Blockchain Lab #4.pdf](./Blockchain%20Lab%20%234.pdf)를 참고합니다.

## 주요 개념 요약

### 스테이블코인 전용 네트워크가 필요한 이유

일반적인 이더리움 기반 전송에서는 USDT/USDC를 보내더라도 가스비로 ETH를 준비해야 합니다. 이 구조는 초보 사용자에게 복잡하고, ETH 가격 변동 때문에 실제 송금 비용을 예측하기 어렵습니다. 스테이블코인 전용 네트워크는 결제와 송금에 초점을 맞춰 가스비 예측 가능성과 사용자 경험을 개선하려는 접근입니다.

### Gas Token 설계 비교

| 네트워크 유형 | 가스 토큰 | 특징 |
|---|---|---|
| 이더리움 | ETH | 범용 dApp 네트워크, 가스비 변동성이 큼 |
| 일부 스테이블코인 네트워크 | USDT/USDC 등 | 사용자가 보유한 스테이블코인으로 수수료를 지불하는 모델 |
| StableNet | BaseCoin | 원화 페깅 스테이블코인 기반의 수수료 예측 가능성 강조 |
| 제로 수수료 모델 | 프로토콜 또는 스폰서 부담 | 사용자가 직접 가스비를 체감하지 않도록 설계 |

### 수업에서 비교하는 네트워크

- **Plasma** — USDT 중심, 제로 수수료 모델과 비트코인 보안 앵커를 강조하는 사례
- **Stable** — USDT 가스 모델과 거버넌스 토큰 구조를 가진 사례
- **Arc** — Circle의 USDC 중심 네트워크와 FX 엔진 사례
- **Tempo** — Stripe/Paradigm의 스테이블코인 불가지론적 결제 네트워크 사례
- **Maroo** — 한국 규제 환경과 원화 스테이블코인 활용 가능성을 다루는 사례
- **StableNet** — BaseCoin을 가스 토큰으로 사용하는 KRW 기반 결제/송금 특화 네트워크 사례

## 실습/토론 아이디어

- “USDC를 보내려면 ETH가 필요하다”는 UX가 왜 신규 사용자에게 어려운지 설명하기
- ETH 가스 모델과 스테이블코인 가스 모델을 결제 서비스 관점에서 비교하기
- StableNet처럼 원화 단위로 가스비를 예측할 수 있을 때 가능한 서비스 시나리오 작성하기
- 범용 L1, L2 Rollup, 스테이블코인 전용 L1의 장단점을 표로 정리하기

## 다음 단계

Week 4에서 스테이블코인 네트워크와 가스 모델을 이해한 뒤, [Week 5](../week5/)에서는 Solidity, Remix, ABI, Faucet을 사용해 스마트 컨트랙트 작성과 배포 흐름을 학습합니다.
