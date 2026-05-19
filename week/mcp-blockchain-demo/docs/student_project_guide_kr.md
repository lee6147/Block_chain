# 학생 기말 프로젝트 가이드: Coin/Blockchain MCP 만들기

## 1. 프로젝트 주제

기말 프로젝트는 MCP server를 만들어 코인 또는 블록체인 관련 실시간 정보를 tool로 제공하는 것입니다.

예시 주제:

- 실시간 코인 가격 조회 MCP
- 코인 가격/거래량 비교 MCP
- 상위 코인 시장 요약 MCP
- 특정 지갑 주소의 블록체인 정보 조회 MCP
- 특정 트랜잭션 해시 조회 MCP
- NFT 컬렉션 가격/거래량 조회 MCP

---

## 2. 기본 요구사항

최소 요구사항:

1. MCP server를 직접 구현한다.
2. tool을 2개 이상 제공한다.
3. 외부 API를 1개 이상 연동한다.
4. MCP client에서 tool 목록 조회와 tool 호출을 검증한다.
5. README에 실행 방법, 구조도, 예시 질의를 작성한다.

---

## 3. 추천 API

### 쉬움

- CoinGecko API
  - API key 없이 시작 가능
  - 코인 가격, 시가총액, 거래량, 변동률 조회 가능

### 중간

- Coinbase API
  - 거래소 가격 정보 조회에 적합
- Binance API
  - 거래쌍, 호가, 캔들 데이터 조회 가능

### 어려움

- Etherscan API
  - Ethereum 주소, 트랜잭션, 컨트랙트 조회 가능
  - API key 필요 가능
- Solscan API
  - Solana 계정/트랜잭션 조회 가능

---

## 4. 예시 tool 설계

### 기본형

```text
get_coin_price(symbol, currency)
```

예:

- 입력: `btc`, `usd`
- 출력: 비트코인 현재 가격, 시가총액, 24시간 변동률

### 시장 요약형

```text
get_market_summary(symbol)
```

예:

- 가격
- 시가총액
- 24시간 거래량
- 24시간 최고/최저

### 상위 목록형

```text
get_top_coins(limit)
```

예:

- 시가총액 상위 10개 코인

### 비교형

```text
compare_coins(symbols)
```

예:

- BTC, ETH, SOL 가격과 24시간 변동률 비교

### 블록체인 조회형

```text
get_transaction(tx_hash)
get_wallet_balance(address)
get_latest_blocks(limit)
```

---

## 5. 예시 자연어 질의

학생들은 아래 같은 질의가 tool 호출로 연결되도록 설계하면 됩니다.

- “비트코인 현재 가격 알려줘”
- “이더리움 24시간 변동률 알려줘”
- “비트코인, 이더리움, 솔라나를 비교해줘”
- “시가총액 상위 10개 코인 보여줘”
- “이 지갑 주소의 ETH 잔액 알려줘”
- “이 트랜잭션 해시의 상태를 조회해줘”

---

## 6. 제출물

필수 제출물:

```text
project/
├── server.py 또는 servers/*.py
├── client_test.py
├── README.md
└── requirements.txt 또는 pyproject.toml
```

README에는 반드시 포함:

1. 프로젝트 주제
2. MCP 구조도
3. 제공 tool 목록
4. 외부 API 설명
5. 설치 방법
6. 실행 방법
7. 테스트 질의 예시
8. 실행 결과 캡처 또는 로그

---

## 7. 평가 기준 예시

| 항목 | 배점 예시 |
|---|---:|
| MCP server 구현 | 25 |
| tool 설계의 명확성 | 20 |
| 외부 API 연동 | 20 |
| client 호출 검증 | 15 |
| README/발표 설명 | 10 |
| 에러 처리/완성도 | 10 |

---

## 8. 감점 요소

- 단순 API 호출만 있고 MCP tool로 노출하지 않은 경우
- client에서 tool 호출 검증이 없는 경우
- 실행 방법이 불명확한 경우
- API key를 코드에 하드코딩한 경우
- 없는 코인/잘못된 입력에 대한 처리가 없는 경우
- README 없이 코드만 제출한 경우

---

## 9. 시작 템플릿

이 저장소의 `servers/coin_server.py`를 참고하면 됩니다.

제공 tool:

- `get_coin_price(symbol, currency)`
- `get_top_coins(limit, currency)`
- `compare_coins(symbols, currency)`

실행:

```bash
cd /mnt/c/Users/user/Desktop/mcp-blockchain-demo
uv run python clients/test_mcp_client.py coin
```

---

## 10. 프로젝트 확장 아이디어

- 가격 변동률 기준 급등/급락 코인 찾기
- BTC/ETH/SOL 비교 리포트 생성
- 특정 지갑 주소의 토큰 보유 현황 조회
- 특정 트랜잭션 해시 상태 분석
- Gas fee 추적
- DeFi TVL 조회
- NFT floor price 조회
- 한국어 자연어 질의에 특화된 코인 분석 MCP
