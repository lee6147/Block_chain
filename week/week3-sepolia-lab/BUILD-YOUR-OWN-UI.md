# Build Your Own Blockchain Dashboard

> AI를 활용하여 나만의 블록체인 대시보드를 구축하고, 직접 트랜잭션을 실행해보는 실습 과제

---

## 과제 개요

- **AI(Claude, ChatGPT 등)를 활용**하여 블록체인 대시보드 웹 UI를 직접 구축한다
- 구축한 UI를 통해 **실제 테스트넷에서 트랜잭션을 실행**한다
- 코드를 복사-붙여넣기하는 것이 아니라, AI와 대화하며 **직접 만들면서 개념을 체득**한다

> [!important]
> 이 과제의 핵심은 "완성된 코드"가 아니라 **"AI와 협업하여 이해하며 구축하는 과정"**입니다.
> AI가 생성한 코드를 그대로 사용하지 말고, 각 줄이 무엇을 하는지 반드시 이해하세요.

---

## 기술 스택

| 구분 | 사용 기술 |
|------|-----------|
| 프론트엔드 | **HTML** (단일 파일) |
| 블록체인 라이브러리 | **ethers.js v6** CDN |
| 스타일링 | **Tailwind CSS** CDN |
| 지갑 | **MetaMask** 브라우저 확장 |
| 백엔드 | **불필요** (100% 클라이언트 사이드) |

CDN 링크:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/ethers/6.13.4/ethers.umd.min.js"></script>
<script src="https://cdn.tailwindcss.com"></script>
```

> [!info]
> 단일 HTML 파일로 구현하므로 별도의 빌드 도구나 서버가 필요 없습니다.
> 브라우저에서 파일을 열기만 하면 동작합니다.

---

## 네트워크 정보

아래 3개 테스트넷을 사용합니다. MetaMask에 모두 추가하세요.

| 네트워크 | Chain ID | RPC URL | Explorer | Faucet |
|----------|----------|---------|----------|--------|
| **Sepolia** | `11155111` | `https://ethereum-sepolia-rpc.publicnode.com` | [sepolia.etherscan.io](https://sepolia.etherscan.io) | Alchemy, Chainlink, Google Cloud faucets |
| **Base Sepolia** | `84532` | `https://sepolia.base.org` | [sepolia.basescan.org](https://sepolia.basescan.org) | Alchemy, QuickNode faucets |
| **GIWA Sepolia** | `91342` | `https://sepolia-rpc.giwa.io/` | [sepolia-explorer.giwa.io](https://sepolia-explorer.giwa.io) | [GIWA Faucet](https://faucet.giwa.io/) (0.005 ETH/24h), [Lambda256](https://faucet.lambda256.io/giwa-sepolia) (0.01 ETH/24h) |

> [!warning]
> 테스트넷 ETH는 실제 가치가 없지만, private key는 절대 공유하지 마세요.
> Faucet에서 ETH를 미리 확보해두어야 실습이 원활합니다.

---

## Phase 1: 환경 설정

### 1-1. MetaMask 설치 및 지갑 생성

- [MetaMask 공식 사이트](https://metamask.io/)에서 브라우저 확장 설치
- 새 지갑을 생성하거나 기존 지갑 사용
- **Seed Phrase를 안전한 곳에 보관**

### 1-2. 테스트넷 3개 추가

MetaMask > Settings > Networks > Add Network에서 위 테이블의 정보를 입력하여 3개 네트워크를 모두 추가합니다.

### 1-3. Faucet으로 테스트 ETH 확보

- 각 네트워크별 Faucet에서 테스트 ETH를 요청합니다
- 최소 **0.01 ETH 이상** 확보를 권장합니다

> [!info]
> Faucet은 일일 요청 한도가 있으므로, 실습 전날 미리 확보해두세요.

---

## Phase 2: AI로 UI 구축

AI에게 단계별로 프롬프트를 주어 대시보드를 점진적으로 완성합니다.
각 Step을 완료한 후 다음 Step으로 진행하세요.

---

### Step 1: 지갑 연결

**구현 목표:**
MetaMask 지갑을 연결하고, 연결된 주소의 정보를 화면에 표시한다.

**AI 프롬프트 예시:**
> "ethers.js v6와 Tailwind CSS를 사용하는 단일 HTML 파일을 만들어줘.
> MetaMask 지갑 연결 버튼이 있고, 연결하면 주소, 잔액, 트랜잭션 수를 표시해줘."

**핵심 개념:**

| 개념 | 설명 |
|------|------|
| `BrowserProvider` | MetaMask 같은 브라우저 지갑을 ethers.js와 연결하는 provider |
| `getSigner()` | 트랜잭션에 서명할 수 있는 signer 객체를 반환 |
| `getBalance()` | 해당 주소의 현재 잔액(Wei 단위)을 조회 |
| `getTransactionCount()` | 해당 주소에서 발생한 트랜잭션 수 (= nonce) |

**확인 사항:**
- [ ] "지갑 연결" 버튼 클릭 시 MetaMask 팝업이 뜨는가?
- [ ] 연결된 주소가 화면에 표시되는가?
- [ ] 잔액이 ETH 단위로 올바르게 표시되는가?
- [ ] 트랜잭션 수(nonce)가 표시되는가?
- [ ] 네트워크 전환 시 정보가 업데이트되는가?

---

### Step 2: ETH 송금

**구현 목표:**
수신 주소와 금액을 입력하여 ETH를 전송하고, 트랜잭션 결과를 확인한다.

**AI 프롬프트 예시:**
> "Step 1에 이어서, 수신 주소와 ETH 금액을 입력하면 송금하는 기능을 추가해줘.
> 트랜잭션 해시, 상태, 사용된 가스를 표시해줘."

**핵심 개념:**

| 개념 | 설명 |
|------|------|
| `sendTransaction()` | 서명된 트랜잭션을 네트워크에 전송 |
| `tx.wait()` | 트랜잭션이 블록에 포함될 때까지 대기 |
| `gasUsed` | 트랜잭션 실행에 실제 소비된 가스량 |
| `nonce` | 해당 주소의 트랜잭션 순서 번호 (재전송 방지) |

**확인 사항:**
- [ ] 수신 주소와 금액 입력 폼이 있는가?
- [ ] 전송 버튼 클릭 시 MetaMask 서명 요청이 뜨는가?
- [ ] 트랜잭션 해시가 Explorer 링크와 함께 표시되는가?
- [ ] 전송 완료 후 잔액이 업데이트되는가?
- [ ] gasUsed와 nonce 값을 확인할 수 있는가?

---

### Step 3: 트랜잭션 추적

**구현 목표:**
트랜잭션 해시를 입력하면 상세 정보를 조회하여 표시한다.

**AI 프롬프트 예시:**
> "트랜잭션 해시를 입력하면 해당 트랜잭션의 상세 정보를 조회하는 기능을 추가해줘.
> from, to, value, gas, 블록 번호, 그리고 signature의 r, s, v 값을 표시해줘."

**핵심 개념:**

| 개념 | 설명 |
|------|------|
| `getTransaction()` | 트랜잭션 해시로 트랜잭션 원본 데이터 조회 |
| `getTransactionReceipt()` | 트랜잭션 실행 결과(receipt) 조회 |
| `signature (r, s, v)` | ECDSA 서명의 구성 요소. 서명자를 검증하는 데 사용 |

**확인 사항:**
- [ ] 트랜잭션 해시 입력 폼이 있는가?
- [ ] from, to, value, gasUsed 등 기본 정보가 표시되는가?
- [ ] 블록 번호와 블록 내 위치(index)가 표시되는가?
- [ ] signature의 r, s, v 값이 표시되는가?
- [ ] Explorer 링크가 제공되는가?

---

### Step 4: 서명 검증

**구현 목표:**
트랜잭션의 서명을 분석하여, 실제 서명자가 `tx.from`과 일치하는지 검증한다.

**AI 프롬프트 예시:**
> "Step 3에서 조회한 트랜잭션의 서명을 검증하는 기능을 추가해줘.
> ethers.Transaction 클래스로 unsigned hash를 만들고, ecrecover로 복원한 주소가
> tx.from과 일치하는지 비교해줘."

**핵심 개념:**

| 개념 | 설명 |
|------|------|
| `ethers.Transaction` | 트랜잭션 객체를 직접 구성하여 unsigned hash를 생성 |
| `ecrecover` | 서명(r, s, v)과 메시지 해시로부터 공개키/주소를 복원 |
| `tx.from` 비교 | 복원된 주소와 트랜잭션의 from 주소가 일치하면 서명이 유효 |

**확인 사항:**
- [ ] unsigned transaction hash가 표시되는가?
- [ ] 서명에서 복원된 주소가 표시되는가?
- [ ] `tx.from`과의 일치 여부가 명확하게 표시되는가?
- [ ] 검증 성공/실패 상태가 시각적으로 구분되는가?

---

### Step 5 (보너스): 브릿지 TX 분석

**구현 목표:**
브릿지 트랜잭션의 `data` 필드를 분석하여 function selector와 파라미터를 해석한다.

**AI 프롬프트 예시:**
> "트랜잭션의 data 필드를 분석하는 기능을 추가해줘.
> 앞 4바이트(function selector)를 추출하고, 나머지 데이터를 32바이트 단위로 파싱해줘."

**핵심 개념:**

| 개념 | 설명 |
|------|------|
| `data` 필드 | 스마트 컨트랙트 호출 시 전달되는 인코딩된 데이터 |
| `function selector` | data의 앞 4바이트 (8자리 hex). 호출할 함수를 식별 |
| ABI encoding | 함수 파라미터가 32바이트 단위로 인코딩되는 방식 |

**확인 사항:**
- [ ] data 필드의 raw hex가 표시되는가?
- [ ] function selector (4 bytes)가 분리 표시되는가?
- [ ] 파라미터가 32바이트 단위로 파싱되어 표시되는가?

> [!info]
> Step 5는 보너스 과제입니다. Step 1-4를 먼저 완성한 후 도전하세요.

---

## Phase 3: 내 UI로 거래 실행

구축한 대시보드를 사용하여 아래 작업을 수행합니다.

1. **Sepolia에서 ETH 송금** - 자신의 다른 주소 또는 동료에게 전송
2. **GIWA Sepolia에서 ETH 송금** - 동일하게 전송 후 트랜잭션 추적
3. **트랜잭션 서명 검증** - Step 2에서 보낸 트랜잭션의 서명을 Step 4로 검증
4. **(보너스) 브릿지 트랜잭션 분석** - Sepolia <-> Base Sepolia 브릿지 TX 분석

> [!warning]
> 소량의 ETH로 테스트하세요. 실수로 전체 잔액을 보내지 않도록 주의합니다.

---

## AI 활용 가이드라인

### 권장하는 방식

- **단계별로 요청**: 한 번에 전체를 만들지 말고, Step별로 나누어 요청
- **코드 설명 요청**: "이 코드에서 `BrowserProvider`가 하는 역할을 설명해줘"
- **에러 해결**: 에러 메시지를 AI에게 보여주고 원인과 해결법을 질문
- **개선 요청**: "이 UI를 더 보기 좋게 개선해줘" 또는 "에러 처리를 추가해줘"

### 지양하는 방식

- 전체 코드를 한 번에 생성하여 복사-붙여넣기
- 코드를 이해하지 않고 그대로 제출
- AI 답변을 검증 없이 신뢰

> [!important]
> AI가 생성한 코드에 오류가 있을 수 있습니다.
> 반드시 **직접 실행하고 테스트**하여 동작을 확인하세요.

---

## 참고 자료

- [ethers.js v6 공식 문서](https://docs.ethers.org/v6/)
- [MetaMask 공식 문서](https://docs.metamask.io/)
- [Solidity by Example](https://solidity-by-example.org/)
- [Ethereum Developer Resources](https://ethereum.org/developers)
- [Tailwind CSS 공식 문서](https://tailwindcss.com/docs)

---

## 제출물

| 항목 | 설명 |
|------|------|
| **GitHub URL** | 완성된 HTML 파일이 포함된 저장소 링크 |
| **스크린샷** | 각 Step 동작 화면 캡처 (최소 Step 1-4) |
| **브릿지 TX Hash** | (보너스) 분석한 브릿지 트랜잭션 해시 |

### 제출 구조 예시

```
my-blockchain-dashboard/
├── index.html          # 메인 대시보드 (단일 파일)
├── screenshots/
│   ├── step1-wallet.png
│   ├── step2-transfer.png
│   ├── step3-tracking.png
│   ├── step4-verify.png
│   └── step5-bridge.png   # (보너스)
└── README.md           # 간단한 설명 및 학습 내용 정리
```

---

## 평가 기준

| 항목 | 비중 | 세부 내용 |
|------|------|-----------|
| **기능 완성도** | 40% | Step 1-4 기능이 정상 동작하는가 |
| **코드 이해도** | 25% | 코드의 각 부분을 설명할 수 있는가 |
| **핵심 개념 반영** | 20% | Provider, Signer, nonce, signature 등 개념이 UI에 반영되었는가 |
| **창의적 개선** | 15% | 기본 요구사항 외 추가 기능이나 UX 개선이 있는가 |

> [!info]
> 창의적 개선 예시: 다크 모드, 트랜잭션 히스토리 저장, 가스 추정 기능,
> 네트워크 자동 감지, 다국어 지원, 반응형 디자인 등

---

## 주의사항

1. **Private Key를 코드에 하드코딩하지 마세요** - MetaMask를 통해 서명합니다
2. **테스트넷만 사용하세요** - Mainnet에 연결하지 않도록 주의합니다
3. **Faucet ETH를 아껴 쓰세요** - 소액(0.001 ETH)으로 테스트합니다
4. **GitHub에 민감 정보를 올리지 마세요** - `.env`, private key, seed phrase 등
5. **AI 생성 코드를 반드시 검증하세요** - 실행 전에 코드를 읽고 이해합니다

> [!warning]
> 제출된 코드에 대해 질문할 수 있습니다.
> 자신이 작성한 코드를 **설명할 수 없으면 감점** 대상입니다.
> AI를 활용하되, 반드시 이해한 후 제출하세요.
