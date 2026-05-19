# MCP란? (학생들을 위한 한눈에 이해)

**MCP(Multi-Tool Calling Protocol, 멀티툴 호출 프로토콜)는 AI, LLM, 또는 일반 프로그램이 외부 기능(API나 로컬 코드)을 'tool' 형태로 표준화해서 호출할 수 있게 해 주는 구조입니다.**

이 프로젝트(기말 과제)에서는 MCP 서버가 실시간 코인/블록체인 관련 기능을 여러 개 'tool'로 제공하고, MCP 클라이언트가 그 tool을 직접 요청해서 정보를 받아오는 양방향 구조를 구현합니다.  
즉, 단순 API 호출 예시가 아니라 client와 server가 분리되고, 'tool'이라는 표준 방식으로 데이터를 조회하는 예제를 만드는 것이 포인트입니다.

---

# MCP 날씨 데모 + 블록체인/코인 MCP 기말 프로젝트 준비물

이 폴더는 김형중 교수님 통화 이후 바로 수업에서 쓸 수 있도록 만든 자료입니다.

목표는 4가지입니다.

1. 내일 수업에서 Weather MCP 데모를 바로 실행한다.
2. 교수님이 물어본 MCP client/server 구조를 명확히 설명한다.
3. 학생 기말 프로젝트를 Coin/Blockchain MCP 방향으로 제시한다.
4. 학생들이 그대로 따라 만들 수 있는 구현 가이드를 제공한다.

---

## 1. 한 줄 설명

MCP는 LLM이 외부 API나 로컬 기능을 표준화된 tool 형태로 호출하게 해주는 프로토콜입니다.

이번 데모에서는 다음 구조를 보여줍니다.

```text
사용자
  ↓ 자연어 질문
MCP Client / LLM Host
  ↓ tool 호출
MCP Server
  ↓ 외부 API 요청
Weather API 또는 Coin API
  ↓ 결과
MCP Server
  ↓ tool result
MCP Client / LLM Host
  ↓ 자연어 답변
사용자
```

---

## 2. 프로젝트 구조

```text
mcp-blockchain-demo/
├── pyproject.toml
├── servers/
│   ├── weather_server.py     # 내일 수업용 날씨 MCP server
│   └── coin_server.py        # 학생 기말 프로젝트 예시용 코인 MCP server
├── clients/
│   └── test_mcp_client.py    # MCP client 역할을 보여주는 테스트 클라이언트
└── docs/
    ├── demo_script_kr.md     # 내일 말할 설명/시연 대본
    ├── student_project_guide_kr.md
    └── mcp_structure_kr.md
```

---

## 3. 설치

이 폴더에서 실행합니다.

```bash
cd /home/changyeon/projects/Block_chain/mcp-blockchain-demo
uv sync
```

전체 데모를 한 번에 실행하려면:

```bash
cd /home/changyeon/projects/Block_chain/mcp-blockchain-demo
./run_all_demos.sh
```

UI/UX 웹 화면으로 실행하려면:

```bash
cd /home/changyeon/projects/Block_chain/mcp-blockchain-demo
./run_ui.sh
```

브라우저에서 `http://127.0.0.1:8765`를 엽니다.

> 발표/수업용 기본 출력은 MCP 내부 로그를 숨기고 `client 연결 → tool discovery → tool call` 흐름만 보여줍니다. 문제 해결이 필요하면 `--verbose` 옵션을 추가합니다.

설치되는 주요 패키지:

- `mcp`: MCP server/client SDK
- `httpx`: Weather API, CoinGecko API 호출

---

## 4. Weather MCP 데모 실행

```bash
cd /home/changyeon/projects/Block_chain/mcp-blockchain-demo
uv run python clients/test_mcp_client.py weather
```

보여줄 포인트:

- client가 server를 stdio로 실행한다.
- client가 `list_tools()`로 server의 tool 목록을 발견한다.
- client가 `call_tool()`로 `get_current_weather`, `get_weather_forecast`를 호출한다.
- server는 Open-Meteo API를 호출하고 결과를 tool result로 반환한다.

---

## 5. Coin MCP 기말 프로젝트 예시 실행

```bash
cd /home/changyeon/projects/Block_chain/mcp-blockchain-demo
uv run python clients/test_mcp_client.py coin
```

제공 tool:

- `get_coin_price(symbol, currency)`
- `get_top_coins(limit, currency)`
- `compare_coins(symbols, currency)`

외부 API:

- CoinGecko public API
- API key 없이 실행 가능

---

## 6. 교수님께 설명할 핵심 답변

교수님 질문은 “서버만 만든 것이냐, 클라이언트와 서버를 나눈 것이냐”였습니다.

답변은 이렇게 하면 됩니다.

> MCP에서는 실제 API 호출 기능은 MCP server에 tool로 구현합니다.  
> 사용자의 자연어 요청은 MCP client 또는 LLM host가 해석하고, 필요한 tool을 MCP server에 요청합니다.  
> 그래서 구조상 client/host와 server가 분리됩니다.  
> 오늘 데모에서는 weather MCP server를 띄우고, test MCP client가 server의 tool 목록을 조회한 뒤 날씨 tool을 호출하는 흐름을 보여드리겠습니다.

---

## 7. 수업 운영 제안

### 내일

- 학생 제안서 발표
- Weather MCP 데모
- MCP client/server 구조 설명

### 다음 주

- 학생들이 본인 제안서 기반 미니 데모 시연
- 최소 요구사항: MCP server 1개 + tool 2개 이상 + client에서 호출 검증

### 기말 주간

- Coin/Blockchain 실시간 정보 조회 MCP 프로젝트
- 예: 비트코인 가격, 24시간 변동률, 거래량, 상위 코인, 코인 비교

---

## 8. 데모가 실패할 때 백업 플랜

네트워크/API 문제로 라이브 호출이 실패하면 아래 순서로 설명합니다.

1. `servers/weather_server.py`에서 tool 정의를 보여준다.
2. `clients/test_mcp_client.py`에서 `list_tools()`와 `call_tool()` 부분을 보여준다.
3. 이전 실행 결과 캡처 또는 터미널 로그를 보여준다.
4. 핵심은 “MCP server가 tool을 제공하고 client가 호출한다”는 구조라고 설명한다.

---

## 9. 검증 완료

아래 명령으로 실제 실행 검증했습니다.

```bash
uv run python clients/test_mcp_client.py weather
uv run python clients/test_mcp_client.py coin
```

두 명령 모두 MCP tool discovery와 tool call이 정상 동작했습니다.
