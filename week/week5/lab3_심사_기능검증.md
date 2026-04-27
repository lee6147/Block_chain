# Lab 3 Faucet 시뮬레이터 — 기능 동작 전수 검증 심사 보고서

**심사위원**: 시뮬레이터 기능 전문 심사위원 (Critic Agent)  
**심사일**: 2026-04-07  
**대상**: `week5-lab.html` Lab 3 섹션 (라인 4491~9374)

---

## 전수 검증 결과

### 1. 핵심 함수 동작 정확성 — 8/10

| 함수 | 성공 경로 | 실패 경로 | 판정 |
|------|-----------|-----------|------|
| `owner()` | 정상 반환 | 미배포 시 early return | OK |
| `WITHDRAWAL_AMOUNT()` | wei/ether 변환 정상 | 미배포 시 early return | OK |
| `LOCK_TIME()` | 단위 변환 정상 | 미배포 시 early return | OK |
| `lastWithdrawalTime()` | 주소 조회 정상 | 잘못된 주소 검증 | OK |
| `withdraw()` | CEI 패턴 반영 | 시간/잔액 revert | OK |
| `deposit()` | onlyOwner 통과 | onlyOwner 실패, 잔액 부족 | OK |
| `withdrawAll()` | 전액 회수 | onlyOwner 실패 | **문제** |
| `receive()` | 누구나 전송 | receive() 미정의 시 revert | **정상** |

**발견된 문제:**

**[CRITICAL-1] receive() 이벤트 로그 — 판정: 정상 동작**
- `receive() external payable {}`는 빈 함수이므로 이벤트를 emit하지 않음
- 시뮬레이터가 Solidity 원본과 일치. 다만 교육 안내 추가 권장

**[MAJOR-1] withdrawAll() 잔액 0일 때 이벤트 로그 누락**
- 라인 8854~8873: 잔액 0에서 `lab3_addEventLog()` 미호출
- Solidity 원본은 amount=0이어도 `emit WithdrawAll` 실행
- 수정 필요: 잔액 0 분기에서도 이벤트 발생

**[MAJOR-2] withdraw() 성공 경로의 비동기 레이스 컨디션**
- 라인 8625~8690: 500ms setTimeout 내부에서 처리
- `capturedTimestamp` 사용으로 기본 안전성은 확보되나, 결과 메시지에 표시되는 timestamp 불일치 가능
- 심각도: MINOR (500ms 안에 다른 동작 가능성 낮음)

---

### 2. 에지 케이스 처리 — 7/10

| 에지 케이스 | 처리 여부 | 판정 |
|-------------|-----------|------|
| deposit에 0/음수/빈칸 입력 | 검증으로 차단 | OK |
| receive에 0 입력 | 검증으로 차단 | OK |
| 잔액 부족 deposit/withdraw | 검증 | OK |
| 미배포 상태에서 함수 호출 | early return | OK |
| 미컴파일 상태에서 배포 | 검증 | OK |
| 코드 변경 후 미컴파일 배포 | **문제** | CRITICAL |
| 재배포 시 계정 잔액 | 미리셋 (EVM 일치) | MINOR |

**[CRITICAL-2] 배포 후 코드 변경 시 compiled 플래그 미무효화**
- 라인 9190: `if (lab3Contract.compiled && !lab3Contract.deployed)` 조건
- 이미 배포된 상태에서 코드 수정 후에도 이전 컴파일 상태 유지
- 구문 검증 우회하여 깨진 코드로도 재배포 가능
- **수정안**: `!lab3Contract.deployed` 조건 제거

**[MAJOR-3] 재배포 시 계정 잔액 미리셋**
- 실제 EVM과 일치하므로 기술적으로는 정확
- 다만 `resetLab3()`에서도 계정 잔액 100 ETH 초기화 없음
- **수정안**: resetLab3()에 계정 초기화 옵션 추가

**[MAJOR-4] deposit() 잔액 부족 시 가스비/트랜잭션 로그 미기록**
- 라인 8744~8748: 잔액 부족에서 바로 return
- onlyOwner revert에서는 정상 기록하므로 일관성 부족
- receive() 잔액 부족에서도 동일 문제 (라인 8959~8963)

---

### 3. 상태 일관성 — 9/10

모든 함수의 성공/실패 경로 후 UI 컴포넌트 동기화 검증:
- 탱크, 계정 카드, 상태 모니터, 트래커, 가스 통계 대부분 정확히 동기화
- withdrawAll() 잔액 0 경로에서 일부 UI 업데이트 누락 (가스비 간접 업데이트로 대부분 보완)

---

### 4. 이벤트/트랜잭션 로깅 — 7/10

| 함수 | 이벤트 로그 | 트랜잭션 로그 | 판정 |
|------|-------------|---------------|------|
| withdraw() 성공/실패 | OK | OK | OK |
| deposit() 성공/revert | OK | OK | OK |
| deposit() 잔액 부족 | - | **없음** | 문제 |
| withdrawAll() 성공/revert | OK | OK | OK |
| withdrawAll() 잔액0 | **없음** | success | 문제 |
| receive() 성공 | 없음(정상) | OK | OK |
| receive() 잔액 부족 | - | **없음** | 문제 |

---

### 5. 가이드 시나리오 완결성 — 8/10

12단계 모두 구현 완료. localStorage 저장/복원 정상.

**[MAJOR-5] check-events 단계가 Lab3 외부에서도 트리거**
- 라인 5372~5374: Lab 1/2에서 이벤트 탭 클릭해도 Lab3 가이드 12단계 완료
- **수정안**: `currentPage === 'lab3'` 조건 추가

**[MINOR-3] check-tank 단계가 시간 기반 자동완료**
- deposit 후 1.2초 뒤 자동완료 — 실제 확인 여부와 무관

---

### 6. UI 반응성 — 9/10

버튼 disabled 상태, 컴파일/배포 스피너, 탱크 애니메이션, 에러 shake, 성공 pulse, 동전 애니메이션, 트래커 flash, 반응형 레이아웃 모두 우수.

---

## 최종 점수

| 항목 | 점수 | 핵심 근거 |
|------|------|-----------|
| 1. 핵심 함수 동작 정확성 | 8/10 | withdrawAll 잔액 0 이벤트 누락 |
| 2. 에지 케이스 처리 | 7/10 | 배포 후 코드변경 시 컴파일 우회(CRITICAL) |
| 3. 상태 일관성 | 9/10 | 전반적으로 우수 |
| 4. 이벤트/트랜잭션 로깅 | 7/10 | 잔액 부족 경로 로그 불일치 |
| 5. 가이드 시나리오 완결성 | 8/10 | check-events Lab3 외부 트리거 문제 |
| 6. UI 반응성 | 9/10 | 모두 우수 |
| **총점** | **8.0/10** | |

---

## CRITICAL/MAJOR 수정 사항 요약

### CRITICAL
1. **배포 후 코드 변경 시 compiled 무효화** (라인 9190 조건 수정)

### MAJOR
1. withdrawAll() 잔액 0 시 WithdrawAll 이벤트 발생 추가
2. check-events 가이드에 `currentPage === 'lab3'` 조건 추가
3. deposit()/receive() 잔액 부족 시 revert 트랜잭션 로그 기록
4. resetLab3()에서 계정 잔액 100 ETH 초기화 옵션

### MINOR
1. "24시간 경과" 버튼 라벨 동적 업데이트
2. receive() 이벤트 미발생 교육 안내 추가
3. check-tank 단계 자동완료 개선 검토
