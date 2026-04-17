"use client";

import { useQuery } from "@tanstack/react-query";
import { History, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { scenariosApi, type ScenarioRun } from "@/lib/api";

function getStatusVariant(status: string) {
  switch (status) {
    case "completed": return "success";
    case "error": return "destructive";
    case "teapot": return "warning";
    default: return "secondary";
  }
}

function getTypeLabel(type: string) {
  const labels: Record<string, string> = {
    success: "Success",
    validation_error: "Validation",
    system_error: "System Error",
    slow_request: "Slow",
    teapot: "🫖 Teapot",
  };
  return labels[type] ?? type;
}

function formatDuration(ms: number | null) {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function RunHistory() {
  const { data: runs, isLoading, isFetching } = useQuery<ScenarioRun[]>({
    queryKey: ["scenario-runs"],
    queryFn: () => scenariosApi.getRecent(20),
    refetchInterval: 5000,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Run History
          {isFetching && <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />}
        </CardTitle>
        <CardDescription>Last 20 scenario runs · auto-refresh every 5s</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 rounded-md bg-muted animate-pulse" />
            ))}
          </div>
        ) : !runs?.length ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No runs yet. Trigger a scenario above.
          </p>
        ) : (
          <div className="space-y-2">
            {runs.map((run) => (
              <div
                key={run.id}
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Badge variant={getStatusVariant(run.status) as never}>
                    {run.status}
                  </Badge>
                  <span className="font-medium truncate">{getTypeLabel(run.type)}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground shrink-0">
                  <span>{formatDuration(run.duration)}</span>
                  <span className="text-xs">{formatTime(run.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
