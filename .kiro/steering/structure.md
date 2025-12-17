### Project Structure — Rovierr Monorepo

```
.
├── apps/
│   ├── web/                  # Next.js web app (main student interface)
│   ├── native/               # Expo mobile app
│   ├── desktop/              # Tauri desktop client
│   ├── server/               # Bun + elysia backend server
│   └── docs/                 # MDX with mintlify documentation app
│
├── packages/
│   ├── ui/                   # Shared UI kit (Radix + Tailwind)
│   ├── realtime/             # Centrifugo client & server integrations
│   ├── shared/               # Common utilities & cross-platform logic
│   └── typescript-config/    # Centralized TS configs
│
├── docker-compose.yml         # Service orchestration (server, realtime)
├── turbo.json                 # Build pipeline for monorepo
├── biome.json                 # Unified lint/format config
├── tailwind.config.js         # Shared Tailwind setup
├── tsconfig.json              # Root TypeScript setup
└── bun-workspace.yaml        # Workspace configuration
```

**Organizational Conventions**

* All shared logic belongs in `packages/`
* Each app is self-contained with its own `.env` and `tsconfig.json`
* Imports follow alias convention:

  * `@rov/ui` → UI components
  * `@rov/shared` → utilities and logic
* Strict separation between presentation (UI) and logic (contracts, shared)
* Use `src/` inside each app and package to scope code organization

**Architectural Notes**

* **Frontend & Backend sync:** all communication happens via eden treaty
* **Realtime module:** uses Centrifugo client and server wrappers from `@rov/realtime`
* **Database layer:** Drizzle ORM models reside in the `apps/server` project
* **Scalability:** new modules can be added by creating a new folder under `packages/` or `apps/` without disrupting existing ones