# Blockchain Lab #3 — Sepolia / Base Sepolia / GIWA Sepolia 테스트넷 실습

이더리움 테스트넷 3개에서 Nonce · Gas · Signature · Bridge를 직접 코드로 확인하는 3주차 실습 프로젝트.

---

## 프로젝트 설명

### 수업 목표

이더리움의 핵심 개념 네 가지를 **실제 테스트넷에서 직접 관찰**한다.

| 개념 | 설명 | 코드에서 확인하는 것 |
|------|------|---------------------|
| **Nonce** | 트랜잭션 일련번호. 리플레이 공격 방지 | 송금 전후 nonce +1 증가 |
| **Gas** | EVM 연산 비용. 스팸 방지 + 검증자 보상 | 실제 수수료 = gasUsed × gasPrice |
| **Signature (r, s, v)** | ECDSA 서명. Private Key 소유 증명 | ecrecover로 서명자 주소 복원 |
| **Bridge** | L1↔L2 크로스체인 자산 이동 | 브릿지 TX의 data 필드, 방향 분석 |

### 네트워크 구조

```
              Sepolia (L1 - 이더리움 테스트넷)
             ┌──────────┴──────────┐
       Base Sepolia (L2)     GIWA Sepolia (L2)
       by Coinbase            OP Stack
       OP Stack               Chain ID: 91342
       Chain ID: 84532
```

- **Sepolia**는 이더리움 L1 테스트넷 (모든 L2의 기반)
- **Base Sepolia**와 **GIWA Sepolia**는 둘 다 OP Stack 기반 L2 (같은 기술, 다른 네트워크)
- 브릿지를 통해 L1 ↔ L2 간 ETH를 이동할 수 있다

### 5단계 실습 구성

```
1단계  →  잔액 + Nonce 확인       (01-check-balance.js)
2단계  →  ETH 실제 송금           (02-send-eth.js)
3단계  →  TX 추적 + 서명 검증     (03-track-tx.js, 04-verify-sig.js)
4단계  →  브릿지 TX 분석          (05-bridge-tx.js)
웹 UI  →  MetaMask 연결 인터페이스 (index.html + server.js)
```

---

## 네트워크 정보

| 네트워크 | 유형 | Chain ID | RPC URL | Explorer |
|---------|------|----------|---------|----------|
| Sepolia | L1 (이더리움 테스트넷) | 11155111 | `https://ethereum-sepolia-rpc.publicnode.com` | `https://sepolia.etherscan.io` |
| Base Sepolia | L2 (OP Stack, Coinbase) | 84532 | `https://sepolia.base.org` | `https://sepolia.basescan.org` |
| GIWA Sepolia | L2 (OP Stack) | 91342 | `https://sepolia-rpc.giwa.io/` | `https://sepolia-explorer.giwa.io` |

### Faucet (테스트 ETH 받기)

**Sepolia (L1):**
- https://www.alchemy.com/faucets/ethereum-sepolia
- https://faucets.chain.link/sepolia
- https://cloud.google.com/application/web3/faucet/ethereum/sepolia

**Base Sepolia:**
- https://www.alchemy.com/faucets/base-sepolia
- https://faucet.quicknode.com/base/sepolia

**GIWA Sepolia:**
- https://faucet.giwa.io/ (0.005 ETH / 24h)
- https://faucet.lambda256.io/giwa-sepolia (0.01 ETH / 24h)

### 브릿지

| 브릿지 | 경로 | URL |
|-------|------|-----|
| Superbridge | Sepolia ETH ↔ Base Sepolia ETH | https://superbridge.app/base-sepolia |
| GIWA Bridge | Sepolia ETH ↔ GIWA Sepolia ETH | https://bridge-giwa.vercel.app |

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| 런타임 | Node.js |
| 이더리움 라이브러리 | ethers.js v6 (`^6.16.0`) |
| 환경 변수 | dotenv (`^16.4.0`) |
| 웹 서버 | Node.js 내장 `http` 모듈 |
| 프론트엔드 CSS | Tailwind CSS CDN |
| 프론트엔드 이더리움 | ethers.js v6 UMD CDN |
| 테스트넷 | Sepolia L1 + Base Sepolia L2 + GIWA Sepolia L2 |

---

## 설치 및 실행

### 1. 패키지 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example`을 복사하여 `.env`를 만든다.

```bash
cp .env.example .env
```

`.env` 파일을 열고 값을 채운다:

```env
# 네트워크 선택: sepolia, base, giwa (기본: giwa)
NETWORK=giwa

# 이더리움 지갑 개인키 (0x 없이 입력)
PRIVATE_KEY=your_private_key_here
```

> **주의**: `.env` 파일에 실제 개인키를 넣으면 절대 GitHub에 올리지 마세요.
> 테스트넷 개인키만 사용할 것! (메인넷 개인키 사용 금지!)

### 3. Faucet에서 테스트 ETH 받기

각 네트워크의 Faucet에서 테스트 ETH가 필요하다. 위 Faucet 목록 참조.

### 4. 서버 시작

```bash
npm start
```

브라우저에서 http://localhost:5500 접속.

---

## 프로젝트 구조

```
week3-sepolia-lab/
├── scripts/                   # 정답 코드 (5단계 CLI 스크립트)
│   ├── 01-check-balance.js   # 잔액 + nonce 확인
│   ├── 02-send-eth.js        # ETH 송금 (nonce/gas 관찰)
│   ├── 03-track-tx.js        # TX 추적 (서명 r,s,v 출력)
│   ├── 04-verify-sig.js      # 서명 검증 (ecrecover)
│   └── 05-bridge-tx.js       # 브릿지 TX 분석
├── templates/                 # 학생용 시작 파일
│   └── starter.html          # AI로 확장할 HTML 골격 (TODO 포함)
├── html/
│   ├── index.html            # MetaMask 연결 웹 인터페이스 (참고 구현)
│   ├── guide.html            # 실습 가이드
│   └── presentation-week_3.html
├── concepts/                  # 학습 개념 문서
│   ├── 01-기초-블록체인과-GIWA.md
│   ├── 02-중급-Nonce-Gas-Signature.md
│   ├── 03-고급-L2아키텍처와-보안.md
│   └── 04-실습-송금과-트랜잭션-추적.md
├── screenshots/               # 실습 참고 스크린샷 (18장)
├── networks.js               # 3개 네트워크 설정 (Sepolia/Base/GIWA)
├── server.js                 # Node.js HTTP API 서버
├── package.json
├── .env.example              # 환경 변수 예시
├── .gitignore
├── README.md                 # 이 파일
├── BUILD-YOUR-OWN-UI.md      # 과제 안내문 (AI로 UI 구축)
└── CONCEPT-FLOW-GUIDE.md     # 개념과 흐름 설명서
```

---

## AI를 활용한 UI 구축 (Build Your Own Dashboard)

학생들은 AI(Claude, ChatGPT 등)를 활용하여 **나만의 블록체인 대시보드**를 직접 구축한다.

### 사용 방법

1. `templates/starter.html`을 열어 TODO 부분을 확인한다.
2. AI에게 Step별로 기능을 하나씩 추가해 달라고 요청한다.
3. 생성된 코드를 이해하고, 한글 주석을 추가한다.
4. 완성된 UI로 실제 테스트넷 트랜잭션을 실행한다.

> **상세 안내**: `BUILD-YOUR-OWN-UI.md` 참조.

```bash
# 시작 파일을 브라우저에서 열기 (서버 불필요)
# starter.html을 브라우저에 드래그 앤 드롭하거나 더블클릭

# 참고 구현 확인 (서버 필요)
npm start
# http://localhost:5500 접속
```

> **중요**: AI가 생성한 코드를 그대로 쓰지 말고, 반드시 이해한 후 사용할 것.
> 코드에 주석을 달아서 각 줄이 무엇을 하는지 설명할 것.

---

## CLI 스크립트 사용법

### 01-check-balance.js — 잔액 + Nonce 확인

```bash
node scripts/01-check-balance.js
# 또는
npm run step1
```

`.env`의 `PRIVATE_KEY`로 지갑 주소를 파생한 뒤 잔액과 현재 nonce를 출력한다.

---

### 02-send-eth.js — ETH 송금

```bash
# 자기 자신에게 0.001 ETH 송금 (기본값)
node scripts/02-send-eth.js
npm run step2

# 특정 주소로 특정 금액 송금
node scripts/02-send-eth.js 0xRecipientAddress 0.005
```

송금 전후 nonce 변화, 실제 gas 수수료를 출력한다. Explorer 링크도 제공한다.

---

### 03-track-tx.js — 트랜잭션 추적

```bash
node scripts/03-track-tx.js <트랜잭션_해시>
npm run step3 -- 0xabc123...
```

TX 해시로 트랜잭션 기본 정보, 서명(r, s, v), 영수증(gas 수수료)을 출력한다.

---

### 04-verify-sig.js — 서명 검증 (ecrecover)

```bash
node scripts/04-verify-sig.js <트랜잭션_해시>
npm run step4 -- 0xabc123...
```

트랜잭션의 서명을 ecrecover로 검증한다. 복원된 주소가 `tx.from`과 일치하면 검증 성공.

---

### 05-bridge-tx.js — 브릿지 TX 분석

```bash
# 기본 네트워크(.env)에서 조회
node scripts/05-bridge-tx.js <트랜잭션_해시>
npm run step5 -- 0xabc123...

# 네트워크 지정
node scripts/05-bridge-tx.js <트랜잭션_해시> sepolia
node scripts/05-bridge-tx.js <트랜잭션_해시> base
node scripts/05-bridge-tx.js <트랜잭션_해시> giwa
```

브릿지 TX의 data 필드, 컨트랙트 주소, L1/L2 방향을 분석한다.

---

## API 엔드포인트

서버(`npm start`) 실행 후 `http://localhost:5500`에서 사용 가능하다.
모든 API에 `?network=sepolia|base|giwa` 파라미터로 네트워크 전환 가능.

| 메서드 | 경로 | 설명 | 파라미터 |
|--------|------|------|----------|
| `GET` | `/api/network-info` | 전체 네트워크 설정 | 없음 |
| `GET` | `/api/wallet-info` | 서버 지갑 주소, 잔액, nonce | 없음 (PRIVATE_KEY 필요) |
| `GET` | `/api/balance` | 임의 주소의 잔액, nonce | `?address=0x...` |
| `POST` | `/api/send-eth` | 서버 지갑에서 ETH 송금 | body: `{ "to": "0x...", "amount": "0.001" }` |
| `GET` | `/api/tx` | TX 해시로 트랜잭션 상세 조회 | `?hash=0x...` |
| `GET` | `/api/verify-sig` | 서명 검증 (ecrecover) | `?hash=0x...` |
| `GET` | `/api/bridge-tx` | 브릿지 TX 분석 | `?hash=0x...&network=base` |

---

## 핵심 개념 요약

### Nonce

```
getTransactionCount(address) → 현재 nonce
                              ↓
sendTransaction() 실행 → tx.nonce == 현재 nonce
                              ↓
블록 포함 후 → getTransactionCount(address) == nonce + 1
```

- 역할: 리플레이 공격 방지, 트랜잭션 순서 보장
- 비유: 은행 거래 일련번호

### Gas

```
수수료(ETH) = receipt.gasUsed × receipt.gasPrice
           = 21,000 gas × (네트워크 혼잡도에 따른 Gwei)
```

- `gasLimit`: 최대 사용 가능량 (단순 전송 = 21,000)
- `gasUsed`: 실제 사용량
- `gasPrice`: 단위당 가격 (Gwei)

### Signature (r, s, v)

```
개인키 + 트랜잭션 해시 → ECDSA → (r, s, v)
(r, s, v) + 트랜잭션 해시 → ecrecover → Public Key → 주소
복원된 주소 == tx.from → 서명 유효 ✅
```

- 개인키는 네트워크에 전송되지 않는다
- 서명만으로 서명자 주소를 수학적으로 역산 가능

### Bridge (L1 ↔ L2)

```
L1 → L2 (Deposit):  L1에서 Lock → L2에서 Mint (수 분)
L2 → L1 (Withdrawal): L2에서 Burn → 7일 대기 → L1에서 Unlock
```

- 브릿지 TX는 컨트랙트 호출 (data 필드 존재)
- 단순 ETH 전송(data=0x)과 구별된다

---

## CLI와 웹 UI의 차이

| 구분 | CLI (터미널) | 웹 UI (브라우저) |
|------|-------------|-----------------|
| 실행 방법 | `node scripts/01~05.js` | `npm start` 후 브라우저 접속 |
| 서명 방식 | `.env`의 PRIVATE_KEY로 직접 서명 | MetaMask 지갑으로 서명 |
| 지갑 주소 | PRIVATE_KEY에서 파생된 주소 | MetaMask에 연결된 주소 |
| 적합한 사람 | 코드 동작을 이해하고 싶은 학생 | 먼저 체험부터 하고 싶은 학생 |

> **주의**: CLI와 웹 UI에서 사용하는 지갑 주소가 **다를 수 있다**.
> `.env`에 넣은 개인키와 MetaMask에 등록된 계정이 같은 주소인지 확인하세요.

---

## 제출물

1. GitHub 레포지토리 URL (코드 + README)
2. 각 Task의 스크린샷 (MetaMask, Explorer, 터미널 실행 결과)
3. 브릿지 TX Hash
