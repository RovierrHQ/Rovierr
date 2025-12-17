### Technology Stack — Rovierr

**Core Stack**

* **Frontend:**

  * Next.js (App Router, Server Actions)
  * React 19 with TypeScript
  * Tailwind CSS + Radix UI + ShadCN UI
  * Expo for mobile (React Native)
  * Tauri for desktop apps
* **Backend:**

  * Bun runtime
  * Elysia framework (fast, lightweight, ESM-based)
  * Drizzle ORM with PostgreSQL (via Neon)
  * Centrifugo for real-time communication
* **Auth:**

  * `better-auth` with Google Sign-In
* **Build & DevOps:**

  * bun + Turborepo for monorepo management
  * Docker Compose for service orchestration
  * Biome for linting & formatting
* **Documentation:**

  * mintlify Docs App
* **CI/CD (planned):**

  * GitHub Actions for deploy pipelines

**Technical Constraints**

* All internal packages published under `@rov/*`
* ES modules only — no CommonJS compatibility required
* Real-time system built around Centrifugo protocol (no WebSocket fallbacks)
* Shared UI & config packages to ensure consistency across platforms

**Preferred Tooling**

* Editor: VS Code + Kiro IDE for spec-driven development
* Package manager: `bun`
* Database migrations: `drizzle-kit`
* Environment management: `.env` + `dotenvx`
* TypeScript config inheritance via `@rov/typescript-config`

---