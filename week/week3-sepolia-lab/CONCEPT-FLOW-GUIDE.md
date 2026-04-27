# Blockchain Lab #3 — 개념 및 흐름 설명서

> Sepolia / Base Sepolia / GIWA Sepolia 테스트넷 실습의 전체 구조, 핵심 개념, 실습 흐름을 정리한 문서.

---

## 1. 프로젝트 전체 구조

### 디렉토리 트리

```
week3-sepolia-lab/
├── scripts/           # 완성된 CLI 실습 코드 (01~05)
├── templates/         # TODO 코드 템플릿 (학생이 LLM으로 완성)
├── html/              # 웹 UI — index.html(MetaMask), guide.html, presentation
├── concepts/          # 학습 개념 문서 (기초~고급 4단계)
├── networks.js        # 3개 네트워크 설정 모듈
├── server.js          # Node.js HTTP API 서버 (포트 5500)
├── package.json       # ethers ^6.16.0, dotenv ^16.4.0
├── .env.example       # 환경 변수 템플릿
└── README.md
```

### 이중 학습 경로: CLI vs Web UI

학생은 두 가지 경로 중 자신에게 맞는 방식을 선택할 수 있다.

| 구분 | CLI (터미널) | Web UI (브라우저) |
|------|-------------|------------------|
| 실행 | `node scripts/01~05.js` | `npm start` 후 `http://localhost:5500` |
| 서명 | `.env`의 PRIVATE_KEY로 직접 서명 | MetaMask 지갑으로 서명 |
| 지갑 | PRIVATE_KEY에서 파생된 고정 주소 | MetaMask에 연결된 주소 |
| 추천 | 코드 동작 원리를 깊이 이해하고 싶은 학생 | 먼저 체험부터 하고 싶은 학생 |

> **주의**: CLI와 Web UI의 지갑 주소가 다를 수 있다. `.env` 개인키와 MetaMask 계정이 같은 주소인지 확인할 것.

---

## 2. 네트워크 아키텍처

### L1/L2 구조도

```
              Sepolia (L1 - 이더리움 테스트넷)
              Chain ID: 11155111
             ┌────────────┴────────────┐
       Base Sepolia (L2)         GIWA Sepolia (L2)
       by Coinbase               OP Stack
       OP Stack                  Chain ID: 91342
       Chain ID: 84532
```

- **Sepolia**는 이더리움 L1 테스트넷이며, 모든 L2의 결산(settlement) 레이어이다.
- **Base Sepolia**와 **GIWA Sepolia**는 둘 다 OP Stack 기반 L2로, 동일 기술에 다른 운영 주체를 가진다.
- 브릿지를 통해 L1과 L2 간 ETH를 이동할 수 있다.

### networks.js 구조

`networks.js`는 세 네트워크의 설정을 하나의 `NETWORKS` 객체로 관리한다.

```javascript
// NETWORKS 객체의 키별 구조
{
  sepolia: { name, rpcUrl, chainId, explorer, faucets, layer: 'L1', bridges: [] },
  base:    { name, rpcUrl, chainId, explorer, faucets, layer: 'L2', parentL1: 'sepolia', bridges: [...] },
  giwa:    { name, rpcUrl, chainId, explorer, faucets, layer: 'L2', parentL1: 'sepolia', bridges: [...] },
}
```

| 네트워크 | RPC URL | Explorer | 브릿지 |
|---------|---------|----------|--------|
| Sepolia | `https://ethereum-sepolia-rpc.publicnode.com` | `https://sepolia.etherscan.io` | - |
| Base Sepolia | `https://sepolia.base.org` | `https://sepolia.basescan.org` | Superbridge |
| GIWA Sepolia | `https://sepolia-rpc.giwa.io/` | `https://sepolia-explorer.giwa.io` | GIWA Bridge |

모듈이 제공하는 함수:

- `getNetwork()` - `.env`의 `NETWORK` 값으로 현재 네트워크 선택 (기본값: `giwa`)
- `getAllNetworks()` - 모든 네트워크 정보를 JSON 직렬화 가능 형태로 반환 (`BigInt` chainId를 `Number`로 변환)

---

## 3. 핵심 개념 4가지

### 3-1. Nonce (리플레이 방지)

**정의**: 각 이더리움 계정에서 발행한 트랜잭션의 일련번호. 0부터 시작하여 트랜잭션이 블록에 포함될 때마다 +1 증가한다.

**역할**:
- **리플레이 공격 방지**: 동일한 트랜잭션을 두 번 제출해도 nonce가 이미 사용되었으므로 거부됨
- **순서 보장**: nonce=3인 TX는 nonce=2가 처리된 후에만 실행 가능

**흐름**:

```
getTransactionCount(address) → 현재 nonce (예: 5)
          ↓
sendTransaction() 실행 → tx.nonce == 5 (자동 할당)
          ↓
블록에 포함 완료 → getTransactionCount(address) → 6 (nonce + 1)
```

**코드에서 확인** (`server.js` handleSendEth — nonceBefore/nonceAfter 비교):

```javascript
const nonceBefore = await p.getTransactionCount(w.address);  // 예: 5
const tx = await w.sendTransaction({ to, value });
await tx.wait();
const nonceAfter = await p.getTransactionCount(w.address);   // 예: 6
```

### 3-2. Gas (수수료 구조)

**정의**: EVM(이더리움 가상 머신)에서 연산을 수행하는 데 드는 비용 단위. 네트워크 스팸을 방지하고 검증자에게 보상을 제공한다.

**수수료 계산 공식**:

```
수수료(ETH) = gasUsed x gasPrice
예시: 21,000 gas x 0.25 Gwei = 0.00000525 ETH
```

**세 가지 gas 값의 차이**:

| 항목 | 설명 | 예시 |
|------|------|------|
| `gasLimit` | 트랜잭션이 소비할 수 있는 최대 gas | 단순 전송: 21,000 |
| `gasUsed` | 실제로 소비한 gas (receipt에서 확인) | 단순 전송: 21,000 |
| `gasPrice` | gas 1단위당 가격 (Gwei) | 네트워크 혼잡도에 따라 변동 |

> 1 Gwei = 10^-9 ETH. gasLimit > gasUsed이면 차액은 환불된다.

**코드에서 확인** (`server.js` handleSendEth 응답):

```javascript
const gasUsed = receipt.gasUsed;
const gasPrice = receipt.gasPrice;
const feeWei = gasUsed * gasPrice;           // 실제 수수료 (Wei)
const feeEth = ethers.formatEther(feeWei);   // ETH로 변환
const gasPriceGwei = ethers.formatUnits(gasPrice, 'gwei');
```

### 3-3. Signature r/s/v (ECDSA 서명과 ecrecover)

**정의**: 이더리움 트랜잭션의 서명 값. 개인키로 트랜잭션 데이터에 서명하면 세 값(r, s, v)이 생성된다.

**ECDSA 서명 흐름**:

```
[서명 생성]
개인키 + 트랜잭션 해시 → ECDSA 알고리즘 → (r, s, v)

[서명 검증 - ecrecover]
(r, s, v) + 트랜잭션 해시 → ecrecover → Public Key → 주소
복원된 주소 == tx.from  →  서명 유효
```

- **r, s**: 타원 곡선 위의 점 좌표에서 파생된 256비트 정수
- **v**: 복구 식별자(recovery id). 공개키 복원 시 두 후보 중 올바른 것을 선택

**핵심 원리**: 개인키는 네트워크에 전송되지 않는다. 서명(r, s, v)만 공개되며, 이것만으로 서명자의 주소를 수학적으로 역산할 수 있다.

**ethers.js v6에서의 ecrecover** (`server.js` handleVerifySig):

```javascript
// TransactionResponse에는 serialized가 없으므로 Transaction 객체를 재구성
const rawTx = new ethers.Transaction();
rawTx.type = tx.type;  rawTx.to = tx.to;  rawTx.nonce = tx.nonce;
rawTx.gasLimit = tx.gasLimit;  rawTx.value = tx.value;
rawTx.chainId = tx.chainId;   rawTx.signature = tx.signature;
rawTx.data = tx.data;
if (tx.maxFeePerGas) rawTx.maxFeePerGas = tx.maxFeePerGas;         // EIP-1559
if (tx.maxPriorityFeePerGas) rawTx.maxPriorityFeePerGas = tx.maxPriorityFeePerGas;

const recoveredAddress = rawTx.from;  // .from 접근 시 내부적으로 ecrecover 수행
const isValid = recoveredAddress.toLowerCase() === tx.from.toLowerCase();
```

### 3-4. Bridge (L1과 L2 간 자산 이동)

**정의**: L1(Sepolia)과 L2(Base Sepolia, GIWA Sepolia) 사이에서 ETH를 이동시키는 메커니즘.

**입금(Deposit)과 출금(Withdrawal)**:

```
L1 → L2 (Deposit):   L1에서 Lock → L2에서 Mint (수 분 소요)
L2 → L1 (Withdrawal): L2에서 Burn → 7일 대기(Challenge Period) → L1에서 Unlock
```

**브릿지 TX vs 단순 전송의 핵심 차이 - data 필드**:

| 구분 | data 필드 | to 주소 |
|------|----------|---------|
| 단순 ETH 전송 | `0x` (비어 있음) | 수신자 EOA |
| 브릿지 TX | function selector + 인코딩된 파라미터 | 브릿지 컨트랙트 |

**코드에서 확인** (`server.js` handleBridgeTx): `tx.data` 길이 확인, `tx.to`가 알려진 브릿지 컨트랙트(`0x49048044...` Base Bridge, `0x42000...0010` L2 Standard Bridge, `0x42000...0007` L2 Cross Domain Messenger)인지 비교, `layer` 필드로 방향 판별.

**브릿지 URL**: Superbridge(`https://superbridge.app/base-sepolia`), GIWA Bridge(`https://bridge-giwa.vercel.app`)

---

## 4. 실습 흐름 Task 1~5

### Task 1: 잔액 + Nonce 확인 (`01-check-balance.js`)

`.env` PRIVATE_KEY 로드 → Wallet으로 주소 파생 → `getBalance()` + `getTransactionCount()` → 출력

- **배우는 것**: 개인키 → 주소 파생, 잔액/nonce 조회
- **실행**: `node scripts/01-check-balance.js` 또는 `npm run step1`

### Task 2: ETH 송금 (`02-send-eth.js`)

nonceBefore 조회 → `sendTransaction({ to, value })` → `tx.wait()` → receipt에서 gasUsed/gasPrice 확인 → nonceAfter 조회 (= nonceBefore + 1)

- **배우는 것**: nonce 자동 증가, gas 수수료 실제 계산
- **실행**: `node scripts/02-send-eth.js [주소] [금액]` 또는 `npm run step2`

### Task 3: TX 추적 (`03-track-tx.js`)

TX 해시 → `getTransaction(hash)` → signature r,s,v 추출 → `getTransactionReceipt(hash)` → gasUsed x gasPrice 계산

- **배우는 것**: 트랜잭션 구조 (from, to, value, nonce, signature)
- **실행**: `node scripts/03-track-tx.js <TX_HASH>` 또는 `npm run step3 -- <TX_HASH>`

### Task 4: 서명 검증 (`04-verify-sig.js`)

TX 해시 → `getTransaction(hash)` → `ethers.Transaction` 재구성 → `rawTx.from`으로 ecrecover → 복원 주소 == tx.from이면 검증 성공

- **배우는 것**: ECDSA ecrecover 원리, 개인키 없이 서명자 확인
- **실행**: `node scripts/04-verify-sig.js <TX_HASH>` 또는 `npm run step4 -- <TX_HASH>`

### Task 5: 브릿지 TX 분석 (`05-bridge-tx.js`)

TX 해시 + 네트워크 → `getTransaction(hash)` → data 필드 길이 확인 → function selector 추출 → 브릿지 컨트랙트 매칭 → layer로 방향 추론

- **배우는 것**: 브릿지 TX와 일반 TX의 차이, L1/L2 방향 판별
- **실행**: `node scripts/05-bridge-tx.js <TX_HASH> [네트워크]` 또는 `npm run step5 -- <TX_HASH>`

---

## 5. 코드 아키텍처 흐름

### CLI 흐름

```
사용자 → node scripts/0X.js → .env 로드 → networks.getNetwork()
  → ethers.JsonRpcProvider + Wallet → 블록체인 RPC 호출 → 콘솔 출력
```

### Web UI 흐름

```
브라우저 → localhost:5500 → index.html → MetaMask 연결
  → fetch('/api/...') → server.js → ethers.js RPC → JSON 응답 → 렌더링
```

### Server API 목록 (7개 엔드포인트)

모든 API에 `?network=sepolia|base|giwa` 쿼리로 네트워크 전환 가능 (기본: `.env`의 NETWORK 값).

| # | 메서드 | 경로 | 설명 | 파라미터 |
|---|--------|------|------|----------|
| 1 | `GET` | `/api/network-info` | 전체 네트워크 설정 반환 | 없음 |
| 2 | `GET` | `/api/wallet-info` | 서버 지갑 주소, 잔액, nonce | PRIVATE_KEY 필요 |
| 3 | `GET` | `/api/balance` | 임의 주소의 잔액 + nonce | `?address=0x...` |
| 4 | `POST` | `/api/send-eth` | 서버 지갑에서 ETH 송금 | body: `{ "to": "0x...", "amount": "0.001" }` |
| 5 | `GET` | `/api/tx` | TX 해시로 트랜잭션 상세 조회 | `?hash=0x...` |
| 6 | `GET` | `/api/verify-sig` | 서명 검증 (ecrecover) | `?hash=0x...` |
| 7 | `GET` | `/api/bridge-tx` | 브릿지 TX 분석 | `?hash=0x...&network=base` |

**서버 내부 헬퍼**: `parseBody()` (POST 본문 파싱, 1KB 제한), `jsonResponse()`, `serveStaticFile()` (디렉토리 트래버설 방지), `getNetKey/getProviderFor/getWalletFor` (요청별 네트워크 전환), `isSending` 플래그 (동시 송금 방지)

---

## 6. TODO 템플릿 학습 방식

`templates/` 디렉토리에는 핵심 로직이 TODO 주석으로 비워진 코드 템플릿이 있다.

### 학습 과정

1. `templates/` 폴더의 파일을 열어 TODO 부분 확인
2. LLM(Claude, ChatGPT 등)에게 "이 TODO 부분을 완성해줘" 요청
3. 생성된 코드를 **이해한 후** 실행: `node templates/01-check-balance.js`
4. `scripts/` 폴더의 완성된 코드와 비교: `node scripts/01-check-balance.js`

**원칙**: LLM 생성 코드를 그대로 쓰지 말고 각 줄에 주석을 달아 이해할 것. `scripts/`는 정답지이지 제출물이 아니다.

---

## 7. 교수님 지시사항 반영 현황

| # | 지시사항 | 반영 상태 | 구현 위치 |
|---|---------|----------|----------|
| 1 | Nonce 개념 실습 | 반영 완료 | `scripts/01,02`, `/api/wallet-info`, `/api/send-eth` |
| 2 | Gas 수수료 확인 | 반영 완료 | `scripts/02,03`, `/api/send-eth`, `/api/tx` |
| 3 | Signature r/s/v 확인 | 반영 완료 | `scripts/03,04`, `/api/tx`, `/api/verify-sig` |
| 4 | ecrecover 서명 검증 | 반영 완료 | `scripts/04-verify-sig.js`, `/api/verify-sig` |
| 5 | Bridge TX 분석 | 반영 완료 | `scripts/05-bridge-tx.js`, `/api/bridge-tx` |
| 6 | 3개 테스트넷 지원 | 반영 완료 | `networks.js` (Sepolia, Base, GIWA) |
| 7 | CLI + Web UI 이중 경로 | 반영 완료 | `scripts/` + `html/index.html` + `server.js` |
| 8 | LLM 활용 학습 (TODO) | 반영 완료 | `templates/` 디렉토리 |
| 9 | MetaMask 연동 | 반영 완료 | `html/index.html` (window.ethereum) |
| 10 | Explorer 링크 제공 | 반영 완료 | 모든 TX 관련 API 응답에 `explorerLink` 포함 |
| 11 | 보안 경고 명시 | 반영 완료 | `server.js` 상단 주석, README 등 |
| 12 | 개념 문서 제공 | 반영 완료 | `concepts/` 디렉토리 (기초~고급 4단계) |

---

## 8. 보안 고려사항

### 현재 구현된 보안 조치

| 항목 | 구현 | 상세 |
|------|------|------|
| CORS 제한 | `ALLOWED_ORIGIN = 'http://localhost:5500'` | 로컬호스트만 허용 |
| 디렉토리 트래버설 방지 | `path.resolve` + `startsWith` 검사 | `../` 공격 차단 |
| `.env` 파일 접근 차단 | `basename` 검사로 `.env`, `.env.example` 차단 | 개인키 노출 방지 |
| 요청 본문 크기 제한 | `MAX_BODY_SIZE = 1024` (1KB) | 메모리 고갈 공격 방지 |
| 동시 송금 방지 | `isSending` 플래그 | Nonce 충돌 예방 |
| 주소 유효성 검사 | `ethers.getAddress()` | 잘못된 주소 거부 |
| 송금 금액 검증 | `parseFloat` + `> 0` 검사 | 비정상 금액 거부 |
| Graceful Shutdown | `SIGINT` 핸들러 | 진행 중인 연결 정리 후 종료 |

### 프로덕션(메인넷) 전환 시 필수 추가 사항

`server.js` 상단 주석에 명시된 경고:

1. **API 인증/인가** — JWT, API Key 등 추가 (현재는 인증 없음)
2. **HTTPS 적용** — TLS 인증서 적용 (현재는 HTTP)
3. **Rate Limiting** — API 호출 빈도 제한 (현재는 제한 없음)
4. **환경별 CORS 정책** — 프로덕션 도메인만 허용
5. **개인키 관리** — HSM, KMS 사용 (서버에 직접 보관 금지)

### 학생 주의사항

- `.env` 파일을 GitHub에 절대 올리지 말 것 (`.gitignore`에 포함되어 있음)
- **테스트넷 개인키만 사용**할 것 (메인넷 개인키 사용 금지)
- `/api/send-eth`는 인증 없이 서버 지갑으로 송금하므로 교육/테스트넷 전용

---

> 이 문서는 `networks.js`, `server.js`, `README.md`의 실제 코드를 기반으로 작성되었다.
