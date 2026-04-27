# Lab 3: Faucet -- 개념과 원리

Faucet은 Lab 1, 2의 모든 개념을 종합하고 새로운 고급 개념을 추가한 종합 컨트랙트입니다.

---

## 1. Faucet이란? -- 전체 그림

> [!tip] 비유
> **공원의 무료 음수대**입니다.
> - 누구나 와서 물(ETH)을 마실 수 있음
> - 한 번에 한 컵(0.1 ETH)만 가능
> - 한 사람이 독점하지 못하도록 1일 1회 제한
> - 관리자(owner)만 물탱크를 채우거나 비울 수 있음
> - 음수대(컨트랙트)는 공원(블록체인)에 영구적으로 설치됨

> [!info] 정석
> Faucet은 **테스트넷에서 소량의 ETH를 무료 배포**하는 스마트 컨트랙트입니다.
> 실제 이더리움 메인넷이 아닌 Sepolia, Goerli 등의 테스트 네트워크에서 개발자들이 테스트용 ETH를 얻기 위해 사용합니다.

**Faucet.sol 전체 코드:**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Faucet {
    address payable public owner;
    uint256 public constant WITHDRAWAL_AMOUNT = 0.1 ether;
    uint256 public constant LOCK_TIME = 1 days;
    mapping(address => uint256) public lastWithdrawalTime;
    event Withdrawal(address indexed user, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function.");
        _;
    }

    constructor() {
        owner = payable(msg.sender);
    }

    function withdraw() external {
        require(
            block.timestamp >= lastWithdrawalTime[msg.sender] + LOCK_TIME,
            "You must wait 24 hours between withdrawals."
        );
        require(
            address(this).balance >= WITHDRAWAL_AMOUNT,
            "Insufficient balance in the faucet."
        );
        lastWithdrawalTime[msg.sender] = block.timestamp;
        payable(msg.sender).transfer(WITHDRAWAL_AMOUNT);
        emit Withdrawal(msg.sender, WITHDRAWAL_AMOUNT);
    }

    function deposit() external payable onlyOwner {}

    function withdrawAll() external onlyOwner {
        owner.transfer(address(this).balance);
    }

    receive() external payable {}
}
```

---

## 2. address payable -- ETH를 받을 수 있는 주소

> [!tip] 비유
> - 일반 `address` = **신분증**: 신원을 증명하지만 돈을 받을 수 없음
> - `address payable` = **은행 계좌**: 신원도 증명하고 돈(ETH)도 받을 수 있음

> [!info] 정석
> `address`는 20바이트(160비트) 이더리움 주소를 저장하는 타입입니다.
> `address payable`은 추가로 `.transfer()`와 `.send()` 메서드를 사용할 수 있어 ETH 수신이 가능합니다.

### ETH 전송 방법 3가지 비교

| 방법 | 가스 한도 | 실패 시 | 권장 |
|------|----------|---------|------|
| `transfer(amount)` | 2300 gas 고정 | 자동 revert | 간단한 전송 |
| `send(amount)` | 2300 gas 고정 | false 반환 | 비권장 |
| `call{value: amount}("")` | 무제한 | false 반환 | 최신 권장 |

### 왜 transfer()의 가스 한도가 2300인가?

- 수신자가 복잡한 코드를 실행하는 것을 방지 (재진입 공격 차단)
- 2300 gas로는 이벤트 로깅 정도만 가능
- 하지만 EIP-1884 이후 가스비 변경으로 2300 gas가 부족한 경우 발생
- 따라서 최신 베스트 프랙티스는 `call`을 사용 (하지만 교육용에서는 `transfer`가 이해하기 쉬움)

### 주소 생성 원리

```
개인키 (32바이트 랜덤)
    | 타원곡선 암호 (secp256k1)
    v
공개키 (64바이트)
    | keccak256 해시
    v
해시값 (32바이트)
    | 마지막 20바이트 추출
    v
이더리움 주소 (20바이트, 예: 0x5B38Da6a...)
```

> [!example] 코드에서의 사용
> ```solidity
> address payable public owner;
> // owner에게 ETH를 보낼 수 있음
> owner.transfer(address(this).balance);
>
> // 일반 address는 payable로 변환해야 전송 가능
> payable(msg.sender).transfer(WITHDRAWAL_AMOUNT);
> ```

---

## 3. constant -- 불변의 상수

> [!tip] 비유
> 건물의 **기둥**과 같습니다. 건물(컨트랙트)이 완성(배포)되면 기둥(constant)은 절대 바꿀 수 없습니다. 벽지(일반 변수)는 바꿀 수 있지만, 기둥을 바꾸려면 건물을 다시 지어야(재배포) 합니다.

> [!info] 정석
> `constant`는 **컴파일 시점에 값이 확정**되고 변경 불가능한 상태 변수입니다.
>
> ```solidity
> uint256 public constant WITHDRAWAL_AMOUNT = 0.1 ether;
> uint256 public constant LOCK_TIME = 1 days;
> ```

### 가스 절약 원리

```
일반 변수: SLOAD(슬롯 번호) -> storage에서 읽기 -> 2,100 gas
constant:  PUSH32(값)       -> 바이트코드에서 직접 -> 3 gas
```

- 일반 변수: storage 슬롯에 저장되어 SLOAD (2,100 gas)로 읽기
- constant: 바이트코드에 직접 임베딩되어 PUSH 옵코드 (3 gas)로 읽기
- **약 700배 저렴!**

> [!note] constant vs immutable
> | 구분 | constant | immutable |
> |------|----------|-----------|
> | 값 확정 시점 | 컴파일 시 | 배포(constructor) 시 |
> | 저장 위치 | 바이트코드 | 바이트코드 |
> | 변경 가능 | 불가 | 불가 |
> | 사용 예 | `0.1 ether`, `1 days` | `msg.sender` (배포자 주소) |

### ether 단위와 시간 단위

```solidity
// ether 단위
1 ether     = 1,000,000,000,000,000,000 wei (10^18)
1 gwei      = 1,000,000,000 wei (10^9)
0.1 ether   = 100,000,000,000,000,000 wei

// Solidity에서의 단위 리터럴:
1 ether   // 컴파일러가 10^18으로 변환
1 gwei    // 컴파일러가 10^9로 변환
1 days    // 컴파일러가 86400으로 변환 (60*60*24)
1 hours   // 3600
1 minutes // 60
```

> [!warning] 주의
> 단위 리터럴은 **Solidity 컴파일러의 문법적 편의**입니다. EVM 레벨에서는 모든 것이 정수(wei, 초)로 처리됩니다. `0.1 ether`는 컴파일 시 `100000000000000000`이라는 정수로 변환됩니다.

---

## 4. mapping -- 키-값 저장소

> [!tip] 비유
> **도서관의 대출 기록부**입니다.
> - 회원증 번호(address)로 찾으면 마지막 대출일(uint256)이 나옴
> - 등록되지 않은 번호로 찾으면 "없음"(기본값 0)이 나옴
> - 전체 회원 목록을 한번에 볼 수 없음 (순회 불가)

> [!info] 정석
> ```solidity
> mapping(address => uint256) public lastWithdrawalTime;
> ```
> mapping은 **해시 테이블** 기반의 키-값 저장소입니다. 모든 가능한 키에 대해 값이 존재하며(기본값), 키의 목록을 순회할 수 없습니다.

### 저장 원리

mapping의 값은 storage의 특정 위치에 저장됩니다. 위치는 키와 슬롯 번호의 해시로 결정됩니다.

```
storage 위치 = keccak256(key . slot_number)

예: lastWithdrawalTime이 슬롯 3에 선언되었다면:
  lastWithdrawalTime[0xABC...] 의 저장 위치
    = keccak256(0xABC... . 3)
    = 0x7f8b3... (어딘가의 슬롯)
```

> [!question] 왜 이런 방식을 사용하는가?
> 2^256 개의 슬롯이 있는 storage에서 해시를 통해 **충돌 없이** 값을 분산 저장합니다. 연속된 슬롯을 사용하는 배열과 달리, mapping은 어떤 키든 O(1)로 접근하면서도 다른 변수의 슬롯과 충돌하지 않습니다.

### mapping의 특성

| 특성 | 설명 |
|------|------|
| 기본값 | 존재하지 않는 키 -> 타입의 기본값 (uint: 0, bool: false, address: 0x0) |
| 순회 불가 | 전체 키 목록을 얻을 수 없음 (별도 배열 필요) |
| 삭제 | `delete mapping[key]` -> 기본값으로 리셋 |
| 중첩 가능 | `mapping(address => mapping(address => uint))` |
| 길이 없음 | `.length` 속성 없음 |

> [!example] Faucet에서의 mapping 활용
> ```solidity
> // 처음 호출하는 사용자: lastWithdrawalTime[msg.sender] == 0
> // 0 + 86400 = 86400
> // block.timestamp (예: 1700000000) >= 86400 이므로 통과!
> require(
>     block.timestamp >= lastWithdrawalTime[msg.sender] + LOCK_TIME,
>     "You must wait 24 hours between withdrawals."
> );
> ```
> 처음 출금하는 사용자는 `lastWithdrawalTime`이 0이므로 항상 조건을 통과합니다. 이것이 mapping의 기본값(0)을 활용한 설계입니다.

---

## 5. event & emit -- 블록체인 영수증

> [!tip] 비유
> **카페 주문 영수증**과 같습니다.
> - 주문(트랜잭션)이 완료되면 영수증(event)이 발행됨
> - 영수증에는 "누가, 무엇을, 언제" 기록됨
> - 영수증은 서랍(로그)에 보관됨 -> 나중에 찾아볼 수 있음
> - `indexed`는 영수증의 **형광펜 표시** -> 특정 항목으로 빠르게 검색 가능

> [!info] 정석
> ```solidity
> // 이벤트 선언 (컨트랙트 레벨)
> event Withdrawal(address indexed user, uint256 amount);
>
> // 이벤트 발생 (함수 내부)
> emit Withdrawal(msg.sender, WITHDRAWAL_AMOUNT);
> ```
> 이벤트는 EVM의 LOG 옵코드를 통해 **트랜잭션 영수증(receipt)의 로그 영역**에 기록됩니다. storage에 저장되지 않으므로 컨트랙트에서 다시 읽을 수 없지만, 외부(DApp, 블록 탐색기)에서 효율적으로 조회할 수 있습니다.

### 이벤트의 동작 원리

```
emit Withdrawal(msg.sender, WITHDRAWAL_AMOUNT)
    |
    v
EVM: LOG2 옵코드 실행 (indexed 파라미터 1개 + 시그니처 = topic 2개)
    |
    v
트랜잭션 영수증(receipt)의 logs 배열에 추가:
{
  "address": "0xFaucet컨트랙트주소",
  "topics": [
    "0xkeccak256('Withdrawal(address,uint256)')",  // topic[0]: 이벤트 시그니처
    "0x사용자주소"                                  // topic[1]: indexed user
  ],
  "data": "0x000...016345785d8a0000"               // 0.1 ether in wei (non-indexed)
}
```

### indexed vs non-indexed

| 구분 | 저장 위치 | 검색 | 비용 | 최대 개수 |
|------|----------|------|------|----------|
| indexed | topics 배열 | 필터링 가능 (빠름) | 약간 더 비쌈 | 3개 |
| non-indexed | data 영역 | 필터링 불가 | 약간 저렴 | 제한 없음 |

### LOG 옵코드 종류

| 옵코드 | topic 수 | 사용 상황 |
|--------|----------|----------|
| LOG0 | 0 | anonymous 이벤트 |
| LOG1 | 1 | indexed 파라미터 0개 (시그니처만) |
| LOG2 | 2 | indexed 파라미터 1개 |
| LOG3 | 3 | indexed 파라미터 2개 |
| LOG4 | 4 | indexed 파라미터 3개 (최대) |

> [!question] 왜 이벤트가 중요한가?
> - 블록체인 데이터를 **효율적으로 모니터링**하는 유일한 방법
> - storage 읽기보다 **5~10배 저렴** (가스비)
> - DApp 프론트엔드가 실시간으로 이벤트를 수신하여 UI 업데이트
> - 블록 탐색기(Etherscan)에서 이벤트 로그를 확인 가능
> - 과거 기록을 검색할 수 있어 **오프체인 데이터베이스의 역할**을 부분적으로 대체

---

## 6. modifier -- 함수의 보안 검문소

> [!tip] 비유
> **공항 보안 검색대**입니다.
> - 비행기(함수)를 타기 전에 보안 검색(modifier)을 통과해야 함
> - 금속탐지기(require)에 걸리면 탑승 거부(revert)
> - 통과하면 비행기에 탑승(`_;` = 함수 본체 실행)
> - 여러 검색대를 연속으로 통과할 수도 있음 (modifier 체이닝)

> [!info] 정석
> ```solidity
> modifier onlyOwner() {
>     require(msg.sender == owner, "Only the owner can call this function.");
>     _;  // 여기에 원래 함수의 코드가 삽입됨
> }
>
> function deposit() external payable onlyOwner {}
> ```
> modifier는 함수의 **전처리/후처리 로직을 재사용 가능하게 분리**한 것입니다. `_;`는 원래 함수의 본체가 삽입되는 위치를 나타내는 플레이스홀더입니다.

### `_;` (언더스코어)의 동작 원리

```solidity
// deposit()이 호출되면 실제로는 이렇게 실행됨:

function deposit() external payable {
    // --- modifier onlyOwner 시작 ---
    require(msg.sender == owner, "Only the owner...");
    // --- _; 위치 = 원래 함수 본체 ---
    {
        // deposit()의 원래 내용 (이 경우 비어있음)
        // payable이므로 ETH가 자동으로 컨트랙트에 입금됨
    }
    // --- modifier onlyOwner 끝 ---
}
```

### modifier 실행 순서 (체이닝 시)

```solidity
modifier A() { require(...); _; }
modifier B() { require(...); _; }

function foo() public A B { ... }
// 실행 순서: A의 require -> B의 require -> foo 본체
```

> [!tip] 비유 -- 체이닝
> 여러 modifier를 적용하는 것은 **러시안 인형(마트료시카)**과 같습니다.
> A가 가장 바깥, B가 그 안, 함수 본체가 가장 안쪽:
> ```
> A { require_A; B { require_B; 함수본체; } }
> ```

> [!note] modifier의 `_;` 위치에 따른 차이
> ```solidity
> // 전처리: 함수 실행 전에 검증
> modifier beforeCheck() {
>     require(...);  // 먼저 검증
>     _;             // 그 다음 함수 실행
> }
>
> // 후처리: 함수 실행 후에 검증
> modifier afterCheck() {
>     _;             // 먼저 함수 실행
>     require(...);  // 그 다음 검증
> }
> ```

---

## 7. msg -- 전역 변수의 원리

> [!tip] 비유
> **전화 발신자 정보**와 같습니다.
> - `msg.sender` = 전화를 건 사람의 번호 (누가 호출했는가)
> - `msg.value` = 동봉된 현금 (얼마를 보냈는가)
> - `msg.data` = 전화 내용 (어떤 함수를 어떤 인자로 호출했는가)

> [!info] 정석
> `msg`는 EVM이 자동으로 제공하는 **읽기 전용 전역 변수**입니다. 모든 외부 호출마다 새로운 msg 컨텍스트가 생성됩니다.

### msg의 주요 속성

| 속성 | 타입 | 설명 |
|------|------|------|
| `msg.sender` | address | 현재 함수를 호출한 주소 |
| `msg.value` | uint256 | 함께 전송된 ETH (wei 단위) |
| `msg.data` | bytes | 전체 calldata (함수 선택자 + 인자) |
| `msg.sig` | bytes4 | 함수 선택자 (calldata의 첫 4바이트) |

### msg.sender의 변화 원리

```
Alice가 직접 호출:
  Alice -> Faucet.withdraw()
  msg.sender = Alice의 주소

Alice가 중간 컨트랙트를 통해 호출:
  Alice -> ContractA.call() -> Faucet.withdraw()
  Faucet에서의 msg.sender = ContractA의 주소 (Alice가 아님!)
```

> [!warning] msg.sender vs tx.origin
> | 구분 | msg.sender | tx.origin |
> |------|-----------|-----------|
> | 의미 | 직접 호출자 | 최초 트랜잭션 발신자 |
> | 타입 | 컨트랙트일 수 있음 | 항상 EOA |
> | 보안 | 안전 | 피싱 공격에 취약 |
> | 권장 | **항상 사용** | 사용하지 말 것 |
>
> **피싱 시나리오:** 악성 컨트랙트가 피해자를 유인해 함수를 호출하게 하면, `tx.origin`은 피해자 주소이므로 권한 검사를 우회할 수 있습니다.

### msg.data와 함수 선택자

```
withdraw() 호출 시 msg.data:
  0xd0e30db0
  ^^^^^^^^^^ = keccak256("withdraw()")의 첫 4바이트 = 함수 선택자

deposit() 호출 시 msg.data:
  0x3ccfd60b  + (인자가 있으면 ABI 인코딩된 데이터)
```

---

## 8. block -- 블록 정보

> [!tip] 비유
> **우체국 소인**과 같습니다. 편지(트랜잭션)를 보내면 우체국(블록)이 자동으로 날짜와 시간을 찍어줍니다. 이 소인은 위조할 수 없고, 순서를 증명합니다.

> [!info] 정석
> `block`은 현재 블록의 메타데이터를 제공하는 전역 변수입니다.

### block의 주요 속성

| 속성 | 타입 | 설명 |
|------|------|------|
| `block.timestamp` | uint256 | Unix 타임스탬프 (1970년 1월 1일부터 초 단위) |
| `block.number` | uint256 | 현재 블록 번호 |
| `block.chainid` | uint256 | 체인 ID (1=메인넷, 11155111=Sepolia) |
| `block.prevrandao` | uint256 | 이전 블록의 RANDAO 값 (의사 난수) |
| `block.basefee` | uint256 | 현재 블록의 기본 가스비 |

### Faucet에서 시간 검증의 원리

```solidity
require(
    block.timestamp >= lastWithdrawalTime[msg.sender] + LOCK_TIME,
    "You must wait 24 hours between withdrawals."
);
```

```
시간선:
-------------------------------------------------------------->
     ^ 마지막 출금                        ^ 현재
     | (lastWithdrawalTime)               | (block.timestamp)
     |                                    |
     |<------ LOCK_TIME (86400초) ------->|
     |            = 24시간                |
     |                                    |
     +-- 이 구간에서 출금하면 revert ------+
```

> [!warning] block.timestamp의 한계
> - 마이너/검증자가 약간의 조작 가능 (약 +-15초)
> - 초 단위 정밀한 시간 비교에는 부적합
> - 일/시간 단위 비교에는 충분히 안전 (Faucet 사용 사례)
> - Merge 이후(PoS) 블록 간격이 정확히 12초로 고정됨

---

## 9. external 가시성 -- 외부 전용 함수

> [!tip] 비유
> **배달 전용 음식점**과 같습니다. 매장(컨트랙트 내부)에서는 먹을 수 없고, 오직 배달(외부 호출)로만 주문 가능합니다. 이렇게 하면 배달 시스템이 더 효율적(가스비 절약)입니다.

> [!info] 정석
> `external`은 외부에서만 호출 가능한 가시성 수정자입니다. 컨트랙트 내부에서 `this.함수명()`으로만 호출할 수 있고, 직접 호출은 불가능합니다.

### 4가지 가시성 비교

| 가시성 | 외부 호출 | 내부 호출 | 상속 접근 | 주요 용도 |
|--------|----------|----------|----------|----------|
| `external` | O | X (this.f() 가능) | X | 외부 인터페이스 |
| `public` | O | O | O | 범용 (기본값) |
| `internal` | X | O | O | 내부 로직, 상속 |
| `private` | X | O | X | 해당 컨트랙트 전용 |

### external vs public 가스비 차이

```
external 함수:
  calldata에서 직접 파라미터를 읽음 (CALLDATALOAD)
  -> 메모리 복사 없음 -> 가스 절약

public 함수:
  calldata -> memory로 복사 후 사용 (CALLDATACOPY + MLOAD)
  -> 추가 가스 소모 (특히 큰 배열/문자열에서 차이 큼)
```

> [!note] Faucet에서의 선택
> `withdraw()`, `deposit()`, `withdrawAll()` 모두 `external`입니다. 컨트랙트 내부에서 이 함수들을 호출할 필요가 없고, 외부 사용자만 호출하므로 `external`이 가장 적절합니다.

---

## 10. receive() -- ETH 직접 수신

> [!tip] 비유
> 집 현관의 **우편함**과 같습니다. 택배기사(외부 계정)가 문을 두드리지 않고(함수 호출 없이) 우편함(receive)에 소포(ETH)를 넣어두면, 집주인(컨트랙트)이 자동으로 받습니다.

> [!info] 정석
> ```solidity
> receive() external payable {}
> ```
> `receive()`는 컨트랙트가 **순수 ETH 전송**(calldata 없는 트랜잭션)을 받았을 때 자동 호출되는 특수 함수입니다. 함수 이름, 인자, 반환값이 없습니다.

### ETH 수신 흐름

```
누군가 컨트랙트에 ETH를 전송
    |
    v
msg.data가 비어있는가?
  |-- YES -> receive() 존재?
  |           |-- YES: receive() 실행
  |           +-- NO:  fallback() 실행 (없으면 revert)
  |
  +-- NO  -> 해당 함수 선택자와 매칭되는 함수 존재?
              |-- YES: 해당 함수 실행
              +-- NO:  fallback() 실행 (없으면 revert)
```

### receive() vs fallback()

| 구분 | receive() | fallback() |
|------|----------|------------|
| 호출 조건 | msg.data가 비어있을 때 | 매칭되는 함수가 없을 때 |
| payable | 반드시 payable | 선택적 payable |
| 용도 | 순수 ETH 수신 | 존재하지 않는 함수 호출 대응 |
| 가스 제한 | transfer/send로 호출 시 2300 gas | 동일 |

> [!question] Faucet에서 receive()가 필요한 이유
> `deposit()`은 owner만 사용할 수 있습니다. 하지만 `receive()`가 있으면 **누구나** 단순 ETH 전송으로 Faucet에 기부할 수 있습니다. 이는 커뮤니티 기반 Faucet 운영을 가능하게 합니다.

---

## 11. Faucet 보안 패턴 분석

> [!tip] 비유
> Faucet은 **무인 판매점**의 보안 시스템과 같습니다:
> 1. 직원 전용 출입구 (onlyOwner) -- 금고(전액 회수)는 사장만 접근
> 2. 1인 1회 제한 (LOCK_TIME) -- 한 사람이 하루에 한 번만 구매
> 3. 잔액 확인 (balance check) -- 재고 부족 시 판매 거부
> 4. 정량 판매 (WITHDRAWAL_AMOUNT) -- 한 번에 정해진 양만 판매

> [!info] 정석 -- Checks-Effects-Interactions 패턴 (CEI)

### CEI 패턴이란?

스마트 컨트랙트 보안의 가장 기본적이고 중요한 설계 패턴입니다.

```solidity
function withdraw() external {
    // 1. Checks (검증) -- 모든 require를 먼저
    require(block.timestamp >= lastWithdrawalTime[msg.sender] + LOCK_TIME, "...");
    require(address(this).balance >= WITHDRAWAL_AMOUNT, "...");

    // 2. Effects (상태 변경) -- 외부 호출 전에 상태 업데이트
    lastWithdrawalTime[msg.sender] = block.timestamp;  // <-- 이 순서가 중요!

    // 3. Interactions (외부 호출) -- 가장 마지막에
    payable(msg.sender).transfer(WITHDRAWAL_AMOUNT);
    emit Withdrawal(msg.sender, WITHDRAWAL_AMOUNT);
}
```

> [!warning] 왜 이 순서가 중요한가? -- 재진입 공격
> 만약 `transfer`를 먼저 하고 `lastWithdrawalTime`을 나중에 업데이트하면:
>
> ```
> 공격자 -> withdraw() 호출
>   -> 컨트랙트가 공격자에게 0.1 ETH 전송
>     -> 공격자의 receive()가 다시 withdraw() 호출
>       -> lastWithdrawalTime이 아직 0이므로 검증 통과!
>         -> 또 0.1 ETH 전송
>           -> ... (잔액이 빌 때까지 반복)
> ```
>
> Faucet은 `transfer()`의 2300 gas 제한으로 재진입이 어렵지만, CEI 패턴을 따르는 것이 올바른 습관입니다.

### 보안 체크리스트

| 공격 벡터 | Faucet의 방어 수단 |
|----------|-------------------|
| 재진입 공격 | CEI 패턴 + transfer 2300 gas 제한 |
| 고갈 공격 (Drain) | LOCK_TIME으로 1일 1회 제한 |
| 무한 출금 | WITHDRAWAL_AMOUNT로 고정 금액만 허용 |
| 권한 탈취 | onlyOwner modifier로 관리자 함수 보호 |
| 오버플로우 | Solidity 0.8+ 자동 오버플로우 검사 |

---

## 12. Lab 3 시뮬레이터의 동작 원리

> [!example] Faucet 시뮬레이터 엔진 구조

### 가상 블록체인 상태

```javascript
// 가상 블록체인
blockchain = {
  blockNumber: 1,
  timestamp: Date.now() / 1000,  // Unix 타임스탬프
  accounts: [
    { address: "0x5B38...", balance: 100, label: "Owner" },
    { address: "0x4B20...", balance: 100, label: "Alice" },
    // ...
  ]
}

// 가상 컨트랙트 storage
contract = {
  owner: null,
  WITHDRAWAL_AMOUNT: 0.1,
  LOCK_TIME: 86400,
  lastWithdrawalTime: {},  // mapping 시뮬레이션
  balance: 0               // address(this).balance
}
```

### withdraw() 시뮬레이션 흐름

```
[withdraw 버튼 클릭]
    |
    v
1. msg.sender = blockchain.accounts[currentIndex].address
2. require 검증:
   - blockchain.timestamp >= contract.lastWithdrawalTime[sender] + 86400?
   - contract.balance >= 0.1?
3. 통과 시:
   - contract.lastWithdrawalTime[sender] = blockchain.timestamp
   - contract.balance -= 0.1
   - blockchain.accounts[currentIndex].balance += 0.1
   - 탱크 수위 애니메이션 업데이트
   - 이벤트 로그 추가
4. 실패 시:
   - shake 애니메이션 + 에러 메시지
```

### 탱크 시각화의 물리적 매핑

```
수위(%) = (contract.balance / maxBalance) * 100

CSS: .water { height: 수위% }
애니메이션: CSS transition으로 부드러운 수위 변화
기포: CSS @keyframes로 랜덤 위치에서 위로 올라가는 효과
파도: CSS wave 애니메이션 (SVG 또는 gradient)
```

---

## 13. 전체 개념 연결 -- Faucet의 실행 흐름

> [!info] withdraw() 한 번 호출 시 일어나는 모든 일

```
[사용자가 withdraw() 호출]
    |
    v
1. EVM이 msg 컨텍스트 생성
   msg.sender = 호출자 주소
   msg.value = 0 (payable이 아니므로)
    |
    v
2. Checks: require 검증 2개
   block.timestamp >= lastWithdrawalTime[msg.sender] + 86400?
   address(this).balance >= 0.1 ether?
    |
    v
3. Effects: storage 상태 변경
   lastWithdrawalTime[msg.sender] = block.timestamp
   SSTORE 실행 (20,000 gas 또는 5,000 gas)
    |
    v
4. Interactions: ETH 전송
   payable(msg.sender).transfer(0.1 ether)
   CALL 옵코드 실행, 2300 gas 전달
    |
    v
5. Event 발생
   emit Withdrawal(msg.sender, 0.1 ether)
   LOG2 옵코드 실행, 트랜잭션 영수증에 기록
    |
    v
6. 트랜잭션 완료
   사용된 gas = 실제 소모량
   나머지 gas = 호출자에게 환불
```

---

## 참고 링크

- 이전: [[week5-concepts-lab1|Lab 1: HelloWorld]] / [[week5-concepts-lab2|Lab 2: Counter]]
