from __future__ import annotations

import argparse
import asyncio
import contextlib
import os
import sys
from pathlib import Path
from typing import Any

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

ROOT = Path(__file__).resolve().parents[1]
SERVERS = {
    "weather": ROOT / "servers" / "weather_server.py",
    "coin": ROOT / "servers" / "coin_server.py",
}

DEFAULT_CALLS = {
    "weather": [
        ("get_current_weather", {"city": "Seoul"}),
        ("get_weather_forecast", {"city": "Busan", "days": 3}),
    ],
    "coin": [
        ("get_coin_price", {"symbol": "btc", "currency": "usd"}),
        ("compare_coins", {"symbols": "btc,eth,sol", "currency": "usd"}),
    ],
}


def extract_text(result: Any) -> str:
    parts: list[str] = []
    for item in result.content:
        text = getattr(item, "text", None)
        parts.append(text if text is not None else str(item))
    return "\n".join(parts).strip()


def line(title: str = "") -> str:
    width = 72
    if not title:
        return "─" * width
    label = f" {title} "
    return label + "─" * max(0, width - len(label))


def print_tool_card(index: int, name: str, description: str | None) -> None:
    print(f"  {index}. {name}")
    if description:
        print(f"     └─ {description}")


def print_result(text: str, *, error: bool = False) -> None:
    prefix = "❌" if error else "✅"
    print(f"{prefix} MCP Server 응답")
    print(line())
    print(text or "응답 본문이 비어 있습니다.")
    print(line())


@contextlib.contextmanager
def server_errlog(verbose: bool):
    """Hide MCP/HTTP internals by default so classroom output stays readable."""
    if verbose:
        yield sys.stderr
        return
    with open(os.devnull, "w", encoding="utf-8") as sink:
        yield sink


async def run_demo(server_name: str, *, verbose: bool = False) -> None:
    server_path = SERVERS[server_name]
    params = StdioServerParameters(
        command=sys.executable,
        args=[str(server_path)],
        cwd=ROOT,
        env=None,
    )

    print(line(f"{server_name.upper()} MCP DEMO"))
    print(f"📁 Project: {ROOT}")
    print(f"🖥️  Server : {server_path.relative_to(ROOT)}")
    print("🔌 Transport: stdio")

    with server_errlog(verbose) as errlog:
        async with stdio_client(params, errlog=errlog) as (read, write):
            async with ClientSession(read, write) as session:
                print("\n[1/3] MCP 세션 초기화")
                await session.initialize()
                print("✅ client ↔ server 연결 완료")

                print("\n[2/3] Tool discovery")
                tools = await session.list_tools()
                for i, tool in enumerate(tools.tools, 1):
                    print_tool_card(i, tool.name, tool.description)

                print("\n[3/3] Tool call 실행")
                for tool_name, arguments in DEFAULT_CALLS[server_name]:
                    print(f"\n▶ 호출: {tool_name}({arguments})")
                    result = await session.call_tool(tool_name, arguments)
                    is_error = bool(getattr(result, "isError", False) or getattr(result, "is_error", False))
                    print_result(extract_text(result), error=is_error)

    print("\n🎯 데모 완료: client가 server의 tool을 발견하고 호출하는 MCP 흐름을 확인했습니다.")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="수업/발표용 MCP stdio client demo",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("server", choices=sorted(SERVERS), help="실행할 MCP server")
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="MCP/HTTP 내부 로그를 함께 표시합니다. 문제 해결 시에만 사용하세요.",
    )
    args = parser.parse_args()
    asyncio.run(run_demo(args.server, verbose=args.verbose))


if __name__ == "__main__":
    main()
