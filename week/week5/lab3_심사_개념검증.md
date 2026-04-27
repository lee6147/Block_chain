# Lab 3 Faucet 시뮬레이터 — 개념 정확성 심사 보고서

**심사위원**: 블록체인/Solidity 개념 전문 심사위원 (Architect Agent)  
**심사일**: 2026-04-07  
**대상**: `week5-lab.html` Lab 3 섹션 (라인 4491~9374)

---

## 1. Solidity 문법 정확성 — 점수: 9/10

### 잘한 점
- **`LAB3_INITIAL_CODE`** (라인 7644~7691): 실제 Solidity 0.8.26 컴파일러에서 문제없이 컴파일되는 유효한 코드
- `address payable public owner` (라인 7649): `payable` 캐스팅이 올바름
- `uint256 public constant WITHDRAWAL_AMOUNT = 0.1 ether` (라인 7650): `ether` 단위 리터럴 정확
- `mapping(address => uint256) public lastWithdrawalTime` (라인 7652): mapping 선언과 public auto-getter 패턴 정확
- `modifier onlyOwner()` + `require(msg.sender == owner, ...)` + `_;` (라인 7657~7660): modifier 문법 정확
- `receive() external payable {}` (라인 7690): Solidity 0.6+ 이후의 receive 함수 문법 정확
- 이벤트 선언에 `indexed` 키워드 사용 (라인 7653): 올바름

### 아쉬운 점
- **`withdrawAll()` 함수가 CEI 패턴을 위반** (라인 7684~7688): `owner.transfer(amount)` (Interaction) 이후에 `emit WithdrawAll(...)` (Effect)이 오는 순서. `amount` 지역 변수에 잔액을 캡처한 후 잔액을 0으로 설정하는 Effects 단계가 누락
- **도전과제 6의 힌트 코드** (라인 4944~4948): constructor 인자를 받는 immutable 패턴인데, 시뮬레이터가 constructor 인자를 지원하지 않아 실제 테스트 불가

### 개선 제안
- `withdrawAll()` 함수를 CEI 패턴에 맞게 수정하거나 교육 목적의 주석 추가

---

## 2. EVM 동작 시뮬레이션 정확도 — 점수: 6/10

### 잘한 점
- **require 검증 순서가 실제 코드와 일치** (라인 8541~8622): 시간 검증 → 잔액 검증 순서
- **CEI 패턴 실행 순서 시뮬레이션** (라인 8627~8629): Effect → Interaction 순서 일치
- **revert 시에도 가스 소모 시뮬레이션** (라인 8135): 실제 EVM과 일치
- **블록 번호/타임스탬프 증가** (라인 5212~5213): ~12초 블록 시간 근사

### 부정확한 점
- **가스비가 완전 랜덤** (라인 8117): `Math.floor(Math.random() * 30000) + 21000`으로 생성. 실제 EVM은 각 opcode별로 확정적(deterministic). 동일 함수 동일 상태에서 항상 같은 가스 소모. "가스비는 매번 달라진다"는 잘못된 인상
- **컴파일 검증이 문자열 존재 여부만 확인** (라인 8214~8234): 타입 검사, ABI 인코딩, 접근 제어자 검증 없음. 주석에 `constructor`가 있어도 성공 판정
- **gasPrice 고정 20 Gwei** (라인 5197): EIP-1559 이후 baseFee + priorityFee 구조 미반영 (교육용 단순화로 이해 가능)

### 개선 제안
- 가스비를 함수별 고정값으로 설정: withdraw() ≈ 46,000, deposit() ≈ 28,000, withdrawAll() ≈ 30,000
- 최소한 "시뮬레이션된 가스값이며 실제와 다를 수 있음" 안내 표시

---

## 3. 블록체인 개념 설명 정확성 — 점수: 8/10

### 잘한 점
- **transfer vs send vs call 설명** (라인 8668~8672): 세 가지 방식의 차이를 정확하게 설명
- **receive() vs fallback() 설명** (라인 9003~9006): msg.data 유무에 따른 호출 분기 정확
- **constant vs immutable 설명** (라인 4940~4952): 컴파일 시점 vs 배포 시점, 가스비 차이 정확
- **CEI 패턴 설명** (라인 4902~4916): 순서와 재진입 공격 시나리오 명확

### 아쉬운 점
- **transfer() 사용과 call() 권장 불일치** (라인 7676 vs 8672): 코드는 transfer, 설명은 call 권장. 왜 transfer를 사용하는지 명시적 설명 부재
- **도전과제 4의 재진입 설명 부정확** (라인 4912~4916): "transfer() 호출 시 receive()에서 다시 withdraw()를 호출할 수 있습니다"라고 했지만, transfer()는 2,300 gas만 전달하므로 재진입 불가. call{value}일 때의 시나리오
- **"24시간 경과" 버튼 라벨 고정** (라인 4524): LOCK_TIME 변경 시 UI 라벨 불일치

### 개선 제안
- transfer 사용 이유 명시: "교육 목적으로 transfer를 사용했지만, 실무에서는 call + CEI가 권장"
- 재진입 설명 수정: transfer()는 2,300 gas 제한으로 안전, call{value}에서 위험 발생

---

## 4. 보안 개념 교육 — 점수: 7/10

### 잘한 점
- **onlyOwner 접근 제어 시뮬레이션** (라인 8711~8741, 8818~8851): modifier 검증 과정 단계별 시각화
- **require 실패 시 상세 검증 과정 표시** (라인 8548~8563): 값 비교 결과 시각화 — 매우 교육적
- **OpenZeppelin 참조** (라인 4929~4931): 실무 모범 사례 안내
- **revert 시 가스 소모** (라인 8135~8137): 실제 EVM과 일치

### 아쉬운 점
- **재진입 공격 설명의 기술적 부정확성** (라인 4912~4916): transfer()에서의 재진입 불가능성 미언급
- **withdrawAll() 코드의 CEI 미준수** (라인 7684~7688): CEI 패턴 강조하면서 정작 해당 함수가 미준수
- **도전과제 4는 시뮬레이터에서 실제 동작하지 않음**: 코드 순서를 바꿔도 하드코딩된 로직을 따름

---

## 5. 교육적 단계 설계 — 점수: 8/10

### 잘한 점
- **12단계 가이드의 논리적 순서**: 컴파일 → 배포 → 확인 → 입금 → 출금 → 실패 경험 → 권한 확인으로 점진적 학습
- **자동 감지 기반 완료 처리**: `lab3GuideFlags`로 학생 행동 자동 감지
- **6개 도전과제의 난이도 곡선**: 상수 변경 → receive 제거 → CEI 순서 → 함수 추가 → constant vs immutable
- **시뮬레이터 한계 안내** (라인 4960~4961): 투명한 안내

### 아쉬운 점
- **도전과제 5, 6이 시뮬레이터에서 동작 불가**: 코드 파싱이 WITHDRAWAL_AMOUNT, LOCK_TIME만 지원
- **"Line 30~33" 하드코딩** (라인 8659): 코드 수정 시 라인 번호 불일치

---

## 종합 점수

| 심사 항목 | 점수 | 요약 |
|-----------|------|------|
| 1. Solidity 문법 정확성 | 9/10 | 실제 컴파일 가능한 유효 코드. withdrawAll CEI 미세 위반 |
| 2. EVM 동작 시뮬레이션 정확도 | 6/10 | 랜덤 가스비, 단순 컴파일 검증이 주요 감점 |
| 3. 블록체인 개념 설명 정확성 | 8/10 | transfer/send/call 설명 우수. transfer 재진입 설명 부정확 |
| 4. 보안 개념 교육 | 7/10 | CEI, onlyOwner 잘 다루나 재진입 시나리오 기술적 오류 |
| 5. 교육적 단계 설계 | 8/10 | 12단계 가이드 논리적. 도전과제 5,6 실행 불가가 아쉬움 |
| **총점** | **7.6/10** | **전반적으로 우수한 교육 시뮬레이터. 가스비 정확도와 재진입 설명 수정 필요** |

---

## 핵심 참조 라인

- `week5-lab.html:4524-4526` — "24시간 경과" 버튼 라벨 하드코딩
- `week5-lab.html:4912-4916` — 도전과제 4 재진입 공격 힌트 (기술적 부정확)
- `week5-lab.html:7684-7688` — withdrawAll() CEI 패턴 미준수
- `week5-lab.html:8117` — 가스비 랜덤 생성
- `week5-lab.html:8214-8234` — 컴파일 검증 로직 (단순)
- `week5-lab.html:8659` — 하드코딩된 "Line 30~33"
- `week5-lab.html:8668-8672` — transfer vs send vs call 설명
