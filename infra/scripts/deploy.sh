#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 4 ]; then
  echo "Usage: $0 <resource-group> <name-prefix> <tenant-id> <location> [--deploy]" >&2
  exit 1
fi

RG="$1"
PREFIX="$2"
TENANT="$3"
LOCATION="$4"
ACTION="what-if"

if [ "${5:-}" = "--deploy" ]; then
  ACTION="create"
fi

echo "Running $ACTION for $PREFIX in $RG ($LOCATION)"

declare -a ARGS=(
  deployment
  group
  "$ACTION"
  --resource-group "$RG"
  --template-file "$(dirname "$0")/../bicep/main.bicep"
  --parameters namePrefix="$PREFIX" tenantId="$TENANT" location="$LOCATION"
)

az "${ARGS[@]}"
