# 🔬 Lab 1: HelloWorld & HelloNumber — 개념과 원리

## 목차

1. [[#1. SPDX 라이선스 식별자|SPDX 라이선스 식별자]]
2. [[#2. pragma solidity — 컴파일러 버전 지정|pragma solidity]]
3. [[#3. contract 키워드 — 스마트 컨트랙트 선언|contract 키워드]]
4. [[#4. 상태 변수 (State Variables)|상태 변수]]
5. [[#5. 가시성 수정자 (Visibility Modifiers)|가시성 수정자]]
6. [[#6. 함수 상태 수정자 — view와 pure|함수 상태 수정자]]
7. [[#7. 함수 선언과 매개변수|함수 선언과 매개변수]]
8. [[#8. int 타입 — 정수 표현|int 타입]]
9. [[#9. string 타입 — 문자열 표현|string 타입]]
10. [[#10. Lab 1 전체 코드 분석|Lab 1 전체 코드 분석]]
11. [[#11. Lab 1 시뮬레이터의 동작 원리|시뮬레이터 동작 원리]]
12. [[#참고 링크|참고 링크]]

---

## 1. SPDX 라이선스 식별자

> [!tip] 비유
> 책의 맨 앞장에 적힌 **저작권 표시**와 같습니다. "이 책은 누구나 복사할 수 있지만 원저자 이름은 남겨주세요(MIT)"처럼, 코드의 사용 범위를 한 줄로 선언합니다. 라이선스가 없는 코드는 마치 주인 없는 물건 — 가져가도 되는지, 수정해도 되는지 알 수 없어 법적 분쟁의 씨앗이 됩니다.

> [!info] 정석
> SPDX(Software Package Data Exchange)는 소프트웨어 라이선스를 **표준화된 식별자**로 선언하는 국제 체계입니다. Linux Foundation이 관리하며, 수백 가지 라이선스를 짧은 코드로 표현합니다.
>
> - Solidity **0.6.8**부터 권장 (없으면 컴파일러 경고)
> - `// SPDX-License-Identifier: MIT` 형태로 **파일 최상단**에 작성
> - 주석(`//`)으로 작성하므로 컴파일된 바이트코드에는 포함되지 않음

```solidity
// SPDX-License-Identifier: MIT
```

**주요 라이선스 비교:**

| 라이선스 | 성격 | 의미 | 사용 사례 |
|---------|------|------|----------|
| `MIT` | 허용적 (Permissive) | 거의 제한 없이 사용·수정·배포 가능 | OpenZeppelin, 대부분의 DeFi |
| `GPL-3.0` | 카피레프트 | 파생 코드도 동일 라이선스 적용 의무 | Uniswap V3 |
| `Apache-2.0` | 허용적 + 특허 보호 | MIT와 유사하나 특허 사용 허가 명시 | 기업용 프로젝트 |
| `UNLICENSED` | 비공개 | 소스 공개하지 않음 (사용 권한 없음) | 비공개 상업 컨트랙트 |

> [!warning] UNLICENSED vs Unlicense
> - `UNLICENSED`: "라이선스 **없음**" — 다른 사람이 사용할 수 없음 (비공개)
> - `Unlicense`: "제한 **없음**" — 퍼블릭 도메인, 누구나 마음대로 사용 가능
>
> 철자 하나 차이지만 의미가 **정반대**입니다. 주의하세요.

**동작 원리:**
- 컴파일러(`solc`)가 소스코드 첫 줄에서 `SPDX-License-Identifier` 주석을 탐색
- 없으면 **Warning** 출력 (에러는 아니므로 컴파일 자체는 성공)
- 블록체인에 배포된 **바이트코드에는 포함되지 않음** — 컨트랙트 메타데이터(JSON)에만 기록
- Etherscan 등 블록체인 탐색기에서 소스코드 검증 시 라이선스 정보를 표시하는 데 활용

---

## 2. pragma solidity — 컴파일러 버전 지정

> [!tip] 비유
> 요리 레시피에 "이 레시피는 **200도 이상의 오븐**에서만 작동합니다"라고 적어놓는 것과 같습니다. 오래된 오븐(구 버전 컴파일러)에서는 기능이 부족해 요리가 실패하고, 너무 새로운 오븐(호환 안 되는 미래 버전)에서는 동작 방식이 달라져 맛이 변할 수 있습니다. 그래서 "이 범위의 오븐만 사용하세요"라고 **명시적으로 제한**합니다.

> [!info] 정석
> `pragma`는 "컴파일러에게 보내는 지시문"이라는 뜻의 라틴어 *pragmaticus*에서 유래했습니다. C/C++의 `#pragma`와 동일한 개념으로, **컴파일 과정에 대한 메타 정보**를 제공합니다.
>
> ```solidity
> // Lab 1에서 사용하는 형태
> pragma solidity ^0.8.26;
> ```

**버전 지정 문법 3가지:**

```solidity
pragma solidity ^0.8.26;          // 캐럿: 0.8.26 이상 ~ 0.9.0 미만
pragma solidity 0.8.26;           // 고정: 정확히 0.8.26만 허용
pragma solidity >=0.8.0 <0.9.0;   // 범위: 직접 상한·하한 지정
```

**SemVer(유의적 버전 관리) 도해:**

```
0  .  8  .  26
│     │     │
│     │     └─ 패치(PATCH): 버그 수정만 (하위 호환됨)
│     └────── 마이너(MINOR): 기능 추가/변경 (호환이 깨질 수 있음)
└──────────── 메이저(MAJOR): 대규모 변경 (호환 보장 안 됨)
```

**캐럿(`^`) 연산자의 동작 원리:**

| pragma 선언 | 허용 범위 | 설명 |
|------------|----------|------|
| `^0.8.26` | 0.8.26 ~ 0.8.x | 마이너가 같은 범위 내 최신 패치 허용 |
| `^0.8.0` | 0.8.0 ~ 0.8.x | 0.8 계열 전체 허용 |
| `^1.0.0` | 1.0.0 ~ 1.x.x | 메이저 1 전체 허용 (메이저≥1일 때) |

- `^0.8.26`이면 0.8.26, 0.8.27, ..., 0.8.99는 허용하지만 **0.9.0은 거부**
- Solidity는 아직 메이저 0(0.x.x)이므로, 마이너 변경(0.8→0.9)이 사실상 "대규모 변경"에 해당

> [!warning] 왜 버전 지정이 생사를 가르는가
> Solidity는 버전마다 언어 동작이 **근본적으로** 달라집니다.
>
> | 변경 | 이전 | 이후 |
> |------|------|------|
> | 0.8.0 — 산술 오버플로 | `255 + 1 = 0` (조용히 순환) | `255 + 1 → revert` (자동 체크) |
> | 0.6.0 — fallback 분리 | `function()` 하나로 처리 | `receive()` + `fallback()` 분리 |
> | 0.5.0 — 명시적 가시성 | 기본 `public` | 가시성 **생략 불가** |
>
> 같은 코드라도 컴파일러 버전에 따라 동작이 정반대가 될 수 있습니다.

**컴파일 과정에서의 동작:**

```
1. solc(컴파일러) 시작
2. pragma solidity ^0.8.26; 발견
3. 자신의 버전(예: 0.8.28)과 비교
4. 0.8.26 ≤ 0.8.28 < 0.9.0 → ✅ 통과
5. 만약 자신의 버전이 0.7.6이라면 → ❌ 컴파일 거부
```

---

## 3. contract 키워드 — 스마트 컨트랙트 선언

> [!tip] 비유
> **자판기**와 같습니다.
> - 한번 설치(배포)하면 내부 프로그램을 바꿀 수 없음 → **불변성**
> - 동전(ETH)을 넣고 버튼(함수)을 누르면 자동으로 음료(결과)가 나옴 → **자동 실행**
> - 누구나 사용 가능하지만, 프로그래밍된 규칙만 따름 → **신뢰 불필요 (trustless)**
> - 고유한 위치(주소)에 설치됨 → **주소로 식별**
> - 자판기 안에 잔돈(ETH)을 보관할 수 있음 → **잔액 보유 가능**

> [!info] 정석
> `contract`는 이더리움 가상머신(EVM) 위에서 실행되는 **코드(함수)와 데이터(상태변수)의 모음**입니다. 객체지향 프로그래밍의 **클래스(class)** 와 유사하지만, 한 번 배포하면 코드를 수정할 수 없다는 결정적 차이가 있습니다.
>
> ```solidity
> contract HelloWorld {
>     // 상태변수: 블록체인에 영구 저장되는 데이터
>     string public greet = "Hello World";
>
>     // 함수: 상태를 읽거나 변경하는 로직
> }
> ```

**class와 contract의 비교:**

| 항목 | 클래스 (OOP) | 컨트랙트 (Solidity) |
|------|-------------|-------------------|
| 인스턴스 생성 | `new MyClass()` | 트랜잭션으로 배포 |
| 저장 위치 | RAM (휘발성) | 블록체인 (영구) |
| 코드 수정 | 자유롭게 가능 | **불가능** (불변) |
| 실행 비용 | CPU 사이클 | Gas (ETH 지불) |
| 접근 제어 | 같은 프로세스 내 | 전 세계 누구나 (주소만 알면) |
| 소멸 | GC가 수거 | 영원히 존재 |

**배포 과정 원리 (5단계):**

```
1. 코드 작성 (Solidity 소스코드)
      ↓
2. 컴파일 (solc 컴파일러)
      ↓ → ABI (인터페이스 정의서) + Bytecode (기계어)
3. 배포 트랜잭션 생성 (to: 0x0, data: bytecode)
      ↓
4. 마이너/검증자가 트랜잭션을 블록에 포함
      ↓
5. 고유 주소 할당 (예: 0x1234...abcd)
      → 이후 이 주소로 컨트랙트와 상호작용
```

**핵심 산출물 2가지:**

- **ABI** (Application Binary Interface): 외부에서 컨트랙트 함수를 호출하기 위한 "사용 설명서". JSON 형태로 함수명, 파라미터 타입, 반환 타입을 정의합니다. 프론트엔드(web3.js, ethers.js)가 이 ABI를 보고 "어떤 함수를 어떻게 호출해야 하는지" 알게 됩니다.

```json
[
  {
    "inputs": [],
    "name": "greet",
    "outputs": [{"type": "string"}],
    "stateMutability": "view",
    "type": "function"
  }
]
```

- **Bytecode**: EVM이 실행하는 저수준 바이너리 코드. 사람이 읽을 수 없으며, `PUSH`, `MSTORE`, `SSTORE` 같은 EVM 옵코드(opcode)의 나열입니다.

**컨트랙트 주소 생성 원리:**

```
주소 = keccak256(RLP(배포자_주소, nonce))의 마지막 20바이트

예시:
  배포자: 0xABCD...1234
  nonce: 0 (첫 번째 배포)
  → keccak256(RLP(0xABCD...1234, 0))
  → 0x5B38Da6a...  (40자리 16진수 = 20바이트)
```

> [!warning] 핵심 특성 3가지
> - **불변성(Immutability)**: 배포된 코드는 절대 수정 불가. 버그가 있으면 새 컨트랙트를 배포해야 합니다. (업그레이드 패턴은 프록시 패턴으로 우회)
> - **영속성(Permanence)**: 블록체인에 영원히 존재. `selfdestruct`가 있었으나 EIP-6780으로 사실상 무력화됨
> - **투명성(Transparency)**: 누구나 바이트코드와 상태를 확인 가능. "비밀 로직"이란 존재하지 않음

---

## 4. 상태 변수 (State Variables)

> [!tip] 비유
> 컨트랙트의 **금고에 보관된 서류**입니다.
> - 금고(블록체인 storage)에 넣으면 **영구 보관** → 비용(gas)이 많이 듦
> - 한번 넣으면 꺼내거나 수정할 때도 비용 발생
> - 금고 안의 서류는 전 세계 모든 은행 지점(노드)에 복사본이 있음
> - 금고 바깥의 메모장(memory)에 적으면 임시 → 저렴하지만 함수 끝나면 사라짐

> [!info] 정석
> 상태 변수는 컨트랙트의 **영구 저장소(storage)** 에 기록되는 변수입니다. 블록체인의 모든 노드가 이 데이터의 사본을 보유하며, 합의(consensus)를 통해 동기화됩니다. 상태 변수를 읽는 것은 무료지만, **쓰는 것은 가장 비싼 연산** 중 하나입니다.

```solidity
contract HelloWorld {
    // 상태 변수 — 블록체인 storage에 영구 저장
    string public greet = "Hello World";
}

contract HelloNumber {
    // 상태 변수 — int 타입
    int public number = 10;
}
```

**EVM Storage Layout (저장 원리):**

```
EVM Storage: 2^256개의 32바이트 슬롯

┌─────────────────────────────────────────────┐
│ 슬롯 0 │ 슬롯 1 │ 슬롯 2 │ ... │ 슬롯 2^256-1 │
└─────────────────────────────────────────────┘
    ↑
   첫 번째 상태 변수가 여기에 저장

HelloNumber의 경우:
  슬롯 0: number → 0x000000000000000000000000000000000000000000000000000000000000000a
                     (32바이트 = 256비트, 10의 16진수 = 0xa)
```

- 각 상태 변수는 **선언 순서대로** 슬롯에 배치
- 고정 크기 타입(`int256`, `address`, `bool` 등)은 해당 슬롯에 직접 저장
- 동적 크기 타입(`string`, `bytes`, 동적 배열)은 슬롯에 **포인터**를 저장하고, 실제 데이터는 `keccak256(슬롯번호)` 위치에 저장

**가스비 관점에서의 Storage 연산:**

| EVM 옵코드 | 동작 | 가스 비용 | 비유 |
|-----------|------|----------|------|
| `SSTORE` (0→비0) | 새 값 저장 | **20,000 gas** | 빈 금고에 서류 넣기 |
| `SSTORE` (비0→비0) | 값 수정 | **5,000 gas** | 기존 서류 교체 |
| `SSTORE` (비0→0) | 값 삭제 | **5,000 gas** + 환불 | 서류 폐기 (보증금 반환) |
| `SLOAD` | 값 읽기 | **2,100 gas** (콜드) | 금고 열어 확인 |

> [!example] 왜 Storage가 비싼가?
> 상태 변수 하나를 저장하면, 이더리움 네트워크의 **수만 개 노드 전부**가 그 데이터를 복제합니다. 1바이트를 저장하는 것이 아니라, 1바이트 x 수만 대를 저장하는 셈입니다. 이 "전 세계 복제 비용"이 가스비에 반영됩니다.

**데이터 위치 3가지 비교:**

| 위치 | 비유 | 지속성 | 수정 가능 | 가스비 | 용도 |
|------|------|--------|----------|--------|------|
| `storage` | 금고 | 영구 (블록체인에 기록) | ✅ | 높음 | 상태 변수 |
| `memory` | 메모장 | 함수 끝나면 소멸 | ✅ | 중간 | 함수 내 임시 변수 |
| `calldata` | 읽기전용 택배 상자 | 함수 끝나면 소멸 | ❌ | 최저 | `external` 함수 매개변수 |

---

## 5. 가시성 수정자 (Visibility Modifiers)

> [!tip] 비유
> 건물의 **출입 권한 등급**입니다.
> - `public` = **로비 (누구나 출입)**: 지나가는 사람(외부 호출)도, 직원(내부 호출)도 자유롭게 접근
> - `private` = **금고실 (사장만 출입)**: 이 컨트랙트 자신만 접근 가능. 자회사(상속)도 불가
> - `internal` = **사무실 (직원+계열사)**: 현재 컨트랙트와 상속받은 컨트랙트만 접근
> - `external` = **배달 창구 (외부 전용)**: 외부에서만 호출 가능, 내부에서 직접 호출 불가

> [!info] 정석
> 가시성 수정자는 **누가 이 함수/변수에 접근할 수 있는가**를 제어합니다. Solidity 0.5.0부터 함수의 가시성을 **반드시 명시**해야 합니다.

| 수정자 | 외부 호출 | 내부 호출 | 상속 컨트랙트 | 변수 자동 getter |
|--------|----------|----------|-------------|----------------|
| `public` | ✅ | ✅ | ✅ | ✅ |
| `private` | ❌ | ✅ | ❌ | ❌ |
| `internal` | ❌ | ✅ | ✅ | ❌ |
| `external` | ✅ | ❌ (`this.`으로만) | ❌ | — |

**Lab 1 코드에서의 가시성 실습:**

```solidity
// Tab 1: public 변수 → 자동 getter 생성
contract HelloWorld {
    string public greet = "Hello World";
    // 컴파일러가 자동으로 greet() 함수를 생성해줌
}

// Tab 2: private 변수 → 수동으로 getter 작성 필요
contract HelloWorld {
    string private _greeting = "Hello, World!";

    // 직접 getter 작성
    function greet() public view returns (string memory) {
        return _greeting;
    }
}
```

**public 변수의 자동 getter 원리:**

```solidity
// 개발자가 작성한 코드:
string public greet = "Hello World";

// 컴파일러가 자동 생성하는 코드 (눈에 보이지 않음):
function greet() external view returns (string memory) {
    return greet;  // storage에서 값을 읽어 반환
}
```

- `public` 상태 변수를 선언하면, 컴파일러가 **동일 이름의 view 함수**를 자동 생성
- 이것이 Remix / Lab 시뮬레이터에서 **초록 버튼**으로 나타나는 이유
- 자동 getter는 `external`로 생성됨 (외부에서만 호출 가능)

> [!warning] private ≠ 비밀
> `private`이라고 해서 데이터가 **숨겨지는 것이 아닙니다**. 블록체인의 모든 데이터는 원칙적으로 공개입니다.
>
> ```
> // 누구나 이렇게 storage를 직접 읽을 수 있음
> web3.eth.getStorageAt(contractAddress, slotNumber)
> ```
>
> `private`은 단지 **다른 컨트랙트의 코드에서 접근하는 것을 막을 뿐**, 블록체인 탐색기나 web3 라이브러리로 storage 슬롯을 직접 읽으면 **누구나** 값을 확인할 수 있습니다.
>
> 비밀번호, API 키 같은 민감 정보를 **절대** 상태 변수에 저장하지 마세요.

**네이밍 컨벤션:**
```solidity
// private/internal 변수는 언더스코어(_) 접두사 관례
string private _greeting;      // ✅ 권장
int private _number;           // ✅ 권장
string private greeting;       // ⚠️ 동작하지만 비권장
```

---

## 6. 함수 상태 수정자 — view와 pure

> [!tip] 비유
> - `view` = **박물관 관람**: 전시물(상태변수)을 **보기만** 할 수 있음. 만지거나 수정하면 경보(컴파일 에러) 발생
> - `pure` = **계산기**: 외부 데이터를 전혀 참조하지 않고, 주어진 입력만으로 **순수 계산**. `2 + 3 = 5`처럼 항상 같은 입력에 같은 출력
> - 수정자 없음 = **공사 작업자**: 상태를 읽고 쓸 수 있으며, 작업 비용(gas)을 지불해야 함

> [!info] 정석
> 함수 상태 수정자(State Mutability)는 함수가 **블록체인 상태를 어떻게 다루는지** 선언합니다. 컴파일러가 이 선언을 검증하여, 약속을 어기면 컴파일 에러를 발생시킵니다.

| 수정자 | 상태 읽기 | 상태 쓰기 | 가스비 (외부 직접 호출) | Remix 버튼 색 |
|--------|----------|----------|---------------------|-------------|
| `view` | ✅ | ❌ | **무료** | 🟢 초록/파랑 |
| `pure` | ❌ | ❌ | **무료** | 🟢 초록/파랑 |
| (없음) | ✅ | ✅ | **유료** (트랜잭션) | 🟠 주황 |
| `payable` | ✅ | ✅ | **유료** + ETH 수신 가능 | 🔴 빨강 |

**Lab 1 코드에서의 예시:**

```solidity
contract HelloWorld {
    string private _greeting = "Hello, World!";

    // view: 상태변수를 읽기만 함 → 무료 호출
    function greet() public view returns (string memory) {
        return _greeting;
    }

    // 수정자 없음: 상태변수를 변경함 → 가스비 발생
    function setGreeting(string memory newGreeting) public {
        _greeting = newGreeting;
    }
}
```

**왜 view/pure는 가스비가 무료인가?**

```
[일반 함수 호출 — 상태 변경]
  사용자 → 트랜잭션 생성 → 서명 → 네트워크 전파
  → 멤풀 대기 → 마이너/검증자가 실행 → 블록에 기록
  → 전 세계 노드가 상태 업데이트 → 가스비 지불 💰

[view/pure 함수 호출 — 상태 변경 없음]
  사용자 → 연결된 로컬 노드에서 즉시 실행 → 결과 반환 ✅
  (네트워크 전파 없음, 블록 기록 없음, 합의 불필요)
```

- view/pure는 블록체인 상태를 **변경하지 않으므로**, 합의가 필요 없음
- 로컬 노드의 현재 상태를 기반으로 **자체 실행**하고 결과만 반환
- `eth_call` RPC로 실행됨 (트랜잭션이 아님)

> [!warning] 예외 상황
> view/pure 함수를 **다른 상태변경 함수 내부에서 호출**하면, 해당 트랜잭션의 일부이므로 **가스비가 발생**합니다.
>
> ```solidity
> function setAndGet(string memory newMsg) public {
>     _greeting = newMsg;      // 상태 변경 → 가스 소모
>     string memory g = greet(); // view 함수지만 트랜잭션 내부 → 가스 소모
> }
> ```

**view에서 금지되는 연산 목록:**

| 금지 연산 | 이유 |
|----------|------|
| 상태 변수 쓰기 | 상태 변경 |
| 이벤트 발생 (`emit`) | 로그도 상태의 일부 |
| 다른 컨트랙트 생성 | 새 상태 생성 |
| `selfdestruct` 사용 | 상태 파괴 |
| ETH 전송 | 잔액 상태 변경 |

---

## 7. 함수 선언과 매개변수

> [!tip] 비유
> 자판기의 **버튼 설계도**입니다. 각 버튼(함수)마다 어떤 동전(매개변수)을 넣어야 하고, 어떤 음료(반환값)가 나오는지, 누가 누를 수 있는지(가시성)가 정해져 있습니다.

> [!info] 정석
> Solidity 함수는 `function` 키워드로 선언하며, 매개변수, 가시성, 상태 수정자, 반환 타입을 지정합니다.

**함수 선언 구문 분해:**

```solidity
function setGreeting(string memory newGreeting) public {
//  ↑        ↑              ↑        ↑          ↑
// 키워드   함수명       매개변수 타입  데이터 위치  가시성
    _greeting = newGreeting;
//     ↑            ↑
// 상태변수 수정   매개변수 사용
}

function greet() public view returns (string memory) {
//                              ↑          ↑       ↑
//                          상태수정자   반환 타입  데이터 위치
    return _greeting;
}
```

**매개변수의 데이터 위치 지정:**

```solidity
// 참조 타입(string, bytes, array, struct)은 반드시 데이터 위치 명시
function setGreeting(string memory newGreeting) public { }
//                          ↑
//                    memory: 함수 실행 중에만 존재하는 임시 복사본

function externalFunc(string calldata data) external { }
//                           ↑
//                    calldata: 읽기전용, 복사 없이 원본 참조 (더 저렴)
```

| 데이터 위치 | 사용 가능한 곳 | 수정 가능 | 비용 | 설명 |
|------------|--------------|----------|------|------|
| `memory` | 모든 함수 매개변수, 지역변수 | ✅ | 중간 | 함수 내 임시 복사본 |
| `calldata` | `external` 함수 매개변수만 | ❌ | 최저 | 원본 데이터 직접 참조 |
| `storage` | 지역변수로만 (상태변수 참조) | ✅ | 높음 | 상태변수의 포인터 |

> [!example] 값 타입 vs 참조 타입
> - **값 타입** (`uint`, `int`, `bool`, `address`): 데이터 위치 지정 불필요. 항상 복사됨
> - **참조 타입** (`string`, `bytes`, 배열, 구조체, 매핑): **반드시** `memory`, `calldata`, `storage` 중 하나를 명시해야 함
>
> ```solidity
> function setNumber(int newNumber) public { }
> //                 ↑ 값 타입이므로 데이터 위치 불필요
>
> function setGreeting(string memory newGreeting) public { }
> //                          ↑ 참조 타입이므로 데이터 위치 필수
> ```

**returns 키워드:**

```solidity
// 단일 반환
function greet() public view returns (string memory) {
    return _greeting;
}

// 다중 반환 (Lab 1에서는 다루지 않지만 참고)
function getInfo() public view returns (string memory, int) {
    return (_greeting, 42);
}

// 명명된 반환 (named return)
function getNumber() public view returns (int result) {
    result = _number;  // return 없이도 자동 반환
}
```

---

## 8. int 타입 — 정수 표현

> [!tip] 비유
> 숫자를 담는 **그릇의 크기**입니다.
> - `int8` = 종이컵: 작은 숫자만 담을 수 있음 (-128 ~ 127)
> - `int256` = 수영장: 우주의 원자 수보다 많은 숫자를 담을 수 있음 (기본값)
> - `uint` = 눈금이 0부터 시작하는 자: 음수를 표현할 수 없는 대신, 양수 범위가 2배
>
> 중요한 점: EVM 내부에서는 **어떤 크기의 그릇이든 수영장(256비트) 위에 올려놓고** 처리합니다. 작은 그릇을 쓴다고 물(가스)을 절약할 수 있는 건 아닙니다. (단, 여러 작은 그릇을 한 수영장에 **포장(packing)** 하면 절약 가능)

> [!info] 정석
> Solidity의 정수 타입은 부호 유무와 비트 크기로 구분됩니다.
>
> - `int` = `int256`: 부호 있는 256비트 정수 (음수 가능)
> - `uint` = `uint256`: 부호 없는 256비트 정수 (0 이상만)
> - 8비트 단위로 `int8`, `int16`, ..., `int256` 존재

```solidity
contract HelloNumber {
    int public number = 10;  // int256과 동일 (기본값)
}
```

**비트 크기별 범위:**

| 타입 | 최솟값 | 최댓값 | 범위 설명 |
|------|--------|--------|----------|
| `int8` | -128 | 127 | -2^7 ~ 2^7-1 |
| `int16` | -32,768 | 32,767 | -2^15 ~ 2^15-1 |
| `int256` | -2^255 | 2^255-1 | 약 ±5.7 x 10^76 |
| `uint8` | 0 | 255 | 0 ~ 2^8-1 |
| `uint256` | 0 | 2^256-1 | 약 1.15 x 10^77 |

**왜 256비트가 기본인가?**

```
EVM의 스택 워드(word) 크기 = 256비트 = 32바이트

모든 연산은 256비트 단위로 수행:
  ADD, SUB, MUL, DIV... 전부 256비트 피연산자

int8을 써도:
  [ 0000...0000 | 0000 1010 ]  ← 248비트 패딩 + 8비트 실제 값
  (결국 256비트 전체를 사용)
```

- EVM의 **스택 워드** 크기가 256비트
- 모든 산술 연산이 256비트 단위로 수행됨
- `int8`을 써도 내부적으로 256비트로 **패딩(padding)** 되어 처리
- 따라서 단일 변수의 가스비 차이는 거의 없음

> [!warning] Overflow 보호 (0.8.0 이후)
> Solidity 0.8.0부터 산술 오버플로/언더플로가 발생하면 **자동으로 revert** 됩니다.
>
> ```solidity
> // Solidity < 0.8.0 (위험!)
> uint8 x = 255;
> x = x + 1;  // → 0 (조용히 순환, 버그의 원인)
>
> // Solidity >= 0.8.0 (안전)
> uint8 x = 255;
> x = x + 1;  // → revert! (트랜잭션 실패, 자금 보호)
> ```
>
> Lab 1에서 `pragma solidity ^0.8.26`을 사용하므로 이 보호가 자동 적용됩니다.

**EVM Storage에 저장되는 실제 값:**

```
int public number = 10;

Storage 슬롯 0:
0x000000000000000000000000000000000000000000000000000000000000000a
│                                                              │
└──────────── 32바이트 (256비트), 10의 16진수 = 0x0a ───────────┘

int public number = -1;

Storage 슬롯 0:
0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
│                                                              │
└──────────── 2의 보수 표현: -1 = 모든 비트가 1 ────────────────┘
```

---

## 9. string 타입 — 문자열 표현

> [!tip] 비유
> 글자를 담는 **고무줄 주머니**입니다. 짧은 단어도, 긴 문장도 담을 수 있지만, 늘어나는 만큼 **보관 비용(가스비)도 늘어**납니다. EVM에게 문자열은 "의미를 모르는 바이트 덩어리"일 뿐이라, 문자열 비교나 검색 같은 고급 연산은 기본 제공하지 않습니다.

> [!info] 정석
> `string`은 Solidity에서 **동적 크기의 UTF-8 인코딩 바이트 배열**입니다. 내부적으로 `bytes`와 동일한 구조이지만, 인덱스 접근(`str[0]`)이나 길이 조회(`str.length`)가 **불가능**합니다.

```solidity
contract HelloWorld {
    string public greet = "Hello World";
}
```

**Storage에서의 string 저장 원리:**

```
[짧은 문자열 (31바이트 이하) — 최적화 저장]

"Hello World" = 11바이트 (11 x 2 = 22, 길이 정보)

슬롯 0: [ "Hello World" 데이터 (좌측 정렬) | 길이*2 (우측 1바이트) ]
         48656c6c6f20576f726c6400000000000000000000000000000000000000 16
         ↑ UTF-8 바이트                                              ↑ 길이(11)*2=22=0x16

[긴 문자열 (32바이트 이상) — 별도 저장]

슬롯 0: [ 길이*2 + 1 ]  ← 홀수이면 "긴 문자열" 플래그
keccak256(0): [ 데이터 앞 32바이트 ]
keccak256(0)+1: [ 데이터 다음 32바이트 ]
...
```

**string의 제한사항:**

| 연산 | 지원 여부 | 대안 |
|------|----------|------|
| 인덱스 접근 `str[0]` | ❌ | `bytes(str)[0]` |
| 길이 조회 `str.length` | ❌ | `bytes(str).length` |
| 문자열 비교 `str1 == str2` | ❌ | `keccak256(bytes(str1)) == keccak256(bytes(str2))` |
| 문자열 연결 `str1 + str2` | ❌ | `string.concat(str1, str2)` (0.8.12+) |

> [!example] 왜 string 연산이 비싼가?
> EVM은 256비트 정수 연산에 최적화되어 있습니다. 문자열은 가변 길이 데이터이므로, 바이트 단위로 루프를 돌며 처리해야 합니다. 간단한 문자열 비교도 내부적으로는 "두 바이트 배열의 해시를 계산하여 비교"하는 복잡한 과정을 거칩니다.
>
> 이것이 블록체인에서 **문자열 처리를 최소화**하고, 가능하면 `bytes32` 같은 고정 크기 타입을 쓰라고 권장하는 이유입니다.

---

## 10. Lab 1 전체 코드 분석

### Tab 1: HelloWorld (최소 버전)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract HelloWorld {
    string public greet = "Hello World";
}
```

> [!example] 줄별 분석
>
> | 줄 | 코드 | 역할 |
> |---|------|------|
> | 1 | `// SPDX-License-Identifier: MIT` | MIT 라이선스 선언 |
> | 2 | `pragma solidity ^0.8.26;` | 컴파일러 0.8.26~0.8.x 요구 |
> | 4 | `contract HelloWorld {` | 컨트랙트 선언 시작 |
> | 5 | `string public greet = "Hello World";` | public 상태변수 + 초기값 + 자동 getter |
> | 6 | `}` | 컨트랙트 종료 |
>
> **5줄짜리 코드에 담긴 개념:**
> - 라이선스, 버전 관리, 컨트랙트, 상태변수, 가시성, string 타입, 자동 getter

### Tab 2: HelloWorld 확장 (함수 추가)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract HelloWorld {
    string private _greeting = "Hello, World!";

    function greet() public view returns (string memory) {
        return _greeting;
    }

    function setGreeting(string memory newGreeting) public {
        _greeting = newGreeting;
    }
}
```

> [!example] Tab 1과의 차이점
>
> | 변경 | Tab 1 | Tab 2 | 이유 |
> |------|-------|-------|------|
> | 가시성 | `public` (자동 getter) | `private` + 수동 getter | 접근 제어 학습 |
> | 네이밍 | `greet` | `_greeting` | private 관례 (언더스코어) |
> | 쓰기 함수 | 없음 | `setGreeting()` | 상태 변경 학습 |
> | 가스비 체험 | 무료만 | 무료(`greet`) + 유료(`setGreeting`) | 차이 체험 |

### Tab 3: HelloNumber

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract HelloNumber {
    int public number = 10;
}
```

> [!example] 도전 과제 정답
>
> `int public`을 `int private`으로 바꾸고 getter/setter를 추가:
>
> ```solidity
> // SPDX-License-Identifier: MIT
> pragma solidity ^0.8.26;
>
> contract HelloNumber {
>     int private _number = 10;
>
>     function getNumber() public view returns (int) {
>         return _number;
>     }
>
>     function setNumber(int newNumber) public {
>         _number = newNumber;
>     }
> }
> ```
>
> - `int`는 값 타입이므로 `memory` 키워드 불필요 (string과의 차이)
> - `getNumber()`은 `view` → 무료 호출
> - `setNumber()`은 상태 변경 → 가스비 발생

---

## 11. Lab 1 시뮬레이터의 동작 원리

> [!tip] 비유
> Lab 1의 HTML 파일은 **비행기 시뮬레이터**와 같습니다. 실제 하늘을 나는 것은 아니지만, 조종석의 버튼 배치, 계기판 읽는 법, 이착륙 절차를 안전하게 연습할 수 있습니다. 실제 블록체인(이더리움 메인넷)에 배포하면 **진짜 돈(ETH)이 소모**되므로, 시뮬레이터에서 충분히 익힌 뒤 테스트넷 → 메인넷 순서로 진행합니다.

> [!info] 정석
> Lab 1의 HTML 파일은 **브라우저 안에서 EVM의 핵심 동작을 JavaScript로 흉내**냅니다. 실제 블록체인이나 solc 컴파일러를 사용하지 않지만, 배포-호출-상태변경의 흐름을 동일하게 체험할 수 있습니다.

**시뮬레이터가 수행하는 5단계:**

```
1. 코드 에디터
   → 사용자가 Solidity 코드를 입력/수정
   → 구문 강조(syntax highlighting) 제공

2. 컴파일 시뮬레이션
   → JS 정규식으로 코드를 파싱
   → pragma, contract 이름, 함수, 변수 추출
   → 기본적인 문법 검증 (pragma 존재 여부, contract 선언 등)

3. 배포 시뮬레이션
   → JS 객체로 컨트랙트 상태를 메모리에 저장
   → 랜덤 주소 생성 (실제 keccak256 아님)
   → 계정 잔액에서 배포 비용 차감

4. 함수 호출 시뮬레이션
   → 버튼 클릭 → JS 함수가 상태 객체를 읽기/쓰기
   → view/pure → 상태 읽기만, 가스비 무료
   → 일반 함수 → 상태 수정, 가스비 차감

5. 로그 & 가스비 표시
   → 미리 정의된 가스 상수를 표시
   → 콘솔에 호출 이력 기록
```

**실제 EVM vs Lab 시뮬레이터:**

| 항목 | 실제 EVM | Lab 시뮬레이터 |
|------|---------|---------------|
| 코드 저장 | 블록체인 (전 세계 노드) | JS 변수 (브라우저 메모리) |
| 상태 저장 | Merkle Patricia Trie | JS 객체 (`{}`) |
| 컴파일러 | solc (정밀한 바이트코드 생성) | JS 정규식 (구조만 파싱) |
| 가스 계산 | 옵코드별 정밀 계산 | 고정 상수 표시 |
| 계정 | ECDSA 키쌍 (공개키/비밀키) | 하드코딩된 주소 |
| 영속성 | 영구 (블록에 기록) | 페이지 새로고침 시 초기화 |
| 네트워크 | P2P 네트워크 (수만 노드) | 로컬 브라우저 (단일) |
| 합의 | PoS (Proof of Stake) | 없음 (즉시 반영) |

> [!warning] 시뮬레이터의 한계
> - 실제 가스 계산이 아니므로 **최적화 연습에는 부적합**
> - 다중 컨트랙트 간 상호작용 불가
> - 이벤트(event), 에러(error), modifier 등 고급 기능 미지원
> - **다음 단계**: Remix IDE (브라우저) → Hardhat/Foundry (로컬) → 테스트넷 → 메인넷

---

## 참고 링크

- 다음 실습: [[week5-concepts-lab2|Lab 2: Counter & CheckNumber]]
- Faucet 심화: [[week5-concepts-lab3|Lab 3: Faucet]]
- [Solidity 공식 문서 — Types](https://docs.soliditylang.org/en/v0.8.26/types.html)
- [Solidity 공식 문서 — Visibility](https://docs.soliditylang.org/en/v0.8.26/contracts.html#visibility-and-getters)
- [SPDX 라이선스 목록](https://spdx.org/licenses/)
- [EVM Opcodes 참조](https://www.evm.codes/)
