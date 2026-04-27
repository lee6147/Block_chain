# 🔬 Lab 2: Counter & CheckNumber — 개념과 원리

> [!abstract] 학습 목표
> Counter 컨트랙트와 CheckNumber 컨트랙트를 통해 **constructor**, **uint vs int**, **상태 변경 함수 vs view/pure 함수**, **revert**의 원리를 깊이 있게 이해한다.

---

## 1. constructor (생성자) — 컨트랙트의 탄생 순간

> [!tip] 비유
> **가게 개업식**과 같습니다. 개업식(constructor)은 딱 한 번만 열리고, 그때 간판을 달고(변수 초기화), 사장을 등록(owner 설정)합니다. 개업식이 끝나면 다시 열 수 없고, 그때 정한 규칙대로 가게가 운영됩니다.

> [!info] 정석
> `constructor`는 컨트랙트 **배포 시 단 1회만 실행**되는 특수 함수입니다. 상태 변수의 초기값을 설정하거나, 소유자 주소를 기록하는 등 **초기 설정 작업**에 사용됩니다.
>
> ```solidity
> constructor() {
>     counter = 0;  // 상태 변수 초기화
> }
> ```

### 동작 원리

컨트랙트 배포는 단순히 "코드를 올리는 것"이 아니라, **트랜잭션**을 통해 이루어지는 복잡한 과정입니다.

1. **배포 트랜잭션 전송** — 사용자가 컨트랙트 코드를 포함한 트랜잭션을 네트워크에 전송
2. **EVM이 init code 실행** — constructor를 포함한 초기화 코드가 실행됨
3. **runtime code 반환** — constructor 실행 후, 실제 컨트랙트 바이트코드만 블록체인에 저장
4. **컨트랙트 주소 생성** — 배포자 주소 + nonce를 기반으로 결정적 주소 생성

```
배포 바이트코드 구조:

[init code (constructor 포함)] + [runtime code (실제 컨트랙트)]
                                      ↑
                              배포 후 이것만 블록체인에 저장됨
```

> [!important] 핵심 포인트
> constructor의 코드는 **배포된 바이트코드에 포함되지 않습니다.** 초기화 코드(init code)는 배포 과정에서만 실행되고, 블록체인에는 runtime code만 남습니다. 따라서 배포 후에는 어떤 방법으로도 constructor를 다시 호출할 수 없습니다.

### constructor에서 소비된 가스

constructor에서 실행되는 모든 연산(변수 초기화, 조건 검사 등)의 가스비는 **배포 트랜잭션의 가스비에 포함**됩니다. constructor가 복잡할수록 배포 비용이 올라갑니다.

> [!warning] 주의사항
> - constructor는 **오버로딩 불가** — 컨트랙트당 하나만 존재
> - **return 타입 없음** — 값을 반환할 수 없음
> - **매개변수 가능** — 배포 시 인자 전달 가능
> - **가시성** — Solidity 0.7.0 이후 `public`/`internal` 키워드 생략 (이전에는 명시 필요)

### 특성 비교표

| 특성 | constructor | 일반 함수 |
|------|------------|----------|
| 실행 시점 | 배포 시 1회 | 호출할 때마다 |
| 배포 후 호출 | 불가 | 언제든 가능 |
| 가스비 | 배포 비용에 포함 (1회) | 호출마다 지불 |
| return | 불가 | 가능 |
| 이름 | `constructor` (고정 키워드) | 자유롭게 지정 |
| 오버로딩 | 불가 | 가능 |

### Counter에서의 constructor

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Counter {
    uint counter;

    constructor() {
        counter = 0;  // 배포 시 카운터를 0으로 초기화
    }
    // ...
}
```

사실 `uint`의 기본값이 이미 0이므로 `counter = 0`은 생략 가능합니다. 하지만 **명시적 초기화**는 코드의 의도를 분명히 하고, 다른 개발자가 읽을 때 초기값을 쉽게 파악할 수 있게 해줍니다.

---

## 2. uint vs int — 부호의 의미

> [!tip] 비유
> - `int` = **은행 통장**: 입금(+)과 출금(-) 모두 기록 가능. 잔액이 마이너스가 될 수도 있습니다.
> - `uint` = **만보기**: 0부터 시작해서 증가만 가능합니다. 걸음 수에 음수란 없으니까요.

> [!info] 정석
> - `uint` (unsigned integer): **부호 없는 정수**. 0 이상의 값만 표현 가능
> - `int` (signed integer): **부호 있는 정수**. 음수도 표현 가능
> - 기본 크기: `uint` = `uint256`, `int` = `int256` (256비트)

### 비트 수에 따른 범위

Solidity는 8비트 단위로 정수 타입을 제공합니다: `uint8`, `uint16`, `uint32`, ... `uint256`

```
uint8   : 0 ~ 255                          (2^8 - 1)
int8    : -128 ~ 127                       (-2^7 ~ 2^7 - 1)

uint256 : 0 ~ 2^256 - 1                   (약 1.16 × 10^77)
int256  : -2^255 ~ 2^255 - 1
```

> [!question] 왜 Counter에서 uint를 사용하는가?
> 1. 카운터는 **0부터 증가**만 하므로 음수가 필요 없음
> 2. `uint`는 같은 비트 수에서 **양수 범위가 2배** 넓음
> 3. Solidity에서 `uint`가 더 일반적이고, 가스비 차이는 없음

### 오버플로우와 언더플로우

**오버플로우**는 최대값을 넘어서는 것, **언더플로우**는 최소값 아래로 내려가는 것입니다.

```solidity
// uint8의 최대값은 255
uint8 x = 255;
x = x + 1;

// Solidity 0.8.0 이전: 0으로 돌아감 (오버플로우!) — 심각한 보안 취약점
// Solidity 0.8.0 이후: 자동으로 revert — SafeMath가 내장됨
```

> [!danger] 역사적 해킹 사례: BEC 토큰 (2018)
> 2018년, BeautyChain(BEC) 토큰에서 오버플로우 취약점이 악용되었습니다. 공격자는 `batchTransfer` 함수에서 `amount * cnt` 계산의 오버플로우를 이용해 **수십억 개의 토큰을 무에서 생성**했습니다. 이 사건 이후 OpenZeppelin의 SafeMath 라이브러리가 표준이 되었고, Solidity 0.8.0에서 아예 **컴파일러 수준에서 오버플로우 보호가 내장**되었습니다.

이것이 `pragma solidity ^0.8.0;` 버전 지정이 중요한 이유 중 하나입니다.

### CheckNumber에서의 int 사용

```solidity
contract CheckNumber {
    function check(int x) public pure returns (string memory) {
        // int를 사용해야 음수 판별이 가능!
        if (x > 0) return "The number is positive";
        else if (x < 0) revert("The number is negative");
        return "The number is zero";
    }
}
```

여기서 `int`를 사용하는 이유는 명확합니다 — **양수/음수/0을 모두 구분**해야 하기 때문입니다. `uint`를 사용하면 음수를 입력할 수 없으므로 `x < 0` 조건이 무의미해집니다.

---

## 3. 상태 변경 함수 vs view 함수 — 가스비의 원리

> [!tip] 비유
> - **상태 변경 함수** (`count()`) = **은행 창구 방문**: 서류 작성하고(트랜잭션), 모든 지점에 동기화하고(블록 전파), 수수료(가스비)를 지불합니다.
> - **view 함수** (`get()`) = **인터넷 뱅킹 조회**: 잔액만 보는 겁니다. 서류도 없고, 동기화도 필요 없고, 무료입니다.

> [!info] 정석
> 블록체인의 상태(storage)를 **변경하는 함수**는 트랜잭션이 필요하고 가스비가 발생합니다. 반면 상태를 **읽기만 하는 함수**(view/pure)는 로컬에서 실행되므로 가스비가 없습니다.

```solidity
// 상태 변경 → 트랜잭션 필요 → 가스비 발생
function count() public {
    counter = counter + 1;  // SSTORE 옵코드 실행
}

// 읽기만 → 로컬 실행 → 가스비 없음
function get() public view returns (uint) {
    return counter;          // SLOAD 옵코드 실행
}
```

### EVM 옵코드 수준에서의 차이

EVM(Ethereum Virtual Machine)은 모든 연산을 **옵코드**(opcode) 단위로 실행하며, 각 옵코드마다 정해진 가스비가 있습니다.

| 옵코드 | 동작 | 가스비 |
|--------|------|--------|
| `SLOAD` | storage에서 값 읽기 | 2,100 gas (cold access), 100 gas (warm access) |
| `SSTORE` | storage에 값 쓰기 | 20,000 gas (0→nonzero), 5,000 gas (nonzero→nonzero) |
| `ADD` | 덧셈 | 3 gas |
| `PUSH1` | 스택에 값 올리기 | 3 gas |

> [!note] Cold vs Warm Access
> - **Cold access**: 해당 트랜잭션에서 처음 접근하는 storage 슬롯 → 비쌈 (2,100 gas)
> - **Warm access**: 같은 트랜잭션 내에서 이미 접근한 슬롯 → 저렴 (100 gas)
>
> 이는 EVM이 내부적으로 "접근 목록(access list)"을 관리하기 때문입니다.

### `count()` 함수의 가스비 분해

```
count() 호출 시 발생하는 가스비:

기본 트랜잭션 비용    →  21,000 gas (모든 트랜잭션의 최소 비용)
SLOAD counter        →   2,100 gas (counter 값을 storage에서 읽기)
PUSH1 1              →       3 gas (숫자 1을 스택에 올리기)
ADD                  →       3 gas (counter + 1 더하기)
SSTORE counter       →   5,000 gas (결과를 storage에 다시 쓰기)
+ 기타 오버헤드      →   ~14,000 gas (함수 선택자, 메모리 등)
─────────────────────────────────
총 약                   ~43,000 gas
```

### `get()` 함수가 무료인 이유

`view` 함수를 외부에서 호출하면, 노드는 **`eth_call`** RPC 메서드를 사용합니다. 이는:
- 트랜잭션을 생성하지 않음
- 블록에 기록되지 않음
- 네트워크에 전파되지 않음
- 로컬 EVM에서만 실행됨

따라서 **가스비가 0**입니다.

> [!warning] 예외 상황
> `view` 함수라도 **다른 상태 변경 함수 내부에서 호출**되면 가스비가 발생합니다.
> ```solidity
> function count() public {
>     uint current = get();  // 여기서 get()은 가스비 발생!
>     counter = current + 1;
> }
> ```
> 이 경우 `get()`은 `count()` 트랜잭션의 일부로 실행되므로, `SLOAD` 가스비가 포함됩니다.

### Remix 버튼 색상의 의미

Remix IDE에서는 함수의 특성에 따라 버튼 색상이 달라집니다.

| 색상 | 분류 | EVM 동작 | 비용 |
|------|------|---------|------|
| 🟠 주황색 | 상태 변경 (`count`) | 트랜잭션 생성 → 블록에 기록 | 가스비 지불 |
| 🔵 파란색 | `payable` 함수 | 트랜잭션 + ETH 전송 가능 | 가스비 + ETH |
| 🟢 초록색 | `view` / `pure` (`get`, `counter`) | `eth_call` → 로컬 실행 | 무료 |

> [!tip] Remix에서 확인하기
> Counter 컨트랙트를 배포하면:
> - `count` 버튼 → **주황색** (상태 변경)
> - `get` 버튼 → **초록색** (view)
> - `counter` 버튼 → **초록색** (public 변수의 자동 getter도 view)

---

## 4. pure 함수 — 완전한 순수성

> [!tip] 비유
> **수학 계산기**와 같습니다. 외부 정보(인터넷, 날씨, 주식)를 전혀 보지 않고, 오직 **입력된 숫자만으로 계산**합니다. 같은 입력을 넣으면 **항상 같은 결과**가 나옵니다. 이것이 함수형 프로그래밍에서 말하는 "순수 함수"입니다.

> [!info] 정석
> `pure` 함수는 두 가지를 **모두 금지**합니다:
> 1. 상태 변수 **읽기** (SLOAD 불가)
> 2. 상태 변수 **쓰기** (SSTORE 불가)
>
> 블록체인의 어떤 상태에도 의존하지 않으므로, 동일 입력에 대해 항상 동일 출력을 보장합니다.

```solidity
function check(int x) public pure returns (string memory) {
    // x는 함수 파라미터 (calldata에서 전달됨)
    // 상태변수는 읽을 수도, 쓸 수도 없음!
    if (x > 0) return "The number is positive";
    else if (x < 0) revert("The number is negative");
    return "The number is zero";
}
```

### view vs pure 비교

| 특성 | view | pure |
|------|------|------|
| 상태 읽기 | ✅ 가능 | ❌ 불가 |
| 상태 쓰기 | ❌ 불가 | ❌ 불가 |
| 가스비 (외부 호출) | 무료 | 무료 |
| 대표 용도 | getter 함수 | 계산, 검증 |
| 예시 | `get()` | `check()` |

### pure가 접근할 수 없는 것들

```solidity
function forbidden() public pure returns (uint) {
    // 아래 모두 컴파일 에러!
    return counter;                // ❌ 상태 변수 읽기
    return address(this).balance;  // ❌ 컨트랙트 잔액
    return block.timestamp;        // ❌ 블록 타임스탬프
    return block.number;           // ❌ 블록 번호
    return msg.sender;             // ❌ 호출자 주소
    return msg.value;              // ❌ 전송된 ETH
    return tx.gasprice;            // ❌ 가스 가격
}
```

### pure가 접근할 수 있는 것들

```solidity
function allowed(int x, int y) public pure returns (int) {
    int result = x + y;         // ✅ 함수 파라미터
    int temp = result * 2;      // ✅ 로컬 변수
    return helper(temp);        // ✅ 다른 pure 함수 호출
}

uint constant TAX_RATE = 10;    // 컴파일 타임 상수

function tax(uint amount) public pure returns (uint) {
    return amount * TAX_RATE / 100;  // ✅ constant 변수 (바이트코드에 내장)
}
```

> [!note] constant는 왜 pure에서 접근 가능한가?
> `constant`로 선언된 변수는 **컴파일 시점에 바이트코드에 직접 삽입**됩니다. storage에 저장되지 않으므로 `SLOAD`가 필요 없고, 따라서 pure 제약을 위반하지 않습니다.

### 컴파일러의 역할

`view`와 `pure`는 **컴파일러가 강제**하는 제약입니다. 선언과 실제 동작이 불일치하면 컴파일 에러가 발생합니다.

```solidity
// 컴파일 에러: 상태 변수를 수정하는데 pure로 선언함
function wrong() public pure {
    counter = 10;  // TypeError: Function declared as pure,
                   // but this expression modifies the state
}
```

---

## 5. revert — 비상 정지 버튼

> [!tip] 비유
> 놀이공원 롤러코스터의 **비상 정지 버튼**입니다. 뭔가 잘못되면:
> 1. **즉시 정지** — 실행 중단
> 2. **출발점으로 돌아감** — 상태 변경 모두 취소
> 3. **안내 방송** — 에러 메시지 전달
> 4. **남은 티켓 환불** — 미사용 가스 반환

> [!info] 정석
> `revert`는 현재 실행을 즉시 중단하고, 해당 트랜잭션에서 발생한 **모든 상태 변경을 롤백(원상복구)**합니다. 에러 메시지를 포함할 수 있으며, 사용하지 않은 가스는 호출자에게 반환됩니다.

```solidity
if (x < 0) {
    revert("The number is negative");  // 실행 중단 + 에러 메시지
}
```

### revert의 동작 원리

EVM은 트랜잭션 실행 중 상태 변경을 **임시로 기록**합니다. revert가 발생하면 이 임시 변경들이 모두 취소됩니다.

```
EVM 실행 흐름:

  시작 → SSTORE (변경1) → SSTORE (변경2) → REVERT 발생!
                                                ↓
                                         모든 변경 원상복구:
                                           변경1 ← 원래값으로
                                           변경2 ← 원래값으로
                                           남은 가스 ← 호출자에게 반환
                                           에러 메시지 ← 호출자에게 전달
```

> [!important] 가스비는 어떻게 되나?
> - revert **이전**까지 사용된 가스: **소모됨** (돌려받지 못함)
> - revert **이후** 남은 가스: **환불됨**
> - 기본 트랜잭션 비용 21,000 gas: **소모됨**
>
> 즉, revert가 발생해도 **완전 무료는 아닙니다.** 실패한 트랜잭션도 가스비가 듭니다.

### CheckNumber에서의 revert 활용

```solidity
function check(int x) public pure returns (string memory) {
    if (x > 0) return "The number is positive";
    else if (x < 0) revert("The number is negative");  // 음수면 에러!
    return "The number is zero";
}
```

여기서 음수 입력 시 `revert`를 사용하는 이유는, **음수는 유효하지 않은 입력**으로 간주하고 트랜잭션 자체를 실패시키기 위해서입니다. 단순히 에러 메시지를 반환하는 것이 아니라, **실행 자체를 취소**하는 강력한 방법입니다.

### require vs revert vs assert 비교

Solidity에는 실행을 중단하는 세 가지 방법이 있습니다.

| 특성 | `require` | `revert` | `assert` |
|------|-----------|----------|----------|
| **용도** | 입력/조건 검증 | 복잡한 에러 처리 | 내부 불변성 검사 |
| **에러 메시지** | 선택 (보통 있음) | 필수 | 불가 (Panic 코드) |
| **남은 가스 환불** | ✅ 환불 | ✅ 환불 | ❌ 모두 소모 (0.8.0 이후 환불) |
| **사용 시점** | 함수 시작부 | if/else 분기 | 절대 발생하면 안 되는 조건 |
| **EVM 옵코드** | `REVERT` | `REVERT` | `INVALID` (0.8.0 이전) / `REVERT` (이후) |

> [!example] 실전에서의 사용 패턴
> ```solidity
> // require: 간단한 조건 검사 (가장 일반적)
> require(msg.sender == owner, "Not owner");
> require(amount > 0, "Amount must be positive");
>
> // revert: 복잡한 분기 로직
> if (x < 0) {
>     revert("Negative number");
> } else if (x > 100) {
>     revert("Number too large");
> }
>
> // assert: 절대 실패하면 안 되는 내부 검증
> assert(totalSupply >= 0);  // 이게 실패하면 컨트랙트에 심각한 버그
> ```

> [!note] require와 revert는 사실 같은 것
> `require(condition, "message")`는 내부적으로 다음과 동일합니다:
> ```solidity
> if (!condition) {
>     revert("message");
> }
> ```
> 둘 다 `REVERT` 옵코드를 사용합니다. `require`는 단순한 조건 검사의 **문법 설탕**(syntactic sugar)입니다.

---

## 6. 함수 가시성 — public의 의미

> [!tip] 비유
> - `public` = **열린 가게**: 누구나 들어올 수 있고, 직원도 이용 가능
> - `private` = **사장 전용 금고**: 이 가게(컨트랙트) 안에서만 접근 가능
> - `internal` = **본사+지점 공유 문서**: 이 컨트랙트와 상속받은 자식 컨트랙트에서 접근 가능
> - `external` = **택배 수령 창구**: 외부에서만 호출 가능, 내부에서는 `this.함수명()`으로만 가능

> [!info] 정석
> Solidity의 함수 가시성(visibility)은 **누가 이 함수를 호출할 수 있는지**를 결정합니다.

| 가시성 | 외부 호출 | 내부 호출 | 상속된 컨트랙트 | 가스 효율 |
|--------|----------|----------|----------------|----------|
| `public` | ✅ | ✅ | ✅ | 보통 |
| `external` | ✅ | ❌ (this 필요) | ✅ | 약간 효율적 |
| `internal` | ❌ | ✅ | ✅ | 효율적 |
| `private` | ❌ | ✅ | ❌ | 효율적 |

### Lab 2에서의 public

```solidity
function count() public {          // 누구나 호출 가능
    counter = counter + 1;
}

function get() public view returns (uint) {  // 누구나 조회 가능
    return counter;
}
```

Counter의 모든 함수가 `public`인 이유: 누구나 카운터를 증가시키고 조회할 수 있어야 하기 때문입니다.

> [!note] public 상태 변수의 자동 getter
> ```solidity
> uint public counter;  // 자동으로 get() 함수가 생성됨
> ```
> `public`으로 선언된 상태 변수는 컴파일러가 자동으로 **getter 함수**를 생성합니다. Remix에서 `counter` 버튼이 초록색으로 나타나는 이유입니다.

---

## 7. returns와 string memory — 반환값의 원리

> [!tip] 비유
> - `returns (uint)` = 자판기의 **출력구 규격**: "이 자판기에서는 캔(uint)이 나옵니다"라고 미리 알려주는 것
> - `string memory` = **임시 메모지에 적은 문장**: 함수 실행 중에만 존재하고, 끝나면 사라짐

> [!info] 정석
> `returns`는 함수의 반환 타입을 선언합니다. `memory`는 데이터의 저장 위치를 지정하는 키워드로, 참조 타입(string, array, struct 등)에 필수입니다.

### EVM의 데이터 저장 위치

| 위치 | 수명 | 비용 | 용도 |
|------|------|------|------|
| `storage` | 영구 (블록체인에 저장) | 매우 비쌈 | 상태 변수 |
| `memory` | 함수 실행 중에만 존재 | 저렴 | 함수 내 임시 변수 |
| `calldata` | 함수 호출 데이터 | 가장 저렴 | external 함수의 파라미터 |
| `stack` | 연산 중에만 존재 | 무료 | 값 타입 (uint, int, bool 등) |

```solidity
function check(int x) public pure returns (string memory) {
    //              ↑ calldata        ↑ memory에 저장된 string 반환
    return "The number is positive";
    // 이 문자열은 memory에 생성되어 호출자에게 반환됨
}
```

> [!question] 왜 uint는 memory가 필요 없나?
> `uint`, `int`, `bool`, `address` 같은 **값 타입**은 크기가 고정(32바이트 이하)이므로 EVM **스택**에 직접 저장됩니다. 반면 `string`, `bytes`, 배열, 구조체 같은 **참조 타입**은 크기가 가변적이므로 저장 위치(`memory` 또는 `storage`)를 명시해야 합니다.

---

## 8. Lab 2 시뮬레이터의 동작 원리

Lab 2 시뮬레이터는 실제 EVM의 동작을 JavaScript로 재현하여, 트랜잭션 비용과 상태 변화를 시각적으로 보여줍니다.

> [!example] Counter 시뮬레이터 동작 흐름

```
[버튼 클릭: count()]
    ↓
JS: contractState.counter += 1     (SSTORE 흉내)
    ↓
JS: gasCost = 43000                 (사전 정의된 상수)
    ↓
JS: blockNumber += 1                 (새 블록 생성 흉내)
    ↓
UI: LED 디스플레이 롤링 애니메이션   (값 변화 시각화)
UI: 가스비 막대그래프에 바 추가       (비용 시각화)
UI: 콘솔에 트랜잭션 로그 출력         (실행 결과)
```

> [!example] CheckNumber revert 시뮬레이터 동작 흐름

```
[입력: -5 → check(-5)]
    ↓
JS: if (x < 0) → revert 감지
    ↓
UI: 화면 shake 애니메이션             (트랜잭션 실패 시각화)
UI: 빨간 에러 박스 표시                (revert 메시지)
UI: 콘솔에 "Transaction reverted"     (실패 로그)
UI: "남은 가스 환불됨" 표시
```

### 시뮬레이터 vs 실제 EVM 비교

| 항목 | 시뮬레이터 | 실제 EVM |
|------|-----------|----------|
| 상태 저장 | JS 변수 (메모리) | 블록체인 (영구) |
| 가스비 | 사전 정의 상수 | 옵코드별 정밀 계산 |
| 블록 생성 | 즉시 (카운터 증가) | ~12초 (이더리움 메인넷) |
| revert | 조건문 분기 | EVM 옵코드 실행 |
| 네트워크 | 없음 (로컬) | 전 세계 노드 합의 |

---

## 9. 전체 흐름 정리 — Counter 컨트랙트 생명주기

```
[1. 배포]
  개발자 → 배포 트랜잭션 전송 → constructor() 실행 → counter = 0
                                                        ↓
                                                  블록체인에 저장

[2. count() 호출]
  사용자 → 트랜잭션 전송 → EVM: SLOAD + ADD + SSTORE → counter = 1
                              ↓                           ↓
                        가스비 ~43,000 gas            블록체인 업데이트
                              ↓
                        모든 노드에 전파

[3. get() 호출]
  사용자 → eth_call (로컬) → EVM: SLOAD → return 1
                              ↓
                        가스비 0 (무료)
                        트랜잭션 없음
                        블록체인 변경 없음
```

---

## 핵심 요약

> [!summary] Lab 2에서 배운 것
>
> | 개념 | 핵심 | Counter에서 | CheckNumber에서 |
> |------|------|------------|----------------|
> | constructor | 배포 시 1회 실행 | `counter = 0` 초기화 | — |
> | uint vs int | 부호 유무 | `uint` (음수 불필요) | `int` (음수 판별 필요) |
> | 상태 변경 함수 | 트랜잭션 + 가스비 | `count()` 🟠 | — |
> | view 함수 | 읽기만, 무료 | `get()` 🟢 | — |
> | pure 함수 | 상태 접근 불가, 무료 | — | `check()` 🟢 |
> | revert | 실행 중단 + 롤백 | — | 음수 입력 시 |
> | public | 누구나 호출 가능 | 모든 함수 | 모든 함수 |
> | returns + memory | 반환 타입 + 저장 위치 | `returns (uint)` | `returns (string memory)` |

---

## 참고 링크

- 이전 실습: [[week5-concepts-lab1|Lab 1: HelloWorld & HelloNumber]]
- 다음 실습: [[week5-concepts-lab3|Lab 3: Faucet]]
- 실습 시뮬레이터: [[week5-lab-counter|Lab 2 시뮬레이터 (HTML)]]
- Solidity 공식 문서: [Types](https://docs.soliditylang.org/en/latest/types.html) | [Control Structures](https://docs.soliditylang.org/en/latest/control-structures.html)
