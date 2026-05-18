# 내일 수업용 MCP 데모 대본

## 0. 시작 멘트

오늘은 MCP가 어떤 식으로 LLM과 외부 API를 연결하는지 간단한 날씨 예제로 보여드리겠습니다.

핵심은 AI가 직접 날씨 API를 호출하는 것이 아니라, MCP server가 날씨 조회 기능을 tool로 제공하고, MCP client 또는 LLM host가 그 tool을 호출한다는 점입니다.

---

## 1. 구조 설명

```text
사용자
  ↓ 자연어 질문
MCP Client / LLM Host
  ↓ tool 호출
MCP Server
  ↓ API 요청
Weather API
  ↓ 결과
MCP Server
  ↓ tool result
MCP Client / LLM Host
  ↓ 자연어 답변
사용자
```

설명:

- MCP Server: 실제 기능을 가진 tool을 제공하는 쪽입니다.
- MCP Client / LLM Host: 사용자 요청을 해석하고 필요한 tool을 호출하는 쪽입니다.
- External API: 날씨 API, 코인 API, 블록체인 API처럼 실제 데이터를 제공하는 서비스입니다.

---

## 2. 교수님 질문에 대한 직접 답변

교수님이 궁금해하신 부분은 “서버만 만든 것인지, 클라이언트와 서버를 분리한 것인지”였습니다.

이 데모에서는 둘을 분리해서 보여드립니다.

- `servers/weather_server.py`가 MCP server입니다.
- `clients/test_mcp_client.py`가 MCP client 역할을 합니다.
- client는 server를 실행한 뒤 server의 tool 목록을 조회하고, 필요한 tool을 호출합니다.

즉, 구조적으로는 client와 server가 나뉘어 있습니다.

---

## 3. 실행 명령

```bash
cd /mnt/c/Users/user/Desktop/mcp-blockchain-demo
uv run python clients/test_mcp_client.py weather
```

---

## 4. 실행 중 설명할 부분

### 4-1. Tool 목록 조회

출력에서 다음 부분을 보여줍니다.

```text
[MCP Client] discovered tools:
- get_current_weather
- get_weather_forecast
```

설명:

MCP client가 server에 “어떤 tool을 제공하느냐”고 물어보고, server가 tool 목록을 반환한 것입니다.

### 4-2. Tool 호출

출력에서 다음 부분을 보여줍니다.

```text
[MCP Client] calling tool: get_current_weather({'city': 'Seoul'})
```

설명:

여기서 client가 server의 `get_current_weather` tool을 호출합니다. server는 내부적으로 Open-Meteo API를 호출한 뒤 결과를 반환합니다.

### 4-3. 결과 반환

출력에서 다음 부분을 보여줍니다.

```text
서울특별시 대한민국 현재 날씨: ...
기온: ...
습도: ...
풍속: ...
```

설명:

이 결과는 외부 Weather API에서 온 데이터를 MCP server가 정리해서 client에게 돌려준 것입니다.

---

## 5. 학생 프로젝트로 확장하는 설명

날씨 예제에서 API만 바꾸면 학생 기말 프로젝트가 됩니다.

```text
Weather API → CoinGecko / Coinbase / Binance / Etherscan API
날씨 조회 tool → 코인 가격 조회 tool, 거래량 조회 tool, 블록체인 트랜잭션 조회 tool
```

예시:

- “비트코인 현재 가격 알려줘”
- “이더리움과 솔라나 24시간 변동률 비교해줘”
- “시가총액 상위 10개 코인 보여줘”

이 자연어 요청을 LLM host가 해석하고, MCP server의 tool을 호출하는 구조로 만들면 됩니다.

---

## 6. 마무리 멘트

정리하면 MCP의 핵심은 외부 기능을 LLM에게 직접 붙이는 것이 아니라, MCP server가 표준화된 tool 인터페이스로 제공하고 MCP client/LLM host가 그 tool을 호출하게 하는 것입니다.

오늘 날씨 데모는 가장 단순한 예제이고, 기말 프로젝트에서는 이 구조를 코인 또는 블록체인 실시간 데이터 조회로 확장하면 됩니다.
