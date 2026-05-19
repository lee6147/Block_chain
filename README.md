# Block_chain

Blockchain lab materials and teaching demos.

## Presentation slides

A repository-level Korean presentation deck summarizing this README, the folder structure, and the MCP client/server demo is available at [presentation.html](presentation.html).

Open it directly in a browser from the repository root. The deck intentionally uses root-relative screenshot paths into `week/mcp-blockchain-demo/assets/screenshots/` because it is a whole-repository overview rather than a single-week module deck.

## MCP Weather & Blockchain/Coin Demo

The MCP-related material discussed after the call with Professor Kim is organized under:

```text
week/mcp-blockchain-demo/
```

Main files:

```text
week/mcp-blockchain-demo/README.md       # English/GitHub-facing consolidated documentation
week/mcp-blockchain-demo/README_KR.md    # Korean classroom/professor-facing consolidated documentation
```

The MCP demo notes were consolidated from five Markdown files into these two README files.

## Professor's MCP question

The key question was whether the project only builds an MCP server, or whether it clearly separates the MCP client and MCP server.

The answer documented in the MCP demo is:

1. The MCP server exposes domain functions as tools.
2. The MCP client connects to the server over `stdio`.
3. The client calls `list_tools()` to discover available tools.
4. The client calls `call_tool()` with concrete arguments.
5. The server calls an external API and returns the tool result.

In this repository, that flow is demonstrated with:

```text
MCP Client / Web Backend
  ↓ list_tools(), call_tool()
MCP Server
  ↓ external API request
Open-Meteo or CoinGecko
  ↓ result
MCP Server
  ↓ tool result
MCP Client / UI
```

## MCP demo components

```text
week/mcp-blockchain-demo/
├── servers/
│   ├── weather_server.py     # Weather MCP server
│   └── coin_server.py        # Coin/Blockchain MCP server
├── clients/
│   └── test_mcp_client.py    # CLI MCP client showing list_tools() and call_tool()
├── web_app.py                # Web backend that also acts as an MCP client
├── web/index.html            # Browser UI demo console
├── assets/screenshots/       # Demo screenshots embedded in README files
├── run_all_demos.sh          # Runs CLI demos
└── run_ui.sh                 # Starts the browser UI server
```

## Quick run

```bash
cd week/mcp-blockchain-demo
uv sync
./run_all_demos.sh
```

For the browser UI:

```bash
cd week/mcp-blockchain-demo
./run_ui.sh
```

Open:

```text
http://127.0.0.1:8765
```

## Student project direction

The final project direction is also documented in the MCP demo materials:

- Build at least one MCP server.
- Expose at least two MCP tools.
- Verify calls from a client using `list_tools()` and `call_tool()`.
- Use a blockchain/coin-related API or local dataset.

Example tools:

- `get_coin_price(symbol, currency)`
- `compare_coins(symbols, currency)`
- `get_wallet_balance(address, chain)`
- `get_latest_blocks(chain, limit)`
- `get_token_metadata(contract_address)`
- `analyze_transaction_hash(tx_hash)`
