# /health-check

Verify the Signal Lab docker stack is running correctly end-to-end.

## Usage
```
/health-check
```

## What this command does

Run through each verification step using shell commands. Report status for each service.

## Steps

### 1. Docker containers
```bash
docker compose ps
```
Expected: all services `Up` or `running` — postgres, backend, frontend, prometheus, loki, promtail, grafana

### 2. Backend API health
```bash
curl -s http://localhost:3001/api/health | jq .
```
Expected: `{ "status": "ok", "timestamp": "..." }`

### 3. Prometheus metrics
```bash
curl -s http://localhost:3001/api/metrics | grep scenario_runs_total
```
Expected: metric line present

### 4. Prometheus scraping backend
```bash
curl -s http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | {job: .labels.job, health: .health}'
```
Expected: `signal-lab-backend` with `health: "up"`

### 5. Grafana dashboard
```bash
curl -s -u admin:admin http://localhost:3100/api/dashboards/uid/signal-lab | jq .dashboard.title
```
Expected: `"Signal Lab Overview"`

### 6. Loki reachable
```bash
curl -s http://localhost:3200/ready
```
Expected: `ready`

### 7. Frontend
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```
Expected: `200`

## Report format

```
Service         Status    Notes
─────────────── ───────── ─────────────────
PostgreSQL      ✓ Up
Backend API     ✓ Up      /api/health OK
Frontend        ✓ Up      HTTP 200
Prometheus      ✓ Up      scraping backend
Loki            ✓ Up
Grafana         ✓ Up      dashboard loaded
```

If any check fails, provide the diagnostic command output and suggest fix.
