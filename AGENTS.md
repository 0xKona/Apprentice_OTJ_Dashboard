# AGENTS.md

## Project Overview

OTJobber is a web application for UK apprentices to manage their On-The-Job (OTJ) training logs. It uses a monorepo structure with npm workspaces.

## Repository Structure

```
otjobber/
├── frontend/    # Next.js 16 app (React 19, TypeScript, Tailwind, shadcn/ui)
├── backend/     # AWS CDK stacks (AppSync, DynamoDB, Lambda, Cognito, Bedrock)
└── package.json # Monorepo orchestrator
```

## Workspaces

- **frontend/** — Next.js web application. See `frontend/AGENTS.md` for details.
- **backend/** — AWS CDK infrastructure. See `backend/AGENTS.md` for details.

## Commands

```bash
npm install                    # Install all workspace dependencies
npm run dev                    # Start frontend dev server
npm run build                  # Build frontend
npm run lint                   # Lint frontend
npm run backend:test           # Run CDK tests
npm run backend:deploy:dev     # Deploy backend to dev
npm run backend:deploy:prod    # Deploy backend to prod
```

## Key Conventions

- All dependencies are installed from root via `npm install`
- Each workspace declares its own dependencies in its `package.json`
- TypeScript strict mode across both workspaces
- Commit format: `type: description` (e.g., `feat:`, `fix:`, `chore:`, `refactor:`)
- Region: `eu-west-2` for all AWS resources
- Do not commit secrets, `.env` files, or `amplify_outputs.json`
