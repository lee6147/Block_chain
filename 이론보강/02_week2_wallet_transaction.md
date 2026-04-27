# Week 2. 지갑과 트랜잭션: 서명, RPC, 블록 포함, Explorer 확인

## 학습 목표

- 지갑을 "코인을 담는 통"이 아니라 개인키로 서명하는 도구로 설명할 수 있다.
- EOA 주소, 컨트랙트 주소, 개인키, 공개키, 주소, 시드 구문을 구분한다.
- 트랜잭션이 `작성 -> 서명 -> RPC 전송 -> 멤풀 대기 -> 블록 포함 -> explorer 확인` 순서로 처리되는 흐름을 이해한다.
- MetaMask 연결, Sepolia 네트워크 전환, ETH 전송, Etherscan 확인이 각각 트랜잭션 흐름의 어느 단계인지 연결한다.
- Faucet 수령 문제와 트랜잭션 실행 문제를 섞지 않고 구분하는 습관을 만든다.

## 비유로 먼저 이해하기

지갑은 돈이 들어 있는 상자라기보다, 내 도장이 보관된 전자 서명 도구에 가깝다. 은행 송금 신청서에 도장을 찍어야 거래가 유효해지는 것처럼, 블록체인에서는 개인키로 트랜잭션에 서명해야 네트워크가 "이 주소의 주인이 보낸 요청"이라고 인정한다.

주소는 계좌번호와 비슷하다. 다른 사람이 내 주소를 알아도 돈을 받을 수만 있지, 내 자산을 마음대로 움직일 수는 없다. 자산을 움직이려면 개인키가 만든 서명이 필요하다. 그래서 공개해도 되는 것은 주소이고, 절대 공개하면 안 되는 것은 개인키와 시드 구문이다.

RPC 노드는 우체국 접수 창구와 비슷하다. 사용자가 서명한 거래 봉투를 들고 직접 전 세계 검증자를 찾아다니지 않는다. Infura 같은 RPC 서비스에 서명된 트랜잭션을 제출하면, 그 노드가 이더리움 네트워크로 전파한다. 이후 트랜잭션은 멤풀이라는 대기열에 들어가고, 검증자가 블록에 포함하면 explorer에서 공식 기록으로 확인된다.

Etherscan은 택배 조회 페이지와 비슷하지만, 택배 회사 내부 기록보다 더 공개적인 블록체인 기록 조회 도구다. MetaMask 활동 탭은 내 지갑 앱이 정리해 보여주는 화면이고, Etherscan은 네트워크에 기록된 거래 해시, 블록 번호, 상태, 가스비까지 확인하는 탐색기다.

## 정석 개념 설명

이더리움 계정에는 크게 EOA와 컨트랙트 계정이 있다. EOA는 Externally Owned Account의 약자로 개인키가 제어하는 일반 지갑 주소다. MetaMask가 생성하는 계정이 여기에 해당한다. 컨트랙트 계정은 배포된 스마트 컨트랙트 코드가 제어하는 주소다.

지갑의 핵심은 키와 서명이다. 시드 구문은 여러 개인키를 복구할 수 있는 출발점이고, 개인키는 트랜잭션에 서명하는 비밀 값이다. 공개키는 개인키에서 계산되고, 주소는 공개키를 해시해 만든 식별자다. 사용자는 보통 주소만 복사해 사용하지만, 내부적으로는 개인키 기반 서명이 소유권을 증명한다.

| 개념 | 정석 설명 | 실습에서 보이는 위치 |
| --- | --- | --- |
| 시드 구문 | 지갑 복구에 쓰이는 12개 또는 24개 단어 | MetaMask 새 지갑 생성 과정 |
| 개인키 | 서명을 만드는 비밀 값 | 브라우저나 서버 코드에 노출하면 안 되는 값 |
| 공개키 | 개인키에서 계산되는 공개 가능한 키 | 주소 생성 과정의 중간 단계 |
| 주소 | 공개키에서 파생된 0x로 시작하는 식별자 | MetaMask 계정 주소, 받는 주소 입력 |
| EOA | 개인키가 제어하는 일반 계정 | MetaMask 계정 |
| 컨트랙트 주소 | 코드가 제어하는 계정 | Week5~6 스마트 컨트랙트 배포 후 생성 |
| Provider | 블록체인 읽기 연결 | `BrowserProvider`, `JsonRpcProvider` |
| Signer / Wallet | 서명 권한이 있는 객체 | MetaMask Signer, ethers.js Wallet |
| RPC | 노드에 원격 함수 호출을 보내는 통신 방식 | Infura JSON-RPC, `eth_blockNumber` |
| Explorer | 블록체인 기록 조회 서비스 | Etherscan, Sepolia Etherscan |

트랜잭션은 단순한 "송금 버튼 클릭"이 아니라 서명된 상태 변경 요청이다. 기본 흐름은 다음과 같다.

1. 사용자가 받는 주소와 금액을 입력한다.
2. 지갑 또는 서버 월렛이 트랜잭션 객체를 만든다.
3. 개인키로 트랜잭션에 디지털 서명을 한다.
4. 서명된 트랜잭션을 RPC 노드에 전송한다.
5. 노드가 P2P 네트워크로 브로드캐스트한다.
6. 트랜잭션이 멤풀에서 대기한다.
7. 검증자가 서명, 잔액, nonce, gas, chainId를 확인한다.
8. 블록에 포함되면 receipt가 만들어진다.
9. explorer에서 트랜잭션 해시로 상태를 확인한다.

서명이 중요한 이유는 개인키를 직접 네트워크로 보내지 않고도 소유권을 증명하기 위해서다. 전송되는 것은 트랜잭션 데이터와 서명값이지 개인키가 아니다. 이 서명은 "이 주소의 소유자가 이 요청을 승인했다"는 인증, "서명 후 데이터가 바뀌지 않았다"는 무결성, "나중에 부인하기 어렵다"는 부인 방지를 제공한다.

Sepolia는 실제 돈을 쓰지 않고 이더리움 프로토콜을 연습하는 테스트넷이다. Chain ID는 `11155111`이고, Sepolia Etherscan에서 거래를 확인한다. 테스트 ETH는 Faucet에서 받지만, Faucet 수령은 "테스트 자금 준비"이고 트랜잭션 실행은 "서명된 요청을 네트워크에 보내는 과정"이다. 둘을 분리해서 생각해야 오류 원인을 좁힐 수 있다.

## 개념 보강 블록

| 핵심 개념 | 비유 | 정석 정의 | 왜 중요한가 | 실습에서 어디에 보이나 | 자주 하는 오해 | 확인 질문 |
| --- | --- | --- | --- | --- | --- | --- |
| 지갑 | 돈통이 아니라 도장 보관함 | 개인키로 트랜잭션 서명을 만드는 도구 | 자산은 체인 상태에 있고 지갑은 이동 권한을 증명한다 | MetaMask 연결, 계정 주소, 서명 요청 | 지갑 앱 안에 코인이 저장된다 | 주소만 알아도 자산을 움직일 수 있는가? |
| 서명 | 송금 신청서에 찍는 도장 | 개인키로 트랜잭션 데이터에 만든 디지털 증명 | 개인키를 보내지 않고도 소유권과 승인 의사를 증명한다 | MetaMask 확인 버튼, 서버 Wallet 서명 | 서명할 때 개인키가 네트워크로 전송된다 | 네트워크에는 개인키와 서명값 중 무엇이 전송되는가? |
| RPC | 노드 접수 창구 | 앱이 노드에 상태 조회나 트랜잭션 제출을 요청하는 통신 방식 | 서명된 요청이 네트워크로 들어가는 입구다 | Infura, `/api/block-info`, `/api/send-eth` | RPC가 지갑이다 | Provider와 Signer는 각각 무엇을 담당하는가? |
| Explorer | 공개 택배 조회 | 블록, 트랜잭션, receipt, status를 조회하는 서비스 | MetaMask 표시만 믿지 않고 공식 기록을 확인한다 | Etherscan 링크, tx hash 조회 | tx hash가 있으면 무조건 성공이다 | 성공 판정은 tx hash와 receipt status 중 무엇까지 봐야 하는가? |

## 수업 실습과 연결

Week2 실습은 `week/week_2-wallet-price-tracker`의 MetaMask 지갑 연결 및 가격 추적 앱이다. `index.html`은 MetaMask 연결, 계정/네트워크 표시, Sepolia 전환 안내, 최신 블록 조회, 트랜잭션 해시 조회, Sepolia ETH 전송, Etherscan 링크 확인을 포함한다. `server.js`는 CoinGecko 가격 API, Infura JSON-RPC, ethers.js Provider/Wallet, `/api/send-eth`, `/api/tx`, `/api/block-info`, `/api/wallet-info`를 담당한다.

| 실습 화면 또는 코드 | 이론 연결 |
| --- | --- |
| MetaMask 설치와 새 지갑 생성 | 시드 구문, 개인키, 비수탁 지갑 책임 |
| 지갑 연결 버튼 | EIP-1193 `window.ethereum`, `eth_requestAccounts` 권한 요청 |
| 주소와 잔액 표시 | EOA 주소와 `eth_getBalance` 조회 |
| Sepolia 전환 버튼 | Chain ID `11155111`, 네트워크 구분 |
| 최신 블록 정보 | RPC 메서드 `eth_blockNumber`, `eth_getBlockByNumber` |
| 트랜잭션 조회 | 거래 해시로 transaction과 receipt 확인 |
| Sepolia ETH 전송 | 트랜잭션 객체 생성, 서명, RPC 전송, 블록 포함 대기 |
| Etherscan 링크 | explorer에서 블록체인 공식 기록 확인 |

`이더리움_트랜잭션_과정.md`는 트랜잭션 라이프사이클을 단계별로 설명한다. 특히 트랜잭션 객체의 `from`, `to`, `value`, `nonce`, `gasLimit`, `gasPrice`, `chainId`, 서명, 멤풀, 검증, 블록 포함, receipt를 Week2 본문과 직접 연결할 수 있다.

`코드_핵심_설명서.md`는 비유와 정석 설명을 함께 제공한다. `BrowserProvider`는 MetaMask를 감싸는 브라우저 지갑 연결이고, `JsonRpcProvider`는 서버가 Infura에 직접 연결하는 읽기 통로다. `Wallet`은 개인키와 Provider가 결합된 서명 가능 객체다. 수업에서는 "읽기만 하는 Provider"와 "서명까지 하는 Signer/Wallet"을 반드시 구분해야 한다.

`실습/03.24 강의자료.pdf`는 Wei/Gwei/ETH 단위, MetaMask의 비수탁 구조, 테스트넷, 시드 구문에서 키와 주소가 만들어지는 흐름을 다룬다. `실습/03.24 실습자료.pdf`는 MetaMask 설치, 주소 확인, 보내기/받기, 활동 탭, Etherscan 확인을 실제 화면 순서로 보여준다.

## 자주 헷갈리는 지점

| 헷갈리는 지점 | 바로잡기 |
| --- | --- |
| 지갑 안에 코인이 저장된다 | 코인은 지갑 파일 안에 들어 있지 않다. 블록체인 상태에 잔액이 기록되고, 지갑은 그 상태를 움직이는 서명 권한을 가진다. |
| 주소를 알면 자산을 가져갈 수 있다 | 주소는 공개 식별자다. 자산 이동에는 개인키 서명이 필요하다. |
| 시드 구문과 비밀번호가 같다 | 비밀번호는 내 기기에서 지갑 앱을 잠그는 값이고, 시드 구문은 지갑 복구의 출발점이다. 시드 구문 유출은 지갑 전체 유출이다. |
| MetaMask 활동 탭이 최종 진실이다 | 활동 탭은 지갑 앱의 표시다. 최종 확인은 explorer의 트랜잭션 해시, 블록 번호, status로 한다. |
| Faucet 실패와 전송 실패가 같다 | Faucet 실패는 테스트 ETH를 받지 못한 문제다. 전송 실패는 잔액, 서명, nonce, gas, 네트워크, 컨트랙트 조건 문제다. |
| RPC가 지갑이다 | RPC는 노드와 통신하는 창구다. 지갑은 서명 도구이고, RPC는 서명된 요청을 네트워크에 전달하거나 상태를 읽는다. |
| 트랜잭션 해시가 나오면 무조건 성공이다 | 해시는 제출 또는 생성된 거래의 식별자다. 블록 포함 후 receipt status가 성공인지 확인해야 한다. |
| Sepolia ETH는 실제 ETH와 같다 | 프로토콜 연습용 테스트 자산이다. 실제 금전 가치는 없지만 트랜잭션 구조는 메인넷과 유사하다. |

대표 오류도 분리해서 봐야 한다.

| 증상 | 먼저 볼 곳 | 가능한 원인 |
| --- | --- | --- |
| MetaMask가 감지되지 않음 | 브라우저 확장, 접속 프로토콜 | `file://`로 열었거나 확장이 비활성화됨 |
| Sepolia 전환 안내 | MetaMask 네트워크 | Mainnet 등 다른 네트워크 선택 |
| Faucet에서 ETH가 안 옴 | Faucet 페이지, 주소, Rate Limit | 주소 오입력, Faucet 한도, 로그인/캡차 조건 |
| 전송 버튼 후 실패 | 서버 응답, explorer, receipt | 잔액 부족, 잘못된 주소, nonce/pending, RPC 제한 |
| explorer에 거래가 없음 | 트랜잭션 해시, 네트워크 선택 | Mainnet/Sepolia를 잘못 검색했거나 전송 전 실패 |

## HTML 시뮬레이터 설계

Week2 HTML은 새 자료를 만들 때 다음 시뮬레이터를 포함해야 한다. 이 단계에서는 HTML을 만들지 않고 설계만 고정한다.

### 시뮬레이터 1: 트랜잭션 라이프사이클 단계 진행

- 목적: 사용자가 "서명하면 끝"이 아니라 블록 포함과 explorer 확인까지 봐야 함을 이해한다.
- 화면 구성:
  - 단계 카드 5개: `작성`, `서명`, `RPC 전송`, `블록 포함`, `Explorer 확인`.
  - 왼쪽에는 받는 주소와 금액 입력 예시, 오른쪽에는 현재 단계 로그를 둔다.
  - 하단에는 트랜잭션 해시, 블록 번호, status 영역을 둔다.
- 인터랙션:
  - "트랜잭션 작성" 버튼을 누르면 `to`, `value`, `chainId`가 채워진다.
  - "서명" 버튼을 누르면 개인키를 보여주지 않고 "서명값 생성" 상태만 표시한다.
  - "RPC 전송" 버튼을 누르면 멤풀 대기 상태와 임시 tx hash를 표시한다.
  - "블록 포함" 버튼을 누르면 blockNumber와 receipt status를 표시한다.
  - "Explorer 확인" 버튼을 누르면 Sepolia Etherscan 링크 예시와 확인 항목을 강조한다.
  - "초기화" 버튼으로 전체 단계를 처음 상태로 돌린다.
- 핵심 메시지:
  - 트랜잭션 성공 확인은 explorer와 receipt status까지 이어져야 한다.

### 시뮬레이터 2: 지갑, Provider, RPC 역할 구분

- 목적: MetaMask, BrowserProvider, JsonRpcProvider, Wallet/Signer의 역할을 시각적으로 분리한다.
- 화면 구성:
  - 브라우저 영역: `index.html`, `MetaMask`, `BrowserProvider`.
  - 서버 영역: `server.js`, `JsonRpcProvider`, `Wallet`.
  - 외부 영역: `Infura RPC`, `Ethereum/Sepolia Network`, `Etherscan`.
- 인터랙션:
  - "잔액 조회"를 누르면 Provider 경로만 강조한다.
  - "MetaMask 연결"을 누르면 사용자의 승인 팝업과 Signer 경로를 강조한다.
  - "서버 지갑 전송"을 누르면 서버 Wallet이 서명하고 Infura로 보내는 경로를 강조한다.
  - "개인키 노출" 토글을 켜면 위험 경고를 표시하고, 실제 실습 키는 테스트넷 전용이어야 한다고 설명한다.
- 핵심 메시지:
  - 읽기 연결과 서명 권한은 다르며, 개인키는 공개 데이터가 아니다.

### 시뮬레이터 3: Faucet 문제와 트랜잭션 문제 분리표

- 목적: 학생들이 오류를 "도구 고장"으로 뭉뚱그리지 않고 원인 범위를 좁히게 한다.
- 화면 구성:
  - 조건 토글: `테스트 ETH 있음`, `Sepolia 선택`, `주소 형식 정상`, `pending 없음`, `RPC 응답 정상`, `explorer 네트워크 일치`.
  - 결과 카드: `Faucet 준비 문제`, `트랜잭션 제출 문제`, `블록 포함 후 실패`, `조회 네트워크 문제`.
- 인터랙션:
  - 사용자가 조건을 바꾸면 "다음 확인 위치"가 자동으로 바뀐다.
  - 예: `테스트 ETH 없음`이면 Faucet/잔액 확인으로 안내한다.
  - 예: `Sepolia 선택 안 됨`이면 네트워크 전환으로 안내한다.
  - 예: `tx hash 있음 + explorer 네트워크 불일치`이면 Mainnet/Sepolia explorer를 바꿔 보라고 안내한다.
- 핵심 메시지:
  - 오류 해결은 지갑, 잔고, 네트워크, RPC, 블록 포함, explorer 중 어디가 문제인지 좁히는 과정이다.

## 체크리스트

- [ ] 지갑을 "자산 저장소"가 아니라 "서명 권한 도구"로 설명할 수 있다.
- [ ] 주소, 개인키, 공개키, 시드 구문을 구분할 수 있다.
- [ ] EOA와 컨트랙트 주소의 차이를 말할 수 있다.
- [ ] MetaMask 연결이 `eth_requestAccounts` 권한 요청이라는 점을 이해한다.
- [ ] Sepolia Chain ID `11155111`과 Sepolia Etherscan을 연결해서 기억한다.
- [ ] 트랜잭션 흐름을 작성, 서명, RPC 전송, 멤풀, 블록 포함, explorer 확인 순서로 설명할 수 있다.
- [ ] 트랜잭션 해시와 receipt status의 차이를 설명할 수 있다.
- [ ] Faucet 수령 실패와 트랜잭션 실행 실패를 분리해서 점검할 수 있다.
- [ ] Week2 앱에서 `/api/block-info`, `/api/tx`, `/api/send-eth`, `/api/wallet-info`가 각각 무엇을 하는지 말할 수 있다.

## 참고한 기존 자료

- `이론보강/START_HERE.md`
- `이론보강/00_HARNESS_CONTRACT.md`
- `이론보강/01_SOURCE_MANIFEST.md`
- `이론보강/03_EXISTING_HTML_REVIEW.md`
- `이론보강/tasks/agent-md-week1-2.md`
- `week/week_2-wallet-price-tracker/README.md`
- `week/week_2-wallet-price-tracker/index.html`
- `week/week_2-wallet-price-tracker/server.js`
- `week/week_2-wallet-price-tracker/이더리움_트랜잭션_과정.md`
- `week/week_2-wallet-price-tracker/코드_핵심_설명서.md`
- `week/week_2-wallet-price-tracker/presentation.html`
- `실습/03.24 강의자료.pdf`
- `실습/03.24 실습자료.pdf`
- `피드백/survey_priority_summary.md`
