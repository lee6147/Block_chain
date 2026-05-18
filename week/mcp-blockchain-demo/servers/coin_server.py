from __future__ import annotations

from typing import Any

import httpx
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("coin-blockchain-demo")

COINGECKO_BASE = "https://api.coingecko.com/api/v3"

SYMBOL_TO_ID = {
    "btc": "bitcoin",
    "bitcoin": "bitcoin",
    "비트코인": "bitcoin",
    "eth": "ethereum",
    "ethereum": "ethereum",
    "이더리움": "ethereum",
    "sol": "solana",
    "solana": "solana",
    "xrp": "ripple",
    "ripple": "ripple",
    "ada": "cardano",
    "cardano": "cardano",
    "doge": "dogecoin",
    "dogecoin": "dogecoin",
    "bnb": "binancecoin",
    "binance": "binancecoin",
    "binancecoin": "binancecoin",
    "바이낸스": "binancecoin",
    "usdt": "tether",
    "tether": "tether",
    "테더": "tether",
    "usdc": "usd-coin",
    "usd-coin": "usd-coin",
    "steth": "staked-ether",
    "staked-ether": "staked-ether",
    "ton": "the-open-network",
    "toncoin": "the-open-network",
    "the-open-network": "the-open-network",
    "trx": "tron",
    "tron": "tron",
    "link": "chainlink",
    "chainlink": "chainlink",
    "dot": "polkadot",
    "polkadot": "polkadot",
    "avax": "avalanche-2",
    "avalanche": "avalanche-2",
    "shib": "shiba-inu",
    "shiba": "shiba-inu",
    "shiba-inu": "shiba-inu",
    "matic": "polygon-ecosystem-token",
    "pol": "polygon-ecosystem-token",
    "polygon": "polygon-ecosystem-token",
    "near": "near",
    "ltc": "litecoin",
    "litecoin": "litecoin",
    "bch": "bitcoin-cash",
    "bitcoin-cash": "bitcoin-cash",
    "uni": "uniswap",
    "uniswap": "uniswap",
    "atom": "cosmos",
    "cosmos": "cosmos",
    "etc": "ethereum-classic",
    "ethereum-classic": "ethereum-classic",
    "apt": "aptos",
    "aptos": "aptos",
    "arb": "arbitrum",
    "arbitrum": "arbitrum",
    "op": "optimism",
    "optimism": "optimism",
    "sui": "sui",
    "pepe": "pepe",
}


def _coin_id(symbol: str) -> str:
    key = symbol.strip().lower()
    return SYMBOL_TO_ID.get(key, key)


async def _get_json(path: str, params: dict[str, Any] | None = None) -> Any:
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(f"{COINGECKO_BASE}{path}", params=params or {})
        response.raise_for_status()
        return response.json()


@mcp.tool()
async def get_coin_price(symbol: str = "btc", currency: str = "usd") -> str:
    """코인 심볼 또는 CoinGecko ID를 받아 현재 가격, 시가총액, 24시간 변동률을 반환합니다."""
    cid = _coin_id(symbol)
    currency = currency.lower()
    data = await _get_json(
        "/simple/price",
        {
            "ids": cid,
            "vs_currencies": currency,
            "include_market_cap": "true",
            "include_24hr_vol": "true",
            "include_24hr_change": "true",
            "precision": "full",
        },
    )
    if cid not in data:
        return f"코인을 찾지 못했습니다: {symbol} (CoinGecko id 후보: {cid})"
    item = data[cid]
    price = item.get(currency)
    market_cap = item.get(f"{currency}_market_cap")
    volume = item.get(f"{currency}_24h_vol")
    change = item.get(f"{currency}_24h_change")
    return (
        f"{cid} 현재 정보 ({currency.upper()})\n"
        f"가격: {price:,.6f}\n"
        f"시가총액: {market_cap:,.0f}\n"
        f"24시간 거래량: {volume:,.0f}\n"
        f"24시간 변동률: {change:.2f}%"
    )


@mcp.tool()
async def get_top_coins(limit: int = 10, currency: str = "usd") -> str:
    """시가총액 기준 상위 코인 목록을 반환합니다."""
    limit = max(1, min(int(limit), 50))
    currency = currency.lower()
    data = await _get_json(
        "/coins/markets",
        {
            "vs_currency": currency,
            "order": "market_cap_desc",
            "per_page": limit,
            "page": 1,
            "sparkline": "false",
            "price_change_percentage": "24h",
        },
    )
    lines = [f"시가총액 상위 {limit}개 코인 ({currency.upper()})"]
    for i, coin in enumerate(data, 1):
        lines.append(
            f"{i}. {coin['name']} ({coin['symbol'].upper()}): "
            f"{coin['current_price']:,.4f}, "
            f"24h {coin.get('price_change_percentage_24h') or 0:.2f}%, "
            f"MCap {coin.get('market_cap') or 0:,.0f}"
        )
    return "\n".join(lines)


@mcp.tool()
async def compare_coins(symbols: str = "btc,eth", currency: str = "usd") -> str:
    """쉼표로 구분된 여러 코인의 가격과 24시간 변동률을 비교합니다. 예: btc,eth,sol"""
    ids = [_coin_id(s) for s in symbols.split(",") if s.strip()]
    ids = ids[:10]
    currency = currency.lower()
    data = await _get_json(
        "/simple/price",
        {
            "ids": ",".join(ids),
            "vs_currencies": currency,
            "include_24hr_change": "true",
        },
    )
    lines = [f"코인 비교 ({currency.upper()})"]
    for cid in ids:
        item = data.get(cid)
        if not item:
            lines.append(f"- {cid}: 조회 실패")
            continue
        lines.append(
            f"- {cid}: {item.get(currency):,.6f}, "
            f"24h {item.get(f'{currency}_24h_change') or 0:.2f}%"
        )
    return "\n".join(lines)


if __name__ == "__main__":
    mcp.run()
