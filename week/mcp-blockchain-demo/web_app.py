from __future__ import annotations

import contextlib
import os
import sys
from pathlib import Path
from typing import Any

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from starlette.applications import Starlette
from starlette.responses import FileResponse, JSONResponse
from starlette.routing import Route
from starlette.staticfiles import StaticFiles

ROOT = Path(__file__).resolve().parent
WEB_DIR = ROOT / "web"
SERVERS = {
    "weather": ROOT / "servers" / "weather_server.py",
    "coin": ROOT / "servers" / "coin_server.py",
}


def extract_text(result: Any) -> str:
    parts: list[str] = []
    for item in result.content:
        text = getattr(item, "text", None)
        parts.append(text if text is not None else str(item))
    return "\n".join(parts).strip()


@contextlib.contextmanager
def quiet_server_logs():
    """웹 UI에서는 MCP/HTTP 내부 로그보다 사용자 결과가 중요하므로 stderr를 숨깁니다."""
    with open(os.devnull, "w", encoding="utf-8") as sink:
        yield sink


async def call_mcp_tool(server_name: str, tool_name: str, arguments: dict[str, Any]) -> dict[str, Any]:
    server_path = SERVERS[server_name]
    params = StdioServerParameters(
        command=sys.executable,
        args=[str(server_path)],
        cwd=ROOT,
        env=None,
    )
    try:
        with quiet_server_logs() as errlog:
            async with stdio_client(params, errlog=errlog) as (read, write):
                async with ClientSession(read, write) as session:
                    await session.initialize()
                    tools = await session.list_tools()
                    tool_names = [tool.name for tool in tools.tools]
                    if tool_name not in tool_names:
                        return {
                            "ok": False,
                            "error": f"Unknown tool: {tool_name}",
                            "available_tools": tool_names,
                        }
                    result = await session.call_tool(tool_name, arguments)
                    is_error = bool(getattr(result, "isError", False) or getattr(result, "is_error", False))
                    return {
                        "ok": not is_error,
                        "server": server_name,
                        "tool": tool_name,
                        "arguments": arguments,
                        "available_tools": tool_names,
                        "result": extract_text(result),
                        "error": extract_text(result) if is_error else None,
                    }
    except Exception as exc:
        return {
            "ok": False,
            "server": server_name,
            "tool": tool_name,
            "arguments": arguments,
            "error": f"MCP tool 실행 실패: {type(exc).__name__}: {exc}",
        }


async def homepage(request):
    return FileResponse(WEB_DIR / "index.html")


async def api_tools(request):
    payload: dict[str, Any] = {}
    for server_name, server_path in SERVERS.items():
        params = StdioServerParameters(command=sys.executable, args=[str(server_path)], cwd=ROOT, env=None)
        try:
            with quiet_server_logs() as errlog:
                async with stdio_client(params, errlog=errlog) as (read, write):
                    async with ClientSession(read, write) as session:
                        await session.initialize()
                        tools = await session.list_tools()
                        payload[server_name] = [
                            {"name": tool.name, "description": tool.description or ""}
                            for tool in tools.tools
                        ]
        except Exception as exc:
            payload[server_name] = [
                {"name": "연결 실패", "description": f"{type(exc).__name__}: {exc}"}
            ]
    return JSONResponse({"ok": True, "servers": payload})


async def api_weather_current(request):
    city = (request.query_params.get("city") or "Seoul").strip() or "Seoul"
    return JSONResponse(await call_mcp_tool("weather", "get_current_weather", {"city": city}))


async def api_weather_forecast(request):
    city = (request.query_params.get("city") or "Busan").strip() or "Busan"
    try:
        days = int(request.query_params.get("days", "3"))
    except ValueError:
        days = 3
    return JSONResponse(await call_mcp_tool("weather", "get_weather_forecast", {"city": city, "days": days}))


async def api_coin_price(request):
    symbol = (request.query_params.get("symbol") or "btc").strip() or "btc"
    currency = (request.query_params.get("currency") or "usd").strip().lower() or "usd"
    return JSONResponse(await call_mcp_tool("coin", "get_coin_price", {"symbol": symbol, "currency": currency}))


async def api_coin_compare(request):
    symbols = (request.query_params.get("symbols") or "btc,eth,sol").strip() or "btc,eth,sol"
    currency = (request.query_params.get("currency") or "usd").strip().lower() or "usd"
    return JSONResponse(await call_mcp_tool("coin", "compare_coins", {"symbols": symbols, "currency": currency}))


async def api_coin_top(request):
    try:
        limit = int(request.query_params.get("limit", "10"))
    except ValueError:
        limit = 10
    currency = (request.query_params.get("currency") or "usd").strip().lower() or "usd"
    return JSONResponse(await call_mcp_tool("coin", "get_top_coins", {"limit": limit, "currency": currency}))


routes = [
    Route("/", homepage),
    Route("/api/tools", api_tools),
    Route("/api/weather/current", api_weather_current),
    Route("/api/weather/forecast", api_weather_forecast),
    Route("/api/coin/price", api_coin_price),
    Route("/api/coin/compare", api_coin_compare),
    Route("/api/coin/top", api_coin_top),
]

app = Starlette(debug=True, routes=routes)
app.mount("/static", StaticFiles(directory=WEB_DIR), name="static")
