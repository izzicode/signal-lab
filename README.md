# Signal Lab

Observability playground — run scenarios in the UI, watch signals appear in Grafana, Loki, and Sentry.

## Prerequisites

- Docker Desktop 24+ with Compose v2
- Node.js 20+ (for local development only)
- A Sentry account (optional — app works without it, errors won't be captured remotely)

## Quick Start

```bash
# 1. Clone and configure
git clone <repo-url>
cd signal-lab
cp .env.example .env
# Edit .env: add SENTRY_DSN if you have one

# 2. Start everything
docker compose up -d

# 3. Verify
curl http://localhost:3001/api/health
```

Expected response: `{ "status": "ok", "timestamp": "..." }`

## Stop

```bash
docker compose down
# Remove volumes too (clean slate):
docker compose down -v
```

## Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Signal Lab UI |
| Backend API | http://localhost:3001/api | NestJS REST API |
| Swagger Docs | http://localhost:3001/api/docs | Interactive API docs |
| Raw Metrics | http://localhost:3001/api/metrics | Prometheus exposition |
| Grafana | http://localhost:3100 | Dashboards (admin/admin) |
| Prometheus | http://localhost:9090 | Metrics query |
| Loki | http://localhost:3200 | Log aggregation |
| PostgreSQL | localhost:5432 | Database |

## Verification Walkthrough (5 min)

### 1. Run a success scenario
- Open http://localhost:3000
- Select "Success — normal flow" → click "Run Scenario"
- Green badge appears in Run History

### 2. Run a system error
- Select "System Error — 500" → click "Run Scenario"
- Red badge in history + destructive toast
- Check Sentry dashboard for captured exception

### 3. Check Prometheus metrics
```bash
curl -s http://localhost:3001/api/metrics | grep scenario_runs_total
```

### 4. Check Grafana dashboard
- Open http://localhost:3100 (admin/admin)
- Navigate to "Signal Lab" folder → "Signal Lab Overview"
- See: Runs by Type, Latency, Error Rate, HTTP Requests

### 5. Check Loki logs
- Grafana → Explore → select Loki datasource
- Query: `{app="signal-lab"}`
- Filter by scenario type: `{app="signal-lab"} | json | scenarioType="system_error"`

### 6. Easter egg
- Select "🫖 Teapot" → run → HTTP 418 response with `signal: 42`

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), shadcn/ui, Tailwind CSS, TanStack Query, React Hook Form |
| Backend | NestJS, TypeScript strict |
| Database | PostgreSQL 16, Prisma |
| Observability | Prometheus, Grafana, Loki, Promtail, Sentry |
| Infra | Docker Compose |

---

## Cursor AI Layer

> Full documentation: **[AI-LAYER.md](AI-LAYER.md)**

### Rules (`.cursor/rules/`)

| File | Scope | What It Enforces |
|------|-------|-----------------|
| `stack-constraints.mdc` | Always | Allowed/forbidden libraries for frontend and backend |
| `observability-conventions.mdc` | `apps/backend/**` | Metric naming, log format, Sentry usage |
| `prisma-patterns.mdc` | `apps/backend/**`, `prisma/**` | Prisma-only ORM, migration workflow, forbidden raw SQL |
| `frontend-patterns.mdc` | `apps/frontend/**` | TanStack Query for state, RHF for forms, shadcn for UI |
| `error-handling.mdc` | Always | Error patterns for backend and frontend |

### Custom Skills (`.cursor/skills/`)

| Skill | When to Use |
|-------|------------|
| `observability-skill` | Adding metrics, logs, Sentry to any endpoint |
| `nestjs-endpoint-skill` | Scaffolding new NestJS endpoint with full observability |
| `shadcn-form-skill` | Adding shadcn form with RHF + Zod + TanStack mutation |
| `signal-lab-orchestrator` | Running a PRD through automated multi-phase implementation |

### Commands (`.cursor/commands/`)

| Command | What It Does |
|---------|-------------|
| `/add-endpoint` | Scaffold NestJS endpoint with DTO, service, controller, metrics, logs |
| `/check-obs` | Audit a file for missing observability signals |
| `/health-check` | Verify entire docker stack is operational |

### Hooks (`.cursor/hooks.json`)

| Hook | Trigger | Problem It Solves |
|------|---------|------------------|
| Schema change reminder | `postToolUse` on Write/StrReplace to `schema.prisma` | Prevents forgetting `prisma migrate dev` after schema changes |
| Controller observability check | `postToolUse` on Write/StrReplace for new `controller.ts` | Prevents adding endpoints without metrics, Logger, or Swagger |

### Marketplace Skills

Install via **Cursor Settings → Skills → Browse Marketplace**.
See `.cursor/skills/marketplace-skills.md` for the full list with justification.

| Skill | Why |
|-------|-----|
| `nestjs-best-practices` | NestJS module/guard/pipe patterns |
| `prisma-orm` | Schema design, migration patterns |
| `shadcn-ui` | Component APIs and theming |
| `next-best-practices` | App Router, Server Components |
| `tailwind-design-system` | Utility classes, responsive layout |
| `docker-expert` | Compose networking, health checks |

---

## Development

### Run locally (without Docker)

```bash
# Backend
cd apps/backend
npm install
DATABASE_URL=postgresql://signal:signal@localhost:5432/signal_lab npm run start:dev

# Frontend
cd apps/frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:3001 npm run dev
```

### Database migrations

```bash
# After editing prisma/schema.prisma:
npx prisma migrate dev --name describe-change

# Apply existing migrations (first run):
npx prisma migrate deploy

# Seed:
npx ts-node prisma/seed.ts
```

### Logs

```bash
docker compose logs -f backend    # Backend logs
docker compose logs -f frontend   # Frontend logs
docker compose logs -f            # All services
```
