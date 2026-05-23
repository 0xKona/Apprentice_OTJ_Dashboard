# Production Migration Guide

## Overview

Migrate OTJobber from Amplify Gen 2 sandbox to standalone CDK infrastructure. This covers deploying the CDK stacks, migrating users and data, and cutting over the frontend.

## Prerequisites

- AWS CLI configured with appropriate credentials
- CDK CLI installed (`npm install -g aws-cdk`)
- Access to the source Amplify Cognito pool and DynamoDB table
- The `backend/` CDK project builds and tests pass (`cd backend && npm test`)

## Architecture

| Component | Source (Amplify) | Target (CDK) |
|-----------|-----------------|--------------|
| Auth | Amplify sandbox pool | `OTJobber-UserPool-prod` |
| API | Amplify AppSync | CDK-managed AppSync |
| Database | `TrainingLog-*-NONE` | `OTJobber-Data-prod` (single-table) |
| AI | Amplify AI generation | Lambda + Bedrock |

## Step-by-Step

### 1. Deploy CDK Stacks (prod)

```bash
npm run backend:deploy:prod
```

Note the outputs:
- `AuthStack.UserPoolId`
- `AuthStack.UserPoolClientId`
- `DataStack.ApiUrl`
- `DataStack.TableName`

### 2. Migrate Users

Imports users from the source Amplify pool to the new CDK pool. Users will have `RESET_REQUIRED` status and must set a new password on first login.

```bash
./scripts/migrate-users.sh \
  --source-pool-id <amplify-pool-id> \
  --target-pool-id <cdk-AuthStack-UserPoolId>
```

### 3. Migrate Training Logs

Copies training log data from the old Amplify DynamoDB table to the new single-table format.

```bash
./scripts/migrate-training-logs.sh \
  --source-table <amplify-TrainingLog-table> \
  --target-table <cdk-DataStack-TableName>
```

### 4. Fix Migrated PKs

The migration script writes `PK = USER#<old-pool-sub>`. The new pool assigns new subs to imported users. This script re-keys items to match.

**Before running:** Update `scripts/fix-migrated-pks.sh` with the correct sub mappings:
- Query old pool: `aws cognito-idp list-users --user-pool-id <old-pool-id> --region eu-west-2`
- Query new pool: `aws cognito-idp list-users --user-pool-id <new-pool-id> --region eu-west-2`
- Match users by email, then map old sub → new sub in the `OLD_SUBS` and `NEW_SUBS` arrays

```bash
# Edit the script with prod values first
vim scripts/fix-migrated-pks.sh
# Update TABLE, OLD_SUBS, and NEW_SUBS

./scripts/fix-migrated-pks.sh
```

### 5. Update Frontend Config

Update `amplify_outputs.json` with the prod CDK outputs:

```json
{
  "auth": {
    "user_pool_id": "<AuthStack.UserPoolId>",
    "user_pool_client_id": "<AuthStack.UserPoolClientId>",
    ...
  },
  "data": {
    "url": "<DataStack.ApiUrl>",
    ...
  }
}
```

### 6. Deploy Frontend

Deploy the Next.js app pointing to the new prod backend.

### 7. Verify

- [ ] Sign in works (existing users get password reset flow)
- [ ] Password reset completes and redirects to dashboard
- [ ] All training logs visible after login
- [ ] Create, update, delete logs works
- [ ] AI improvement generation works
- [ ] Rate limiting displays correctly
- [ ] Export (clipboard + CSV) works
- [ ] Ingest from Excel works
- [ ] Second user account also has correct data

## Rollback

If issues arise:
1. Revert `amplify_outputs.json` to the old Amplify values
2. Redeploy frontend — users go back to the Amplify sandbox
3. CDK stacks can remain deployed (no cost if unused)

## Known Gotchas

| Issue | Cause | Fix |
|-------|-------|-----|
| Logs not visible after login | PK mismatch (old sub vs new sub) | Run `fix-migrated-pks.sh` with correct mapping |
| "Password reset required" on sign-in | Expected for migrated users | User completes the reset flow, then works normally |
| AI generation fails | Lambda not deployed or Bedrock not enabled | Verify `AiStack` deployed, Bedrock model access granted in region |
| `ctx.identity.sub` is undefined | Wrong auth mode on AppSync | Ensure `AMAZON_COGNITO_USER_POOLS` is default auth |

## Post-Migration Cleanup

Once prod is confirmed stable:
1. Delete the Amplify sandbox (`npm run sandbox:delete`)
2. Remove the `amplify/` directory from the repo
3. Remove `@aws-amplify/backend` from `package.json` if unused at runtime
4. Delete the old Amplify DynamoDB table and Cognito pool
