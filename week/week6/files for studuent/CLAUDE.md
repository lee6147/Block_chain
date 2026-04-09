# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

국민대학교 블록체인 랩 #6 과제 — **Sepolia ETH Faucet 시뮬레이터**. 브라우저 내 인메모리 블록체인으로 동작하는 교육용 DApp. 외부 API/지갑(MetaMask) 의존 없이 단일 HTML 파일로 완결.

## 아키텍처

`faucet.html` 단일 파일 (CSS + HTML + JS 통합, ~1660줄)

### JS 구조 (IIFE 캡슐화)

```
(function() {
  Wei 헬퍼 (toWei/toEth/toEthStr, WEI_PER_ETH=1e8)
  ├── BlockchainVM        — 계정, 블록, 타임스탬프, 트랜잭션 로그
  ├── FaucetContract      — Solidity Faucet 로직의 JS 구현 (wei 정수 연산)
  ├── 상태 변수            — vm, contract, wallets, activeWallet
  ├── DEFAULT_CODE        — 에디터에 표시되는 Solidity 코드 (한국어 주석 포함)
  ├── highlightSolidity() — 정규식 기반 구문 강조 (토큰 보호: \x00#{idx}#\x00)
  ├── 에디터              — overlay textarea/pre, Tab/Shift+Tab 다중 줄 들여쓰기
  ├── 지갑 관리            — createWallet, selectWallet, copyAddress
  ├── Faucet 상호작용      — claimETH, depositETH, withdrawAllETH
  ├── 쿨다운 타이머        — timeOffset 기반 통합 시간 모델
  ├── UI 헬퍼             — setStatValue(DOM API), showStatus(textContent)
  ├── 트랜잭션 로그        — DOM API로 테이블 렌더링 (innerHTML 미사용)
  ├── Chart.js            — CDN, typeof 가드로 오프라인 폴백
  ├── addEventListener    — 모든 이벤트 바인딩 (인라인 onclick 없음)
  └── bootstrapSimulator  — init/deploy 공통 로직
})();
```

### 시간 모델

`BlockchainVM.timeOffset`으로 실시간 + 오프셋 방식. `advanceTime()`이 오프셋을 누적하고, `currentTime` getter가 합산. `checkCooldown()`은 timestamp를 덮어쓰지 않음.

### Wei 연산

`WEI_PER_ETH = 1e8`. 모든 잔액/금액은 정수(wei)로 저장. `toFixed()` 없이 정수 덧셈/뺄셈만 사용. 표시 단계에서만 `toEthStr(wei)` 변환.

## 주의 사항

- **구문 강조기 토큰 플레이스홀더**: `\x00#{idx}#\x00` 형식 사용 필수. 숫자만 쓰면(`\x00{idx}\x00`) 숫자 하이라이팅 정규식과 충돌하여 문자열이 숫자로 표시되는 버그 발생.
- **innerHTML 사용 금지**: `highlightSolidity()` 출력(이스케이프 처리됨) 1곳만 예외. 나머지는 모두 `textContent` + DOM API.
- **CDN 의존**: Chart.js만 CDN 사용. 로드 실패 시 차트 섹션 숨김 처리됨.
- **대상 사용자**: 블록체인 비전공자/초보자. 모든 UI 텍스트와 Solidity 주석은 한국어.
