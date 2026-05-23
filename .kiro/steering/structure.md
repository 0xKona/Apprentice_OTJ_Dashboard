# Project Structure

```
otjobber/
├── frontend/                   # Next.js workspace
│   ├── app/                    # App Router pages
│   │   ├── layout.tsx          # Root layout (Amplify config, theme, auth wrapper)
│   │   ├── page.tsx            # Landing page
│   │   ├── globals.css         # Global styles (Tailwind)
│   │   ├── signin/             # Sign-in page
│   │   ├── signup/             # Sign-up page
│   │   ├── reset-password/     # Password reset (migrated users)
│   │   └── dashboard/          # Authenticated dashboard (protected by middleware)
│   │       ├── layout.tsx      # Dashboard layout (sidebar)
│   │       ├── page.tsx        # Dashboard overview
│   │       ├── logs/           # Training log management
│   │       ├── ingest/         # Bulk import from Excel
│   │       ├── export/         # Export logs by date range
│   │       └── settings/       # Account settings
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui primitives
│   │   ├── ai/                 # AI-related components
│   │   ├── app-sidebar/        # Navigation sidebar
│   │   ├── auth/               # Auth forms and wrappers
│   │   ├── dashboard/          # Dashboard widgets
│   │   ├── export/             # Export feature components
│   │   ├── ingest/             # Ingest wizard steps
│   │   ├── logs/               # Log table, form, filters, pagination
│   │   ├── providers/          # Context providers (theme)
│   │   └── settings/           # Settings page components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Shared utilities and logic
│   │   ├── api-client.ts       # GraphQL client (generateClient)
│   │   ├── graphql/            # Query and mutation strings
│   │   ├── stores/             # Zustand stores
│   │   └── ...                 # Utils, auth, excel-parser, etc.
│   ├── types/                  # TypeScript interfaces
│   ├── public/                 # Static assets
│   ├── middleware.ts           # Auth route protection
│   ├── package.json            # Frontend dependencies
│   └── tsconfig.json           # Frontend TypeScript config
├── backend/                    # AWS CDK workspace
│   ├── bin/app.ts              # CDK app entry point
│   ├── lib/
│   │   ├── config.ts           # Environment validation
│   │   ├── stacks/             # CDK stacks (auth, data, ai)
│   │   ├── constructs/         # Reusable CDK constructs
│   │   └── graphql/            # Schema + JS resolvers
│   ├── lambda/                 # Lambda function handlers
│   ├── test/                   # CDK stack tests (Jest)
│   └── package.json            # Backend dependencies
├── package.json                # Monorepo orchestrator (workspaces)
├── .gitignore
└── .npmrc
```

## Key Patterns

- **Monorepo**: npm workspaces — `npm install` from root installs both
- **Route protection**: Middleware redirects unauthenticated users from `/dashboard/*` to `/signin`
- **Data access**: AppSync GraphQL API (CDK-managed) via explicit query/mutation strings
- **Identity**: Resolvers use `ctx.identity.sub` (Cognito sub UUID)
- **Single-table DynamoDB**: PK/SK pattern with GSI1 for alternate access patterns
- **Component colocation**: Feature components grouped by domain, UI primitives in `ui/`
- **Hosting**: AWS Amplify Hosting with monorepo support (`appRoot: frontend`)
