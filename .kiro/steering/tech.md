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
- **Auth/API Client**: aws-amplify (auth + generateClient for GraphQL)

## Backend
- **IaC**: AWS CDK v2 (TypeScript)
- **API**: AWS AppSync (GraphQL, JS resolvers)
- **Database**: DynamoDB (single-table design with PK/SK + GSI1)
- **Auth**: Cognito User Pool (email-based)
- **AI**: Amazon Bedrock (Nova Lite, via Lambda)
- **Environments**: dev, staging, prod (CDK context-driven)
- **Region**: eu-west-2

## Common Commands

```bash
# Frontend
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run lint         # ESLint

# CDK Backend
npm run backend:deploy:dev      # Deploy to dev
npm run backend:deploy:staging  # Deploy to staging
npm run backend:deploy:prod     # Deploy to prod
npm run backend:test            # Run CDK tests (Jest)
```

## Key Configuration
- Path alias: `@/*` maps to `frontend/` root
- Monorepo: npm workspaces with `frontend/` and `backend/` as workspaces
- shadcn components: `frontend/components/ui/`
- Utility function: `cn()` from `@/lib/utils` for class merging
- Hosting: AWS Amplify Hosting (`appRoot: frontend`)
