# Project Structure

```
otjobber/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root layout (Amplify config, theme, auth wrapper)
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Global styles (Tailwind)
│   ├── signin/                 # Sign-in page
│   ├── signup/                 # Sign-up page
│   └── dashboard/              # Authenticated dashboard (protected by middleware)
│       ├── layout.tsx          # Dashboard layout (sidebar)
│       ├── page.tsx            # Dashboard overview
│       ├── logs/               # Training log management
│       ├── ingest/             # Bulk import from Excel
│       ├── export/             # Export logs by date range
│       └── settings/           # Account settings
├── components/                 # React components
│   ├── ui/                     # shadcn/ui primitives (button, card, dialog, etc.)
│   ├── ai/                     # AI-related components (comparison dialog)
│   ├── app-sidebar/            # Navigation sidebar
│   ├── auth/                   # Auth forms and wrappers
│   ├── dashboard/              # Dashboard widgets (charts, stats)
│   ├── export/                 # Export feature components
│   ├── ingest/                 # Ingest wizard steps
│   ├── logs/                   # Log table, form, filters, pagination
│   ├── providers/              # Context providers (theme)
│   └── settings/               # Settings page components
├── hooks/                      # Custom React hooks
│   ├── use-auth.ts             # Authentication hook
│   ├── use-ai-rate-limit.ts    # AI usage tracking
│   ├── use-ingest-logs.ts      # Ingest workflow state
│   ├── use-export-logs.ts      # Export workflow state
│   ├── use-logs-filter.ts      # Log filtering logic
│   └── use-mobile.ts           # Responsive breakpoint detection
├── lib/                        # Shared utilities and logic
│   ├── utils.ts                # cn() class merge utility
│   ├── auth.ts                 # Auth helpers
│   ├── ai-client.ts            # AI generation client
│   ├── excel-parser.ts         # Excel file parsing
│   ├── export-utils.ts         # Export formatting
│   ├── nav-items.ts            # Sidebar navigation config
│   ├── stores/                 # Zustand stores
│   └── theming/                # Theme configuration
├── types/                      # Shared TypeScript types
│   ├── training-log.ts         # TrainingLog type (from Amplify schema)
│   └── ingest.ts               # Ingest workflow types
├── amplify/                    # ⚠️ DEPRECATED - Amplify Gen 2 (migrating away)
│   ├── backend.ts              # Backend entry point (auth + data)
│   ├── auth/resource.ts        # Cognito auth config
│   └── data/resource.ts        # GraphQL schema + AI generation
├── backend/                    # ✅ PRIMARY - Standalone CDK infrastructure
│   ├── bin/app.ts              # CDK app entry point
│   ├── lib/
│   │   ├── config.ts           # Environment validation + helpers
│   │   ├── stacks/             # CDK stacks (auth, data, ai)
│   │   ├── constructs/         # Reusable CDK constructs (resolvers)
│   │   └── graphql/            # GraphQL schema + VTL resolvers
│   ├── lambda/                 # Lambda function handlers
│   └── test/                   # CDK stack tests (Jest)
├── scripts/                    # Migration/utility scripts
├── middleware.ts               # Next.js middleware (auth route protection)
├── amplify_outputs.json        # Generated Amplify config (consumed by frontend)
└── components.json             # shadcn/ui configuration
```

## Key Patterns

- **Route protection**: Middleware redirects unauthenticated users from `/dashboard/*` to `/signin`
- **Data access**: AppSync GraphQL API (CDK-managed) for all data operations
- **Single-table DynamoDB**: PK/SK pattern with GSI1 for alternate access patterns
- **Component colocation**: Feature components grouped by domain (logs, ingest, export), UI primitives in `ui/`

## Migration Note

The project is migrating from Amplify Gen 2 (`amplify/`) to standalone CDK (`backend/`). All new backend infrastructure, resolvers, and API changes must go in the CDK project. Do not add to or modify the `amplify/` directory.
