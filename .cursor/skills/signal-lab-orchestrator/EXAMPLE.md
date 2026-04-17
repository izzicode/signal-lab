# Orchestrator — Example Run

A real example of running PRD 002 (Observability Demo) through the orchestrator.

## Invocation

```
User: /run-prd prds/002_prd-observability-demo.md
```

## What happens

### Orchestrator creates context file

`.execution/2026-04-16-14-30/context.json` is created (see below).

### Phase 1 output (fast model, ~30s)

```json
{
  "requirements": [
    "F1: Scenario Runner UI with RHF form (Select type, Input name, Button)",
    "F2: Run History list via useQuery, auto-refresh 5s",
    "F3: Observability links block",
    "F4: POST /api/scenarios/run handles 4 types + teapot",
    "F5: GET /metrics with scenario_runs_total, scenario_run_duration_seconds, http_requests_total",
    "F6: Structured JSON logs with scenarioType, scenarioId, duration",
    "F7: Sentry SDK, system_error captured",
    "F8: Grafana dashboard with 3+ panels",
    "F9: Docker Compose adds Prometheus, Grafana, Loki, Promtail"
  ],
  "acceptanceCriteria": [
    "4 scenario types work from UI",
    "Each run saved in PostgreSQL",
    "GET /metrics returns Prometheus format",
    "Grafana has 3+ panels",
    "Logs visible in Loki filtered by scenarioType",
    "system_error visible in Sentry"
  ]
}
```

### Phase 4 output (decomposition, ~12 tasks)

```json
[
  { "id": "task-001", "title": "Add ScenarioRun to Prisma schema", "model": "fast", "type": "database", "dependencies": [] },
  { "id": "task-002", "title": "Create RunScenarioDto", "model": "fast", "type": "backend", "dependencies": [] },
  { "id": "task-003", "title": "Implement ScenariosService.runScenario()", "model": "default", "type": "backend", "dependencies": ["task-001", "task-002"] },
  { "id": "task-004", "title": "Add scenario_runs_total counter", "model": "fast", "type": "backend", "dependencies": ["task-003"] },
  { "id": "task-005", "title": "Add scenario_run_duration_seconds histogram", "model": "fast", "type": "backend", "dependencies": ["task-003"] },
  { "id": "task-006", "title": "Add structured logging to ScenariosService", "model": "fast", "type": "backend", "dependencies": ["task-003"] },
  { "id": "task-007", "title": "Initialize Sentry SDK in instrument.ts", "model": "fast", "type": "backend", "dependencies": [] },
  { "id": "task-008", "title": "Build ScenarioRunner form component", "model": "fast", "type": "frontend", "dependencies": ["task-003"] },
  { "id": "task-009", "title": "Build RunHistory list component", "model": "fast", "type": "frontend", "dependencies": ["task-003"] },
  { "id": "task-010", "title": "Build ObsLinks component", "model": "fast", "type": "frontend", "dependencies": [] },
  { "id": "task-011", "title": "Add Prometheus+Grafana+Loki+Promtail to docker-compose", "model": "fast", "type": "infra", "dependencies": [] },
  { "id": "task-012", "title": "Create Grafana dashboard JSON with 3 panels", "model": "default", "type": "infra", "dependencies": ["task-011"] }
]
```

**Model split: 10 fast (83%), 2 default (17%)** — matches 80/20 target.

### Phase 5 progress

```
Implementation:
  task-001 [fast]    Add Prisma model ............... ✓  12s
  task-002 [fast]    Create DTO ..................... ✓   8s
  task-007 [fast]    Sentry SDK ..................... ✓  10s
  task-011 [fast]    Docker Compose infra ........... ✓  15s
  task-010 [fast]    ObsLinks component ............. ✓  20s
  task-003 [default] ScenariosService logic ......... ✓  45s
  task-004 [fast]    Counter metric ................. ✓   8s
  task-005 [fast]    Histogram metric ............... ✓   8s
  task-006 [fast]    Structured logging ............. ✓  10s
  task-008 [fast]    ScenarioRunner form ............ ✓  25s
  task-009 [fast]    RunHistory list ................ ✓  20s
  task-012 [default] Grafana dashboard .............. ✓  40s
```

### Phase 7 final report

```
Signal Lab PRD Execution — COMPLETE

PRD: prds/002_prd-observability-demo.md
Duration: ~28 min
Tasks: 12 completed, 0 failed, 0 retries
Models: 10 fast, 2 default

Completed:
  ✓ task-001: Prisma ScenarioRun model
  ✓ task-002: RunScenarioDto with validation
  ✓ task-003: ScenariosService (5 scenario types)
  ✓ task-004: scenario_runs_total counter
  ✓ task-005: scenario_run_duration_seconds histogram
  ✓ task-006: Structured JSON logging
  ✓ task-007: Sentry SDK initialized
  ✓ task-008: ScenarioRunner form (RHF + shadcn)
  ✓ task-009: RunHistory list (TanStack Query)
  ✓ task-010: ObsLinks panel
  ✓ task-011: Docker Compose observability stack
  ✓ task-012: Grafana dashboard (6 panels)

Next steps:
  - Add SENTRY_DSN to .env
  - docker compose up -d
  - curl localhost:3001/api/health
  - Open http://localhost:3100 → Signal Lab Overview
```
