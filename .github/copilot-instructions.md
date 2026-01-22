# Copilot Instructions - OTJobber (Apprentice OTJ Dashboard)

## Architecture Overview

**Stack**: Next.js 14 (App Router) + AWS Amplify Gen 2 + TypeScript + Tailwind CSS v4  
**Purpose**: UK apprentice training log management with AI-powered text improvement

### Key Components

- **Frontend**: Next.js App Router with Server Components (SSR-enabled Amplify)
- **Backend**: AWS Amplify Gen 2 (`/amplify/` directory)
  - Auth: Cognito user pools with owner-based authorization
  - Data: DynamoDB with GraphQL API (AppSync)
  - AI: AWS Bedrock (Claude 3.5 Haiku / Amazon Nova Lite) for text generation
- **State**: Zustand stores (`/lib/stores/`) - auth and training logs
- **Forms**: React Hook Form + Zod validation with Controller pattern (no `register`)
- **UI**: Shadcn components in `/components/ui/` using Tailwind v4

## Critical Workflows

### Development

```bash
npm run dev                    # Start Next.js dev server (port 3000)
npm run sandbox:run            # Deploy Amplify backend to sandbox (identifier: otjobberDEV)
npm run sandbox:delete         # Clean up sandbox resources
```

### Amplify Configuration

- **Root layout** (`app/layout.tsx`): `Amplify.configure(outputs, { ssr: true })`
- **Client components**: `Amplify.configure(outputs)` (no SSR option)
- Always configure Amplify at the top level of each layout/page that needs it

## Project-Specific Conventions

### AWS Amplify Gen 2 Patterns

1. **Schema Definition** (`amplify/data/resource.ts`):

   - Use `a.schema()` for models and AI generation routes
   - Owner-based auth: `allow.owner().to(["read", "create", "update", "delete"])`
   - AI generations: `.generation()` with `systemPrompt`, `.arguments()`, `.returns()`, `.authorization()`

2. **GraphQL System Prompts**:

   - **CRITICAL**: No double quotes in prompts - use single quotes or no quotes
   - Example causes parse errors: `"field name"` → use `field name` or `the field name`
   - Prompts are parsed as GraphQL strings - colons in examples break syntax

3. **AI Generation Hook Pattern** (see `/lib/ai-client.ts`):

   ```typescript
   const { useAIGeneration } = createAIHooks(client);
   const [{ data, isLoading, hasError }, generateFn] =
     useAIGeneration("routeName");
   ```

   - Data arrives reactively - use `useEffect` to watch for changes
   - Don't try to return data immediately from the generation call

4. **Backend IAM Permissions** (`amplify/backend.ts`):
   - Bedrock access required for AI features: `AmazonBedrockFullAccess` policy
   - Applied to all data roles via `Object.values(backend.data.resources.roles)`

### Form Handling

- **Always use Controller**: Native `register` causes ref warnings with Shadcn components
- **Dialog forms**: Use `useEffect` with `reset()` to populate on open, not `defaultValues`
- **Validation**: Zod schemas + `zodResolver` - all fields `.required()` for this app

### Data Flow (Training Logs)

1. User creates/edits log via `TrainingLogForm` (dialog)
2. Optional: Click "AI Improve" → calls `GenerateImprovement` AI route
3. AI returns improved text → shown in `AiComparisonDialog` (side-by-side)
4. User accepts/rejects → form field updated via `setValue()`
5. Submit → DynamoDB via `client.models.TrainingLog.create/update`

### Environment-Based Tagging

- Backend auto-tags resources based on `AWS_BRANCH` env var
- Sandbox: No branch = `sandbox` environment, tags with local username
- Production: `main` branch = `production` environment, owner `0xKona`

## Key File References

- **AI Generation Schema**: `/amplify/data/resource.ts` - `GenerateImprovement` route
- **AI Client Setup**: `/lib/ai-client.ts` - `useAIGeneration` hook factory
- **Main Form Component**: `/components/logs/log-form.tsx` - Unified create/edit with AI
- **AI Comparison Modal**: `/components/ui/ai-comparison-dialog.tsx` - Review AI suggestions
- **Backend Config**: `/amplify/backend.ts` - IAM policies, tagging, CDK setup
- **Auth Guard**: `/components/auth/auth-guard.tsx` - Protects dashboard routes

## Common Pitfalls

1. **GraphQL Schema Errors**: If prompts have quotes/colons, restart sandbox and regenerate types
2. **Stale AI Data**: `useAIGeneration` data is reactive - can't return from async call directly
3. **Ref Warnings**: Use Controller pattern, not `register`, with Shadcn Textarea/Input
4. **Amplify SSR**: Root layout needs `{ ssr: true }`, client components don't
5. **Model Access**: Request Bedrock model access in AWS Console before testing AI features

## AI Feature Specifics

**Current Model**: Amazon Nova Lite (can swap: Claude 3.5 Haiku, Claude 3 Sonnet)  
**Route Name**: `GenerateImprovement`  
**Returns**: Plain string (improved text) - parsed with JSON fallback for legacy responses  
**Arguments**: `currentFieldContent`, `fieldName`, `fullLogContext` (JSON)

When the AI returns JSON instead of plain text, the frontend parses it and extracts the specific field being improved (see `log-form.tsx` useEffect parsing logic).
