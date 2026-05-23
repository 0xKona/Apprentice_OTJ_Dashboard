#!/usr/bin/env bash
set -euo pipefail

# TEMPORARY: Re-keys training log items from SK=LOG#date#id to SK=LOG#id
# Delete this script after migration is complete.

REGION="eu-west-2"
TABLE="${1:?Usage: $0 <table-name>}"

echo "=== Re-key SK: LOG#date#id -> LOG#id ==="
echo "Table: $TABLE"
echo ""

ITEMS=$(aws dynamodb scan \
  --table-name "$TABLE" \
  --region "$REGION" \
  --filter-expression "begins_with(SK, :prefix)" \
  --expression-attribute-values '{":prefix": {"S": "LOG#"}}' \
  --output json | jq '.Items')

COUNT=$(echo "$ITEMS" | jq 'length')
echo "Found $COUNT items"

FIXED=0
SKIPPED=0

for i in $(seq 0 $((COUNT - 1))); do
  ITEM=$(echo "$ITEMS" | jq ".[$i]")
  OLD_SK=$(echo "$ITEM" | jq -r '.SK.S')
  ID=$(echo "$ITEM" | jq -r '.id.S')
  NEW_SK="LOG#${ID}"

  # Skip if already in new format
  if [[ "$OLD_SK" == "$NEW_SK" ]]; then
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  PK=$(echo "$ITEM" | jq -r '.PK.S')

  # Write item with new SK
  NEW_ITEM=$(echo "$ITEM" | jq --arg sk "$NEW_SK" '.SK.S = $sk')
  aws dynamodb put-item --table-name "$TABLE" --region "$REGION" --item "$NEW_ITEM" 2>/dev/null

  # Delete old item
  aws dynamodb delete-item --table-name "$TABLE" --region "$REGION" \
    --key "{\"PK\": {\"S\": \"${PK}\"}, \"SK\": {\"S\": \"${OLD_SK}\"}}" 2>/dev/null

  FIXED=$((FIXED + 1))
done

echo ""
echo "Done. Re-keyed: $FIXED, Skipped (already correct): $SKIPPED"
