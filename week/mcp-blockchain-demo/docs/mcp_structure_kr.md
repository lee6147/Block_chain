# MCP Client / Server 구조 설명 자료

## 1. MCP가 해결하는 문제

LLM은 자연어를 잘 이해하지만, 기본적으로는 외부 API를 직접 안정적으로 호출하거나 로컬 프로그램을 실행하는 표준 방식이 없습니다.

MCP는 이 문제를 해결하기 위해 외부 기능을 `tool`로 정의하고, LLM host/client가 그 tool을 표준 프로토콜로 호출하게 합니다.

---

## 2. 구성요소

### 사용자

자연어로 요청합니다.

예:

- “서울 날씨 알려줘”
- “비트코인 가격 알려줘”
- “이더리움이랑 솔라나 가격 비교해줘”

### MCP Client / LLM Host

사용자 요청을 해석하고 어떤 tool이 필요한지 판단합니다.

예:

- Claude Desktop
- Cursor
- Hermes Agent
- 직접 만든 MCP client
- 이번 데모의 `clients/test_mcp_client.py`

### MCP Server

실제 기능을 tool로 제공합니다.

예:

- `get_current_weather(city)`
- `get_coin_price(symbol)`
- `compare_coins(symbols)`

### External API

실제 데이터를 제공하는 외부 서비스입니다.

예:

- Open-Meteo Weather API
- CoinGecko API
- Coinbase API
- Binance API
- Etherscan API

---

## 3. 요청 흐름

```text
1. 사용자: “서울 날씨 알려줘”
2. MCP Client / LLM Host: 날씨 조회 tool이 필요하다고 판단
3. MCP Client: MCP Server에 get_current_weather(city="Seoul") 호출
4. MCP Server: Open-Meteo API 호출
5. Open-Meteo API: 실시간 날씨 데이터 반환
6. MCP Server: tool result 반환
7. MCP Client / LLM Host: 자연어 답변 생성
8. 사용자: 답변 확인
```

---

## 4. 이 데모에서의 매핑

| 역할 | 파일 또는 서비스 |
|---|---|
| MCP Client | `clients/test_mcp_client.py` |
| Weather MCP Server | `servers/weather_server.py` |
| Coin MCP Server | `servers/coin_server.py` |
| Weather API | Open-Meteo API |
| Coin API | CoinGecko API |

---

## 5. 교수님께 답할 핵심 문장

> MCP server는 실제 기능을 tool로 제공하는 프로그램이고, MCP client 또는 LLM host는 사용자의 자연어 요청을 해석해서 server의 tool을 호출하는 프로그램입니다. 이번 데모에서는 server와 client를 별도 파일로 분리했고, client가 server의 tool 목록을 조회한 뒤 날씨 조회 tool을 호출하는 구조를 보여드립니다.

---

## 6. 학생들에게 강조할 점

학생들이 헷갈리기 쉬운 부분은 “API 호출 코드만 만들면 MCP인가?”입니다.

정확히는 아닙니다.

MCP 프로젝트가 되려면 최소한 다음이 필요합니다.

1. 외부 API를 호출하는 기능
2. 그 기능을 MCP server의 tool로 노출
3. MCP client 또는 LLM host에서 tool discovery/call 검증
4. 자연어 요청과 tool 호출의 연결 설명

---

## 7. 최소 구현 기준

학생 기말 프로젝트 최소 요구사항 예시:

- MCP server 1개
- tool 2개 이상
- 외부 API 1개 이상 연동
- client에서 `list_tools()` 결과 확인
- client에서 `call_tool()` 결과 확인
- README에 구조도와 실행 방법 작성

---

## 8. 우수 프로젝트 기준

- 자연어 질의 예시가 다양함
- 에러 처리: 없는 코인, API 장애, rate limit 처리
- 데이터가 실시간 또는 최신임
- tool 설명이 명확함
- 결과 포맷이 사용자 친화적임
- 블록체인 도메인 이해가 드러남
