#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

# Hermes/WSL에서 이미 다른 Python venv가 활성화된 경우 uv가 경고를 띄우므로
# 수업용 출력은 프로젝트 .venv 기준으로 깔끔하게 고정합니다.
unset VIRTUAL_ENV

uv sync --quiet

echo "=== Weather MCP demo ==="
uv run python clients/test_mcp_client.py weather

echo
echo "=== Coin MCP demo ==="
uv run python clients/test_mcp_client.py coin
