# Orchestrator — Subagent Prompts

Готовые промпты для каждой фазы. Orchestrator копирует нужный, подставляет переменные и запускает subagent через Task tool.

---

## Phase 1 — PRD Analysis `[fast model]`

```
Read the PRD at: {prdPath}

Extract and return JSON only:
{
  "requirements": ["FR1: ...", "FR2: ..."],
  "acceptanceCriteria": ["...", "..."],
  "constraints": ["Stack: Next.js, NestJS, Prisma...", "..."],
  "dependencies": ["PRD 001 must be complete", "..."],
  "scenarioTypes": ["if PRD 002: success, validation_error, system_error, slow_request, teapot"]
}

Be concise. No explanation outside JSON.
```

---

## Phase 2 — Codebase Scan `[fast/explore model]`

```
Explore the Signal Lab repository. Focus on:
- apps/backend/src/ — existing modules, services, controllers
- apps/frontend/src/ — existing components, pages, hooks
- prisma/schema.prisma — current data model
- docker-compose.yml — running services

Return JSON:
{
  "existing": ["apps/backend/src/scenarios/ — ScenarioService, Controller, DTO"],
  "missing": ["Prometheus panel for new metric X", "..."],
  "relevantFiles": ["path/to/file.ts — reason it matters"],
  "moduleStructure": { "backend": ["health", "scenarios", "metrics", "prisma"], "frontend": ["..."] }
}
```

---

## Phase 3 — Planning `[default model]`

```
Given:
- PRD requirements: {analysis.requirements}
- Current codebase: {codebaseScan.existing}
- Missing pieces: {codebaseScan.missing}

Create a high-level implementation plan. Return JSON:
{
  "plan": "1-paragraph summary of approach",
  "implementationOrder": ["database changes first", "backend service", "controller", "frontend"],
  "risks": ["Loki log shipping requires Docker labels on container", "..."],
  "estimatedTasks": 12
}
```

---

## Phase 4 — Decomposition `[default model]`

```
Break this plan into atomic tasks. Each task must be completable in 5-10 minutes.

Plan: {planning.plan}
Order: {planning.implementationOrder}

For each task, assign:
- model: "fast" if templatable/mechanical; "default" if architectural
- skill: which .cursor/skill to use
- type: database | backend | frontend | infra | docs

Return JSON array of tasks:
[
  {
    "id": "task-001",
    "title": "Add ScenarioRun model to Prisma schema",
    "description": "Add model with id (cuid), type, status, duration?, error?, metadata?, createdAt fields.",
    "type": "database",
    "complexity": "low",
    "model": "fast",
    "status": "pending",
    "dependencies": [],
    "skill": "nestjs-endpoint-skill"
  }
]

80% of tasks should use model: "fast".
```

---

## Phase 5 — Implementation Task Prompt `[fast or default]`

```
You are implementing task {task.id}: {task.title}

Description: {task.description}
Type: {task.type}
Dependencies completed: {completedDependencies}

REQUIRED: Read these files first:
1. .cursor/skills/{task.skill}/SKILL.md
2. .cursor/rules/stack-constraints.mdc
3. .cursor/rules/observability-conventions.mdc (if backend task)

Reference implementation:
- Backend: apps/backend/src/scenarios/ (follow this pattern exactly)
- Frontend: apps/frontend/src/components/scenarios/ (follow this pattern exactly)

Complete the task. Then report:
{
  "status": "completed" | "failed",
  "filesModified": ["path/to/file.ts"],
  "notes": "any issues or decisions made"
}
```

---

## Phase 6 — Review Prompt `[fast/readonly]`

```
Review the {domain} implementation for PRD: {prdPath}

Acceptance criteria to check:
{acceptanceCriteria}

For backend: mentally run /check-obs on each service file.
For frontend: verify TanStack Query is used (no useEffect+fetch), RHF for forms, shadcn for UI.
For database: verify Prisma schema has all required fields, no raw SQL.

Return JSON:
{
  "status": "PASS" | "FAIL",
  "passed": ["criterion 1", "criterion 2"],
  "failed": ["criterion X — reason"],
  "suggestions": ["optional improvements"]
}
```

---

## Phase 7 — Report Prompt `[fast]`

```
Generate the final execution report.

Context: {contextJson}

Format exactly as:
---
Signal Lab PRD Execution — {COMPLETE|PARTIAL}

PRD: {prdPath}
Duration: ~{minutes} min
Tasks: {completed} completed, {failed} failed, {retries} retries
Models: {fastCount} fast, {defaultCount} default

Completed:
  ✓ task-001: title
  ✓ task-002: title

Failed:
  ✗ task-N: title — reason

Next steps:
  - List manual steps needed
  - docker compose up -d (if infra changed)
  - curl localhost:3001/api/health (verify)
---
```
