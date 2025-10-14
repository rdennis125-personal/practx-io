#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "Usage: $0 <apim-name> <resource-group> [api-suffix]"
  exit 1
fi

APIM_NAME=$1
RESOURCE_GROUP=$2
SUFFIX=${3:-v1}

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONTRACT_DIR="$ROOT_DIR/../practx-contracts/openapi"

for spec in $(find "$CONTRACT_DIR" -name openapi.yaml | sort); do
  service="$(basename "$(dirname "$(dirname "$spec") )")"
  api_id="${service}-${SUFFIX}"
  echo "Importing $spec as $api_id"
  az apim api import --path "$service" --api-id "$api_id" --service-name "$APIM_NAME" --resource-group "$RESOURCE_GROUP" --specification-format OpenApi --specification-file "$spec" --api-type http --service-url "https://placeholder" >/dev/null
  echo "Imported $api_id"
  echo
  echo "TODO: Update backend service-url for $api_id before production rollout."
  echo

done
