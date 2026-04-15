#!/usr/bin/env bash
set -euo pipefail

# Report evidence to ForgeGraph
# Environment variables set by action.yml

if [ -z "${FORGEGRAPH_URL:-}" ] || [ -z "${API_TOKEN:-}" ]; then
  echo "Warning: FORGEGRAPH_URL or API_TOKEN not set, skipping evidence report"
  exit 0
fi

# Normalize status
case "${STATUS:-}" in
  success) STATUS="passed" ;;
  failure) STATUS="failed" ;;
esac

# Resolve changeset ID from git SHA if not provided
if [ -z "${CHANGESET_ID:-}" ] && [ -n "${GIT_SHA:-}" ]; then
  RESOLVE_URL="${FORGEGRAPH_URL}/api/evidence/resolve?git_sha=${GIT_SHA}"
  if [ -n "${REPOSITORY_ID:-}" ]; then
    RESOLVE_URL="${RESOLVE_URL}&repository_id=${REPOSITORY_ID}"
  fi

  RESOLVE_RESP=$(curl -sf -H "Authorization: Bearer ${API_TOKEN}" "${RESOLVE_URL}" 2>/dev/null || echo "")
  if [ -n "$RESOLVE_RESP" ]; then
    CHANGESET_ID=$(echo "$RESOLVE_RESP" | jq -r '.changesetId // empty' 2>/dev/null || echo "")
  fi
fi

# Build evidence payload
PAYLOAD=$(jq -n \
  --arg type "${EVIDENCE_TYPE:-build}" \
  --arg status "${STATUS:-unknown}" \
  --arg pipeline "${PIPELINE_NAME:-}" \
  --arg suite "${SUITE_NAME:-}" \
  --arg image "${CONTAINER_IMAGE:-}" \
  --arg digest "${CONTAINER_DIGEST:-}" \
  --arg changeset "${CHANGESET_ID:-}" \
  --arg sha "${GIT_SHA:-}" \
  '{
    type: $type,
    status: $status,
    pipeline_name: $pipeline,
    commit_sha: $sha
  }
  + (if $changeset != "" then {changeset_id: $changeset} else {} end)
  + (if $suite != "" then {suite_name: $suite} else {} end)
  + (if $image != "" then {container_image: $image} else {} end)
  + (if $digest != "" then {container_digest: $digest} else {} end)
')

# Submit evidence
HTTP_CODE=$(curl -sf -o /dev/null -w "%{http_code}" \
  -X POST "${FORGEGRAPH_URL}/api/evidence" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" 2>/dev/null || echo "000")

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
  echo "✓ Evidence reported: ${EVIDENCE_TYPE} ${STATUS}"
else
  echo "Warning: evidence report returned HTTP ${HTTP_CODE}"
fi
