#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# migrate-training-logs.sh
# Migrates TrainingLog records from old Amplify DynamoDB table to new
# single-table format (PK=USER#<userId>, SK=LOG#<date>#<id>).
# =============================================================================

REGION="eu-west-2"
SOURCE_TABLE=""
TARGET_TABLE=""

usage() {
  cat <<EOF
Usage: $0 --source-table <name> --target-table <name> [--region <region>]

Arguments:
  --source-table   (required) The source DynamoDB table name (old Amplify table)
  --target-table   (required) The target DynamoDB table name (new single-table)
  --region         (optional) AWS region (default: eu-west-2)
  --help           Show this message

Example:
  $0 --source-table TrainingLog-abc123-MAIN --target-table OTJobber-Data-dev
EOF
  exit 1
}

# --- Argument parsing ---
while [[ $# -gt 0 ]]; do
  case "$1" in
    --source-table) SOURCE_TABLE="$2"; shift 2 ;;
    --target-table) TARGET_TABLE="$2"; shift 2 ;;
    --region) REGION="$2"; shift 2 ;;
    --help) usage ;;
    *) echo "ERROR: Unknown argument: $1"; usage ;;
  esac
done

if [[ -z "$SOURCE_TABLE" || -z "$TARGET_TABLE" ]]; then
  echo "ERROR: --source-table and --target-table are required."
  usage
fi

# --- Prerequisite checks ---
for cmd in aws jq; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "ERROR: '$cmd' is required but not installed."
    exit 1
  fi
done

echo "=== Training Log Migration ==="
echo "Source: $SOURCE_TABLE"
echo "Target: $TARGET_TABLE"
echo "Region: $REGION"
echo ""

# --- Scan source table ---
echo "Scanning source table..."
ALL_ITEMS="[]"
LAST_KEY=""
SCAN_COUNT=0

while true; do
  if [[ -z "$LAST_KEY" ]]; then
    RESPONSE=$(aws dynamodb scan \
      --table-name "$SOURCE_TABLE" \
      --region "$REGION" \
      --output json)
  else
    RESPONSE=$(aws dynamodb scan \
      --table-name "$SOURCE_TABLE" \
      --region "$REGION" \
      --exclusive-start-key "$LAST_KEY" \
      --output json)
  fi

  ITEMS=$(echo "$RESPONSE" | jq '.Items')
  COUNT=$(echo "$ITEMS" | jq 'length')
  SCAN_COUNT=$((SCAN_COUNT + COUNT))
  ALL_ITEMS=$(echo "$ALL_ITEMS $ITEMS" | jq -s '.[0] + .[1]')

  LAST_KEY=$(echo "$RESPONSE" | jq -r '.LastEvaluatedKey // empty')
  if [[ -z "$LAST_KEY" ]]; then
    break
  fi
done

echo "Found $SCAN_COUNT items in source table."

if [[ $SCAN_COUNT -eq 0 ]]; then
  echo "No items to migrate."
  exit 0
fi

# --- Transform and write ---
echo "Transforming and writing to target table..."
WRITTEN=0
ERRORS=0
BATCH="[]"

for i in $(seq 0 $((SCAN_COUNT - 1))); do
  ITEM=$(echo "$ALL_ITEMS" | jq ".[$i]")

  # Extract fields
  USER_ID=$(echo "$ITEM" | jq -r '.userId.S')
  DATE=$(echo "$ITEM" | jq -r '.date.S')
  ID=$(echo "$ITEM" | jq -r '.id.S')

  if [[ -z "$USER_ID" || -z "$DATE" || -z "$ID" ]]; then
    echo "WARNING: Skipping item $i - missing userId, date, or id"
    ERRORS=$((ERRORS + 1))
    continue
  fi

  # Build new item with single-table keys
  NEW_ITEM=$(echo "$ITEM" | jq \
    --arg pk "USER#${USER_ID}" \
    --arg sk "LOG#${DATE}#${ID}" \
    --arg gsi1pk "LOG#${ID}" \
    --arg gsi1sk "USER#${USER_ID}" \
    '. + {
      "PK": {"S": $pk},
      "SK": {"S": $sk},
      "GSI1PK": {"S": $gsi1pk},
      "GSI1SK": {"S": $gsi1sk}
    }')

  # Add to batch
  PUT_REQUEST=$(jq -n --argjson item "$NEW_ITEM" '{"PutRequest": {"Item": $item}}')
  BATCH=$(echo "$BATCH" | jq --argjson req "$PUT_REQUEST" '. + [$req]')

  # Write batch when it reaches 25 items
  BATCH_SIZE=$(echo "$BATCH" | jq 'length')
  if [[ $BATCH_SIZE -ge 25 ]]; then
    REQUEST_ITEMS=$(jq -n --arg table "$TARGET_TABLE" --argjson items "$BATCH" '{($table): $items}')

    RESULT=$(aws dynamodb batch-write-item \
      --request-items "$REQUEST_ITEMS" \
      --region "$REGION" \
      --output json 2>&1) || {
      echo "ERROR: batch-write-item failed"
      ERRORS=$((ERRORS + BATCH_SIZE))
      BATCH="[]"
      continue
    }

    # Check for unprocessed items
    UNPROCESSED=$(echo "$RESULT" | jq ".UnprocessedItems.\"$TARGET_TABLE\" // [] | length")
    WRITTEN=$((WRITTEN + BATCH_SIZE - UNPROCESSED))
    if [[ $UNPROCESSED -gt 0 ]]; then
      echo "WARNING: $UNPROCESSED unprocessed items in batch (throttled)"
      ERRORS=$((ERRORS + UNPROCESSED))
    fi

    BATCH="[]"
    echo "  Progress: $WRITTEN/$SCAN_COUNT written"
  fi
done

# Write remaining items
BATCH_SIZE=$(echo "$BATCH" | jq 'length')
if [[ $BATCH_SIZE -gt 0 ]]; then
  REQUEST_ITEMS=$(jq -n --arg table "$TARGET_TABLE" --argjson items "$BATCH" '{($table): $items}')

  RESULT=$(aws dynamodb batch-write-item \
    --request-items "$REQUEST_ITEMS" \
    --region "$REGION" \
    --output json 2>&1) || {
    echo "ERROR: batch-write-item failed for final batch"
    ERRORS=$((ERRORS + BATCH_SIZE))
  }

  if [[ -n "${RESULT:-}" ]]; then
    UNPROCESSED=$(echo "$RESULT" | jq ".UnprocessedItems.\"$TARGET_TABLE\" // [] | length")
    WRITTEN=$((WRITTEN + BATCH_SIZE - UNPROCESSED))
    if [[ $UNPROCESSED -gt 0 ]]; then
      ERRORS=$((ERRORS + UNPROCESSED))
    fi
  fi
fi

echo ""
echo "=== Migration Complete ==="
echo "Items scanned:  $SCAN_COUNT"
echo "Items written:  $WRITTEN"
echo "Errors:         $ERRORS"
