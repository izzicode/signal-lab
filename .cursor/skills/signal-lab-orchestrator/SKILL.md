---
name: signal-lab-orchestrator
description: Multi-phase PRD orchestrator for Signal Lab. Accepts a PRD file path, decomposes it into atomic tasks, delegates to subagents, tracks state in context.json, and supports resume after interruption. Use when asked to implement a PRD, run-prd, execute a PRD, or orchestrate development.
---

# Signal Lab Orchestrator

Implements a PRD through a 7-phase pipeline with context persistence and resume support.

## When to Use
- "Run PRD 002" / "Implement PRD 003"
- "/run-prd prds/002_prd-observability-demo.md"
- Resuming interrupted execution
- Orchestrating multi-step feature development

## Quick Start

```
User: /run-prd prds/002_prd-observability-demo.md
Agent: [reads this skill, starts Phase 1]
```

To resume: `/run-prd resume .execution/<timestamp>/context.json`

---

## Execution Pipeline

### Phase 1 — PRD Analysis `[fast model]`
**Goal**: Extract structured requirements from PRD text.

Subagent prompt:
> Read the PRD at `{prdPath}`. Extract: (1) functional requirements as bullet list, (2) acceptance criteria, (3) tech constraints, (4) dependencies on other PRDs. Output JSON: `{ "requirements": [], "acceptanceCriteria": [], "constraints": [], "dependencies": [] }`. Be concise.

Update context: `phases.analysis.status = "completed"`, save result.

### Phase 2 — Codebase Scan `[fast/explore model]`
**Goal**: Understand current state of the repo.

Subagent prompt:
> Explore the Signal Lab repo. Report: (1) existing files relevant to this PRD, (2) what's already implemented vs missing, (3) import paths and module structure. Focus on `apps/backend/src/`, `apps/frontend/src/`, `prisma/`. Output JSON: `{ "existing": [], "missing": [], "structure": {} }`.

### Phase 3 — Planning `[default model]`
**Goal**: High-level implementation approach.

Subagent prompt:
> Given PRD analysis `{analysis}` and codebase state `{codebaseScan}`, create a high-level implementation plan. Identify risks, integration points, and order of operations. Output: `{ "plan": "...", "risks": [], "order": [] }`.

### Phase 4 — Decomposition `[default model]`
**Goal**: Break plan into atomic tasks.

Each task must be:
- Completable in 5-10 minutes
- Described in 1-3 sentences
- Assigned `complexity: low|medium|high`
- Assigned `model: fast|default`
- Assigned `type: database|backend|frontend|infra|docs`
- Have explicit `dependencies: [task-id, ...]`

**fast model tasks (80%)**: Add field to schema, create DTO, add metric/log, create simple component, update config.
**default model tasks (20%)**: Architecture decisions, complex integrations, cross-system wiring, review.

Output format:
```json
{
  "tasks": [
    {
      "id": "task-001",
      "title": "Add ScenarioRun model to Prisma schema",
      "description": "Add the ScenarioRun model with id, type, status, duration, error, metadata, createdAt fields.",
      "type": "database",
      "complexity": "low",
      "model": "fast",
      "status": "pending",
      "dependencies": [],
      "skill": "nestjs-endpoint-skill"
    }
  ]
}
```

### Phase 5 — Implementation `[fast 80% / default 20%]`
**Goal**: Execute tasks in dependency order.

Algorithm:
```
1. Find tasks where all dependencies are "completed"
2. Group by independence (can run conceptually in parallel)
3. For each task group:
   a. Read context.json
   b. Build subagent prompt (see below)
   c. Launch subagent via Task tool
   d. On success: mark task "completed", update context
   e. On failure: mark "failed", log error, continue with other tasks
4. Repeat until all tasks completed or failed
```

Subagent prompt template:
> You are implementing task `{task.id}`: {task.title}
> 
> Context: {task.description}
> 
> Skills to use: read `.cursor/skills/{task.skill}/SKILL.md` first.
> Rules: read `.cursor/rules/stack-constraints.mdc` and `observability-conventions.mdc`.
> 
> Reference implementation: `apps/backend/src/scenarios/` (backend) or `apps/frontend/src/components/scenarios/` (frontend).
> 
> Complete the task. Report: files created/modified, any issues found.

### Phase 6 — Review `[fast/readonly model]`
**Goal**: Verify implementation quality per domain.

For each domain (database, backend, frontend):

Reviewer subagent prompt:
> Review the `{domain}` implementation for PRD `{prdPath}`.
> Check acceptance criteria: `{acceptanceCriteria}`.
> Run `/check-obs` mentally for backend files.
> Report: PASS or FAIL with specific issues.

Review loop (max 3 retries per domain):
```
if FAIL:
  launch implementer subagent with feedback
  re-run reviewer
  if FAIL after 3 attempts: mark domain "failed", continue
```

### Phase 7 — Report `[fast model]`
**Goal**: Final summary.

Format:
```
Signal Lab PRD Execution — {status}

PRD: {prdPath}
Duration: ~{minutes} min
Tasks: {completed} completed, {failed} failed, {retries} retries
Model usage: {fastCount} fast, {defaultCount} default

Completed:
  ✓ Task 1 title
  ✓ Task 2 title

Failed:
  ✗ Task N title — reason

Next steps:
  - Manual actions required
  - Run: docker compose up -d
  - Verify: curl localhost:3001/api/health
```

---

## Context File Schema

Create at `.execution/{executionId}/context.json`:

```json
{
  "executionId": "2026-04-16-14-30",
  "prdPath": "prds/002_prd-observability-demo.md",
  "status": "in_progress",
  "currentPhase": "implementation",
  "signal": 42,
  "phases": {
    "analysis": { "status": "pending", "result": null },
    "codebase": { "status": "pending", "result": null },
    "planning": { "status": "pending", "result": null },
    "decomposition": { "status": "pending", "result": null },
    "implementation": { "status": "pending", "completedTasks": 0, "totalTasks": 0 },
    "review": { "status": "pending", "domains": {} },
    "report": { "status": "pending", "result": null }
  },
  "tasks": []
}
```

**Update context after every phase and every task completion.**

---

## Resume Protocol

When user provides a `context.json` path:

1. Read `context.json`
2. Find first phase where `status !== "completed"`
3. Skip all completed phases
4. Continue from current phase
5. For implementation: skip tasks where `status === "completed"`

```typescript
// Resume detection
const currentPhase = Object.entries(context.phases)
  .find(([, phase]) => phase.status !== "completed")?.[0] ?? "report";
```

---

## Orchestrator Rules

1. **Never implement directly** — always delegate to subagents
2. **Update context.json after every operation** — enables resume
3. **Failed tasks don't block others** — mark failed and continue
4. **Use existing skills** — always reference `observability-skill`, `nestjs-endpoint-skill`, `shadcn-form-skill` in subagent prompts
5. **Context economy** — subagent prompts are focused (< 500 tokens). Full context stays in files.

---

## Example Usage

```
/run-prd prds/002_prd-observability-demo.md

→ Creating .execution/2026-04-16-14-30/context.json
→ Phase 1: PRD Analysis [fast] ............ done
→ Phase 2: Codebase Scan [explore] ........ done
→ Phase 3: Planning [default] ............. done
→ Phase 4: Decomposition [default] ........ 12 tasks
→ Phase 5: Implementation
   task-001 [fast] Add Prisma model ........ ✓
   task-002 [fast] Create DTO .............. ✓
   task-003 [fast] Add metrics ............. ✓
   task-004 [default] Service logic ........ ✓
   ... 8 more tasks
→ Phase 6: Review
   database: PASS ✓
   backend: PASS ✓
   frontend: PASS ✓
→ Phase 7: Report

Signal Lab PRD Execution — Complete
Tasks: 12 completed, 0 failed
Duration: ~30 min
```
