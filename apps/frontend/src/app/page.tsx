import { FlaskConical } from "lucide-react";
import { ScenarioRunner } from "@/components/scenarios/ScenarioRunner";
import { RunHistory } from "@/components/scenarios/RunHistory";
import { ObsLinks } from "@/components/scenarios/ObsLinks";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground">
              <FlaskConical className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Signal Lab</h1>
              <p className="text-xs text-muted-foreground">
                Observability playground
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Run scenarios to generate metrics, logs, and errors. Watch signals appear in Grafana, Loki, and Sentry.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <ScenarioRunner />
            <ObsLinks />
          </div>
          <div className="lg:col-span-2">
            <RunHistory />
          </div>
        </div>
      </main>
    </div>
  );
}
