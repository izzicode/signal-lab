# Marketplace Skills — Signal Lab

Skills installed via the [Agent Skills](https://agentskills.io/) open standard using `npx skills` CLI.
These are **not** MCP plugins — they are knowledge/instruction packages that Cursor loads automatically from `.agents/skills/`.

## Install command used

```bash
npx skills add <owner/repo@skill> -a cursor --copy -y
```

## Installed Skills (14 total — exceeds PRD minimum of 6)

| # | Skill | Source | PRD Match | What It Provides |
|---|-------|--------|-----------|-----------------|
| 1 | `nestjs-best-practices` | `Ahmustufa/nestjs-best-practices-skill` | `nestjs-best-practices` ✓ | 24 production-ready NestJS rules: modules, controllers, services, DTOs, auth, security, testing |
| 2 | `shadcn` | `shadcn/ui` (official) | `shadcn-ui` ✓ | shadcn component APIs, CLI usage, registry, composition patterns |
| 3 | `tailwind-design-system` | `wshobson/agents` | `tailwind-design-system` ✓ | Tailwind utility classes, design tokens, responsive patterns |
| 4 | `vercel-react-best-practices` | `vercel-labs/agent-skills` | `next-best-practices` ✓ | Next.js App Router, Server Components, data fetching, bundle optimization |
| 5 | `postgresql-table-design` | `wshobson/agents` | `postgresql-table-design` ✓ | Schema design, indexes, normalization, constraints |
| 6 | `docker-expert` | `sickn33/antigravity-awesome-skills` | `docker-expert` ✓ | Dockerfiles, Compose, networking, health checks, volumes |
| 7 | `prisma-cli` | `prisma/skills` (official) | `prisma-orm` ✓ | Prisma CLI commands: init, generate, migrate, db push, db seed |
| 8 | `prisma-client-api` | `prisma/skills` (official) | `prisma-orm` ✓ | CRUD, select/include, filters, transactions, raw queries |
| 9 | `prisma-database-setup` | `prisma/skills` (official) | `prisma-orm` ✓ | PostgreSQL, MySQL, SQLite, MongoDB configuration |
| 10 | `prisma-upgrade-v7` | `prisma/skills` (official) | `prisma-orm` ✓ | Migration guide v6→v7, ESM, driver adapters |
| 11 | `prisma-postgres` | `prisma/skills` (official) | `prisma-orm` ✓ | Prisma Postgres workflows |
| 12 | `prisma-postgres-setup` | `prisma/skills` (official) | `prisma-orm` ✓ | Prisma Postgres setup via Console/CLI/SDK |
| 13 | `prisma-driver-adapter-implementation` | `prisma/skills` (official) | `prisma-orm` ✓ | Driver adapter patterns |
| 14 | `web-design-guidelines` | `vercel-labs/agent-skills` | bonus | UI accessibility, design system auditing |

## Location

All skills are in `.agents/skills/` (Cursor project-level skill directory per [Cursor docs](https://cursor.com/docs/context/skills)).

## Why This Approach Is Better Than GUI Marketplace

The Cursor GUI Marketplace contains MCP server plugins (Datadog, Slack, Figma, Linear). Agent Skills are a separate open standard — installed via `npx skills` CLI from GitHub repositories. The exact skills named in PRD 003 (`nestjs-best-practices`, `tailwind-design-system`, `postgresql-table-design`, etc.) exist in this ecosystem and are now installed.

## Custom Skills vs Marketplace Skills

| Marketplace Skill | Covers | Custom Skill | Adds on top |
|-------------------|--------|-------------|-------------|
| `nestjs-best-practices` | Generic NestJS patterns | `nestjs-endpoint-skill` | Scaffold with Prometheus/Loki/Sentry pre-wired |
| `shadcn` | shadcn component APIs | `shadcn-form-skill` | Full RHF + Zod + TanStack Query + toast pattern |
| `prisma-client-api` | Prisma API reference | `prisma-patterns.mdc` rule | Project-specific conventions (no raw SQL, migration workflow) |
| `tailwind-design-system` | Tailwind utilities | `frontend-patterns.mdc` rule | cn() usage, shadcn conventions for this project |
| `docker-expert` | Docker best practices | `docker-compose.yml` comments | This project's service topology |
| `vercel-react-best-practices` | Next.js optimization | `observability-skill` | Adds observability links panel, TanStack + toast pattern |
