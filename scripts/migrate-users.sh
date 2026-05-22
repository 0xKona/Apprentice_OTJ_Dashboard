#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# migrate-users.sh
# Bulk-imports users from a source Cognito User Pool to a target pool via CSV.
# Users will have RESET_REQUIRED status after import.
# =============================================================================

REGION="eu-west-2"
SOURCE_POOL_ID=""
TARGET_POOL_ID=""
ROLE_NAME="CognitoImportRole-OTJobber"

usage() {
  cat <<EOF
Usage: $0 --source-pool-id <id> --target-pool-id <id> [--region <region>]

Arguments:
  --source-pool-id   (required) The User Pool ID to read users from
  --target-pool-id   (required) The User Pool ID to import users into
  --region           (optional) AWS region (default: eu-west-2)
  --help             Show this message

Example:
  $0 --source-pool-id eu-west-2_ABC123 --target-pool-id eu-west-2_XYZ789
EOF
  exit 1
}

# --- Argument parsing ---
while [[ $# -gt 0 ]]; do
  case "$1" in
    --source-pool-id) SOURCE_POOL_ID="$2"; shift 2 ;;
    --target-pool-id) TARGET_POOL_ID="$2"; shift 2 ;;
    --region) REGION="$2"; shift 2 ;;
    --help) usage ;;
    *) echo "ERROR: Unknown argument: $1"; usage ;;
  esac
done

if [[ -z "$SOURCE_POOL_ID" || -z "$TARGET_POOL_ID" ]]; then
  echo "ERROR: --source-pool-id and --target-pool-id are required."
  usage
fi

# --- Prerequisite checks ---
for cmd in aws jq curl; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "ERROR: '$cmd' is required but not installed."
    exit 1
  fi
done

echo "=== Cognito User Migration ==="
echo "Source pool: $SOURCE_POOL_ID"
echo "Target pool: $TARGET_POOL_ID"
echo "Region:      $REGION"
echo ""

# --- Step 1: Export users from source pool (paginated) ---
echo "[1/6] Exporting users from source pool..."
USERS="[]"
PAGINATION_TOKEN=""

while true; do
  if [[ -z "$PAGINATION_TOKEN" ]]; then
    RESPONSE=$(aws cognito-idp list-users \
      --user-pool-id "$SOURCE_POOL_ID" \
      --region "$REGION" \
      --limit 60)
  else
    RESPONSE=$(aws cognito-idp list-users \
      --user-pool-id "$SOURCE_POOL_ID" \
      --region "$REGION" \
      --limit 60 \
      --pagination-token "$PAGINATION_TOKEN")
  fi

  BATCH=$(echo "$RESPONSE" | jq '.Users')
  USERS=$(echo "$USERS $BATCH" | jq -s '.[0] + .[1]')
  PAGINATION_TOKEN=$(echo "$RESPONSE" | jq -r '.PaginationToken // empty')

  if [[ -z "$PAGINATION_TOKEN" ]]; then
    break
  fi
done

USER_COUNT=$(echo "$USERS" | jq 'length')
echo "  Found $USER_COUNT users."

if [[ "$USER_COUNT" -eq 0 ]]; then
  echo "No users found in source pool. Nothing to migrate."
  exit 0
fi

# --- Step 2: Get target pool CSV header ---
echo "[2/6] Fetching CSV header from target pool..."
CSV_HEADER=$(aws cognito-idp get-csv-header \
  --user-pool-id "$TARGET_POOL_ID" \
  --region "$REGION" | jq -r '.CSVHeader | join(",")')

echo "  Header: $CSV_HEADER"

# --- Step 3: Generate CSV ---
echo "[3/6] Generating CSV file..."
CSV_FILE=$(mktemp /tmp/cognito-import-XXXXXX.csv)
echo "$CSV_HEADER" > "$CSV_FILE"

echo "$USERS" | jq -c '.[]' | while read -r user; do
  EMAIL=$(echo "$user" | jq -r '.Attributes[] | select(.Name=="email") | .Value // empty')
  EMAIL_VERIFIED=$(echo "$user" | jq -r '.Attributes[] | select(.Name=="email_verified") | .Value // "false"')

  if [[ -z "$EMAIL" ]]; then
    continue
  fi

  # Format: cognito:username,cognito:mfa_enabled,email,email_verified,phone_number,phone_number_verified
  echo "${EMAIL},false,${EMAIL},${EMAIL_VERIFIED},,false" >> "$CSV_FILE"
done

LINES=$(($(wc -l < "$CSV_FILE") - 1))
echo "  Generated CSV with $LINES user rows."

# --- Step 4: Create IAM role for CloudWatch logging ---
echo "[4/6] Creating IAM role for import job..."
TRUST_POLICY='{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "cognito-idp.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}'

ROLE_ARN=$(aws iam get-role --role-name "$ROLE_NAME" --query 'Role.Arn' --output text 2>/dev/null || true)

if [[ -z "$ROLE_ARN" || "$ROLE_ARN" == "None" ]]; then
  ROLE_ARN=$(aws iam create-role \
    --role-name "$ROLE_NAME" \
    --assume-role-policy-document "$TRUST_POLICY" \
    --query 'Role.Arn' --output text)

  aws iam put-role-policy \
    --role-name "$ROLE_NAME" \
    --policy-name "CognitoImportCloudWatchLogs" \
    --policy-document '{
      "Version": "2012-10-17",
      "Statement": [{
        "Effect": "Allow",
        "Action": ["logs:CreateLogGroup","logs:CreateLogStream","logs:DescribeLogStreams","logs:PutLogEvents"],
        "Resource": "arn:aws:logs:*:*:*"
      }]
    }'

  echo "  Created role: $ROLE_ARN"
  echo "  Waiting 10s for IAM propagation..."
  sleep 10
else
  echo "  Using existing role: $ROLE_ARN"
fi

# --- Step 5: Create import job and upload CSV ---
echo "[5/6] Creating import job and uploading CSV..."
JOB_RESPONSE=$(aws cognito-idp create-user-import-job \
  --user-pool-id "$TARGET_POOL_ID" \
  --job-name "migration-$(date +%Y%m%d-%H%M%S)" \
  --cloud-watch-logs-role-arn "$ROLE_ARN" \
  --region "$REGION")

JOB_ID=$(echo "$JOB_RESPONSE" | jq -r '.UserImportJob.JobId')
PRE_SIGNED_URL=$(echo "$JOB_RESPONSE" | jq -r '.UserImportJob.PreSignedUrl')

curl -s -X PUT -T "$CSV_FILE" -H "Content-Type: text/csv" "$PRE_SIGNED_URL"
echo "  CSV uploaded successfully."

# --- Step 6: Start import job ---
echo "[6/6] Starting import job..."
aws cognito-idp start-user-import-job \
  --user-pool-id "$TARGET_POOL_ID" \
  --job-id "$JOB_ID" \
  --region "$REGION" > /dev/null

echo ""
echo "=== Migration Started ==="
echo "Job ID: $JOB_ID"
echo "Status: InProgress"
echo ""
echo "Monitor progress:"
echo "  aws cognito-idp describe-user-import-job --user-pool-id $TARGET_POOL_ID --job-id $JOB_ID --region $REGION"
echo ""
echo "NOTE: Imported users will have RESET_REQUIRED status."
echo "      They must reset their password on first login."

# Clean up temp file
rm -f "$CSV_FILE"
