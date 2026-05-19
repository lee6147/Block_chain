from __future__ import annotations

import asyncio
from typing import Any

import httpx
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("weather-demo")

GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search"
FORECAST_URL = "https://api.open-meteo.com/v1/forecast"

WEATHER_CODE_KO = {
    0: "맑음",
    1: "대체로 맑음",
    2: "부분적으로 흐림",
    3: "흐림",
    45: "안개",
    48: "서리 안개",
    51: "약한 이슬비",
    53: "이슬비",
    55: "강한 이슬비",
    61: "약한 비",
    63: "비",
    65: "강한 비",
    71: "약한 눈",
    73: "눈",
    75: "강한 눈",
    80: "약한 소나기",
    81: "소나기",
    82: "강한 소나기",
    95: "천둥번개",
}


async def _get_json(url: str, params: dict[str, Any]) -> dict[str, Any]:
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        return response.json()


async def _geocode(city: str) -> dict[str, Any]:
    data = await _get_json(
        GEOCODE_URL,
        {"name": city, "count": 1, "language": "ko", "format": "json"},
    )
    results = data.get("results") or []
    if not results:
        raise ValueError(f"도시를 찾을 수 없습니다: {city}")
    return results[0]


@mcp.tool()
async def get_current_weather(city: str = "Seoul") -> str:
    """도시 이름을 받아 현재 날씨, 기온, 풍속을 한국어로 반환합니다."""
    place = await _geocode(city)
    data = await _get_json(
        FORECAST_URL,
        {
            "latitude": place["latitude"],
            "longitude": place["longitude"],
            "current": "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
            "timezone": "auto",
        },
    )
    current = data["current"]
    units = data.get("current_units", {})
    code = int(current.get("weather_code", -1))
    weather = WEATHER_CODE_KO.get(code, f"weather_code={code}")
    name = place.get("name", city)
    country = place.get("country", "")
    return (
        f"{name} {country} 현재 날씨: {weather}\n"
        f"기온: {current['temperature_2m']}{units.get('temperature_2m', '°C')}\n"
        f"습도: {current['relative_humidity_2m']}{units.get('relative_humidity_2m', '%')}\n"
        f"풍속: {current['wind_speed_10m']}{units.get('wind_speed_10m', 'km/h')}\n"
        f"관측 시각: {current['time']}"
    )


@mcp.tool()
async def get_weather_forecast(city: str = "Seoul", days: int = 3) -> str:
    """도시 이름과 일수를 받아 일별 최고/최저 기온과 강수확률 예보를 반환합니다."""
    days = max(1, min(int(days), 7))
    place = await _geocode(city)
    data = await _get_json(
        FORECAST_URL,
        {
            "latitude": place["latitude"],
            "longitude": place["longitude"],
            "daily": "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
            "forecast_days": days,
            "timezone": "auto",
        },
    )
    daily = data["daily"]
    name = place.get("name", city)
    lines = [f"{name} {days}일 예보"]
    for i, date in enumerate(daily["time"]):
        code = int(daily["weather_code"][i])
        weather = WEATHER_CODE_KO.get(code, f"weather_code={code}")
        lines.append(
            f"- {date}: {weather}, "
            f"최고 {daily['temperature_2m_max'][i]}°C / 최저 {daily['temperature_2m_min'][i]}°C, "
            f"강수확률 {daily['precipitation_probability_max'][i]}%"
        )
    return "\n".join(lines)


if __name__ == "__main__":
    mcp.run()
