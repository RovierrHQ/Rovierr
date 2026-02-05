# Starter Template Development Guide

## Project Overview
Bun-powered monorepo with Turbo. This starter includes **web** (TanStack Router/Vite) and **API** (Hono/Cloudflare Workers) only.

## Development Commands

### Monorepo-wide (run from root)
- `bun run dev` - Start all apps in development mode
- `bun run build` - Build all packages and apps
- `bun run check` - Lint (ultracite check) + syncpack version check
- `bun run fix` - Auto-fix lint + syncpack mismatches
- `bun run check-types` - TypeScript type check across monorepo (`turbo type-check`)

### App dev (filtered by Turbo)
- `bun run dev:web` - Web app only (port 3000)
- `bun run dev:server` - API server only (port 3001)

### Database (via `@rov/db`)
- `bun run db:push` - Push schema to database
- `bun run db:studio` - Open Drizzle Studio
- `bun run db:generate` - Generate Drizzle migrations
- `bun run db:migrate` - Run migrations

### Adding a new schema (feature tables)
Schema lives in `packages/db/src/schema/`. **`auth.ts` is owned by Better Auth**: do not hand-edit; regenerate with `bun run auth:generate-schema` after auth config changes.

**One file per feature.** Put all tables and relations for that domain in a single file, e.g.: `todo.ts` – tables and relations for todo (tasks, lists, etc.)

### Dependency / workspace scripts
- `bun run syncpack:check` - List version mismatches across workspaces
- `bun run syncpack:fix` - Fix mismatches (`syncpack fix-mismatches`)
- `bun run syncpack:lint` - Lint syncpack config
- `bun run update:all` - Bump deps in all `package.json` (npm-check-updates), then `bun install` and `syncpack:fix`
- `bun run cl-install` - Clean install: remove all `node_modules` and `bun.lock`, then `bun install`

### Auth
- `bun run auth:generate-schema` - Regenerate Better Auth Drizzle schema from `packages/auth` into `packages/db/src/schema/auth.ts`

### Adding ShadCN components
Components live in **`packages/ui`**. From repo root:

```bash
cd packages/ui && bunx --bun shadcn@latest add <component-name>
```

Example: `cd packages/ui && bunx --bun shadcn@latest add card`. New components are added under `packages/ui/src/components/` and use aliases from `packages/ui/components.json` (`@rov/ui/components`, `@rov/ui/lib/utils`, etc.).

### App-specific commands
- **Web** (`apps/web`): `bun run dev`, `bun run build`, `bun run test`
- **API** (`apps/api`): `bun run dev`, `bun run type-check`, `bun run deploy`

### Testing
- All tests: `cd apps/web && bun run test` (Vitest)
- Single file: `cd apps/web && vitest run path/to/test.test.ts`
- Watch: `cd apps/web && vitest`

### E2E (Playwright)
- Run from web app: `cd apps/web && bun run test:e2e` (or `test:e2e:ui`, `test:e2e:debug`)
- **Public (no-auth) tests** (`e2e/public.spec.ts`): need only the web app. Playwright starts it via `webServer`.
- **Full E2E (authenticated + org/board/issues)**: the API must be running on port 3001. Start it in another terminal (`bun run dev:server` or `cd apps/api && bun run dev`), then run `cd apps/web && bun run test:e2e`. Global setup seeds a test user, org, and team in the DB; teardown removes them.
- For CI: start the API before Playwright (e.g. same job or pre-step) if you run the authenticated project.



## Architecture Notes

### Apps
- `apps/api` - Hono on Cloudflare Workers (port 3001), auth and business logic
- `apps/web` - TanStack Start + Vite, file-based routing (port 3000)

### Packages
- `packages/auth` - Better Auth (e.g. Google OAuth)
- `packages/db` - Drizzle ORM, schema
- `packages/ui` - Shared ShadCN/UI components (add via `cd packages/ui && bunx shadcn@latest add <name>`)
- `packages/config` - Shared config

### Authentication
- Better Auth; API auth routes at `http://localhost:3001/api/auth` (dev)
- Session: 7 days expiry, 1 day update age; cookies SameSite=none, Secure, HttpOnly
- CORS: trusted origins and headers (Content-Type, Authorization, Cookie, Set-Cookie) configured in auth/API

### Testing Guidelines:
- Write tests alongside source files or in `__tests__` directories or `web/e2e` for web playwright test
- Use Vitest for web app testing
- Test user-facing behavior, not implementation details
- Ensure tests pass before committing (`bun run check && bun run test`)

### Important Patterns:
- Auth middleware runs before all routes in API
- Create new DB connection per request (Cloudflare Workers requirement)
- Use nanoid for generating IDs
- Validate required form fields before processing
- Use `HTTPException` for controlled error responses
- Log context for debugging: `[MIDDLEWARE NAME] Action performed`
