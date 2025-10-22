#!/usr/bin/env bash
set -euo pipefail

if [[ $# -gt 0 ]]; then
  BASE_URL="$1"
else
  BASE_URL="${SERVICE_HOST:-}"
fi

if [[ -z "${BASE_URL}" ]]; then
  echo "Usage: SERVICE_HOST=https://<app>.azurewebsites.net $0" >&2
  echo "   or: $0 https://<app>.azurewebsites.net" >&2
  exit 1
fi

HEALTH_ENDPOINT="${BASE_URL%/}/healthz"

echo "[smoke] Probing ${HEALTH_ENDPOINT}"
STATUS=$(curl -sS -o /tmp/smoke_response.json -w "%{http_code}" --retry 3 --retry-delay 5 --retry-connrefused "${HEALTH_ENDPOINT}") || true

if [[ "${STATUS}" != "200" ]]; then
  echo "[smoke] Unexpected status ${STATUS}. Response body:" >&2
  cat /tmp/smoke_response.json >&2
  exit 1
fi

echo "[smoke] Health check passed with 200 OK"
cat /tmp/smoke_response.json
