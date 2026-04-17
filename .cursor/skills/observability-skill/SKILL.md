---
name: observability-skill
description: Add Prometheus metrics, structured JSON logs, and Sentry error capture to a NestJS endpoint or service in Signal Lab. Use when adding a new endpoint, when observability is missing from existing code, or when asked to instrument a service with metrics/logs/Sentry.
---

# Observability Skill

Add observability signals to any NestJS service in Signal Lab.

## When to Use
- Adding a new NestJS endpoint that needs instrumentation
- Reviewing existing service for missing metrics/logs
- Adding Sentry capture to error paths
- Asked to "instrument", "add metrics", "add logging", or "add observability"

## Checklist
- [ ] Counter metric incremented on each operation
- [ ] Histogram observed with duration on success
- [ ] Structured log on entry and completion
- [ ] `error` log + Sentry capture on exceptions
- [ ] All metric label names match `observability-conventions.mdc`

## Step 1 — Inject MetricsService

```typescript
constructor(
  private readonly metrics: MetricsService,
  // ... other deps
) {}
```

Import `MetricsModule` in your feature module.

## Step 2 — Counter + Histogram

```typescript
private async handleOperation(dto: MyDto) {
  const startTime = Date.now();

  try {
    const result = await this.doWork(dto);
    const duration = Date.now() - startTime;

    this.metrics.scenarioRunsTotal.inc({ type: dto.type, status: 'completed' });
    this.metrics.scenarioRunDuration.observe({ type: dto.type }, duration / 1000);

    this.logger.log({
      message: 'Operation completed',
      operationType: dto.type,
      operationId: result.id,
      duration,
    });

    return result;
  } catch (e) {
    this.metrics.scenarioRunsTotal.inc({ type: dto.type, status: 'error' });
    this.logger.error({ message: 'Operation failed', err: e, operationType: dto.type });
    throw e;  // GlobalExceptionFilter captures to Sentry
  }
}
```

## Step 3 — Add Custom Metrics (if needed)

Add new metrics in `MetricsService` constructor:

```typescript
this.myOperationTotal = new client.Counter({
  name: 'my_operation_total',
  help: 'Description',
  labelNames: ['type', 'status'],
  registers: [this.registry],
});
```

**Naming rules:** `snake_case`, counters end in `_total`, histograms end in `_seconds`.

## Step 4 — Verify

```bash
curl localhost:3001/api/metrics | grep my_operation
```

Check Grafana → Explore → Prometheus for the new metric.
Check Grafana → Explore → Loki for `{app="signal-lab"}`.
