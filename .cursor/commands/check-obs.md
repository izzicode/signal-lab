# /check-obs

Review the observability readiness of a file or module. Identify missing metrics, logs, or Sentry captures.

## Usage
```
/check-obs [file or directory path]
```

Example: `/check-obs apps/backend/src/scenarios/scenarios.service.ts`

## What this command does

1. Read the target file(s)
2. Read `.cursor/rules/observability-conventions.mdc` for expected patterns
3. Check for each item in the checklist below
4. Report findings as a table: ✓ present / ✗ missing / ⚠ partial
5. For each missing item, provide a concrete code snippet to fix it

## Checklist

### Metrics
- [ ] Counter incremented on each operation path (success + error)
- [ ] Histogram observed with duration in seconds
- [ ] Labels include `type` and `status`
- [ ] Metric names follow `snake_case_total` / `snake_case_seconds` convention

### Logging
- [ ] `this.logger = new Logger(ClassName.name)` initialized
- [ ] Structured log object (not string) on completion: `{ message, scenarioType, scenarioId, duration }`
- [ ] `warn()` for degraded paths (slow, validation)
- [ ] `error()` with `{ err: e }` on failures

### Sentry
- [ ] `Sentry.captureException(e)` called on 5xx errors
- [ ] OR: error propagated to `GlobalExceptionFilter` which handles capture
- [ ] `Sentry.addBreadcrumb()` on significant warning paths

## Output format

```
File: apps/backend/src/scenarios/scenarios.service.ts

Metrics:    ✓ counter  ✓ histogram  ✓ labels
Logging:    ✓ info     ✓ warn       ✓ error
Sentry:     ✓ captured via GlobalExceptionFilter

Overall: READY ✓
```
