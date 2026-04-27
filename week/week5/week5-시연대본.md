# 5주차 Solidity Lab Simulator 시연 대본

> 예상 총 시연 시간: 약 15~20분

---

## 도입 (약 1분)

안녕하세요, 이번 5주차 실습에서는 **Solidity Lab Simulator**를 활용하여 스마트 컨트랙트를 직접 체험해보겠습니다.

이 시뮬레이터는 Remix IDE의 핵심 기능을 웹 브라우저에서 바로 실행할 수 있도록 만든 것으로, 별도 설치 없이 Solidity 코드의 **컴파일, 배포, 함수 호출**까지 체험할 수 있습니다.

총 3개의 Lab으로 구성되어 있고, 기초 → 중급 → 심화 순서로 난이도가 올라갑니다. 런처 화면에서 카드를 클릭하거나 키보드 **1, 2, 3**으로 각 Lab에 진입할 수 있습니다.

---

## Lab 1: HelloWorld & HelloNumber (약 5분)

### Tab 1 - HelloWorld 기본

첫 번째 Lab을 시작하겠습니다. *(Lab 1 카드 클릭)*

화면이 3단 레이아웃으로 나뉩니다. **왼쪽**은 Solidity 코드 에디터, **가운데**는 컴파일/배포 컨트롤과 블록체인 상태, **오른쪽**은 배포된 컨트랙트의 함수 실행 패널입니다.

그리고 화면 **하단**에 **콘솔 패널**이 있는데, 모든 트랜잭션 기록과 이벤트 로그가 여기에 쌓입니다. 나중에 Lab 3에서 자세히 활용하겠습니다.

```solidity
contract HelloWorld {
    string public greet = "Hello World";
}
```

이 코드는 `string` 타입의 `public` 변수 하나만 선언한 가장 단순한 컨트랙트입니다.

**컴파일** 버튼을 누르겠습니다. *(클릭)*
컴파일이 성공했습니다. 이제 **배포** 버튼을 누릅니다. *(클릭)*

배포 시 **3단계 과정**이 진행됩니다 — 트랜잭션 서명 → 블록 검증 → 배포 완료. 실제 블록체인에서도 이런 과정을 거칩니다.

오른쪽 패널에 `greet` 버튼이 나타났습니다. 클릭해보면... **"Hello World"** 가 반환됩니다.

> **핵심 포인트:** `public` 변수는 Solidity가 **자동으로 getter 함수를 생성**해줍니다. 별도로 함수를 만들지 않아도 외부에서 값을 읽을 수 있습니다.

---

### Tab 2 - HelloWorld 확장

두 번째 탭으로 넘어가겠습니다. *(HelloWorld 확장 탭 클릭)*

이번에는 `private` 변수와 직접 작성한 함수 두 개가 있습니다.

```solidity
string private _greeting = "Hello, World!";

function greet() public view returns (string memory) { ... }
function setGreeting(string memory newGreeting) public { ... }
```

컴파일 → 배포 후, `greet()`를 호출하면 현재 값 "Hello, World!"가 나옵니다.

이제 `setGreeting`에 **"Hello Blockchain!"** 을 입력하고 실행합니다. *(입력 후 클릭)*

다시 `greet()`를 호출하면... 값이 변경된 것을 확인할 수 있습니다.

> **주목할 점:**
> - `setGreeting`은 **상태를 변경하는 함수**이기 때문에 가스비가 소모됩니다. 가운데 패널의 잔액이 소폭 줄어든 걸 확인할 수 있습니다.
> - 반면 `greet()`는 `view` 함수라 **가스비가 무료**입니다.
> - 코드에서 `string memory`라는 키워드가 보이시죠? Solidity에서 참조 타입(string, array 등)에는 **데이터 위치**를 명시해야 합니다. 가이드 패널에 storage, memory, calldata의 차이를 비교한 표가 있으니 참고해주세요.

---

### Tab 3 - HelloNumber

세 번째 탭은 `int` 타입을 다루는 HelloNumber입니다.

```solidity
contract HelloNumber {
    int public number = 10;
}
```

`int`는 음수를 포함하는 정수 타입입니다. 음수가 필요 없는 경우에는 `uint`를 사용하는 것이 Solidity의 일반적인 관행인데, Lab 2에서 `uint`를 다루게 됩니다.

> **도전과제:** `int public number`를 `private`으로 변경하고, `getNumber()` getter 함수와 `setNumber()` setter 함수를 직접 추가해보세요. 힌트 버튼으로 정답을 확인하거나, "코드 적용하기"를 누르면 자동으로 코드가 변경됩니다.

---

## Lab 2: Counter & CheckNumber (약 5분)

### Counter.sol

Lab 2에서는 **상태 변경**과 **에러 처리**를 배웁니다. *(Lab 2 진입)*

```solidity
contract Counter {
    uint public counter;

    constructor() {
        counter = 0;
    }

    function count() public {
        counter = counter + 1;
    }

    function get() public view returns (uint) {
        return counter;
    }
}
```

새로운 키워드가 두 개 나옵니다.
- `constructor`는 컨트랙트가 배포될 때 **딱 한 번만** 실행되는 초기화 함수입니다.
- `uint`는 음수가 없는 양의 정수 타입이고, 기본값이 0입니다. 여기서 `counter = 0`은 생략 가능하지만, constructor의 동작을 보여주기 위해 포함한 것입니다.

배포 후 `count()` 버튼을 여러 번 눌러보겠습니다. *(3~4회 클릭)*

LED 디스플레이에서 카운터가 실시간으로 올라가는 것이 보입니다. `get()`으로도 확인할 수 있습니다.

가운데 **가스비 통계**를 보시면, `count()`는 상태를 변경하므로 호출할 때마다 약 43,000 gas가 소모됩니다. 반면 `get()`은 view 함수라 **가스비가 0**입니다.

> **버튼 색상의 의미:**
> - **주황색** = 트랜잭션 (상태 변경, 가스비 소모)
> - **초록색** = 읽기 전용 (view/pure, 가스비 무료)
>
> 실제 Remix IDE에서도 동일한 색상 규칙을 사용합니다.

도전과제로 `reset()` 함수와 `countBy(uint n)` 함수를 직접 추가해볼 수 있습니다. 힌트를 참고해서 코드에 추가하고, 다시 컴파일 → 배포하면 새 함수가 우측 패널에 자동으로 나타납니다.

---

### CheckNumber.sol

두 번째 탭 CheckNumber를 보겠습니다. *(CheckNumber.sol 탭 클릭)*

```solidity
function check(int x) public pure returns (string memory) {
    if (x > 0) {
        return "The number is positive";
    } else if (x < 0) {
        revert("The number is negative");
    }
    return "The number is zero";
}
```

이 함수에는 `pure` 키워드가 붙어있습니다. `view`는 블록체인 상태를 **읽기만** 할 수 있는 반면, **pure는 읽지도 변경하지도 않는** 순수 계산 함수입니다. 우측 패널의 다이어그램에서 pure, view, state-changing의 차이를 시각적으로 확인할 수 있습니다.

참고로 이 컨트랙트에는 `int public number = 100` 변수도 있지만, `check()` 함수에서는 이 변수를 전혀 사용하지 않습니다. pure 함수니까 Storage에 접근 자체가 불가능한 겁니다.

직접 실험해보겠습니다.

| 입력 | 결과 |
|------|------|
| 양수 `42` | "The number is positive" — 정상 반환 |
| `0` | "The number is zero" — 정상 반환 |
| 음수 `-5` | **revert 발생!** 화면 흔들림 + "The number is negative" 에러 |

`revert`는 트랜잭션을 되돌리고 에러 메시지를 반환합니다. 우측 패널의 비교표에서 `require`, `revert`, `assert`의 차이를 확인할 수 있습니다.

> **도전과제:**
> 1. `check()` 함수를 수정하여 **0도 revert** 되도록 변경해보세요
> 2. `check()` 함수에 **범위 제한**(-100 ~ 100)을 추가해보세요

---

## Lab 3: Faucet 시뮬레이터 (약 8분)

마지막 Lab 3는 **종합 실전 컨트랙트**입니다. *(Lab 3 진입)*

Lab 3는 앞의 Lab과 레이아웃이 다릅니다.
- **왼쪽** — 코드 에디터
- **가운데** — Faucet 탱크 시각화 + 테스트 계정 카드 + 상태 변수 모니터
- **오른쪽** — 함수 실행 패널

상단에 **전역 변수 트래커**가 있어서 `msg.sender`, `msg.value`, `block.timestamp`가 실시간으로 표시됩니다.

Faucet(수도꼭지)은 테스트넷에서 무료로 ETH를 나눠주는 컨트랙트인데요, 여기에는 지금까지 배운 개념이 모두 들어있습니다:

| 개념 | 역할 |
|------|------|
| `payable` | ETH를 주고받을 수 있는 함수 |
| `mapping` | 주소별 마지막 출금 시간을 저장 |
| `modifier` | `onlyOwner`로 함수 접근 제어 |
| `event` | `Withdrawal` 이벤트 로그 기록 |
| `require` | 24시간 제한, 잔액 부족 등 조건 검증 |
| `receive()` | 함수 호출 없이 직접 ETH를 수신 |

---

### 시나리오 시연 (가이드 12단계)

우측 패널 하단에 **실습 가이드 시나리오**가 있습니다. 12단계로 구성되어 있고, 각 단계를 완료하면 자동으로 체크됩니다.

#### 1~2단계: 컴파일 → 배포

컴파일하고 배포합니다. *(클릭)*
배포 오버레이가 나타나면서 서명 → 검증 → 완료 과정이 진행됩니다.
Account 1이 자동으로 **owner**가 됩니다.

#### 3단계: owner 확인

`owner()` 버튼을 눌러서 확인합니다. *(클릭)*
— Account 1의 주소가 반환됩니다. 가운데 패널의 상태 변수 모니터에서도 owner 주소를 볼 수 있습니다.

#### 4~5단계: 입금 (deposit) + 탱크 확인

owner로서 Faucet에 **1 ETH**를 입금하겠습니다. deposit 입력칸에 1을 넣고 실행합니다. *(입력 후 클릭)*

탱크에 물이 차오르는 애니메이션이 보이시죠? 상단에서 ETH가 유입되는 효과와 함께 수위가 올라갑니다. 상태 변수 모니터에서도 `address(this).balance`가 **1 ETH**로 업데이트됩니다.

#### 6단계: 계정 전환

이제 **Account 2**를 클릭해서 전환합니다. *(계정 카드 클릭)*
상단 트래커에서 `msg.sender`가 바뀐 것을 확인하세요.

#### 7단계: 첫 출금 (withdraw)

`withdraw()` 버튼을 누릅니다. *(클릭)*
— **0.1 ETH**(WITHDRAWAL_AMOUNT)가 수령됩니다!
탱크 수위도 내려가고, 수도꼭지에서 물방울이 떨어지는 애니메이션이 보입니다.
Account 2의 잔액도 늘어났습니다.

#### 8단계: 24시간 제한 테스트

바로 다시 `withdraw()`를 시도하면... *(클릭)*

> **에러 발생!** "You must wait 24 hours between withdrawals."
> — `LOCK_TIME`(86,400초 = 1일)이 지나지 않아서 `require` 조건에 걸립니다.

#### 9단계: 시간 경과 후 재출금

상단의 **"24시간 경과"** 버튼을 누릅니다. *(클릭)*
— `block.timestamp`가 86,400초 앞으로 이동합니다.
이제 다시 `withdraw()`를 실행하면... **성공!**

#### 10단계: 권한 테스트 (withdrawAll)

Account 2인 상태에서 `withdrawAll()`을 시도합니다. *(클릭)*

> **"Only the owner can call this function."**
> — `onlyOwner` modifier가 접근을 차단합니다.

#### 11단계: owner로 전액 회수

Account 1(owner)로 다시 전환하고 `withdrawAll()`을 실행합니다. *(전환 후 클릭)*
— **전액 회수 성공!** 탱크가 완전히 비워집니다.

#### 12단계: 이벤트 로그 확인

마지막으로 하단 콘솔 패널을 확인합니다. **"이벤트 로그"** 탭을 클릭하면, 지금까지 발생한 **Withdrawal 이벤트**가 기록되어 있습니다. 누가, 언제, 얼마나 출금했는지가 블록체인에 영구적으로 기록되는 것이죠. 이것이 `event`와 `emit`의 역할입니다.

---

### receive() 테스트

추가로 우측 패널에 **receive() 테스트** 섹션이 있습니다.

- `deposit`은 `onlyOwner`라서 owner만 입금할 수 있습니다.
- 하지만 `receive()`가 있으면 **누구나** 컨트랙트에 직접 ETH를 보낼 수 있습니다.

금액을 입력하고 전송 버튼을 누르면 탱크에 물이 차는 것을 확인할 수 있습니다.

---

### 도전과제

| 번호 | 내용 | 핵심 학습 |
|------|------|-----------|
| 도전 1 | `WITHDRAWAL_AMOUNT`를 `0.2 ether`로 변경 | 상수 값 변경이 동작에 미치는 영향 |
| 도전 2 | `LOCK_TIME`을 `1 hours`(3600초)로 변경 | 시간 단위(`days`, `hours`) 이해 |
| 도전 3 | `receive()` 함수를 제거 후 직접 ETH 전송 시도 | receive/fallback의 역할 이해 |

왼쪽 에디터에서 코드를 수정하고 다시 컴파일 → 배포하면 바로 테스트할 수 있습니다.
재배포해도 가이드 진행률은 유지되니 안심하고 수정해보세요.

---

## 부가 기능 안내 (약 30초)

- **코드 추적:** 에디터 상단의 "코드 추적" 버튼을 누르면, 코드가 한 줄씩 하이라이트되면서 실행 흐름을 따라갈 수 있습니다. 컴파일이나 배포 시에도 자동으로 추적이 진행됩니다.
- **진행률:** 각 Lab의 도전과제를 완수하면 런처 화면의 진행률 바가 채워집니다.
- **단축키:** `Esc`로 런처 복귀, `Ctrl+/`로 전체 단축키 목록 확인 가능합니다.

---

## 마무리 (약 30초)

정리하면 오늘 3개의 Lab을 통해 다음을 체험했습니다:

| Lab | 학습 내용 |
|-----|-----------|
| **Lab 1** | 변수 선언(`string`, `int`), `public`/`private`, 자동 getter, 데이터 위치(`memory`) |
| **Lab 2** | `constructor`, `uint`, 상태 변경 vs 읽기(`view`/`pure`), 가스비 차이, `revert` 에러 처리 |
| **Lab 3** | `payable`, `mapping`, `modifier`, `event`, `require`, `receive()` 등 종합 패턴 |

각 Lab의 도전과제를 직접 풀어보면서 Solidity에 익숙해지시기 바랍니다. 감사합니다.
