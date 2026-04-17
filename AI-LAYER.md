# Signal Lab — Cursor AI Layer

This document explains the complete AI layer for Signal Lab: why each artifact exists, when to use it, and how it fits together. A new Cursor chat opened in this repo gets full project context without any manual explanation.

---

## Rules (`.cursor/rules/`)

Rules are loaded automatically by Cursor based on `globs` and `alwaysApply`. They prevent the most common AI mistakes.

| File | Scope | What It Prevents |
|------|-------|-----------------|
| `stack-constraints.mdc` | Always | Adding Redux, SWR, TypeORM, styled-components — any library not in the required stack |
| `observability-conventions.mdc` | `apps/backend/**` | Wrong metric names (e.g. `total_runs` instead of `runs_total`), missing log fields, forgetting Sentry |
| `prisma-patterns.mdc` | `apps/backend/**`, `prisma/**` | Raw SQL, using TypeORM/Drizzle, forgetting to run migration after schema change |
| `frontend-patterns.mdc` | `apps/frontend/**` | `useEffect`+fetch instead of TanStack Query, Formik instead of RHF, custom CSS instead of Tailwind |
| `error-handling.mdc` | Always | Swallowing errors silently, wrong HTTP status codes, missing error toasts in frontend |

### Why rules over just asking the model?
Rules are injected into every message context. The model cannot "forget" them between turns. Without rules, the model defaults to its training data — which might suggest Redux for state management, despite the project using TanStack Query.

---

## Custom Skills (`.cursor/skills/`)

Skills are read on demand when the agent recognizes the trigger scenario. Each skill encodes project-specific knowledge that marketplace skills don't have.

### `observability-skill`
**When**: Adding a new endpoint, being asked to "instrument" or "add metrics/logs".

**What it does**: Step-by-step guide to wire `MetricsService` (counter + histogram), structured logging with required fields (`scenarioType`, `scenarioId`, `duration`), and Sentry breadcrumb/capture. Includes working code snippets from this project.

**Why custom**: Marketplace `nestjs-best-practices` doesn't know our metric naming conventions (`scenario_runs_total` format), required log fields, or that Sentry captures go through `GlobalExceptionFilter`.

---

### `nestjs-endpoint-skill`
**When**: Creating a new API route, adding a new domain module.

**What it does**: Full scaffold — DTO (class-validator + @ApiProperty), Service (PrismaService + MetricsService), Controller (@ApiTags + @ApiOperation), Module (MetricsModule import). References `apps/backend/src/scenarios/` as the canonical pattern.

**Why custom**: Generic NestJS scaffolding doesn't include our observability wiring or Prisma patterns.

---

### `shadcn-form-skill`
**When**: Adding a form to the frontend, creating a mutation-driven UI.

**What it does**: Template for RHF + Zod schema + `useMutation` + toast on success/error + loading state on Button. Uses only components already installed in `src/components/ui/`.

**Why custom**: Combines three libraries (RHF + TanStack Query + shadcn) in one pattern. No marketplace skill covers this full-stack combination.

---

### `signal-lab-orchestrator`
**When**: Running `/run-prd <path>`, implementing a full PRD, resuming interrupted execution.

**What it does**: 7-phase pipeline (Analysis → Codebase Scan → Planning → Decomposition → Implementation → Review → Report). Delegates to subagents via Task tool. Persists state in `.execution/<id>/context.json`. Supports resume.

**Key design decisions**:
- Orchestrator never implements directly — always delegates
- 80% of tasks go to fast model (mechanical, templatable)
- 20% to default model (architecture, complex integrations)
- Failed tasks don't block others — project keeps moving

See `.cursor/skills/signal-lab-orchestrator/EXAMPLE.md` for a real run trace.

---

## Commands (`.cursor/commands/`)

Commands are markdown files with structured prompts. Invoke them by typing `/command-name` in chat.

| Command | Invoke | What it does |
|---------|--------|-------------|
| `/add-endpoint` | `/add-endpoint alerts POST /api/alerts` | Scaffold NestJS endpoint: DTO + Service + Controller + Module, metrics + logs wired |
| `/check-obs` | `/check-obs apps/backend/src/scenarios/scenarios.service.ts` | Audit file for missing counters, histograms, structured logs, Sentry — outputs ✓/✗ table |
| `/health-check` | `/health-check` | Run all 7 verification steps: docker ps, health endpoint, metrics, Prometheus targets, Grafana, Loki, Frontend |

### Why commands over just asking?
Commands encode the exact checklist and output format. Without them, "add a new endpoint" gets a different result every time. With `/add-endpoint`, the agent follows the same steps and checklist every time.

---

## Hooks (`.cursor/hooks.json` + `.cursor/hooks/`)

Hooks fire automatically on agent events. They solve the "I forgot" class of bugs.

### Hook 1: Schema migration reminder
**Trigger**: `postToolUse` on any `Write` or `StrReplace` that modifies `prisma/schema.prisma`

**Script**: `.cursor/hooks/check-schema-migration.sh`

**Problem solved**: The most common Prisma mistake is editing `schema.prisma` and forgetting to run `prisma migrate dev`. The app starts, connects to DB, then crashes at runtime with a column-not-found error. This hook surfaces the reminder immediately after the edit.

**Output**: `⚠️ prisma/schema.prisma was modified. Required next steps: npx prisma migrate dev...`

### Hook 2: Controller observability check
**Trigger**: `postToolUse` on `Write` for any new `controller.ts` in `apps/backend/`

**Script**: `.cursor/hooks/check-endpoint-observability.sh`

**Problem solved**: New controllers are often added without metrics, Logger, or Swagger decorators — discovered only when the dashboard doesn't update or API docs are incomplete. This hook catches it at creation time.

**Output**: Lists ❌ for each missing item (MetricsService, Logger, @ApiTags/@ApiOperation).

---

## Marketplace Skills

Install via **Cursor Settings → Skills → Browse Marketplace**.

| Skill | Why This Project Needs It |
|-------|--------------------------|
| `nestjs-best-practices` | Patterns for modules, guards, interceptors, lifecycle hooks — baseline NestJS knowledge |
| `prisma-orm` | Schema design, relation handling, migration workflow, query optimization |
| `shadcn-ui` | Component APIs, variants, theming, accessibility — the UI library used exclusively |
| `next-best-practices` | App Router conventions, Server vs Client components, metadata, image optimization |
| `tailwind-design-system` | Utility classes, responsive modifiers, `cn()` patterns, dark mode |
| `docker-expert` | Dockerfile multi-stage builds, Compose networking, health checks, volume mounts |

### Custom vs Marketplace: where each fits

```
Marketplace skills → WHAT the technology does (reference, best practices)
Custom skills      → HOW we use it in THIS project (conventions, patterns, wiring)
```

Marketplace `nestjs-best-practices` tells the model how NestJS works.
Custom `nestjs-endpoint-skill` tells it how to wire a new endpoint with our metrics, our Prisma pattern, our Swagger style.

They complement, not replace, each other.

---

## How it all connects

```
New chat opens
      ↓
Rules inject automatically (stack constraints, observability, prisma, frontend, errors)
      ↓
User types: /add-endpoint
      ↓
Command prompt runs → agent reads nestjs-endpoint-skill → agent reads observability-skill
      ↓
Agent creates files → hooks fire → missing items flagged immediately
      ↓
User types: /run-prd prds/003_prd-cursor-ai-layer.md
      ↓
Orchestrator phases: Analysis → Scan → Plan → Decompose → Implement → Review → Report
      ↓
context.json updated after each step → resume if interrupted
```
