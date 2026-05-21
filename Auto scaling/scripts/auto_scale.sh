#!/usr/bin/env bash
set -euo pipefail

PROM_URL="${PROM_URL:-http://localhost:9090}"
SERVICE="${1:-user-service}"
MIN_REPLICAS="${MIN_REPLICAS:-1}"
MAX_REPLICAS="${MAX_REPLICAS:-5}"
SCALE_UP_CPU="${SCALE_UP_CPU:-65}"
SCALE_DOWN_CPU="${SCALE_DOWN_CPU:-20}"
COOLDOWN_SECONDS="${COOLDOWN_SECONDS:-60}"
CURRENT_REPLICAS="${INITIAL_REPLICAS:-1}"

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required. Install it and retry." >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required. Install Docker and retry." >&2
  exit 1
fi

echo "Auto-scaler started for service: ${SERVICE}"
echo "Thresholds: up>${SCALE_UP_CPU}% down<${SCALE_DOWN_CPU}%"
echo "Range: min=${MIN_REPLICAS}, max=${MAX_REPLICAS}"

while true; do
  QUERY="100 * sum(rate(container_cpu_usage_seconds_total{container_label_com_docker_compose_service=\"${SERVICE}\"}[1m]))"

  RESPONSE=$(curl -sG "${PROM_URL}/api/v1/query" --data-urlencode "query=${QUERY}")
  VALUE=$(echo "${RESPONSE}" | jq -r '.data.result[0].value[1] // "0"')

  CPU=$(printf '%.2f' "${VALUE}")
  TARGET_REPLICAS="${CURRENT_REPLICAS}"

  awk_cmp() {
    awk "BEGIN {exit !($1)}"
  }

  if awk_cmp "${CPU} > ${SCALE_UP_CPU}" && [ "${CURRENT_REPLICAS}" -lt "${MAX_REPLICAS}" ]; then
    TARGET_REPLICAS=$((CURRENT_REPLICAS + 1))
  elif awk_cmp "${CPU} < ${SCALE_DOWN_CPU}" && [ "${CURRENT_REPLICAS}" -gt "${MIN_REPLICAS}" ]; then
    TARGET_REPLICAS=$((CURRENT_REPLICAS - 1))
  fi

  NOW=$(date '+%Y-%m-%d %H:%M:%S')
  echo "[${NOW}] service=${SERVICE} cpu=${CPU}% replicas=${CURRENT_REPLICAS}"

  if [ "${TARGET_REPLICAS}" -ne "${CURRENT_REPLICAS}" ]; then
    echo "Scaling ${SERVICE} -> ${TARGET_REPLICAS} replicas"
    docker compose up -d --scale "${SERVICE}=${TARGET_REPLICAS}" "${SERVICE}" >/dev/null
    CURRENT_REPLICAS="${TARGET_REPLICAS}"
    sleep "${COOLDOWN_SECONDS}"
    continue
  fi

  sleep 15
done
