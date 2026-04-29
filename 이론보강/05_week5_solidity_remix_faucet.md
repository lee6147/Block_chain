# Week5 Solidity, Remix, Faucet 이론 보강

## 학습 목표

- Solidity 컨트랙트가 "코드 + 상태"로 배포되고, 함수 호출을 통해 상태가 바뀐다는 흐름을 설명한다.
- Remix에서 컴파일, 배포, 함수 호출, 이벤트 확인이 각각 무엇을 의미하는지 구분한다.
- `require`와 `revert`를 도구 고장이 아니라 "조건 실패로 실행을 중단하고 상태를 되돌리는 장치"로 이해한다.
- Faucet 컨트랙트의 `withdraw`, `deposit`, `mapping`, `block.timestamp`, `event`가 실습에서 어떤 역할을 하는지 연결한다.
- 컴파일 오류, Faucet 수령 오류, 트랜잭션 실행 오류를 섞지 않고 원인을 좁힌다.

## 비유로 먼저 이해하기

Solidity 컨트랙트는 자동 판매기와 비슷하다. 자동 판매기는 처음 설치될 때 내부 규칙이 정해지고, 사용자는 버튼을 눌러 정해진 동작만 실행할 수 있다. 물건이 없거나, 돈이 부족하거나, 하루에 한 번만 살 수 있는 제한을 어기면 판매기는 물건을 내주지 않는다.

Faucet은 무료 음수대에 가깝다. 누구나 물을 받을 수 있지만, 한 사람이 너무 자주 받으면 물이 금방 고갈된다. 그래서 Faucet은 "마지막으로 받은 시각"을 주소별로 기록하고, 충분한 시간이 지나지 않았으면 거절한다. 이 거절이 `require` 실패이고, 실제 실행 결과로는 `revert`가 나타난다.

Remix는 이 자동 판매기를 만들고 시험하는 작업대다. Compile은 설계도 문법 검사, Deploy는 판매기 설치, 함수 버튼 클릭은 실제 버튼 누르기, event는 영수증 출력에 해당한다.

## 정석 개념 설명

Solidity 컨트랙트의 정의는 EVM에서 실행되는 코드와 블록체인 storage에 저장되는 상태의 묶음이다. `contract Faucet { ... }` 안에는 상태 변수, 함수, 이벤트, modifier가 들어간다. 상태 변수는 모든 노드가 복제하는 영구 데이터이므로 쓰기에는 gas가 든다.

Remix 실행 흐름은 다음처럼 나뉜다.

초보자용 원칙은 `Compile 성공 전에는 Deploy가 없다`이다. Compile은 체인에 트랜잭션을 보내는 단계가 아니라 설계도를 ABI와 bytecode로 바꿀 수 있는지 확인하는 단계다. 따라서 Compile 오류가 남아 있으면 gas, Faucet, MetaMask, 네트워크를 보지 말고 Solidity 버전, import, 세미콜론, 타입부터 고친다.

| 단계 | 의미 | 실패하면 볼 것 |
| --- | --- | --- |
| 컴파일 | Solidity 소스를 ABI와 bytecode로 바꾸는 단계 | pragma 버전, import 경로, 문법, 타입, 함수 선언 |
| 배포 | bytecode를 네트워크에 올려 컨트랙트 주소를 만드는 트랜잭션 | 지갑 네트워크, Sepolia ETH 잔액, gas limit, 생성자 인자 |
| 읽기 함수 호출 | `view`/`pure`처럼 상태를 바꾸지 않는 로컬 실행 | 주소 입력, ABI, 함수 인자 |
| 쓰기 함수 호출 | 상태 변경 트랜잭션 생성, 서명, 블록 포함 | 지갑 승인, gas, nonce, `require` 조건, 컨트랙트 잔액 |
| 이벤트 확인 | 트랜잭션 receipt의 logs에 남은 기록 확인 | 트랜잭션 성공 여부, event 이름과 indexed 값 |

`require(condition, "message")`는 조건이 참일 때만 다음 줄로 진행한다. 조건이 거짓이면 EVM은 `REVERT`로 실행을 멈추고, 그 트랜잭션 안에서 바뀌던 상태를 원상복구한다. 따라서 require/revert는 "조건 실패"이지, Remix나 MetaMask가 고장났다는 뜻이 아니다.

Faucet의 핵심 조건은 보통 두 가지다.

```solidity
require(
    block.timestamp >= lastWithdrawalTime[msg.sender] + LOCK_TIME,
    "You must wait 24 hours between withdrawals."
);
require(
    address(this).balance >= WITHDRAWAL_AMOUNT,
    "Insufficient balance in the faucet."
);
```

첫 번째 조건은 사용자별 쿨다운이다. `mapping(address => uint256) lastWithdrawalTime`이 주소마다 마지막 수령 시각을 저장한다. 두 번째 조건은 Faucet 컨트랙트 자체의 ETH 잔액이다. 둘 중 하나라도 실패하면 출금은 일어나지 않고, `lastWithdrawalTime`도 갱신되지 않아야 한다.

Faucet이 실패했을 때는 아래 다섯 갈래를 먼저 나눈다.

| 갈래 | 초보자 질문 | 확인 증거 |
| --- | --- | --- |
| cooldown | 같은 주소가 너무 빨리 다시 받으려 했는가? | `lastWithdrawalTime[msg.sender]`, `LOCK_TIME`, 경과 시간 |
| Faucet 잔액 | Faucet 컨트랙트 물탱크가 비었는가? | `address(this).balance`, 요청 금액 |
| 지갑 gas | write transaction 수수료를 낼 Sepolia ETH가 있는가? | MetaMask native ETH 잔액, failed receipt |
| 네트워크 | 지갑이 수업 네트워크에 붙어 있는가? | Sepolia 선택 여부, 컨트랙트 주소와 explorer |
| require 조건 | 컨트랙트 코드의 어떤 조건이 거짓인가? | revert reason, Remix console, receipt status |

`execution reverted`가 보이면 다음 버튼을 무작정 다시 누르지 않는다. 먼저 1) 어떤 함수였는가, 2) write transaction인가, 3) 어떤 require가 막혔는가, 4) 성공 event와 storage 변경이 남았는가를 확인한다.

<details>
<summary>더 깊게 보기: revert는 실패했지만 상태를 망가뜨리지 않는 안전장치</summary>

`revert`는 실행 중 바뀌던 상태를 되돌린다. 그래서 cooldown 실패나 Faucet 잔액 부족이 발생하면 `lastWithdrawalTime`과 event log가 남지 않아야 한다. 이 성질 덕분에 실패한 요청이 중간 상태만 남겨 다음 실습을 더 꼬이게 만들지 않는다.

</details>

상태 변경은 Checks-Effects-Interactions 순서로 이해한다.

| 순서 | Faucet 예시 | 이유 |
| --- | --- | --- |
| Checks | 쿨다운 확인, Faucet 잔액 확인 | 실패할 요청을 먼저 막는다 |
| Effects | `lastWithdrawalTime[msg.sender] = block.timestamp` | 외부 전송 전에 내부 상태를 확정한다 |
| Interactions | `call{value: amount}("")` 또는 `transfer`로 ETH 전송, 성공 여부 확인 | 외부 주소와 상호작용은 마지막에 둔다 |
| Event | `emit Withdrawal(msg.sender, amount)` | 성공한 트랜잭션의 receipt log로 관찰한다 |

최신 예제에서는 `transfer`보다 `call{value: amount}("")` 형태를 더 자주 본다. 중요한 점은 외부 전송을 하기 전에 `lastWithdrawalTime[msg.sender]` 같은 내부 상태를 먼저 갱신하고, `call`의 `success` 값을 확인한 뒤 실패하면 revert해야 한다는 것이다. 이 순서가 reentrancy로 같은 주소가 같은 시간대에 여러 번 받는 상황을 막는 첫 안전난간이다.

## 개념 보강 블록

| 핵심 개념 | 비유 | 정석 정의 | 왜 중요한가 | 실습에서 어디에 보이나 | 자주 하는 오해 | 확인 질문 |
| --- | --- | --- | --- | --- | --- | --- |
| 컨트랙트 | 자동 판매기 | EVM 코드와 storage 상태가 주소에 배포된 프로그램 | 함수 호출은 코드 실행과 상태 변화를 함께 만든다 | Remix Deploy 후 생기는 contract address | 컨트랙트는 그냥 서버 코드다 | 상태 변수는 어디에 저장되고 누가 복제하는가? |
| Compile/Deploy/Call | 설계도 검사, 설치, 버튼 누르기 | 소스 변환, bytecode 배포, 함수 실행의 단계 | 오류 위치가 컴파일 전인지 체인 실행 후인지 나눠야 한다 | Remix compile/deploy/call 버튼 | 컴파일 오류도 트랜잭션 실패다 | 아직 tx hash가 없다면 어느 단계 실패인가? |
| require/revert | 조건 불합격으로 판매 중단 | 조건이 거짓이면 실행을 멈추고 상태 변경을 되돌린다 | 실패해도 storage와 event가 바뀌지 않는 이유다 | cooldown, balance 조건, execution reverted | require가 도구 오류를 만든다 | 실패 후 `lastWithdrawalTime`과 event는 바뀌는가? |
| cooldown과 Faucet 잔액 | 음수대 이용 시간 제한과 물탱크 잔량 | `mapping(address => uint256)`은 주소별 마지막 수령 시각을 저장하고, `address(this).balance`는 Faucet 컨트랙트 잔액을 나타낸다 | 둘 중 하나라도 부족하면 `withdraw()`가 revert된다 | `lastWithdrawalTime[msg.sender]`, `block.timestamp`, Faucet balance 입력값 | 내 지갑에 ETH가 있으면 Faucet 잔액 조건도 통과한다 | 실패 원인이 내 지갑 gas 부족인지, Faucet 컨트랙트 잔액 부족인지 어떻게 나누는가? |
| event log | 영수증 | 트랜잭션 receipt의 logs에 남는 외부 관찰 기록 | 성공 여부와 함수 실행 결과를 화면 밖에서도 확인한다 | Withdrawal 이벤트, Remix console, Explorer logs | event는 컨트랙트 storage다 | 컨트랙트가 나중에 event를 상태처럼 읽을 수 있는가? |

## 수업 실습과 연결

Week5 자료의 `week5-concepts-lab1.md`는 `pragma`, `contract`, 상태 변수, `view`/`pure`, 함수 호출을 다룬다. 여기서 Remix 초록색 읽기 버튼과 주황색 상태 변경 버튼의 차이를 먼저 잡아야 한다. 초록색 읽기 버튼은 보통 `eth_call`처럼 현재 상태를 로컬로 시뮬레이션해 조회하고, 주황색 쓰기 버튼은 서명, gas, nonce, require, receipt를 남기는 트랜잭션이다.

`week5-concepts-lab2.md`는 `constructor`, `uint`/`int`, `revert`를 다룬다. 특히 음수 입력에서 `revert("The number is negative")`가 나오는 예시는 "실패 메시지를 반환하는 함수"가 아니라 "실행 자체를 취소하는 함수"로 봐야 한다.

`week5-concepts-lab3.md`와 `week5-study.html`, `week5-lab.html`은 Faucet 종합 실습이다. 학생이 실습에서 봐야 할 흐름은 다음이다.

1. Remix에서 Solidity 버전을 맞추고 컴파일한다.
2. Faucet을 배포하거나, 이미 배포된 Faucet 주소를 `At Address`로 연결한다.
3. Faucet에 ETH가 들어 있는지 확인한다.
4. `withdraw()`를 호출한다.
5. 성공하면 `Withdrawal(user, amount)` 이벤트와 잔액 변화를 확인한다.
6. 실패하면 에러 메시지를 보고 쿨다운, Faucet 잔액, 지갑 gas, 네트워크를 분리해 확인한다.

왜 배우는가를 한 문장으로 줄이면 "버튼을 누르는 법"이 아니라 "실패한 위치를 좁히는 법"을 배우는 것이다. 컴파일 실패는 아직 체인에 간 것이 아니고, 배포 실패는 컨트랙트 주소가 만들어지지 않은 것이며, `withdraw()` revert는 이미 지갑 서명과 트랜잭션 실행 단계까지 간 뒤 컨트랙트 조건이 실패한 것이다. 이 차이를 모르면 모든 오류가 Remix, MetaMask, Faucet 고장처럼 보인다.

실패 의미는 다음 순서로 읽는다.

| 실패 위치 | 아직 일어나지 않은 일 | 먼저 볼 증거 |
| --- | --- | --- |
| Compile 실패 | tx hash, gas 지불, 상태 변경이 모두 없음 | Remix compiler 오류 줄, pragma, import, 타입 |
| Deploy 실패 | 컨트랙트 주소가 만들어지지 않음 | 지갑 네트워크, Sepolia ETH, 생성자 인자, gas |
| Read 실패 | 상태 변경은 없음 | ABI, 컨트랙트 주소, 함수 인자 |
| Write revert | 성공 event와 storage 변경이 없음 | revert reason, require 조건, receipt status |
| Faucet 수령 실패 | 토큰/ETH가 사용자에게 지급되지 않음 | Faucet 잔량, cooldown, 일일 제한, 네트워크 |

처음 실습 경로는 `Compile -> Deploy -> Read/Write -> Faucet withdraw -> 오류 분류`로 고정한다. 중간에 막히면 다음 단계로 넘어가지 않고, 지금 단계가 컴파일 전인지, 컨트랙트 주소 생성 전인지, write tx 실행 후 require 실패인지 먼저 말하게 한다.

04.07 강의자료와 04.14 강의자료는 Faucet 코드, `mapping`, `block.timestamp`, OpenZeppelin `Ownable`, cooldown 조건을 반복해서 보여준다. 이론 보강에서는 이 내용을 실습 버튼 순서와 에러 분류표로 다시 묶는다.

## 자주 헷갈리는 지점

| 헷갈리는 말 | 정확한 구분 |
| --- | --- |
| "컴파일이 안 된다" | 아직 블록체인에 보낸 것이 아니다. Solidity 문법, 버전, import, 타입 오류를 본다. |
| "Faucet이 안 된다" | Sepolia ETH Faucet 문제인지, 수업용 Faucet 컨트랙트 수령 문제인지 먼저 나눈다. |
| "트랜잭션 실패" | 지갑 서명 후 네트워크에 보냈지만 실행 조건, gas, nonce, 잔액 중 하나에서 실패한 것이다. 먼저 tx hash/receipt가 있는지 보고, 있으면 `execution reverted`의 require 조건을 좁힌다. |
| "`require`가 오류를 냈다" | `require`는 오류 원인이 아니라 조건문이다. 조건이 거짓이라 `revert`된 것이다. |
| "`event`는 상태 변수다" | event는 storage가 아니라 트랜잭션 receipt의 log다. 컨트랙트 내부에서 다시 읽는 데이터가 아니다. |
| "`view` 함수도 gas가 든다" | 외부에서 단순 조회하면 gas를 내지 않는다. 다른 상태 변경 함수 안에서 실행되면 그 트랜잭션 일부라 gas가 든다. |
| "`msg.sender`는 항상 내 지갑이다" | 직접 호출하면 내 지갑이지만, 다른 컨트랙트를 거쳐 호출하면 중간 컨트랙트 주소가 `msg.sender`가 된다. |

오류는 다음 순서로 분리한다.

| 분류 | 대표 증상 | 먼저 확인할 것 |
| --- | --- | --- |
| 컴파일 오류 | Remix compile 단계에서 빨간 오류 | pragma 버전, 세미콜론, import, 타입, 함수 이름 |
| Faucet 수령 오류 | Faucet 웹사이트나 수업용 Faucet에서 토큰/ETH를 못 받음 | 로그인/일일 제한, 네트워크, Faucet 잔량, cooldown |
| 트랜잭션 실행 오류 | MetaMask 승인 후 failed 또는 execution reverted | gas 잔액, nonce, require 조건, 컨트랙트 잔액, 함수 인자 |

## HTML 시뮬레이터 설계

짝이 되는 HTML 확장판은 "Faucet 실행 판별기"를 구현하며, 다음 설계를 기준으로 검토한다.

- 화면 1: Remix 단계 카드
  - Compile, Deploy, Call 세 단계를 탭으로 보여준다.
  - 사용자가 pragma 버전, 컴파일러 버전, 생성자 인자, 지갑 네트워크를 바꾸면 현재 단계가 통과인지 표시한다.
- 화면 2: Faucet 상태 패널
  - 입력값: Faucet 잔액, 현재 시각, 사용자의 마지막 수령 시각, `LOCK_TIME`, `WITHDRAWAL_AMOUNT`.
  - 버튼: `withdraw()` 실행, 시간 1시간 증가, Faucet 충전, 초기화.
  - 결과: require 1 통과/실패, require 2 통과/실패, 상태 변경, 이벤트 발생 여부를 순서대로 표시한다.
- 화면 3: 에러 분류 훈련
  - "ParserError", "Faucet empty", "Cooldown active", "insufficient funds", "nonce too low", "execution reverted" 카드를 보여준다.
  - 사용자가 컴파일/Faucet 수령/트랜잭션 실행 중 하나로 분류하면 이유를 피드백한다. 단, Faucet empty/cooldown도 write transaction에서는 `execution reverted`로 보일 수 있으므로 이 분류는 "증상이 속한 원인 영역"임을 명시한다.
- 화면 4: 이벤트 영수증
  - 성공 시 `Withdrawal(address indexed user, uint256 amount)` 로그가 receipt에 추가되는 모습을 보여준다.
  - 실패 시 상태와 이벤트가 바뀌지 않는 것을 강조한다.

시각화 핵심은 "조건 실패 전에는 상태가 바뀌지 않는다"와 "성공할 때만 storage 변경과 event log가 남는다"이다.

시뮬레이터 타당성 기준:

- Remix 단계 시뮬레이터는 Compile, Deploy, Read, Write를 한 화면에 넣더라도 결과 해석은 반드시 단계별로 분리해야 한다.
- Faucet 시뮬레이터는 쿨다운 실패와 Faucet 컨트랙트 잔액 부족을 다른 require 실패로 보여줘야 한다.
- Faucet empty/cooldown은 Faucet 원인 영역이지만, MetaMask나 receipt에서는 execution reverted로 보일 수 있음을 함께 보여줘야 한다.
- 실패한 `withdraw()`는 `lastWithdrawalTime` 갱신과 `Withdrawal` event가 남지 않는 것으로 표현해야 한다.
- `insufficient funds`는 우선 gas용 native ETH 부족으로 안내하고, Faucet 컨트랙트 잔액 부족과 섞지 않는다.
- 기능을 더 늘리기보다 "예측 -> 실행 -> 상태 변화 -> 해석" 순서가 화면에서 먼저 보이게 하는 것이 우선이다.

## 체크리스트

- [ ] 컴파일 오류와 트랜잭션 실행 오류를 구분했다.
- [ ] Remix 컴파일러 버전이 `pragma solidity` 범위와 맞는지 확인했다.
- [ ] `view`/`pure` 함수와 상태 변경 함수의 차이를 설명할 수 있다.
- [ ] Faucet 컨트랙트 잔액과 내 지갑 Sepolia ETH 잔액을 따로 확인했다.
- [ ] `require` 실패는 조건 실패이며, 실패한 트랜잭션도 일부 gas를 쓸 수 있음을 이해했다.
- [ ] `lastWithdrawalTime[msg.sender]`가 주소별 마지막 수령 시각이라는 점을 설명할 수 있다.
- [ ] 성공 트랜잭션에서 `Withdrawal` 이벤트와 잔액 변화가 함께 확인되는지 봤다.
- [ ] 실패 시 쿨다운, Faucet 잔액, gas, nonce, 네트워크를 순서대로 좁혔다.

## 참고한 기존 자료

- `이론보강/START_HERE.md`
- `이론보강/00_HARNESS_CONTRACT.md`
- `이론보강/01_SOURCE_MANIFEST.md`
- `이론보강/03_EXISTING_HTML_REVIEW.md`
- `이론보강/tasks/agent-md-week5-6.md`
- `week/week5/week5-concepts-lab1.md`
- `week/week5/week5-concepts-lab2.md`
- `week/week5/week5-concepts-lab3.md`
- `week/week5/week5-study.html`
- `week/week5/week5-lab.html`
- `실습/04.07 강의자료.pdf`
- `실습/04.14 강의자료.pdf`
- `피드백/survey_priority_summary.md`
