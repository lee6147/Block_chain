# AI Prompt Guide — 블록체인 대시보드 프롬프트 모음

---

## Prompt 1: 기본 구조 + 지갑 연결

```
다음 조건으로 블록체인 대시보드 HTML 파일을 만들어줘:

기술 스택:
- 단일 HTML 파일
- Tailwind CSS CDN (https://cdn.tailwindcss.com)
- ethers.js v6 CDN (https://cdnjs.cloudflare.com/ajax/libs/ethers/6.13.4/ethers.umd.min.js)

디자인:
- 다크 테마 (bg-gray-900, text-gray-100)
- 카드 기반 레이아웃 (bg-gray-800, rounded-2xl, border)
- 2열 반응형 그리드 (md:grid-cols-2)
- 헤더에 제목 "Blockchain Lab #3"

기능 (Card 1: 지갑 연결):
- "MetaMask 연결" 버튼
- MetaMask가 없으면 설치 안내 표시
- 연결 성공 시: 지갑 주소, ETH 잔액, 현재 Nonce 표시
- 잔액이 0이면 "Faucet에서 ETH를 받아오세요" 경고 표시
- 연결 상태 배지 (초록 점 = 연결, 회색 점 = 미연결)

ethers.js v6 문법:
- new ethers.BrowserProvider(window.ethereum)
- provider.getSigner()
- provider.getBalance(address)
- provider.getTransactionCount(address)
- ethers.formatEther(balance)
```

---

## Prompt 2: ETH 송금 기능

```
이전에 만든 HTML에 ETH 송금 기능을 추가해줘.

Card 2: ETH 송금
- 받는 주소 입력 (input, placeholder="0x...")
- 금액 입력 (input, type=number, 기본값 0.001)
- "미리보기" 버튼: 현재 Nonce와 예상 Gas Limit(21,000) 표시
- "송금 실행" 버튼: MetaMask로 서명하여 전송
- 두 버튼 모두 지갑 연결 전에는 disabled

송금 흐름:
1. 입력값 검증 (ethers.getAddress로 주소 검증)
2. 로딩 표시 ("트랜잭션 처리 중...")
3. signer.sendTransaction({ to, value: ethers.parseEther(amount) })
4. tx.wait()으로 블록 포함 대기
5. 결과 표시: TX Hash, Nonce, Gas Used, 수수료(gasUsed * gasPrice), 상태
6. Explorer 링크 제공
7. 사용자가 MetaMask에서 거절하면 "사용자가 트랜잭션을 거절했습니다" 표시

에러 처리:
- 주소 유효성 검사
- 금액이 0 이하인 경우
- MetaMask 거절 (error.code === 4001)
- 잔액 부족
```

---

## Prompt 3: 트랜잭션 추적 + 서명 표시

```
TX Hash를 입력하면 트랜잭션 상세 정보를 조회하는 Card 3을 추가해줘.

Card 3: 트랜잭션 추적
- TX Hash 입력 필드 + "추적" 버튼
- Enter 키로도 실행 가능

조회 방법 2가지 (하나를 선택):
A) 브라우저에서 직접 조회: new ethers.JsonRpcProvider(rpcUrl)로 직접 조회
B) 서버 API 호출: fetch('/api/tx?hash=...')

결과를 3개 색상 카드로 분리하여 표시:

1. 기본 정보 (회색 카드):
   - From, To, Value (ETH), Status, Explorer 링크

2. Nonce (남색/indigo 카드):
   - 큰 글씨로 Nonce 숫자 표시
   - 설명: "이 트랜잭션의 일련번호입니다. 리플레이 공격을 방지합니다."

3. Gas (주황색 카드):
   - Gas Limit, Gas Used, Gas Price (Gwei), 수수료 (ETH)
   - 설명: "Gas는 EVM 연산 비용입니다. 스팸 방지와 검증자 보상 역할을 합니다."

4. Signature (보라색 카드):
   - r, s, v 값 표시 (모노스페이스, word-break: break-all)
   - "서명 검증 (ecrecover)" 버튼
```

---

## Prompt 4: 서명 검증 (ecrecover)

```
Card 3의 서명 검증 버튼을 클릭하면 ecrecover를 수행하는 기능을 추가해줘.

서명 검증 방법 2가지 (하나를 선택):

A) 브라우저에서 직접 수행:
   - new ethers.Transaction()으로 트랜잭션 재구성
   - type, to, nonce, gasLimit, data, value, chainId, signature 설정
   - EIP-1559이면 maxFeePerGas, maxPriorityFeePerGas 설정
   - rawTx.from 접근 → 내부적으로 ecrecover 수행
   - 복원된 주소와 tx.from 비교

B) 서버 API 호출:
   - fetch('/api/verify-sig?hash=...')

결과 표시:
- 성공 (초록 카드): "서명 검증 성공 ✓" + 복원된 주소 + 설명
- 실패 (빨강 카드): "서명 검증 실패 ✗" + 복원된 주소 + 설명

보안: 동적 HTML 삽입 시 XSS 방지를 위해 escapeHtml() 사용
```

---

## Prompt 5: 네트워크 구조 다이어그램

```
L1/L2 네트워크 구조를 시각적 트리 다이어그램으로 보여주는 Card 5를 추가해줘.
전체 폭(md:col-span-2)으로 표시.

트리 구조:
- 상단: Sepolia (L1) — 파란색 카드 (Chain ID: 11155111)
- 수직 연결선
- 하단 2개 분기:
  - 왼쪽: Base Sepolia (L2) — 초록색 카드 (Chain ID: 84532)
  - 오른쪽: GIWA Sepolia (L2) — 보라색 카드 (Chain ID: 91342)

CSS로 연결선 구현:
- 수직선: width 2px, height 24px, bg gray
- 수평선: ::before pseudo-element
- flexbox로 정렬

하단에 설명 텍스트:
"Sepolia는 이더리움 L1 테스트넷, Base/GIWA는 OP Stack L2 롤업 테스트넷"
```

---

## Prompt 6: Bridge 섹션

```
Bridge 기능을 가진 Card 6을 추가해줘. 전체 폭(md:col-span-2), 내부 2열 레이아웃.

왼쪽 열:
- 브릿지 링크 카드:
  - Superbridge (Base Sepolia ↔ Sepolia) — 초록 "이동 →" 버튼
  - GIWA Bridge (GIWA Sepolia ↔ Sepolia) — 보라 "이동 →" 버튼
- 교육 노트:
  - Deposit (L1→L2): Lock → Mint
  - Withdraw (L2→L1): Burn → Unlock
  - 경고: "L2→L1 출금은 7일 챌린지 기간 필요"

오른쪽 열:
- Bridge TX 분석 폼:
  - 네트워크 선택 드롭다운 (select)
  - TX Hash 입력
  - "분석" 버튼
- 분석 결과: From, To, Value, Status, Nonce, Explorer 링크
- Gas 정보: Gas Used, 수수료
- 서명 정보: r, s, v
- 브릿지 분석: 방향(L1→L2 또는 L2→L1), 컨트랙트 상호작용 여부, 추가 설명
```

---

## Prompt 7: 네트워크 전환 기능

```
헤더에 네트워크 전환 버튼을 추가해줘.

기능:
- Sepolia / Base Sepolia / GIWA Sepolia 3개 버튼
- 클릭 시:
  1. UI 전체 업데이트 (제목, 부제목, 푸터, Faucet 링크)
  2. MetaMask에 네트워크 전환 요청 (wallet_switchEthereumChain)
  3. 체인이 없으면 자동 추가 (wallet_addEthereumChain, error code 4902)
  4. 지갑 정보 새로고침

네트워크 데이터:
- 서버에서 fetch('/api/network-info')로 가져오기
- 서버 연결 실패 시 폴백 데이터 사용 (하드코딩)

이벤트 핸들링:
- accountsChanged: 계정 변경 시 지갑 정보 갱신
- chainChanged: 네트워크 변경 시 경고 또는 갱신
```

---

## Prompt 8: Faucet 참조 섹션

```
메인 카드 아래에 테스트넷 Faucet 목록 섹션을 추가해줘:

- 3열 그리드 (Sepolia: 파란색 / Base: 초록색 / GIWA: 보라색)
- 각 네트워크별 Faucet 링크를 목록으로 표시
- 링크는 새 탭에서 열리도록 target="_blank"
```
