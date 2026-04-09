# ERC20 교육용 웹 DApp 실행 계획

**프로젝트**: ERC20 Tutorial DApp
**경로**: `C:\Users\user\Desktop\Stable_coin\erc20-tutorial`
**날짜**: 2026-04-09
**목적**: 대학교 블록체인 수업 (week7) ERC20 토큰 발행 실습용 인터랙티브 튜토리얼 + 실습 도구 웹사이트

---

## 1. 컨텍스트

### 배경
- 교수님(김형중) 요구: ERC20 토큰 발행 -> 메타마스크 등록 -> 자체 퍼셋 제작 -> 토큰 거래 그래프 시각화
- 학생 수준: 블록체인 비전공 초보자, Remix IDE 사용, 메타마스크 연결에서 어려움 겪음
- 이전 수업: week5~6에서 Faucet.sol 실습 완료 (단일 HTML 시뮬레이터 형태)
- 이번 수업: ERC20 토큰 발행이 핵심, AI 활용하되 원리 설명 필수

### 기술 스택
- **프론트엔드**: Next.js 15 (App Router) + TypeScript + React 19
- **스타일링**: Tailwind CSS + shadcn/ui
- **Web3**: viem + wagmi (최신 생태계, 타입 안전성)
- **차트**: recharts (React 친화적, shadcn/ui 호환)
- **스마트 컨트랙트**: Solidity 0.8.x (Remix IDE용 소스 제공)
- **네트워크**: Sepolia Testnet

---

## 2. 작업 목표 (Work Objectives)

1. 학생들이 ERC20 토큰의 원리를 단계별로 학습할 수 있는 인터랙티브 튜토리얼 제공
2. Remix IDE에서 ERC20 컨트랙트를 배포하고 메타마스크에 토큰을 등록하는 과정을 가이드
3. 배포된 토큰으로 전송/조회/승인 등 실습을 웹에서 직접 수행
4. 토큰 거래 내역을 그래프로 시각화 (과제 4번 요구사항)
5. 자체 토큰 퍼셋 기능 구현 (교수님 요구사항)

---

## 3. 가드레일 (Guardrails)

### Must Have
- 전체 UI/주석/가이드 한국어
- 단계별 진행 (초보자 친화)
- Remix IDE 연동 가이드 (스크린샷 수준의 상세한 설명)
- 메타마스크 연결 + 토큰 등록 가이드
- 토큰 거래 그래프 시각화
- 모든 코드 블록에 한국어 주석
- 반응형 디자인
- 에러 핸들링 (지갑 미연결, 네트워크 불일치, 잔액 부족 등)

### Must NOT Have
- 실제 메인넷 배포 (Sepolia 전용)
- 복잡한 DeFi 기능 (스왑, 유동성 풀 등 -- 범위 초과)
- 서버 사이드 DB (클라이언트 + 온체인 데이터만)
- any 타입 사용

---

## 4. 프로젝트 구조

```
erc20-tutorial/
├── public/
│   └── images/               # Remix IDE 스크린샷, 메타마스크 가이드 이미지
├── contracts/                 # Solidity 소스 (Remix IDE 복사용)
│   ├── MyToken.sol           # 기본 ERC20 토큰
│   ├── MyTokenMintable.sol   # 민팅 기능 추가 버전
│   └── TokenFaucet.sol       # 토큰 퍼셋 컨트랙트
├── src/
│   ├── app/
│   │   ├── layout.tsx        # 루트 레이아웃 (Web3Provider, 네비게이션)
│   │   ├── page.tsx          # 랜딩/홈 페이지
│   │   ├── tutorial/
│   │   │   └── page.tsx      # Step-by-step ERC20 튜토리얼
│   │   ├── deploy-guide/
│   │   │   └── page.tsx      # Remix IDE 배포 가이드
│   │   ├── token-interact/
│   │   │   └── page.tsx      # 토큰 상호작용 (전송, 승인, 조회)
│   │   ├── faucet/
│   │   │   └── page.tsx      # 토큰 퍼셋 페이지
│   │   ├── dashboard/
│   │   │   └── page.tsx      # 거래 내역 + 그래프 시각화
│   │   └── quiz/
│   │       └── page.tsx      # 개념 확인 퀴즈
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx            # 상단 네비게이션
│   │   │   ├── Sidebar.tsx           # 튜토리얼 진행 사이드바
│   │   │   └── Footer.tsx            # 하단 푸터
│   │   ├── web3/
│   │   │   ├── ConnectWallet.tsx     # 지갑 연결 버튼 (wagmi)
│   │   │   ├── NetworkStatus.tsx     # 네트워크 상태 표시 (Sepolia 확인)
│   │   │   ├── TokenBalance.tsx      # 토큰 잔액 표시
│   │   │   └── AddTokenButton.tsx    # 메타마스크에 토큰 추가 버튼
│   │   ├── tutorial/
│   │   │   ├── StepCard.tsx          # 튜토리얼 단계 카드
│   │   │   ├── CodeBlock.tsx         # Solidity 코드 블록 (구문 강조 + 복사)
│   │   │   ├── ConceptExplainer.tsx  # 개념 설명 (비유 + 정석 토글)
│   │   │   └── ProgressTracker.tsx   # 진행률 추적
│   │   ├── token/
│   │   │   ├── TransferForm.tsx      # 토큰 전송 폼
│   │   │   ├── ApproveForm.tsx       # 토큰 승인 폼
│   │   │   ├── AllowanceChecker.tsx  # 허용량 조회
│   │   │   └── TokenInfoCard.tsx     # 토큰 기본 정보 (name, symbol, decimals, totalSupply)
│   │   ├── faucet/
│   │   │   ├── FaucetClaim.tsx       # 퍼셋 토큰 클레임
│   │   │   └── FaucetStatus.tsx      # 퍼셋 상태 (잔여량, 쿨다운)
│   │   ├── dashboard/
│   │   │   ├── TransactionTable.tsx  # 거래 내역 테이블
│   │   │   ├── TransferChart.tsx     # 전송량 시계열 차트
│   │   │   ├── HolderPieChart.tsx    # 보유자 분포 파이 차트
│   │   │   └── TokenStatsCard.tsx    # 토큰 통계 카드
│   │   └── ui/                       # shadcn/ui 컴포넌트
│   ├── hooks/
│   │   ├── useTokenContract.ts       # ERC20 컨트랙트 인터랙션 훅
│   │   ├── useFaucetContract.ts      # 퍼셋 컨트랙트 훅
│   │   ├── useTokenEvents.ts         # Transfer 이벤트 리스닝 훅
│   │   └── useTransactionHistory.ts  # 거래 내역 조회 훅
│   ├── lib/
│   │   ├── wagmi-config.ts           # wagmi 설정 (Sepolia chain)
│   │   ├── contracts.ts              # ABI + 컨트랙트 주소 관리
│   │   └── utils.ts                  # 유틸리티 함수
│   ├── types/
│   │   └── index.ts                  # 공통 타입 정의
│   └── constants/
│       ├── tutorial-steps.ts         # 튜토리얼 단계 데이터
│       └── quiz-data.ts              # 퀴즈 문제 데이터
├── .env.example                      # 환경변수 예시
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 5. 페이지 구성 및 역할

### 5.1 홈 페이지 (`/`)
- **역할**: 랜딩 페이지, 전체 학습 로드맵 제시
- **내용**: 수업 개요, 4단계 학습 경로 안내 (학습 -> 배포 -> 실습 -> 분석), 메타마스크/Sepolia 사전 준비 체크리스트
- **핵심 컴포넌트**: 학습 로드맵 카드, 사전 준비 체크리스트

### 5.2 튜토리얼 페이지 (`/tutorial`)
- **역할**: ERC20 표준의 원리를 단계별로 학습
- **내용**:
  - Step 1: ERC20이란? (토큰 표준의 필요성, 비유: 화폐의 규격)
  - Step 2: 핵심 함수 6개 설명 (totalSupply, balanceOf, transfer, approve, allowance, transferFrom)
  - Step 3: 이벤트 (Transfer, Approval)
  - Step 4: 전체 코드 라인별 해설
  - Step 5: 확장 기능 (mint, burn, pause)
- **핵심 컴포넌트**: StepCard, CodeBlock, ConceptExplainer, ProgressTracker

### 5.3 배포 가이드 페이지 (`/deploy-guide`)
- **역할**: Remix IDE에서 ERC20 배포 + 메타마스크 토큰 등록 가이드
- **내용**:
  - Remix IDE 접속 및 설정
  - Solidity 코드 복사 및 붙여넣기
  - 컴파일러 설정 (0.8.x)
  - 메타마스크 연결 (Injected Provider)
  - Sepolia에 배포
  - 배포된 컨트랙트 주소 확인
  - 메타마스크에서 "토큰 가져오기"로 등록
  - 컨트랙트 주소 입력 폼 (이후 실습 페이지에서 사용)
- **핵심 컴포넌트**: CodeBlock (복사 버튼), 스크린샷 가이드, 컨트랙트 주소 입력/저장

### 5.4 토큰 상호작용 페이지 (`/token-interact`)
- **역할**: 배포된 ERC20 토큰과 직접 상호작용
- **내용**:
  - 토큰 기본 정보 조회 (name, symbol, decimals, totalSupply)
  - 잔액 조회
  - 토큰 전송 (transfer)
  - 승인 및 위임 전송 (approve + transferFrom)
  - 허용량 조회 (allowance)
- **핵심 컴포넌트**: TokenInfoCard, TransferForm, ApproveForm, AllowanceChecker, TokenBalance

### 5.5 토큰 퍼셋 페이지 (`/faucet`)
- **역할**: 자체 제작한 토큰 퍼셋에서 토큰 수령
- **내용**:
  - TokenFaucet 컨트랙트 설명
  - 퍼셋에서 토큰 클레임
  - 쿨다운 타이머
  - 퍼셋 잔여 토큰량 표시
  - 관리자(owner) 기능: 퍼셋에 토큰 충전
- **핵심 컴포넌트**: FaucetClaim, FaucetStatus, CodeBlock (TokenFaucet.sol 설명)

### 5.6 대시보드 페이지 (`/dashboard`) -- 과제 4번
- **역할**: 토큰 거래 내역 시각화
- **내용**:
  - Transfer 이벤트 기반 거래 내역 테이블
  - 시계열 전송량 차트 (line/bar chart)
  - 보유자 분포 파이 차트
  - 토큰 통계 (총 전송 횟수, 고유 주소 수, 최대 보유자 등)
- **핵심 컴포넌트**: TransactionTable, TransferChart, HolderPieChart, TokenStatsCard

### 5.7 퀴즈 페이지 (`/quiz`)
- **역할**: 학습 내용 확인 (교수님 요구: 원리 설명 가능해야 함)
- **내용**:
  - ERC20 핵심 개념 객관식/주관식 퀴즈
  - 코드 빈칸 채우기
  - 즉시 피드백 + 해설
- **핵심 컴포넌트**: 퀴즈 카드, 결과 표시

---

## 6. 핵심 기능 목록 (우선순위)

### P0 - 필수 (수업 당일까지 반드시 완성)
1. **ERC20 튜토리얼 콘텐츠** - 단계별 원리 설명 + 코드 해설
2. **Remix IDE 배포 가이드** - 스크린샷 수준의 상세 가이드
3. **메타마스크 토큰 등록** - 가이드 + `wallet_watchAsset` 원클릭 버튼
4. **토큰 상호작용** - transfer, balanceOf, approve, allowance, transferFrom
5. **거래 내역 그래프** - Transfer 이벤트 기반 차트 (과제 4번)
6. **지갑 연결** - wagmi 기반 메타마스크 연결 + Sepolia 네트워크 확인

### P1 - 중요 (수업 품질 향상)
7. **토큰 퍼셋** - TokenFaucet 컨트랙트 + 클레임 UI
8. **퀴즈** - 개념 확인 문제
9. **진행률 추적** - localStorage 기반 학습 진도

### P2 - 선택 (시간 여유 시)
10. **다크/라이트 모드** 토글
11. **Solidity 코드 에디터** (인라인 수정 체험)
12. **PDF 내보내기** (학습 자료 다운로드)

---

## 7. Solidity 컨트랙트 설계

### 7.1 MyToken.sol (기본 ERC20)
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    // 생성자: 토큰 이름, 심볼 설정 + 초기 발행량 민팅
    constructor(uint256 initialSupply) ERC20("My Token", "MTK") {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }
}
```

### 7.2 MyTokenMintable.sol (확장 버전)
- owner만 추가 민팅 가능
- burn 기능
- OpenZeppelin Ownable 사용

### 7.3 TokenFaucet.sol (토큰 퍼셋)
- ERC20 토큰 주소를 받아 일정량 배포
- 24시간 쿨다운
- owner가 토큰 충전 가능

---

## 8. 태스크 플로우 (Task Flow)

### Phase 1: 프로젝트 초기화 (순차)
**작업 1.1**: Next.js 프로젝트 셋업
- `create-next-app` + TypeScript + Tailwind + App Router
- shadcn/ui 초기화
- wagmi + viem + @tanstack/react-query 설치
- recharts 설치
- 환경변수 설정 (.env.example)

**수락 기준**:
- `npm run dev`로 로컬 서버 실행 확인
- shadcn/ui Button 컴포넌트 렌더링 확인
- wagmi provider 설정 완료 (Sepolia chain)

### Phase 2: 공통 인프라 (순차)
**작업 2.1**: 레이아웃 + 네비게이션 구현
- 루트 레이아웃에 Web3Provider(wagmi) 래핑
- Navbar (페이지 간 이동, 지갑 연결 버튼)
- Footer
- 반응형 모바일 메뉴

**작업 2.2**: Web3 공통 컴포넌트
- ConnectWallet (wagmi useConnect/useDisconnect)
- NetworkStatus (Sepolia 여부 확인, 자동 네트워크 전환 제안)
- TokenBalance (ERC20 balanceOf 호출)
- AddTokenButton (wallet_watchAsset API)
- ABI + 컨트랙트 주소 관리 모듈 (lib/contracts.ts)
- 커스텀 훅: useTokenContract, useTokenEvents

**수락 기준**:
- 메타마스크 연결/해제 동작 확인
- Sepolia 네트워크 감지 및 경고 표시
- 컨트랙트 주소 입력 시 토큰 정보(name, symbol) 자동 조회

### Phase 3: 핵심 페이지 (병렬 가능)

**작업 3.1**: 튜토리얼 페이지 (`/tutorial`) -- Agent A
- 5단계 학습 콘텐츠 작성
- StepCard, CodeBlock(prism.js 또는 커스텀 구문 강조), ConceptExplainer 구현
- 진행률 localStorage 저장
- 각 단계마다 "비유"(초보자용)와 "정석"(기술적 설명) 토글

**수락 기준**:
- 5개 단계 모두 렌더링, 코드 블록 구문 강조 동작
- 코드 복사 버튼 동작
- 진행률 페이지 새로고침 후에도 유지

**작업 3.2**: 배포 가이드 페이지 (`/deploy-guide`) -- Agent B
- Remix IDE 단계별 가이드 (텍스트 + placeholder 이미지 영역)
- Solidity 코드 블록 (복사 기능)
- 메타마스크 토큰 등록 가이드
- 배포된 컨트랙트 주소 입력 폼 (localStorage 저장, 다른 페이지에서 참조)

**수락 기준**:
- 배포 가이드 단계별 표시
- 컨트랙트 주소 입력 + 저장 동작
- AddTokenButton으로 메타마스크에 토큰 추가 동작

**작업 3.3**: 토큰 상호작용 페이지 (`/token-interact`) -- Agent C
- TokenInfoCard (name, symbol, decimals, totalSupply 읽기)
- TransferForm (to, amount 입력 -> transfer 트랜잭션)
- ApproveForm (spender, amount -> approve 트랜잭션)
- AllowanceChecker (owner, spender -> allowance 조회)
- 트랜잭션 상태 피드백 (pending, success, error)

**수락 기준**:
- 실제 Sepolia ERC20 컨트랙트와 상호작용 성공
- 트랜잭션 해시 링크 (Sepolia Etherscan)
- 에러 케이스 처리 (잔액 부족, 네트워크 오류)

**작업 3.4**: 대시보드 페이지 (`/dashboard`) -- Agent D
- Transfer 이벤트 로그 조회 (viem getLogs)
- TransactionTable (from, to, amount, txHash, timestamp)
- TransferChart (recharts Line/Bar chart - 시간별 전송량)
- HolderPieChart (recharts Pie chart - 보유자 분포)
- TokenStatsCard (총 전송 횟수, 고유 주소 수)

**수락 기준**:
- 온체인 Transfer 이벤트에서 데이터 조회 성공
- 최소 2종류 차트 렌더링 (시계열 + 분포)
- 빈 데이터 시 안내 메시지 표시

### Phase 4: 부가 기능 (순차, P1)

**작업 4.1**: 토큰 퍼셋 페이지 (`/faucet`)
- TokenFaucet.sol Solidity 코드 작성 (contracts/ 디렉토리)
- FaucetClaim 컴포넌트 (클레임 버튼 + 쿨다운 타이머)
- FaucetStatus (잔여 토큰, 다음 클레임 가능 시간)
- 퍼셋 컨트랙트 배포 가이드

**수락 기준**:
- 퍼셋 클레임 트랜잭션 성공
- 쿨다운 타이머 정상 표시
- 퍼셋 잔액 부족 시 안내 메시지

**작업 4.2**: 퀴즈 페이지 (`/quiz`)
- 10~15문제 객관식/빈칸 채우기
- 즉시 채점 + 해설 표시
- 결과 요약

**수락 기준**:
- 퀴즈 풀기 + 채점 동작
- 오답 시 해설 표시

### Phase 5: 마무리 (순차)

**작업 5.1**: 통합 테스트 + UI 폴리싱
- 전체 페이지 플로우 테스트 (홈 -> 튜토리얼 -> 배포 -> 상호작용 -> 대시보드)
- 반응형 레이아웃 확인 (모바일/태블릿/데스크톱)
- 에러 바운더리 설정
- 로딩 상태 UI

**작업 5.2**: Solidity 컨트랙트 최종 검수
- MyToken.sol, MyTokenMintable.sol, TokenFaucet.sol 주석 완성
- contracts/ 디렉토리에 Remix IDE용 최종 파일 배치

**수락 기준**:
- 전체 플로우 무결점 동작
- 모바일에서도 사용 가능
- 모든 Solidity 파일에 한국어 주석 완비

---

## 9. 팀(에이전트) 분배 전략

### /team 병렬 실행 구성

```
Phase 1~2 (순차): 단일 에이전트
  -> 프로젝트 초기화 + 공통 인프라는 반드시 먼저 완료

Phase 3 (병렬): 4개 에이전트 동시 실행
  Agent A: /tutorial 페이지 (콘텐츠 중심, Web3 의존 없음)
  Agent B: /deploy-guide 페이지 (콘텐츠 중심, Web3 의존 낮음)
  Agent C: /token-interact 페이지 (Web3 핵심, 훅 의존)
  Agent D: /dashboard 페이지 (차트 중심, 이벤트 훅 의존)

Phase 4 (병렬): 2개 에이전트
  Agent E: /faucet 페이지 + TokenFaucet.sol
  Agent F: /quiz 페이지

Phase 5 (순차): 단일 에이전트
  -> 통합 검수
```

### 분배 근거
- **Agent A, B**는 콘텐츠/가이드 중심이므로 Web3 훅 완성 전에도 작업 가능 (목데이터 사용 후 연결)
- **Agent C, D**는 Web3 훅을 직접 사용하므로 Phase 2의 공통 훅 완성 후 시작
- Phase 3의 4개 에이전트는 각각 독립된 페이지 디렉토리에서 작업하므로 파일 충돌 없음
- 각 에이전트에게 명확한 디렉토리 범위와 수락 기준을 전달

### 에이전트별 작업 범위

| 에이전트 | 담당 파일 경로 | 의존성 |
|---------|---------------|--------|
| Agent A | `src/app/tutorial/`, `src/components/tutorial/`, `src/constants/tutorial-steps.ts` | 없음 (콘텐츠) |
| Agent B | `src/app/deploy-guide/`, `contracts/*.sol` | 없음 (콘텐츠) |
| Agent C | `src/app/token-interact/`, `src/components/token/`, `src/hooks/useTokenContract.ts` | Phase 2 Web3 인프라 |
| Agent D | `src/app/dashboard/`, `src/components/dashboard/`, `src/hooks/useTokenEvents.ts`, `src/hooks/useTransactionHistory.ts` | Phase 2 Web3 인프라 |
| Agent E | `src/app/faucet/`, `src/components/faucet/`, `src/hooks/useFaucetContract.ts`, `contracts/TokenFaucet.sol` | Phase 2 Web3 인프라 |
| Agent F | `src/app/quiz/`, `src/constants/quiz-data.ts` | 없음 (콘텐츠) |

---

## 10. 리스크 및 주의사항

### 기술적 리스크
1. **Sepolia RPC 속도 제한**: 무료 RPC (Alchemy/Infura) 사용 시 rate limit에 걸릴 수 있음
   - 대응: 여러 RPC 엔드포인트 폴백 설정, 캐싱 적용
2. **메타마스크 팝업 차단**: 브라우저 팝업 차단으로 트랜잭션 서명 실패
   - 대응: 팝업 허용 안내 메시지 사전 표시
3. **wagmi/viem 버전 호환**: Next.js 15 + React 19와의 호환성 이슈 가능
   - 대응: 최신 wagmi v2 사용, @tanstack/react-query v5 호환 확인
4. **이벤트 로그 조회 한도**: Sepolia에서 대량 로그 조회 시 RPC 제한
   - 대응: 블록 범위 제한 (최근 10,000블록), 페이지네이션

### 교육적 리스크
5. **학생 사전 준비 미흡**: 메타마스크 미설치, Sepolia ETH 미보유
   - 대응: 홈 페이지 사전 체크리스트에서 단계별 확인 + 문제 해결 가이드
6. **Remix IDE 버전 차이**: Remix 업데이트로 UI가 달라질 수 있음
   - 대응: 핵심 동작 위주 가이드 (스크린샷 의존 최소화), 텍스트 설명 보강
7. **AI 의존도**: 학생들이 코드 원리를 이해하지 못하고 AI로만 진행
   - 대응: 퀴즈 페이지에서 개념 확인, 튜토리얼의 "왜?" 설명 강화

### 운영 리스크
8. **컨트랙트 주소 관리**: 각 학생이 서로 다른 주소에 배포하므로 동적 입력 필수
   - 대응: 컨트랙트 주소 입력 폼 + localStorage 저장
9. **수업 시간 내 완료**: 배포 + 실습 + 시각화까지 한 수업에 다 하기 빠듯할 수 있음
   - 대응: 사전 준비사항 안내 (메타마스크 설치, Sepolia ETH 확보), 과제 분할 고려

---

## 11. 성공 기준 (Success Criteria)

1. 학생이 홈 페이지에서 시작하여, 튜토리얼 -> 배포 -> 토큰 등록 -> 상호작용 -> 대시보드까지 끊김 없이 진행 가능
2. 모든 텍스트가 한국어이며, 코드 블록마다 한국어 주석이 있음
3. Remix IDE에서 ERC20 컨트랙트를 배포하고 메타마스크에 토큰이 등록됨
4. 토큰 전송 후 대시보드에서 거래 내역이 그래프로 시각화됨
5. 블록체인 비전공 학생이 30분 이내에 전체 과정을 완료할 수 있음
6. 모바일에서도 학습 가능 (반응형)

---

## 12. 예상 소요 시간

| Phase | 작업 | 예상 시간 | 비고 |
|-------|------|----------|------|
| 1 | 프로젝트 초기화 | 15분 | 자동화 가능 |
| 2 | 공통 인프라 | 30~40분 | Web3 Provider, 레이아웃 |
| 3 | 핵심 4페이지 (병렬) | 40~60분 | 4개 에이전트 병렬 시 |
| 4 | 부가 2페이지 (병렬) | 20~30분 | 2개 에이전트 병렬 시 |
| 5 | 통합 검수 | 20~30분 | QA + 폴리싱 |
| **합계** | | **약 2~3시간** | 병렬 실행 기준 |
