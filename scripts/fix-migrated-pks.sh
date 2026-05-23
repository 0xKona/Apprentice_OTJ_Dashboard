#!/usr/bin/env bash
set -euo pipefail

REGION="eu-west-2"
TABLE="OTJobber-Data-prod"

OLD_SUBS=("06a2a264-80d1-706c-cba5-c95540539816" "d66222b4-1091-700b-e700-8eb39f2fec0b")
NEW_SUBS=("66a2c2e4-50b1-7034-601f-1650b2cf2b84" "365262b4-a001-70f2-ecb5-d042cc8ef0b2")

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
