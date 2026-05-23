#!/usr/bin/env bash
set -euo pipefail

# Re-keys migrated training log items from old Cognito subs to new pool subs.

REGION="eu-west-2"
TABLE="OTJobber-Data-dev"

OLD_SUBS=("06a2a264-80d1-706c-cba5-c95540539816" "d66222b4-1091-700b-e700-8eb39f2fec0b")
NEW_SUBS=("d6d262d4-50d1-70ee-cc6a-88f5eae414b4" "e6526274-d021-70a8-dcce-47cce657ed26")

FIXED=0
ERRORS=0

for idx in "${!OLD_SUBS[@]}"; do
  OLD_SUB="${OLD_SUBS[$idx]}"
  NEW_SUB="${NEW_SUBS[$idx]}"
  echo "Mapping: $OLD_SUB -> $NEW_SUB"

  ITEMS=$(aws dynamodb query \
    --table-name "$TABLE" \
    --region "$REGION" \
    --key-condition-expression "PK = :pk" \
    --expression-attribute-values "{\":pk\": {\"S\": \"USER#${OLD_SUB}\"}}" \
    --output json | jq '.Items')

  COUNT=$(echo "$ITEMS" | jq 'length')
  echo "  Found $COUNT items"

  for i in $(seq 0 $((COUNT - 1))); do
    ITEM=$(echo "$ITEMS" | jq ".[$i]")
    OLD_SK=$(echo "$ITEM" | jq -r '.SK.S')

    NEW_ITEM=$(echo "$ITEM" | jq \
      --arg pk "USER#${NEW_SUB}" \
      --arg gsi1sk "USER#${NEW_SUB}" \
      --arg uid "$NEW_SUB" \
      '.PK.S = $pk | .GSI1SK.S = $gsi1sk | .userId.S = $uid')

    if aws dynamodb put-item --table-name "$TABLE" --region "$REGION" --item "$NEW_ITEM" 2>/dev/null; then
      aws dynamodb delete-item --table-name "$TABLE" --region "$REGION" \
        --key "{\"PK\": {\"S\": \"USER#${OLD_SUB}\"}, \"SK\": {\"S\": \"${OLD_SK}\"}}" 2>/dev/null
      FIXED=$((FIXED + 1))
    else
      echo "  ERROR: Failed on SK=$OLD_SK"
      ERRORS=$((ERRORS + 1))
    fi
  done
done

echo ""
echo "Done. Fixed: $FIXED, Errors: $ERRORS"
