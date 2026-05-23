# Frontend — AGENTS.md

## Overview

Next.js 16 web application for managing apprenticeship training logs.

## Tech Stack

- Next.js 16 (App Router), React 19, TypeScript (strict)
- Tailwind CSS v4, shadcn/ui (New York style, Radix UI, Lucide icons)
- Zustand (state), React Hook Form + Zod (forms), Recharts (charts)
- aws-amplify (auth + GraphQL client), next-themes, Sonner (toasts)

## Structure

```
frontend/
├── app/              # Next.js App Router pages
│   ├── dashboard/    # Authenticated pages (logs, ingest, export, settings)
│   ├── signin/       # Sign-in page
│   ├── signup/       # Sign-up page
│   └── reset-password/ # Password reset for migrated users
├── components/       # React components (grouped by domain)
│   ├── ui/           # shadcn/ui primitives
│   ├── logs/         # Log table, form, filters
│   ├── dashboard/    # Charts, stats widgets
│   ├── auth/         # Auth forms
│   ├── ingest/       # Bulk import wizard
│   ├── export/       # Export components
│   └── settings/     # Account settings
├── hooks/            # Custom React hooks
├── lib/              # Utilities, stores, GraphQL operations
│   ├── graphql/      # Query and mutation strings
│   ├── stores/       # Zustand stores
│   └── api-client.ts # GraphQL client instance
├── types/            # TypeScript interfaces
└── public/           # Static assets
```

## Key Patterns

- **Route protection**: `middleware.ts` redirects unauthenticated users from `/dashboard/*` to `/signin`
- **Data access**: Explicit GraphQL queries/mutations via `aws-amplify/api` `generateClient()`
- **Path alias**: `@/*` maps to `frontend/` root
- **AI generation**: Direct `client.graphql()` call to `generateImprovement` mutation
- **Rate limiting**: Read-only display; enforcement is server-side (Lambda)

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint
```

## Conventions

- Components grouped by feature domain, UI primitives in `components/ui/`
- Use `cn()` from `@/lib/utils` for class merging
- All data fetching via GraphQL (no REST, no direct DynamoDB)
- No `any` types on public interfaces
- `amplify_outputs.json` provides runtime config (gitignored, set per environment)
