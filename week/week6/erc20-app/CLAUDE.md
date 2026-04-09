# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## 프로젝트 개요

대학교 블록체인 수업용 **ERC20 토큰 인터랙티브 튜토리얼** 웹 DApp. 두 가지 배포 형태 존재:
- **Next.js 앱** (`src/`): 개발/확장용, `npm run dev`로 실행
- **단일 HTML** (`erc20-tutorial.html`): 수업 배포용, 브라우저에서 직접 열기

## 명령어

```bash
npm run dev          # 개발 서버 (localhost:3000)
npm run build        # 프로덕션 빌드
npm run lint         # ESLint
npx tsc --noEmit     # 타입 체크
npx shadcn@latest add <component>  # shadcn/ui 컴포넌트 추가
```

## 아키텍처

### Next.js 앱 (App Router, Next.js 16)

```
src/
├── app/              # 7개 라우트 (/, /tutorial, /deploy-guide, /token-interact, /faucet, /dashboard, /quiz)
├── components/
│   ├── web3/         # Web3Provider, ConnectWallet, NetworkStatus, AddTokenButton
│   ├── layout/       # Navbar
│   ├── tutorial/     # StepCard, CodeBlock, ProgressTracker
│   ├── token/        # TransferForm, ApproveForm, AllowanceChecker, TokenInfoCard
│   ├── faucet/       # FaucetClaim, FaucetStatus
│   ├── dashboard/    # TransferChart, HolderPieChart, TransactionTable, TokenStatsCard
│   └── ui/           # shadcn/ui (base-nova 스타일, @base-ui/react 기반)
├── hooks/            # useTokenContract, useFaucetContract, useTokenEvents
├── lib/              # wagmi-config (Sepolia), contracts (ABI + localStorage)
├── constants/        # tutorial-steps, quiz-data
└── types/            # TokenInfo, TransferEvent, FaucetStatus 등
contracts/            # Solidity (MyToken.sol, MyTokenMintable.sol, TokenFaucet.sol)
```

### 데이터 흐름

- 모든 컨트랙트 주소는 **localStorage** (`erc20-tutorial-contracts` 키, `{token, faucet}` JSON)로 관리
- Web3 상태: wagmi Provider → useAccount/useChainId → 각 컴포넌트
- 토큰 읽기/쓰기: `useTokenContract.ts`의 useTokenRead, useTokenWrite 훅 경유
- 이벤트 조회: `useTokenEvents.ts` → 200블록 배치 분할, 최대 500이벤트

### 단일 HTML (`erc20-tutorial.html`)

전역 모듈 구조: `Web3Engine` (ethers.js v6 CDN) → `Dashboard` (Chart.js) → `InteractUI` / `FaucetUI` / `QuizUI`

조립 원본은 `sections/` 디렉토리에 분리 보관.

## 핵심 규칙

- **네트워크**: Sepolia 테스트넷 전용 (chainId: 11155111)
- **shadcn/ui**: `base-nova` 스타일, `@base-ui/react` 기반 — `asChild` 없음, `ProgressValue` children은 함수 시그니처
- **Web3 컴포넌트**: 반드시 `"use client"` 지시자 필요 (브라우저 API/훅 사용)
- **ABI**: `src/lib/contracts.ts`에 ERC20_ABI, FAUCET_ABI 정의 — 직접 wagmi 호출하지 말고 훅 사용
- **localStorage 파싱**: try/catch + 스키마 검증 필수 (손상 데이터 방어)
- **한국어**: 모든 UI 텍스트, 코드 주석, 에러 메시지

## Gotchas

- **단일 HTML 조립 시 ID 충돌**: `sections/` 파일을 합칠 때 동일 ID가 중복되면 `getElementById`가 잘못된 요소를 반환함. 내부 패널은 `panel-*` 접두사로 네임스페이스 구분 필요
- **콜백 시그니처 통일**: `Web3Engine.onConnectionChanged`는 반드시 `getState()` 반환 형태의 state 객체 `{connected, address, network, chainId}`를 전달해야 함. 개별 인자(boolean, string) 방식 사용 금지
- **이벤트 조회 배치**: `getTransferEvents()`는 200블록 단위로 분할 조회. 단일 쿼리 시 RPC rate limit으로 실패함
- **bigint 연산**: 대시보드 통계/보유자 분포는 `parseFloat` 대신 `BigInt`로 계산. 부동소수점 누적 오차 방지
