# Blockchain Lab #4 — Stablecoin-Specific Networks 완벽 가이드

> 국민대학교 | 김형중 교수님 | 2026.03.24

---

## 1. 왜 스테이블코인 "전용" 블록체인이 필요한가?

### 1.1 기존 방식의 문제점

이더리움에서 USDT 10달러를 보내려면:
1. USDT (보내고 싶은 돈) + **ETH** (가스비) 둘 다 보유해야 함
2. ETH 가격이 하루에도 10~20% 변동 → 가스비 예측 불가
3. NFT 민팅, DeFi 트레이딩 등 다른 트랜잭션과 경쟁 → 혼잡 시 가스비 폭등
4. 최종 확인(Finality)까지 수분~수십분 소요

### 1.2 스테이블코인 전용 네트워크의 해결책

| 문제 | 기존 (이더리움) | 전용 네트워크 |
|------|---------------|-------------|
| 가스비 지불 수단 | ETH (변동성 큼) | 스테이블코인 (안정적) |
| 수수료 예측 | 불가능 | 가능 ("약 10원 소요") |
| 네트워크 혼잡 | 모든 dApp과 경쟁 | 결제/송금에 최적화 |
| 최종성(Finality) | 수분~수십분 | 서브초~수초 |
| 사용자 경험 | ETH 별도 구매 필요 | 스테이블코인만 있으면 됨 |

> **비유**: 이더리움 = "트럭, 버스, 승용차가 모두 다니는 일반 고속도로"
> 스테이블코인 전용 네트워크 = "결제 차량만 달리는 전용 고속도로"

---

## 2. 핵심 개념 복습

### 2.1 스테이블코인(Stablecoin)이란?

법정화폐(달러, 원화 등)의 가치에 연동(페깅)되어 가격이 안정적인 암호화폐.

| 구분 | 토큰 예시 | 페깅 대상 | 의미 |
|------|---------|---------|------|
| USD-pegged | USDT, USDC | 미국 달러 | 1토큰 = 1달러 |
| KRW-pegged | BaseCoin, OKRW | 한국 원화 | 1토큰 = 1원 |
| EUR-pegged | EURC | 유로 | 1토큰 = 1유로 |

### 2.2 L1 vs L2 네트워크

| 구분 | L1 (Layer 1) | L2 (Layer 2) |
|------|-------------|-------------|
| 정의 | 독립적인 기본 블록체인 | L1 위에 구축된 확장 솔루션 |
| 보안 | 자체 합의 메커니즘으로 보안 | L1의 보안에 의존 |
| 독립성 | 완전 독립 운영 | L1 없이는 존재 불가 |
| 예시 | 이더리움, 비트코인, Plasma | Arbitrum, Base, Optimism |
| 비유 | 도시의 기본 도로망 | 기본 도로 위의 고가도로 |

### 2.3 Gas Fee와 Gas Token

- **Gas Fee**: 블록체인에서 트랜잭션 처리를 위해 검증자에게 지불하는 수수료
- **Gas Token**: 가스비 지불에 사용하는 토큰
  - 이더리움 → Gas Token = **ETH** (가격 변동 큼)
  - Plasma → Gas Token = **XPL** (제로 수수료)
  - StableNet → Gas Token = **BaseCoin** (1토큰 = 1원, 안정적) ← **핵심 혁신**

### 2.4 Rollup이란?

L2 확장 솔루션의 한 유형. 트랜잭션을 L2에서 처리하고, 결과만 L1에 기록하여 확장성을 높이는 기술.

| 유형 | Optimistic Rollup | ZK Rollup |
|------|-------------------|-----------|
| 검증 방식 | 사기 증명 (Fraud Proof) | 유효성 증명 (Validity Proof) |
| 기본 가정 | "트랜잭션이 유효하다고 낙관적으로 가정" | "수학적으로 유효성을 증명" |
| 챌린지 기간 | 약 7일 (이의제기 기간) | 없음 (즉시 검증) |
| 인출 시간 | 7일 대기 | 즉시~수분 |
| EVM 호환성 | 높음 | 점차 개선 중 |
| 대표 예시 | Arbitrum, Optimism, Base | Polygon zkEVM, StarkNet, zkSync |

---

## 3. L1 스테이블코인 전용 네트워크 (6종)

### 3.1 Plasma (Tether)

**한 줄 요약**: Tether가 만든 USDT 전용 L1, 제로 수수료, 비트코인 사이드체인

- **운영사**: Tether (세계 최대 스테이블코인 USDT 발행사)
- **상태**: Mainnet Beta (2025년 9월~)
- **합의 알고리즘**: PlasmaBFT (HotStuff 기반, 서브초 최종성)
- **실행 레이어**: Modified Reth (EVM 호환)
- **보안 앵커**: 비트코인 (이더리움이 아님!)

**핵심 포인트**:
1. USDT가 네이티브 자산 — 별도 브릿지 없이 기본 내장
2. **제로 수수료** 전송 — 프로토콜 레벨에서 가스를 스폰서
3. 비트코인 사이드체인 — 이더리움 롤업이 아닌 비트코인에 보안 의존

| Field | Mainnet | Testnet |
|-------|---------|---------|
| Chain ID | 9745 | 9746 |
| Currency | XPL | XPL |
| RPC | https://rpc.plasma.to | https://testnet-rpc.plasma.to |
| Explorer | https://plasmascan.to | https://testnet.plasmascan.to |

> **Plasma Testnet vs Sepolia**: Plasma Testnet(9746)은 Plasma 네트워크 자체 개발/테스트용. Sepolia(11155111)은 이더리움 생태계 테스트용. 용도가 다름!

---

### 3.2 Stable (Tether/Bitfinex)

**한 줄 요약**: Tether+Bitfinex 합작, USDT로 가스비 지불, $28M 투자 유치

- **운영사**: Tether + Bitfinex (암호화폐 거래소)
- **상태**: Mainnet (2025년 12월~)
- **핵심**: USDT 가스 모델 + 서브초 최종성 + Governance Token(STABLE)

| Field | Mainnet | Testnet |
|-------|---------|---------|
| Chain ID | 988 | 2201 |
| Gas Token | USDT | USDT0 |
| Governance | STABLE | STABLE |
| RPC | https://rpc.stable.xyz | https://rpc.testnet.stable.xyz |
| Explorer | https://stablescan.xyz | https://testnet.stablescan.xyz |
| WebSocket | — | wss://rpc.testnet.stable.xyz |

> **Plasma vs Stable**: 둘 다 Tether 관련이지만, Plasma는 "제로 수수료 + 비트코인 사이드체인", Stable은 "USDT 가스 모델 + 별도 거버넌스 토큰(STABLE)". 설계 철학이 다름!

---

### 3.3 Arc (Circle)

**한 줄 요약**: Circle(USDC 발행사)의 L1, USDC 네이티브 가스 + USDC↔EURC 환전 엔진 내장

- **운영사**: Circle (세계 2위 스테이블코인 USDC 발행사)
- **상태**: Testnet
- **핵심**: USDC 가스 + 내장 FX(외환) 엔진으로 달러↔유로 스테이블코인 즉시 환전

| Field | Testnet |
|-------|---------|
| Chain ID | 5042002 |
| Gas Token | USDC |
| RPC (HTTP) | https://rpc.testnet.arc.network |
| RPC (WebSocket) | wss://rpc.drpc.testnet.arc.network |
| Explorer | https://testnet.arcscan.app |

> **Arc의 차별점**: 다른 네트워크는 단일 스테이블코인에 집중하지만, Arc는 USDC↔EURC 간 **FX 엔진을 프로토콜에 내장**하여 국제 송금/환전에 강점.

---

### 3.4 Tempo (Stripe/Paradigm)

**한 줄 요약**: 결제 기업 Stripe + VC Paradigm이 만든 네트워크, 어떤 스테이블코인이든 가스비로 사용 가능

- **운영사**: Stripe (세계 최대 온라인 결제 기업) + Paradigm (크립토 VC)
- **상태**: Private Testnet
- **핵심**: **스테이블코인 불가지론적(agnostic)** — USDT든 USDC든 어떤 스테이블코인이든 가스비로 사용 가능

| Field | Testnet |
|-------|---------|
| Network Name | Tempo Testnet (Moderato) |
| Chain ID | 42431 |
| Gas Token | USD (stablecoin-based) |
| RPC (HTTP) | https://rpc.moderato.tempo.xyz |
| RPC (WebSocket) | wss://rpc.moderato.tempo.xyz |
| Explorer | https://explorer.tempo.xyz |

> **Tempo의 차별점**: 다른 네트워크는 특정 스테이블코인(USDT, USDC 등)에 종속되지만, Tempo는 **어떤 스테이블코인이든 수수료 토큰으로 허용**. 가장 유연한 설계.

---

### 3.5 Maroo (Hashed)

**한 줄 요약**: 한국 VC Hashed의 "주권 블록체인", 원화 스테이블코인(OKRW) 가스, 규제 준수 내장

- **운영사**: Hashed (한국 대표 크립토 VC)
- **상태**: Pre-launch Phase
- **핵심**: 규제 준수(AML/CFT)를 프로토콜 레벨에 내장한 한국 특화 L1

**Maroo의 핵심 개념들**:

1. **이중 경로 트랜잭션 모델 (Dual-Track)**:
   - **Open Path**: 스타트업/개발자용 — 허가 없이 자유롭게 실험 가능
   - **Regulated Path**: PCL(Programmable Compliance Layer)을 통한 사전 승인 — 신원 인증, 법적 관할 준수, 자산 유형 규칙, 거래 한도 적용

2. **OKRW**: KRW(한국 원화)에 페깅된 스테이블코인, 가스비로 사용

3. **프라이버시**: 영지식 증명(ZK Proof) 또는 게이트웨이 기반 접근 제어로 검증 가능한 프라이버시 제공 (PoC 검증 중)

4. **AI 에이전트 전용 계정**: KYA(Know Your Agent) 인증으로 자율 소프트웨어 에이전트도 컴플라이언스 하에 운영 가능

> **Maroo의 차별점**: 규제 준수를 "나중에 추가"가 아니라 **프로토콜 레벨에 내장**. 전통 금융기관(은행, 보험 등)이 블록체인을 도입할 때의 규제 장벽을 해결.

---

### 3.6 ⭐ StableNet (WeMade/위메이드)

**한 줄 요약**: 위메이드가 만든 KRW 스테이블코인(BaseCoin) 전용 L1, 프리론칭 단계

- **운영사**: WeMade (위메이드) — 한국 게임 기업, WEMIX 블록체인 운영
- **상태**: Pre-launch Phase (테스트넷 운영 중)
- **Gas Token**: BaseCoin (KRW-pegged stablecoin, 1 BaseCoin = 1원)

| Field | Testnet |
|-------|---------|
| Network Name | StableNet Testnet |
| Chain ID | 미공개 (Not yet publicly specified) |
| Gas Token | BaseCoin (KRW-pegged stablecoin) |
| Block Explorer | https://explorer.stablrnet.network |
| Faucet | faucet.stablenet.network |

**위메이드(WeMade)는 어떤 회사?**

1. 원래 한국 게임 회사 (대표작: 미르의 전설, 미르4)
2. 블록체인으로 사업 확장:
   - **WEMIX 1.0**: 클레이튼(Klaytn) 기반 사이드체인
   - **WEMIX 3.0**: 자체 L1 메인넷 (SPoA 합의, 40개 Node Council Partner)
   - WEMIX.Fi (DeFi), NILE (NFT), WEMIX Play (블록체인 게임)
   - **WEMIX$**: USDC 담보 기반 달러 페깅 스테이블코인

**WEMIX 3.0 vs StableNet 비교**

| 항목 | WEMIX 3.0 | StableNet |
|------|-----------|-----------|
| 목적 | 범용 dApp 플랫폼 (게임, DeFi, NFT) | 스테이블코인 결제/송금 전용 |
| Gas Token | WEMIX (가격 변동) | BaseCoin (1원 고정) |
| 합의 알고리즘 | SPoA (40 NCP) | 미공개 |
| EVM 호환 | 예 | 추정 예 |
| 주 타겟 | 게임 유저, DeFi 유저 | 결제/송금 사용자, 기업 |

**BaseCoin이 특별한 이유**:
- 대부분의 블록체인: 가스비 = 자체 토큰 (ETH, MATIC 등) → 가격 변동으로 수수료 예측 불가
- StableNet: 가스비 = BaseCoin (1원 고정) → "이 트랜잭션에 약 10원" 처럼 원화 단위 예측 가능
- 실생활 결제 서비스, 기업 도입에 매우 유리

---

## 4. 핵심 비교 분석

### 4.1 L1 전체 비교표

| 네트워크 | 운영사 | 페깅 통화 | Gas Token | 상태 | 차별점 |
|---------|-------|---------|-----------|------|-------|
| Plasma | Tether | USD | XPL (제로 수수료) | Mainnet Beta | BTC 사이드체인, 제로 수수료 |
| Stable | Tether/Bitfinex | USD | USDT | Mainnet | 거버넌스 토큰(STABLE) |
| Arc | Circle | USD/EUR | USDC | Testnet | FX 엔진 내장 (USDC↔EURC) |
| Tempo | Stripe/Paradigm | USD | 모든 스테이블코인 | Private Testnet | 스테이블코인 불가지론적 |
| Maroo | Hashed | KRW | OKRW | Pre-launch | 규제 준수 내장, 이중 경로 |
| **StableNet** | **WeMade** | **KRW** | **BaseCoin** | **Pre-launch** | **게임/콘텐츠 생태계 연동** |

### 4.2 패턴 분석

**패턴 1: 스테이블코인 발행사의 자체 네트워크 구축**
- Tether(USDT 발행) → Plasma, Stable 두 개나 구축
- Circle(USDC 발행) → Arc 구축
- 왜? → 자기 토큰이 네이티브인 전용 체인이 있으면 중개 수수료 없이 최적 성능 가능

**패턴 2: 전통 핀테크의 블록체인 진출**
- Stripe → Tempo 구축
- 왜? → 기존 결제 인프라를 블록체인으로 확장, 글로벌 즉시 정산

**패턴 3: 한국 기업의 KRW 페깅 네트워크**
- Hashed → Maroo (OKRW)
- WeMade → StableNet (BaseCoin)
- 왜? → 한국 시장에서 원화 기반 스테이블코인 결제 인프라 구축 경쟁

**패턴 4: L2는 이더리움 확장, L1은 독립 생태계**
- L2 (Base, Arbitrum 등)는 이더리움의 보안에 의존
- L1 (Plasma, StableNet 등)은 완전히 독립적인 생태계 구축

---

## 5. 핵심 정리 체크리스트

학습 후 다음 질문에 답할 수 있어야 합니다:

- [ ] 왜 스테이블코인 전용 블록체인이 필요한가?
- [ ] L1과 L2의 차이를 설명할 수 있는가?
- [ ] Optimistic Rollup과 ZK Rollup의 차이는?
- [ ] Plasma의 핵심 특징 3가지 (USDT 네이티브, 제로 수수료, BTC 사이드체인)
- [ ] StableNet의 운영사(WeMade)와 Gas Token(BaseCoin)은?
- [ ] BaseCoin이 특별한 이유 (KRW 페깅 → 수수료 원화 예측 가능)
- [ ] Maroo의 이중 경로 트랜잭션 모델(Open Path vs Regulated Path)이란?
- [ ] 왜 Tether, Circle, Stripe가 각각 자체 L1을 만들었는가?
- [ ] KRW-pegged 네트워크 2개(StableNet, Maroo)의 차이는?
- [ ] WEMIX 3.0과 StableNet의 차이는?
