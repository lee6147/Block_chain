# What is MCP? (Student-friendly quick overview)

**MCP (Multi-Tool Calling Protocol) is a standard protocol that allows AI, LLMs, or any program to call external functions (APIs or local code) as 'tools' in a unified, standardized way.**

In this project (and for your final assignment), the MCP server exposes multiple live coin/blockchain features as 'tools,' and the MCP client actually calls those tools. The structure requires a real separation between client and server, and demonstrates tool discovery and invocation -- it's not just a basic API example.

---

# MCP Weather & Blockchain/Coin Demo

A classroom-ready MCP (Model Context Protocol) demo that shows how an MCP client discovers and calls tools exposed by MCP servers. The project includes:

- **Weather MCP Server** — calls Open-Meteo for current weather and forecasts.
- **Coin/Blockchain MCP Server** — calls CoinGecko for live cryptocurrency data.
- **CLI demo client** — demonstrates MCP `stdio`, `list_tools()`, and `call_tool()` clearly in the terminal.
- **Web UI demo console** — wraps the same MCP flow in a browser-friendly interface for teaching and presentations.

> Developed and tested primarily on WSL/Linux. In the author's WSL workspace, the working path is `/home/changyeon/projects/Block_chain/mcp-blockchain-demo`.

---

## Why this project exists

This repository is designed for a lecture/demo where the key question is:

> “Did we only build a server, or did we separate the MCP client and server?”

The answer demonstrated here is:

1. The **MCP Server** exposes domain functions as tools.
2. The **MCP Client** connects to the server over `stdio`.
3. The client calls `list_tools()` to discover available tools.
4. The client calls `call_tool()` with arguments.
5. The server calls an external API and returns the tool result.

```text
User / Browser / CLI
  ↓ request
MCP Client / Web Backend
  ↓ list_tools(), call_tool()
MCP Server
  ↓ external API request
Open-Meteo or CoinGecko
  ↓ result
MCP Server
  ↓ tool result
MCP Client / UI
  ↓ displayed answer
User
```

---

## Project structure

```text
mcp-blockchain-demo/
├── README.md                 # GitHub-facing documentation
├── README_KR.md              # Korean classroom notes
├── pyproject.toml            # Python dependencies managed by uv
├── run_all_demos.sh          # Runs both CLI demos
├── run_ui.sh                 # Starts the browser UI server
├── web_app.py                # Starlette backend; acts as an MCP client
├── web/
│   └── index.html            # Browser UI/UX demo console
├── servers/
│   ├── weather_server.py     # Weather MCP server
│   └── coin_server.py        # Coin/Blockchain MCP server
├── clients/
│   └── test_mcp_client.py    # CLI MCP client demo
└── docs/
    ├── demo_script_kr.md
    ├── mcp_structure_kr.md
    └── student_project_guide_kr.md
```

---

## Requirements

- Python **3.11+**
- [`uv`](https://docs.astral.sh/uv/) package manager
- WSL/Linux shell recommended
- Internet access for live API calls

External APIs used:

- [Open-Meteo](https://open-meteo.com/) — no API key required
- [CoinGecko public API](https://www.coingecko.com/en/api) — no API key required for this demo

---

## Setup

```bash
git clone <your-repository-url>
cd mcp-blockchain-demo
uv sync
```

If you are using the existing WSL workspace for this project:

```bash
cd /home/changyeon/projects/Block_chain/mcp-blockchain-demo
uv sync
```

---

## Run the CLI demos

Run both Weather and Coin demos:

```bash
./run_all_demos.sh
```

Run each demo individually:

```bash
uv run python clients/test_mcp_client.py weather
uv run python clients/test_mcp_client.py coin
```

By default, the CLI output is optimized for teaching: MCP/HTTP internal logs are hidden so students can focus on the flow:

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

## Run the Web UI

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
Browser UI → Starlette backend → MCP ClientSession → MCP Server → External API
```

Available UI actions:

- Current weather lookup with expanded city presets: Seoul, Busan, Incheon, Daegu, Daejeon, Gwangju, Ulsan, Jeju City, Suwon, Gangneung, Tokyo, New York, London, Paris, Singapore
- Multi-day weather forecast
- Coin price lookup with expanded presets: BTC, ETH, SOL, XRP, BNB, ADA, DOGE, USDT, USDC, TON, TRX, LINK, DOT, AVAX, SHIB, Polygon, NEAR, LTC, BCH, UNI, ATOM, ETC, APT, ARB, OP, SUI, PEPE
- Coin comparison with preset baskets: L1, stablecoins, infra/interchain, L2, meme coins
- Top market-cap coin list
- Tool discovery visualization

---

## MCP tools

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

## Teaching script summary

Use this sequence during a live class:

1. Open the Web UI and explain the flow diagram.
2. Click a Weather button and show that the UI result includes:
   - server name
   - tool name
   - arguments
   - discovered tools
   - tool result
3. Run the CLI demo to show the same flow without the browser.
4. Open `servers/weather_server.py` and show `@mcp.tool()` definitions.
5. Open `clients/test_mcp_client.py` and show `list_tools()` and `call_tool()`.
6. Explain how students can replace the Weather/Coin API with their own blockchain-related API.

Key explanation:

> MCP servers provide tools. MCP clients discover and call those tools. The LLM or host application decides when a tool is needed, but the tool implementation lives in the server.

---

## Student project direction

Minimum final-project requirement:

- Build at least **one MCP server**.
- Expose at least **two MCP tools**.
- Verify calls from a client using `list_tools()` and `call_tool()`.
- Use a blockchain/coin-related API or local dataset.

Example tool ideas:

- `get_coin_price(symbol, currency)`
- `compare_coins(symbols, currency)`
- `get_wallet_balance(address, chain)`
- `get_latest_blocks(chain, limit)`
- `get_token_metadata(contract_address)`
- `analyze_transaction_hash(tx_hash)`

---

## Troubleshooting

### Port 8765 is already in use

Check the process:

```bash
ss -ltnp 'sport = :8765'
```

Either stop the existing process or run uvicorn on another port:

```bash
uv run uvicorn web_app:app --host 127.0.0.1 --port 8766
```

### `VIRTUAL_ENV` warning from `uv`

The run scripts unset `VIRTUAL_ENV` before calling `uv`, so this should not appear when using:

```bash
./run_all_demos.sh
./run_ui.sh
```

If you run commands manually, the warning is usually harmless, but you can run:

```bash
unset VIRTUAL_ENV
```

### External API failure

If Open-Meteo or CoinGecko is temporarily unavailable:

1. Show the MCP server tool definitions in `servers/`.
2. Show the MCP client code in `clients/test_mcp_client.py`.
3. Explain that the MCP structure still works; only the external API call failed.

---

## Development checks

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

## Notes for GitHub upload

Recommended files to include:

- Source files: `servers/`, `clients/`, `web/`, `web_app.py`
- Docs: `README.md`, `README_KR.md`, `docs/`
- Dependency files: `pyproject.toml`, `uv.lock`
- Run scripts: `run_all_demos.sh`, `run_ui.sh`

Do **not** commit generated/local files such as:

- `.venv/`
- `__pycache__/`
- `.pytest_cache/`
- local logs

---

## License

Add a license before publishing if this will be shared publicly. For classroom/demo use, MIT is usually a simple default.
