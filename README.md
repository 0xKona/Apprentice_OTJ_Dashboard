# OTJobber

A web application for UK apprentices to manage their On-The-Job (OTJ) training logs. Record, track, and export training activities as required for apprenticeship documentation.

## Project Structure

```
otjobber/
├── frontend/   # Next.js 16 app (React 19, Tailwind, shadcn/ui)
├── backend/    # AWS CDK stacks (AppSync, DynamoDB, Lambda, Cognito)
└── package.json # Monorepo orchestrator (npm workspaces)
```

## Getting Started

```bash
# Install all dependencies (both workspaces)
npm install

# Run the frontend dev server
npm run dev

# Run backend tests
npm run backend:test
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run backend:test` | Run CDK tests |
| `npm run backend:deploy:dev` | Deploy CDK to dev |
| `npm run backend:deploy:prod` | Deploy CDK to prod |

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Zustand
- **Backend**: AWS CDK, AppSync (GraphQL), DynamoDB, Lambda, Cognito, Bedrock
- **Region**: eu-west-2
