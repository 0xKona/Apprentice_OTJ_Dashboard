# Backend — AGENTS.md

## Overview

AWS CDK infrastructure for OTJobber. Manages auth, API, database, and AI services.

## Tech Stack

- AWS CDK v2 (TypeScript)
- AppSync (GraphQL API with JS resolvers)
- DynamoDB (single-table design: PK/SK + GSI1)
- Cognito User Pool (email-based auth)
- Lambda + Amazon Bedrock (AI text improvement)
- Jest (testing)

## Structure

```
backend/
├── bin/app.ts              # CDK app entry point
├── lib/
│   ├── config.ts           # Environment validation + helpers
│   ├── stacks/             # CDK stacks
│   │   ├── auth-stack.ts   # Cognito User Pool + Client
│   │   ├── data-stack.ts   # AppSync API + DynamoDB table
│   │   └── ai-stack.ts     # Lambda + Bedrock integration
│   ├── constructs/         # Reusable CDK constructs
│   └── graphql/
│       ├── schema.graphql  # GraphQL schema
│       └── resolvers/      # JS resolvers (per operation)
├── lambda/                 # Lambda function handlers
│   └── generate-improvement/handler.py
├── test/                   # CDK stack tests
└── package.json
```

## Key Patterns

- **Single-table DynamoDB**: `PK=USER#<sub>`, `SK=LOG#<date>#<id>`, `GSI1PK=LOG#<id>`
- **Identity**: Resolvers use `ctx.identity.sub` (Cognito sub UUID) — not username/email
- **Environments**: `dev`, `staging`, `prod` via CDK context (`--context environment=X`)
- **Naming**: Resources named `OTJobber-<Stack>-<env>` (e.g., `OTJobber-Data-prod`)
- **AI rate limiting**: Server-side atomic check in Lambda (DynamoDB conditional update)

## Commands

```bash
npm test             # Run Jest tests
npm run synth        # Synthesize CloudFormation
npm run deploy       # Deploy (use root scripts for env-specific deploys)
```

## Conventions

- All resolvers are JS (AppSync JS runtime), not VTL
- Lambda handlers in Python (Bedrock SDK)
- Tests use CDK assertions (`Template.fromStack`)
- Do not hardcode resource ARNs; use CDK references
- Region: `eu-west-2` for all resources
