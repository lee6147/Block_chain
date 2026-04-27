# week5-lab.html 교수님 요구사항 충족도 분석 리포트

> 분석 일시: 2026-04-11
> 분석 대상: `week5-lab.html` (10,176줄, SPA)
> 분석 기준: 김형중 교수님 통화 녹취록 기반 요구사항 6가지

---

## 총점: 100점 만점 중 35점 → 개선 후 80점 (추정)

| 평가 항목 | 배점 | 득점 | 판정 |
|-----------|------|------|------|
| 요구사항 1: ABI 활용 웹 인터페이스 | 25 | 5 | **미충족** |
| 요구사항 2: ABI 기반 함수/입출력 → UI 자동 생성 | 20 | 10 | **부분충족** (Lab1/2만) |
| 요구사항 3: Faucet + ABI 연결 | 25 | 5 | **미충족** |
| 요구사항 4: LLM 검증 통과 가능성 | 10 | 3 | **미충족** |
| 요구사항 5: "ABI 어떻게 이용했냐?" 답변 가능성 | 10 | 7 | **부분충족** |
| 요구사항 6: 함수/입출력 HTML 시각화 | 10 | 5 | **부분충족** |

---

## 1. 핵심 결론

### 가장 큰 Gap: **표준 Ethereum ABI JSON을 전혀 사용하지 않았다**

이 프로젝트는 **순수 JavaScript 시뮬레이션**으로 설계되었으며, 실제 블록체인이나 표준 ABI와 완전히 단절되어 있다.

- `ethers.js`, `web3.js`, `MetaMask` 연동: **없음**
- 표준 ABI JSON (`[{"type":"function","name":"withdraw","inputs":[],...}]`): **없음**
- 실제 블록체인 연결: **없음**

---

## 2. 요구사항별 상세 분석

### 요구사항 1: "스마트 컨트랙트의 ABI를 활용하여 웹 인터페이스를 구현" → **미충족**

표준 ABI는 Ethereum에서 정의한 JSON 형식이다:
```json
[{"type":"function","name":"withdraw","inputs":[],"outputs":[],"stateMutability":"nonpayable"}]
```

이 파일에는 이러한 표준 ABI JSON이 **단 한 곳도 존재하지 않는다**.

- **Lab 1/2**: `parseSolidity()` 함수가 정규식으로 Solidity 소스를 직접 파싱하여 `{publicVars:[], viewFunctions:[], writeFunctions:[]}` 형태의 **커스텀 객체**를 만든다. 이것은 ABI가 아니라 자체 포맷이다.
- **Lab 3 (Faucet)**: 함수 UI가 HTML에 **직접 하드코딩**되어 있다. ABI를 파싱하거나 사용하는 로직이 없다.

### 요구사항 2: "ABI를 통해 어떤 함수가 있고, 입력/출력 파악하여 HTML/JS로 화면 구성" → **부분충족**

- **Lab 1/2** (부분 충족): `buildInteractionPanel()` 함수가 `state.abi` 객체를 순회하며 함수 버튼과 입력 필드를 **동적으로 생성**한다. "ABI에서 함수 정보를 읽어 UI를 자동 생성한다"는 **개념**을 교육적으로 구현했다. 단, 입력 소스가 표준 ABI가 아닌 정규식 파싱 결과이다.
- **Lab 3** (미충족): 함수 목록이 HTML에 정적으로 작성되어 있고, ABI나 파싱 결과를 참조하지 않는다.

### 요구사항 3: "Faucet 컨트랙트를 ABI와 연결하여 결과를 보여주는 것" → **미충족**

Lab 3의 Faucet은 ABI를 전혀 사용하지 않는다:
- 컨트랙트 상태는 `lab3Contract` 순수 JS 객체로 관리
- 각 함수(`withdraw`, `deposit`, `withdrawAll` 등)가 개별 `window.lab3_xxx` 함수로 **수동 구현**
- 배포 시 `lab3_parseConstants()`가 코드에서 **상수 2개만** 정규식 추출
- Solidity 로직을 JS로 수동 재구현

### 요구사항 4: "코드를 LLM에 입력하여 ABI 활용 확인" → **미충족**

LLM이 이 코드를 분석하면 **"표준 ABI를 사용하지 않았다"**는 결론에 도달한다.

### 요구사항 5: "ABI를 어떻게 이용했냐?" 질문 답변 가능성 → **부분충족**

| 답변 가능 | 답변 불가 |
|-----------|-----------|
| Lab1/2의 동적 UI 생성 패턴 설명 | "표준 ABI JSON을 파싱했다"는 주장 |
| public/view/write 함수 구분 로직 | "Faucet의 ABI에서 함수를 꺼내왔다" |
| 커스텀 파서의 동작 원리 | "ABI의 inputs/outputs를 활용했다" |

### 요구사항 6: "함수, 입력값, 출력값을 ABI를 통해 파악하고 HTML로 시각화" → **부분충족**

시각화 자체는 매우 우수하다 (Faucet 탱크 애니메이션, 계정 카드, 가스비 통계 등). 그러나 **ABI 기반**이 아니라 **하드코딩 기반**이다.

---

## 3. 현재 잘 되어있는 부분 (긍정적 평가)

시뮬레이터의 교육적 품질 자체는 매우 높다:

1. **Faucet 시각화**: 탱크 애니메이션, ETH 유입/유출 효과, 계정별 쿨다운 바
2. **보안 교육**: CEI 패턴, Sybil Attack, Reentrancy 설명
3. **12단계 가이드 시나리오**: 체계적인 실습 흐름
4. **코드 에디터**: Solidity 구문 하이라이팅, 코드 실행 추적
5. **도전과제 6개 + 고급 도전과제 3개**: 난이도별 과제 설계
6. **가스비 시뮬레이션**: 실제 EVM과 유사한 가스 계산

---

## 4. 교수님께 답변 전략

### 솔직하게 말할 수 있는 것:
> "Lab 1/2에서는 Solidity 소스코드를 파싱하여 ABI와 유사한 구조를 추출하고, 이를 기반으로 함수 버튼과 입력 필드를 동적으로 생성했습니다. 이는 '컴파일러가 ABI를 생성하고, 프론트엔드가 ABI를 읽어 UI를 구성한다'는 실제 DApp 개발 흐름을 교육적으로 시뮬레이션한 것입니다."

### 답변할 수 없는 것:
> "표준 ABI JSON을 파싱하여 사용했습니다" — 코드 검증 시 즉시 반박됨

---

## 5. 개선 권장사항

### [최우선] Lab 3에 표준 ABI JSON 도입

**현재 상태:**
```javascript
// 하드코딩된 함수 호출
window.lab3_withdraw = function() { ... }
window.lab3_deposit = function() { ... }
```

**개선 방향:**
```javascript
// 표준 ABI JSON 정의
const FAUCET_ABI = [
  {"type":"function","name":"withdraw","inputs":[],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"deposit","inputs":[],"outputs":[],"stateMutability":"payable"},
  {"type":"function","name":"owner","inputs":[],"outputs":[{"type":"address"}],"stateMutability":"view"},
  // ...
];

// ABI를 순회하며 UI 자동 생성
FAUCET_ABI.forEach(item => {
  if (item.type === 'function') {
    // 함수 카드 동적 생성
    // 입력 필드 자동 생성 (item.inputs 기반)
    // 출력 타입 표시 (item.outputs 기반)
  }
});
```

### [높은 우선] Lab 1/2의 커스텀 구조를 표준 ABI 형식으로 변환

`parseSolidity()` 출력 형식을 표준 ABI JSON으로 변경하면, "ABI를 어떻게 이용했는가?"에 표준 형식을 제시할 수 있다.

### [선택] ABI JSON 뷰어 패널 추가

컴파일 성공 시 생성된 ABI JSON을 별도 패널에 표시하여, 학생이 "이 ABI에서 이 UI가 만들어졌다"는 연결고리를 시각적으로 확인할 수 있게 함.

---

## 6. 선택지 비교

| 옵션 | 장점 | 단점 | 교수님 충족도 |
|------|------|------|-------------|
| 현재 유지 (시뮬레이션) | 외부 의존성 없음, 오프라인 동작 | 교수님 요구사항 미충족 | 35점 |
| **표준 ABI JSON 도입 (시뮬레이션 유지)** | 요구사항 충족, 오프라인 유지 | Lab3 대폭 수정 필요 | **75~85점** |
| ethers.js + 실제 테스트넷 연결 | 완벽한 충족, 실무 경험 | 환경 복잡, MetaMask 필요 | 95점 |

---

## 7. 핵심 코드 참조

| 위치 | 내용 | 비고 |
|------|------|------|
| `line 6359-6416` | `parseSolidity()` | 정규식 기반 커스텀 파서 (표준 ABI 아님) |
| `line 6592-6707` | `buildInteractionPanel()` | Lab 1/2 동적 UI 생성 (유일한 "ABI-like" 패턴) |
| `line 4738-4850` | Lab 3 함수 카드 HTML | 전부 하드코딩 |
| `line 7870-7881` | `lab3Contract` 객체 | Faucet 상태 순수 JS 관리 |
| `line 8501-8549` | `lab3_parseConstants()` | 상수 2개만 정규식 추출 |
| `line 8657-8746` | Lab 3 읽기 함수들 | 개별 하드코딩된 window 전역 함수 |

---

*분석: Claude Opus 4.6 블록체인 전문 에이전트팀*
