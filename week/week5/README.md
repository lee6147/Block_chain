# Week 5 — Solidity & Remix IDE Lab

Solidity 기초 문법과 Remix IDE 기반 스마트 컨트랙트 실습을 위한 5주차 자료입니다. `HelloWorld`, `HelloNumber`, `Counter`, `CheckNumber`, `Faucet` 예제를 통해 컨트랙트 구조, 상태 변수, 함수, 가시성, `view`/`pure`, `constructor`, `revert`, `mapping`, `event`, `modifier`, `receive()`를 단계적으로 학습합니다.

이 폴더의 핵심 산출물은 브라우저에서 실행하는 **Solidity Lab Simulator**와 각 Lab의 개념 설명 문서입니다. 실제 블록체인 배포보다는 Remix/EVM 동작 원리를 교육용으로 시각화하는 데 초점이 있습니다.

## 학습 목표

- Solidity 파일의 기본 구조(`SPDX`, `pragma`, `contract`)를 이해한다.
- 상태 변수, 함수, 매개변수, 반환값, `string memory`, `int`/`uint` 차이를 설명한다.
- `view`, `pure`, 상태 변경 함수의 차이와 가스비 관점을 구분한다.
- `constructor`, `revert`, `require`, 함수 가시성의 역할을 이해한다.
- Faucet 컨트랙트를 통해 `address payable`, `mapping`, `event`, `modifier`, `msg`, `block`, `receive()`를 종합적으로 학습한다.
- ABI가 프론트엔드 UI 구성에 어떻게 쓰이는지 개념적으로 이해하고, 현재 시뮬레이터의 한계도 함께 파악한다.

## 자료 구성

### 실행/학습 HTML

| 파일 | 용도 |
|---|---|
| [week5-lab.html](./week5-lab.html) | 5주차 메인 Solidity Lab Simulator. Lab 1~3을 브라우저에서 체험합니다. |
| [week5-presentation.html](./week5-presentation.html) | 5주차 수업 발표용 HTML 슬라이드입니다. |
| [week5-study.html](./week5-study.html) | Solidity 기초와 스마트 컨트랙트 개념을 정리한 학습 페이지입니다. |
| [week5-공부자료.html](./week5-%EA%B3%B5%EB%B6%80%EC%9E%90%EB%A3%8C.html) | 한국어 학습용 HTML 자료입니다. |

### Lab별 개념 문서

| 파일 | 내용 |
|---|---|
| [week5-concepts-lab1.md](./week5-concepts-lab1.md) | Lab 1: `HelloWorld`, `HelloNumber`, SPDX, pragma, 상태 변수, 함수, `int`, `string` |
| [week5-concepts-lab2.md](./week5-concepts-lab2.md) | Lab 2: `Counter`, `CheckNumber`, `constructor`, `uint`, `view`/`pure`, `revert`, 가스비 |
| [week5-concepts-lab3.md](./week5-concepts-lab3.md) | Lab 3: `Faucet`, `address payable`, `mapping`, `event`, `modifier`, `msg`, `block`, `receive()` |
| [week5-시연대본.md](./week5-%EC%8B%9C%EC%97%B0%EB%8C%80%EB%B3%B8.md) | 수업 중 Lab Simulator를 설명하기 위한 시연 대본입니다. |

### ABI/품질 검토 자료

| 파일 | 내용 |
|---|---|
| [blockchain_abi_analysis.md](./blockchain_abi_analysis.md) | `week5-lab.html`이 교수님 요구사항, 특히 표준 Ethereum ABI 활용 요구를 얼마나 충족하는지 분석한 리포트입니다. |
| [lab3_심사_최종보고서.md](./lab3_%EC%8B%AC%EC%82%AC_%EC%B5%9C%EC%A2%85%EB%B3%B4%EA%B3%A0%EC%84%9C.md) | Lab 3 Faucet 시뮬레이터 최종 심사 보고서입니다. |
| [lab3_심사_개념검증.md](./lab3_%EC%8B%AC%EC%82%AC_%EA%B0%9C%EB%85%90%EA%B2%80%EC%A6%9D.md) | Lab 3의 Solidity/EVM/보안 개념 정확성 검토입니다. |
| [lab3_심사_기능검증.md](./lab3_%EC%8B%AC%EC%82%AC_%EA%B8%B0%EB%8A%A5%EA%B2%80%EC%A6%9D.md) | Lab 3 기능 동작과 에지 케이스 검토입니다. |
| [lab3_심사_종합평가.md](./lab3_%EC%8B%AC%EC%82%AC_%EC%A2%85%ED%95%A9%ED%8F%89%EA%B0%80.md) | 코드 품질, UX, 교육 효과, 시각 완성도, 보안/안정성 평가입니다. |
| [lab3_심사_교차토론.md](./lab3_%EC%8B%AC%EC%82%AC_%EA%B5%90%EC%B0%A8%ED%86%A0%EB%A1%A0.md) | 여러 심사 관점의 합의/쟁점/우선순위 기록입니다. |

### 강의 원본 파일

| 파일 | 내용 |
|---|---|
| [LECTURE 4 Solidity and Remix IDE 1.pptx](./LECTURE%204%20%20Solidity%20and%20Remix%20IDE%201.pptx) | Solidity/Remix 강의 원본 슬라이드 1 |
| [LECTURE 5 Solidity and Remix IDE 2.pptx](./LECTURE%205%20Solidity%20and%20Remix%20IDE%202.pptx) | Solidity/Remix 강의 원본 슬라이드 2 |

## 권장 학습 순서

1. [week5-study.html](./week5-study.html) 또는 [week5-공부자료.html](./week5-%EA%B3%B5%EB%B6%80%EC%9E%90%EB%A3%8C.html)을 브라우저에서 열어 전체 개념을 훑습니다.
2. [week5-lab.html](./week5-lab.html)을 열고 Lab 1 → Lab 2 → Lab 3 순서로 실습합니다.
3. Lab 1을 진행하면서 [week5-concepts-lab1.md](./week5-concepts-lab1.md)를 읽습니다.
4. Lab 2를 진행하면서 [week5-concepts-lab2.md](./week5-concepts-lab2.md)를 읽습니다.
5. Lab 3 Faucet을 진행하면서 [week5-concepts-lab3.md](./week5-concepts-lab3.md)를 읽습니다.
6. 발표나 수업 운영이 필요하면 [week5-presentation.html](./week5-presentation.html)과 [week5-시연대본.md](./week5-%EC%8B%9C%EC%97%B0%EB%8C%80%EB%B3%B8.md)를 사용합니다.
7. ABI 요구사항을 검토해야 한다면 [blockchain_abi_analysis.md](./blockchain_abi_analysis.md)를 먼저 확인합니다.

## Lab 구성 요약

### Lab 1 — HelloWorld & HelloNumber

Solidity 파일의 가장 기본적인 형태를 다룹니다.

- `SPDX-License-Identifier`
- `pragma solidity`
- `contract` 선언
- 상태 변수와 자동 getter
- `public`, `private` 가시성
- `view`/`pure` 함수
- `int`, `string memory`

### Lab 2 — Counter & CheckNumber

컨트랙트 배포와 상태 변경 흐름을 다룹니다.

- `constructor`와 배포 시 초기화
- `uint`와 `int`의 차이
- 상태 변경 함수와 읽기 전용 함수의 가스비 차이
- `revert`, `require`, `assert`의 역할
- Remix 버튼 색상과 호출 유형
- 카운터 값 변경과 이벤트/가스 시각화

### Lab 3 — Faucet Simulator

앞선 개념을 종합해 테스트넷 Faucet 구조를 학습합니다.

- `address payable`과 ETH 전송
- `constant`, `ether`, `days` 단위
- `mapping(address => uint256)` 저장 구조
- `event`/`emit` 로그
- `modifier onlyOwner`
- `msg.sender`, `msg.value`, `block.timestamp`
- `receive()`와 직접 ETH 수신
- Faucet 보안 패턴과 CEI(Check-Effects-Interactions)

## 실행 방법

별도 설치 없이 HTML 파일을 브라우저에서 열어 학습할 수 있습니다.

```bash
cd week/week5
# macOS 예시
open week5-lab.html

# Linux/WSL 예시
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000/week5-lab.html 접속
```

> `week5-lab.html`은 교육용 시뮬레이터입니다. 실제 Sepolia 배포나 MetaMask 연결 실습은 이후 주차 자료, 특히 [Week 6](../week6/)의 ERC20/Staking 실습에서 이어집니다.

## ABI 관련 주의사항

이 폴더에는 ABI 개념을 설명하고 UI 자동 생성 흐름을 교육적으로 보여주는 자료가 포함되어 있습니다. 다만 [blockchain_abi_analysis.md](./blockchain_abi_analysis.md)에 정리된 것처럼, `week5-lab.html`은 표준 Ethereum ABI JSON을 실제로 파싱해 Faucet UI를 구성하는 완성형 DApp이라기보다는 **순수 JavaScript 기반 교육용 시뮬레이터**에 가깝습니다.

따라서 교수님/조교 검토나 과제 요구사항 답변에서는 다음처럼 구분해서 설명하는 것이 안전합니다.

- Lab 1/2: Solidity 소스를 분석해 ABI와 유사한 구조를 만들고 함수 UI를 동적으로 구성하는 교육용 흐름을 보여줌
- Lab 3: Faucet 동작을 시각적으로 이해하도록 하드코딩된 시뮬레이션 중심
- 표준 ABI JSON 기반 실제 DApp 구현은 추가 개선 과제로 분리 가능

## 다음 단계

Week 5에서 Solidity와 Remix의 기본 흐름을 익힌 뒤, [Week 6 — ERC20 담보 스테이킹 실습](../week6/)에서 ERC20 토큰, Faucet, Staking 컨트랙트 작성, Sepolia 배포와 Etherscan 검증까지 이어서 학습합니다.
