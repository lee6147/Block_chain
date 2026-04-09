# Lab 3 Faucet 시뮬레이터 — 종합 품질 심사 보고서

> **심사 대상:** `week5-lab.html` (Lab 3 섹션)  
> **심사 범위:** HTML (4491~4972), CSS (1698~2873), JavaScript (7637~9374)  
> **심사일:** 2026-04-07  
> **심사 모델:** Claude Opus 4.6 (1M context)

---

## 총점 요약

| 항목 | 점수 (10점) | 한줄 평가 |
|------|:-----------:|-----------|
| 1. 코드 품질 | **7.5** | 일관된 네이밍과 양호한 함수 분리, 다만 `var` 혼재와 일부 중복이 감점 |
| 2. UX/접근성 | **7.0** | 풍부한 피드백과 토스트, 그러나 ARIA 불완전 및 동적 라벨 미반영 |
| 3. 교육 효과 | **8.5** | 실습 단계와 설명의 깊이가 우수, CEI 패턴 등 보안 교육까지 포괄 |
| 4. 시각적 완성도 | **9.0** | 탱크·수도꼭지·기포·동전 애니메이션 등 높은 수준의 시각적 표현 |
| 5. 확장성/유지보수성 | **6.5** | IIFE 단일 파일 구조의 한계, 하드코딩 존재, 모듈화 부족 |
| 6. 보안/안정성 | **7.0** | 기본 입력 검증 존재, 그러나 innerHTML에 사용자 입력 직접 삽입 위험 |
| **종합** | **7.6 / 10** | 교육용 시뮬레이터로서 높은 완성도, 유지보수성과 보안 보완 필요 |

---

## 1. 코드 품질 — 7.5 / 10

### 장점

- **일관된 네이밍 컨벤션:** 모든 Lab 3 전용 함수·변수에 `lab3_` 또는 `lab3` 접두사를 사용하여 전역 네임스페이스 오염을 방지하고 있습니다. (`lab3_updateTank`, `lab3Contract`, `lab3EventLogs` 등)
- **명확한 함수 분리:** UI 업데이트(`lab3_updateTank`, `lab3_renderAccounts`, `lab3_updateStateMonitor`), 애니메이션(`lab3_animateDeposit`, `lab3_animateDrain`, `lab3_animateSuccess`, `lab3_animateError`), 비즈니스 로직(`lab3_withdraw`, `lab3_deposit`) 등 역할별로 잘 분리되어 있습니다.
- **IIFE 스코프 보호:** 전체 코드를 `(function() { 'use strict'; ... })()` 즉시실행함수로 감싸 전역 오염을 차단하고 있습니다.
- **유틸리티 함수 추출:** `lab3ShortAddr`, `lab3FormatTimestamp`, `lab3FormatRemainingTime`, `lab3FormatETH` 등 공통 포맷팅 로직이 별도 함수로 추출되어 재사용됩니다.
- **AbortController를 활용한 이벤트 리스너 관리:** 라인 9155에서 `AbortController`를 사용하여 이벤트 리스너 중복 등록을 방지하는 것은 좋은 패턴입니다.

### 이슈

#### [MEDIUM] `var` 사용 — ES5/ES6 혼재 (라인 7644~9374 전체)
- **현상:** IIFE 내부에서 전체적으로 `var`를 사용하지만, 파일의 다른 부분(Lab 1, Lab 2)에서는 `const`/`let`이 사용되고 있습니다 (파일 전체에서 `let/const` 318회, `var` 674회). 동일 파일 내에서 스타일이 혼재됩니다.
- **영향:** 코드 일관성 저하. `var`의 함수 스코프 특성으로 인한 잠재적 버그 가능성 (예: for 루프 클로저).
- **권장:** IIFE 내부이므로 `const`/`let` 사용이 안전합니다. `var` → `const`(불변) 또는 `let`(가변)으로 일괄 변환을 권장합니다.

#### [LOW] 반복되는 onlyOwner 검증 코드 (라인 8712~8723, 8819~8830)
- **현상:** `lab3_deposit()`과 `lab3_withdrawAll()`에서 onlyOwner 검증 HTML 출력 코드가 거의 동일하게 반복됩니다.
- **권장:** 공통 헬퍼 함수 `lab3_renderOnlyOwnerError(sender, resultEl)` 추출.

#### [LOW] 매직 넘버 (라인 8144, 8158)
- **현상:** `gasPrice 20 Gwei`가 `(gasUsed * 20) / 1e9`로 두 곳에 하드코딩되어 있습니다.
- **권장:** `var LAB3_GAS_PRICE_GWEI = 20;` 상수로 추출.

#### [LOW] 가스비 계산이 랜덤 (라인 8117)
- **현상:** `Math.floor(Math.random() * 30000) + 21000`으로 가스비를 무작위 생성합니다.
- **영향:** 교육적 관점에서 실제 EVM 가스비와의 관련성이 낮아질 수 있습니다.
- **참고:** 시뮬레이터 특성상 완전한 정확성은 불필요하나, 함수별 대략적 가스비 차등 적용이 더 교육적일 수 있습니다.

---

## 2. UX/접근성 — 7.0 / 10

### 장점

- **풍부한 사용자 피드백:** 모든 함수 실행 시 결과 영역에 성공/실패를 색상 코드(녹색/빨간색)와 함께 상세히 표시합니다.
- **토스트 알림 연동:** `showToast()` 호출로 실행 결과를 화면 상단에도 즉시 알립니다.
- **상세한 에러 메시지:** `require` 실패 시 Solidity 에러 메시지와 함께 검증 과정을 `<details>` 태그로 접을 수 있게 제공합니다 (라인 8555~8563).
- **쿨다운 바 시각화:** 계정 카드에 출금 가능 시간을 프로그레스 바로 직관적으로 표시합니다 (라인 8886~8888).
- **코드 에디터 편의 기능:** Tab 키 지원, 자동 괄호 닫기, Enter 시 들여쓰기 유지 등이 구현되어 있습니다 (라인 9203~9238).

### 이슈

#### [HIGH] 상태 모니터의 "lastWithdrawalTime[현재계정]" 라벨이 동적 변경되지 않음 (라인 4671)
- **현상:** HTML에 `lastWithdrawalTime[현재계정]`이 리터럴 텍스트로 고정되어 있습니다. `lab3_updateStateMonitor()` 함수(라인 9931~9957)에서 값은 동적으로 업데이트하지만, 라벨의 `[현재계정]` 부분은 실제 계정명/주소로 변경하지 않습니다.
- **영향:** 사용자가 Account 2로 전환해도 라벨은 여전히 `[현재계정]`으로 표시되어, 어떤 계정의 데이터를 보고 있는지 직관적으로 알 수 없습니다.
- **수정 방안:** `lab3_updateStateMonitor()`에서 `.lab3-state-key` 요소의 `textContent`도 함께 업데이트:
  ```javascript
  var keyEl = document.querySelector('#lab3StateMonitor .lab3-state-row:nth-child(4) .lab3-state-key');
  if (keyEl) keyEl.textContent = 'lastWithdrawalTime[' + lab3GetAccountLabel(acc.address) + ']';
  ```

#### [MEDIUM] 함수 실행 시 해당 카드에 하이라이트 효과 없음
- **현상:** 함수 호출 버튼을 누르면 결과가 표시되지만, 해당 함수 카드(`.lab3-fn-card`) 자체에는 시각적 하이라이트(예: 테두리 색상 변경, 글로우 효과)가 없습니다.
- **영향:** 여러 함수를 연속으로 실행할 때 어떤 함수의 결과인지 시각적으로 추적하기 어렵습니다.
- **수정 방안:** 각 함수 실행 시 해당 카드에 잠시 하이라이트 클래스를 추가:
  ```javascript
  function lab3_highlightCard(cardId) {
    var card = document.getElementById(cardId);
    if (!card) return;
    card.classList.add('lab3-fn-active');
    setTimeout(function() { card.classList.remove('lab3-fn-active'); }, 1500);
  }
  ```

#### [MEDIUM] 계정 카드에 ARIA 라벨 부재
- **현상:** 계정 카드는 `onclick`으로 선택 기능이 있지만 `role="button"`, `tabindex="0"`, `aria-label` 등의 접근성 속성이 없습니다 (라인 7854~7891). 키보드로는 계정 전환이 불가합니다.
- **영향:** 스크린 리더 사용자 및 키보드 전용 사용자가 계정 전환 기능을 사용할 수 없습니다.
- **수정 방안:** `lab3_renderAccounts()`에서 카드 생성 시:
  ```javascript
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', acc.label + ' 선택');
  card.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); lab3_selectAccount(idx); }
  });
  ```

#### [LOW] 함수 실행 버튼에 `aria-label` 부재
- **현상:** "📖 호출", "🔸 실행" 등 이모지 포함 버튼에 `aria-label`이 없습니다.
- **권장:** `aria-label="owner 함수 호출"` 등 의미 있는 라벨 추가.

#### [LOW] 모바일 레이아웃의 코드 에디터 높이 (라인 1907~1913)
- **현상:** `.lab3-code-area-container`의 `max-height: calc(100vh - 380px)`가 모바일(900px 이하)에서도 동일하게 적용됩니다. 1단 레이아웃에서는 이 높이 계산이 적절하지 않을 수 있습니다.
- **권장:** 미디어 쿼리에서 모바일용 `max-height` 별도 지정:
  ```css
  @media (max-width: 900px) {
    .lab3-code-area-container { max-height: 350px; }
  }
  ```

---

## 3. 교육 효과 — 8.5 / 10

### 장점

- **체계적인 12단계 실습 가이드:** 컴파일 → 배포 → 읽기 함수 호출 → 입금 → 출금 → 에러 체험 → 시간 경과 → 권한 검증까지 논리적 순서로 구성되어 있습니다 (라인 7721~7734).
- **Solidity 보안 패턴 교육:** withdraw() 결과에서 CEI(Checks-Effects-Interactions) 패턴과 transfer/send/call 비교를 상세히 설명합니다 (라인 8667~8673).
- **도전과제 6개:** 상수 변경부터 `immutable` vs `constant`, `receive()` 제거, CEI 패턴 순서 변경, `transferOwnership` 추가까지 단계적 난이도 상승이 잘 설계되어 있습니다 (라인 4866~4962).
- **require 실패 시 검증 과정 시각화:** 왜 실패했는지를 `block.timestamp >= lastWithdrawalTime + LOCK_TIME` 수식으로 보여주는 `<details>` 영역이 교육적으로 매우 효과적입니다 (라인 8555~8563).
- **실시간 상수 파싱:** 에디터에서 `WITHDRAWAL_AMOUNT`나 `LOCK_TIME`을 수정하면 컴파일/배포 시 실제로 반영되어, 코드 변경의 효과를 즉시 체험할 수 있습니다 (라인 8283~8331).
- **receive() 함수 제거 감지:** 도전과제 3에서 `receive()`를 제거하면 직접 ETH 전송이 revert되는 것을 시뮬레이션하여 실제 EVM 동작을 교육합니다 (라인 8929~8943).
- **가스비 통계:** 누적 가스비와 ETH 소모량을 추적하여 트랜잭션 비용 개념을 체험할 수 있습니다.

### 이슈

#### [MEDIUM] 도전과제 힌트에 구문 하이라이팅 없음 (라인 4872~4952)
- **현상:** 힌트 코드가 `.hint-code` 클래스로 표시되지만, CSS에서 단색(`color: var(--neon-green)`, 라인 1089)으로만 렌더링됩니다. Solidity 키워드, 주석, 문자열 등의 구문 구분이 없습니다.
- **영향:** 에디터와의 시각적 일관성이 떨어지고, 코드 구조 파악이 어렵습니다. 특히 도전과제 4~6의 복잡한 힌트 코드에서 가독성이 크게 저하됩니다.
- **수정 방안:** 힌트 표시 시 `highlightSolidity()` 함수를 적용하거나, 최소한 주석(`//`)은 다른 색상으로 표시:
  ```javascript
  function toggleHint(id) {
    var el = document.getElementById(id);
    // ... 기존 토글 로직 ...
    if (el.classList.contains('show') && typeof highlightSolidity === 'function') {
      el.innerHTML = highlightSolidity(el.textContent);
    }
  }
  ```

#### [MEDIUM] "check-tank" 단계의 자동완료 문제 (라인 8801~8804)
- **현상:** deposit 후 1.2초 뒤에 `lab3_completeGuideStep('check-tank')`가 자동 호출됩니다. 사용자가 실제로 탱크 수위 변화를 관찰했는지 확인하지 않습니다.
- **영향:** 교육 목표인 "시각적 변화 관찰"을 검증하지 못하고 자동으로 넘어갑니다.
- **수정 방안:** 탱크 영역에 클릭/호버 이벤트를 추가하여 사용자가 실제로 탱크를 확인했을 때만 완료 처리:
  ```javascript
  // deposit 후 플래그만 설정
  lab3GuideFlags.depositDone = true;
  lab3_completeGuideStep('deposit-1eth');
  
  // 탱크 클릭 시 완료
  document.getElementById('lab3TankContainer').onclick = function() {
    if (lab3GuideFlags.depositDone && !lab3GuideFlags.tankCheckedAfterDeposit) {
      lab3GuideFlags.tankCheckedAfterDeposit = true;
      lab3_completeGuideStep('check-tank');
    }
  };
  ```

#### [LOW] 이벤트 로그 확인 단계('check-events')의 자동감지 부재
- **현상:** 가이드 12단계 중 마지막 "이벤트 로그에서 Withdrawal 기록 확인" 단계가 자동 감지 대상이 아닙니다. 사용자가 콘솔에서 이벤트 탭을 클릭했는지 추적하지 않습니다.
- **영향:** 이 단계는 수동으로만 완료 가능하거나, 다른 가이드 자동완료 로직에 의해 우회될 수 있습니다.

---

## 4. 시각적 완성도 — 9.0 / 10

### 장점

- **탱크 시각화의 높은 완성도:** 물 높이 애니메이션(`transition: height 1s cubic-bezier`), 파도 효과(::before, ::after 의사 요소 2중 파도), 기포 애니메이션(5개 기포, 각기 다른 크기·위치·타이밍), 빛 반사 효과까지 세밀합니다 (라인 2110~2186).
- **수도꼭지 메커니즘:** 핸들 회전(`.lab3-open → rotate(-45deg)`), 물방울 떨어짐(`.lab3-faucet-drip.lab3-active`), 상단 유입 스트림(`.lab3-eth-pour`)까지 3단계 애니메이션이 자연스럽게 연결됩니다.
- **ETH 동전 날아가기 효과:** `lab3_animateFlyingCoin()` 함수가 시작점에서 도착점까지 CSS transition으로 부드럽게 이동하며, 도착 시 축소+투명화 처리됩니다 (라인 8064~8087).
- **상태별 탱크 테두리 변화:** 비어있을 때(빨간), 채울 때(녹색), 뺄 때(주황)으로 테두리와 box-shadow가 변합니다 (라인 2189~2200).
- **컬러 스킴 일관성:** CSS 변수(`--lab3-cyan`, `--lab3-purple`, `--lab3-green` 등)를 활용하여 전체적으로 통일된 다크 테마를 유지합니다.
- **마이크로 인터랙션:** 계정 카드 호버 시 `translateY(-4px)` 상승, 체크마크 완료 시 `lab3CheckBounce` 바운스 효과, 상태값 변경 시 `lab3StateChange` 깜빡임 등 세부 인터랙션이 풍부합니다.
- **탱크 눈금선:** 2/4/6/8 단위 눈금선으로 잔액을 시각적으로 읽을 수 있게 합니다 (라인 4602~4611).

### 이슈

#### [LOW] 수도꼭지 파이프 위치가 왼쪽으로 오프셋 (라인 2216, 2223, 2241)
- **현상:** `.lab3-faucet-pipe-horizontal`, `.lab3-faucet-pipe-vertical`, `.lab3-faucet-drip-container` 모두 `margin-left: -40px`로 설정되어 있어 탱크 중앙이 아닌 왼쪽에 위치합니다. 의도된 디자인일 수 있으나, 시각적 균형 측면에서 검토가 필요합니다.

#### [LOW] 탱크 최대 표시량이 10 ETH로 하드코딩 (라인 7815)
- **현상:** `var maxDisplay = 10;`으로 고정되어 있어, 10 ETH 이상 입금 시 탱크가 항상 100%로 표시됩니다.
- **권장:** 상수로 추출하거나, 동적 스케일링 적용.

---

## 5. 확장성/유지보수성 — 6.5 / 10

### 장점

- **BlockchainEngine 추상화 활용:** `BlockchainEngine.currentAccount`, `BlockchainEngine.generateAddress()`, `BlockchainEngine.advanceBlock()` 등 공통 엔진을 활용하여 Lab 1/2/3 간 일관성을 유지합니다.
- **가이드 시스템의 데이터 분리:** 가이드 단계가 `lab3GuideStepsData` 배열로 데이터화되어 있어, 단계 추가/수정이 용이합니다 (라인 7721~7734).
- **localStorage를 통한 진행 상태 유지:** 가이드 진행률이 저장/복원되어 페이지 새로고침에도 유지됩니다 (라인 9127~9149).
- **상수 파싱 시스템:** `lab3_parseConstants()` 함수가 다양한 Solidity 시간/금액 단위(`ether`, `days`, `hours`, `minutes`, `seconds`)를 파싱할 수 있어 확장성이 좋습니다 (라인 8283~8331).

### 이슈

#### [HIGH] 단일 HTML 파일에 모든 코드 집중
- **현상:** HTML, CSS, JavaScript가 모두 하나의 거대한 파일(`week5-lab.html`)에 포함되어 있습니다. Lab 3 JavaScript만 약 1,740줄, CSS만 약 1,180줄입니다.
- **영향:** 특정 기능 수정 시 파일 전체를 탐색해야 하며, 다른 Lab에 영향을 줄 위험이 있습니다. 여러 명이 동시 작업하기 어렵습니다.
- **참고:** 교육용 단일 페이지 앱의 배포 편의성과의 트레이드오프를 고려할 수 있습니다. 향후 확장 시 모듈화를 권장합니다.
  ```
  /lab3/
    lab3.html
    lab3.css
    lab3.js
    lab3-guide.js
    lab3-animations.js
  ```

#### [MEDIUM] withdraw() 결과의 "Line 30~33" 하드코딩 (라인 8659)
- **현상:** `'실행 순서 (Solidity 코드 Line 30~33):<br>'`으로 라인 번호가 하드코딩되어 있습니다.
- **영향:** 사용자가 코드를 수정하여 줄 수가 변경되면 실제 코드 위치와 불일치합니다.
- **수정 방안:** 코드에서 해당 함수의 실제 라인 범위를 동적으로 계산:
  ```javascript
  var lines = code.split('\n');
  var startLine = lines.findIndex(function(l) { return l.includes('lastWithdrawalTime[msg.sender]'); }) + 1;
  var endLine = lines.findIndex(function(l, i) { return i >= startLine && l.includes('emit Withdrawal'); }) + 1;
  ```

#### [MEDIUM] 새 함수 추가 시 HTML과 JS 양쪽 수정 필요
- **현상:** 함수 카드 UI(HTML)와 실행 로직(JS)이 분리되어 있어, 새 함수를 추가하려면 두 곳을 동시에 수정해야 합니다.
- **권장:** 함수 정의 배열에서 HTML을 동적 생성하는 방식으로 개선:
  ```javascript
  var lab3Functions = [
    { name: 'owner()', type: 'view', handler: lab3_fnOwner, description: '...' },
    // ...
  ];
  function lab3_renderFunctionCards() { /* lab3Functions 배열로부터 카드 DOM 생성 */ }
  ```

#### [LOW] 시뮬레이터 제한 사항이 하단에만 표시 (라인 4960~4961)
- **현상:** "이 시뮬레이터는 WITHDRAWAL_AMOUNT, LOCK_TIME 상수 변경과 receive() 함수 제거만 실시간 반영됩니다"라는 중요한 제한 사항이 도전과제 섹션 하단 작은 글씨로만 표시됩니다.
- **권장:** 에디터 상단이나 컴파일 버튼 영역 근처에 더 눈에 띄는 안내 배치.

---

## 6. 보안/안정성 — 7.0 / 10

### 장점

- **입력 검증 체계:** 모든 ETH 금액 입력에 `isNaN(value) || value <= 0` 검증이 있습니다 (라인 8703, 8951).
- **잔액 부족 검증:** `sender.balance < value` 확인으로 음수 잔액을 방지합니다 (라인 8744, 8959).
- **부동소수점 정밀도 관리:** `Math.round(value * 1e10) / 1e10`으로 JavaScript 부동소수점 오류를 완화합니다 (라인 8629, 8753 등).
- **에러 발생 시에도 가스비 차감:** 실제 EVM과 마찬가지로 revert된 트랜잭션에서도 가스비를 차감합니다 (라인 8135~8137).
- **escapeHtml 사용:** 이벤트 로그 출력 시 `escapeHtml(msg)`로 XSS 방지를 시도합니다 (라인 8104).
- **localStorage 접근 시 try-catch:** `lab3_saveGuideProgress`와 `lab3_loadGuideProgress`에서 localStorage 에러를 처리합니다 (라인 9128~9148).

### 이슈

#### [MEDIUM] innerHTML에 사용자 입력값 직접 삽입 (라인 8660~8661, 기타 다수)
- **현상:** 함수 결과 표시 시 `innerHTML`을 사용하면서, `lab3ShortAddr(sender.address)`나 `sender.label` 등의 값을 직접 삽입합니다. 현재 이 값들은 `BlockchainEngine`에서 생성된 것이므로 사용자 직접 입력은 아니지만, `lab3ShortAddr`의 반환값이 escapeHtml 처리되지 않습니다.
- **영향:** 현재 구현에서는 주소가 `BlockchainEngine.generateAddress()`로 생성되므로 실질적 XSS 위험은 낮습니다. 그러나 방어적 프로그래밍 관점에서 `innerHTML` 사용 시 모든 동적 값은 이스케이프 처리해야 합니다.
- **수정 방안:** 결과 표시 시 `escapeHtml()` 적용:
  ```javascript
  resultEl.innerHTML = '... ' + escapeHtml(lab3ShortAddr(sender.address)) + ' ...';
  ```
  또는 `textContent` + DOM API 조합 사용.

#### [MEDIUM] deposit/receive에 금액 상한 미설정
- **현상:** ETH 입금 시 금액 상한이 없어, 극단적으로 큰 값(예: 9999999999)을 입력할 수 있습니다.
- **영향:** 탱크 표시가 항상 100%가 되거나, 부동소수점 정밀도 문제가 발생할 수 있습니다.
- **수정 방안:** 합리적인 상한 설정:
  ```javascript
  if (value > 1000) {
    resultEl.textContent = '❌ 최대 1,000 ETH까지 입금 가능합니다';
    return;
  }
  ```

#### [LOW] `document.execCommand('copy')` 사용 (라인 9334)
- **현상:** `navigator.clipboard` 폴백으로 deprecated된 `document.execCommand('copy')`를 사용합니다.
- **영향:** 현재 브라우저에서는 아직 동작하나, 향후 제거될 수 있습니다. 교육용 앱의 특성상 최신 브라우저만 대상으로 하므로 영향은 미미합니다.

#### [LOW] JSON.parse 시 추가 검증 부재 (라인 9139)
- **현상:** `JSON.parse(localStorage.getItem(...))` 결과에 대해 `Array.isArray` 확인은 하지만, 각 항목의 `id`와 `completed` 필드 타입 검증이 없습니다.
- **영향:** localStorage가 손상된 경우 예기치 않은 동작 가능. 다만 try-catch로 감싸져 있어 크래시는 방지됩니다.

---

## 기존 보고된 이슈 검증 결과

| # | 보고된 이슈 | 검증 결과 | 심각도 |
|---|------------|----------|--------|
| 1 | "lastWithdrawalTime[현재계정]" 동적 미변경 | **확인됨** — HTML 라인 4671에 리터럴 고정, JS에서 라벨 미갱신 | HIGH |
| 2 | 도전과제 힌트 구문 하이라이팅 없음 | **확인됨** — `.hint-code`는 단색 `var(--neon-green)` (라인 1089) | MEDIUM |
| 3 | 함수 실행 시 카드 하이라이트 효과 없음 | **확인됨** — 카드에 활성 상태 클래스 추가 로직 없음 | MEDIUM |
| 4 | withdraw 결과 "Line 30~33" 하드코딩 | **확인됨** — 라인 8659에서 리터럴 문자열 | MEDIUM |
| 5 | "check-tank" 1.2초 자동완료 | **확인됨** — 라인 8801~8804, `setTimeout(1200)`으로 자동 완료 | MEDIUM |
| 6 | CSS 클래스 누락 가능성 | **반증됨** — `lab3-pulse-green`(라인 2836), `lab3-shake`(라인 2829), `lab3-pulse-red`(라인 2843) 모두 정의 확인. **누락 아님** | 해당없음 |
| 7 | 모바일 코드 에디터 높이 | **확인됨** — 미디어 쿼리에 별도 높이 미설정 (라인 1827~1841) | LOW |
| 8 | IIFE 내 `var` 사용 | **확인됨** — Lab 3 JS 전체가 `var` 사용, 파일 다른 부분은 `let/const` 혼재 | MEDIUM |

**특이사항:** 이슈 #6(CSS 클래스 누락)은 실제로는 문제가 아니었습니다. 세 클래스 모두 라인 2824~2843에 정확히 정의되어 있으며, 해당 `@keyframes`도 함께 선언되어 있습니다.

---

## 긍정적 관찰 (Positive Observations)

1. **CEI 패턴 교육이 탁월합니다.** 도전과제 4에서 재진입 공격을 실제 코드 순서 변경을 통해 체험하게 하는 것은 블록체인 보안 교육의 핵심입니다 (라인 4900~4916).
2. **상수 파싱 시스템의 유연성이 좋습니다.** `lab3_parseConstants()`가 `ether`, `days`, `hours`, `minutes`, `seconds`, 순수 숫자까지 파싱하여 다양한 코드 수정을 수용합니다.
3. **에러 메시지의 교육적 가치가 높습니다.** 단순 "실패"가 아니라 Solidity 검증 과정을 수식으로 보여주는 `<details>` 영역은 학생이 EVM의 동작 원리를 이해하는 데 매우 효과적입니다.
4. **AbortController 패턴이 현대적입니다.** 이벤트 리스너 관리에 AbortController를 사용한 것은 메모리 누수 방지에 효과적인 좋은 패턴입니다 (라인 9155~9185).
5. **시각적 디테일이 뛰어납니다.** 기포 5개의 각기 다른 크기·위치·타이밍, 2중 파도 효과, 탱크 빛 반사, 수도꼭지 핸들 회전 등 세밀한 시각적 표현이 학습 몰입도를 높입니다.
6. **가이드 진행률 유지가 사용자 친화적입니다.** 재배포 시에도 가이드 진행률이 유지되어 학습 흐름이 끊기지 않습니다.
7. **receive() 함수 존재 여부 동적 감지가 창의적입니다.** 코드에서 `receive()` 문자열을 검색하여 EVM 동작을 시뮬레이션하는 접근이 교육적으로 효과적입니다 (라인 8929).

---

## 심각도별 이슈 요약

| 심각도 | 건수 | 내용 |
|--------|:----:|------|
| **CRITICAL** | 0 | — |
| **HIGH** | 2 | 동적 라벨 미반영, 단일 파일 구조의 유지보수 한계 |
| **MEDIUM** | 8 | 카드 하이라이트 부재, 접근성 부족, var 혼재, 힌트 하이라이팅 없음, check-tank 자동완료, Line 하드코딩, innerHTML XSS, 금액 상한 미설정 |
| **LOW** | 7 | onlyOwner 코드 중복, 매직 넘버, 모바일 높이, ARIA 라벨, 탱크 최대치 하드코딩, execCommand, JSON 검증 |

---

## 최종 판정

### COMMENT — 차기 개선 권장

Lab 3 Faucet 시뮬레이터는 **교육용 블록체인 시뮬레이터로서 높은 수준의 완성도**를 보여줍니다. 특히 시각적 표현(9.0점)과 교육 효과(8.5점)에서 뛰어난 성과를 달성했습니다. CEI 패턴, receive/fallback 비교, transfer/send/call 비교 등 실무에서 중요한 보안 개념을 자연스럽게 체험할 수 있는 구조가 인상적입니다.

**즉시 수정을 권장하는 항목:**
1. `lastWithdrawalTime[현재계정]` 라벨의 동적 변경 (HIGH — 사용자 혼동 유발)
2. `innerHTML` 사용 시 `escapeHtml()` 일관 적용 (MEDIUM — 방어적 프로그래밍)
3. "Line 30~33" 하드코딩 제거 (MEDIUM — 코드 수정 시 불일치)

**차기 버전에서 개선을 권장하는 항목:**
1. 함수 실행 시 카드 하이라이트 효과 추가
2. 계정 카드 접근성(ARIA) 보강
3. 도전과제 힌트에 구문 하이라이팅 적용
4. `var` → `const`/`let` 일괄 변환

---

> *이 심사 보고서는 코드 리뷰 전문 에이전트(Claude Opus 4.6)가 작성했습니다.*  
> *파일의 관련 섹션(HTML 4491~4972, CSS 1698~2873, JS 7637~9374)을 직접 읽고 분석한 결과입니다.*
