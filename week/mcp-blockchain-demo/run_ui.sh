#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

# Hermes/WSL에서 이미 다른 Python venv가 활성화된 경우 uv가 경고를 띄우므로
# UI 서버도 프로젝트 .venv 기준으로 실행합니다.
unset VIRTUAL_ENV

uv sync --quiet

echo "MCP UI server starting..."
echo "Open this in Windows browser: http://127.0.0.1:8765"
uv run uvicorn web_app:app --host 127.0.0.1 --port 8765
