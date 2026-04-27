# 기존 HTML 평가 및 커리큘럼 확정

읽은 파일 목록: `START_HERE.md`, `00_HARNESS_CONTRACT.md`, `01_SOURCE_MANIFEST.md`, `tasks/agent-audit-curriculum.md`, `피드백/survey_priority_summary.md`, `week/**`, `이론/**`, `실습/**`, 기존 HTML 파일들.

## 결론

기존 자료는 실습과 시뮬레이터가 이미 풍부하지만, 초심자 이론 보강용으로는 흐름을 다시 묶어야 한다. 특히 week1, week2, week6은 새 설명의 비중이 커야 하고, week3~5는 좋은 기존 자료를 축약 활용하는 편이 맞다.

## 기존 HTML 평가

| 파일 | 판정 | 근거 | 새 자료 처리 |
| --- | --- | --- | --- |
| `blockchain-interactive-guide.html` | 그대로 연결 | 블록체인 생성, P2P 전파, 해시, 합의, 위변조, 송금, 스마트 컨트랙트 시뮬레이션이 이미 풍부하다. | Week1에서 추천 자료로 연결하고 핵심만 재설명 |
| `week/week_1_Blockchain Lab Report/crypto-prices.html` | 보강 필요 | 가격 테이블 앱이며 블록체인 이론 설명은 거의 없다. | API/데이터 조회가 블록체인 학습의 출발점인 이유를 새로 설명 |
| `week/week_1_Blockchain Lab Report/presentation.html` | 보강 필요 | CoinGecko API, CORS, 코드 흐름 설명 중심이다. | 블록/해시/장부 개념과 연결 |
| `week/week_2-wallet-price-tracker/index.html` | 축약 활용 | MetaMask, 가격 추적, 블록 정보, 트랜잭션 조회, Sepolia 전송 기능이 있다. | 지갑/주소/서명/RPC/explorer 이론을 구조화 |
| `week/week_2-wallet-price-tracker/presentation.html` | 보강 필요 | 발표용 아키텍처 설명 중심이며 초심자 이론 흐름은 약하다. | 트랜잭션 라이프사이클 보조 자료로만 활용 |
| `week/week3-sepolia-lab/html/guide.html` | 축약 활용 | 기초 블록체인, 지갑, 단위, 트랜잭션, L2, nonce, gas, signature 설명과 인터랙션이 좋다. | Faucet/트랜잭션 오류 분리와 nonce/gas/signature를 재배치 |
| `week/week3-sepolia-lab/html/index.html` | 보강 필요 | 지갑 연결, 송금, 추적 등 실습 UI 성격이 강하다. | 실습 위치 설명용으로 활용 |
| `week/week4/stablecoin_networks.html` | 축약 활용 | stablecoin-specific network와 수수료 비교 시뮬레이션이 있다. | 일반 네트워크 vs 전용 네트워크 비교를 초심자용으로 재정리 |
| `week/week4/stablenet_explorer.html` | 보강 필요 | 탐색 가이드 성격이며 개념 설명과 인터랙션이 제한적이다. | StableNet 사례 보조 자료로 활용 |
| `week/week5/week5-study.html` | 축약 활용 | Solidity, Remix, 상태, gas, Counter, Faucet 시뮬레이션이 좋다. | require/revert, 상태 변경, Remix 버튼 의미를 초심자용으로 재정리 |
| `week/week5/week5-lab.html` | 그대로 연결 | Solidity Lab Simulator로 인터랙션이 매우 풍부하다. | 이론 HTML에서 실습 시뮬레이터로 연결 |
| `week/week6/30_DApp.html` | 신규 필요 | staking DApp 실행 화면이며 이론 설명 자료는 아니다. | 이론 보강 자료에서 DApp이 어떤 상태 흐름을 보여주는지 설명 |
| `week/week6/erc20-app/erc20-tutorial.html` | 축약 활용 | ERC20, 배포, 인터랙션, faucet, dashboard가 풍부하지만 양이 많다. | approve/allowance/transferFrom/staking/error 중심으로 재구성 |

## 설문 요구와 자료 대응

| 학생 요구 | 기존 자료 상태 | 보강 방향 |
| --- | --- | --- |
| 기초 개념 보강 | week3 guide와 루트 interactive guide에 흩어져 있음 | week1~3에 순서형 이론으로 재배치 |
| 진도와 단계별 체크리스트 | week6 일부 문서에 있으나 전 주차 공통 구조는 약함 | 각 MD 끝에 실습 전/중/오류 체크리스트 배치 |
| 환경 세팅과 오류 해결 | week3/week6에 분산 | Faucet 오류와 트랜잭션 오류를 분리한 표 제공 |
| 과제 후 예시/피드백 | 기존 자료에는 제한적 | 각 주차에 "자주 헷갈리는 지점"을 명시 |
| 스마트 컨트랙트/dApp 실습 확대 | week5/week6 자료가 강함 | 이론 설명에서 실습 화면과 코드 위치를 연결 |

## 주차별 커리큘럼 확정

| 주차 | 학습 목표 | 핵심 용어 | 시뮬레이터 목적 |
| --- | --- | --- | --- |
| Week1 | 블록체인이 왜 "공유 장부"인지, 해시가 왜 변경 탐지에 쓰이는지 설명한다. API 가격 조회 과제가 왜 데이터 신뢰와 연결되는지 이해한다. | 중앙화, 탈중앙화, 블록, 해시, 체인, 위변조 탐지, 공개 장부 | 블록 데이터 수정 → 해시 변경 → 다음 블록 연결 깨짐을 보여준다. |
| Week2 | 지갑이 돈통이 아니라 개인키 기반 서명 도구임을 설명한다. 트랜잭션이 지갑, RPC, 블록, explorer를 거쳐 확인되는 흐름을 이해한다. | EOA, 컨트랙트 주소, 개인키, 공개키, 주소, 서명, RPC, explorer, seed phrase | 송금 요청 → 서명 → RPC 전송 → 블록 포함 → explorer 확인 흐름을 단계별로 보여준다. |
| Week3 | 테스트넷 ETH 수령 문제와 트랜잭션 실행 문제를 구분한다. nonce, gas, signature가 실패 원인 분석에 어떻게 쓰이는지 이해한다. | Sepolia, GIWA, Faucet, nonce, gas limit, gas fee, pending transaction, signature, L1, L2 | 잔고/gas/nonce/pending 조건을 바꾸면 성공/실패 원인이 어떻게 바뀌는지 판별한다. |
| Week4 | 스테이블코인이 가격 안정 자산이라는 점과 스테이블코인 전용 네트워크가 UX/정산 구조를 바꾸려는 시도임을 구분한다. | stablecoin, 담보형, 알고리즘형, gas token, L1, L2, rollup, settlement | 일반 네트워크와 스테이블코인 전용 네트워크에서 수수료 예측성과 결제 경험을 비교한다. |
| Week5 | Solidity 코드가 컴파일, 배포, 함수 호출을 거쳐 상태를 바꾸는 흐름을 설명한다. require/revert가 조건 실패라는 점을 이해한다. | Solidity, Remix, contract, state variable, view, pure, constructor, require, revert, event, mapping | 함수 호출이 require를 통과/실패하고 상태와 이벤트가 어떻게 달라지는지 보여준다. |
| Week6 | ERC20 권한 모델과 staking 상태 흐름을 이해한다. approve, allowance, transferFrom, stake, claim, withdraw에서 발생하는 에러 원인을 분리한다. | ERC20, balanceOf, approve, allowance, transferFrom, staking, reward, reward pool, lock, execution reverted | approve → stake → reward 증가 → claim/withdraw 흐름과 대표 에러 원인 판별을 보여준다. |

## 재사용 자료 목록

- Week1: `blockchain-interactive-guide.html`
- Week2: `week/week_2-wallet-price-tracker/index.html`, `week/week_2-wallet-price-tracker/이더리움_트랜잭션_과정.md`
- Week3: `week/week3-sepolia-lab/html/guide.html`, `week/week3-sepolia-lab/concepts/02-중급-Nonce-Gas-Signature.md`
- Week4: `week/week4/stablecoin_networks.html`, `week/week4/week4_study_guide.md`
- Week5: `week/week5/week5-study.html`, `week/week5/week5-lab.html`, `week/week5/week5-concepts-lab*.md`
- Week6: `week/week6/erc20-app/erc20-tutorial.html`, `week/week6/03_Staking_컨트랙트_작성.md`, `week/week6/05_Sepolia_배포_검증.md`

## MD 작성 지시

모든 MD 작성자는 이 파일을 읽고 나서 자기 담당 task를 수행한다. 기존 자료를 복붙하지 말고, 초심자용 흐름으로 재구성한다. 각 MD에는 반드시 비유 설명, 정석 개념 설명, 실습 연결, 자주 헷갈리는 지점, HTML 시뮬레이터 설계, 체크리스트, 참고한 기존 자료가 들어가야 한다.
