# Tech Stack

## Frontend
- **Framework**: Next.js 16 (App Router, React Server Components)
- **React**: 19
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 with CSS variables
- **UI Components**: shadcn/ui (New York style, Radix UI primitives, Lucide icons)
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Theming**: next-themes (system/light/dark)
- **Toasts**: Sonner

## Backend (CDK - primary, active development)
- **IaC**: AWS CDK v2 (TypeScript)
- **API**: AWS AppSync (GraphQL)
- **Database**: DynamoDB (single-table design with PK/SK + GSI1)
- **Auth**: Cognito User Pool
- **AI**: Amazon Bedrock (via Lambda resolvers)
- **Environments**: dev, staging, prod (context-driven)
- **Region**: eu-west-2 (default)

## Backend (Amplify Gen 2 - DEPRECATED, migrating away)
- **Auth**: AWS Amplify Auth (Cognito user pools, email login)
- **Data**: AWS Amplify Data (AppSync GraphQL + DynamoDB)
- **AI**: Amplify AI Generation (Amazon Bedrock - Nova Lite)
- **Adapter**: @aws-amplify/adapter-nextjs (server-side auth via middleware)

> ⚠️ **Migration in progress**: The project is actively migrating from Amplify Gen 2 to standalone CDK. All new backend work should target the `backend/` CDK project. The `amplify/` directory is legacy and will be removed once migration is complete.

## Common Commands

```bash
# Frontend
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run lint         # ESLint

# Amplify Sandbox (local dev backend)
npm run sandbox:start    # Start Amplify sandbox
npm run sandbox:delete   # Tear down sandbox

# CDK Backend
npm run backend:deploy:dev      # Deploy to dev
npm run backend:deploy:staging  # Deploy to staging
npm run backend:deploy:prod     # Deploy to prod
cd backend && npm test          # Run CDK tests (Jest)
cd backend && npm run synth     # Synthesize CloudFormation
```

## Key Configuration
- Path alias: `@/*` maps to project root
- Monorepo: npm workspaces with `backend/` as a workspace
- shadcn components: `components/ui/`
- Utility function: `cn()` from `@/lib/utils` for class merging
