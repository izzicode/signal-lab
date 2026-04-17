"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { scenariosApi } from "@/lib/api";

interface ObsLink {
  label: string;
  url: string;
  description: string;
}

const OBS_LINKS: ObsLink[] = [
  {
    label: "Grafana Dashboard",
    url: "http://localhost:3100/d/signal-lab/signal-lab-overview",
    description: "Metrics, latency, error rates",
  },
  {
    label: "Loki Logs",
    url: 'http://localhost:3100/explore?orgId=1&left={"datasource":"loki","queries":[{"expr":"{app=\\"signal-lab\\"}"}]}',
    description: 'Query: {app="signal-lab"}',
  },
  {
    label: "Prometheus",
    url: "http://localhost:9090/graph?g0.expr=scenario_runs_total",
    description: "scenario_runs_total metric",
  },
  {
    label: "Sentry",
    url: "https://sentry.io",
    description: "Exception tracking",
  },
  {
    label: "API Docs (Swagger)",
    url: "http://localhost:3001/api/docs",
    description: "Interactive API reference",
  },
  {
    label: "Raw Metrics",
    url: "http://localhost:3001/api/metrics",
    description: "Prometheus exposition format",
  },
];

export function ObsLinks() {
  const { data: health, isSuccess } = useQuery({
    queryKey: ["health"],
    queryFn: scenariosApi.getHealth,
    refetchInterval: 10000,
    retry: false,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Observability
        </CardTitle>
        <CardDescription>
          API status & links to dashboards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
          {isSuccess ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <span className="font-medium">API</span>
          <span className="text-muted-foreground">
            {isSuccess ? `OK · ${health?.timestamp?.slice(11, 19)}` : "Connecting..."}
          </span>
        </div>

        <div className="grid gap-2">
          {OBS_LINKS.map((link) => (
            <Button
              key={link.url}
              variant="outline"
              size="sm"
              className="w-full justify-between text-left h-auto py-2"
              asChild
            >
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                <div>
                  <div className="font-medium text-xs">{link.label}</div>
                  <div className="text-xs text-muted-foreground">{link.description}</div>
                </div>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
