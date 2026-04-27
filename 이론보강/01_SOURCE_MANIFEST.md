# 소스 매니페스트

이 문서는 이론보강 작업에서 읽고 참고해야 할 기존 자료 목록과 기존 HTML 평가 기준을 고정한다.

## 필수 확인 자료

| 구분 | 경로 | 용도 |
| --- | --- | --- |
| Week1 | `week/week_1_Blockchain Lab Report` | API/가격 조회 과제와 블록체인 기초 연결점 확인 |
| Week2 | `week/week_2-wallet-price-tracker` | 지갑, MetaMask, RPC, 트랜잭션 흐름 확인 |
| Week3 | `week/week3-sepolia-lab` | 테스트넷, Faucet, nonce, gas, signature, L1/L2 확인 |
| Week4 | `week/week4` | 스테이블코인 전용 네트워크와 L1/L2 비교 확인 |
| Week5 | `week/week5` | Solidity, Remix, Faucet 컨트랙트, 시뮬레이터 확인 |
| Week6 | `week/week6` | ERC20, Faucet, staking, Sepolia 배포, DApp 확인 |
| 이론 PDF | `이론` | 블록체인 정석 개념, 암호학, 지갑, 합의, mining, privacy 참고 |
| 실습 PDF | `실습` | 실제 수업 흐름과 주차별 실습 목표 확인 |
| 설문 요약 | `피드백/survey_priority_summary.md` | 학생들이 부족하다고 느낀 이론과 개선 요청 반영 |

## 기존 HTML 평가 기준

| 판정 | 의미 | 처리 |
| --- | --- | --- |
| 그대로 연결 | 이미 초심자 이론과 시뮬레이션이 충분함 | 새 HTML에서 추천 자료로 링크 |
| 축약 활용 | 내용은 좋지만 양이 많거나 산만함 | 핵심만 새 MD/HTML에 재구성 |
| 보강 필요 | 실습/발표 중심이라 이론 설명이 부족함 | 새 보강 HTML에서 빈칸 보완 |
| 신규 필요 | 해당 주차의 핵심 이론을 설명하는 자료가 부족함 | 새 MD/HTML을 우선 제작 |

## 기존 HTML 1차 판정

| 파일 | 1차 판정 | 이유 |
| --- | --- | --- |
| `blockchain-interactive-guide.html` | 그대로 연결 | 블록체인, 해시, 합의, 위변조, P2P 송금, 스마트 컨트랙트 시뮬레이션이 이미 풍부함 |
| `week/week_1_Blockchain Lab Report/presentation.html` | 보강 필요 | API 과제 코드 설명 중심이라 블록체인 이론 보강에는 약함 |
| `week/week_2-wallet-price-tracker/index.html` | 축약 활용 | 지갑/가격/트랜잭션 기능은 좋지만 이론 흐름이 산만할 수 있음 |
| `week/week_2-wallet-price-tracker/presentation.html` | 보강 필요 | 발표 자료 중심이며 초심자 이론 교재로는 부족함 |
| `week/week3-sepolia-lab/html/guide.html` | 축약 활용 | 테스트넷, nonce, gas, signature, L1/L2 설명이 좋지만 분량이 커서 핵심 재배치 필요 |
| `week/week3-sepolia-lab/html/index.html` | 보강 필요 | 실습 앱/가이드 성격이 강함 |
| `week/week4/stablecoin_networks.html` | 축약 활용 | 스테이블코인 전용 네트워크 설명과 비교 시뮬레이션이 있음 |
| `week/week4/stablenet_explorer.html` | 보강 필요 | 탐색 가이드 성격이며 개념 보강은 제한적 |
| `week/week5/week5-study.html` | 축약 활용 | Solidity, Remix, Faucet 시뮬레이션이 좋음 |
| `week/week5/week5-lab.html` | 그대로 연결 | 실습 시뮬레이터로 강함. 이론 본문보다는 연결 자료로 적합 |
| `week/week6/30_DApp.html` | 신규 필요 | 실행용 DApp이지 이론 설명 자료가 아님 |
| `week/week6/erc20-app/erc20-tutorial.html` | 축약 활용 | ERC20 설명과 앱 흐름이 풍부하지만 초심자용 재정리가 필요 |

## 주차별 핵심 공백

| 주차 | 보강 우선순위 |
| --- | --- |
| Week1 | 블록체인 기초와 API/데이터 조회 과제의 연결 |
| Week2 | 지갑은 돈통이 아니라 서명 도구라는 개념, 주소/키/RPC/explorer |
| Week3 | Faucet 문제와 트랜잭션 실행 문제 분리, nonce/gas/signature |
| Week4 | 스테이블코인 네트워크가 왜 필요한지, 일반 네트워크와 무엇이 다른지 |
| Week5 | require/revert, 상태 변경, Faucet 컨트랙트 실행 조건 |
| Week6 | approve/allowance/transferFrom, staking 상태 흐름, 대표 에러 원인 |
