# MCP Weather & Blockchain/Coin Demo

A classroom-ready MCP (Model Context Protocol) demo for explaining the exact client/server separation that came up in the call with Professor Kim.

This folder is intentionally consolidated into two documentation files:

```text
README.md       # English / GitHub-facing documentation
README_KR.md    # Korean / classroom-facing documentation
```

The previous separate notes for the demo script, MCP structure, and student project guide have been merged into these README files so the explanation can be followed from one place.

---

## 1. Why this project exists

The key question from Professor Kim was:

> Did we only build an MCP server, or did we clearly separate the MCP client and MCP server?

The answer demonstrated by this project is:

1. The MCP server exposes domain functions as tools.
2. The MCP client connects to the server over `stdio`.
3. The client calls `list_tools()` to discover available tools.
4. The client calls `call_tool()` with concrete arguments.
5. The server calls an external API and returns the tool result.

So this is not just an API script and not just a server. The demo explicitly includes both sides:

```text
MCP Client / LLM Host / Web Backend
  ↓ list_tools(), call_tool()
MCP Server
  ↓ external API request
Open-Meteo or CoinGecko
  ↓ result
MCP Server
  ↓ tool result
MCP Client / UI
```

---

## 2. Project structure

```text
mcp-blockchain-demo/
├── README.md                 # English consolidated documentation
├── README_KR.md              # Korean consolidated documentation
├── pyproject.toml            # Python dependencies managed by uv
├── uv.lock                   # Locked dependency versions
├── run_all_demos.sh          # Runs both CLI demos
├── run_ui.sh                 # Starts the browser UI server
├── web_app.py                # Starlette backend; acts as an MCP client
├── web/
│   └── index.html            # Browser UI/UX demo console
├── servers/
│   ├── weather_server.py     # Weather MCP server
│   └── coin_server.py        # Coin/Blockchain MCP server
└── clients/
    └── test_mcp_client.py    # CLI MCP client demo
```

---

## 3. Requirements

- Python 3.11+
- [`uv`](https://docs.astral.sh/uv/) package manager
- WSL/Linux shell recommended
- Internet access for live API calls

External APIs used:

- [Open-Meteo](https://open-meteo.com/) — no API key required
- [CoinGecko public API](https://www.coingecko.com/en/api) — no API key required for this demo

Main Python packages:

- `mcp`: MCP server/client SDK
- `httpx`: Weather API and CoinGecko API calls
- `starlette`, `uvicorn`: Web UI backend

---

## 4. Setup

```bash
cd week/mcp-blockchain-demo
uv sync
```

If running from the author's WSL workspace:

```bash
cd /home/changyeon/projects/Block_chain_repo/week/mcp-blockchain-demo
uv sync
```

---

## 5. Run the CLI demos

Run both Weather and Coin demos:

```bash
./run_all_demos.sh
```

Run each demo individually:

```bash
uv run python clients/test_mcp_client.py weather
uv run python clients/test_mcp_client.py coin
```

By default, the CLI output is optimized for teaching. Internal MCP/HTTP logs are hidden so students can focus on the flow:

```text
[1/3] MCP session initialization
[2/3] Tool discovery
[3/3] Tool call execution
```

For troubleshooting, show internal MCP/HTTP logs:

```bash
uv run python clients/test_mcp_client.py weather --verbose
uv run python clients/test_mcp_client.py coin --verbose
```

---

## 6. Run the Web UI

Start the UI server:

```bash
./run_ui.sh
```

Open in a browser:

```text
http://127.0.0.1:8765
```

The web UI is not just a static dashboard. It calls the local Starlette backend, and the backend acts as an MCP client:

```text
Browser UI
  ↓ HTTP request
Starlette backend / MCP client
  ↓ MCP ClientSession
MCP server
  ↓ external API request
Open-Meteo or CoinGecko
```

Available UI actions:

- Current weather lookup
- Multi-day weather forecast
- Coin price lookup
- Coin comparison
- Top market-cap coin list
- Tool discovery visualization

---

## 7. MCP tools in this demo

### Weather MCP Server

File: `servers/weather_server.py`

| Tool | Description |
|---|---|
| `get_current_weather(city)` | Returns current weather, temperature, humidity, wind speed, and observation time. |
| `get_weather_forecast(city, days)` | Returns daily weather, max/min temperature, and precipitation probability. |

### Coin MCP Server

File: `servers/coin_server.py`

| Tool | Description |
|---|---|
| `get_coin_price(symbol, currency)` | Returns current price, market cap, volume, and 24h change. |
| `get_top_coins(limit, currency)` | Returns top coins by market cap. |
| `compare_coins(symbols, currency)` | Compares multiple coins by price and 24h change. |

Supported shorthand examples include `btc`, `eth`, `sol`, `xrp`, `ada`, and `doge`.

---

## 8. MCP client/server explanation

MCP solves a simple problem: LLMs understand natural language well, but they need a standardized way to call external APIs or local programs.

MCP defines external capabilities as tools. An MCP client or LLM host discovers those tools and calls them through a standard protocol.

### Components

| Component | Role | Demo mapping |
|---|---|---|
| User | Sends a natural-language request | “What is the weather in Seoul?” / “What is the BTC price?” |
| MCP Client / LLM Host | Decides which tool is needed and calls it | `clients/test_mcp_client.py` or `web_app.py` |
| MCP Server | Provides real functions as tools | `servers/weather_server.py`, `servers/coin_server.py` |
| External API | Provides real data | Open-Meteo, CoinGecko |

### Request flow

```text
1. User: “What is the weather in Seoul?”
2. MCP Client / LLM Host: decides that a weather tool is needed
3. MCP Client: calls get_current_weather(city="Seoul")
4. MCP Server: calls the Open-Meteo API
5. External API: returns live data
6. MCP Server: returns the tool result
7. MCP Client / LLM Host: displays or summarizes the answer
```

### Important distinction

A plain API call is not automatically an MCP project.

A valid MCP project should include:

1. A function that calls an external API or local capability.
2. An MCP server that exposes that function as a tool.
3. A client or LLM host that verifies `list_tools()` and `call_tool()`.
4. Documentation explaining how natural-language requests map to tool calls.

---

## 9. Teaching script

Use this sequence during a live class.

### Opening explanation

Today we are showing how MCP connects an LLM or host application to external APIs through standardized tools. The key point is that the AI is not directly calling the weather or coin API. The MCP server provides the function as a tool, and the MCP client or LLM host calls that tool.

### Step 1 — Show the architecture

```text
User
  ↓ natural-language request
MCP Client / LLM Host
  ↓ tool call
MCP Server
  ↓ API request
Weather API or Coin API
  ↓ result
MCP Server
  ↓ tool result
MCP Client / LLM Host
  ↓ final answer
User
```

### Step 2 — Answer the professor's question directly

This demo separates the client and server:

- `servers/weather_server.py` is the MCP server.
- `clients/test_mcp_client.py` is the MCP client.
- The client starts/connects to the server, asks for the tool list, and then calls a selected tool.

So structurally, the client and server are separated.

### Step 3 — Run the demo

```bash
uv run python clients/test_mcp_client.py weather
```

Show the tool discovery part:

```text
[MCP Client] discovered tools:
- get_current_weather
- get_weather_forecast
```

Explain that this is the MCP client asking the server which tools it provides.

Then show the tool call part:

```text
[MCP Client] calling tool: get_current_weather({'city': 'Seoul'})
```

Explain that the server internally calls Open-Meteo and returns the result as an MCP tool result.

### Step 4 — Extend the idea to blockchain

The same structure can be reused for blockchain and coin data:

```text
Weather API → CoinGecko / Coinbase / Binance / Etherscan API
weather lookup tool → coin price, transaction lookup, wallet balance, market summary tools
```

Example natural-language requests:

- “What is the current Bitcoin price?”
- “Compare ETH and SOL by 24h change.”
- “Show the top 10 coins by market cap.”
- “Check the status of this transaction hash.”

---

## 10. Student final-project direction

The final project direction is to build an MCP server that provides coin or blockchain-related real-time information as tools.

### Example topics

- Real-time coin price MCP
- Coin price and volume comparison MCP
- Top coin market summary MCP
- Wallet address lookup MCP
- Transaction hash lookup MCP
- NFT collection price or volume lookup MCP

### Minimum requirements

1. Implement at least one MCP server.
2. Provide at least two MCP tools.
3. Connect at least one external API or local dataset.
4. Verify tool discovery from a client with `list_tools()`.
5. Verify tool execution from a client with `call_tool()`.
6. Write a README with architecture, setup, run commands, example questions, and sample output.

### Recommended APIs

| Difficulty | API | Notes |
|---|---|---|
| Easy | CoinGecko API | Starts without an API key; price, market cap, volume, 24h change |
| Medium | Coinbase API | Good for exchange prices |
| Medium | Binance API | Trading pairs, order book, candle data |
| Hard | Etherscan API | Ethereum address, transaction, contract lookup; may require an API key |
| Hard | Solscan API | Solana account and transaction lookup |

### Example tool designs

```text
get_coin_price(symbol, currency)
get_market_summary(symbol)
get_top_coins(limit)
compare_coins(symbols)
get_transaction(tx_hash)
get_wallet_balance(address)
get_latest_blocks(limit)
```

### Example student questions

- “What is the current Bitcoin price?”
- “What is Ethereum's 24h change?”
- “Compare BTC, ETH, and SOL.”
- “Show the top 10 coins by market cap.”
- “What is the ETH balance of this wallet?”
- “Check the status of this transaction hash.”

### Required submission files

```text
project/
├── server.py or servers/*.py
├── client_test.py
├── README.md
└── requirements.txt or pyproject.toml
```

The submitted README should include:

1. Project topic
2. MCP architecture diagram
3. Tool list
4. External API explanation
5. Setup instructions
6. Run instructions
7. Example questions
8. Sample output or screenshots

### Example grading rubric

| Item | Example points |
|---|---:|
| MCP server implementation | 25 |
| Tool design clarity | 20 |
| External API integration | 20 |
| Client-side call verification | 15 |
| README/presentation explanation | 10 |
| Error handling/completeness | 10 |

### Common deductions

- Only calling an API without exposing it as an MCP tool
- No client-side `list_tools()` / `call_tool()` verification
- Unclear run instructions
- Hard-coded API keys
- No handling for invalid symbols, bad addresses, API failures, or rate limits
- Missing README

---

## 11. Backup plan if the live demo fails

If the live API call fails because of network/API issues:

1. Open `servers/weather_server.py` and show the MCP tool definitions.
2. Open `clients/test_mcp_client.py` and show the `list_tools()` and `call_tool()` calls.
3. Show previous terminal output or screenshots if available.
4. Explain that the MCP structure still works; only the external API request failed.

The core learning point remains:

> MCP server provides tools. MCP client discovers and calls those tools.

---

## 12. Development checks

Run a quick syntax check:

```bash
python -m py_compile clients/test_mcp_client.py web_app.py servers/weather_server.py servers/coin_server.py
```

Run the full CLI smoke test:

```bash
./run_all_demos.sh
```

Run web API smoke tests after starting the server:

```bash
curl http://127.0.0.1:8765/api/tools
curl 'http://127.0.0.1:8765/api/weather/current?city=Seoul'
curl 'http://127.0.0.1:8765/api/coin/price?symbol=btc&currency=usd'
```

---

## 13. Notes for GitHub upload

Recommended files to include:

- Source files: `servers/`, `clients/`, `web/`, `web_app.py`
- Docs: `README.md`, `README_KR.md`
- Dependency files: `pyproject.toml`, `uv.lock`
- Run scripts: `run_all_demos.sh`, `run_ui.sh`

Do not commit generated/local files such as:

- `.venv/`
- `__pycache__/`
- `.pytest_cache/`
- local logs

---

## 14. License

Add a license before publishing if this will be shared publicly. For classroom/demo use, MIT is usually a simple default.
